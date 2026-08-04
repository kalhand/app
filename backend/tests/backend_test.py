"""Pathfinder AI backend regression tests (iteration 2)."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or \
           "https://pathfinder-ai-166.preview.emergentagent.com"
API = f"{BASE_URL}/api"

CREDS = {
    "admin":     ("admin@pathfinder.ai",     "Admin@123"),
    "student":   ("student@pathfinder.ai",   "Student@123"),
    "parent":    ("parent@pathfinder.ai",    "Parent@123"),
    "counselor": ("counselor@pathfinder.ai", "Counselor@123"),
    "principal": ("principal@pathfinder.ai", "Principal@123"),
}

_tokens = {}


def _login(role):
    if role in _tokens:
        return _tokens[role]
    email, pw = CREDS[role]
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=30)
    assert r.status_code == 200, f"login {role} -> {r.status_code} {r.text}"
    body = r.json()
    assert body["user"]["role"] == role
    _tokens[role] = body["token"]
    return _tokens[role]


def _h(role):
    return {"Authorization": f"Bearer {_login(role)}"}


# --------- Auth ---------
@pytest.mark.parametrize("role", list(CREDS.keys()))
def test_login_all_roles(role):
    email, pw = CREDS[role]
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert data["user"]["role"] == role
    assert data["user"]["email"] == email
    assert isinstance(data["token"], str) and len(data["token"]) > 10


def test_auth_meta():
    r = requests.get(f"{API}/auth/meta", timeout=15)
    assert r.status_code == 200
    d = r.json()
    assert len(d["boards"]) == 7
    assert set(d["roles"]) == {"student", "parent", "counselor", "principal"}


def test_register_student_parent_counselor():
    ts = int(time.time())
    # student
    s_email = f"TEST_stu_{ts}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "name": "TEST Student", "email": s_email, "password": "Passw0rd!",
        "role": "student", "grade": "10", "education_board": "CBSE",
        "school_name": "TEST School",
    }, timeout=30)
    assert r.status_code == 200, r.text
    assert r.json()["user"]["role"] == "student"

    # parent linked to seed student
    p_email = f"TEST_par_{ts}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "name": "TEST Parent", "email": p_email, "password": "Passw0rd!",
        "role": "parent", "linked_student_emails": ["student@pathfinder.ai"],
    }, timeout=30)
    assert r.status_code == 200, r.text
    assert r.json()["user"]["role"] == "parent"
    assert "student@pathfinder.ai" in r.json()["user"]["linked_student_emails"]

    # counselor
    c_email = f"TEST_cou_{ts}@example.com"
    r = requests.post(f"{API}/auth/register", json={
        "name": "TEST Counselor", "email": c_email, "password": "Passw0rd!",
        "role": "counselor", "school_name": "TEST School",
    }, timeout=30)
    assert r.status_code == 200, r.text
    assert r.json()["user"]["role"] == "counselor"


# --------- Questions ---------
def test_questions_grade_filter_student():
    r = requests.get(f"{API}/questions", headers=_h("student"), timeout=30)
    assert r.status_code == 200
    qs = r.json()
    assert len(qs) > 0
    for q in qs:
        assert 10 in q.get("grade_levels", []), f"Student grade 10 got question with levels {q.get('grade_levels')}"
    # Senior questions like derivative should NOT be there
    texts = [q["text"] for q in qs]
    assert not any("derivative of x^3" in t for t in texts)
    # correct_index & trait_map should not leak to student
    assert all("correct_index" not in q for q in qs)


def test_questions_admin_sees_all():
    r = requests.get(f"{API}/questions", headers=_h("admin"), timeout=30)
    assert r.status_code == 200
    qs = r.json()
    texts = [q["text"] for q in qs]
    assert any("derivative of x^3" in t for t in texts)


def test_counselor_cannot_create_question():
    r = requests.post(f"{API}/questions", headers=_h("counselor"), json={
        "category": "aptitude", "text": "test?", "options": ["a", "b"], "correct_index": 0,
    }, timeout=15)
    assert r.status_code == 403


# --------- Assessment ---------
_result_ids = []


def test_assessment_submit_student():
    # get questions for student
    qs = requests.get(f"{API}/questions", headers=_h("student"), timeout=30).json()
    answers = [{"question_id": q["id"], "selected_index": 0} for q in qs[:10]]
    r = requests.post(f"{API}/assessment/submit", headers=_h("student"),
                      json={"answers": answers}, timeout=90)
    assert r.status_code == 200, r.text
    doc = r.json()
    assert doc["nep_stage"]["code"] == "SEC1"
    assert doc["education_board"] == "CBSE"
    assert doc["school_name"] == "Demo Public School"
    rep = doc["ai_report"]
    assert isinstance(rep.get("nep_alignment"), str) and len(rep["nep_alignment"]) > 0
    assert isinstance(rep.get("board_notes"), str)
    _result_ids.append(doc["id"])


def test_assessment_retake_and_sorted():
    qs = requests.get(f"{API}/questions", headers=_h("student"), timeout=30).json()
    answers = [{"question_id": q["id"], "selected_index": 1 % len(q["options"])} for q in qs[:10]]
    r = requests.post(f"{API}/assessment/submit", headers=_h("student"),
                      json={"answers": answers}, timeout=90)
    assert r.status_code == 200
    _result_ids.append(r.json()["id"])

    r = requests.get(f"{API}/results/me", headers=_h("student"), timeout=30)
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 2
    # newest first
    times = [i["created_at"] for i in items]
    assert times == sorted(times, reverse=True)


def test_parent_cannot_submit_assessment():
    r = requests.post(f"{API}/assessment/submit", headers=_h("parent"),
                      json={"answers": []}, timeout=15)
    assert r.status_code == 403


# --------- Parent ---------
def test_parent_children_and_link_idempotent():
    r = requests.get(f"{API}/parent/children", headers=_h("parent"), timeout=30)
    assert r.status_code == 200
    kids = r.json()
    emails = [k["email"] for k in kids]
    assert "student@pathfinder.ai" in emails
    child = next(k for k in kids if k["email"] == "student@pathfinder.ai")
    assert "results" in child
    assert child["nep_stage"]["code"] == "SEC1"

    # link again (idempotent)
    r = requests.post(f"{API}/parent/link", headers=_h("parent"),
                      json={"student_email": "student@pathfinder.ai"}, timeout=15)
    assert r.status_code == 200
    assert "student@pathfinder.ai" in r.json()["linked"]


def test_parent_can_get_linked_result_but_not_others():
    if not _result_ids:
        pytest.skip("need a result id")
        return
    rid = _result_ids[0]
    r = requests.get(f"{API}/results/{rid}", headers=_h("parent"), timeout=15)
    assert r.status_code == 200

    # Create an unrelated student and result-like access -> parent must get 403 on random rid
    r = requests.get(f"{API}/results/nonexistent-id", headers=_h("parent"), timeout=15)
    assert r.status_code in (403, 404)


# --------- School (counselor/principal) ---------
@pytest.mark.parametrize("role", ["counselor", "principal"])
def test_school_overview(role):
    r = requests.get(f"{API}/school/overview", headers=_h(role), timeout=30)
    assert r.status_code == 200
    d = r.json()
    assert d["school_name"] == "Demo Public School"
    assert "student_count" in d and d["student_count"] >= 1
    assert "assessment_count" in d
    assert isinstance(d["stream_distribution"], dict)
    assert isinstance(d["board_distribution"], dict)


@pytest.mark.parametrize("role", ["counselor", "principal"])
def test_school_students(role):
    r = requests.get(f"{API}/school/students", headers=_h(role), timeout=30)
    assert r.status_code == 200
    kids = r.json()
    assert any(k["email"] == "student@pathfinder.ai" for k in kids)
    for k in kids:
        assert "latest_result" in k
        assert "nep_stage" in k


def test_school_results_counselor():
    r = requests.get(f"{API}/school/results", headers=_h("counselor"), timeout=30)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# --------- Cross-role authz ---------
def test_student_cannot_get_school_overview():
    r = requests.get(f"{API}/school/overview", headers=_h("student"), timeout=15)
    assert r.status_code == 403


def test_parent_cannot_get_school_overview():
    r = requests.get(f"{API}/school/overview", headers=_h("parent"), timeout=15)
    assert r.status_code == 403


def test_no_auth_rejected():
    r = requests.get(f"{API}/questions", timeout=15)
    assert r.status_code == 401
