# Aura: Civic Reporting Platform

**I built Aura because reporting civic issues should be as fast as taking a photo.**

Most city reporting apps are clunky forms that no one uses. Aura changes that. It's a camera-first web application that uses AI to analyze, classify, and route civic issues (like garbage dumps, potholes, or broken lights) instantly.

## 🌍 Live Demo
**Access the Platform:** [https://aura-ai-one-liard.vercel.app](https://aura-ai-one-liard.vercel.app)

*This is a functional prototype running on Vercel (Frontend) and Render (AI Backend). You can test the AI analysis and reporting flow directly.*

### The Problem
Citizens want to help fix their neighborhoods, but the friction is too high. filling out long forms, finding category codes, and manually entering addresses discriminates against quick action.

### How Aura Solves It
1.  **Snap**: You take a photo of the issue.
2.  **AI Analyze**: Our backend AI (Gemini/OpenAI) instantly identifies the problem (e.g., "Garbage Dump") and rates its severity.
3.  **Track**: You get a private dashboard to track resolution.
4.  **Resolve**: Admins see a live heatmap of issues and efficient routing.

---

## 📂 Repository Structure

This is a professional monorepo setup for robust deployment:

*   **`/frontend`** (Deploy to **Vercel**)
    *   *Stack*: React + TypeScript (Vite), Tailwind CSS, Leaflet Maps.
    *   *Role*: Client-side PWA for citizens and admin dashboard.

*   **`/backend`** (Deploy to **Render**)
    *   *Stack*: Node.js, Express, TypeScript, Docker.
    *   *Role*: Dedicated API server for complex logic, AI orchestration (Gemini/OpenAI), and secure processing.

*   **`/supabase`** (Deploy to **Supabase**)
    *   *Stack*: PostgreSQL Migrations, Edge Functions.
    *   *Role*: Managed Database, Auth, and Storage layer.

*   **`/docs`**: Project documentation and architecture diagrams.

---

## 🚀 Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   Docker (optional, for backend)
*   Supabase CLI

### 1. Database (Supabase)
```bash
# Link to your Supabase project
npx supabase link --project-ref <your-project-id>
# Push schema
npx supabase db push
```

### 2. Backend (API)
```bash
cd backend
npm install
# Create .env from .env.example
npm run dev
```

### 3. Frontend (Web App)
```bash
cd frontend
npm install
# Create .env from .env.example
npm run dev
```

---

## 🧠 AI & Data Privacy

*   **AI Models**: We use vision models (Gemini Flash / GPT-4o) strictly for classification. No facial recognition is performed.
*   **Location Data**: Exact location is stored only for issue resolution. Public maps use fuzzed/clustered locations.

---

## ⚠️ Current Guardrails
*   This is a **private prototype**. Do not deploy to public production without auditing RLS policies.
*   Image uploads are currently restricted to authenticated users (admin-side) and anonymous reporters (limited rate).

---

## Team
Built by [Your Name/Team].
