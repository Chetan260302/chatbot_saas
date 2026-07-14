# backend/app/ai/embeddings.py
# Generates embeddings via Hugging Face's free Serverless Inference API
# instead of loading BAAI/bge-base-en locally (which needs ~800MB for torch).

import httpx
import numpy as np
from app.core.config import settings

import asyncio

HF_MODEL = "BAAI/bge-base-en"
# HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
HF_API_URL = "https://router.huggingface.co/hf-inference/models/BAAI/bge-base-en/pipeline/feature-extraction"
BGE_QUERY_PREFIX = "Represent this sentence for searching relevant passages: "

# Timeout accommodates HF cold starts (model loading on first request)
_TIMEOUT = httpx.Timeout(60.0, connect=15.0)


def _headers() -> dict[str, str]:
    """Build auth headers. HF_TOKEN is optional but recommended for rate limits."""
    h = {"Content-Type": "application/json"}
    if settings.HF_TOKEN:
        h["Authorization"] = f"Bearer {settings.HF_TOKEN}"
    return h


async def _call_hf_api(texts: list[str]) -> list[list[float]]:
    """
    Call HF Serverless Inference API to embed a batch of texts.
    Includes retry logic with exponential backoff to handle transient 500/503 errors.
    Returns a list of 768-dim float vectors, one per input text.
    """
    # Safe client-side truncation to prevent exceeding 512 token model limit
    safe_texts = [t[:2000] for t in texts]

    payload = {
        "inputs": safe_texts,
        "parameters": {
            "truncate": True
        },
        "options": {"wait_for_model": True},
    }

    max_retries = 4
    base_delay = 1.5 # seconds

    for attempt in range(max_retries):
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT, trust_env=False) as client:
                resp = await client.post(HF_API_URL, json=payload, headers=_headers())
            
            # If successful (200), parse and return
            if resp.status_code == 200:
                data = resp.json()
                if not isinstance(data, list) or not data:
                    raise RuntimeError(f"Unexpected HF API response shape: {type(data)}")
                if isinstance(data[0], (int, float)):
                    data = [data]
                return data
                
            # If it's a server error or rate limit, retry
            if resp.status_code in [500, 502, 503, 504, 429]:
                if attempt == max_retries - 1:
                    raise RuntimeError(f"HF Inference API error {resp.status_code} after {max_retries} attempts: {resp.text[:500]}")
                
                delay = base_delay * (2 ** attempt) # 1.5s, 3s, 6s...
                print(f"⚠️ HF API returned {resp.status_code}. Retrying in {delay:.1f}s (Attempt {attempt + 1}/{max_retries})...")
                await asyncio.sleep(delay)
                continue
            
            # Non-retryable error (e.g. 400 bad request, 401 unauthorized)
            raise RuntimeError(f"HF Inference API error {resp.status_code}: {resp.text[:500]}")
            
        except (httpx.HTTPError, httpx.NetworkError) as e:
            if attempt == max_retries - 1:
                raise RuntimeError(f"HF Inference API network error after {max_retries} attempts: {e}")
            
            delay = base_delay * (2 ** attempt)
            print(f"⚠️ HF API Network error: {e}. Retrying in {delay:.1f}s (Attempt {attempt + 1}/{max_retries})...")
            await asyncio.sleep(delay)


def _pool_and_normalize(vec: list) -> list[float]:
    """
    Ensures the embedding is a flat 1D vector of shape [768],
    applying mean pooling if the API returned unpooled token embeddings (2D matrix).
    Then L2-normalizes the vector.
    """
    arr = np.array(vec, dtype=np.float32)
    
    # If the vector is unpooled (2D matrix of shape [sequence_length, embedding_dim])
    if arr.ndim == 2:
        # Perform mean pooling across the sequence length (axis 0)
        arr = np.mean(arr, axis=0)
    elif arr.ndim > 2:
        # Flatten anything else (e.g. batch dimension if present)
        arr = np.mean(arr, axis=tuple(range(arr.ndim - 1)))
        
    norm = np.linalg.norm(arr)
    if norm == 0:
        return arr.tolist()
    return (arr / norm).tolist()


async def embed_text(text: str, is_query: bool = True) -> list[float]:
    """
    Embed a single text string via HF Inference API.
    BGE requires a prefix on QUERIES but NOT on documents.
    is_query=True  → searching (add prefix)
    is_query=False → storing document chunks (no prefix)
    """
    if is_query:
        text = BGE_QUERY_PREFIX + text

    vectors = await _call_hf_api([text])
    return _pool_and_normalize(vectors[0])


async def embed_texts(texts: list[str], is_query: bool = False, batch_size: int = 32) -> list[list[float]]:
    """
    Embed multiple texts in batches via HF Inference API.
    Splits the texts into small batches to prevent high memory spikes
    and HF API payload limit issues.
    """
    if not texts:
        return []

    if is_query:
        texts = [BGE_QUERY_PREFIX + t for t in texts]

    all_vectors = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        vectors = await _call_hf_api(batch)
        for v in vectors:
            all_vectors.append(_pool_and_normalize(v))
            
    return all_vectors
