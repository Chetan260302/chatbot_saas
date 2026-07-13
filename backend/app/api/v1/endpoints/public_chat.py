# backend/app/api/v1/endpoints/public_chat.py
# NEW FILE — this is what the embedded widget calls

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.db.session import get_db
from app.core.dependencies import get_tenant_by_api_key
from app.models.tenant import Tenant
from app.models.chatbot import Chatbot
from app.models.message import Message
from app.schemas.chat import ChatRequest
from app.ai.rag_pipeline import stream_chat_response

router = APIRouter(prefix="/public", tags=["Public Widget"])


from app.core.rate_limiter import rate_limit

@router.post("/chat/stream", dependencies=[Depends(rate_limit)])
async def public_chat_stream(
    data:   ChatRequest,
    tenant: Tenant       = Depends(get_tenant_by_api_key),   # ← API key, not JWT
    db:     AsyncSession = Depends(get_db),
):
    """
    This is the ONLY endpoint your embedded widget calls.
    Identified by API key, not user login.
    """
    from app.services.usage_service import check_can_send_message
    usage_check = await check_can_send_message(tenant, db)
    if not usage_check["allowed"]:
        raise HTTPException(
            status_code=403,
            detail="This assistant is temporarily unavailable. Please contact the business directly."
        )

    result = await db.execute(
        select(Chatbot).where(
            Chatbot.id        == data.chatbot_id,
            Chatbot.tenant_id == tenant.id,
            Chatbot.is_active == True,
        )
    )
    chatbot = result.scalar_one_or_none()
    if not chatbot:
        raise HTTPException(status_code=404, detail="Chatbot not found")

    user_msg = Message(
        role="user", content=data.message,
        session_id=data.session_id,
        chatbot_id=chatbot.id, tenant_id=tenant.id,
    )
    db.add(user_msg)
    await db.commit()

    full_response = []

    async def generate():
        async for token in stream_chat_response(
            question=data.message,
            chatbot_id=str(chatbot.id),
            tenant_id=str(tenant.id),
            system_prompt=chatbot.system_prompt,
            domain=chatbot.domain or "general",
            db=db,
            bot_name=chatbot.name,
        ):
            full_response.append(token)
            yield token

        full_text = "".join(full_response)
        tokens    = len(full_text.split()) * 1.3  # rough estimate

        from app.db.session import AsyncSessionLocal
        async with AsyncSessionLocal() as local_db:
            bot_msg = Message(
                role="assistant", content=full_text,
                session_id=data.session_id,
                chatbot_id=chatbot.id, tenant_id=tenant.id,
                tokens_used=int(tokens),
            )
            local_db.add(bot_msg)
            await local_db.commit()

    return StreamingResponse(generate(), media_type="text/plain")