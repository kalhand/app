# Scope of Work — PathfinderAiClub

**Version:** 1.0
**Date:** February 2026
**Project:** PathfinderAiClub — AI-Powered Career Guidance Platform for Schools
**Environments:** Preview (dev) + Production — https://pathfinderaiclub.com

---

## 1. Executive Summary

PathfinderAiClub is a multilingual, invite-only career guidance SaaS platform that helps school students (Grades 8–12) discover their ideal career path through AI-driven psychometric, aptitude, interest, and mental-ability assessments. The platform serves six distinct user roles across a hierarchical invite chain and delivers personalized AI reports in **English, Hindi, and Punjabi** (native scripts), aligned with **NEP 2020** guidelines.

---

## 2. Objectives

1. Provide students a scientifically grounded, AI-analyzed career discovery experience in their native language.
2. Enable schools (universities, principals, counselors) to deploy the platform via a controlled invite chain.
3. Give parents visibility into their child's progress.
4. Deliver actionable, exportable insights (PDF certificates, career deep-dives, AI chat).
5. Support white-label branding per institution.

---

## 3. User Roles & Permissions

| Role | Access | Provisioned By |
|---|---|---|
| **Admin (Platform)** | Full platform control; creates University accounts; manages question bank | System seed |
| **University** | Onboards Principals; manages branding (logo, colors, tagline); cohort dashboards | Admin |
| **Principal** | Onboards Counselors; school-wide dashboard & analytics | University |
| **Counselor** | Bulk-creates Students + Parents; views school reports; runs AI counsellor chat | Principal |
| **Student** | Takes assessment; views AI report; career wishlist; PDF certificate; regenerates report in preferred language | Counselor (auto-provisioned) |
| **Parent** | Read-only view of linked child's report | Counselor (paired with Student) |

Public registration is **disabled** — the platform is strictly invite-driven.

---

## 4. Functional Scope

### 4.1 Authentication & Onboarding
- JWT-based custom authentication (bcrypt password hashing)
- Invite-code system with hierarchy enforcement (Admin → University → Principal → Counselor → Student)
- Login / logout / `/me` session endpoint
- Password change; auto-generated temp passwords for batch-created students/parents

### 4.2 Assessment Engine
- **4 question categories:** Personality, Aptitude, Interest (RIASEC), Mental Ability
- Grade-band filtering (8–12) so students see age-appropriate questions
- Single-question flow with progress bar and micro-animations
- Language selector (English / Hindi / Punjabi) — questions rendered in native script
- Admin CRUD on question bank with per-option trait mapping

### 4.3 AI Report Generation
- Claude Sonnet 4.5 via Emergent Universal LLM Key (`emergentintegrations`)
- Structured JSON output: summary, personality analysis, strengths, growth areas, top 3 careers with % match, recommended stream, 3-stage roadmap, path alignment, encouragement
- Report rendered in the student's chosen language (native script)
- **Regenerate** report in a new language at any time
- Radar chart visualisation and stream distribution graphs

### 4.4 Career Explorer
- Native-script career titles and deep-dive descriptions
- AI Chat ("Ask about this career") powered by Claude
- Career Wishlist — save careers of interest
- Top-3 careers pulled directly from AI report

### 4.5 PDF Certificate
- Downloadable, printable certificate showing student's top career recommendation
- Includes co-branded institution logo & tagline

### 4.6 University White-Labelling
- Per-university branding: logo URL, headline color, tagline
- Applied to student report banner, invite landing, certificates

### 4.7 Dashboards & Analytics
- **Admin:** platform stats, all-institution overview, question bank management
- **University:** principals list, cohort roll-up, branding management
- **Principal:** School dashboard — students, assessments, stream distribution, board distribution, top careers, alignment metrics (NEP 2020 action list)
- **Counselor:** Counselor Console — same data as Principal + Add Student + Parent flow, credential copy-to-clipboard
- **Parent:** view child's report only

### 4.8 Cohort Comparison
- Compare classes, schools, and streams
- Visual bar / stacked charts (Recharts)

---

## 5. Non-Functional Scope

