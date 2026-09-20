# Rubriq — Assessment Intelligence Platform

> AI-powered examination evaluation, rubric formulation, evidence review, and learning intelligence platform.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Tests](https://img.shields.io/badge/Tests-100%25_Passed-success?style=for-the-badge&logo=checkmarx)](https://github.com/vishnupriya759285/rubriq_codex)

---

## 🎥 Video Demo & Walkthrough

> [!TIP]
> **Watch Rubriq in action!** Experience the complete workflow from question paper import and AI evidence grading to campus peer mentorship.

[![Rubriq Demo Video](https://img.shields.io/badge/▶%20Watch%20Demo%20Video-YouTube%2FLoom-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=REPLACE_WITH_YOUR_VIDEO_URL)

**Direct Demo Video URL:**
```text
https://www.youtube.com/watch?v=REPLACE_WITH_YOUR_VIDEO_URL
```

---

## 🚀 Overview

Rubriq is an AI-powered assessment intelligence platform designed to reduce the manual workload involved in evaluating student examination papers while keeping educators in control of the final assessment.

The platform connects the complete assessment workflow:

**Question Paper → Answer Key → Rubric → Student Papers → AI Evaluation → Evidence Review → Results → Learning Insights**

Rubriq also extends assessment beyond grading by connecting identified learning gaps with verified people within the institution who can help students improve.

---

## 🎯 Key Features

### 1. AI-Assisted Examination Evaluation
- Upload question papers
- Upload answer keys / marking schemes
- Automatically formulate evaluation rubrics
- Process student answer papers
- Handwriting/document processing
- AI-assisted scoring

### 2. Evidence-Based Teacher Review
- View the student's scanned answer
- View AI-generated evaluation rationale
- Review evidence behind each score
- Teacher can override AI-generated scores
- Maintain educator control over final results

### 3. Student Portal
- View examination results
- View marks and feedback
- Identify learning gaps
- Understand weak concepts
- Track learning progress

### 4. Campus Knowledge Network

Rubriq connects students with people inside their institution who can help them learn.

Students can:

- Ask questions
- Search for verified experts
- Find seniors, faculty, alumni, or peers based on expertise
- Ask questions anonymously or with their identity
- Send connection requests
- Communicate with connected users
- Get guidance based on identified learning gaps

### 5. AI-Powered "Who Can Help Me?"

Instead of simply telling a student what they got wrong, Rubriq can help answer:

> **"Who can help me improve this?"**

The system uses assessment concepts and verified expertise to connect students with relevant people.

### 6. Admin Verification

Administrators can:

- Verify users
- Verify expertise
- Manage roles
- Manage campus profiles
- Control access
- Maintain institutional trust

---

## 🏗️ System Architecture

```text
                    ┌──────────────────┐
                    │   Question Paper │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Answer Key     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ AI Rubric Engine │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Student Papers   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ AI Evaluation    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Evidence Review  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Learning Gaps    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Campus Network   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Human Guidance   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Skill Growth     │
                    └──────────────────┘
```

---

## 📸 Visual Tour & Screenshots

*Attach and review your application screenshots below:*

### 1. Evidence-Based Teacher Review Workbench
*Side-by-side student handwriting inspection, AI rationale, and rubric scoring.*
![Evidence Review Workbench](docs/assets/screenshots/review-workbench.png)

### 2. Learning Analytics & Performance Insights
*Question difficulty index, score distributions, and conceptual weak points.*
![Learning Insights](docs/assets/screenshots/exam-insights.png)

### 3. Assessment & Examination Dashboard
*Class cohorts, paper upload queues, and grading progress.*
![Assessment Workspace](docs/assets/screenshots/dashboard.png)

### 4. Student Portal & Campus Knowledge Network
*Students inspect their released paper feedback and connect with verified mentors.*

| Student Examination Feedback | Campus Knowledge Network |
| :---: | :---: |
| ![Student Script Review](docs/assets/screenshots/exam-detail.png) | *[Add Screenshot: `docs/assets/screenshots/campus-network.png`]* |

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Institutional Admin** | `admin@rubriq.edu` | `Admin@123456` | Campus network management, mentor badge approvals, institutional analytics |
| **Lead Teacher** | `teacher@rubriq.edu` | `Teacher@123456` | Exam creation, rubric formulation, paper evaluation, review workbench, release |
| **Student (Arun)** | `arun.student@rubriq.edu` | `Student@123456` | Released examination feedback, learning gap breakdown, mentor discovery |
| **Senior Mentor (Arjun)**| `arjun.senior@rubriq.edu` | `Mentor@123456` | Verified peer mentor profile, incoming student connection requests, anonymous Q&A |

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.13+
- Node.js 22+
- Git

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/vishnupriya759285/rubriq_codex.git
cd rubriq_codex/backend

# Set up virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies & run migrations
pip install -r requirements.txt
python -m app.migrate

# Launch API server (Port 8000)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd rubriq_codex/frontend

# Install dependencies
npm ci

# Start Next.js development server (Port 3000)
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing & Validation

```bash
# Run backend test suite (23 unit tests)
cd backend
python -m pytest

# Run full 22-step campus network integration flow
python tests/test_campus_network_flow.py

# Run frontend production build
cd ../frontend
npm run build
```

- **Backend Pytest:** 23/23 tests passing (100%)
- **Campus Network Flow:** 22/22 steps verified with full persistence
- **Frontend Build:** Next.js production build exits with code 0

---

## 🛡️ Security & Privacy
- **Zero-Exposure:** All `.env` and sensitive configurations are strictly excluded from git tracking.
- **Server Sessions:** Opaque, HTTP-only, secure cookies with cryptographic signatures.
- **CSRF Defense:** Header-based CSRF protection (`X-CSRF-Token`) across all mutating API calls.
- **Role Isolation:** Strict separation between Admin, Teacher, and Student permissions.

---

<div align="center">

**Rubriq — Transforming Examination Assessment into Institutional Growth.**

[GitHub Repository](https://github.com/vishnupriya759285/rubriq_codex) • [Submit an Issue](https://github.com/vishnupriya759285/rubriq_codex/issues)

</div>
