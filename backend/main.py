"""
FastAPI application entry point.

Initializes the API server and ensures Firebase Admin is initialized on startup.
Provides a simple `/ping` health check.
"""

from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Union
import json
import uuid
import os
import aiofiles
from datetime import datetime
from pathlib import Path
import tempfile
import base64
import asyncio
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Importing initializes Firebase (see module for details)
from firebase_config import db  # noqa: F401
from ai_analysis_service import AIAnalysisService
from web_enrichment import enrich_company_context
from rag_service import RAGService

# ---------------- Utility: Non-blocking Firestore helpers ---------------- #

async def _firestore_set(collection: str, doc_id: str, data: dict, timeout: float = 10.0):
    """Run Firestore set in a thread to avoid blocking the event loop.

    Args:
        collection: Firestore collection name
        doc_id: Document ID
        data: Data to set
        timeout: Seconds before timing out
    """
    try:
        await asyncio.wait_for(
            asyncio.to_thread(lambda: db.collection(collection).document(doc_id).set(data)),
            timeout=timeout
        )
    except asyncio.TimeoutError:
        raise RuntimeError("Firestore set operation timed out")


async def _firestore_update(collection: str, doc_id: str, data: dict, timeout: float = 10.0):
    """Run Firestore update in a thread."""
    try:
        await asyncio.wait_for(
            asyncio.to_thread(lambda: db.collection(collection).document(doc_id).update(data)),
            timeout=timeout
        )
    except asyncio.TimeoutError:
        raise RuntimeError("Firestore update operation timed out")


async def _firestore_get(collection: str, doc_id: str, timeout: float = 10.0):
    """Run Firestore get in a thread and return snapshot."""
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(lambda: db.collection(collection).document(doc_id).get()),
            timeout=timeout
        )
    except asyncio.TimeoutError:
        raise RuntimeError("Firestore get operation timed out")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

# Initialize AI Analysis Service
ai_service = None
rag_service = None
try:
    ai_service = AIAnalysisService()
    print("✅ AI Analysis Service initialized successfully")
except Exception as e:
    print(f"⚠️ Warning: AI Analysis Service failed to initialize: {e}")
    print("AI features will be disabled")
try:
    rag_service = RAGService()
    print("✅ RAG Service initialized successfully")
except Exception as e:
    print(f"⚠️ Warning: RAG Service failed to initialize: {e}")


