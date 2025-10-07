from __future__ import annotations

from typing import List, Dict, Tuple
import os
import math
import json
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class RAGService:
    def __init__(self, storage_dir: str = "rag_store"):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        genai.configure(api_key=api_key)
        # use text-embedding-004
        self.embedding_model = genai.GenerativeModel("text-embedding-004")  # type: ignore
        self.storage_dir = storage_dir
        os.makedirs(self.storage_dir, exist_ok=True)

    def _embed(self, texts: List[str]) -> np.ndarray:
        # batch to avoid length limits
        vectors: List[List[float]] = []
        for t in texts:
            # generate_content returns content; embeddings via embed_content
            resp = genai.embed_content(model="text-embedding-004", content=t)  # type: ignore
            vectors.append(resp["embedding"])  # type: ignore
        return np.array(vectors, dtype=np.float32)

    def _cosine_sim(self, a: np.ndarray, b: np.ndarray) -> float:
        denom = (np.linalg.norm(a) * np.linalg.norm(b))
        if denom == 0:
            return 0.0
        return float(np.dot(a, b) / denom)

    def _app_path(self, app_id: str) -> str:
        return os.path.join(self.storage_dir, f"{app_id}.json")

    def build_index(self, app_id: str, docs: List[Dict[str, str]]) -> None:
        texts = [d["text"] for d in docs if d.get("text")]
        if not texts:
            with open(self._app_path(app_id), "w", encoding="utf-8") as f:
                json.dump({"docs": [], "vectors": []}, f)
            return
        vecs = self._embed(texts)
        serial = {
            "docs": docs,
            "vectors": vecs.tolist(),
        }
        with open(self._app_path(app_id), "w", encoding="utf-8") as f:
            json.dump(serial, f)

    def retrieve(self, app_id: str, query: str, k: int = 5) -> List[Dict[str, str]]:
        path = self._app_path(app_id)
        if not os.path.exists(path):
            return []
        data = json.load(open(path, "r", encoding="utf-8"))
        docs = data.get("docs", [])
        vecs = np.array(data.get("vectors", []), dtype=np.float32)
        if len(docs) == 0 or vecs.size == 0:
            return []
        qv = self._embed([query])[0]
        sims = [self._cosine_sim(qv, v) for v in vecs]
        top_idx = np.argsort(sims)[::-1][:k]
        return [docs[int(i)] for i in top_idx]
