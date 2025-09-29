## Firebase configuration

Set these environment variables before running the server:

```
export FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
# Either provide Application Default Credentials or inline credentials JSON
# export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
# or
# export FIREBASE_CREDENTIALS_JSON='{"type":"service_account", ... }'
```

The POST /applications endpoint accepts multipart form data with fields:
- `data`: JSON string containing the application metadata
- `pitch_deck`: optional PDF
- `pitch_media`: optional MP4/MP3/MOV
- `founders_checklist`: optional PDF/DOCX
- `other_pdfs`: optional multiple PDF files

