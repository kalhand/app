from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr

from emergentintegrations.llm.chat import LlmChat, UserMessage

# --------- Setup ---------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

app = FastAPI(title="Pathfinder AI")
api = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pathfinder")


# --------- Constants ---------
BOARDS = ["CBSE", "ICSE", "PSEB", "State Board", "IB", "IGCSE", "Other"]
ROLES = ["student", "parent", "counselor", "principal", "admin"]


def nep_stage_for_grade(grade: Optional[str]) -> dict:
    """Return NEP 2020 stage info for a given grade."""
    try:
        g = int(str(grade).strip())
    except Exception:
        return {"stage": "General", "code": "NA", "focus": "Exploration & self-discovery"}
    if 3 <= g <= 5:
        return {"stage": "Preparatory (Grades 3-5)", "code": "PREP",
                "focus": "Play-discovery, activity & foundational skills."}
    if 6 <= g <= 8:
        return {"stage": "Middle (Grades 6-8)", "code": "MID",
                "focus": "Experiential learning, exploring sciences, arts, humanities & vocational tasters."}
    if 9 <= g <= 10:
        return {"stage": "Secondary — Early (Grades 9-10)", "code": "SEC1",
                "focus": "Multidisciplinary study, critical thinking, first vocational internship (as per NEP 2020)."}
    if 11 <= g <= 12:
        return {"stage": "Secondary — Senior (Grades 11-12)", "code": "SEC2",
                "focus": "Choice-based subjects across streams, multiple entry-exit options, career-linked electives."}
    return {"stage": "General", "code": "NA", "focus": "Exploration & self-discovery"}


# --------- Utils ---------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id, "email": email, "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    if not creds:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"password_hash": 0, "_id": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user


