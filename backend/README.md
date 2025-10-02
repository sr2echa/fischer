# Fischer Backend API

## Overview

Fischer is an AI-powered analyst for startup evaluation. This backend API handles application submissions with intelligent document processing.

## Key Features

- 🚀 **Instant Response**: Applications are submitted immediately without waiting for document processing
- 📄 **Background PDF Extraction**: PDFs are processed asynchronously using Google Gemini AI
- 💾 **Firestore Storage**: All files stored as base64 strings directly in Firestore (no Firebase Storage needed)
- 📊 **Status Tracking**: Real-time processing status with detailed metadata
- 🔍 **Markdown Extraction**: PDFs converted to clean, structured markdown

## Firebase Configuration

Set these environment variables before running the server:

```bash
export FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"

# Either provide Application Default Credentials or inline credentials JSON
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
# or
export FIREBASE_CREDENTIALS_JSON='{"type":"service_account", ... }'

# Required for PDF extraction
export GEMINI_API_KEY="your-google-ai-api-key"
```

## API Endpoints

### POST /applications

Submit a new application with file uploads.

**Request** (multipart/form-data):
- `data`: JSON string containing application metadata (required fields: `company_name`, `primary_business_model`, `current_stage`)
- `pitch_deck`: Optional PDF/video file
- `pitch_media`: Optional media file (MP4/MP3/MOV)
- `founders_checklist`: Optional PDF/DOCX file
- `other_pdfs`: Optional multiple PDF files

**Response**:
```json
{
  "success": true,
  "id": "uuid",
  "message": "Application submitted successfully. PDF extraction is being processed in the background.",
  "processing_status": "pending"
}
```

**Files are stored as base64 in Firestore** - no Firebase Storage used.

**Background processing**:
- PDFs are extracted to markdown using Google Gemini AI
- Extracted content is saved back to Firestore
- Processing happens asynchronously without blocking the response

### GET /applications/{application_id}/status

Check the processing status of an application.

**Response**:
```json
{
  "success": true,
  "id": "uuid",
  "processing_status": "completed|pending|processing|failed",
  "submitted_at": "2025-10-02T12:00:00Z",
  "processing_started_at": "2025-10-02T12:00:01Z",
  "processing_completed_at": "2025-10-02T12:00:30Z",
  "documents_count": 3,
  "company_name": "Example Corp"
}
```

### POST /convert-pdf-to-markdown

Convert a single PDF to markdown (standalone utility).

**Request**:
- `pdf_file`: PDF file to convert

**Response**:
```json
{
  "success": true,
  "filename": "document.pdf",
  "markdown": "# Extracted Content...",
  "metadata": {...}
}
```

### GET /ping

Health check endpoint.

**Response**:
```json
{
  "status": "ok"
}
```

## Installation

```bash
# Install dependencies using uv
uv sync

# Or using pip
pip install -r requirements.txt
```

## Running the Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Testing

Use the provided test script:

```bash
python test_application_api.py
```

Or manually test with curl:

```bash
# Submit application with files
curl -X POST http://localhost:8000/applications \
  -F 'data={"company_name":"Test Inc","primary_business_model":"SaaS","current_stage":"MVP"}' \
  -F 'pitch_deck=@test.pdf'

# Submit application without optional files (minimal)
curl -X POST http://localhost:8000/applications \
  -F 'data={"company_name":"Test Inc","primary_business_model":"SaaS","current_stage":"MVP"}'

# Check status
curl http://localhost:8000/applications/{application_id}/status
```

**Important**: When using curl, either include a file (`-F 'pitch_deck=@file.pdf'`) or omit the field entirely. Don't send empty form fields like `-F 'pitch_deck='`.

## Document Processing Flow

1. **Client submits application** → Immediate response with pending status
2. **Files stored as base64** → Saved directly to Firestore
3. **Background task processes PDFs** → Extracts markdown using Gemini AI
4. **Firestore updated** → Extracted content saved with status tracking
5. **Client polls status** → Can check when processing is complete

## Firestore Document Structure

```json
{
  "company_name": "Example Corp",
  "primary_business_model": "SaaS",
  "current_stage": "MVP",
  "submitted_at": "2025-10-02T12:00:00Z",
  "processing_status": "completed",
  "processing_started_at": "2025-10-02T12:00:01Z",
  "processing_completed_at": "2025-10-02T12:00:30Z",
  "documents": [
    {
      "field": "pitch_deck",
      "filename": "deck.pdf",
      "content_type": "application/pdf",
      "base64_content": "JVBERi0xLjQK...",
      "size_bytes": 1234567,
      "extracted_content": "# Extracted Markdown\n...",
      "extraction_status": "success",
      "extraction_metadata": {...}
    }
  ]
}
```

## Architecture

- **FastAPI**: Modern async web framework
- **Firebase Admin**: Firestore database access
- **Google Gemini AI**: PDF to markdown extraction
- **Background Tasks**: AsyncIO for non-blocking processing
- **Base64 Encoding**: File storage without Firebase Storage

## Documentation

See `IMPLEMENTATION_SUMMARY.md` for detailed technical documentation.

