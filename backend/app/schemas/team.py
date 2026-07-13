# backend/app/schemas/team.py
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional


class InviteMemberRequest(BaseModel):
    email: EmailStr
    full_name: str
    role: str  # "admin" or "member" only — never "owner"


class ChangeMemberRoleRequest(BaseModel):
    role: str  # "admin" or "member" only


class TeamMemberResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
