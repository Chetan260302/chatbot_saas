# backend/app/main.py
import sys
print("[STARTUP] Importing FastAPI...", flush=True)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

print("[STARTUP] Loading config...", flush=True)
from app.core.config import settings

print("[STARTUP] Loading DB engine...", flush=True)
from app.db.session import engine
import app.db.registry  # noqa: F401, F403 - import all models for SQLAlchemy
from app.db.base import Base

print("[STARTUP] Loading routers...", flush=True)
from app.api.v1.endpoints.auth      import router as auth_router
from app.api.v1.endpoints.chatbots  import router as chatbots_router
from app.api.v1.endpoints.documents import router as documents_router
from app.api.v1.endpoints.chat      import router as chat_router
from app.api.v1.endpoints.public_chat import router as public_chat_router
from app.api.v1.endpoints.analytics import router as analytics_router
from app.api.v1.endpoints.admin     import router as admin_router
from app.api.v1.endpoints.team      import router as team_router

from sqlalchemy import text
print("[STARTUP] All imports complete!", flush=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on startup and shutdown."""
    print("[LIFESPAN] Connecting to database...", flush=True)
    # DB initialization runs at startup. If it fails, uvicorn will crash and fail the deploy.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.execute(text("ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT FALSE;"))
        await conn.execute(text("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITHOUT TIME ZONE;"))
        await conn.execute(text("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMP WITHOUT TIME ZONE;"))
    print(f"✅ {settings.APP_NAME} started — {settings.ENVIRONMENT} mode", flush=True)
    yield
    # Shutdown: cleanup if needed
    await engine.dispose()
    print("👋 Server shutting down", flush=True)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Main Top-Level Application (routes requests, has NO global CORS)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Industry-grade AI Chatbot SaaS API",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Sub-App 1: Dashboard / Admin API (strict CORS, supports cookies)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
dashboard_app = FastAPI(
    title=f"{settings.APP_NAME} — Dashboard API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

dashboard_app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include private routers (paths will be prefixed by the mount path /api/v1)
dashboard_app.include_router(auth_router)
dashboard_app.include_router(chatbots_router)
dashboard_app.include_router(documents_router)
dashboard_app.include_router(chat_router)
dashboard_app.include_router(analytics_router)
dashboard_app.include_router(admin_router)
dashboard_app.include_router(team_router)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Sub-App 2: Public Widget API (permissive CORS, allows null / any origin)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
public_app = FastAPI(
    title=f"{settings.APP_NAME} — Public Widget API",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
)

public_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)

# Include the public chat router
public_app.include_router(public_chat_router)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Mount Sub-Apps
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Mount public API first so it has precedence, then dashboard API
app.mount(f"{settings.API_V1_PREFIX}/public", public_app)
app.mount(f"{settings.API_V1_PREFIX}", dashboard_app)


# ── Root-level endpoints ──────────────────────────────────────────
@app.get("/")
async def root():
    """Root endpoint used for a quick sanity check."""
    return {"message": f"Welcome to {settings.APP_NAME} API!"}


@app.get("/health")
async def health_check():
    """Simple health check used by Docker and load balancers."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}