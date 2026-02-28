import os
from google import genai
from dotenv import load_dotenv

load_dotenv(override=True)
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

texts = ["Hello world", "This is a test", "Another test"]
try:
    res = client.models.embed_content(model="gemini-embedding-001", contents=texts)
    print(f"Success! Got {len(res.embeddings)} embeddings.")
except Exception as e:
    print(f"Error: {e}")
