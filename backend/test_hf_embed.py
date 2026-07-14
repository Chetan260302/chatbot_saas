# test_hf_embed.py

from pathlib import Path
from dotenv import load_dotenv

# Same logic as config.py — .env is in the project root, one level above backend/
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_FILE)

import os
import asyncio
import httpx

HF_TOKEN = os.getenv("HF_TOKEN")
print(f"Token is: {repr(HF_TOKEN)}")
print(f"Token length: {len(HF_TOKEN) if HF_TOKEN else 0}")

HF_API_URL = "https://router.huggingface.co/hf-inference/models/BAAI/bge-base-en/pipeline/feature-extraction"

async def main():
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            HF_API_URL,
            headers={"Authorization": f"Bearer {HF_TOKEN}"},
            json={"inputs": ["What is the refund policy?"], "options": {"wait_for_model": True}},
        )
        print(resp.status_code)
        print(resp.text)

asyncio.run(main())