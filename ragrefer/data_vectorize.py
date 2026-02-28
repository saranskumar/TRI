import os
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from uuid import uuid4
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

# Configuration
DATA_PATH = r"data"  # Directory containing PDFs
FAISS_PATH = r"faiss_index"  # Directory to save vector store
CHUNK_SIZE = 1000  # Optimal for most RAG applications
CHUNK_OVERLAP = 200  # Helps maintain context

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

def load_and_process_documents():
    """Load, split and process documents from the data directory"""
    try:
        # Initialize embeddings model
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=api_key
        )

        # Load PDF documents
        loader = PyPDFDirectoryLoader(DATA_PATH)
        documents = loader.load()
        
        if not documents:
            raise ValueError(f"No documents found in {DATA_PATH}")

        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            length_function=len,
            add_start_index=True  # Helps with document referencing
        )
        chunks = text_splitter.split_documents(documents)

        # Add unique IDs to each chunk
        for chunk in chunks:
            chunk.metadata["chunk_id"] = str(uuid4())

        # Create and save vector store
        vector_store = FAISS.from_documents(chunks, embeddings)
        vector_store.save_local(FAISS_PATH)
        
        print(f"Successfully processed {len(chunks)} chunks")
        print(f"Vector store saved to {FAISS_PATH}")
        
        return len(chunks)
    
    except Exception as e:
        print(f"Error processing documents: {str(e)}")
        return 0

if __name__ == "__main__":
    processed_count = load_and_process_documents()
    if processed_count > 0:
        print("Vectorization completed successfully!")
    else:
        print("Vectorization failed. Please check the error messages.")