# 🧠 MannMitra

**Your safe, anonymous, and culturally-aware mental wellness companion — built for Indian youth.**

MannMitra ("mind friend" in Hindi) is a full-stack mental wellness platform that pairs an empathetic AI companion with practical therapeutic tools — behavioral rehearsal roleplay, guided meditation, mood journaling with AI-driven insights, grounding exercises, and built-in crisis intervention — all wrapped in a private, judgment-free experience.

---

## ✨ Features

### 💬 AI Chat Companion
- Warm, casual, peer-like conversational AI (powered by Google Gemini via LangChain)
- **Adaptive tone** — reads the room and matches the user's emotional state instead of forcing positivity
- **Multilingual & script-aware** — supports Auto-Mirror (replies in whatever script/language you type in, e.g. Hinglish) or Native Script mode (transliterates into proper Devanagari, Kannada, Tamil script, etc.)
- **Long-term memory** via a Pinecone vector database, so the companion recalls recurring struggles and past conversations
- **Real-time mood detection** that reactively shifts the UI theme (neutral → concerned) and offers calming ambient sound
- **Built-in crisis interceptor** — high-risk keyword detection immediately surfaces verified Indian crisis helplines instead of continuing the conversation

### 🎭 Behavioral Rehearsal
A safe sandbox to practice difficult conversations before having them for real:
- Pick a scenario: *The Guilt Trip*, *Tough Authority*, *Difficult Peer*, or *Role Reversal*
- Describe the situation, what makes it hard, and how the other person usually behaves
- The AI roleplays the "difficult persona" (or, in Role Reversal, roleplays *you* while you practice being the difficult person)
- An **Emergency Exit** is always one click away
- End the session for an AI-generated **debrief**: what you did well, where you can improve, and a concrete tip

### 🧘 Wellness Toolkit & Meditation Space
- **Box Breathing** — animated 4-4-5 breathing guide
- **Bilateral Stimulation / Eye Tracking** — EMDR-style visual tracking exercise
- **5-4-3-2-1 Grounding** technique
- Guided meditation sessions (Mindfulness, Deep Breathing, Body Scan, Loving-Kindness) with step-by-step timers
- Ambient soundscapes (rain, forest, ocean waves, fire, white noise)

### 📔 Mood Journal + AI Insights
- Daily mood logging (Terrible → Great) with free-text reflection
- Entries are persisted to a vector database for long-term pattern recognition
- **"Generate Weekly Summary"** — an AI-generated holistic mental-state summary that connects journal entries, chat history, *and* past Behavioral Rehearsal sessions into one coherent reflection

### 📚 Resources Hub
- Curated, India-specific crisis helplines (Vandrevala Foundation, iCall, Snehi, AASRA, Fortis Stress Helpline, and more)
- Self-help guides, educational content, recommended mental health apps, and community resources
- Persistent emergency banner with the national emergency number

### 🔐 Privacy-First Auth
- Fully anonymous usernames — no real names required
- Optional **Guest Mode** using Supabase anonymous authentication
- Granular privacy settings (data collection, analytics, personalized content toggles)
- Data export & account deletion controls

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS 3, Framer Motion, Lucide Icons |
| **Backend** | FastAPI (Python) |
| **LLM / Orchestration** | LangChain (`langchain-google-genai`, `langchain-classic`) + Google Gemini (`gemini-2.5-flash-lite`) |
| **Vector Memory** | Pinecone (`langchain-pinecone`) + Gemini embeddings |
| **Tooling** | ESLint, PostCSS, Autoprefixer |

---

## 📁 Project Structure

```
backend/
├── main.py                        # FastAPI server — chat, simulation, journal & insights endpoints
├── schemas.py
├── package.json / vite.config.js  # Frontend build config
├── tailwind.config.js
├── src/
│   ├── App.jsx                    # Root: onboarding → auth → main app flow
│   ├── main.jsx / index.css
│   ├── Onboard.jsx                # 5-slide animated onboarding carousel
│   ├── Auth.jsx                   # Anonymous sign-in / sign-up / guest mode
│   ├── MainLayout.jsx             # App shell, sidebar navigation, tab routing
│   ├── ChatInterface.jsx          # Core AI companion chat UI
│   ├── BehavioralRehearsalScreen.jsx
│   ├── Wellness.jsx               # Box breathing, eye tracking, grounding
│   ├── BreathingExercise.jsx
│   ├── BilateralStimulation.jsx
│   ├── Meditation.jsx             # Guided meditation sessions + ambient sounds
│   ├── MoodJournal.jsx            # Journal entries + AI insights panel
│   ├── Resources.jsx              # Helplines, guides, apps, community
│   ├── Privacy.jsx                # Settings: notifications, privacy, appearance, account
│   └── components/
│       ├── SimulationSetup.jsx    # Scenario picker + 3-part context form
│       └── SimulationChat.jsx     # Roleplay chat + debrief flow
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 20.19 (or ≥ 22.12)
- **Python** ≥ 3.10
- A **Google Generative AI** API key (Gemini)
- A **Pinecone** account + index named `mannmitra-index`
- A **Supabase** project with email/password and anonymous sign-in enabled

### 1. Clone & install frontend dependencies

```bash
cd backend
npm install
```

### 2. Set up the Python backend

```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install fastapi uvicorn python-dotenv langchain-google-genai langchain-pinecone langchain-core langchain-classic pinecone-client
```

Create a `.env` file inside `backend/`:

```env
GOOGLE_API_KEY=your_google_generative_ai_key
PINECONE_API_KEY=your_pinecone_key
OPENROUTER_API_KEY=your_openrouter_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Make sure a Pinecone index called `mannmitra-index` exists (matching the embedding dimension used by `gemini-embedding-001`) before starting the server.
> The frontend uses the `VITE_` Supabase settings. The backend verifies each API request's Supabase access token using `SUPABASE_URL` and `SUPABASE_ANON_KEY`; set these on the backend deployment too. Chat, journal, and roleplay memories are stored in per-user Pinecone namespaces. Existing vectors in the unscoped default namespace are neither read nor migrated.

### 3. Run the backend

```bash
python main.py
```
The FastAPI server starts on **http://localhost:8000**, serving static assets from `../public` at `/public`.

### 4. Run the frontend

```bash
npm run dev
```
The Vite dev server starts on **http://localhost:5173** and is pre-configured (via CORS) to talk to the backend on port 8000.

---

## 🔌 API Overview

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/chat` | `POST` | Main companion chat — returns reply, detected mood, and crisis flag |
| `/api/simulate` | `POST` | Behavioral Rehearsal roleplay turns *and* end-of-session debrief |
| `/api/journal/save` | `POST` | Persist a mood journal entry to long-term memory |
| `/api/journal/insights` | `POST` | Generate a holistic AI summary from journal + chat + roleplay history |

---

## ⚠️ A Note on Safety

MannMitra includes a **keyword-based safety interceptor** that detects high-risk language (self-harm, suicidal ideation) and immediately responds with verified Indian crisis helplines instead of a standard AI reply. This is a supportive tool, **not a replacement for professional mental health care or emergency services**. If you or someone you know is in crisis, please contact a licensed professional or a helpline such as:

- 📞 **Vandrevala Foundation** — 1860 2662 345 / 1800 2333 330
- 📞 **AASRA** — 9820466726
- 📞 **iCall** — 9152987821
- 🚨 **Emergency Services** — 112

---

## 🗺️ Roadmap Ideas
- [ ] WhatsApp integration for on-the-go access
- [ ] Voice-based journaling
- [ ] Therapist hand-off / booking integration
- [ ] Offline-first PWA support