<div align="center">

# 🎓 RUBRIQ
### **AI-Powered Handwritten Exam Intelligence, Evidence-Based Evaluation & Verified Campus Knowledge Network**

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Build & Tests](https://img.shields.io/badge/Tests-100%25_Passed-success?style=for-the-badge&logo=checkmarx)](https://github.com/vishnupriya759285/rubriq_codex)

<br/>

**Transforming handwritten exam grading from a tedious administrative burden into transparent, evidence-backed learning analytics and active campus peer mentorship.**

[🎥 Video Demo](#-video-demo--walkthrough) • [✨ Live Deployment](#-live-demo--deployment) • [🚀 Key Features](#-key-features) • [📸 Visual Tour](#-visual-tour) • [🏗 Architecture](#-system-architecture) • [⚡ Quick Start](#-quick-start-guide)

---

</div>

<br/>

## 🌟 Executive Summary

In higher education, **over 80% of exams are still handwritten**, requiring dozens of hours of manual grading per assessment. Worse yet, students typically receive only a single numerical score with zero actionable feedback, and learning gaps remain unaddressed until it's too late.

**Rubriq bridges the entire assessment lifecycle:**
1. **Perceives & Transcribes** scanned handwritten answer scripts using multimodal AI with spatial bounding boxes.
2. **Evaluates Against Rubrics** with transparent, page-by-page quoted evidence and confidence scores.
3. **Empowers Teachers** with an authoritative review workbench to override marks, trigger AI re-evaluations, and release feedback.
4. **Calculates Deterministic Analytics** identifying individual and class-wide conceptual weaknesses.
5. **Connects Learning Gaps to Campus Mentors** through an institutionally-verified peer network matching struggling students directly with verified seniors, alumni, and mentors.

---

## 🎥 Video Demo & Walkthrough

> [!TIP]
> **Watch Rubriq in action!** Experience the complete end-to-end journey from uploading handwritten exam batches to teacher review and peer mentor discovery.

<div align="center">

### 📺 Product Demonstration
[![Rubriq Demo Video](https://img.shields.io/badge/▶%20Watch%20Demo%20Video-YouTube%2FLoom-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=REPLACE_WITH_YOUR_VIDEO_URL)

*(Click above or replace `REPLACE_WITH_YOUR_VIDEO_URL` with your recording link)*

**Direct Demo Video URL:**
```text
https://www.youtube.com/watch?v=REPLACE_WITH_YOUR_VIDEO_URL
```

</div>

---

## 🌐 Live Demo & Deployment

| Environment | URL | Details |
| :--- | :--- | :--- |
| **Production Web App** | `https://your-deployment-domain.com` | Next.js 16 standalone frontend |
| **API & OpenAPI Docs** | `https://your-api-domain.com/docs` | FastAPI Swagger interactive explorer |
| **Health & Readiness** | `https://your-api-domain.com/api/health/ready` | Live DB & migration check |

### 🔑 Demo Credentials for Testing

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Institutional Admin** | `admin@rubriq.edu` | `Admin@123456` | Campus network management, mentor badge verification, institutional analytics |
| **Lead Teacher** | `teacher@rubriq.edu` | `Teacher@123456` | Exam authoring, rubric criteria, batch imports, grading workbench, release |
| **Student (Arun)** | `arun.student@rubriq.edu` | `Student@123456` | Released exam evidence, criterion breakdown, concept gap insights, mentor search |
| **Senior Mentor (Arjun)**| `arjun.senior@rubriq.edu` | `Mentor@123456` | Verified probability mentor, student connection requests, anonymous Q&A |

---

## 🚀 Key Features

### 1. 🔍 Evidence-First Handwritten Perception & Grading
- **Spatial Evidence Mapping:** Associates each rubric criterion score directly to visual bounding box coordinates on original scanned exam pages.
- **Multimodal Transcription:** Preserves mathematical notations, step-by-step reasoning, and diagrams beside the original paper.
- **Confidence Scoring:** Automatically tags every decision with an AI confidence rating, highlighting low-confidence answers for human review.

### 2. 👩‍🏫 Human-in-the-Loop Teacher Workbench
- **Total Teacher Authority:** The AI acts as an executive assistant—teachers accept, modify, or reject any mark.
- **Side-by-Side Review Workbench:** Dual-pane interface with original handwriting on the left and transcription, criteria breakdown, and evidence quotes on the right.
- **Audit-Logged Overrides:** Full tracking of human changes with custom teacher notes and override timestamps.
- **Batch Google Drive Import:** One-click bulk ingestion of PDFs and images straight from Google Drive folders.

### 3. 📊 Deterministic Learning Analytics
- **Granular Gap Analysis:** Computes student, class, question, and criterion mastery percentages deterministically (no hallucinations).
- **Concept Taxonomy:** Maps rubric criteria to core concept tags (e.g., *Probability*, *Dynamic Programming*, *Calculus*), revealing class-wide conceptual bottlenecks.

### 4. 🤝 Verified Campus Knowledge Network (The Superpower)
- **Automatic Gap-to-Mentor Matching:** Uses semantic and concept-based matching to pair students struggling with specific topics to verified mentors.
- **Institutional Admin Verification:** Senior students and alumni apply for topic expertise with institutional proof; badges are audited and approved by admins.
- **Anonymous Doubt Resolution:** Students ask questions without academic anxiety; mentors respond publicly or initiate 1-on-1 guidance.
- **Persistent Real-Time Connections:** Built-in connection request workflow and persistent threaded chat for continued academic support.

---

## 📸 Visual Tour

<div align="center">

### 1. Evidence-Based Teacher Review Workbench
*Side-by-side handwriting inspection with transcription, rubric criteria, and confidence signals.*
![Rubriq Evidence Review Workbench](docs/assets/screenshots/review-workbench.png)

<br/>

### 2. Deep Exam Analytics & Performance Insights
*Class-wide score distributions, question difficulty index, and concept mastery curves.*
![Exam Analytics & Insights](docs/assets/screenshots/exam-insights.png)

<br/>

### 3. Class & Assessment Management
*Roster tracking, submission processing queues, and exam publication lifecycle.*
![Assessment Workspace](docs/assets/screenshots/dashboard.png)

<br/>

### 4. Student Evidence Portal & Campus Network
*Students inspect their graded scripts, review criteria breakdowns, and discover verified peer mentors.*

| Student Released Paper | Verified Campus Mentors |
| :---: | :---: |
| ![Student Script](docs/assets/screenshots/exam-detail.png) | *[Add your Screenshot: `docs/assets/screenshots/campus-network.png`]* |

</div>

---

## 🏗 System Architecture

```text
                                  +---------------------------------------+
                                  |         Next.js 16 (App Router)       |
                                  |  - Teacher Assessment Workbench       |
                                  |  - Student Evidence Portal            |
                                  |  - Campus Knowledge & Mentor Network  |
                                  +-------------------+-------------------+
                                                      |
                                             Reverse Proxy / API
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |           FastAPI Core Engine         |
                                  |  - Opaque Session & CSRF Security     |
                                  |  - Role-Based Access Control          |
                                  |  - Async Evaluation Pipeline          |
                                  |  - Campus Network Matching Engine     |
                                  +----+---------------+-------------+----+
                                       |               |             |
                 +---------------------+               |             +--------------------+
                 v                                     v                                  v
+---------------------------------+  +-------------------------------+  +---------------------------------+
|        PostgreSQL Engine        |  |        OpenAI Vision API      |  |     Durable File Storage        |
|  - Relational Schema (Alembic)  |  |  - Multimodal Page Perception |  |  - Original PDF/Image Scans     |
|  - Evidence Coordinates         |  |  - Rubric Structured Output   |  |  - Normalized Clean Page PNGs   |
|  - Verified Mentor Badges       |  |  - Concept Detection          |  |  - Quoted Evidence Crops        |
|  - Connections & Messages       |  +-------------------------------+  +---------------------------------+
+---------------------------------+
```

---

## 🛠 Tech Stack & Engineering Standards

| Area | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (Turbopack) & React 19 | Server & client component separation, standalone output for Docker |
| **Styling & Design** | Tailwind CSS v4 & Modern Clean UI | High visual polish, accessible contrast, responsive cards & drawer animations |
| **Backend API** | FastAPI 0.115 & Python 3.13 | High-performance asynchronous execution, native Pydantic v2 validation |
| **Database & ORM** | PostgreSQL & SQLAlchemy 2.0 | Transactional integrity, ACID compliance, structured evidence storage |
| **Migrations** | Alembic | Version-controlled schema migrations with singleton advisory locking |
| **AI Evaluation** | OpenAI GPT-4o Multimodal API | Structured outputs for perceptual transcription and rubric reasoning |
| **Document Processing**| PyMuPDF & Pillow | High-fidelity page extraction and conservative orientation normalization |
| **Code Quality** | Biome & Pytest | Strict formatting, linting, and automated unit/integration test coverage |

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js 22+**
- **Python 3.13+**
- **Git**
- **OpenAI API Key** (for multimodal grading features)

### 1. Clone & Set Up Backend

```bash
# Clone the repository
git clone https://github.com/vishnupriya759285/rubriq_codex.git
cd rubriq_codex/backend

# Create & activate Python virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python -m app.migrate

# Start FastAPI server (Port 8000)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Set Up Frontend

```bash
# Open a second terminal and navigate to frontend
cd rubriq_codex/frontend

# Install dependencies
npm ci

# Start Next.js development server (Port 3000)
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🧪 Testing & Validation

Rubriq is built with rigorous automated testing covering data models, grading logic, migrations, and live user flows.

```bash
# Run backend pytest suite (all 23 unit tests)
cd backend
python -m pytest

# Run comprehensive 22-step live integration test
python tests/test_campus_network_flow.py

# Run frontend production build validation
cd ../frontend
npm run build
```

**Verification Results:**
- ✅ **23 of 23 pytest test cases passing**
- ✅ **22 of 22 campus network live integration steps passing** with 100% database persistence
- ✅ **Next.js production build succeeds with exit code 0** across all 18 routes

---

## 🐳 Docker Deployment

Both services include optimized container definitions ready for any cloud provider (AWS ECS, GCP Cloud Run, DigitalOcean, Render, or self-hosted VPS).

### Backend Container
```bash
docker build -t rubriq-backend:latest backend
docker run -d -p 8080:8080 \
  -e DATABASE_URL=postgresql+psycopg://user:pass@postgres:5432/rubriq \
  -e OPENAI_API_KEY=your-key \
  -e SESSION_SECRET=your-32-character-secret \
  rubriq-backend:latest
```

### Frontend Container
```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://rubriq-backend:8080/api \
  -t rubriq-frontend:latest frontend
docker run -d -p 3000:3000 rubriq-frontend:latest
```

---

## 🔐 Security & Privacy Practices

- **Zero-Exposure Policy:** Environment files (`.env`, `*.env.*`) and credentials are strictly ignored in `.gitignore` and `.dockerignore`.
- **Opaque Session Tokens:** Uses HTTP-only, secure, `SameSite=Lax` cookies with cryptographically signed tokens—no raw JWTs stored in browser localStorage.
- **CSRF Defense:** Enforces strict header-based CSRF validation (`X-CSRF-Token`) for all mutating HTTP requests.
- **Student Data Privacy:** Students can only view their own finalized, released evaluations. Unreleased teacher drafts remain strictly private.

---

## 📖 Documentation Index

- [Product Architecture](docs/reference/architecture.md)
- [API Endpoints Reference](docs/reference/api.md)
- [Teacher Workflow Guide](docs/guides/teacher-guide.md)
- [Local Development Guide](docs/guides/local-development.md)
- [Deployment Runbook](docs/operations/deployment.md)
- [Security & Compliance](docs/operations/security.md)

---

<div align="center">

**Built with ❤️ for teachers and students everywhere.**

[⭐ Star on GitHub](https://github.com/vishnupriya759285/rubriq_codex) • [Report an Issue](https://github.com/vishnupriya759285/rubriq_codex/issues)

</div>
