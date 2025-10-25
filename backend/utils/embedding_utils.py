# utils/embedding_utils.py
import numpy as np
from typing import List, Dict
from sklearn.metrics.pairwise import cosine_similarity  # type: ignore
from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"
model = SentenceTransformer(MODEL_NAME)


def get_text_embedding(text: str) -> np.ndarray:
    """
    Generate an embedding for the given text using sentence-transformers.
    Returns a NumPy array of embedding values.
    """
    embedding = model.encode(text, convert_to_numpy=True)
    return np.array(embedding, dtype=np.float32)


def detect_textual_duplicates(
    records: List[Dict[str, str]], threshold: float = 0.9
) -> List[List[Dict[str, str]]]:
    """
    Detects textual duplicates using cosine similarity between embeddings.
    
    Args:
        records: list of dicts like [{ "id": "123", "text": "some text" }]
        threshold: similarity threshold for considering duplicates.
    
    Returns:
        List of clusters, each a list of duplicate records.
    """
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