@app.get("/", response_class=HTMLResponse)
async def root():
    html_content = """
    <html>
        <head>
            <title>Fischer</title>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-direction: column;
                    height: 100vh;
                    margin: 0;
                    background-color: #010101;
                    color: white;
                    font-family: Arial, sans-serif;
                }
                h1 {
                    font-size: 3em;
                    margin: 0;
                }
                p {
                    font-size: 2em;
                    margin: 10px 0;
                }
            </style>
        </head>
        <body>
            <h1>Fischer AI</h1>
            <p>AI Analyst for Startup Evaluvation</p>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@app.get("/ping")
async def ping():
    """Simple health check endpoint."""
    return {"status": "ok"}


async def process_pdf_extraction(application_id: str, documents_meta: list):
    """
    Background task to process PDF extraction and update Firestore.
    
    Args:
        application_id: The application ID in Firestore
        documents_meta: List of document metadata with base64 content
    """
    try:
        from document_ingestion import DocumentIngestion
        
        # Initialize document ingestion
        ingestion = DocumentIngestion()
        
        # Update status to processing
        try:
            await _firestore_update("applications", application_id, {
                "processing_status": "processing",
                "processing_started_at": datetime.utcnow().isoformat() + "Z"
            })
        except Exception as e:  # If status update fails, continue but log
            print(f"⚠️ Failed to mark processing start for {application_id}: {e}")
        
        extracted_documents = []
        
        # Process each PDF document with timeout
        for doc_meta in documents_meta:
            try:
                # Only process PDF files
                if doc_meta.get("content_type") != "application/pdf":
                    extracted_documents.append({
                        **doc_meta,
                        "extracted_content": None,
                        "extraction_status": "skipped",
                        "extraction_message": "Not a PDF file"
                    })
                    continue
                
                # Decide source: inline base64 vs local file path
                temp_file_path = None
                delete_after = True
                if doc_meta.get("storage") == "local_file" and doc_meta.get("local_path"):
                    # Use existing local path (persisted)
                    temp_file_path = doc_meta["local_path"]
                    delete_after = False  # don't delete persisted file
                else:
                    # Decode base64 to bytes
                    if "base64_content" not in doc_meta:
                        raise KeyError("base64_content")
                    file_bytes = base64.b64decode(doc_meta["base64_content"])
                    # Create temporary file for processing
                    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                        temp_file.write(file_bytes)
                        temp_file_path = temp_file.name
                        delete_after = True
                
                try:
                    # Process the document with timeout (5 minutes)
                    result = await asyncio.wait_for(
                        asyncio.to_thread(
                            ingestion.ingest_document,
                            temp_file_path,
                            save_output=False
                        ),
                        timeout=300  # 5 minutes
                    )
                    
                    if result["success"]:
                        markdown_content = result["content"]
                        markdown_local_path = None
                        try:
                            # Persist markdown alongside original (or temp) file
                            app_dir = Path("uploads") / "applications" / application_id
                            app_dir.mkdir(parents=True, exist_ok=True)
                            # Derive stem from original filename if available
                            original_name = doc_meta.get("filename") or Path(temp_file_path).name
                            stem = Path(original_name).stem
                            md_path = app_dir / f"{stem}_extracted.md"
                            md_path.write_text(markdown_content, encoding="utf-8")
                            markdown_local_path = str(md_path)
                        except Exception as write_md_err:
                            print(f"⚠️ Failed to write markdown file for {application_id}: {write_md_err}")

                        extracted_documents.append({
                            **doc_meta,
                            "extracted_content": markdown_content,
                            "extraction_status": "success",
                            "extraction_metadata": result["metadata"],
                            "markdown_local_path": markdown_local_path
                        })
                    else:
                        extracted_documents.append({
                            **doc_meta,
                            "extracted_content": None,
                            "extraction_status": "failed",
                            "extraction_error": result["error"]
                        })
                
                except asyncio.TimeoutError:
                    extracted_documents.append({
                        **doc_meta,
                        "extracted_content": None,
                        "extraction_status": "timeout",
                        "extraction_error": "PDF processing timed out after 5 minutes"
                    })
                
                finally:
                    # Clean up temp file if it was a transient file
                    if delete_after and temp_file_path:
                        try:
                            os.unlink(temp_file_path)
                        except Exception:
                            pass
                        
            except Exception as e:
                extracted_documents.append({
                    **doc_meta,
                    "extracted_content": None,
                    "extraction_status": "error",
                    "extraction_error": str(e)
                })
        
        # Update Firestore with extracted content
        try:
            await _firestore_update("applications", application_id, {
                "documents": extracted_documents,
                "processing_status": "completed",
                "processing_completed_at": datetime.utcnow().isoformat() + "Z"
            })
        except Exception as e:
            print(f"⚠️ Failed to mark processing complete for {application_id}: {e}")
        
        print(f"✅ Background processing completed for application {application_id}")
        
    except Exception as e:
        # Update status to failed
        try:
            await _firestore_update("applications", application_id, {
                "processing_status": "failed",
                "processing_error": str(e),
                "processing_failed_at": datetime.utcnow().isoformat() + "Z"
            })
        except Exception as inner:
            print(f"❌ Failed to mark processing failure for {application_id}: {inner}")
        print(f"❌ Background processing failed for application {application_id}: {str(e)}")


async def file_to_base64(file: UploadFile) -> dict:
    """
    Convert an uploaded file to base64 string.
    
    Args:
        file: FastAPI UploadFile object
        
    Returns:
        Dictionary with file metadata and base64 content
    """
    content = await file.read()
    base64_content = base64.b64encode(content).decode('utf-8')
    
    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "base64_content": base64_content,
        "size_bytes": len(content)
    }


@app.post("/convert-pdf-to-markdown")
async def convert_pdf_to_markdown(
    pdf_file: UploadFile = File(...)
):
    """
    Convert a PDF file to Markdown using Google's Gemini AI.
    
    Args:
        pdf_file: The PDF file to convert
    
    Returns:
        JSON response with the converted Markdown content
    """
    try:
        # Check if the uploaded file is a PDF
        if pdf_file.content_type != "application/pdf":
            return JSONResponse(
                {"error": "Invalid file type. Please upload a PDF file."},
                status_code=400
            )
        
        # Create a temporary file to save the uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            content = await pdf_file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Use the document_ingestion module
            from document_ingestion import DocumentIngestion
            
            # Initialize ingestion (will use API key from environment)
            ingestion = DocumentIngestion()
            
            # Process the document
            result = ingestion.ingest_document(
                temp_file_path,
                save_output=False
            )
            
            if result["success"]:
                return JSONResponse({
                    "success": True,
                    "filename": pdf_file.filename,
                    "markdown": result["content"],
                    "metadata": result["metadata"],
                    "message": "PDF successfully converted to Markdown"
                })
            else:
                return JSONResponse(
                    {"error": result["error"]},
                    status_code=500
                )
            
        finally:
            # Clean up the temporary file
            try:
                os.unlink(temp_file_path)
            except Exception:
                pass  # If cleanup fails, it's not critical
        
    except Exception as e:
        return JSONResponse(
            {"error": "Failed to convert PDF to Markdown", "details": str(e)},
            status_code=500
        )


# Below is the existing applications endpoint that uploads files to Firebase.
# It remains available alongside the new `/ping` health route.
@app.post("/applications")
async def create_application(
    background_tasks: BackgroundTasks,
    data: str = Form(...),
    pitch_deck: Union[UploadFile, str] = File(None),
    pitch_media: Union[UploadFile, str] = File(None),
    founders_checklist: Union[UploadFile, str] = File(None),
    other_pdfs: Union[List[UploadFile], List[str], str] = File(None),
):
    """
    Create a new application with file uploads.
    
    Files are stored as base64 strings in Firestore.
    PDF extraction happens in the background and updates the document when complete.
    """
    try:
        parsed = json.loads(data)

        # Basic validation
        required_fields = ["company_name", "primary_business_model", "current_stage"]
        for field in required_fields:
            if not parsed.get(field):
                return JSONResponse({"error": f"Missing required field: {field}"}, status_code=400)

        application_id = str(uuid.uuid4())

        documents_meta = []

        # Firestore document size limit is 1 MiB. We store base64 (≈1.33x expansion).
        # We'll cap individual base64 payloads to prevent timeouts / failures.
        MAX_BASE64_BYTES_PER_FILE = 700_000  # ~0.7MB raw base64 (safe margin)
        total_base64_bytes = 0

        async def _process_file(field_name: str, f: Union[UploadFile, str]):
            """Process a single file upload and convert to base64 (size-guarded)."""
            nonlocal total_base64_bytes
            if not f or isinstance(f, str) or not hasattr(f, 'filename') or not f.filename:
                return

            file_data = await file_to_base64(f)
            b64_len = len(file_data["base64_content"])

            # Enforce per-file and cumulative size limits to avoid Firestore write timeouts
            if b64_len > MAX_BASE64_BYTES_PER_FILE:
                # Save file bytes locally under uploads/applications/<id>/
                app_dir = Path("uploads") / "applications" / application_id
                app_dir.mkdir(parents=True, exist_ok=True)
                safe_name = file_data["filename"].replace("/", "_")
                local_path = app_dir / safe_name
                try:
                    # Decode base64 back to bytes (we already have original bytes via read)
                    raw_bytes = base64.b64decode(file_data["base64_content"]) if file_data.get("base64_content") else b""
                    local_path.write_bytes(raw_bytes)
                except Exception as write_err:
                    documents_meta.append({
                        "field": field_name,
                        "filename": file_data["filename"],
                        "content_type": file_data["content_type"],
                        "size_bytes": file_data["size_bytes"],
                        "extraction_status": "skipped",
                        "skipped_reason": f"local_save_failed:{write_err}"})
                    return

                documents_meta.append({
                    "field": field_name,
                    "filename": file_data["filename"],
                    "content_type": file_data["content_type"],
                    "size_bytes": file_data["size_bytes"],
                    "storage": "local_file",
                    "local_path": str(local_path),
                    "extraction_status": "pending",
                    "note": "Stored locally due to size; will be processed in background"
                })
                return

            if total_base64_bytes + b64_len > MAX_BASE64_BYTES_PER_FILE * 1.3:  # small global cap
                # Same treatment: store remaining large files locally
                app_dir = Path("uploads") / "applications" / application_id
                app_dir.mkdir(parents=True, exist_ok=True)
                safe_name = file_data["filename"].replace("/", "_")
                local_path = app_dir / safe_name
                try:
                    raw_bytes = base64.b64decode(file_data["base64_content"]) if file_data.get("base64_content") else b""
                    local_path.write_bytes(raw_bytes)
                except Exception as write_err:
                    documents_meta.append({
                        "field": field_name,
                        "filename": file_data["filename"],
                        "content_type": file_data["content_type"],
                        "size_bytes": file_data["size_bytes"],
                        "extraction_status": "skipped",
                        "skipped_reason": f"local_save_failed:{write_err}"})
                    return
                documents_meta.append({
                    "field": field_name,
                    "filename": file_data["filename"],
                    "content_type": file_data["content_type"],
                    "size_bytes": file_data["size_bytes"],
                    "storage": "local_file",
                    "local_path": str(local_path),
                    "extraction_status": "pending",
                    "note": "Stored locally due to cumulative payload limit"
                })
                return

            total_base64_bytes += b64_len
            documents_meta.append({
                "field": field_name,
                **file_data,
                "storage": "inline_base64"
            })

        # Process all files and convert to base64
        await _process_file("pitch_deck", pitch_deck)
        await _process_file("pitch_media", pitch_media)
        await _process_file("founders_checklist", founders_checklist)

        # Process other_pdfs - handle various input types
        if other_pdfs:
            if isinstance(other_pdfs, str):
                pass  # skip plain string
            elif isinstance(other_pdfs, list):
                for idx, f in enumerate(other_pdfs):
                    if not isinstance(f, str) and hasattr(f, 'filename') and f.filename:
                        await _process_file(f"other_pdfs-{idx}", f)

        # Prepare document data for Firestore
        doc_data = {
            **parsed,
            "submitted_at": datetime.utcnow().isoformat() + "Z",
            "documents": documents_meta,
            "processing_status": "pending",  # Initial status
        }

        # Firestore write (off main event loop)
        await _firestore_set("applications", application_id, doc_data)

        # Schedule background PDF extraction (don't wait for it)
        try:
            background_tasks.add_task(process_pdf_extraction, application_id, documents_meta)
        except Exception as task_error:
            print(f"⚠️ Warning: Failed to schedule background task: {task_error}")
            try:
                await _firestore_update("applications", application_id, {
                    "processing_status": "failed",
                    "processing_error": f"Failed to schedule background processing: {str(task_error)}",
                    "processing_failed_at": datetime.utcnow().isoformat() + "Z"
                })
            except Exception:
                pass

        return JSONResponse({
            "success": True,
            "id": application_id,
            "message": "Application submitted successfully. PDF extraction is being processed in the background.",
            "processing_status": "pending",
            "note": "Use GET /applications/{id}/status to check processing status"
        }, status_code=201)
        
    except Exception as e:
        # Surface clearer error for debugging timeouts
        return JSONResponse({
            "error": "Internal server error",
            "details": str(e),
            "hint": "Check Firestore credentials and ensure service account / ADC is configured. Large PDFs are skipped to avoid document size limit."
        }, status_code=500)


@app.get("/applications/{application_id}/status")
async def get_application_status(application_id: str):
    """
    Get the processing status of an application.
    
    Args:
        application_id: The application ID
        
    Returns:
        JSON with processing status and details
    """
    try:
        doc = await _firestore_get("applications", application_id)

        if not doc.exists:
            return JSONResponse({"error": "Application not found"}, status_code=404)

        data = doc.to_dict()

        return JSONResponse({
            "success": True,
            "id": application_id,
            "processing_status": data.get("processing_status", "unknown"),
            "submitted_at": data.get("submitted_at"),
            "processing_started_at": data.get("processing_started_at"),
            "processing_completed_at": data.get("processing_completed_at"),
            "processing_failed_at": data.get("processing_failed_at"),
            "processing_error": data.get("processing_error"),
            "documents_count": len(data.get("documents", [])),
            "company_name": data.get("company_name")
        })
    except Exception as e:
        return JSONResponse({
            "error": "Failed to get application status",
            "details": str(e)
        }, status_code=500)


@app.post("/applications/{application_id}/analyze")
async def analyze_application(application_id: str):
    """
    Perform AI analysis on an application.
    
    Args:
        application_id: The application ID to analyze
        
    Returns:
        JSON with AI analysis results
    """
    if not ai_service:
        return JSONResponse({
            "error": "AI Analysis Service not available",
            "details": "GEMINI_API_KEY not configured or service failed to initialize"
        }, status_code=503)
    
    try:
        # Get application data from Firestore
        doc = await _firestore_get("applications", application_id)
        
        if not doc.exists:
            return JSONResponse({"error": "Application not found"}, status_code=404)
        
        data = doc.to_dict()
        
        # Check if processing is complete
        if data.get("processing_status") != "completed":
            return JSONResponse({
                "error": "Application processing not complete",
                "processing_status": data.get("processing_status", "unknown")
            }, status_code=400)
        
        # Prepare documents for analysis
        documents = []
        for doc_meta in data.get("documents", []):
            if doc_meta.get("extracted_content"):
                documents.append({
                    "field": doc_meta.get("field"),
                    "filename": doc_meta.get("filename"),
                    "extracted_content": doc_meta.get("extracted_content"),
                    "content_type": doc_meta.get("content_type")
                })
        
        # Run AI analysis
        analysis = await ai_service.analyze_startup(data, documents)
        
        # Store analysis results in Firestore
        analysis_data = {
            "ai_score": analysis.ai_score,
            "risk_level": analysis.risk_level,
            "key_insights": analysis.key_insights,
            "red_flags": analysis.red_flags,
            "sector_benchmarks": analysis.sector_benchmarks,
            "recommendations": analysis.recommendations,
            "confidence_score": analysis.confidence_score,
            "curation_framework": {
                "founders_team": analysis.curation_framework.founders_team,
                "market_problem": analysis.curation_framework.market_problem,
                "differentiation": analysis.curation_framework.differentiation,
                "business_traction": analysis.curation_framework.business_traction
            },
            "analysis_completed_at": datetime.utcnow().isoformat() + "Z",
            "processing_time": analysis.processing_time
        }
        
        await _firestore_update("applications", application_id, analysis_data)
        
        return JSONResponse({
            "success": True,
            "application_id": application_id,
            "analysis": analysis_data
        })
        
    except Exception as e:
        return JSONResponse({
            "error": "AI analysis failed",
            "details": str(e)
        }, status_code=500)


@app.post("/applications/{application_id}/chat")
async def chat_with_application(application_id: str, request_data: dict):
    """
    Chat with AI about a specific application.
    
    Args:
        application_id: The application ID
        request_data: {"question": "user question"}
        
    Returns:
        JSON with AI response
    """
    if not ai_service:
        return JSONResponse({
            "error": "AI Analysis Service not available",
            "details": "GEMINI_API_KEY not configured or service failed to initialize"
        }, status_code=503)
    
    try:
        question = request_data.get("question", "")
        if not question.strip():
            return JSONResponse({"error": "Question is required"}, status_code=400)
        
        # Get application data from Firestore
        doc = await _firestore_get("applications", application_id)
        
        if not doc.exists:
            return JSONResponse({"error": "Application not found"}, status_code=404)
        
        data = doc.to_dict()
        
        # Prepare documents for chat
        documents = []
        for doc_meta in data.get("documents", []):
            if doc_meta.get("extracted_content"):
                documents.append({
                    "field": doc_meta.get("field"),
                    "filename": doc_meta.get("filename"),
                    "extracted_content": doc_meta.get("extracted_content"),
                    "content_type": doc_meta.get("content_type")
                })
        
        # Retrieve RAG contexts if available
        rag_contexts = []
        try:
            if rag_service:
                rag_contexts = rag_service.retrieve(application_id, question, k=5)
        except Exception as _:
            rag_contexts = []

        # Get AI response
        ai_response = await ai_service.chat_with_ai(question, data, documents, rag_contexts)
        
        return JSONResponse({
            "success": True,
            "application_id": application_id,
            "question": question,
            "response": ai_response,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        })
        
    except Exception as e:
        return JSONResponse({
            "error": "Chat failed",
            "details": str(e)
        }, status_code=500)


@app.post("/applications/{application_id}/enrich")
async def enrich_application(application_id: str):
    """Web-enrich application context and build a RAG index."""
    if not rag_service:
        return JSONResponse({
            "error": "RAG Service not available",
            "details": "GEMINI_API_KEY not configured or service failed to initialize"
        }, status_code=503)

    try:
        # Load application
        doc = await _firestore_get("applications", application_id)
        if not doc.exists:
            return JSONResponse({"error": "Application not found"}, status_code=404)
        data = doc.to_dict()

        company = data.get("company_name") or ""
        website = data.get("company_website") or None
        if not company:
            return JSONResponse({"error": "company_name missing"}, status_code=400)

        # Crawl/search
        chunks = await enrich_company_context(company, website)

        # Persist simple stats on application document
        await _firestore_update("applications", application_id, {
            "enrichment": {
                "sources_count": len({c.get("url") for c in chunks}),
                "chunks_count": len(chunks),
                "enriched_at": datetime.utcnow().isoformat() + "Z",
            }
        })

        # Build RAG index
        rag_service.build_index(application_id, chunks)

        return JSONResponse({
            "success": True,
            "application_id": application_id,
            "sources_count": len({c.get("url") for c in chunks}),
            "chunks_count": len(chunks)
        })
    except Exception as e:
        return JSONResponse({
            "error": "Enrichment failed",
            "details": str(e)
        }, status_code=500)


@app.get("/applications/{application_id}")
async def get_application(application_id: str):
    """
    Get complete application data including AI analysis.
    
    Args:
        application_id: The application ID
        
    Returns:
        JSON with complete application data
    """
    try:
        doc = await _firestore_get("applications", application_id)
        
        if not doc.exists:
            return JSONResponse({"error": "Application not found"}, status_code=404)
        
        data = doc.to_dict()
        
        return JSONResponse({
            "success": True,
            "application": data
        })
        
    except Exception as e:
        return JSONResponse({
            "error": "Failed to get application",
            "details": str(e)
        }, status_code=500)


@app.get("/applications")
async def list_applications(limit: int = 10, offset: int = 0):
    """
    List all applications with optional pagination.
    
    Args:
        limit: Maximum number of applications to return
        offset: Number of applications to skip
        
    Returns:
        JSON with list of applications
    """
    try:
        # Get applications from Firestore
        from google.cloud.firestore import Query
        query = db.collection("applications").order_by("submitted_at", direction=Query.DESCENDING)
        
        # Apply pagination
        if offset > 0:
            query = query.offset(offset)
        if limit > 0:
            query = query.limit(limit)
        
        docs = query.stream()
        applications = []
        
        for doc in docs:
            app_data = doc.to_dict()
            app_data["id"] = doc.id
            applications.append(app_data)
        
        return JSONResponse({
            "success": True,
            "applications": applications,
            "total": len(applications),
            "limit": limit,
            "offset": offset
        })
        
    except Exception as e:
        return JSONResponse({
            "error": "Failed to list applications",
            "details": str(e)
        }, status_code=500)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)