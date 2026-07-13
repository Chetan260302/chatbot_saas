# backend/app/services/usage_service.py
import calendar
from datetime import datetime, timedelta
from sqlalchemy import select, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.tenant import Tenant
from app.models.chatbot import Chatbot
from app.models.document import Document
from app.models.message import Message
from app.core.plan_limits import PLAN_LIMITS


def get_billing_period_start(plan_started_at: datetime) -> datetime:
    """
    Returns the start date of the current billing month anniversary.
    E.g. if plan_started_at is Jan 15, and today is March 10, the current
    billing period start is Feb 15.
    """
    if not plan_started_at:
        return datetime.utcnow() - timedelta(days=30)
    
    now = datetime.utcnow()
    start_date = plan_started_at
    while True:
        month = start_date.month
        year = start_date.year
        next_month = month + 1
        next_year = year
        if next_month > 12:
            next_month = 1
            next_year += 1
        
        last_day = calendar.monthrange(next_year, next_month)[1]
        day = min(plan_started_at.day, last_day)
        
        next_anniversary = datetime(
            next_year, next_month, day,
            start_date.hour, start_date.minute, start_date.second
        )
        if next_anniversary > now:
            break
        start_date = next_anniversary
        
    return start_date


async def get_current_period_usage(tenant_id, db: AsyncSession, period_start: datetime) -> dict:
    """
    Counts unique conversations (session_ids) and total messages
    in the database for the given tenant since `period_start`.
    """
    # Count unique sessions (conversations)
    session_result = await db.execute(
        select(func.count(distinct(Message.session_id)))
        .where(
            Message.tenant_id == tenant_id,
            Message.created_at >= period_start
        )
    )
    conversations_count = session_result.scalar_one() or 0

    # Count total messages
    msg_result = await db.execute(
        select(func.count(Message.id))
        .where(
            Message.tenant_id == tenant_id,
            Message.created_at >= period_start
        )
    )
    messages_count = msg_result.scalar_one() or 0

    return {
        "conversations_count": conversations_count,
        "messages_count": messages_count,
    }


async def check_can_create_chatbot(tenant: Tenant, db: AsyncSession) -> dict:
    """
    Checks if the tenant has exceeded their chatbot limit.
    """
    plan = tenant.plan or "free"
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    limit = limits["max_chatbots"]

    result = await db.execute(
        select(func.count(Chatbot.id)).where(Chatbot.tenant_id == tenant.id)
    )
    current_count = result.scalar_one() or 0

    allowed = current_count < limit
    suggested_plan = "starter" if plan == "free" else "growth" if plan == "starter" else "enterprise" if plan == "growth" else None

    return {
        "allowed": allowed,
        "reason": "chatbot_limit" if not allowed else None,
        "current_plan": plan,
        "current_count": current_count,
        "limit": limit,
        "suggested_plan": suggested_plan if not allowed else None,
    }


async def check_can_upload_document(tenant: Tenant, chatbot_id: str, db: AsyncSession) -> dict:
    """
    Checks if the chatbot has exceeded the documents per chatbot limit.
    """
    plan = tenant.plan or "free"
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    limit = limits["max_documents_per_chatbot"]

    result = await db.execute(
        select(func.count(Document.id)).where(
            Document.chatbot_id == chatbot_id,
            Document.tenant_id == tenant.id
        )
    )
    current_count = result.scalar_one() or 0

    allowed = current_count < limit
    suggested_plan = "starter" if plan == "free" else "growth" if plan == "starter" else "enterprise" if plan == "growth" else None

    return {
        "allowed": allowed,
        "reason": "document_limit" if not allowed else None,
        "current_plan": plan,
        "current_count": current_count,
        "limit": limit,
        "suggested_plan": suggested_plan if not allowed else None,
    }


async def check_can_send_message(tenant: Tenant, db: AsyncSession) -> dict:
    """
    Checks if the tenant is blocked from sending messages due to:
    1. Free trial expiration
    2. Exceeding monthly conversation limit
    3. Exceeding monthly message limit
    """
    # 1. Check free trial expiration
    plan = tenant.plan or "free"
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    
    if plan == "free" and tenant.trial_ends_at:
        if datetime.utcnow() > tenant.trial_ends_at:
            return {
                "allowed": False,
                "reason": "trial_expired",
                "current_plan": plan,
                "suggested_plan": "starter",
                "detail": "Free trial has expired. Upgrade your plan to resume messaging."
            }

    # 2. Get current period usage
    period_start = get_billing_period_start(tenant.plan_started_at)
    usage = await get_current_period_usage(tenant.id, db, period_start)
    
    # 3. Check limits
    conv_limit = limits["max_conversations_per_month"]
    msg_limit = limits["max_messages_per_month"]

    if usage["conversations_count"] >= conv_limit:
        return {
            "allowed": False,
            "reason": "conversation_limit",
            "current_plan": plan,
            "suggested_plan": "starter" if plan == "free" else "growth" if plan == "starter" else "enterprise",
            "detail": f"Monthly conversation limit reached ({usage['conversations_count']}/{conv_limit}). Upgrade to continue."
        }

    if usage["messages_count"] >= msg_limit:
        return {
            "allowed": False,
            "reason": "message_limit",
            "current_plan": plan,
            "suggested_plan": "starter" if plan == "free" else "growth" if plan == "starter" else "enterprise",
            "detail": f"Monthly message limit reached ({usage['messages_count']}/{msg_limit}). Upgrade to continue."
        }

    return {
        "allowed": True,
        "current_plan": plan,
        "usage": usage,
        "limits": limits,
    }


async def get_usage_summary(tenant: Tenant, db: AsyncSession) -> dict:
    """
    Generates a full dashboard summary for frontend progress bars and badges.
    """
    plan = tenant.plan or "free"
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    
    period_start = get_billing_period_start(tenant.plan_started_at)
    usage = await get_current_period_usage(tenant.id, db, period_start)

    # Chatbots count
    cb_result = await db.execute(
        select(func.count(Chatbot.id)).where(Chatbot.tenant_id == tenant.id)
    )
    chatbots_count = cb_result.scalar_one() or 0

    # Trial days remaining
    trial_days_remaining = None
    if plan == "free" and tenant.trial_ends_at:
        diff = tenant.trial_ends_at - datetime.utcnow()
        trial_days_remaining = max(0, diff.days)

    return {
        "plan": plan,
        "trial_ends_at": tenant.trial_ends_at,
        "trial_days_remaining": trial_days_remaining,
        "period_start": period_start,
        "usage": {
            "chatbots": chatbots_count,
            "conversations": usage["conversations_count"],
            "messages": usage["messages_count"],
        },
        "limits": {
            "chatbots": limits["max_chatbots"],
            "conversations": limits["max_conversations_per_month"],
            "messages": limits["max_messages_per_month"],
            "documents_per_chatbot": limits["max_documents_per_chatbot"],
        }
    }
