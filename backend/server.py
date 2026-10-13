from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.concurrency import run_in_threadpool
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import bcrypt
import jwt
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta

import storage
from seed_data import HAMPERS, FRUITS, CURATIONS, PROMISES, DIFFERENCE, TESTIMONIALS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']

app = FastAPI(title="Urban Fruto API")
api = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


# ---------------- Models ----------------
class AdminLogin(BaseModel):
    email: str
    password: str


class HamperIn(BaseModel):
    name: str
    slug: Optional[str] = None
    tagline: str = ""
    description: str = ""
    badge: str = ""
    price: float
    compare_price: Optional[float] = None
    weight: str = ""
    vessel: str = ""
    image: str = ""
    gallery: List[str] = []
    curation: str = "all"
    contents: List[str] = []
    produce: List[Dict[str, Any]] = []
    varieties: int = 0
    rating: float = 4.8
    reviews: int = 0
    stock: int = 25
    featured: bool = False
    popular: bool = False
    active: bool = True


class FruitIn(BaseModel):
    name: str
    slug: Optional[str] = None
    origin: str = ""
    short_name: str = ""
    grammage: str = ""
    description: str = ""
    price: float
    unit: str = "pc"
    image: str = ""
    brix: str = ""
    weight_grams: int = 300
    tags: List[str] = []
    nutrition: List[Dict[str, Any]] = []
    packaging: str = ""
    stock: int = 40
    active: bool = True


class EnquiryItem(BaseModel):
    kind: str  # hamper | fruit
    item_id: str
    name: str
    price: float
    qty: int
    meta: str = ""


