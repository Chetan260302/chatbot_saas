# backend/test_hf_embed.py
"""
Quick test: verifies the HF Inference API integration produces
768-dim embeddings from BAAI/bge-base-en.

Usage:
    cd backend
    python test_hf_embed.py
"""
import asyncio
import sys
import os

# Ensure the backend package is importable
sys.path.insert(0, os.path.dirname(__file__))


async def main():
    from app.ai.embeddings import embed_text, embed_texts

    print("Testing embed_text (single, is_query=True) ...")
    vec = await embed_text("What are your business hours?")
    print(f"  Dimension: {len(vec)}  (expected 768)")
    print(f"  First 5 values: {vec[:5]}")
    assert len(vec) == 768, f"Expected 768, got {len(vec)}"

    print("\nTesting embed_text (single, is_query=False) ...")
    vec2 = await embed_text("Our office is open from 9 AM to 5 PM.", is_query=False)
    print(f"  Dimension: {len(vec2)}  (expected 768)")
    print(f"  First 5 values: {vec2[:5]}")
    assert len(vec2) == 768, f"Expected 768, got {len(vec2)}"

    print("\nTesting embed_texts (batch, is_query=False) ...")
    vecs = await embed_texts([
        "We accept Visa and MasterCard.",
        "Free shipping on orders over $50.",
    ])
    print(f"  Batch size: {len(vecs)}  (expected 2)")
    for i, v in enumerate(vecs):
        print(f"  [{i}] Dimension: {len(v)}, first 3: {v[:3]}")
        assert len(v) == 768, f"Expected 768, got {len(v)}"

    print("\n✅ All tests passed!")


if __name__ == "__main__":
    asyncio.run(main())
