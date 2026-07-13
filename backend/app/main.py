# # backend/app/main.py
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from contextlib import asynccontextmanager

# from app.core.config import settings
# from app.db.session import engine
# import app.db.registry  # noqa: F401, F403 - import all models for SQLAlchemy
# from app.db.base import Base

# from app.api.v1.endpoints.auth      import router as auth_router
# from app.api.v1.endpoints.chatbots  import router as chatbots_router
# from app.api.v1.endpoints.documents import router as documents_router
# from app.api.v1.endpoints.chat      import router as chat_router
# from app.api.v1.endpoints.public_chat import router as public_chat_router
# from app.api.v1.endpoints.analytics import router as analytics_router
# from app.api.v1.endpoints.admin     import router as admin_router
# from app.api.v1.endpoints.team      import router as team_router

# from sqlalchemy import text


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """Runs on startup and shutdown."""
#     # Startup: create all tables (Alembic handles prod migrations)
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)
#         await conn.execute(text("ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;"))
#         await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT FALSE;"))
#         await conn.execute(text("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITHOUT TIME ZONE;"))
#         await conn.execute(text("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMP WITHOUT TIME ZONE;"))
#     print(f"✅ {settings.APP_NAME} started — {settings.ENVIRONMENT} mode")
#     yield
#     # Shutdown: cleanup if needed
#     await engine.dispose()
#     print("👋 Server shutting down")


# # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# # Main App — private/dashboard routes (strict CORS)
# # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# app = FastAPI(
#     title=settings.APP_NAME,
#     version="1.0.0",
#     description="Industry-grade AI Chatbot SaaS API",
#     docs_url="/docs" if settings.DEBUG else None,   # hide Swagger in production
#     redoc_url="/redoc" if settings.DEBUG else None,
#     lifespan=lifespan,
# )

# # CORS for dashboard / admin — only trusted origins, with cookies
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.cors_origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ── Private routers (require JWT / session cookie) ────────────────
# app.include_router(auth_router,      prefix=settings.API_V1_PREFIX)
# app.include_router(chatbots_router,  prefix=settings.API_V1_PREFIX)
# app.include_router(documents_router, prefix=settings.API_V1_PREFIX)
# app.include_router(chat_router,      prefix=settings.API_V1_PREFIX)
# app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)
# app.include_router(admin_router,     prefix=settings.API_V1_PREFIX)
# app.include_router(team_router,      prefix=settings.API_V1_PREFIX)


# # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# # Public Sub-App — widget / embeddable routes (permissive CORS)
# # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# # Mounted as a separate FastAPI app so it gets its own CORSMiddleware
# # instance. This is the idiomatic FastAPI pattern for dual-CORS.
# #
# # Security notes:
# #   • allow_credentials=False  → browsers won't send cookies/tokens
# #   • Authentication is via X-API-Key header, not cookies
# #   • Rate limiting is already applied on these endpoints
# # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# public_app = FastAPI(
#     title=f"{settings.APP_NAME} — Public Widget API",
#     version="1.0.0",
#     docs_url="/docs" if settings.DEBUG else None,
#     redoc_url=None,
# )

# # CORS for widgets — any origin, NO credentials (API-key auth only)
# public_app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=False,       # ← critical: never send cookies cross-origin
#     allow_methods=["GET", "POST", "OPTIONS"],
#     allow_headers=["Content-Type", "X-API-Key"],
# )

# # The public_chat router has prefix="/public", so its endpoints sit at
# # /public/chat/stream. After mounting at /api/v1, full path becomes
# # /api/v1/public/chat/stream — same as before. No URL changes needed.
# public_app.include_router(public_chat_router)

# # Mount the public sub-app on the main app
# # Path: /api/v1  +  router prefix /public  →  /api/v1/public/chat/stream
# app.mount(f"{settings.API_V1_PREFIX}", public_app)


# # ── Root-level endpoints ──────────────────────────────────────────
# @app.get("/")
# async def root():
#     """Root endpoint used for a quick sanity check."""
#     return {"message": f"Welcome to {settings.APP_NAME} API!"}


# @app.get("/health")
# async def health_check():
#     """Simple health check used by Docker and load balancers."""
#     return {"status": "ok", "environment": settings.ENVIRONMENT}

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"status": "working"}