# 🧠 EchoMind

> **AI-Powered Project Memory & Context Recovery Engine**  
> *Turn scattered project notes, work logs, and messy thoughts into structured project memory, clear decisions, and the next best actions.*

---

## 🚀 Overview & Problem Solved

Developers, students, and freelancers working across multiple projects constantly face **context loss**. Switching tasks or taking a break means notes are scattered across scratchpads, key decisions are forgotten, and substantial time is wasted answering:
- *What was I doing?*
- *Where did I stop?*
- *What should I do next?*

**EchoMind** solves this by providing a dedicated, calm context-recovery workspace. Instead of a generic chatbot conversation, EchoMind behaves as a careful project analyst:
1. Accepts raw notes, meeting dumps, bug logs, or git commits.
2. Extracts structured, factual project state via **BharatCode sovereign AI models**.
3. Organizes completed work, pending tasks, blockers, decisions, risks, and prioritized next actions.
4. Preserves timeline snapshots and provides an instant **Resume Project** view and **Markdown Export**.

---

## ✨ Key Features

- **📂 Project Workspace:** Create, organize, and manage distinct projects with clean cards and timestamps.
- **📝 Context Capture:** Flexible text capture for raw updates, standup notes, and task dumps with character validation.
- **🤖 BharatCode AI Context Engine:** Server-side OpenAI-compatible AI integration with the sovereign `qwen-3.8-27b` model.
- **📊 Structured Project Memory:**
  - **Project Summary & State:** Factual summary and status badge (`not_started`, `in_progress`, `blocked`, `completed`).
  - **Completed vs. Pending:** Itemized tasks with zero hallucination.
  - **Key Decisions:** Architecture and design choices paired with stated rationales.
  - **Known Blockers & Risks:** Immediate impediments highlighted with clear warnings.
  - **Prioritized Next Actions:** Concrete, bite-sized next steps tagged with priority (`HIGH`, `MEDIUM`, `LOW`).
- **🎯 Dedicated Resume View:** Instant three-part dashboard answering:
  1. *What is this project?*
  2. *Where did I stop?*
  3. *What should I do next?*
- **⏳ History & Snapshots:** Save and restore historical snapshots directly in local browser storage.
- **📋 One-Click Markdown Export:** Export clean, GitHub-flavored markdown summaries to copy or download.

---

## 🛠️ Architecture & Tech Stack

```
echomind/
├── client/                     # Frontend Workspace
│   ├── src/
│   │   ├── components/         # Sidebar, ContextCapture, StructuredResults, ResumeView, Modals
│   │   ├── lib/                # Storage layer (localStorage abstraction), Markdown generator
│   │   ├── App.jsx             # Main reactive workspace controller
│   │   └── main.jsx
│   └── vite.config.js          # Vite config with /api proxy
├── server/                     # Backend API & AI Service
│   ├── src/
│   │   ├── routes/             # GET /api/health, POST /api/analyze
│   │   ├── services/           # bharatcode.service.js (prompt engineering & schema validation)
│   │   ├── middleware/         # Centralized error handler (redacting secrets)
│   │   └── app.js              # Express app & static client hosting
│   └── .env.example            # Environment template with placeholders
├── BharatCode.txt              # Hackathon submission declaration file
└── README.md
```

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, CORS, Dotenv
- **AI Engine:** BharatCode API (`https://bharatcode.ai/api/model/v1`, Model: `qwen-3.8-27b`)
- **Persistence:** Isolated browser `localStorage` layer (ready for MongoDB backend extension)

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- BharatCode API Key from [bharatcode.ai/account](https://bharatcode.ai/account)

### 1. Clone the Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/echomind.git
cd echomind
```

### 2. Configure Backend Environment
Navigate to `server/` and create your `.env` file from the example:
```bash
cp server/.env.example server/.env
```
Edit `server/.env`:
```ini
PORT=5000
BHARATCODE_API_KEY=your_bharatcode_api_key_here
BHARATCODE_BASE_URL=https://bharatcode.ai/api/model/v1
BHARATCODE_MODEL=qwen-3.8-27b
```

> **Security Note:** The API key is restricted entirely to the backend server. It is never exposed to the browser, Vite client code, or version control.

### 3. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 4. Run the Application
In development, run the backend and frontend:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 🧪 Testing the API Endpoints

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```
Response:
```json
{
  "status": "ok",
  "service": "EchoMind Backend API",
  "version": "1.0.0",
  "model": "qwen-3.8-27b",
  "hasApiKey": true
}
```

### 2. Context Analysis
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectTitle": "EchoMind Test",
    "inputText": "I created a React frontend, connected MongoDB, login works but the dashboard API isn'\''t returning data. I need to fix the API and improve the UI."
  }'
```

---

## 🔒 BharatCode API & Student Free Allowance
Students with a verified college email can activate **10 Million free tokens per day** on BharatCode:
1. Go to [https://bharatcode.ai/account](https://bharatcode.ai/account).
2. Verify your college email or select an API plan.
3. Generate your API key and insert it into `server/.env`.

---

## 📜 Hackathon Submission Compliance

- [x] **Public GitHub Repository**
- [x] **`BharatCode.txt`** present in root directory
- [x] **`.env`** strictly excluded via `.gitignore`
- [x] **`.env.example`** provided with placeholders
- [x] Real model integration with upstream error handling
- [x] Responsive SaaS UI with light/calm visual style

---

## 👤 Author
- **Developer:** Beekam Sri Koushik Sai Naga Singh
- **Contact:** beekamkoushik@gmail.com
- **Event:** BharatCode Build League Hackathon (Work & Automation Track)

