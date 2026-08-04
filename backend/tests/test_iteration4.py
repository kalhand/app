"""Iteration 4 backend tests: class-report, careers/explore, language support."""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pathfinder-ai-166.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

CREDS = {
    "student":   ("student@pathfinder.ai",   "Student@123"),
    "parent":    ("parent@pathfinder.ai",    "Parent@123"),
    "counselor": ("counselor@pathfinder.ai", "Counselor@123"),
    "principal": ("principal@pathfinder.ai", "Principal@123"),
    "admin":     ("admin@pathfinder.ai",     "Admin@123"),
}


def _login(role):
    email, pw = CREDS[role]
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=15)
    assert r.status_code == 200, f"login {role} failed: {r.status_code} {r.text}"
    return r.json()["token"]


def _headers(role):
    return {"Authorization": f"Bearer {_login(role)}"}


# ---------- Class Report ----------
class TestClassReport:
    def test_counselor_gets_full_payload(self):
        r = requests.get(f"{API}/school/class-report", headers=_headers("counselor"), timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["school_name", "generated_at", "student_count", "assessment_count",
                  "avg_aptitude", "avg_mental", "trait_totals", "stream_distribution",
                  "alignment_distribution", "board_distribution", "top_careers",
                  "students_needing_attention"]:
            assert k in d, f"missing key {k}"
        assert isinstance(d["trait_totals"], dict)
        assert isinstance(d["top_careers"], list)
        assert isinstance(d["students_needing_attention"], list)
        assert d["school_name"] == "Demo Public School"

    def test_principal_also_works(self):
        r = requests.get(f"{API}/school/class-report", headers=_headers("principal"), timeout=15)
        assert r.status_code == 200

    def test_grade_filter(self):
        r = requests.get(f"{API}/school/class-report?grade=10", headers=_headers("counselor"), timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["grade"] == "10"

    def test_student_forbidden(self):
        r = requests.get(f"{API}/school/class-report", headers=_headers("student"), timeout=15)
        assert r.status_code == 403

    def test_parent_forbidden(self):
        r = requests.get(f"{API}/school/class-report", headers=_headers("parent"), timeout=15)
        assert r.status_code == 403

    def test_unauth(self):
        r = requests.get(f"{API}/school/class-report", timeout=15)
        assert r.status_code == 401


# ---------- Careers Explore (AI) ----------
class TestCareersExplore:
    def test_unauth_401(self):
        r = requests.post(f"{API}/careers/explore", json={"title": "Data Scientist"}, timeout=15)
        assert r.status_code == 401

    def test_english_deepdive(self):
        payload = {"title": "Data Scientist", "grade": "10",
                   "education_board": "CBSE", "language": "en"}
        r = requests.post(f"{API}/careers/explore", json=payload,
                          headers=_headers("student"), timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d.get("title")
        assert isinstance(d.get("day_in_the_life"), str) and len(d["day_in_the_life"]) > 40
        assert isinstance(d.get("core_skills"), list) and len(d["core_skills"]) >= 3
        assert isinstance(d.get("key_subjects"), list)
        assert isinstance(d.get("india_college_paths"), list) and len(d["india_college_paths"]) >= 1
        p0 = d["india_college_paths"][0]
        assert "stage" in p0 and "options" in p0
        assert isinstance(d.get("top_indian_institutes"), list)
        sb = d.get("salary_bands_inr") or {}
        for k in ["entry_level", "mid_career", "senior"]:
            assert k in sb, f"salary key {k} missing"
        assert d.get("growth_outlook")
        assert isinstance(d.get("adjacent_careers"), list) and len(d["adjacent_careers"]) >= 1
        assert isinstance(d.get("myths_vs_facts"), list)
        assert isinstance(d.get("resources"), list)

    def test_hindi_deepdive(self):
        payload = {"title": "Doctor", "grade": "10",
                   "education_board": "CBSE", "language": "hi"}
        r = requests.post(f"{API}/careers/explore", json=payload,
                          headers=_headers("student"), timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        day = d.get("day_in_the_life", "")
        # Devanagari unicode range 0900-097F
        assert re.search(r"[\u0900-\u097F]", day), f"expected Devanagari in Hindi output: {day[:200]}"
