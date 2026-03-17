# GenAI Project

A full-stack interview preparation platform that uses AI to analyze job descriptions and candidate profiles, then generates custom interview questions, skill gap insights, and daily preparation plans.

## 🧭 Project Overview

- **Backend**: Node.js + Express + MongoDB for user auth, interview data, and AI-powered question generation.
- **Frontend**: React + Vite with authentication pages, resume input, generated interview strategy, and a three-column dashboard for technical questions and skill gap insights.
- **Key feature**: Generates personalized interview guidance from JD + profile data and presents it in a clean dark UI.

## 🚀 Local Setup

### Backend

1. Navigate to backend:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start server:
   ```bash
   npm start
   ```

### Frontend

1. Navigate to frontend:
   ```bash
   cd FrontEnd
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` or printed port.

## 🧠 How to Use

1. Register or log in.
2. Paste a job description and provide your resume or self-description.
3. Generate the interview strategy.
4. Visit `/interview/:id` to view technical questions, match score, and skill gaps.

## 🧩 UI Pages

- `/` – Home: input JD and profile/resume and generate strategy.
- `/interview/:interviewId` – Interview dashboard: section nav, question cards, match score, and technical skill gap panel.

## 🔧 Notes

- The project is built for quick iteration; update backend AI generation logic in `Backend/src/controllers/interview.controller.js` and frontend display in `FrontEnd/src/interview/pages/Interview.jsx`.
- Use environment variables for DB URI and JWT secret.

