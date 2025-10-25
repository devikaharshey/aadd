# utils/embedding_utils.py
import os
import numpy as np
from typing import List, Dict
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

CACHE_DIR = "/tmp/hf_cache"
os.environ["HF_HOME"] = CACHE_DIR
os.environ["TRANSFORMERS_CACHE"] = CACHE_DIR
os.environ["HF_DATASETS_CACHE"] = CACHE_DIR
os.makedirs(CACHE_DIR, exist_ok=True)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

try:
    model = SentenceTransformer(MODEL_NAME)
except Exception as e:
    raise RuntimeError(f"Failed to load SentenceTransformer model: {e}")


def get_text_embedding(text: str) -> np.ndarray:
    embedding = model.encode(text, convert_to_numpy=True)
    return np.array(embedding, dtype=np.float32)


def detect_textual_duplicates(
    records: List[Dict[str, str]], threshold: float = 0.9
) -> List[List[Dict[str, str]]]:
    if not records:
        return []

    embeddings = np.stack([get_text_embedding(r["text"]) for r in records])
    sims = cosine_similarity(embeddings)

    visited = set()
    clusters = []

    for i, rec in enumerate(records):
        if i in visited:
            continue
        cluster = [rec]
        visited.add(i)
        for j in range(i + 1, len(records)):
            if sims[i, j] >= threshold:
                cluster.append(records[j])
                visited.add(j)
        if len(cluster) > 1:
            clusters.append(cluster)

    return clusters