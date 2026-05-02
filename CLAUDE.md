# Project: Nur Academy (IGCSE Islamiyat Exam Prep)

A modern, full-stack AI-powered study companion for IGCSE Islamiyat. Replaced the original monolithic Streamlit app with a decoupled Next.js + FastAPI architecture for cloud scalability.

## Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons (Stitch-generated).
- **Backend:** FastAPI (Python 3.12), Pydantic validation, Uvicorn.
- **AI:** Claude 3.5 Sonnet (Anthropic SDK) for question generation and analysis.
- **Storage:** JSON-based data store in `islamiyat_prep/data/`.

## Running the Project
```bash
./start_nur_academy.sh
```
Starts Backend (Port 8000) and Frontend (Port 5173). Logs errors to `backend.log`.

## Core Backend (FastAPI)
| File | Purpose |
|------|---------|
| `islamiyat_prep/main.py` | Central API server (CORS enabled). |
| `/api/syllabus` | GET: Fetches the structured curriculum. |
| `/api/memorize` | GET: Fetches flashcards with enriched Topic 2 content. |
| `/api/exam/generate` | POST: Creates randomized mock exams. |
| `/api/exam/evaluate` | POST: Grades exams and saves results to student profile. |
| `/api/students/{name}/progress` | GET: Retrieves student history. |

## Core Frontend (Next.js)
| File | Purpose |
|------|---------|
| `nur-academy/src/App.tsx` | Main React logic: View switching (Dashboard, Exam, Memorize). |
| **Exam Engine** | State-driven question navigation with real-time feedback. |
| **Memorize Engine** | Character-by-character typing logic with visual color feedback. |

## Data Schemas
**Memorize Card:** `{id, group_id, group_label, title, arabic, lines[], display_category}`
**Exam Result:** `{student, score, total, percentage, question_results[]}`

## Legacy Reference
The original Streamlit app remains in `islamiyat_prep/app.py` but is no longer the primary interface.
