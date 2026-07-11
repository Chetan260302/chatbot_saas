# backend/app/schemas/chatbot.py
from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime


class ChatbotCreate(BaseModel):
    name:          str
    description:   Optional[str] = None
    system_prompt: Optional[str] = None
    widget_config: Optional[dict] = {}
    domain:        Optional[str] = "general"
    tenant_id:     Optional[UUID] = None  # superadmin only: create bot for another tenant


class ChatbotUpdate(BaseModel):
    name:          Optional[str] = None
    description:   Optional[str] = None
    system_prompt: Optional[str] = None
    widget_config: Optional[dict] = None
    is_active:     Optional[bool] = None
    domain:        Optional[str] = None


class ChatbotResponse(BaseModel):
    id:            UUID
    name:          str
    slug:          Optional[str] = None
    description:   Optional[str]
    system_prompt: str
    widget_config: dict
    is_active:     bool
    domain:        str
    tenant_id:     UUID
    tenant_name:   Optional[str] = None  # populated for superadmin views
    created_at:    datetime

    model_config = {"from_attributes": True}