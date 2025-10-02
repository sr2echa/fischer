"""
Firebase Admin initialization and clients.

This module initializes Firebase using a service account key assumed to be
located at the project root as `serviceAccountKey.json`. It exposes Firestore
(`db`) and Cloud Storage (`bucket`) clients for use throughout the backend.
"""

import os
import json
from pathlib import Path
from typing import Optional

import firebase_admin
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
from firebase_admin import credentials, firestore, storage


_initialized: bool = False
db: Optional[firestore.Client] = None
bucket: Optional[object] = None  # storage.Bucket type


def _project_root() -> Path:
    """Resolve the backend directory where the service account key is located."""
    return Path(__file__).resolve().parent


def initialize_firebase() -> None:
    """Initialize Firebase Admin SDK if not already initialized.

    Looks for service account key file specified in FIREBASE_SERVICE_ACCOUNT_KEY_FILE env var.
    If not found or not specified, will fallback to Application Default Credentials.
    """
    global _initialized, db, bucket
    if _initialized:
        return

    root = _project_root()
    
    # Get service account key filename from environment variable
    service_account_filename = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY_FILE")
    
    if service_account_filename:
        svc_path = root / service_account_filename
        if svc_path.exists():
            cred = credentials.Certificate(str(svc_path))
        else:
            # Fallback to ADC if the specified service account file is not present
            cred = credentials.ApplicationDefault()
    else:
        # Fallback to ADC if no service account file is specified
        cred = credentials.ApplicationDefault()

    # If you want to lock to a specific bucket, set FIREBASE_STORAGE_BUCKET env var
    options = {}
    bucket_name = os.environ.get("FIREBASE_STORAGE_BUCKET")
    if bucket_name:
        options["storageBucket"] = bucket_name

    firebase_admin.initialize_app(cred, options or None)

    # Expose Firestore and Storage clients
    db = firestore.client()
    bucket = storage.bucket(bucket_name) if bucket_name else storage.bucket()

    _initialized = True


# Initialize Firebase on import
initialize_firebase()


