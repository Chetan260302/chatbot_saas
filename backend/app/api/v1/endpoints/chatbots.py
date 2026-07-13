# backend/app/api/v1/endpoints/chatbots.py
from app.models.chatbot import Chatbot
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from sqlalchemy import func, select
from app.models.message import Message
from app.models.tenant import Tenant

from app.db.session import get_db
from app.core.dependencies import get_current_user, get_current_tenant, require_role
from app.models.user import User
from app.schemas.chatbot import ChatbotCreate, ChatbotUpdate, ChatbotResponse
from app.services.chatbot_service import (
    create_chatbot, get_chatbots, get_chatbot, update_chatbot, delete_chatbot
)

router = APIRouter(prefix="/chatbots", tags=["Chatbots"])


@router.post("", response_model=ChatbotResponse, status_code=201)
async def create(
    data: ChatbotCreate,
    _role_check: User = Depends(require_role("owner", "admin")),
    current_user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    target_tenant = tenant  # default: own tenant

    if data.tenant_id and current_user.is_superadmin:
        result = await db.execute(select(Tenant).where(Tenant.id == data.tenant_id))
        override_tenant = result.scalar_one_or_none()
        if not override_tenant:
            raise HTTPException(status_code=404, detail="Target tenant not found")
        target_tenant = override_tenant
    elif data.tenant_id and not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Only superadmins can create bots for other tenants")
    if not current_user.is_superadmin:
        from app.services.usage_service import check_can_create_chatbot
        usage_check = await check_can_create_chatbot(target_tenant, db)
        if not usage_check["allowed"]:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "plan_limit_reached",
                    "reason": usage_check["reason"],
                    "current_count": usage_check["current_count"],
                    "limit": usage_check["limit"],
                    "suggested_plan": usage_check["suggested_plan"],
                    "message": f"Chatbot limit reached ({usage_check['current_count']}/{usage_check['limit']}). Upgrade your plan to create more."
                }
            )

    return await create_chatbot(data, target_tenant, db)


@router.get("", response_model=list[ChatbotResponse])
async def list_chatbots(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    return await get_chatbots(tenant, db)


@router.get("/{id_or_slug}", response_model=ChatbotResponse)
async def get_one(
    id_or_slug: str,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    return await get_chatbot(id_or_slug, tenant, db)


@router.get("/{id_or_slug}/stats")
async def get_stats(
    id_or_slug: str,
    tenant: Tenant       = Depends(get_current_tenant),
    db:     AsyncSession = Depends(get_db),
):
    chatbot = await get_chatbot(id_or_slug, tenant, db)
    result = await db.execute(
        select(
            func.count(Message.id).label("total_messages"),
            func.sum(Message.tokens_used).label("total_tokens"),
        ).where(
            Message.chatbot_id == chatbot.id,
            Message.tenant_id  == tenant.id,
        )
    )
    row = result.first()
    return {
        "total_messages": row.total_messages or 0,
        "total_tokens":   row.total_tokens   or 0,
    }


@router.patch("/{id_or_slug}", response_model=ChatbotResponse, dependencies=[Depends(require_role("owner", "admin"))])
async def update(
    id_or_slug: str,
    data: ChatbotUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    return await update_chatbot(id_or_slug, data, tenant, db)


@router.delete("/{id_or_slug}", status_code=204, dependencies=[Depends(require_role("owner", "admin"))])
async def delete(
    id_or_slug: str,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    await delete_chatbot(id_or_slug, tenant, db)