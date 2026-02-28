import os
import json
from pypdf import PdfReader
from rag_service import ingest_text, save_store

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
VECTOR_STORE_DIR = os.path.join(os.path.dirname(__file__), "vectorstore")
PROCESSED_REGISTRY = os.path.join(VECTOR_STORE_DIR, "processed_files.json")

# Use the same shared collection name as the backend
SHARED_COLLECTION = "tri_cl_scheme_shared"

def load_registry() -> set:
    if os.path.exists(PROCESSED_REGISTRY):
        with open(PROCESSED_REGISTRY, "r", encoding="utf-8") as f:
            data = json.load(f)
            return set(data.get("processed_files", []))
    return set()

def save_registry(processed_files: set):
    os.makedirs(VECTOR_STORE_DIR, exist_ok=True)
    with open(PROCESSED_REGISTRY, "w", encoding="utf-8") as f:
        json.dump({"processed_files": list(processed_files)}, f, indent=2)

def vectorize_pdfs():
    print(f"Scanning {DATA_DIR} for PDFs...")
    processed_files = load_registry()
    
    if not os.path.exists(DATA_DIR):
        print(f"Data directory not found: {DATA_DIR}")
        return

    new_files_processed = 0
    total_chunks = 0
    
    for filename in os.listdir(DATA_DIR):
        if not filename.lower().endswith((".pdf", ".txt")):
            continue
            
        # Check if already processed
        if filename in processed_files:
            print(f"Skipping {filename} (already processed)")
            continue
            
        file_path = os.path.join(DATA_DIR, filename)

        print(f"\nProcessing {filename}...")
        try:
            if filename.lower().endswith(".txt"):
                with open(file_path, "r", encoding="utf-8") as f:
                    full_text = f.read()
            elif filename.lower().endswith(".pdf"):
                reader = PdfReader(file_path)
                pages_text = []
                for i, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text and text.strip():
                        pages_text.append(f"[Page {i+1}]\n{text.strip()}")

                full_text = "\n\n".join(pages_text)
                
            if not full_text.strip():
                print(f"Warning: No text extracted from {filename}")
                continue

            # Extrapolate metadata (can be enhanced later to parse filename)
            # For now, treat 'CL scheme.pdf' specifically if needed
            subject = "CL Scheme" if "CL" in filename else "General"
            topic = "Syllabus" if "scheme" in filename.lower() else "General"
            
            # Use chunks rather than the entire document
            count = ingest_text(
                SHARED_COLLECTION, 
                full_text, 
                subject=subject, 
                topic=topic
            )
            
            print(f"✓ Ingested {count} chunks from {filename}")
            total_chunks += count
            
            # Register as processed AFTER successful ingestion
            processed_files.add(filename)
            new_files_processed += 1
            
            # Save incrementally
            print(f"Saving latest store state...")
            save_store(SHARED_COLLECTION)
            save_registry(processed_files)
            
        except Exception as e:
            print(f"Failed to process {filename}: {e}")

    if new_files_processed > 0:
        print(f"\nSuccessfully processed {new_files_processed} new files ({total_chunks} chunks total).")
        print("Done!")
    else:
        print("\nNo new PDFs found to process.")

if __name__ == "__main__":
    vectorize_pdfs()
