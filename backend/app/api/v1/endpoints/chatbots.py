# backend/app/api/v1/endpoints/chatbots.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from sqlalchemy import func, select
from app.models.message import Message

from app.db.session import get_db
from app.core.dependencies import get_current_user, get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.chatbot import ChatbotCreate, ChatbotUpdate, ChatbotResponse
from app.services.chatbot_service import (
    create_chatbot, get_chatbots, get_chatbot, update_chatbot, delete_chatbot
)

router = APIRouter(prefix="/chatbots", tags=["Chatbots"])


@router.post("", response_model=ChatbotResponse, status_code=201)
async def create(
    data: ChatbotCreate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    return await create_chatbot(data, tenant, db)


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


@router.patch("/{id_or_slug}", response_model=ChatbotResponse)
async def update(
    id_or_slug: str,
    data: ChatbotUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    return await update_chatbot(id_or_slug, data, tenant, db)


@router.delete("/{id_or_slug}", status_code=204)
async def delete(
    id_or_slug: str,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    await delete_chatbot(id_or_slug, tenant, db)