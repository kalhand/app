"""Iteration 5 backend tests: Wishlist, Career Chat, School wishlists."""
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pathfinder-ai-166.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

CREDS = {
    "student": ("student@pathfinder.ai", "Student@123"),
    "parent": ("parent@pathfinder.ai", "Parent@123"),
    "counselor": ("counselor@pathfinder.ai", "Counselor@123"),
    "principal": ("principal@pathfinder.ai", "Principal@123"),
    "admin": ("admin@pathfinder.ai", "Admin@123"),
}


def _login(email, password):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"login failed {email}: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def tokens():
    return {k: _login(*v) for k, v in CREDS.items()}


def _h(tok):
    return {"Authorization": f"Bearer {tok}"}


# --- Wishlist ---
class TestWishlist:
    def test_add_and_duplicate(self, tokens):
        # Cleanup first
        requests.delete(f"{API}/wishlist/Software Engineer", headers=_h(tokens["student"]))
        r = requests.post(f"{API}/wishlist", json={"career_title": "Software Engineer", "note": "Excited"},
                          headers=_h(tokens["student"]), timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("career_title") == "Software Engineer"
        assert "id" in data
        assert data.get("user_email") == CREDS["student"][0]

        r2 = requests.post(f"{API}/wishlist", json={"career_title": "Software Engineer"},
                           headers=_h(tokens["student"]), timeout=15)
        assert r2.status_code == 200
        assert r2.json() == {"ok": True, "already_added": True}

    def test_list_me(self, tokens):
        r = requests.get(f"{API}/wishlist/me", headers=_h(tokens["student"]), timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        titles = [i["career_title"] for i in items]
        assert "Software Engineer" in titles

    def test_delete(self, tokens):
        # Add and delete a temp entry
        requests.post(f"{API}/wishlist", json={"career_title": "TEST_TempCareer"},
                      headers=_h(tokens["student"]), timeout=15)
        r = requests.delete(f"{API}/wishlist/TEST_TempCareer", headers=_h(tokens["student"]), timeout=15)
        assert r.status_code == 200
        assert r.json().get("ok") is True
        # Verify gone
        r2 = requests.get(f"{API}/wishlist/me", headers=_h(tokens["student"]), timeout=15)
        titles = [i["career_title"] for i in r2.json()]
        assert "TEST_TempCareer" not in titles

    def test_rbac_non_student(self, tokens):
        for role in ["parent", "counselor", "principal"]:
            r = requests.post(f"{API}/wishlist", json={"career_title": "X"},
                              headers=_h(tokens[role]), timeout=15)
            assert r.status_code == 403, f"{role} POST should be 403 got {r.status_code}"
            g = requests.get(f"{API}/wishlist/me", headers=_h(tokens[role]), timeout=15)
            assert g.status_code == 403, f"{role} GET should be 403"


# --- School wishlists ---
class TestSchoolWishlists:
    def test_counselor_list(self, tokens):
        r = requests.get(f"{API}/school/wishlists", headers=_h(tokens["counselor"]), timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        if data:
            s = data[0]
            assert "user_id" in s
            assert "careers" in s
            assert isinstance(s["careers"], list)

    def test_principal_list(self, tokens):
        r = requests.get(f"{API}/school/wishlists", headers=_h(tokens["principal"]), timeout=15)
        assert r.status_code == 200

    def test_rbac_student(self, tokens):
        r = requests.get(f"{API}/school/wishlists", headers=_h(tokens["student"]), timeout=15)
        assert r.status_code == 403


# --- Career Chat (real AI calls) ---
class TestCareerChat:
    def test_unauth(self):
        r = requests.post(f"{API}/careers/chat",
                          json={"career_title": "Doctor", "question": "hello", "language": "en"},
                          timeout=15)
        assert r.status_code == 401

    def test_chat_english(self, tokens):
        r = requests.post(f"{API}/careers/chat",
                          json={"career_title": "Doctor", "question": "What entrance exams do I need?",
                                "language": "en"},
                          headers=_h(tokens["student"]), timeout=90)
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "")
        assert isinstance(reply, str) and len(reply) > 10
        # Should mention NEET (entrance exam for doctor in India)
        # Not strict — just verify non-empty English text
        assert re.search(r"[A-Za-z]", reply)

    def test_chat_hindi(self, tokens):
        r = requests.post(f"{API}/careers/chat",
                          json={"career_title": "Doctor",
                                "question": "मुझे कौन सी परीक्षाएं देनी होंगी?",
                                "language": "hi",
                                "history": [{"role": "user", "content": "hi"},
                                            {"role": "assistant", "content": "namaste"}]},
                          headers=_h(tokens["student"]), timeout=90)
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "")
        # Devanagari range U+0900-U+097F
        assert re.search(r"[\u0900-\u097F]", reply), f"Expected Devanagari in reply: {reply[:200]}"
