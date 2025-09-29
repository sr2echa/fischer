import json
import os
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore, storage


_initialized: bool = False


def initialize_firebase_if_needed() -> None:
    global _initialized
    if _initialized:
        return

    # Prefer explicit credentials JSON provided via env
    creds_json = os.environ.get("FIREBASE_CREDENTIALS_JSON")
    cred: credentials.Base
    if creds_json:
        cred = credentials.Certificate(json.loads(creds_json))
    else:
        # Fallback: default credentials from GOOGLE_APPLICATION_CREDENTIALS or metadata
        cred = credentials.ApplicationDefault()

    app_options = {}
    bucket = os.environ.get("FIREBASE_STORAGE_BUCKET")
    if bucket:
        app_options["storageBucket"] = bucket

    firebase_admin.initialize_app(cred, app_options or None)
    _initialized = True


def get_firestore_client() -> firestore.Client:
    initialize_firebase_if_needed()
    return firestore.client()


def get_storage_bucket() -> storage.bucket.Bucket:
    initialize_firebase_if_needed()
    bucket_name = os.environ.get("FIREBASE_STORAGE_BUCKET")
    if bucket_name:
        return storage.bucket(bucket_name)
    return storage.bucket()  # default bucket from app options


