# backend/app/api/v1/endpoints/documents.py
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.db.session import get_db
from app.core.dependencies import get_current_tenant, require_role
from app.models.tenant import Tenant
from app.models.document import Document
from app.services.document_service_ import upload_document

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("", status_code=201, dependencies=[Depends(require_role("owner", "admin"))])
async def upload(
    file:       UploadFile = File(...),
    chatbot_id: str        = Form(...),
    tenant:     Tenant     = Depends(get_current_tenant),
    db:         AsyncSession = Depends(get_db),
):
    from app.services.usage_service import check_can_upload_document
    usage_check = await check_can_upload_document(tenant, chatbot_id, db)
    if not usage_check["allowed"]:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "plan_limit_reached",
                "reason": usage_check["reason"],
                "current_count": usage_check["current_count"],
                "limit": usage_check["limit"],
                "suggested_plan": usage_check["suggested_plan"],
                "message": f"Document limit reached for this chatbot ({usage_check['current_count']}/{usage_check['limit']}). Upgrade your plan to upload more."
            }
        )

    doc = await upload_document(file, chatbot_id, tenant, db)
    return {
        "id":          str(doc.id),
        "filename":    doc.filename,
        "status":      doc.status,
        "chunk_count": doc.chunk_count,
        "file_size":   doc.file_size,
    }


@router.get("/chatbot/{chatbot_id}")
async def list_documents(
    chatbot_id: UUID,
    tenant:     Tenant       = Depends(get_current_tenant),
    db:         AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(
            Document.chatbot_id == chatbot_id,
            Document.tenant_id  == tenant.id
        ).order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()
    return [
        {
            "id":          str(d.id),
            "filename":    d.filename,
            "status":      d.status,
            "chunk_count": d.chunk_count,
            "file_type":   d.file_type,
            "file_size":   d.file_size,
            "created_at":  d.created_at,
        }
        for d in docs
    ]


@router.delete("/{doc_id}", status_code=204, dependencies=[Depends(require_role("owner", "admin"))])
async def delete_document(
    doc_id: UUID,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Document).where(
            Document.id == doc_id,
            Document.tenant_id == tenant.id
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    await db.commit()
    return None