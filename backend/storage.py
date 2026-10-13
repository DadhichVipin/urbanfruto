"""Cloudflare R2 (S3-compatible) image storage."""
import os
import uuid
from functools import lru_cache

import boto3
from botocore.config import Config

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
}
MAX_IMAGE_BYTES = 8 * 1024 * 1024
UPLOAD_FOLDERS = {"hampers", "fruits", "site"}


def bucket() -> str:
    return os.environ["R2_BUCKET"]


def public_url(key: str) -> str:
    return f"{os.environ['R2_PUBLIC_URL'].rstrip('/')}/{key}"


@lru_cache(maxsize=1)
def client():
    return boto3.client(
        "s3",
        endpoint_url=f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        region_name="auto",
        config=Config(signature_version="s3v4", retries={"max_attempts": 3}),
    )


def put_image(data: bytes, content_type: str, folder: str) -> dict:
    """Store an image under a unique key and return its key and public URL."""
    key = f"{folder}/{uuid.uuid4().hex}.{ALLOWED_IMAGE_TYPES[content_type]}"
    client().put_object(
        Bucket=bucket(),
        Key=key,
        Body=data,
        ContentType=content_type,
        # Keys are unique per upload, so the object never changes.
        CacheControl="public, max-age=31536000, immutable",
    )
    return {"key": key, "url": public_url(key)}
