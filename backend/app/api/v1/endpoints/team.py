# backend/app/api/v1/endpoints/team.py
"""
Team member management within a tenant.
Invite members, list, change roles, remove.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
import secrets

from app.db.session import get_db
from app.core.dependencies import get_current_user, get_current_tenant, require_role
from app.core.security import hash_password
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.team import (
    InviteMemberRequest,
    ChangeMemberRoleRequest,
    TeamMemberResponse,
)

router = APIRouter(prefix="/tenant/members", tags=["Team"])

ALLOWED_INVITE_ROLES = {"admin", "member"}


# ── List all members ─────────────────────────────────────────────

@router.get("", response_model=list[TeamMemberResponse])
async def list_members(
    _role: User = Depends(require_role("owner", "admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """List all users in the current tenant (owner and admin only)."""
    result = await db.execute(
        select(User)
        .where(User.tenant_id == tenant.id)
        .order_by(User.created_at.asc())
    )
    return result.scalars().all()


# ── Invite a new member ──────────────────────────────────────────

@router.post("/invite", response_model=TeamMemberResponse, status_code=201)
async def invite_member(
    data: InviteMemberRequest,
    current_user: User = Depends(require_role("owner", "admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Invite a new team member by email.
    Creates a User row with is_verified=False and a temporary password.
    The invite link is logged to console (email sending is stubbed for now).
    """
    # Validate role
    if data.role not in ALLOWED_INVITE_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{data.role}'. Allowed roles: {', '.join(ALLOWED_INVITE_ROLES)}"
        )

    # Check if email already exists (case-insensitive)
    existing = await db.execute(
        select(User).where(func.lower(User.email) == func.lower(data.email.strip()))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="A user with this email already exists")

    # Generate a temporary password and invite token
    temp_password = secrets.token_urlsafe(12)
    invite_token = secrets.token_urlsafe(32)

    new_user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(temp_password),
        role=data.role,
        is_active=True,
        is_verified=True, # later False 
        tenant_id=tenant.id,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Stub: log the invite link to console (real email sending comes later)
    invite_url = f"http://localhost:5173/login?invited=true&email={data.email}"
    print(f"📧 TEAM INVITE — {data.email} invited as '{data.role}' to tenant '{tenant.name}'")
    print(f"   Temporary password: {temp_password}")
    print(f"   Invite URL: {invite_url}")

    return new_user


# ── Change a member's role ────────────────────────────────────────

@router.patch("/{user_id}/role", response_model=TeamMemberResponse)
async def change_member_role(
    user_id: UUID,
    data: ChangeMemberRoleRequest,
    current_user: User = Depends(require_role("owner")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """Change a member's role (owner only). Cannot target the owner or set role to owner."""
    if data.role not in ALLOWED_INVITE_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{data.role}'. Allowed roles: {', '.join(ALLOWED_INVITE_ROLES)}"
        )

    # Find the target user
    result = await db.execute(
        select(User).where(User.id == user_id, User.tenant_id == tenant.id)
    )
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Team member not found")

    # Cannot change the owner's own role
    if target.role == "owner":
        raise HTTPException(status_code=403, detail="Cannot change the owner's role")

    # Cannot change your own role
    if target.id == current_user.id:
        raise HTTPException(status_code=403, detail="Cannot change your own role")

    target.role = data.role
    await db.commit()
    await db.refresh(target)
    return target


# ── Remove a member ───────────────────────────────────────────────

@router.delete("/{user_id}", status_code=204)
async def remove_member(
    user_id: UUID,
    current_user: User = Depends(require_role("owner", "admin")),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Remove a member from the tenant.
    Rules:
    - Cannot remove the owner
    - Admin cannot remove another admin
    - Cannot remove yourself
    """
    result = await db.execute(
        select(User).where(User.id == user_id, User.tenant_id == tenant.id)
    )
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Team member not found")

    # Cannot remove the owner
    if target.role == "owner":
        raise HTTPException(status_code=403, detail="Cannot remove the tenant owner")

    # Cannot remove yourself
    if target.id == current_user.id:
        raise HTTPException(status_code=403, detail="Cannot remove yourself from the team")

    # Admin cannot remove another admin
    if current_user.role == "admin" and target.role == "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins cannot remove other admins. Only the owner can do this."
        )

    await db.delete(target)
    await db.commit()