| Area | Standard |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Shadcn UI, Neo-Brutalist + pastel design system |
| **Backend** | FastAPI, Motor (async MongoDB), Pydantic v2, `PyObjectId` pattern |
| **Database** | MongoDB (users, questions, results, wishlists, invites, universities/branding) |
| **AI** | Claude Sonnet 4.5 via `emergentintegrations` (Emergent Universal Key) |
| **Auth** | JWT + bcrypt |
| **Languages** | English, Hindi, Punjabi (UI + AI output in native scripts) |
| **Deployment** | Preview + Production (https://pathfinderaiclub.com) |
| **Accessibility** | Data-testid on all interactive elements; keyboard-friendly forms |
| **Compliance context** | NEP 2020 counsellor action lists baked into UI |

---

## 6. Key API Endpoints (delivered)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Student self-register (only via invite) |
| POST | `/api/auth/login` | JWT login |
| GET | `/api/me` | Current user |
| POST | `/api/invites` | Generate role-appropriate invite code |
| POST | `/api/counselor/students` | Batch-create student + parent |
| GET | `/api/school/overview` | Principal/Counselor dashboard data |
| POST | `/api/assessment/submit` | Trigger AI report generation |
| POST | `/api/careers/chat` | AI Q&A about a career |
| PUT | `/api/university/branding` | Update institution branding |

---

## 7. Data Model (delivered)

- **users** — `{ id, name, email, hashed_password, role, organization_name, grade, education_board, language_pref, parent_email, student_id }`
- **questions** — `{ id, text, category, options[], grades[], required_roles[] }`
- **results** — `{ id, user_id, answers, ai_analysis, recommended_careers[], language, generated_at }`
- **wishlists** — `{ id, user_id, career_title, saved_at }`
- **invites** — `{ id, code, role, inviter_id, school_name, used, created_at }`
- **universities / branding** — `{ university_id, university_name, logo_url, headline_color, tagline }`

---

## 8. Third-Party Integrations

| Service | Purpose | Status | Key Source |
|---|---|---|---|
| **Claude Sonnet 4.5** | AI reports & career chat | ✅ Live | Emergent Universal Key |
| **Resend / SendGrid** | Invite email delivery | ⏳ Pending | User-provided API key |

---

## 9. Deliverables

- ✅ Full-stack web application (React + FastAPI + MongoDB)
- ✅ Six-role RBAC + invite chain
- ✅ Multilingual assessment (English, Hindi, Punjabi)
- ✅ Claude-powered AI reports + AI career chat
- ✅ PDF certificate download
- ✅ White-labelling per institution
- ✅ Admin question CRUD + platform dashboards
- ✅ Cohort comparison + NEP 2020 action lists
- ✅ Seed: Rayat Bahara University + Admin credentials
- ✅ Production deployment (pathfinderaiclub.com)

---

## 10. Out of Scope (current phase)

- Real-time notifications / push
- Mobile-native apps (iOS/Android)
- SMS-based invites
- Payment / subscription billing
- Multi-tenant isolation beyond invite-hierarchy
- LMS integrations (Moodle, Google Classroom)

---

## 11. Roadmap — Next Increments

### P1 (High priority)
- 🎨 **Co-branded Invite Landing** — welcome page at `/invite/:code` with school logo + inviter name
- 📧 **Real Invite Email Delivery** — Resend or SendGrid integration (needs API key)
- 🖼️ **Rayat Bahara Real Logo** — replace placeholder with official crest

### P2 (Medium priority)
- 🗓️ Class timeline & assessment reminders
- 📝 Audit trail for invitations
- 📅 On-demand counselor session booking
- 📊 Percentile benchmarking across cohorts
- 📥 Bulk question CSV import for admins

### P3 (Nice to have)
- Adaptive difficulty / question randomization
- Report retake versioning & history diff
- Aggregated national/regional benchmark dashboards

---

## 12. Assumptions & Dependencies

- Emergent Universal LLM Key remains funded (auto-topup recommended).
- Institutions provide their own logo URLs for branding.
- Email provider API key must be supplied by the client to enable real invite emails.
- Users have modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions).

---

## 13. Success Criteria

- Students in Grades 8–12 complete assessments in under 20 minutes.
- AI report generation succeeds in ≥ 98% of submissions.
- Invite chain enforces role hierarchy 100% of the time.
- Multilingual reports render correctly across all three languages.
- Testing agent regression: ≥ 95% pass rate on each iteration.

---

*Prepared for: PathfinderAiClub stakeholders*
*Prepared by: Emergent Build Agent (E1)*
