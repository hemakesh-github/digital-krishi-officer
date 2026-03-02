from sentence_transformers import SentenceTransformer
from google.cloud import storage
import os

_model = None

BUCKET_NAME = os.getenv("GCS_BUCKET_NAME") 
BUCKET_MODEL_PATH = os.getenv("GCS_BUCKET_FOLDER_MODEL")+"/embeddings"
LOCAL_MODEL_PATH = "/tmp/embeddings"
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"


def _download_folder_from_bucket(bucket_path, local_folder):
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)

    blobs = bucket.list_blobs(prefix=bucket_path)
    for blob in blobs:
        relative_path = blob.name[len(bucket_path) + 1:]
        local_file = os.path.join(local_folder, relative_path)
        os.makedirs(os.path.dirname(local_file), exist_ok=True)
        blob.download_to_filename(local_file)


def _upload_folder_to_bucket(local_folder, bucket_path):
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)

    for root, _, files in os.walk(local_folder):
        for file in files:
            local_file = os.path.join(root, file)
            relative_path = os.path.relpath(local_file, local_folder)
            blob = bucket.blob(f"{bucket_path}/{relative_path}")
            blob.upload_from_filename(local_file)


def get_model():
    global _model

    # ✅ Already loaded in memory
    if _model is not None:
        return _model

    # ✅ If already downloaded in this instance
    if os.path.exists(LOCAL_MODEL_PATH):
        _model = SentenceTransformer(LOCAL_MODEL_PATH)
        return _model

    os.makedirs(LOCAL_MODEL_PATH, exist_ok=True)

    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)

    blobs = list(bucket.list_blobs(prefix=BUCKET_MODEL_PATH))

    if blobs:
        # ✅ Download from GCS
        _download_folder_from_bucket(BUCKET_MODEL_PATH, LOCAL_MODEL_PATH)
        _model = SentenceTransformer(LOCAL_MODEL_PATH)
    else:
        # ✅ First ever bootstrap from Hugging Face
        model = SentenceTransformer(MODEL_NAME)
        model.save(LOCAL_MODEL_PATH)

        # Upload to GCS for future deployments
        _upload_folder_to_bucket(LOCAL_MODEL_PATH, BUCKET_MODEL_PATH)

        _model = model

    return _model