from flask import Flask
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
    # Pre-load CL Branch scheme PDF into shared RAG store at startup
    try:
        from data_loader import load_cl_scheme
        chunks = load_cl_scheme()
        app.config["CL_SCHEME_LOADED"] = chunks > 0
    except Exception as e:
        print(f"[Startup] Could not preload CL scheme: {e}")
        app.config["CL_SCHEME_LOADED"] = False

    app.run(debug=True, port=5000)
