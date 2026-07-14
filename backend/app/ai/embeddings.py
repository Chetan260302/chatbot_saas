# backend/app/ai/embeddings.py
from app.core.config import settings


_embeddings_model = None
BGE_QUERY_PREFIX = "Represent this sentence for searching relevant passages: "

def get_embeddings_model():
    global _embeddings_model
    if _embeddings_model is None:
        from sentence_transformers import SentenceTransformer
        _embeddings_model = SentenceTransformer("BAAI/bge-base-en")
    return _embeddings_model

import numpy as np

def normalize_embedding(embedding: list[float]) -> list[float]:
    vec  = np.array(embedding, dtype=np.float32)
    norm = np.linalg.norm(vec)
    if norm == 0:
        return embedding
    return (vec / norm).tolist()

#used with huggingface
# async def embed_text(text: str) -> list[float]:
#     raw = embeddings_model.embed_query(text)
#     return normalize_embedding(raw)

# async def embed_texts(texts: list[str]) -> list[list[float]]:
#     raw = embeddings_model.embed_documents(texts)
#     return [normalize_embedding(e) for e in raw]

async def embed_text(text: str, is_query: bool = True) -> list[float]:
    """
    BGE requires a prefix on QUERIES but NOT on documents.
    is_query=True  → searching (add prefix)
    is_query=False → storing document chunks (no prefix)
    """
    if is_query:
        text = BGE_QUERY_PREFIX + text
    model = get_embeddings_model()
    raw = model.encode(text, normalize_embeddings=True).tolist()
    return raw


async def embed_texts(texts: list[str], is_query: bool = False) -> list[list[float]]:
    """For document chunks — no prefix."""
    model = get_embeddings_model()
    raw = model.encode(texts, normalize_embeddings=True).tolist()
    return raw


# async def embed_text(text: str) -> list[float]:
#     """Convert a string into a vector of numbers."""
#     return embeddings_model.embed_query(text)


# async def embed_texts(texts: list[str]) -> list[list[float]]:
#     """Convert multiple strings into vectors (batched for efficiency)."""
#     return embeddings_model.embed_documents(texts)
