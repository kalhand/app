"""Iteration 6 backend tests: University super-role + career compare (backend uses careers/explore)."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

CREDS = {
    "student": ("student@pathfinder.ai", "Student@123"),
    "parent": ("parent@pathfinder.ai", "Parent@123"),
    "counselor": ("counselor@pathfinder.ai", "Counselor@123"),
    "principal": ("principal@pathfinder.ai", "Principal@123"),
    "admin": ("admin@pathfinder.ai", "Admin@123"),
    "university": ("university@pathfinder.ai", "University@123"),
}


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"login failed {email}: {r.status_code} {r.text}"
    return r.json()


@pytest.fixture(scope="session")
def tokens():
    return {k: _login(*v)["token"] for k, v in CREDS.items()}


def _h(tok):
    return {"Authorization": f"Bearer {tok}"}


# --- Auth / login ---
class TestUniversityLogin:
    def test_login_returns_role_university(self):
        data = _login(*CREDS["university"])
        assert data.get("token")
        user = data.get("user") or {}
        assert user.get("role") == "university", f"expected university, got {user}"


# --- Overview ---
class TestUniversityOverview:
    def test_overview_shape(self, tokens):
        r = requests.get(f"{API}/university/overview", headers=_h(tokens["university"]), timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["school_count", "student_count", "assessment_count",
                  "stream_distribution", "board_distribution", "alignment_distribution", "top_careers"]:
            assert k in d, f"missing {k} in overview: {list(d.keys())}"
        assert isinstance(d["top_careers"], list)

    @pytest.mark.parametrize("role", ["student", "parent", "counselor", "principal", "admin"])
    def test_overview_rbac_forbidden(self, tokens, role):
        r = requests.get(f"{API}/university/overview", headers=_h(tokens[role]), timeout=15)
        assert r.status_code == 403, f"{role} got {r.status_code}"


# --- Schools CRUD ---
class TestUniversitySchools:
    def test_list_schools(self, tokens):
        r = requests.get(f"{API}/university/schools", headers=_h(tokens["university"]), timeout=15)
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        assert len(arr) > 0
        first = arr[0]
        for k in ["id", "name", "city", "state", "board", "student_count", "assessment_count", "staff"]:
            assert k in first, f"missing {k} in school doc: {list(first.keys())}"
        demo = [s for s in arr if s["name"] == "Demo Public School"]
        assert demo, "Demo Public School not present"
        assert demo[0]["student_count"] > 0

    def test_create_school_and_duplicate(self, tokens):
        suffix = uuid.uuid4().hex[:6]
        name = f"TEST_School_{suffix}"
        payload = {
            "name": name, "city": "Delhi", "state": "DL", "board": "CBSE",
            "principal_name": "PN",
            "principal_email": f"testx.principal.{suffix}@school.in",
            "counselor_email": f"testx.counselor.{suffix}@school.in",
        }
        r = requests.post(f"{API}/university/schools", json=payload,
                          headers=_h(tokens["university"]), timeout=20)
        assert r.status_code in (200, 201), r.text
        body = r.json()
        assert "accounts" in body, body
        accounts = body["accounts"]
        assert len(accounts) >= 2
        # Each should have temp_password OR status='existing'
        for a in accounts:
            assert ("temp_password" in a) or (a.get("status") == "existing"), a

        # Duplicate name -> 400
        r2 = requests.post(f"{API}/university/schools", json=payload,
                           headers=_h(tokens["university"]), timeout=15)
        assert r2.status_code == 400, f"duplicate should be 400, got {r2.status_code} {r2.text}"

        # Cleanup delete
        school_id = body.get("school", {}).get("id") or body.get("id")
        if school_id:
            requests.delete(f"{API}/university/schools/{school_id}",
                            headers=_h(tokens["university"]), timeout=15)

    def test_delete_school_does_not_remove_users(self, tokens):
        suffix = uuid.uuid4().hex[:6]
        pe = f"testx.p.{suffix}@school.in"
        payload = {
            "name": f"TEST_Del_{suffix}", "city": "X", "state": "Y", "board": "CBSE",
            "principal_email": pe,
        }
        r = requests.post(f"{API}/university/schools", json=payload,
                          headers=_h(tokens["university"]), timeout=20)
        assert r.status_code in (200, 201), r.text
        b = r.json()
        sid = b.get("school", {}).get("id") or b.get("id")
        assert sid, b
        d = requests.delete(f"{API}/university/schools/{sid}",
                            headers=_h(tokens["university"]), timeout=15)
        assert d.status_code in (200, 204)
        # School absent from list
        listing = requests.get(f"{API}/university/schools",
                               headers=_h(tokens["university"]), timeout=15).json()
        assert not any(s["id"] == sid for s in listing)
        # User account persists — try re-login? We only have the temp password, so just
        # confirm creating same email again returns 'existing' status
        r2 = requests.post(f"{API}/university/schools", json={**payload, "name": f"TEST_ReDel_{suffix}"},
                           headers=_h(tokens["university"]), timeout=20)
        assert r2.status_code in (200, 201)
        accts = r2.json().get("accounts", [])
        pe_acct = next((a for a in accts if a.get("email") == pe), None)
        assert pe_acct, f"principal account not returned: {accts}"
        assert pe_acct.get("status") == "existing", f"expected 'existing', got {pe_acct}"
        # cleanup
        sid2 = r2.json().get("school", {}).get("id") or r2.json().get("id")
        if sid2:
            requests.delete(f"{API}/university/schools/{sid2}",
                            headers=_h(tokens["university"]), timeout=15)

    @pytest.mark.parametrize("role", ["student", "parent", "counselor", "principal", "admin"])
    def test_schools_rbac(self, tokens, role):
        r = requests.get(f"{API}/university/schools", headers=_h(tokens[role]), timeout=15)
        assert r.status_code == 403


# --- Students listing/filter ---
class TestUniversityStudents:
    def test_students_shape_and_school_filter(self, tokens):
        r = requests.get(f"{API}/university/students",
                         headers=_h(tokens["university"]), timeout=20)
        assert r.status_code == 200, r.text
        arr = r.json()
        assert isinstance(arr, list) and len(arr) > 0
        s0 = arr[0]
        for k in ["id", "name", "email", "school_name", "grade",
                  "top_career", "recommended_stream", "latest_result_id"]:
            assert k in s0, f"missing {k}: {list(s0.keys())}"

        # school filter
        r2 = requests.get(f"{API}/university/students",
                         params={"school": "Demo Public School"},
                         headers=_h(tokens["university"]), timeout=20)
        assert r2.status_code == 200
        arr2 = r2.json()
        assert all(s["school_name"] == "Demo Public School" for s in arr2)

    def test_students_field_filter_engineer(self, tokens):
        r = requests.get(f"{API}/university/students",
                         params={"field": "Engineer"},
                         headers=_h(tokens["university"]), timeout=20)
        assert r.status_code == 200
        arr = r.json()
        # every returned row must contain 'engineer' somewhere in top_career or recommended_stream
        for s in arr:
            hay = f"{s.get('top_career') or ''} {s.get('recommended_stream') or ''}".lower()
            assert "engineer" in hay, f"row not matching filter: {s}"

    @pytest.mark.parametrize("role", ["student", "parent", "counselor", "principal", "admin"])
    def test_students_rbac(self, tokens, role):
        r = requests.get(f"{API}/university/students", headers=_h(tokens[role]), timeout=15)
        assert r.status_code == 403


# --- Ensure student wishlist has >=2 for frontend compare test ---
class TestSeedStudentWishlist:
    def test_add_second_wishlist_item(self, tokens):
        # ensure at least 2 items in wishlist
        r = requests.get(f"{API}/wishlist/me", headers=_h(tokens["student"]), timeout=15)
        assert r.status_code == 200, r.text
        items = r.json()
        titles = [i.get("career_title") for i in items]
        if "Software Engineer" not in titles:
            requests.post(f"{API}/wishlist", json={"career_title": "Software Engineer", "note": "seed"},
                          headers=_h(tokens["student"]), timeout=15)
        if "Data Scientist" not in titles:
            requests.post(f"{API}/wishlist", json={"career_title": "Data Scientist", "note": "seed"},
                          headers=_h(tokens["student"]), timeout=15)
        items2 = requests.get(f"{API}/wishlist/me", headers=_h(tokens["student"]), timeout=15).json()
        assert len(items2) >= 2