class EnquiryIn(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    pincode: str = ""
    city: str = ""
    address: str = ""
    delivery_date: str = ""
    message: str = ""
    items: List[EnquiryItem]
    total: float
    source: str = "cart"


class EnquiryStatus(BaseModel):
    status: str


class SettingsIn(BaseModel):
    slack_webhook_url: str = ""
    brand_phone: str = ""
    brand_email: str = ""
    announcement: str = ""
    cities: List[str] = []
    free_delivery_note: str = ""


# ---------------- Auth ----------------
def make_token(email: str) -> str:
    payload = {"sub": email, "role": "admin", "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def admin_required(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)):
    if not creds:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid or expired token")
    admin = await db.admins.find_one({"email": payload.get("sub")}, {"_id": 0, "password_hash": 0})
    if not admin:
        raise HTTPException(401, "Admin not found")
    return admin


@api.post("/admin/login")
async def admin_login(body: AdminLogin):
    admin = await db.admins.find_one({"email": body.email.lower().strip()}, {"_id": 0})
    if not admin or not bcrypt.checkpw(body.password.encode(), admin["password_hash"].encode()):
        raise HTTPException(401, "Invalid email or password")
    return {"token": make_token(admin["email"]), "admin": {"email": admin["email"], "name": admin.get("name", "Admin")}}


@api.get("/admin/me")
async def admin_me(admin=Depends(admin_required)):
    return admin


@api.post("/admin/uploads")
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Form("site"),
    admin=Depends(admin_required),
):
    if folder not in storage.UPLOAD_FOLDERS:
        raise HTTPException(400, "Invalid upload folder")
    if file.content_type not in storage.ALLOWED_IMAGE_TYPES:
        raise HTTPException(400, "Only JPEG, PNG, WebP, AVIF or GIF images are allowed")
    data = await file.read(storage.MAX_IMAGE_BYTES + 1)
    if len(data) > storage.MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image must be 8 MB or smaller")
    if not data:
        raise HTTPException(400, "Empty file")
    try:
        return await run_in_threadpool(storage.put_image, data, file.content_type, folder)
    except Exception:
        logger.exception("R2 upload failed")
        raise HTTPException(502, "Image upload failed")


# ---------------- Public catalog ----------------
@api.get("/")
async def root():
    return {"message": "Urban Fruto API"}


@api.get("/hampers")
async def list_hampers(curation: Optional[str] = None):
    q: Dict[str, Any] = {"active": True}
    if curation and curation != "all":
        q["curation"] = curation
    docs = await db.hampers.find(q, {"_id": 0}).sort("price", 1).to_list(200)
    return docs


@api.get("/hampers/{slug}")
async def get_hamper(slug: str):
    doc = await db.hampers.find_one({"slug": slug, "active": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Hamper not found")
    return doc


@api.get("/fruits")
async def list_fruits():
    return await db.fruits.find({"active": True}, {"_id": 0}).to_list(200)


@api.get("/fruits/{slug}")
async def get_fruit(slug: str):
    doc = await db.fruits.find_one({"slug": slug, "active": True}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Fruit not found")
    return doc


@api.get("/content")
async def site_content():
    settings = await db.settings.find_one({"key": "site"}, {"_id": 0})
    return {
        "curations": CURATIONS,
        "promises": PROMISES,
        "difference": DIFFERENCE,
        "testimonials": TESTIMONIALS,
        "announcement": (settings or {}).get("announcement", ""),
        "cities": (settings or {}).get("cities", []),
        "brand_phone": (settings or {}).get("brand_phone", ""),
        "brand_email": (settings or {}).get("brand_email", ""),
        "free_delivery_note": (settings or {}).get("free_delivery_note", ""),
    }


# ---------------- Enquiries ----------------
async def notify_slack(enquiry: Dict[str, Any]):
    settings = await db.settings.find_one({"key": "site"}, {"_id": 0}) or {}
    url = settings.get("slack_webhook_url") or os.environ.get("SLACK_WEBHOOK_URL", "")
    if not url:
        logger.info("Slack webhook not configured; skipping notification")
        return False
    lines = [f"• {i['name']} x{i['qty']} — ₹{i['price']:,.0f}" + (f" ({i['meta']})" if i.get("meta") else "") for i in enquiry["items"]]
    text = (
        f"*New Urban Fruto Order Enquiry* `{enquiry['ref']}`\n"
        f"*Customer:* {enquiry['name']} | {enquiry['phone']} | {enquiry.get('email') or '-'}\n"
        f"*Deliver to:* {enquiry.get('address') or '-'}, {enquiry.get('city') or '-'} {enquiry.get('pincode') or ''}\n"
        f"*Preferred slot:* {enquiry.get('delivery_date') or 'Earliest 3-hour slot'}\n"
        f"*Items:*\n" + "\n".join(lines) + f"\n*Total:* ₹{enquiry['total']:,.0f}\n"
        f"*Note:* {enquiry.get('message') or '-'}"
    )
    try:
        async with httpx.AsyncClient(timeout=10) as hc:
            r = await hc.post(url, json={"text": text})
        return r.status_code == 200
    except Exception as e:
        logger.error(f"Slack notify failed: {e}")
        return False


@api.post("/enquiries")
async def create_enquiry(body: EnquiryIn):
    if not body.items:
        raise HTTPException(400, "Your bucket is empty")
    count = await db.counters.find_one_and_update(
        {"_id": "enquiry_ref"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    doc = body.model_dump()
    doc.update({
        "id": new_id(),
        "ref": f"UF{1000 + count['seq']}",
        "status": "new",
        "created_at": now_iso(),
        "notified": False,
    })
    doc["notified"] = await notify_slack(doc)
    await db.enquiries.insert_one(dict(doc))

    phone = body.phone.strip()
    existing = await db.customers.find_one({"phone": phone}, {"_id": 0})
    if existing:
        await db.customers.update_one(
            {"phone": phone},
            {"$set": {"name": body.name, "email": body.email, "city": body.city, "pincode": body.pincode,
                      "last_order_at": doc["created_at"]},
             "$inc": {"orders": 1, "lifetime_value": body.total}},
        )
    else:
        await db.customers.insert_one({
            "id": new_id(), "name": body.name, "phone": phone, "email": body.email,
            "city": body.city, "pincode": body.pincode, "orders": 1,
            "lifetime_value": body.total, "created_at": doc["created_at"],
            "last_order_at": doc["created_at"], "blocked": False,
        })
    return {"ref": doc["ref"], "notified": doc["notified"], "status": "received"}


# ---------------- Admin: inventory ----------------
def slugify(name: str) -> str:
    return "-".join("".join(c.lower() if c.isalnum() else " " for c in name).split())


@api.get("/admin/hampers")
async def admin_hampers(admin=Depends(admin_required)):
    return await db.hampers.find({}, {"_id": 0}).to_list(500)


@api.post("/admin/hampers")
async def admin_create_hamper(body: HamperIn, admin=Depends(admin_required)):
    doc = body.model_dump()
    doc["slug"] = doc.get("slug") or slugify(body.name)
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    if await db.hampers.find_one({"slug": doc["slug"]}):
        doc["slug"] = f"{doc['slug']}-{doc['id'][:4]}"
    await db.hampers.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


@api.put("/admin/hampers/{item_id}")
async def admin_update_hamper(item_id: str, body: HamperIn, admin=Depends(admin_required)):
    doc = body.model_dump()
    doc["slug"] = doc.get("slug") or slugify(body.name)
    res = await db.hampers.update_one({"id": item_id}, {"$set": doc})
    if res.matched_count == 0:
        raise HTTPException(404, "Hamper not found")
    return await db.hampers.find_one({"id": item_id}, {"_id": 0})


@api.delete("/admin/hampers/{item_id}")
async def admin_delete_hamper(item_id: str, admin=Depends(admin_required)):
    await db.hampers.delete_one({"id": item_id})
    return {"deleted": item_id}


@api.get("/admin/fruits")
async def admin_fruits(admin=Depends(admin_required)):
    return await db.fruits.find({}, {"_id": 0}).to_list(500)


@api.post("/admin/fruits")
async def admin_create_fruit(body: FruitIn, admin=Depends(admin_required)):
    doc = body.model_dump()
    doc["slug"] = doc.get("slug") or slugify(body.name)
    doc["id"] = new_id()
    doc["created_at"] = now_iso()
    if await db.fruits.find_one({"slug": doc["slug"]}):
        doc["slug"] = f"{doc['slug']}-{doc['id'][:4]}"
    await db.fruits.insert_one(dict(doc))
    doc.pop("_id", None)
    return doc


@api.put("/admin/fruits/{item_id}")
async def admin_update_fruit(item_id: str, body: FruitIn, admin=Depends(admin_required)):
    doc = body.model_dump()
    doc["slug"] = doc.get("slug") or slugify(body.name)
    res = await db.fruits.update_one({"id": item_id}, {"$set": doc})
    if res.matched_count == 0:
        raise HTTPException(404, "Fruit not found")
    return await db.fruits.find_one({"id": item_id}, {"_id": 0})


@api.delete("/admin/fruits/{item_id}")
async def admin_delete_fruit(item_id: str, admin=Depends(admin_required)):
    await db.fruits.delete_one({"id": item_id})
    return {"deleted": item_id}


# ---------------- Admin: enquiries, customers, settings, stats ----------------
@api.get("/admin/enquiries")
async def admin_enquiries(status: Optional[str] = None, admin=Depends(admin_required)):
    q = {"status": status} if status and status != "all" else {}
    return await db.enquiries.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.patch("/admin/enquiries/{item_id}")
async def admin_update_enquiry(item_id: str, body: EnquiryStatus, admin=Depends(admin_required)):
    res = await db.enquiries.update_one({"id": item_id}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(404, "Enquiry not found")
    return await db.enquiries.find_one({"id": item_id}, {"_id": 0})


@api.delete("/admin/enquiries/{item_id}")
async def admin_delete_enquiry(item_id: str, admin=Depends(admin_required)):
    await db.enquiries.delete_one({"id": item_id})
    return {"deleted": item_id}


@api.get("/admin/customers")
async def admin_customers(admin=Depends(admin_required)):
    return await db.customers.find({}, {"_id": 0}).sort("last_order_at", -1).to_list(500)


@api.patch("/admin/customers/{item_id}")
async def admin_toggle_customer(item_id: str, admin=Depends(admin_required)):
    cust = await db.customers.find_one({"id": item_id}, {"_id": 0})
    if not cust:
        raise HTTPException(404, "Customer not found")
    await db.customers.update_one({"id": item_id}, {"$set": {"blocked": not cust.get("blocked", False)}})
    return await db.customers.find_one({"id": item_id}, {"_id": 0})


@api.get("/admin/settings")
async def admin_get_settings(admin=Depends(admin_required)):
    return await db.settings.find_one({"key": "site"}, {"_id": 0})


@api.put("/admin/settings")
async def admin_put_settings(body: SettingsIn, admin=Depends(admin_required)):
    await db.settings.update_one({"key": "site"}, {"$set": body.model_dump()}, upsert=True)
    return await db.settings.find_one({"key": "site"}, {"_id": 0})


@api.post("/admin/settings/test-slack")
async def admin_test_slack(admin=Depends(admin_required)):
    ok = await notify_slack({
        "ref": "TEST", "name": "Urban Fruto Admin", "phone": "-", "email": admin.get("email"),
        "address": "-", "city": "-", "pincode": "-", "delivery_date": "-",
        "items": [{"name": "Test hamper", "qty": 1, "price": 0, "meta": "connection test"}],
        "total": 0, "message": "Slack webhook connection test",
    })
    if not ok:
        raise HTTPException(400, "Slack webhook not configured or unreachable")
    return {"sent": True}


@api.get("/admin/stats")
async def admin_stats(admin=Depends(admin_required)):
    enquiries = await db.enquiries.find({}, {"_id": 0}).to_list(2000)
    revenue = sum(e.get("total", 0) for e in enquiries)
    by_status: Dict[str, int] = {}
    for e in enquiries:
        by_status[e.get("status", "new")] = by_status.get(e.get("status", "new"), 0) + 1
    item_counts: Dict[str, int] = {}
    for e in enquiries:
        for i in e.get("items", []):
            item_counts[i["name"]] = item_counts.get(i["name"], 0) + i.get("qty", 1)
    top = sorted(item_counts.items(), key=lambda x: -x[1])[:5]
    recent: Dict[str, float] = {}
    for e in enquiries:
        d = (e.get("created_at") or "")[:10]
        recent[d] = recent.get(d, 0) + e.get("total", 0)
    return {
        "enquiries": len(enquiries),
        "revenue": revenue,
        "customers": await db.customers.count_documents({}),
        "hampers": await db.hampers.count_documents({}),
        "fruits": await db.fruits.count_documents({}),
        "low_stock": await db.hampers.count_documents({"stock": {"$lt": 6}}) + await db.fruits.count_documents({"stock": {"$lt": 6}}),
        "by_status": by_status,
        "top_items": [{"name": n, "qty": q} for n, q in top],
        "trend": [{"date": d, "value": v} for d, v in sorted(recent.items())[-7:]],
        "latest": sorted(enquiries, key=lambda e: e.get("created_at", ""), reverse=True)[:5],
    }


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    email = ADMIN_EMAIL.lower().strip()
    if not await db.admins.find_one({"email": email}):
        await db.admins.insert_one({
            "id": new_id(), "email": email, "name": "Urban Fruto Admin",
            "password_hash": bcrypt.hashpw(ADMIN_PASSWORD.encode(), bcrypt.gensalt()).decode(),
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin {email}")

    if not await db.settings.find_one({"key": "site"}):
        await db.settings.insert_one({
            "key": "site",
            "slack_webhook_url": os.environ.get("SLACK_WEBHOOK_URL", ""),
            "brand_phone": "+91 90000 00000",
            "brand_email": "care@urbanfresh.in",
            "announcement": "Express Cold-Chain Logistics: Next 3-Hour Delivery across Mumbai, Delhi & Bengaluru • Ozone Sterilized Guarantee • 4°C Controlled Transit",
            "cities": ["Mumbai South", "Mumbai West", "Bengaluru", "Delhi NCR", "Pune"],
            "free_delivery_note": "Free Express Delivery Mumbai South & West",
        })

    if await db.hampers.count_documents({}) == 0:
        await db.hampers.insert_many([{**h, "id": new_id(), "created_at": now_iso()} for h in HAMPERS])
        logger.info("Seeded hampers")
    if await db.fruits.count_documents({}) == 0:
        await db.fruits.insert_many([{**f, "id": new_id(), "created_at": now_iso()} for f in FRUITS])
        logger.info("Seeded fruits")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
