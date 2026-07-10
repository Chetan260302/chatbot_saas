# backend/app/api/v1/endpoints/analytics.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, cast, Date

from app.db.session import get_db
from app.core.dependencies import get_current_tenant
from app.models.tenant import Tenant
from app.models.chatbot import Chatbot
from app.models.message import Message
from app.models.document import Document

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def analytics_overview(
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Aggregated analytics across all chatbots for the current tenant.
    Returns total counts, per-chatbot breakdown, and messages by day (last 14 days).
    """
    # Get all chatbots for this tenant
    chatbots_result = await db.execute(
        select(Chatbot).where(Chatbot.tenant_id == tenant.id)
    )
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

    # Total messages and tokens across all bots
    totals_result = await db.execute(
        select(
            func.count(Message.id).label("total_messages"),
            func.coalesce(func.sum(Message.tokens_used), 0).label("total_tokens"),
        ).where(
            Message.tenant_id == tenant.id,
            Message.chatbot_id.in_(chatbot_ids),
        )
    )
    totals = totals_result.first()

    # Total documents
    docs_result = await db.execute(
        select(func.count(Document.id)).where(
            Document.chatbot_id.in_(chatbot_ids),
        )
    )
    total_documents = docs_result.scalar() or 0

    # Per-chatbot breakdown
    per_chatbot_msgs = await db.execute(
        select(
            Message.chatbot_id,
            func.count(Message.id).label("message_count"),
            func.coalesce(func.sum(Message.tokens_used), 0).label("token_count"),
            func.max(Message.created_at).label("last_message_at"),
        ).where(
            Message.tenant_id == tenant.id,
            Message.chatbot_id.in_(chatbot_ids),
        ).group_by(Message.chatbot_id)
    )
    msg_map = {}
    for row in per_chatbot_msgs:
        msg_map[str(row.chatbot_id)] = {
            "message_count": row.message_count,
            "token_count": row.token_count,
            "last_message_at": row.last_message_at.isoformat() if row.last_message_at else None,
        }

    per_chatbot_docs = await db.execute(
        select(
            Document.chatbot_id,
            func.count(Document.id).label("document_count"),
        ).where(
            Document.chatbot_id.in_(chatbot_ids),
        ).group_by(Document.chatbot_id)
    )
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
            "message_count": msg_info["message_count"],
            "token_count": msg_info["token_count"],
            "document_count": doc_map.get(bot_id_str, 0),
            "last_message_at": msg_info["last_message_at"],
        })

    # Messages by day (last 14 days)
    from datetime import datetime, timedelta
    cutoff = datetime.utcnow() - timedelta(days=14)

    daily_result = await db.execute(
        select(
            cast(Message.created_at, Date).label("date"),
            func.count(Message.id).label("count"),
        ).where(
            Message.tenant_id == tenant.id,
            Message.chatbot_id.in_(chatbot_ids),
            Message.created_at >= cutoff,
        ).group_by(
            cast(Message.created_at, Date)
        ).order_by(
            cast(Message.created_at, Date)
        )
    )

    # Fill in missing days with 0
    messages_by_day_map = {}
    for row in daily_result:
        messages_by_day_map[str(row.date)] = row.count

    messages_by_day = []
    for i in range(14):
        day = (datetime.utcnow() - timedelta(days=13 - i)).date()
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
