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
from firebase_admin import credentials, firestore, storage


_initialized: bool = False
db: Optional[firestore.Client] = None
bucket: Optional[object] = None  # storage.Bucket type


def _project_root() -> Path:
    """Resolve the backend directory where the service account key is located."""
    return Path(__file__).resolve().parent


def initialize_firebase() -> None:
    """Initialize Firebase Admin SDK if not already initialized.

    Prefers a `serviceAccountKey.json` file at the project root. If not found,
    will fallback to Application Default Credentials.
    """
    global _initialized, db, bucket
    if _initialized:
        return

    root = _project_root()
    svc_path = root / "fischer-3e391-firebase-adminsdk-fbsvc-8ae6e3cb30.json"

    if svc_path.exists():
        cred = credentials.Certificate(str(svc_path))
    else:
        # Fallback to ADC if the explicit service account file is not present
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


