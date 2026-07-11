# backend/app/api/v1/endpoints/analytics.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, cast, Date
from uuid import UUID
from datetime import datetime, timedelta

from app.db.session import get_db
from app.core.dependencies import get_current_user, get_effective_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.models.chatbot import Chatbot
from app.models.message import Message
from app.models.document import Document

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def analytics_overview(
    days: int = Query(14),
    chatbot_id: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    tenant: Tenant | None = Depends(get_effective_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Overview analytics with filters for:
    - Time range (days: 7, 14, 30, 90, etc.)
    - Chatbot ID (individual bot stats)
    - Tenant ID (automatically resolved or overridden by superadmin)
    """
    # 1. Resolve Chatbots list to query
    chatbot_stmt = select(Chatbot)
    if tenant is not None:
        chatbot_stmt = chatbot_stmt.where(Chatbot.tenant_id == tenant.id)
    if chatbot_id:
        try:
            cb_uuid = UUID(chatbot_id)
            chatbot_stmt = chatbot_stmt.where(Chatbot.id == cb_uuid)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid chatbot_id UUID")

    chatbots_result = await db.execute(chatbot_stmt)
    chatbots = chatbots_result.scalars().all()

    if not chatbots:
        return {
            "total_chatbots": 0,
            "active_chatbots": 0,
            "total_messages": 0,
            "total_tokens": 0,
            "total_documents": 0,
            "per_chatbot": [],
            "messages_by_day": [],
        }

    chatbot_ids = [c.id for c in chatbots]

    # 2. Total messages and tokens query
    totals_stmt = select(
        func.count(Message.id).label("total_messages"),
        func.coalesce(func.sum(Message.tokens_used), 0).label("total_tokens"),
    ).where(Message.chatbot_id.in_(chatbot_ids))

    if tenant is not None:
        totals_stmt = totals_stmt.where(Message.tenant_id == tenant.id)

    totals_result = await db.execute(totals_stmt)
    totals = totals_result.first()

    # 3. Total documents query
    docs_stmt = select(func.count(Document.id)).where(Document.chatbot_id.in_(chatbot_ids))
    if tenant is not None:
        docs_stmt = docs_stmt.where(Document.tenant_id == tenant.id)
        
    docs_result = await db.execute(docs_stmt)
    total_documents = docs_result.scalar() or 0

    # 4. Per-chatbot breakdown
    per_chatbot_msgs_stmt = select(
        Message.chatbot_id,
        func.count(Message.id).label("message_count"),
        func.coalesce(func.sum(Message.tokens_used), 0).label("token_count"),
        func.max(Message.created_at).label("last_message_at"),
    ).where(Message.chatbot_id.in_(chatbot_ids))

    if tenant is not None:
        per_chatbot_msgs_stmt = per_chatbot_msgs_stmt.where(Message.tenant_id == tenant.id)
        
    per_chatbot_msgs_stmt = per_chatbot_msgs_stmt.group_by(Message.chatbot_id)
    per_chatbot_msgs = await db.execute(per_chatbot_msgs_stmt)
    
    msg_map = {}
    for row in per_chatbot_msgs:
        msg_map[str(row.chatbot_id)] = {
            "message_count": row.message_count,
            "token_count": row.token_count,
            "last_message_at": row.last_message_at.isoformat() if row.last_message_at else None,
        }

    per_chatbot_docs_stmt = select(
        Document.chatbot_id,
        func.count(Document.id).label("document_count"),
    ).where(Document.chatbot_id.in_(chatbot_ids))
    
    if tenant is not None:
        per_chatbot_docs_stmt = per_chatbot_docs_stmt.where(Document.tenant_id == tenant.id)
        
    per_chatbot_docs_stmt = per_chatbot_docs_stmt.group_by(Document.chatbot_id)
    per_chatbot_docs = await db.execute(per_chatbot_docs_stmt)
    
    doc_map = {}
    for row in per_chatbot_docs:
        doc_map[str(row.chatbot_id)] = row.document_count

    per_chatbot = []
    for bot in chatbots:
        bot_id_str = str(bot.id)
        msg_info = msg_map.get(bot_id_str, {"message_count": 0, "token_count": 0, "last_message_at": None})
        per_chatbot.append({
            "id": bot_id_str,
            "name": bot.name,
            "slug": bot.slug,
            "is_active": bot.is_active,
            "tenant_id": str(bot.tenant_id),
            "message_count": msg_info["message_count"],
            "token_count": msg_info["token_count"],
            "document_count": doc_map.get(bot_id_str, 0),
            "last_message_at": msg_info["last_message_at"],
        })

    # 5. Messages by day (Time range: `days` parameter)
    cutoff = datetime.utcnow() - timedelta(days=days)

    daily_stmt = select(
        cast(Message.created_at, Date).label("date"),
        func.count(Message.id).label("count"),
    ).where(
        Message.chatbot_id.in_(chatbot_ids),
        Message.created_at >= cutoff,
    )

    if tenant is not None:
        daily_stmt = daily_stmt.where(Message.tenant_id == tenant.id)

    daily_stmt = daily_stmt.group_by(
        cast(Message.created_at, Date)
    ).order_by(
        cast(Message.created_at, Date)
    )
    
    daily_result = await db.execute(daily_stmt)

    messages_by_day_map = {}
    for row in daily_result:
        messages_by_day_map[str(row.date)] = row.count

    messages_by_day = []
    for i in range(days):
        day = (datetime.utcnow() - timedelta(days=(days - 1) - i)).date()
        messages_by_day.append({
            "date": str(day),
            "count": messages_by_day_map.get(str(day), 0),
        })

    return {
        "total_chatbots": len(chatbots),
        "active_chatbots": sum(1 for c in chatbots if c.is_active),
        "total_messages": totals.total_messages or 0,
        "total_tokens": totals.total_tokens or 0,
        "total_documents": total_documents,
        "per_chatbot": per_chatbot,
        "messages_by_day": messages_by_day,
    }
