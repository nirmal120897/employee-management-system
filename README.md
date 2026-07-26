# Staff Attendance Management System

Full-stack application with JWT authentication, role-based access control (RBAC), attendance tracking, real-time updates via Socket.IO, and an AI-powered RAG assistant (built on local Ollama models) for company policy Q&A and semantic employee search.


---

## Prerequisites

- Node.js 18+
- Docker Desktop (used only to run Postgres+pgvector — nothing else needs Docker)
- [Ollama](https://ollama.com) installed locally

---

## 1. Database Setup (PostgreSQL + pgvector)

pgvector must be compiled from source on native Windows/Mac Postgres installs, which is error-prone. The reliable way is running Postgres with pgvector pre-built via Docker:

```bash
docker run --name attendance-pg \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=attendance_db \
  -p 5433:5432 \
  -d pgvector/pgvector:pg16
```

Enable the extension (one-time):
```bash
docker exec -it attendance-pg psql -U postgres -d attendance_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

**Start/stop later:**
```bash
docker start attendance-pg
docker stop attendance-pg
```

---

## 2. AI Setup (Ollama)

Install Ollama from [ollama.com](https://ollama.com), then pull the two models used by this project:

```bash
ollama pull nomic-embed-text
ollama pull llama3.2
```

Ollama runs a local server automatically at `http://localhost:11434`. Confirm it's running:
```bash
ollama list
```

No API key, no cost — everything runs locally.

---

## 3. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:mypassword@localhost:5433/attendance_db"

# JWT
JWT_ACCESS_SECRET="replace_with_strong_random_secret"
JWT_REFRESH_SECRET="replace_with_another_strong_random_secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Server
PORT=5000
CLIENT_URL="http://localhost:5173"

# Text Chunking (RAG pipeline)
CHUNK_SIZE=900
CHUNK_OVERLAP=175

# AI (Ollama - local, free)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_CHAT_MODEL=llama3.2

# Default Admin (auto-created on first server start)
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=Admin@12345
```

Run migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

Start the server:
```bash
npm run dev
```

**A default Admin account is created automatically on first boot** using the `ADMIN_*` values above — no manual signup needed to get started. On every subsequent restart, the seed script checks if an Admin already exists and skips re-creating one.

---

## 4. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Visit `http://localhost:5173`.

---

## Default Access (for quick testing)

| Field | Value |
|---|---|
| URL | `http://localhost:5173/login` |
| Email | value of `ADMIN_EMAIL` in `.env` (e.g. `admin@company.com`) |
| Password | value of `ADMIN_PASSWORD` in `.env` (e.g. `Admin@12345`) |

Log in as this Admin to create Managers and Staff from the **Users** page — Managers can then log in and create their own Staff from the **Staff** page.

---

## API Overview

| Module | Base Route |
|---|---|
| Authentication | `/api/auth` |
| User Management (RBAC) | `/api/users` |
| Attendance | `/api/attendance` |
| Documents (Upload/Parse/Chunk/Embed/Ask) | `/api/documents` |
| Employee Semantic Search | `/api/employee-profiles` |

All routes except `/api/auth/register` and `/api/auth/login` require:
---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | PostgreSQL + Prisma ORM |
| Vector Database | PostgreSQL + pgvector extension |
| Authentication | JWT (access + refresh tokens) |
| Real-time | Socket.IO |
| File Handling | Multer (PDF upload), pdf-parse (text extraction) |
| AI / RAG | Ollama (local, free) — `nomic-embed-text` for embeddings, `llama3.2` for chat |
| Frontend | React (Vite), React Router, Axios, Bootstrap |
| Validation | express-validator |

---

## Roles & Permissions

| Feature | Admin | Manager | Staff |
|---|---|---|---|
| Create users | Any role | Staff only (auto-assigned to self) | — |
| Update users | Any user | Own staff only | — |
| Delete users | ✅ | ❌ | ❌ |
| Assign manager to staff | ✅ | ❌ | ❌ |
| View attendance | All records | Own staff only | Own only |
| Check-in / Check-out | — | — | ✅ |
| Upload company documents (PDF) | ✅ | ❌ | ❌ |
| Ask AI about company policies | ✅ | ✅ | ✅ |
| Semantic employee search | ✅ | ✅ | ❌ |

---

## Architecture

Backend follows a clean layered pattern throughout every module (Auth, RBAC, Attendance, Documents, AI):