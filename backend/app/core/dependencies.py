# backend/app/core/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.tenant import Tenant
from fastapi import Header,Query


bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Reads Bearer token from Authorization header,
    validates it, and returns the logged-in User object.
    Add this as a dependency to any route that needs auth.
    """
    # print(f"DEBUG token received: {credentials.credentials[:50]}...")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(credentials.credentials)
        print(f"DEBUG token payload: {payload}")
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    print(f"DEBUG user from DB: {user}")

    if user is None or not user.is_active:
        raise credentials_exception
    return user


async def get_current_tenant(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Tenant:
    """Returns the tenant that the current user belongs to."""
    result = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    tenant = result.scalar_one_or_none()
    
    if not tenant or not tenant.is_active:
        raise HTTPException(status_code=403, detail="Tenant not found or inactive")
    return tenant   


def require_role(*roles: str):
    """
    Role-based access control — use like:
    @router.delete(..., dependencies=[Depends(require_role("owner", "admin"))])
    """
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

async def get_tenant_by_api_key(
    x_api_key:str = Header(...,alias="X-API-Key"),
    db:AsyncSession = Depends(get_db)
) -> Tenant:
    """ Used by PUBLIC endpoints (the embedded widget).
    No login required — just a valid API key identifies the business.
    """
    result = await db.execute(select(Tenant).where(Tenant.api_key==x_api_key,Tenant.is_active==True))
    tenant = result.scalar_one_or_none()
    
    if not tenant or not tenant.is_active:
        raise HTTPException(status_code=403, detail="Invalid API key orTenant not found or inactive")
    return tenant



async def get_effective_tenant(
    current_user: User = Depends(get_current_user),
    override_tenant_id: str | None = Query(None, alias="tenant_id"),
    db: AsyncSession = Depends(get_db),
) -> Tenant | None:
    """
    Normal users: always their own tenant, override_tenant_id ignored.
    Superadmin: can pass ?tenant_id=xxx to view/manage ANY tenant.
    If superadmin passes nothing, returns None → caller shows ALL tenants' data.
    """
    if current_user.is_superadmin and override_tenant_id:
        result = await db.execute(select(Tenant).where(Tenant.id == override_tenant_id))
        return result.scalar_one_or_none()

    if current_user.is_superadmin and not override_tenant_id:
        return None  # signal: "no filter, show everything"

    # Normal user — always their own tenant
    result = await db.execute(select(Tenant).where(Tenant.id == current_user.tenant_id))
    return result.scalar_one_or_none()