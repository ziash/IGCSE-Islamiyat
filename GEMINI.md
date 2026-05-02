# Nur Academy: Foundational Manual

## 🎯 Vision
To provide a premium, modern, and highly effective AI-powered study environment for IGCSE Islamiyat students, combining deep traditional knowledge with cutting-edge UX/UI.

## 🏛️ Architectural Mandates
1.  **Decoupled & Scalable:** Keep the Frontend (Next.js) and Backend (FastAPI) strictly separated to allow independent scaling on Google Cloud Run.
2.  **API-First Logic:** All business logic, AI interactions, and file I/O must reside in the FastAPI backend. The frontend should be a stateless visual engine.
3.  **Strict Validation:** Use Pydantic models for all API requests and responses to ensure data integrity.
4.  **Persistent Storage:** Continue using JSON-based storage in `islamiyat_prep/data/` for simplicity and portability, while ensuring robust path handling.

## 🛠️ Key Functionalities & Implementation
### 1. The Memorize Engine (Interactive Typing)
- **Logic:** Character-by-character matching between student input and reference text.
- **Visuals:** 
    - `text-slate-400`: Untyped characters.
    - `text-emerald-700 font-bold`: Correctly typed.
    - `text-red-500 bg-red-100`: Typos.
    - `animate-pulse`: Active cursor position.
- **State:** Managed via `typedLines` array and `activeLineIdx` in React.

### 2. The Exam Engine (Dynamic Generation)
- **Generation:** API filters the full question bank based on student selection and returns a randomized subset.
- **Navigation:** Integrated "Question Map" allowing instant jumps across the exam paper.
- **Evaluation:** Automated scoring of MCQs; result objects saved to student history as JSON attempts.

### 3. Content Enrichment
- **Topic 2:** Significantly expanded from detailed study guide PDF. Includes 11 cards covering Revelation, Preservation, Compilation, and Authority of the Quran.
- **Standardization:** All em-dashes (`—`) and en-dashes (`–`) replaced with simple hyphens (`-`) for keyboard ease.

## 🚀 Development Roadmap
- [ ] **Social Auth:** Implement NextAuth.js (Auth.js) with Google/Facebook providers.
- [ ] **Mobile Optimization:** Further refine the "Typer" for virtual mobile keyboards.
- [ ] **AI Feedback:** Port the Claude-powered exam analysis logic into a dedicated `/api/exam/analyze` endpoint.
- [ ] **Deployment:** Create Dockerfiles for both frontend and backend for Google Cloud Run deployment.
