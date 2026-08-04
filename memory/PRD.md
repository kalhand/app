# Pathfinder AI — PRD

## Original Problem Statement
Build an app for school students — a psychometric questionnaire that assesses whether they are choosing the right career path or not, and suggests what would be the ideal path for them. AI implementation with great UI. Provide basic mental and aptitude questions. Provide admin capability to add questions & answers. AI does the calculation.

## Architecture
- Backend: FastAPI + MongoDB (Motor) at /api
- Frontend: React + Tailwind + Shadcn (Neo-Brutalist + Pastel design)
- Auth: JWT-based (student & admin roles), bcrypt password hashing
- AI: Claude Sonnet 4.5 via Emergent Universal LLM Key (emergentintegrations)

## User Personas
- **Student (Grades 8–12)**: register, take assessment, view AI report, view past reports
- **Admin**: view all student results, CRUD questions across 4 categories

## Core Requirements (static)
- 4 question categories: personality, aptitude, interest (RIASEC), mental_ability
- AI-generated career report: summary, personality analysis, strengths, growth areas, top 3 careers with % match, recommended stream, 3-stage roadmap, path alignment, encouragement
- Admin can add/edit/delete questions with per-option trait mapping (personality/interest) or correct index (aptitude/mental_ability)

## Implemented (2026-02)
- JWT auth (register, login, /me) with admin seeding (admin@pathfinder.ai / Admin@123)
- 18 default seeded questions across 4 categories
- Student flow: Landing → Register/Login → Dashboard → Assessment (single-question, progress bar, animation) → AI Report (top careers, radar chart, roadmap)
- Admin flow: Dashboard (stats) → Question CRUD modal → All Results table
- Claude Sonnet 4.5 report generation with strict JSON schema

## Backlog / Next
- P1: Retake logic and question versioning
- P1: Export report as PDF / share link
- P1: Parent / counselor role
- P2: Aptitude score-based percentile benchmarking across cohort
- P2: Bulk question CSV import for admins
- P2: Question randomization + adaptive difficulty
