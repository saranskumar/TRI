import os
from pypdf import PdfReader
from rag_service import ingest_text

# Shared collection name for the institution-wide CL scheme data
SHARED_COLLECTION = "tri_cl_scheme_shared"

# Path to the data directory (relative to this file)
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
CL_SCHEME_PDF = os.path.join(DATA_DIR, "CL scheme.pdf")


def load_cl_scheme() -> int:
    """
    Parse and chunk the CL Scheme PDF and ingest it into a shared
    ChromaDB collection. Returns the number of chunks stored.
    """
    if not os.path.exists(CL_SCHEME_PDF):
        print(f"[DataLoader] CL scheme.pdf not found at {CL_SCHEME_PDF}")
        return 0

    print("[DataLoader] Loading CL scheme.pdf …")
    reader = PdfReader(CL_SCHEME_PDF)
    pages_text = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            pages_text.append(f"[Page {i+1}]\n{text.strip()}")

    full_text = "\n\n".join(pages_text)
    if not full_text.strip():
        print("[DataLoader] PDF extracted no text (may be scanned image).")
        return 0

    # Ingest into the shared collection
    count = ingest_text(SHARED_COLLECTION, full_text, subject="CL Scheme", topic="Syllabus")
    print(f"[DataLoader] ✓ Ingested {count} chunks from CL scheme.pdf")
    return count


def retrieve_cl_context(query: str, top_k: int = 5) -> str:
    """Retrieve relevant context from the shared CL scheme collection."""
    from rag_service import retrieve_context
    return retrieve_context(SHARED_COLLECTION, query, top_k=top_k)


def get_cl_scheme_summary() -> str:
    """Return a summary of what subjects/sems the CL scheme PDF covers."""
    from rag_service import retrieve_context
    return retrieve_context(
        SHARED_COLLECTION,
        "list all semesters subjects courses CL branch scheme syllabus",
        top_k=8,
    )
