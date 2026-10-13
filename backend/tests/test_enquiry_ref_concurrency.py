"""Concurrent + sequential enquiry ref uniqueness tests."""
import os
import re
import concurrent.futures as cf
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip()
                break
API = f"{BASE_URL.rstrip('/')}/api"


def _payload(i):
    return {
        "name": f"TEST_Concurrent_{i}", "phone": "+919800000222", "email": "",
        "pincode": "", "city": "", "address": "", "delivery_date": "", "message": "",
        "items": [{"kind": "hamper", "item_id": "x", "name": "X", "price": 100, "qty": 1, "meta": ""}],
        "total": 100, "source": "cart",
    }


def _post(i):
    r = requests.post(f"{API}/enquiries", json=_payload(i), timeout=20)
    assert r.status_code == 200, r.text
    return r.json()["ref"]


def _num(ref):
    m = re.match(r"UF(\d+)", ref)
    return int(m.group(1)) if m else -1


def test_concurrent_refs_unique():
    with cf.ThreadPoolExecutor(max_workers=5) as ex:
        refs = list(ex.map(_post, range(5)))
    print("concurrent refs:", refs)
    assert len(set(refs)) == 5, f"duplicate refs: {refs}"
    nums = sorted(_num(r) for r in refs)
    # must be strictly increasing consecutive sequence
    assert nums == list(range(nums[0], nums[0] + 5)), f"not sequential: {nums}"


def test_sequential_refs_continue():
    seq = [_post(100 + i) for i in range(3)]
    print("sequential refs:", seq)
    nums = [_num(r) for r in seq]
    assert nums == sorted(set(nums)) and len(set(nums)) == 3
    assert nums[1] == nums[0] + 1 and nums[2] == nums[1] + 1