def require_roles(*roles):
    async def dep(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(403, f"Requires role: {', '.join(roles)}")
        return user
    return dep


# --------- Models ---------
CategoryType = Literal["personality", "aptitude", "interest", "mental_ability"]
RoleType = Literal["student", "parent", "counselor", "principal"]


class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: RoleType = "student"
    grade: Optional[str] = None
    education_board: Optional[str] = None
    school_name: Optional[str] = None
    linked_student_emails: Optional[List[EmailStr]] = None  # for parent


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class QuestionCreate(BaseModel):
    category: CategoryType
    text: str
    options: List[str] = Field(..., min_length=2, max_length=6)
    trait_map: Optional[List[str]] = None
    correct_index: Optional[int] = None
    grade_levels: Optional[List[int]] = None  # e.g., [9,10,11,12]


class QuestionUpdate(BaseModel):
    category: Optional[CategoryType] = None
    text: Optional[str] = None
    options: Optional[List[str]] = None
    trait_map: Optional[List[str]] = None
    correct_index: Optional[int] = None
    grade_levels: Optional[List[int]] = None


class AnswerItem(BaseModel):
    question_id: str
    selected_index: int


class AssessmentSubmit(BaseModel):
    answers: List[AnswerItem]


class LinkStudentInput(BaseModel):
    student_email: EmailStr


# --------- Startup seeds ---------
DEFAULT_QUESTIONS = [
    # Universal (all grades 8-12)
    {"category": "personality", "text": "At a party, you are most likely to:",
     "options": ["Start conversations with strangers", "Stick with people you know", "Observe from a quiet corner", "Leave early"],
     "trait_map": ["Extraversion", "Balanced", "Introversion", "Introversion"], "grade_levels": [8,9,10,11,12]},
    {"category": "personality", "text": "When faced with a new idea, you:",
     "options": ["Get excited to explore it", "Consider it carefully", "Compare with what you know", "Prefer proven ideas"],
     "trait_map": ["Openness", "Openness", "Balanced", "Conscientiousness"], "grade_levels": [8,9,10,11,12]},
    {"category": "personality", "text": "Your friends would describe you as:",
     "options": ["Reliable and organized", "Fun and spontaneous", "Kind and empathetic", "Ambitious and driven"],
     "trait_map": ["Conscientiousness", "Extraversion", "Agreeableness", "Extraversion"], "grade_levels": [8,9,10,11,12]},
    {"category": "personality", "text": "Under stress you tend to:",
     "options": ["Stay calm and plan", "Talk it out with others", "Withdraw and reflect", "Feel anxious quickly"],
     "trait_map": ["Emotional Stability", "Extraversion", "Introversion", "Neuroticism"], "grade_levels": [8,9,10,11,12]},
    {"category": "personality", "text": "You prefer working:",
     "options": ["Independently on ideas", "In a large team", "In small close groups", "Leading a team"],
     "trait_map": ["Openness", "Extraversion", "Agreeableness", "Extraversion"], "grade_levels": [8,9,10,11,12]},

    {"category": "interest", "text": "Which activity sounds most enjoyable?",
     "options": ["Building or repairing something", "Solving a science puzzle", "Writing a story or painting", "Teaching a friend", "Starting a small business", "Organizing files and data"],
     "trait_map": ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"], "grade_levels": [8,9,10,11,12]},
    {"category": "interest", "text": "In free time you would rather:",
     "options": ["Work on a car / gadget", "Read about space & science", "Make music or art", "Volunteer at a shelter", "Lead a school event", "Plan a detailed schedule"],
     "trait_map": ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"], "grade_levels": [8,9,10,11,12]},
    {"category": "interest", "text": "Your dream Saturday project:",
     "options": ["Outdoor adventure", "Science experiment", "Design a poster", "Mentor kids", "Pitch an idea", "Budget for a trip"],
     "trait_map": ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"], "grade_levels": [8,9,10,11,12]},

    # APTITUDE — Middle (6-10)
    {"category": "aptitude", "text": "If 3x + 5 = 20, what is x?",
     "options": ["3", "5", "7", "15"], "correct_index": 1, "grade_levels": [8,9,10]},
    {"category": "aptitude", "text": "Which number comes next: 2, 6, 12, 20, ?",
     "options": ["28", "30", "32", "26"], "correct_index": 1, "grade_levels": [8,9,10]},
    {"category": "aptitude", "text": "Choose the odd one out:",
     "options": ["Apple", "Banana", "Carrot", "Mango"], "correct_index": 2, "grade_levels": [8,9,10]},
    {"category": "aptitude", "text": "A train travels 60 km in 1 hour. How long to travel 150 km?",
     "options": ["1.5 h", "2 h", "2.5 h", "3 h"], "correct_index": 2, "grade_levels": [8,9,10]},
    {"category": "aptitude", "text": "Synonym of 'Rapid':",
     "options": ["Slow", "Quick", "Loud", "Heavy"], "correct_index": 1, "grade_levels": [8,9,10,11,12]},
    {"category": "aptitude", "text": "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are:",
     "options": ["Lazzies", "Razzies only", "Neither", "Cannot say"], "correct_index": 0, "grade_levels": [8,9,10,11,12]},

    # APTITUDE — Senior (11-12)
    {"category": "aptitude", "text": "The derivative of x^3 with respect to x is:",
     "options": ["3x", "x^2", "3x^2", "x^3/3"], "correct_index": 2, "grade_levels": [11,12]},
    {"category": "aptitude", "text": "If a coin is tossed 3 times, probability of getting at least one head is:",
     "options": ["1/8", "3/8", "1/2", "7/8"], "correct_index": 3, "grade_levels": [11,12]},
    {"category": "aptitude", "text": "Which of these is a persuasive writing technique?",
     "options": ["Rhetorical questions", "Random data", "Simple lists", "Silent inference"], "correct_index": 0, "grade_levels": [11,12]},
    {"category": "aptitude", "text": "'Ephemeral' most nearly means:",
     "options": ["Long-lasting", "Short-lived", "Powerful", "Hidden"], "correct_index": 1, "grade_levels": [11,12]},

    # MENTAL ABILITY
    {"category": "mental_ability", "text": "Which shape completes the pattern? ▲ ● ▲ ● ▲ ?",
     "options": ["▲", "●", "■", "★"], "correct_index": 1, "grade_levels": [8,9,10]},
    {"category": "mental_ability", "text": "'BOOK' is to 'READ' as 'MUSIC' is to:",
     "options": ["Sing", "Listen", "Write", "Play"], "correct_index": 1, "grade_levels": [8,9,10,11,12]},
    {"category": "mental_ability", "text": "Which number is missing? 1, 4, 9, 16, ?, 36",
     "options": ["20", "25", "30", "24"], "correct_index": 1, "grade_levels": [8,9,10]},
    {"category": "mental_ability", "text": "How many minutes are there in a quarter of a day?",
     "options": ["180", "240", "360", "720"], "correct_index": 2, "grade_levels": [8,9,10,11,12]},
    {"category": "mental_ability", "text": "If today is Wednesday, what day is 100 days from now?",
     "options": ["Thursday", "Friday", "Saturday", "Sunday"], "correct_index": 1, "grade_levels": [11,12]},
    {"category": "mental_ability", "text": "In a code, DOG = 4-15-7. What is CAT?",
     "options": ["3-1-20", "3-2-19", "4-1-19", "3-1-19"], "correct_index": 0, "grade_levels": [11,12]},
]


DEMO_USERS = [
    {"role": "admin", "name": "Platform Admin", "email": "admin@pathfinder.ai", "password": "Admin@123"},
    {"role": "student", "name": "Aarav Sharma", "email": "student@pathfinder.ai", "password": "Student@123",
     "grade": "10", "education_board": "CBSE", "school_name": "Demo Public School"},
    {"role": "parent", "name": "Priya Sharma", "email": "parent@pathfinder.ai", "password": "Parent@123",
     "linked_student_emails": ["student@pathfinder.ai"]},
    {"role": "counselor", "name": "Ms. Kaur (Counselor)", "email": "counselor@pathfinder.ai", "password": "Counselor@123",
     "school_name": "Demo Public School"},
    {"role": "principal", "name": "Dr. Verma (Principal)", "email": "principal@pathfinder.ai", "password": "Principal@123",
     "school_name": "Demo Public School"},
]


async def seed_defaults():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.questions.create_index("id", unique=True)
    await db.results.create_index("id", unique=True)

    for u in DEMO_USERS:
        existing = await db.users.find_one({"email": u["email"]})
        if existing:
            # ensure password is aligned with env/seed
            if not verify_password(u["password"], existing.get("password_hash", "")):
                await db.users.update_one({"email": u["email"]}, {"$set": {"password_hash": hash_password(u["password"])}})
            continue
        doc = {
            "id": str(uuid.uuid4()),
            "name": u["name"],
            "email": u["email"].lower(),
            "role": u["role"],
            "password_hash": hash_password(u["password"]),
            "grade": u.get("grade"),
            "education_board": u.get("education_board"),
            "school_name": u.get("school_name"),
            "linked_student_emails": [e.lower() for e in u.get("linked_student_emails", [])],
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(doc)
        logger.info(f"Seeded {u['role']}: {u['email']}")

    if await db.questions.count_documents({}) == 0:
        docs = []
        for q in DEFAULT_QUESTIONS:
            docs.append({
                "id": str(uuid.uuid4()),
                "category": q["category"],
                "text": q["text"],
                "options": q["options"],
                "trait_map": q.get("trait_map"),
                "correct_index": q.get("correct_index"),
                "grade_levels": q.get("grade_levels") or [8,9,10,11,12],
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        await db.questions.insert_many(docs)
        logger.info(f"Seeded {len(docs)} default questions")
    else:
        # Backfill grade_levels for older questions
        await db.questions.update_many(
            {"grade_levels": {"$in": [None, []]}},
            {"$set": {"grade_levels": [8, 9, 10, 11, 12]}},
        )


@app.on_event("startup")
async def startup_event():
    await seed_defaults()


@app.on_event("shutdown")
async def shutdown_event():
    client.close()


# --------- Auth ---------
@api.post("/auth/register")
async def register(payload: RegisterInput):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    if payload.education_board and payload.education_board not in BOARDS:
        raise HTTPException(400, f"Board must be one of: {BOARDS}")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "name": payload.name,
        "email": email,
        "role": payload.role,
        "grade": payload.grade,
        "education_board": payload.education_board,
        "school_name": payload.school_name,
        "linked_student_emails": [e.lower() for e in (payload.linked_student_emails or [])],
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, email, payload.role)
    doc.pop("password_hash", None); doc.pop("_id", None)
    return {"token": token, "user": doc}


@api.post("/auth/login")
async def login(payload: LoginInput):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(user["id"], email, user["role"])
    return {
        "token": token,
        "user": {k: v for k, v in user.items() if k not in ("password_hash", "_id")},
    }


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api.get("/auth/meta")
async def auth_meta():
    return {"boards": BOARDS, "roles": ["student", "parent", "counselor", "principal"]}


# --------- Questions ---------
@api.get("/questions")
async def list_questions(category: Optional[str] = None, grade: Optional[str] = None,
                         user: dict = Depends(get_current_user)):
    q = {}
    if category:
        q["category"] = category
    # Filter by grade if student is requesting and has a grade set
    effective_grade = grade or (user.get("grade") if user.get("role") == "student" else None)
    is_admin = user.get("role") == "admin"
    if effective_grade and not is_admin:
        try:
            g = int(str(effective_grade).strip())
            q["grade_levels"] = g
        except Exception:
            pass
    projection = {"_id": 0} if is_admin else {"_id": 0, "correct_index": 0, "trait_map": 0}
    items = await db.questions.find(q, projection).to_list(1000)
    return items


@api.post("/questions")
async def create_question(payload: QuestionCreate, user: dict = Depends(require_roles("admin"))):
    doc = {
        "id": str(uuid.uuid4()),
        "category": payload.category,
        "text": payload.text,
        "options": payload.options,
        "trait_map": payload.trait_map,
        "correct_index": payload.correct_index,
        "grade_levels": payload.grade_levels or [8, 9, 10, 11, 12],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.questions.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/questions/{qid}")
async def update_question(qid: str, payload: QuestionUpdate, user: dict = Depends(require_roles("admin"))):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(400, "No fields to update")
    res = await db.questions.update_one({"id": qid}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(404, "Question not found")
    doc = await db.questions.find_one({"id": qid}, {"_id": 0})
    return doc


@api.delete("/questions/{qid}")
async def delete_question(qid: str, user: dict = Depends(require_roles("admin"))):
    res = await db.questions.delete_one({"id": qid})
    if res.deleted_count == 0:
        raise HTTPException(404, "Question not found")
    return {"ok": True}


# --------- Assessment ---------
def compute_scores(questions_by_id: dict, answers: List[AnswerItem]) -> dict:
    trait_scores, aptitude_correct, aptitude_total = {}, 0, 0
    mental_correct, mental_total = 0, 0
    answer_log = []
    for ans in answers:
        q = questions_by_id.get(ans.question_id)
        if not q:
            continue
        opts = q.get("options", [])
        if ans.selected_index < 0 or ans.selected_index >= len(opts):
            continue
        cat = q["category"]
        entry = {"question": q["text"], "answer": opts[ans.selected_index], "category": cat}
        if cat in ("personality", "interest"):
            trait_map = q.get("trait_map") or []
            if ans.selected_index < len(trait_map):
                trait = trait_map[ans.selected_index]
                trait_scores[trait] = trait_scores.get(trait, 0) + 1
                entry["trait"] = trait
        elif cat == "aptitude":
            aptitude_total += 1
            if ans.selected_index == q.get("correct_index"):
                aptitude_correct += 1
                entry["correct"] = True
            else:
                entry["correct"] = False
        elif cat == "mental_ability":
            mental_total += 1
            if ans.selected_index == q.get("correct_index"):
                mental_correct += 1
                entry["correct"] = True
            else:
                entry["correct"] = False
        answer_log.append(entry)
    return {"trait_scores": trait_scores,
            "aptitude": {"correct": aptitude_correct, "total": aptitude_total},
            "mental_ability": {"correct": mental_correct, "total": mental_total},
            "answer_log": answer_log}


AI_SYSTEM_PROMPT = """You are Pathfinder AI, an expert career counselor for Indian school students, aligned with India's National Education Policy (NEP) 2020 (multidisciplinary study, choice-based subjects across streams, vocational exposure, multiple entry-exit points).

You analyze psychometric, interest (RIASEC), aptitude and mental-ability data and produce a warm, actionable career report that respects the student's education board (CBSE / ICSE / PSEB / State / IB / IGCSE) and NEP stage (Middle Grades 6-8, Secondary Early 9-10, Secondary Senior 11-12).

Respond ONLY in strict JSON matching this schema:
{
  "summary": "2-3 sentence encouraging summary",
  "personality_analysis": "3-5 sentence analysis of dominant traits",
  "strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "growth_areas": ["area 1", "area 2"],
  "top_careers": [
    {"title": "Career Name", "match_percent": 92, "why": "1-2 sentences", "typical_subjects": ["a", "b"]},
    {"title": "...", "match_percent": 85, "why": "...", "typical_subjects": ["..."]},
    {"title": "...", "match_percent": 78, "why": "...", "typical_subjects": ["..."]}
  ],
  "recommended_stream": "One of: Science (PCM), Science (PCB), Commerce, Humanities/Arts, Vocational — with 1 sentence reasoning tied to the student's board and NEP flexibility",
  "nep_alignment": "2-3 sentences on how this recommendation fits NEP 2020 (multidisciplinary, vocational exposure, choice-based subjects, holistic report card)",
  "board_notes": "1-2 sentences with board-specific tips (e.g., for CBSE: skill electives; for ICSE: project-based work; for PSEB: state scholarship & Punjabi ecosystem; adjust as relevant)",
  "roadmap": [
    {"stage": "Now", "actions": ["a1","a2","a3"]},
    {"stage": "Next", "actions": ["a1","a2"]},
    {"stage": "College & Beyond", "actions": ["a1","a2"]}
  ],
  "path_alignment": "One of: strong, moderate, needs_reflection",
  "encouragement": "One warm closing sentence"
}
No markdown, no code fences, only raw JSON."""


async def ai_analyze(user: dict, scores: dict) -> dict:
    import json
    nep = nep_stage_for_grade(user.get("grade"))
    prompt = f"""Student: {user.get('name')}
Grade: {user.get('grade') or 'N/A'} | Board: {user.get('education_board') or 'N/A'} | School: {user.get('school_name') or 'N/A'}
NEP Stage: {nep['stage']} — Focus: {nep['focus']}

Personality/Interest trait counts:
{json.dumps(scores['trait_scores'], indent=2)}

Aptitude: {scores['aptitude']['correct']} / {scores['aptitude']['total']}
Mental Ability: {scores['mental_ability']['correct']} / {scores['mental_ability']['total']}

Detailed answer log (subset):
{json.dumps(scores['answer_log'][:20], indent=2)}

Tailor roadmap 'stage' labels to the student's NEP stage (e.g., "Grade 9-10 Now", "Grade 11-12 Next", "College & Beyond"). Include NEP 2020 alignment and board-specific tips.

Generate the JSON career report now."""

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"assess-{uuid.uuid4()}",
        system_message=AI_SYSTEM_PROMPT,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    response = await chat.send_message(UserMessage(text=prompt))
    text = response.strip() if isinstance(response, str) else str(response)
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
        text = text.strip()
    try:
        return json.loads(text)
    except Exception as e:
        logger.error(f"AI JSON parse failed: {e}; raw: {text[:400]}")
        return {"summary": "We analyzed your responses.", "personality_analysis": text[:500],
                "strengths": [], "growth_areas": [], "top_careers": [],
                "recommended_stream": "Retry — AI parsing failed.", "nep_alignment": "",
                "board_notes": "", "roadmap": [], "path_alignment": "moderate",
                "encouragement": "Keep exploring!"}


@api.post("/assessment/submit")
async def submit_assessment(payload: AssessmentSubmit,
                            user: dict = Depends(require_roles("student"))):
    if not payload.answers:
        raise HTTPException(400, "No answers provided")
    qids = [a.question_id for a in payload.answers]
    questions = await db.questions.find({"id": {"$in": qids}}).to_list(1000)
    questions_by_id = {q["id"]: q for q in questions}
    scores = compute_scores(questions_by_id, payload.answers)
    ai_report = await ai_analyze(user, scores)

    result_id = str(uuid.uuid4())
    nep = nep_stage_for_grade(user.get("grade"))
    doc = {
        "id": result_id,
        "user_id": user["id"],
        "user_name": user["name"],
        "user_email": user["email"],
        "grade": user.get("grade"),
        "education_board": user.get("education_board"),
        "school_name": user.get("school_name"),
        "nep_stage": nep,
        "scores": scores,
        "ai_report": ai_report,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.results.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.get("/results/me")
async def my_results(user: dict = Depends(require_roles("student"))):
    items = await db.results.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items


@api.get("/results/{rid}")
async def get_result(rid: str, user: dict = Depends(get_current_user)):
    doc = await db.results.find_one({"id": rid}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Result not found")
    role = user["role"]
    if role == "admin":
        return doc
    if role == "student" and doc["user_id"] == user["id"]:
        return doc
    if role == "parent":
        student = await db.users.find_one({"id": doc["user_id"]})
        if student and student.get("email") in (user.get("linked_student_emails") or []):
            return doc
    if role in ("counselor", "principal"):
        if doc.get("school_name") and doc["school_name"] == user.get("school_name"):
            return doc
    raise HTTPException(403, "Forbidden")


# --------- Admin ---------
@api.get("/admin/results")
async def admin_all_results(user: dict = Depends(require_roles("admin"))):
    items = await db.results.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return items


@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_roles("admin"))):
    return {
        "users": await db.users.count_documents({"role": "student"}),
        "questions": await db.questions.count_documents({}),
        "assessments": await db.results.count_documents({}),
    }


# --------- Parent ---------
@api.post("/parent/link")
async def parent_link(payload: LinkStudentInput, user: dict = Depends(require_roles("parent"))):
    email = payload.student_email.lower()
    student = await db.users.find_one({"email": email, "role": "student"})
    if not student:
        raise HTTPException(404, "No student found with that email")
    current = set([e.lower() for e in (user.get("linked_student_emails") or [])])
    current.add(email)
    await db.users.update_one({"id": user["id"]}, {"$set": {"linked_student_emails": list(current)}})
    return {"ok": True, "linked": list(current)}


@api.get("/parent/children")
async def parent_children(user: dict = Depends(require_roles("parent"))):
    emails = [e.lower() for e in (user.get("linked_student_emails") or [])]
    students = await db.users.find({"email": {"$in": emails}, "role": "student"},
                                   {"_id": 0, "password_hash": 0}).to_list(50)
    for s in students:
        results = await db.results.find({"user_id": s["id"]}, {"_id": 0}).sort("created_at", -1).to_list(20)
        s["results"] = results
        s["latest_report"] = results[0]["ai_report"] if results else None
        s["nep_stage"] = nep_stage_for_grade(s.get("grade"))
    return students


# --------- Counselor & Principal (school-scoped) ---------
async def _school_students(school: str):
    return await db.users.find({"role": "student", "school_name": school},
                               {"_id": 0, "password_hash": 0}).to_list(2000)


async def _school_results(school: str):
    return await db.results.find({"school_name": school}, {"_id": 0}).sort("created_at", -1).to_list(2000)


@api.get("/school/overview")
async def school_overview(user: dict = Depends(require_roles("counselor", "principal"))):
    school = user.get("school_name") or ""
    students = await _school_students(school)
    results = await _school_results(school)

    # Stream distribution
    stream_dist = {}
    align_dist = {"strong": 0, "moderate": 0, "needs_reflection": 0}
    board_dist = {}
    grade_dist = {}
    top_careers = {}
    for r in results:
        rep = r.get("ai_report") or {}
        stream = (rep.get("recommended_stream") or "Other").split("—")[0].strip()
        stream_dist[stream] = stream_dist.get(stream, 0) + 1
        a = rep.get("path_alignment") or "moderate"
        if a in align_dist:
            align_dist[a] += 1
        for c in (rep.get("top_careers") or [])[:1]:
            t = c.get("title") or "Other"
            top_careers[t] = top_careers.get(t, 0) + 1
    for s in students:
        b = s.get("education_board") or "Unknown"
        board_dist[b] = board_dist.get(b, 0) + 1
        g = s.get("grade") or "Unknown"
        grade_dist[str(g)] = grade_dist.get(str(g), 0) + 1

    top_career_list = sorted(top_careers.items(), key=lambda x: -x[1])[:5]

    return {
        "school_name": school,
        "student_count": len(students),
        "assessment_count": len(results),
        "stream_distribution": stream_dist,
        "alignment_distribution": align_dist,
        "board_distribution": board_dist,
        "grade_distribution": grade_dist,
        "top_careers": [{"title": t, "count": c} for t, c in top_career_list],
    }


@api.get("/school/students")
async def school_students(user: dict = Depends(require_roles("counselor", "principal"))):
    school = user.get("school_name") or ""
    students = await _school_students(school)
    for s in students:
        latest = await db.results.find_one({"user_id": s["id"]}, {"_id": 0},
                                            sort=[("created_at", -1)])
        s["latest_result"] = latest
        s["nep_stage"] = nep_stage_for_grade(s.get("grade"))
    return students


@api.get("/school/results")
async def school_results(user: dict = Depends(require_roles("counselor", "principal"))):
    school = user.get("school_name") or ""
    return await _school_results(school)


@api.get("/")
async def root():
    return {"message": "Pathfinder AI API", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
