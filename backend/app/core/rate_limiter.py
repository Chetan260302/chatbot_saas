import redis.asyncio as redis
from fastapi import Request, HTTPException, status
from app.core.config import settings

# Initialize async Redis client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def rate_limit(request: Request):
    """
    Redis-based rate limiting by client IP.
    Limits to 20 chat requests per minute per IP to prevent spam/abuse of LLM tokens.
    """
    client_ip = request.client.host if request.client else "unknown"
    path = request.url.path
    key = f"rate_limit:{client_ip}:{path}"

    # Increment request counter in Redis
    try:
        current = await redis_client.get(key)
        if current is not None and int(current) >= 20:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please wait a minute before trying again."
            )

        # Set sliding window or increment
        async with redis_client.pipeline(transaction=True) as pipe:
            await pipe.incr(key)
            # Only set expire if it's a new key
            if current is None:
                await pipe.expire(key, 60)
            await pipe.execute()
    except redis.RedisError as e:
        # Fallback gracefully if Redis is down, so app doesn't crash
        print(f"Redis connection error in rate limiter: {e}")
        return
