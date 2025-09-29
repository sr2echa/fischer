"""
FastAPI application entry point.

Initializes the API server and ensures Firebase Admin is initialized on startup.
Provides a simple `/ping` health check.
"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import json
import uuid
from datetime import datetime

# Importing initializes Firebase (see module for details)
from firebase_config import db, bucket  # noqa: F401

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)

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


# Below is the existing applications endpoint that uploads files to Firebase.
# It remains available alongside the new `/ping` health route.
@app.post("/applications")
async def create_application(
    data: str = Form(...),
    pitch_deck: Optional[UploadFile] = File(None),
    pitch_media: Optional[UploadFile] = File(None),
    founders_checklist: Optional[UploadFile] = File(None),
    other_pdfs: Optional[List[UploadFile]] = File(None),
):
    try:
        parsed = json.loads(data)

        # Basic validation
        required_fields = ["company_name", "primary_business_model", "current_stage"]
        for field in required_fields:
            if not parsed.get(field):
                return JSONResponse({"error": f"Missing required field: {field}"}, status_code=400)

        application_id = str(uuid.uuid4())
        base_path = f"applications/{application_id}"

        documents_meta = []

        async def _upload_optional_file(field_name: str, f: Optional[UploadFile]):
            if not f:
                return
            blob_path = f"{base_path}/{field_name}-{f.filename}"
            storage_blob = bucket.blob(blob_path)
            # Read the entire upload into memory; for very large files a streamed approach is preferable
            file_bytes = await f.read()
            storage_blob.upload_from_string(file_bytes, content_type=f.content_type or "application/octet-stream")
            documents_meta.append({
                "field": field_name,
                "filename": f.filename,
                "content_type": f.content_type,
                "storage_path": blob_path,
            })

        await _upload_optional_file("pitch_deck", pitch_deck)
        await _upload_optional_file("pitch_media", pitch_media)
        await _upload_optional_file("founders_checklist", founders_checklist)
        if other_pdfs:
            for idx, f in enumerate(other_pdfs):
                await _upload_optional_file(f"other_pdfs-{idx}", f)

        doc_data = {
            **parsed,
            "submitted_at": datetime.utcnow().isoformat() + "Z",
            "documents": documents_meta,
        }

        db.collection("applications").document(application_id).set(doc_data)

        return JSONResponse({
            "success": True,
            "id": application_id,
            "message": "Application submitted successfully",
        }, status_code=201)
    except Exception as e:
        return JSONResponse({"error": "Internal server error", "details": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)