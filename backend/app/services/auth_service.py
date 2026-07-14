# backend/app/services/auth_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.models.tenant import Tenant
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.schemas.auth import TenantRegisterRequest, LoginRequest, TokenResponse, RegisterResponse
import re
from app.core.config import settings

def slugify(text: str) -> str:
    """Convert 'Acme Corp' → 'acme-corp' for URL-friendly tenant slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text


async def register_tenant(data: TenantRegisterRequest, db: AsyncSession) -> RegisterResponse:
    """
    Creates a new tenant (company) + owner user in one transaction.
    This is what happens when someone signs up on your SaaS.
    """
    # Check email not already used (case-insensitive)
    existing = await db.execute(
        select(User).where(func.lower(User.email) == func.lower(data.email.strip()))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create unique slug — if "acme-corp" exists, try "acme-corp-2" etc.
    base_slug = slugify(data.company_name)
    slug = base_slug
    counter = 1
    while True:
        existing_tenant = await db.execute(select(Tenant).where(Tenant.slug == slug))
        if not existing_tenant.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    # Create tenant
    from datetime import datetime, timedelta
    now_dt = datetime.utcnow()
    tenant = Tenant(
        name=data.company_name,
        slug=slug,
        plan="free",
        plan_started_at=now_dt,
        trial_ends_at=now_dt + timedelta(days=30),
    )
    db.add(tenant)
    await db.flush()  # flush to get tenant.id without committing yet

    # Create owner user
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=UserRole.OWNER,
        tenant_id=tenant.id,
        is_verified=True, # later False, true when has proper domain
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate email verification token now for testing
    import uuid
    from app.core.rate_limiter import redis_client
    verification_token = str(uuid.uuid4())
    key = f"email_verification_token:{verification_token}"
    await redis_client.set(key, str(user.id), ex=86400) # 24h

    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
    print(f"EMAIL VERIFICATION LINK GENERATED: {verification_url}")

    return RegisterResponse(
        status="ok",
        message="Registration successful. Please verify your email address to log in.",
        verification_required=not user.is_verified,
        dev_verification_url=verification_url
    )


async def login_user(data: LoginRequest, db: AsyncSession) -> TokenResponse:
    """Verify credentials and return JWT tokens."""
    result = await db.execute(
        select(User).where(func.lower(User.email) == func.lower(data.email.strip()))
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email is not registered"
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")
    if not user.is_verified:
        # Check if there is an existing token in Redis
        # If not, we can generate a new one helpfully for ease of testing!
        import uuid
        from app.core.rate_limiter import redis_client
        token = str(uuid.uuid4())
        await redis_client.set(f"email_verification_token:{token}", str(user.id), ex=86400)
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        print(f"RESENT EMAIL VERIFICATION LINK: {verification_url}")
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Please verify your email address first. Verification link: {verification_url}"
        )

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )