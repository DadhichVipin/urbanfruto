"""Urban Fresh backend API tests."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # fall back to frontend env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "vipin11dadhich@gmail.com"
ADMIN_PASSWORD = "UrbanFresh@2026"


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------- Public catalog ----------------
class TestCatalog:
    def test_list_hampers(self):
        r = requests.get(f"{API}/hampers", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 6
        slugs = {h["slug"] for h in data}
        assert "royal-exotic-basket" in slugs

    def test_get_hamper_detail(self):
        r = requests.get(f"{API}/hampers/royal-exotic-basket", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "royal-exotic-basket"
        assert d["price"] == 2299
        assert len(d["produce"]) > 0

    def test_get_hamper_404(self):
        r = requests.get(f"{API}/hampers/bogus-xyz", timeout=15)
        assert r.status_code == 404

    def test_list_fruits(self):
        r = requests.get(f"{API}/fruits", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 8

    def test_get_fruit_detail(self):
        r = requests.get(f"{API}/fruits/vietnamese-red-pitaya", timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "vietnamese-red-pitaya"
        assert d["price"] == 280

    def test_content(self):
        r = requests.get(f"{API}/content", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for key in ("curations", "promises", "difference", "testimonials"):
            assert key in d and isinstance(d[key], list) and len(d[key]) > 0


# ---------------- Enquiries + customer upsert ----------------
class TestEnquiries:
    phone = "+919812345678"

    def _payload(self, name="TEST_Buyer", total=1299):
        return {
            "name": name, "phone": self.phone, "email": "t@test.com",
            "pincode": "400001", "city": "Mumbai", "address": "A1",
            "delivery_date": "", "message": "test",
            "items": [{"kind": "hamper", "item_id": "x", "name": "Daily Fresh Trio",
                       "price": total, "qty": 1, "meta": ""}],
            "total": total, "source": "cart",
        }

    def test_create_enquiry(self):
        r = requests.post(f"{API}/enquiries", json=self._payload(), timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["ref"].startswith("UF")
        assert d["notified"] is True  # slack webhook now live

    def test_empty_items_400(self):
        p = self._payload()
        p["items"] = []
        r = requests.post(f"{API}/enquiries", json=p, timeout=15)
        assert r.status_code == 400

    def test_customer_upsert_on_repeat_phone(self, auth_headers):
        # make 2 enquiries same phone
        requests.post(f"{API}/enquiries", json=self._payload(total=500), timeout=15)
        requests.post(f"{API}/enquiries", json=self._payload(total=700), timeout=15)
        r = requests.get(f"{API}/admin/customers", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        matched = [c for c in r.json() if c["phone"] == self.phone]
        assert len(matched) == 1
        assert matched[0]["orders"] >= 2
        assert matched[0]["lifetime_value"] >= 1200


# ---------------- Admin auth ----------------
class TestAdminAuth:
    def test_login_ok(self):
        r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        assert "token" in r.json()

    def test_login_bad(self):
        r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_me(self, auth_headers):
        r = requests.get(f"{API}/admin/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_protected_no_token(self):
        r = requests.get(f"{API}/admin/hampers", timeout=15)
        assert r.status_code == 401

    def test_protected_bad_token(self):
        r = requests.get(f"{API}/admin/hampers", headers={"Authorization": "Bearer invalid"}, timeout=15)
        assert r.status_code == 401


# ---------------- Admin CRUD inventory ----------------
class TestAdminInventory:
    def test_hamper_crud(self, auth_headers):
        payload = {"name": "TEST_Hamper", "price": 999, "curation": "wellness",
                   "contents": ["A"], "produce": [{"name": "A", "note": "x", "qty": "1"}]}
        r = requests.post(f"{API}/admin/hampers", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        hid = r.json()["id"]
        slug = r.json()["slug"]
        # list public
        pub = requests.get(f"{API}/hampers", timeout=15).json()
        assert any(h["slug"] == slug for h in pub)
        # update
        payload["price"] = 1099
        payload["name"] = "TEST_Hamper_Updated"
        r = requests.put(f"{API}/admin/hampers/{hid}", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["price"] == 1099
        # delete
        r = requests.delete(f"{API}/admin/hampers/{hid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200

    def test_fruit_crud(self, auth_headers):
        payload = {"name": "TEST_Fruit", "price": 199}
        r = requests.post(f"{API}/admin/fruits", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        fid = r.json()["id"]
        slug = r.json()["slug"]
        pub = requests.get(f"{API}/fruits", timeout=15).json()
        assert any(f["slug"] == slug for f in pub)
        payload["price"] = 249
        r = requests.put(f"{API}/admin/fruits/{fid}", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200 and r.json()["price"] == 249
        r = requests.delete(f"{API}/admin/fruits/{fid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200


# ---------------- Admin enquiries & stats ----------------
class TestAdminEnquiries:
    def test_list_and_patch_delete(self, auth_headers):
        # create one
        p = {"name": "TEST_StatusBuyer", "phone": "+919800000111", "email": "", "pincode": "", "city": "",
             "address": "", "delivery_date": "", "message": "",
             "items": [{"kind": "hamper", "item_id": "x", "name": "X", "price": 100, "qty": 1, "meta": ""}],
             "total": 100, "source": "cart"}
        requests.post(f"{API}/enquiries", json=p, timeout=15)
        r = requests.get(f"{API}/admin/enquiries", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        enqs = r.json()
        assert len(enqs) > 0
        # newest first
        if len(enqs) >= 2:
            assert enqs[0]["created_at"] >= enqs[1]["created_at"]
        eid = enqs[0]["id"]
        r = requests.patch(f"{API}/admin/enquiries/{eid}", json={"status": "confirmed"},
                           headers=auth_headers, timeout=15)
        assert r.status_code == 200 and r.json()["status"] == "confirmed"
        r = requests.delete(f"{API}/admin/enquiries/{eid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200

    def test_stats(self, auth_headers):
        r = requests.get(f"{API}/admin/stats", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ("enquiries", "revenue", "customers", "top_items", "trend", "by_status", "latest"):
            assert k in d

    def test_toggle_customer_blocked(self, auth_headers):
        custs = requests.get(f"{API}/admin/customers", headers=auth_headers, timeout=15).json()
        if not custs:
            pytest.skip("no customers")
        cid = custs[0]["id"]
        before = custs[0].get("blocked", False)
        r = requests.patch(f"{API}/admin/customers/{cid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200 and r.json()["blocked"] != before
        requests.patch(f"{API}/admin/customers/{cid}", headers=auth_headers, timeout=15)  # restore


# ---------------- Settings ----------------
class TestAdminSettings:
    def test_get_put_settings(self, auth_headers):
        r = requests.get(f"{API}/admin/settings", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        current = r.json()
        payload = {
            "slack_webhook_url": current.get("slack_webhook_url", ""), "brand_phone": current.get("brand_phone", ""),
            "brand_email": current.get("brand_email", ""),
            "announcement": "TEST announcement",
            "cities": current.get("cities", []),
            "free_delivery_note": current.get("free_delivery_note", ""),
        }
        r = requests.put(f"{API}/admin/settings", json=payload, headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["announcement"] == "TEST announcement"
        # restore
        payload["announcement"] = current.get("announcement", "")
        requests.put(f"{API}/admin/settings", json=payload, headers=auth_headers, timeout=15)

    def test_slack_test_now_returns_200(self, auth_headers):
        r = requests.post(f"{API}/admin/settings/test-slack", headers=auth_headers, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json().get("sent") is True

    def test_settings_preserves_webhook(self, auth_headers):
        # Fetch - webhook should be populated
        r = requests.get(f"{API}/admin/settings", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        current = r.json()
        assert current.get("slack_webhook_url", "").startswith("https://hooks.slack.com/")
