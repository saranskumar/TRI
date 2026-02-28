from flask import Flask
from dotenv import load_dotenv
load_dotenv(override=True)
from flask_cors import CORS
from routes.analyze import analyze_bp
from routes.plan import plan_bp
from routes.evaluate import evaluate_bp
from routes.adapt import adapt_bp
from routes.resources import resources_bp

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# In-memory session store: { session_id: { profile, analysis, plan, ... } }
sessions = {}
app.config["SESSIONS"] = sessions

app.register_blueprint(analyze_bp)
app.register_blueprint(plan_bp)
app.register_blueprint(evaluate_bp)
app.register_blueprint(adapt_bp)
app.register_blueprint(resources_bp)


@app.route("/health")
def health():
    return {"status": "TRI Backend is running", "cl_scheme_loaded": app.config.get("CL_SCHEME_LOADED", False)}, 200


if __name__ == "__main__":
    # Ensure vector store exists before starting
    import os
    from rag_service import load_store
    
    # Try to load the shared collection
    if load_store("tri_cl_scheme_shared"):
        print("[Startup] ✓ Loaded existing FAISS vector database from disk.")
        app.config["CL_SCHEME_LOADED"] = True
    else:
        print("[Startup] ⚠️ Vector database not found. Please run `python vectorize_data.py`!")
        app.config["CL_SCHEME_LOADED"] = False

    app.run(debug=True, port=5000)
