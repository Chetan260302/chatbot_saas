# backend/download_model.py
import os
import sys

def main():
    print("Downloading SentenceTransformer model 'BAAI/bge-base-en'...")
    try:
        from sentence_transformers import SentenceTransformer
        # This will download the model and save it to the default cache directory
        SentenceTransformer("BAAI/bge-base-en")
        print("Model downloaded successfully!")
    except Exception as e:
        print(f"Error downloading model: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
