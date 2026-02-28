# TRI – AI Academic Automation Agent

TRI is an intelligent academic assistant that transforms fragmented student learning resources (syllabus, notes, previous year questions) into structured learning plans, performance analytics, adaptive study schedules, and personalized academic guidance. It features a modern, distraction-free desktop-like workspace UI.

## Core Architecture
*   **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Lucide Icons.
*   **Backend**: Python Flask REST API.
*   **AI Engine**: Google Gemini (Pro models for generation, `text-embedding-004` for vectors).
*   **Knowledge Base (RAG)**: FAISS (CPU) for high-performance localized vector similarity search.
*   **Scraping Hub**: DuckDuckGo HTML Search + BeautifulSoup4 for web crawling, `pypdf` for document parsing.

## Key Features & Functions

### 1. Document & Syllabus Ingestion (RAG)
*   **PDF Parsing**: Automatically extracts text from uploaded institutional syllabus documents (like the CL scheme).
*   **Vector Database (FAISS)**: Chunks documents into manageable pieces, embeds them using Gemini, and stores them in a highly optimized in-memory FAISS index.
*   **Contextual Retrieval**: Every AI prompt (planning, evaluation, doubt resolution) first queries the FAISS index for relevant syllabus context to ground the AI's responses.

### 2. Autonomous Web Crawler
*   **Topic Expansion**: If uploaded resources are insufficient, TRI uses an autonomous crawler to search educational sites (GeeksforGeeks, TutorialsPoint, Wikipedia) for specific topics.
*   **Content Ingestion**: Scrapes the content and feeds it directly into the student's personal vector store for subsequent RAG queries.

### 3. AI-Powered Profiling
*   **Metadata Extraction**: Analyzes dumped syllabus or notes to automatically extract the student's semester, current subjects, and core focus areas without manual data entry.

### 4. Interactive Desktop Workspace (UI)
*   **Global Layout**: Features a fixed Top Navigation, a persistent Left Sidebar (showing current student context and active subjects), and a Bottom Dock acting as a focus session monitor.
*   **Dashboard (`/dashboard`)**: Displays real-time metrics including an AI Readiness Score, Exam Countdown, and auto-detected Critical Weaknesses.
*   **Subject & Topic Drill-down (`/subject/[id]`, `/topic/[id]`)**: Hierarchical navigation focusing on single topics at a time. Displays conceptual notes, PYQs, and an AI-generated summary.

### 5. Adaptive Study Planner (`/planner`)
*   **Algorithmic Planning**: Generates a day-by-day study schedule allocating hours based on the student's stated weak areas and priority constraints.
*   **Checklists & Distribution**: Provides daily actionable task checklists and visualizes weekly time distribution across contrasting subjects.

### 6. Practice & Evaluation (`/practice`)
*   **Dynamic Quiz Generation**: Creates contextual MCQs and free-response questions grounded entirely in the ingested syllabus.
*   **Auto-Evaluation**: Submits answers to Gemini for grading, returning a score out of 10 and explicitly identifying new "Weak Topics" to feed back into the adaptive planner.

### 7. Doubt Hub Assistant (`/assistant`)
*   **Context-Aware Chat**: A dedicated chat interface where the student can ask questions. TRI retrieves relevant syllabus segments via RAG, includes citations (e.g., "Source: CL Scheme"), and provides simplified explanations.

### 8. Analytics (`/analytics`)
*   **Performance Tracking**: Visualizes 30-day readiness trends, overall quiz accuracy, total study time, and dynamically tracks the resolution of previously identified weaknesses.
