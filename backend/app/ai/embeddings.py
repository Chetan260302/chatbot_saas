# backend/app/ai/embeddings.py
# Generates embeddings via Hugging Face's free Serverless Inference API
# instead of loading BAAI/bge-base-en locally (which needs ~800MB for torch).

import httpx
import numpy as np
from app.core.config import settings

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

    async with httpx.AsyncClient(timeout=_TIMEOUT, trust_env=False) as client:
        resp = await client.post(HF_API_URL, json=payload, headers=_headers())

    if resp.status_code != 200:
        body = resp.text[:500]
        raise RuntimeError(
            f"HF Inference API error {resp.status_code} for {HF_MODEL}: {body}"
        )

    data = resp.json()

    # The API returns [[float, ...], ...] for batch input
    if not isinstance(data, list) or not data:
        raise RuntimeError(f"Unexpected HF API response shape: {type(data)}")

    # If single text was sent, API may return [float, ...] instead of [[float, ...]]
    if isinstance(data[0], (int, float)):
        data = [data]

    return data


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


async def embed_texts(texts: list[str], is_query: bool = False) -> list[list[float]]:
    """
    Embed multiple texts in one batch via HF Inference API.
    For document chunks — no prefix by default.
    """
    if is_query:
        texts = [BGE_QUERY_PREFIX + t for t in texts]

    vectors = await _call_hf_api(texts)
    return [_pool_and_normalize(v) for v in vectors]
