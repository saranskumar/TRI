"""
RAG Service — Retrieval-Augmented Generation (FAISS)

Uses FAISS for fast similarity search to:
1. Ingest text chunks from PDFs or web crawls
2. Retrieve relevant context for a given query
"""

import re
import numpy as np
import faiss
import google.generativeai as genai

# ── Gemini Embedding Function ──────────────────────────────────────────────

def get_embedding(text: str) -> list[float]:
    """Get embedding from Gemini text-embedding-004 model."""
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document",
        )
        return result["embedding"]
    except Exception as e:
        print(f"[RAG] Embedding error: {e}")
        return []

# ── FAISS Vector Store ─────────────────────────────────────────────────────

# Store structure: { session_id: { "index": faiss.IndexFlatL2, "chunks": [str1, str2] } }
# Gemini embed dim is 768
_vector_store = {}
EMBEDDING_DIM = 768

def get_or_create_store(session_id: str):
    if session_id not in _vector_store:
        _vector_store[session_id] = {
            "index": faiss.IndexFlatL2(EMBEDDING_DIM),
            "chunks": []
        }
    return _vector_store[session_id]

def chunk_text(text: str, max_chars: int = 800, overlap: int = 80) -> list[str]:
    """Split text into overlapping chunks for better retrieval coverage."""
    text = re.sub(r"\n{3,}", "\n\n", text.strip())
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + max_chars, len(text))
        chunks.append(text[start:end])
        start += max_chars - overlap
    return [c.strip() for c in chunks if len(c.strip()) > 60]


def ingest_text(session_id: str, text: str, source: str = "upload") -> int:
    """Chunk and embed text into the session's FAISS index."""
    chunks = chunk_text(text)
    if not chunks:
        return 0

    embeddings = []
    valid_chunks = []
    
    for c in chunks:
        emb = get_embedding(c)
        if emb:
            embeddings.append(emb)
            valid_chunks.append(c)

    if not valid_chunks:
        return 0

    # FAISS requires float32 numpy arrays
    emb_matrix = np.array(embeddings, dtype=np.float32)
    
    store = get_or_create_store(session_id)
    store["index"].add(emb_matrix)
    store["chunks"].extend(valid_chunks)
        
    return len(valid_chunks)


def retrieve_context(session_id: str, query: str, top_k: int = 5) -> str:
    """Retrieve the top-k most relevant chunks for a query using FAISS."""
    if session_id not in _vector_store:
        return ""
        
    store = _vector_store[session_id]
    if store["index"].ntotal == 0:
        return ""
        
    query_emb = get_embedding(query)
    if not query_emb:
        return ""
        
    query_vec = np.array([query_emb], dtype=np.float32)
    
    # FAISS search returns (distances, indices)
    # L2 distance is smaller for closer vectors (unlike cosine similarity which is higher)
    distances, indices = store["index"].search(query_vec, min(top_k, store["index"].ntotal))
    
    best_chunks = []
    for i, idx in enumerate(indices[0]):
        if idx != -1:  # -1 means no neighbor found
            best_chunks.append(store["chunks"][idx])
            
    return "\n\n---\n\n".join(best_chunks)
