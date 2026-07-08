# backend/app/api/v1/endpoints/auth.py
from app.core.dependencies import get_current_tenant
from app.models.tenant import Tenant
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError
from fastapi import HTTPException

from app.db.session import get_db
from app.schemas.auth import TenantRegisterRequest, LoginRequest, TokenResponse, RefreshRequest, UserResponse, RegisterResponse, ChangePasswordRequest
from app.services.auth_service import register_tenant, login_user
from app.core.security import decode_token, create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(data: TenantRegisterRequest, db: AsyncSession = Depends(get_db)):
    """Sign up a new company + owner account."""
    return await register_tenant(data, db)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login and get JWT tokens."""
    return await login_user(data, db)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest):
    """Use refresh token to get a new access token without re-logging in."""
    try:
        payload = decode_token(data.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user_id = payload.get("sub")
        return TokenResponse(
            access_token=create_access_token(user_id),
            refresh_token=data.refresh_token,  # reuse same refresh token
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently logged-in user's profile."""
    return current_user

# backend/app/api/v1/endpoints/auth.py — add this

@router.get("/tenant/me")
async def get_my_tenant(tenant: Tenant = Depends(get_current_tenant)):
    return {"id": tenant.id, "name": tenant.name, "api_key": tenant.api_key, "plan": tenant.plan}


from app.core.security import verify_password, hash_password
from app.schemas.auth import ChangePasswordRequest

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the logged-in user's password."""
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.hashed_password = hash_password(data.new_password)
    db.add(current_user)
    await db.commit()
    return {"status": "ok", "message": "Password updated successfully"}


import uuid
from app.core.rate_limiter import redis_client
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest

@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generates a secure password reset token and saves in Redis."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user:
        return {"status": "ok", "message": "If this email is registered, you will receive a reset link."}
    
    if not user.is_verified:
        raise HTTPException(status_code=400, detail="Please verify your email address first.")
    
    token = str(uuid.uuid4())
    key = f"reset_password_token:{token}"
    await redis_client.set(key, str(user.id), ex=900)
    
    reset_url = f"http://localhost:5173/reset-password?token={token}"
    print(f"PASSWORD RESET LINK GENERATED: {reset_url}")
    
    return {
        "status": "ok",
        "message": "Password reset link generated successfully.",
        "dev_reset_url": reset_url
    }

@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Validates the reset token and updates the user's password."""
    key = f"reset_password_token:{data.token}"
    user_id = await redis_client.get(key)
    
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token")
    
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.hashed_password = hash_password(data.new_password)
    db.add(user)
    await db.commit()
    
    await redis_client.delete(key)
    
    return {"status": "ok", "message": "Your password has been reset successfully."}


from app.schemas.auth import VerifyEmailRequest

@router.post("/verify-email")
async def verify_email(
    data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db)
):
    """Marks user as email-verified using the Redis token."""
    key = f"email_verification_token:{data.token}"
    user_id = await redis_client.get(key)
    
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid or expired email verification token")
        
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    user.is_verified = True
    db.add(user)
    await db.commit()
    
    await redis_client.delete(key)
    return {"status": "ok", "message": "Email verified successfully!"}