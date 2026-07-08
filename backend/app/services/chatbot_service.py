# backend/app/services/chatbot_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from uuid import UUID
import re
import secrets

from app.models.chatbot import Chatbot
from app.models.tenant import Tenant
from app.schemas.chatbot import ChatbotCreate, ChatbotUpdate


def slugify(text: str) -> str:
    """Helper to convert string into a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text


async def generate_unique_slug(name: str, db: AsyncSession) -> str:
    """Generates a unique slug for a chatbot."""
    base_slug = slugify(name) or "chatbot"
    
    # Check if slug exists
    result = await db.execute(select(Chatbot).where(Chatbot.slug == base_slug))
    if not result.scalar_one_or_none():
        return base_slug
        
    # Append random suffix if conflict
    return f"{base_slug}-{secrets.token_hex(3)}"


async def create_chatbot(data: ChatbotCreate, tenant: Tenant, db: AsyncSession) -> Chatbot:
    slug_val = await generate_unique_slug(data.name, db)
    chatbot = Chatbot(
        name=data.name,
        slug=slug_val,
        description=data.description,
        system_prompt=data.system_prompt or """You are a helpful assistant.
Answer questions based only on the provided documents.
If you don't know the answer say: 'I don't have information about that.'""",
        widget_config=data.widget_config or {},
        tenant_id=tenant.id,
        domain=data.domain or "general",
    )
    db.add(chatbot)
    await db.commit()
    await db.refresh(chatbot)
    return chatbot


async def get_chatbots(tenant: Tenant, db: AsyncSession) -> list[Chatbot]:
    """Get all chatbots belonging to this tenant only."""
    result = await db.execute(
        select(Chatbot)
        .where(Chatbot.tenant_id == tenant.id)
        .order_by(Chatbot.created_at.desc())
    )
    # Automatically migrate existing chatbots that lack a slug
    bots = result.scalars().all()
    migrated = False
    for bot in bots:
        if not bot.slug:
            bot.slug = await generate_unique_slug(bot.name, db)
            db.add(bot)
            migrated = True
    if migrated:
        await db.commit()
    return bots


async def get_chatbot(id_or_slug: str, tenant: Tenant, db: AsyncSession) -> Chatbot:
    """Get a single chatbot by UUID string or slug — enforces tenant isolation."""
    # Check if valid UUID first
    is_uuid = False
    try:
        uuid_val = UUID(id_or_slug)
        is_uuid = True
    except ValueError:
        pass

    if is_uuid:
        stmt = select(Chatbot).where(
            Chatbot.id == uuid_val,
            Chatbot.tenant_id == tenant.id
        )
    else:
        stmt = select(Chatbot).where(
            Chatbot.slug == id_or_slug,
            Chatbot.tenant_id == tenant.id
        )

    result = await db.execute(stmt)
    chatbot = result.scalar_one_or_none()
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")
    return chatbot


async def update_chatbot(
    id_or_slug: str,
    data: ChatbotUpdate,
    tenant: Tenant,
    db: AsyncSession
) -> Chatbot:
    chatbot = await get_chatbot(id_or_slug, tenant, db)
    
    update_data = data.model_dump(exclude_unset=True)
    
    # If name changes, regenerate slug
    if "name" in update_data and update_data["name"] != chatbot.name:
        chatbot.slug = await generate_unique_slug(update_data["name"], db)

    for field, value in update_data.items():
        setattr(chatbot, field, value)
    
    await db.commit()
    await db.refresh(chatbot)
    return chatbot


async def delete_chatbot(id_or_slug: str, tenant: Tenant, db: AsyncSession):
    chatbot = await get_chatbot(id_or_slug, tenant, db)
    await db.delete(chatbot)
    await db.commit()