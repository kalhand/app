"""Iteration 3: Vocational, Cohort Comparison, Bulk Onboarding tests."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
API = f"{BASE_URL}/api"

CREDS = {
    "admin":     ("admin@pathfinder.ai",     "Admin@123"),
    "student":   ("student@pathfinder.ai",   "Student@123"),
    "parent":    ("parent@pathfinder.ai",    "Parent@123"),
    "counselor": ("counselor@pathfinder.ai", "Counselor@123"),
    "principal": ("principal@pathfinder.ai", "Principal@123"),
}

_tokens = {}


def _login(role, email=None, password=None):
    key = email or role
    if key in _tokens:
        return _tokens[key]
    if email is None:
        email, password = CREDS[role]
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"login {email} -> {r.status_code} {r.text}"
    _tokens[key] = r.json()["token"]
    return _tokens[key]


def _h(role):
    return {"Authorization": f"Bearer {_login(role)}"}


def _hemail(email, pw):
    return {"Authorization": f"Bearer {_login(None, email, pw)}"}


# ---------- Vocational ----------
def test_vocational_student_grade10_returns_10_items():
    r = requests.get(f"{API}/vocational", headers=_h("student"), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["count"] == 10, f"grade 10 student should see all 10 opps, got {d['count']}"
    for o in d["opportunities"]:
        for k in ("title", "type", "duration", "grades", "streams", "provider", "url", "tag"):
            assert k in o, f"missing key {k} in vocational item"
        assert 10 in o["grades"]


def test_vocational_grade8_filter():
    r = requests.get(f"{API}/vocational?grade=8", headers=_h("student"), timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert d["count"] >= 1
    for o in d["opportunities"]:
        assert 8 in o["grades"], f"opp {o['title']} does not include grade 8"


def test_vocational_requires_auth():
    r = requests.get(f"{API}/vocational", timeout=15)
    assert r.status_code == 401


# ---------- Cohort ----------
@pytest.fixture(scope="module")
def student_result_id():
    r = requests.get(f"{API}/results/me", headers=_h("student"), timeout=30)
    assert r.status_code == 200
    items = r.json()
    if not items:
        pytest.skip("no results seeded for student")
    return items[0]["id"]


def test_cohort_student_own_result(student_result_id):
    r = requests.get(f"{API}/cohort/{student_result_id}", headers=_h("student"), timeout=30)
    assert r.status_code == 200
    d = r.json()
    for k in ("student", "self_scores", "school", "grade", "national",
              "stream_distribution_school", "stream_distribution_grade"):
        assert k in d, f"missing {k}"
    for cohort_key in ("school", "grade", "national"):
        c = d[cohort_key]
        assert "size" in c
        assert "aptitude_pct" in c
        assert "mental_pct" in c
        assert "combined_pct" in c


def test_cohort_parent_linked_can_access(student_result_id):
    r = requests.get(f"{API}/cohort/{student_result_id}", headers=_h("parent"), timeout=15)
    assert r.status_code == 200


def test_cohort_counselor_same_school_can_access(student_result_id):
    r = requests.get(f"{API}/cohort/{student_result_id}", headers=_h("counselor"), timeout=15)
    assert r.status_code == 200


def test_cohort_other_student_forbidden(student_result_id):
    # Register a fresh unrelated student and try to fetch
    ts = int(time.time())
    email = f"TEST_otherstu_{ts}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "name": "Other Student", "email": email, "password": "Passw0rd!",
        "role": "student", "grade": "10", "education_board": "CBSE",
        "school_name": "Some Other School",
    }, timeout=30)
    assert r.status_code == 200
    tok = r.json()["token"]
    r = requests.get(f"{API}/cohort/{student_result_id}",
                     headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert r.status_code == 403


def test_cohort_different_school_counselor_forbidden(student_result_id):
    ts = int(time.time())
    email = f"TEST_othercou_{ts}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "name": "Other Counselor", "email": email, "password": "Passw0rd!",
        "role": "counselor", "school_name": "Some Other School",
    }, timeout=30)
    assert r.status_code == 200
    tok = r.json()["token"]
    r = requests.get(f"{API}/cohort/{student_result_id}",
                     headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert r.status_code == 403


# ---------- Bulk Onboarding ----------
def _sample_students(prefix):
    ts = int(time.time() * 1000)
    return [
        {"name": "TEST Bulk A", "email": f"TEST_{prefix}_a_{ts}@example.com",
         "grade": "10", "education_board": "CBSE"},
        {"name": "TEST Bulk B", "email": f"TEST_{prefix}_b_{ts}@example.com",
         "grade": "11", "education_board": "ICSE"},
        {"name": "TEST Bulk Bad", "email": f"TEST_{prefix}_bad_{ts}@example.com",
         "grade": "9", "education_board": "NOT_A_BOARD"},
    ]


def test_bulk_create_principal():
    rows = _sample_students("prin")
    r = requests.post(f"{API}/principal/students/bulk", headers=_h("principal"),
                      json={"students": rows}, timeout=30)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["summary"]["created"] == 2
    assert d["summary"]["errors"] == 1
    assert any("invalid board" in e["reason"] for e in d["errors"])
    for c in d["created"]:
        assert "temp_password" in c and len(c["temp_password"]) > 0

    # Re-submit same rows -> all skipped (created ones), bad remains error
    r2 = requests.post(f"{API}/principal/students/bulk", headers=_h("principal"),
                       json={"students": rows}, timeout=30)
    d2 = r2.json()
    assert d2["summary"]["created"] == 0
    assert d2["summary"]["skipped"] == 2

    # Verify auto-assigned school
    email = d["created"][0]["email"]
    tmp_pw = d["created"][0]["temp_password"]
    login = requests.post(f"{API}/auth/login",
                          json={"email": email, "password": tmp_pw}, timeout=15)
    assert login.status_code == 200
    assert login.json()["user"]["school_name"] == "Demo Public School"


def test_bulk_create_counselor_ok():
    rows = _sample_students("cou")
    r = requests.post(f"{API}/principal/students/bulk", headers=_h("counselor"),
                      json={"students": rows[:2]}, timeout=30)
    assert r.status_code == 200
    assert r.json()["summary"]["created"] == 2


def test_bulk_forbidden_student():
    r = requests.post(f"{API}/principal/students/bulk", headers=_h("student"),
                      json={"students": []}, timeout=15)
    assert r.status_code == 403


def test_bulk_forbidden_parent():
    r = requests.post(f"{API}/principal/students/bulk", headers=_h("parent"),
                      json={"students": []}, timeout=15)
    assert r.status_code == 403
