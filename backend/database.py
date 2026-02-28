import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'tri_memory.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()

    # 1. Subjects Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS subjects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            confidence_level INTEGER DEFAULT 3
        )
    ''')

    # 2. Topics Table
    c.execute('''
        CREATE TABLE IF NOT EXISTS topics (
            id TEXT PRIMARY KEY,
            subject_id TEXT,
            topic_name TEXT NOT NULL,
            priority TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'Pending',
            FOREIGN KEY (subject_id) REFERENCES subjects (id)
        )
    ''')

    # 3. Mapped Resources (The Knowledge Router linking RAG to UI)
    c.execute('''
        CREATE TABLE IF NOT EXISTS mapped_resources (
            id TEXT PRIMARY KEY,
            topic_id TEXT,
            title TEXT NOT NULL,
            url TEXT,
            resource_type TEXT,
            ingestion_status TEXT, 
            FOREIGN KEY (topic_id) REFERENCES topics (id)
        )
    ''')

    # 4. Quiz Evaluations
    c.execute('''
        CREATE TABLE IF NOT EXISTS quiz_evaluations (
            id TEXT PRIMARY KEY,
            topic_id TEXT,
            score INTEGER,
            ai_feedback TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (topic_id) REFERENCES topics (id)
        )
    ''')

    # 5. Learning State (Student Behavior Matrix)
    c.execute('''
        CREATE TABLE IF NOT EXISTS learning_state (
            topic_id TEXT PRIMARY KEY,
            attempt_count INTEGER DEFAULT 0,
            last_score INTEGER DEFAULT 0,
            revision_priority REAL DEFAULT 1.0,
            forgetting_index REAL DEFAULT 0.0,
            FOREIGN KEY (topic_id) REFERENCES topics (id)
        )
    ''')

    conn.commit()
    conn.close()
    print("SQLite Database initialized: tri_memory.db")

# Initialize strictly when this file is imported or run
init_db()
