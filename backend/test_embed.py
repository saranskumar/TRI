import os
from google import genai
from dotenv import load_dotenv

load_dotenv(override=True)
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

model_names = [
    "models/gemini-embedding-001",
    "gemini-embedding-001"
]

for name in model_names:
    print(f"Testing {name}...")
    try:
        res = client.models.embed_content(model=name, contents="Hello")
        print("Success! Dimensions:", len(res.embeddings[0].values))
    except Exception as e:
        print(f"Error: {e}")




