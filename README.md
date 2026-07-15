# Botify AI-Powered Chatbot SaaS

Botify is a premium, multi-tenant AI Chatbot SaaS platform that allows businesses to upload documents, train customized AI assistants in seconds, and embed them directly onto their websites. It features a stunning, interactive 3D landing page, a real-time analytics suite, a robust RAG (Retrieval-Augmented Generation) pipeline, and a modern, high-performance UI.

---

## Application Screenshots

*Replace these placeholders with your actual screenshots to showcase the application on GitHub.*

### 1. Interactive 3D Landing Page
> *A preview of the dark-themed landing page featuring a floating interactive 3D Bot canvas.*
> 
> `[Insert 3D Landing Page Screenshot Here]`

### 2. Multi-Tenant Dashboard
> *The central workspace displaying active chatbots, token usage stats, and overall tenant account limits.*
> 
> `[Insert Dashboard Overview Screenshot Here]`

### 3. Document Processing & Ingestion
> *The interactive document manager showing selectable files, the progress overlay, and chunking outputs.*
> 
> `[Insert Document Upload & Processing Screenshot Here]`

### 4. Interactive Chat Playroom & Playground
> *Testing trained chatbots in real-time with streaming server-sent responses before publishing.*
> 
> `[Insert Chat Playground Screenshot Here]`

---

## Tech Stack & Architecture

### Frontend (SPA)
*   **Core**: React 18, Vite, TypeScript
*   **State Management**: Zustand (for persistent authentication and theme preferences)
*   **Routing**: React Router DOM v6
*   **Visuals & Animations**: Three.js, React Three Fiber (R3F), Vanilla CSS (custom glassmorphism, responsive grids)
*   **Icons & Alerts**: Lucide React, React Hot Toast

### Backend (API)
*   **Framework**: FastAPI (Asynchronous Python ASGI)
*   **Database**: PostgreSQL with `pgvector` extension (semantic vector search)
*   **ORM**: SQLAlchemy 2.0 (asyncpg driver)
*   **Caching & Rates**: Redis (connection pooling & rate limiting)
*   **AI & Chunking**: 
    *   Hugging Face Serverless Inference API (`BAAI/bge-base-en` pipeline)
    *   Smart Router Chunking (Level 3 markdown/structural chunking -> Level 4 semantic chunking -> Level 2 recursive fallback)

---

## UI Routing & Navigation

Botify uses React Router for client-side single-page routing. All subpaths are rewritten to `index.html` via Vercel configuration for clean reloads.

### Public Routes
*   `/?theme=light` — Main Landing Page (features interactive 3D particle Canvas and pricing tables)
*   `/login` / `/register` — Branded authentication screens with automatic verification links
*   `/verify-email` — Verification completion page
*   `/forgot-password` / `/reset-password` — Password reset forms
*   `/docs` — Interactive documentation pages
*   `/contact` — Public inquiry and support form

### Protected Dashboard Routes (Tenant Isolated)
*   `/dashboard` — Overview displaying credit usage, chatbot counts, and aggregate analytics
*   `/dashboard/chatbots` — Listing all trained chatbots; creation modal
*   `/dashboard/chatbots/:id` — Multi-tab chatbot control:
    *   **Documents Tab**: File selection (Max 5MB), upload blocking overlay, and training chunk viewer
    *   **Chat Playground**: Streaming chat tests
    *   **Settings Tab**: Chatbot delete actions, model choices, instructions editor, and embed scripts
*   `/dashboard/analytics` — Detailed metrics (chat volume, user feedback, unresolved queries)
*   `/dashboard/team` — Invite teammates and manage roles (`owner`, `admin`, `agent`)
*   `/dashboard/settings` — Profile management, API key rotation, and subscription details

### Superadmin Portal Routes (Platform-Wide Admin Only)
*   `/dashboard/admin/tenants` — Global tenant manager (create, view, adjust active plans/trial end dates, toggle tenant active state)
*   `/dashboard/admin/users` — Global user management list across all registered organizations/tenants

---

## Local Setup vs. Production Deployment

To keep hosting completely free and production robust, the infrastructure splits database and Redis engines between local Docker containers and free serverless cloud platforms.

### Environment Matrix

| Service | Local Development | Production Deployment |
| :--- | :--- | :--- |
| **Backend API Host** | Local machine (`http://localhost:8000`) | **Render** (Persistent Web Service) |
| **Frontend Host** | Local Vite server (`http://localhost:5173`) | **Vercel** (Global Edge Network) |
| **Database** | Dockerized PostgreSQL + `pgvector` | **Neon** (Serverless PostgreSQL with `pgvector`) |
| **Cache & Memory** | Dockerized Redis | **Upstash** (Serverless Redis via HTTP/TCP) |
| **Embeddings** | In-Memory (Optional Local Torch) | **Hugging Face API** (Serverless Inference) |

---

### Local Run (Docker-based)

1.  **Prerequisites**: Install Docker, Docker Compose, Node.js (v18+), and Python 3.11+.
2.  **Spin up Services**:
    ```bash
    # Run postgres-pgvector and redis containers
    docker-compose up -d
    ```
3.  **Run Backend**:
    ```bash
    cd backend
    python -m venv venv
    venv\Scripts\activate # On Mac:  source venv/bin/activate
    pip install -r requirements.txt
    
    # Create database tables and populate mock data
    python -m app.db.init_db
    
    # Start the FastAPI server
    uvicorn app.main:app --reload
    ```
4.  **Run Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

### Production Deployment

#### 1. Database & Cache setup
*   Sign up on [Neon](https://neon.tech), create a serverless PostgreSQL database, and enable the `pgvector` extension: `CREATE EXTENSION IF NOT EXISTS vector;`.
*   Create an account on [Upstash](https://upstash.com) and create a Redis database. Copy the connection string.

#### 2. Backend (Render)
*   Create a Web Service on Render pointing to your backend folder.
*   Set the following Environment Variables:
    *   `DATABASE_URL`: Your Neon PostgreSQL connection string (asyncpg format: `postgresql+asyncpg://...`)
    *   `REDIS_URL`: Your Upstash Redis connection string
    *   `HF_TOKEN`: Hugging Face User Access Token (to embed documents without limits)
    *   `FRONTEND_URL`: `https://botifyapp.vercel.app` (for CORS and reset links)
*   Render automatically deploys on git push. Our memory-optimized backend runs on less than 150MB RAM, fitting comfortably inside Render's 512MB free tier.

#### 3. Frontend (Vercel)
*   Connect your GitHub repository to Vercel.
*   Point the project root to the `frontend` subdirectory.
*   Vercel reads the included `vercel.json` to handle client-side routing on page reloads:
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```
*   Set `VITE_API_URL` to your Render backend domain URL.
