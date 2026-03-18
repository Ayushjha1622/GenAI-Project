# GenAI Project

Enterprise-ready AI-powered interview coaching platform. Built as a modular full-stack app with a secure Node.js backend, AI generation layer, and React dashboard for applicants.

## 🌐 Product Summary

This project helps candidates generate structured interview playbooks and professional resumes using AI:
- Converts JD + resume + self-description into:
  - Interview questions (technical + behavioral)
  - Actionable skill gaps and match score
  - Day-by-day preparation roadmap
- Persisted interview reports per user
- PDF resume generation pipeline (AI HTML -> Puppeteer PDF)

## 🏗️ Architecture

```
React (Vite) Frontend
   ↕ API (Axios)
Express Backend (Node.js)
   ↕ MongoDB
OpenAI/Gemini AI + Puppeteer (PDF generator)
```

### Backend Modules
- `server/server.js` — server launcher
- `src/app.js` — middleware, CORS, route wiring
- `src/routes/interview.routes.js` — interview/summary/resume endpoints
- `src/controllers/interview.controller.js` — controllers + security
- `src/services/ai.service.js` — AI prompt generation & HTML-to-PDF converter
- `src/models` — Mongoose models for users/interview reports

### Frontend Modules
- `FrontEnd/src/main.jsx` — app bootstrapping
- `FrontEnd/src/auth` — login/register + protected routes
- `FrontEnd/src/interview` — report generation, display, PDF download
- `FrontEnd/src/interview/Hooks/useInterview.js` — API hooks + download logic
- `FrontEnd/src/interview/pages/Interview.jsx` — interview dashboard UI

## 🧩 Core Features

- JWT-auth protected endpoints
- Resume upload + AI report creation
- Interview report retrieval by ID
- Byte-stream PDF resume generation with correct `responseType: blob`
- Download resume button in the interview dashboard

## ⚙️ Setup (Local Dev)

### 1) Backend

```bash
cd Backend
npm install
# create .env file
# MONGO_URI=<mongo_uri>
# JWT_SECRET=<secret>
# GOOGLE_GENAI_API_KEY=<key>
npm start
```

Server defaults to `http://localhost:3000`.

### 2) Frontend

```bash
cd FrontEnd
npm install
npm run dev
```

Open Vite URL (`http://localhost:5173` or `5174`).

## 🚀 Run Flow

1. Register and login.
2. Submit job description + self description + resume on home page.
3. Generate report.
4. Open generated report at `/interview/:interviewId`.
5. Click **Download Resume**.

## ✅ Resume Download Fix (Current Production Behavior)

### Root cause addressed
- API call incorrectly passed `interviewReportId` before; now passes an object to match service signature.
- CORS now includes both frontend dev ports.
- Download logic now handles blob with URL creation and object URL revocation.

### Implementation pointers
- `FrontEnd/src/interview/services/Interview.api.js`: `responseType: 'blob'`
- `FrontEnd/src/interview/Hooks/useInterview.js`: `generateResumePdf({ interviewReportId })`
- `Backend/src/controllers/interview.controller.js`: sends PDF buffer with `Content-Type: application/pdf`.

## 🧪 API Contract

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Interview
- `POST /api/interview` (multipart/form-data: jobDescription, selfDescription, resume)
- `GET /api/interview/report/:interviewId`
- `GET /api/interview` (user’s reports)
- `POST /api/interview/resume/pdf/:interviewReportId` (protected)

## 🔒 Security Notes

- Endpoints require auth JWT (from login token).
- Resume download and report retrieval enforce user ownership.
- Keep `.env` secrets out of repo.

## 🧭 Troubleshooting

- If resume download fails with 401/403: re-login and retry.
- If resume download fails with CORS: ensure frontend port and backend CORS match.
- If PDF generation fails server-side: check Puppeteer install and AI API output in controller logs.

## 📦 Deployment Checklist

1. Configure production env (`MONGO_URI`, `JWT_SECRET`, `GOOGLE_GENAI_API_KEY`).
2. Build frontend (`npm run build` from FrontEnd), serve static from backend or use CDN.
3. Use process manager (`pm2`, Docker) for backend.
4. Add HTTPS and secure cookie settings.

---

For any further improvements, I can add a short `docs/` section with API examples and a component-level architecture diagram.
