import os
import uuid
from typing import Optional, Tuple
import json
import csv
from fastapi import HTTPException, status
from google.cloud import storage


SUPPORTED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def _content_type_for_extension(file_ext: str) -> str:
    content_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }
    return content_types.get(file_ext, "application/octet-stream")


def validate_image_filename(filename: Optional[str]) -> str:
    if not filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image filename is required",
        )

    file_ext = os.path.splitext(filename)[1].lower()
    if file_ext not in SUPPORTED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Supported: jpg, jpeg, png, webp",
        )

    return file_ext


def upload_image_bytes(image_bytes: bytes, file_ext: str) -> Tuple[str, str]:
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    if not bucket_name:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GCS bucket is not configured. Set GCS_BUCKET_NAME.",
        )

    bucket_folder = os.getenv("GCS_BUCKET_FOLDER_DISEASE", "disease_uploads").strip("/")
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    object_name = f"{bucket_folder}/{unique_filename}" if bucket_folder else unique_filename

    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(object_name)
        blob.upload_from_string(
            image_bytes,
            content_type=_content_type_for_extension(file_ext),
        )

        image_url = f"https://storage.googleapis.com/{bucket_name}/{object_name}"

        return image_url, object_name
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image, try again",
        ) from exc




def read_json_from_gcs(bucket_name: str, object_name: str) -> dict:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(object_name)
    data = blob.download_as_text(encoding="utf-8")
    return json.loads(data)

def read_csv_from_gcs(bucket_name: str, object_name: str) -> list:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(object_name)
    data = blob.download_as_text(encoding="utf-8")
    reader = csv.DictReader(io.StringIO(data))
    return list(reader)