"""One-time migration: copy the original Unsplash catalog images into R2 and
point every hamper/fruit record at the R2 copies.

Safe to re-run: images already in R2 are skipped and DB records are only
rewritten where they still reference an Unsplash URL.

    cd backend && .venv/bin/python scripts/migrate_images_to_r2.py
"""
import asyncio
import os
import sys
from pathlib import Path

import httpx
from botocore.exceptions import ClientError
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))
load_dotenv(BACKEND_DIR / ".env")

import storage  # noqa: E402

# R2 key -> Unsplash photo id the seed data originally used.
CATALOG_IMAGES = {
    "catalog/royal.jpg": "photo-1576221506205-a1b45deb55a9",
    "catalog/trio.jpg": "photo-1619566636858-adf3ef46400b",
    "catalog/emperor.jpg": "photo-1646340925478-844ca7a38e9c",
    "catalog/wellness.jpg": "photo-1628689469838-524a4a973b8e",
    "catalog/citrus.jpg": "photo-1487376480913-24046456a727",
    "catalog/orchard.jpg": "photo-1629905707362-03cf1a9f6e2d",
    "catalog/pitaya.jpg": "photo-1676630034199-ae499d5c4c1c",
    "catalog/pitaya-2.jpg": "photo-1635843110565-cb35d1c03d86",
    "catalog/cherry.jpg": "photo-1735136425476-50686acb7f7e",
    "catalog/kiwi.jpg": "photo-1733584328901-158b395e7b5d",
    "catalog/avocado.jpg": "photo-1760108273034-f8f7e2889913",
    "catalog/citrus-cut.jpg": "photo-1619722407220-b5e19ec752ab",
}


def exists(key: str) -> bool:
    try:
        storage.client().head_object(Bucket=storage.bucket(), Key=key)
        return True
    except ClientError:
        return False


def upload_catalog() -> None:
    with httpx.Client(timeout=60, follow_redirects=True) as http:
        for key, photo in CATALOG_IMAGES.items():
            if exists(key):
                print(f"skip    {key}")
                continue
            res = http.get(f"https://images.unsplash.com/{photo}?fm=jpg&q=85&w=1400")
            res.raise_for_status()
            storage.client().put_object(
                Bucket=storage.bucket(),
                Key=key,
                Body=res.content,
                ContentType="image/jpeg",
                CacheControl="public, max-age=31536000, immutable",
            )
            print(f"upload  {key} ({len(res.content) // 1024} KB)")


def to_r2(url: str) -> str:
    for key, photo in CATALOG_IMAGES.items():
        if url and photo in url:
            return storage.public_url(key)
    return url


async def rewrite_db() -> None:
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]
    for name in ("hampers", "fruits"):
        changed = 0
        async for doc in db[name].find({}, {"_id": 1, "image": 1, "gallery": 1}):
            update = {}
            if to_r2(doc.get("image", "")) != doc.get("image", ""):
                update["image"] = to_r2(doc["image"])
            gallery = doc.get("gallery") or []
            if [to_r2(u) for u in gallery] != gallery:
                update["gallery"] = [to_r2(u) for u in gallery]
            if update:
                await db[name].update_one({"_id": doc["_id"]}, {"$set": update})
                changed += 1
        print(f"db      {name}: {changed} record(s) updated")
    client.close()


if __name__ == "__main__":
    upload_catalog()
    asyncio.run(rewrite_db())
