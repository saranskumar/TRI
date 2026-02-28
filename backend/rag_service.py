"""
RAG Service — Retrieval-Augmented Generation (FAISS)

Uses FAISS for fast similarity search to:
1. Ingest text chunks from PDFs or web crawls
2. Retrieve relevant context for a given query
"""

import os
import re
import json
import numpy as np
import faiss
from dotenv import load_dotenv

# Load .env first, overriding any stale system env vars
load_dotenv(override=True)

from google import genai


def _get_client() -> genai.Client:
    """Lazily build a genai Client using the freshly-loaded API key."""
    api_key = os.environ.get("GEMINI_API_KEY")
    return genai.Client(api_key=api_key)


# Gemini Embedding Function
def get_embedding(text: str) -> list[float]:
    """Get embedding from Gemini gemini-embedding-001 model."""
    try:
        client = _get_client()
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
        )
        return result.embeddings[0].values
    except Exception as e:
        print(f"[RAG] Embedding error: {e}")
        return []

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Get embeddings in bulk for a list of strings."""
    if not texts: return []
    try:
        client = _get_client()
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=texts,
        )
        return [e.values for e in result.embeddings]
    except Exception as e:
        print(f"[RAG] Batch Embedding error: {e}")
        return []

# FAISS Vector Store Structure for Tagged RAG
# Store structure: 
# { session_id: { "index": faiss.IndexFlatL2, "chunks": [str1, str2], "metadata": [{"subject": "", "topic": ""}] } }
# _vector_store = {}
_vector_store = {}
EMBEDDING_DIM = 3072

VECTOR_STORE_DIR = os.path.join(os.path.dirname(__file__), "vectorstore")
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

def _get_store_paths(session_id: str):
    base_path = os.path.join(VECTOR_STORE_DIR, f"{session_id}")
    return f"{base_path}.index", f"{base_path}_meta.json"

def save_store(session_id: str):
    if session_id not in _vector_store:
        return
        
    store = _vector_store[session_id]
    index_path, meta_path = _get_store_paths(session_id)
    faiss.write_index(store["index"], index_path)
    
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump({
            "chunks": store["chunks"],
            "metadata": store["metadata"]
        }, f, ensure_ascii=False, indent=2)
        
def load_store(session_id: str) -> bool:
    index_path, meta_path = _get_store_paths(session_id)
    if not os.path.exists(index_path) or not os.path.exists(meta_path):
        return False
        
    try:
        index = faiss.read_index(index_path)
        with open(meta_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        _vector_store[session_id] = {
            "index": index,
            "chunks": data.get("chunks", []),
            "metadata": data.get("metadata", [])
        }
        return True
    except Exception as e:
        print(f"[RAG] Error loading store {session_id}: {e}")
        return False

def get_or_create_store(session_id: str):
    if session_id not in _vector_store:
        if not load_store(session_id):
            _vector_store[session_id] = {
                "index": faiss.IndexFlatL2(EMBEDDING_DIM),
                "chunks": [],
                "metadata": []
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

def ingest_text(
    session_id: str, 
    text: str, 
    subject: str = "General", 
    topic: str = "General", 
    exam_relevance: str = "Medium",
    source: str = ""
) -> int:
    """Chunk and embed text into FAISS, attaching structural JSON metadata for conditional filtering."""
    chunks = chunk_text(text)
    if not chunks:
        return 0

    embeddings = []
    valid_chunks = []
    valid_metadata = []
    
    # Process in batches to avoid API timeouts
    batch_size = 80
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        batch_embs = get_embeddings(batch)
        
        if batch_embs and len(batch_embs) == len(batch):
            for c, emb in zip(batch, batch_embs):
                embeddings.append(emb)
                valid_chunks.append(c)
                valid_metadata.append({
                    "subject": subject,
                    "topic": topic,
                    "exam_relevance": exam_relevance,
                    "source": source
                })
        else:
            print(f"[RAG] Warning: Batch embedding failed for {len(batch)} chunks, skipping this batch.")

    if not valid_chunks:
        return 0

    emb_matrix = np.array(embeddings, dtype=np.float32)
    
    store = get_or_create_store(session_id)
    store["index"].add(emb_matrix)
    store["chunks"].extend(valid_chunks)
    store["metadata"].extend(valid_metadata)
        
    return len(valid_chunks)

def retrieve_context(session_id: str, query: str, mode: str = "doubt", filter_subject: str = None, filter_topic: str = None, top_k: int = 5) -> str:
    """
    Retrieve top-k chunks from FAISS.
    Modes:
      - Doubt: Filters strictly by Subject + Topic.
      - Planner: Filters strictly by Subject with High exam relevance.
      - Quiz: Filters by Topic for conceptual chunks.
    """
    if session_id not in _vector_store:
        return ""
        
    store = _vector_store[session_id]
    if store["index"].ntotal == 0:
        return ""
        
    query_emb = get_embedding(query)
    if not query_emb:
        return ""
        
    query_vec = np.array([query_emb], dtype=np.float32)
    
    # Retrieve more chunks initially so we can post-filter them using metadata
    search_k = min(top_k * 3, store["index"].ntotal)
    distances, indices = store["index"].search(query_vec, search_k)
    
    best_chunks = []
    for i, idx in enumerate(indices[0]):
        if idx == -1: continue
            
        meta = store["metadata"][idx]
        
        # Apply Tagged RAG Context Filters based on mode
        if mode == "doubt":
            if filter_subject and meta["subject"] != filter_subject and filter_subject != "General":
                continue
            if filter_topic and meta["topic"] != filter_topic and filter_topic != "General":
                continue
                
        elif mode == "planner":
            if filter_subject and meta["subject"] != filter_subject and filter_subject != "General":
                continue
            if meta.get("exam_relevance") != "High":
                continue
                
        elif mode == "quiz":
            if filter_topic and meta["topic"] != filter_topic and filter_topic != "General":
                continue
                
        best_chunks.append(f"[Source: {meta['subject']} > {meta['topic']}]\n" + store["chunks"][idx])
        if len(best_chunks) >= top_k:
            break
            
    # Fallback: if rigid filters blocked everything, return the absolute best semantic match regardless of tags
    if not best_chunks and indices[0][0] != -1:
         best_chunks.append(f"[Source: {store['metadata'][indices[0][0]]['subject']}]\n" + store["chunks"][indices[0][0]])
            
    return "\n\n---\n\n".join(best_chunks)
