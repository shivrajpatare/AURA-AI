# Aura: Civic Reporting Platform

**I built Aura because reporting civic issues should be as fast as taking a photo.**

Most city reporting apps are clunky forms that no one uses. Aura changes that. It's a camera-first web application that uses AI to analyze, classify, and route civic issues (like garbage dumps, potholes, or broken lights) instantly.

### The Problem
Citizens want to help fix their neighborhoods, but the friction is too high. filling out long forms, finding category codes, and manually entering addresses discriminates against quick action.

### How Aura Solves It
1.  **Snap**: You take a photo of the issue.
2.  **AI Analyze**: Our backend AI (Gemini/OpenAI) instantly identifies the problem (e.g., "Garbage Dump") and rates its severity.
3.  **Track**: You get a private dashboard to track resolution.
4.  **Resolve**: Admins see a live heatmap of issues and efficient routing.

---

## 📂 Repository Structure

This is a monorepo containing the full stack:

*   **`/frontend`**: The React + TypeScript web application.
    *   *Tech*: Vite, Tailwind CSS, Leaflet Maps, Shadcn UI.
    *   *Features*: Camera capture, Geolocation, User Dashboard (Private), Admin Map.
*   **`/backend`**: The API and Logic layer.
    *   *Tech*: Supabase (Edge Functions, Database, Auth, Storage).
    *   *Features*: AI Image Analysis, Severity Scoring, Location Management.
*   **`/docs`**: Project documentation and architecture diagrams.

---

## 🚀 Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   Supabase CLI (optional, for backend dev)

### 1. Frontend Setup
```bash
cd frontend
npm install
# Create .env from example (see below)
npm run dev
```

### 2. Backend Setup
The backend runs on Supabase.
```bash
cd backend
# Link to your Supabase project
npx supabase link --project-ref <your-project-id>
# Push database schema
npx supabase db push
# Set secrets
npx supabase secrets set OPENROUTER_API_KEY=...
```

---

## 🧠 AI & Data Privacy

*   **AI Models**: We use vision models (Gemini Flash / GPT-4o) strictly for classification. No facial recognition is performed.
*   **Location Data**: Exact location is stored only for the purpose of issue resolution. Public maps use fuzzed or clustered locations to protect privacy.

---

## ⚠️ Current Guardrails
*   This is a **private prototype**. Do not deploy to public production without auditing RLS policies.
*   Image uploads are currently restricted to authenticated users (admin-side) and anonymous reporters (limited rate).

## 🔮 Future Scope
*   **Offline Mode**: Queue reports when data is spotty.
*   **Gov Interop**: API connectors for direct municipal databases.
*   **Community Voting**: Allow citizens to upvote priority issues.

---

## Team
Built by [Your Name/Team].
