# type: ignore
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
import gradio as gr
from dotenv import load_dotenv

# Configuration
DATA_PATH = "data"  # Folder containing your documents
FAISS_PATH = "faiss_index"  # Where to save the FAISS index
NUM_RESULTS = 5  # Number of chunks to retrieve

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Initialize models
embeddings_model = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=api_key  
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.5,
    google_api_key=api_key
)

# Initialize or load FAISS index
def initialize_vectorstore():
    """Handles FAISS index creation/loading safely"""
    if os.path.exists(FAISS_PATH):
        try:
            return FAISS.load_local(
                FAISS_PATH, 
                embeddings_model, 
                allow_dangerous_deserialization=True
            )
        except Exception as e:
            print(f"Error loading index: {e}. Creating new one.")
    
    # Create empty index if none exists
    return FAISS.from_texts(
        texts=[""], 
        embedding=embeddings_model, 
        metadatas=[{}]  # Initialize with empty metadata
    )

vector_store = initialize_vectorstore()
retriever = vector_store.as_retriever(search_kwargs={'k': NUM_RESULTS})

# Document processing and indexing
def add_documents_to_index():
    """Add documents to the FAISS index (run once)"""
    if len(vector_store.docstore._dict) > 1:  # Already populated
        return
        
    from langchain_community.document_loaders import PyPDFDirectoryLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    
    print("Loading and indexing documents...")
    
    loader = PyPDFDirectoryLoader(DATA_PATH)
    raw_docs = loader.load()
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = text_splitter.split_documents(raw_docs)
    
    # Add with metadata preservation
    texts = [doc.page_content for doc in chunks]
    metadatas = [doc.metadata for doc in chunks]
    vector_store.add_texts(texts, metadatas)
    vector_store.save_local(FAISS_PATH)
    print(f"Indexed {len(chunks)} chunks")

# Call this to index your documents (uncomment when ready)
# add_documents_to_index()

# Chatbot function
def stream_response(message, history):
    if not message.strip():
        yield "Please enter a valid question."
        return
    
    try:
        # Retrieve relevant chunks
        docs = retriever.invoke(message)
        knowledge = "\n\n".join(doc.page_content for doc in docs)
        
        # Generate response
        rag_prompt = f"""You're a helpful assistant. Answer based on this context:
        
        Context:
        {knowledge}
        
        Question: {message}
        """
        
        partial_message = ""
        for chunk in llm.stream(rag_prompt):
            partial_message += chunk.content
            yield partial_message
            
    except Exception as e:
        yield f"Error: {str(e)}"

# Gradio interface
chatbot = gr.ChatInterface(
    stream_response,
    textbox=gr.Textbox(
        placeholder="Ask about your documents...",
        container=False,
        autoscroll=True,
        scale=7
    ),
    title="FAISS RAG Chatbot",
    description="Ask questions about your indexed documents"
)

if __name__ == "__main__":
    chatbot.launch()