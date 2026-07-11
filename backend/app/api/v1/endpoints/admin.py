# backend/app/api/v1/endpoints/admin.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.tenant import Tenant
from app.models.chatbot import Chatbot
from app.models.message import Message
from app.models.document import Document


router = APIRouter(prefix="/admin", tags=["Admin"])


async def require_superadmin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that gates all admin endpoints — returns 403 for non-superadmins."""
    if not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# ── Tenants ────────────────────────────────────────────────────

@router.get("/tenants")
async def list_all_tenants(
    search: str | None = Query(None),
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    """List all tenants with chatbot counts."""
    stmt = select(Tenant).order_by(Tenant.created_at.desc())
    if search:
        stmt = stmt.where(Tenant.name.ilike(f"%{search}%"))
    result = await db.execute(stmt)
    tenants = result.scalars().all()

    # Get chatbot counts per tenant
    counts_result = await db.execute(
        select(Chatbot.tenant_id, func.count(Chatbot.id).label("bot_count"))
        .group_by(Chatbot.tenant_id)
    )
    count_map = {str(row.tenant_id): row.bot_count for row in counts_result}

    # Get user counts per tenant
    user_counts_result = await db.execute(
        select(User.tenant_id, func.count(User.id).label("user_count"))
        .group_by(User.tenant_id)
    )
    user_count_map = {str(row.tenant_id): row.user_count for row in user_counts_result}

    return [
        {
            "id": str(t.id),
            "name": t.name,
            "slug": t.slug,
            "plan": t.plan,
            "is_active": t.is_active,
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "chatbot_count": count_map.get(str(t.id), 0),
            "user_count": user_count_map.get(str(t.id), 0),
        }
        for t in tenants
    ]


@router.patch("/tenants/{tenant_id}/toggle")
async def toggle_tenant(
    tenant_id: UUID,
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable a tenant (and by extension all their users/bots)."""
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(404, detail="Tenant not found")
    tenant.is_active = not tenant.is_active
    await db.commit()
    return {"id": str(tenant.id), "is_active": tenant.is_active}


# ── Users ──────────────────────────────────────────────────────

@router.get("/users")
async def list_all_users(
    search: str | None = Query(None),
    tenant_id: str | None = Query(None),
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    """List all users across all tenants with optional search and tenant filter."""
    stmt = select(User).order_by(User.created_at.desc())

    if search:
        stmt = stmt.where(
            (User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%"))
        )
    if tenant_id:
        stmt = stmt.where(User.tenant_id == tenant_id)

    result = await db.execute(stmt)
    users = result.scalars().all()

    # Get tenant names
    tenant_ids = list({u.tenant_id for u in users})
    if tenant_ids:
        tenants_result = await db.execute(
            select(Tenant.id, Tenant.name).where(Tenant.id.in_(tenant_ids))
        )
        tenant_name_map = {str(row.id): row.name for row in tenants_result}
    else:
        tenant_name_map = {}

    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "is_superadmin": u.is_superadmin,
            "tenant_id": str(u.tenant_id),
            "tenant_name": tenant_name_map.get(str(u.tenant_id), "Unknown"),
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.patch("/users/{user_id}/toggle")
async def toggle_user(
    user_id: UUID,
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable a user account."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, detail="User not found")
    if user.is_superadmin:
        raise HTTPException(400, detail="Cannot disable a superadmin account")
    user.is_active = not user.is_active
    await db.commit()
    return {"id": str(user.id), "is_active": user.is_active}


# ── Platform Stats ─────────────────────────────────────────────

@router.get("/stats")
async def platform_stats(
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    """Platform-wide aggregate statistics."""
    tenant_count = (await db.execute(select(func.count(Tenant.id)))).scalar() or 0
    user_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    chatbot_count = (await db.execute(select(func.count(Chatbot.id)))).scalar() or 0
    message_count = (await db.execute(select(func.count(Message.id)))).scalar() or 0

    active_tenants = (await db.execute(
        select(func.count(Tenant.id)).where(Tenant.is_active == True)
    )).scalar() or 0

    return {
        "total_tenants": tenant_count,
        "active_tenants": active_tenants,
        "total_users": user_count,
        "total_chatbots": chatbot_count,
        "total_messages": message_count,
    }


# ── All Chatbots (cross-tenant) ───────────────────────────────

@router.get("/chatbots")
async def list_all_chatbots(
    search: str | None = Query(None),
    tenant_id: str | None = Query(None),
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    """List all chatbots across all tenants for superadmin view with stats."""
    stmt = select(Chatbot).order_by(Chatbot.created_at.desc())

    if search:
        stmt = stmt.where(Chatbot.name.ilike(f"%{search}%"))
    if tenant_id:
        stmt = stmt.where(Chatbot.tenant_id == tenant_id)

    result = await db.execute(stmt)
    chatbots = result.scalars().all()

    if not chatbots:
        return []

    chatbot_ids = [c.id for c in chatbots]

    # Get message counts
    msg_counts = await db.execute(
        select(Message.chatbot_id, func.count(Message.id).label("count"))
        .where(Message.chatbot_id.in_(chatbot_ids))
        .group_by(Message.chatbot_id)
    )
    msg_count_map = {row.chatbot_id: row.count for row in msg_counts}

    # Get document counts
    doc_counts = await db.execute(
        select(Document.chatbot_id, func.count(Document.id).label("count"))
        .where(Document.chatbot_id.in_(chatbot_ids))
        .group_by(Document.chatbot_id)
    )
    doc_count_map = {row.chatbot_id: row.count for row in doc_counts}

    # Get tenant names
    t_ids = list({c.tenant_id for c in chatbots})
    if t_ids:
        tenants_result = await db.execute(
            select(Tenant.id, Tenant.name).where(Tenant.id.in_(t_ids))
        )
        tenant_name_map = {row.id: row.name for row in tenants_result}
    else:
        tenant_name_map = {}

    return [
        {
            "id": str(c.id),
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "is_active": c.is_active,
            "domain": c.domain,
            "tenant_id": str(c.tenant_id),
            "tenant_name": tenant_name_map.get(c.tenant_id, "Unknown"),
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "message_count": msg_count_map.get(c.id, 0),
            "document_count": doc_count_map.get(c.id, 0),
        }
        for c in chatbots
    ]


@router.patch("/chatbots/{chatbot_id}/toggle")
async def toggle_chatbot(
    chatbot_id: UUID,
    admin: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable any chatbot across tenants."""
    result = await db.execute(select(Chatbot).where(Chatbot.id == chatbot_id))
    chatbot = result.scalar_one_or_none()
    if not chatbot:
        raise HTTPException(404, detail="Chatbot not found")
    chatbot.is_active = not chatbot.is_active
    await db.commit()
    return {"id": str(chatbot.id), "is_active": chatbot.is_active}