# Economics AI Study Assistant (RAG)

A full-stack Retrieval-Augmented Generation (RAG) application designed to help students master AQA Economics. This tool allows users to chat with their study materials (PDFs) and YouTube transcripts using a hybrid AI architecture.

## The Architecture
This project uses a Hybrid RAG approach to optimize for cost and performance:
- Local Embeddings: Uses sentence-transformers (all-MiniLM-L6-v2) to vectorize text locally, bypassing OpenAI API quota limits and reducing costs.
- Cloud LLM: Leverages GPT-4o for high-level reasoning and conversational response generation.
- Vector Store: Utilizes FAISS for lightning-fast similarity searches across document chunks.

## Features
- PDF Intelligence: Deeply indexes complex economics chapters (e.g., Oligopoly, Price Discrimination).
- YouTube Integration: Pulls transcripts from educational videos to provide a multi-modal knowledge base.
- Interactive Chat: A modern Next.js interface with real-time streaming-style responses.
- Exam Quick Tips: Automatically generates summary cards based on the specific context of the uploaded documents.
- AI Study Podcast: A simulated audio-visual "podcast" UI that highlights key concepts from the text.

## Tech Stack
- Frontend: Next.js 15, Tailwind CSS, Lucide React, Axios.
- Backend: Python 3, FastAPI, Uvicorn.
- AI/ML: LangChain, OpenAI API, HuggingFace (Local Embeddings), FAISS.
- Data: PyMuPDF (PDF parsing), YouTube Transcript API.

## Installation & Setup

### 1. Clone the Repository
`bash
```git clone github.com/povzayd/pdfreader.git
cd pdfreader
```
2. Backend Setup
 * Navigate to the backend folder:
 * ```
   cd backend
 `` `
 * Create a `.env` file and add your OpenAI Key:
   ```
   OPENAI_API_KEY=sk-your-key-here
`` `
 * Install dependencies:
```
   pip install -r requirements.txt
```
# Or manually:

```
pip install fastapi uvicorn langchain langchain-openai langchain-community langchain-huggingface sentence-transformers faiss-cpu pymupdf youtube-transcript-api python-dotenv
```
 * Start the server:
   ```
   python main.py
  ``
3. Frontend Setup
 * Navigate to the frontend folder:
```
    cd ../frontend
```
 * Install dependencies:
```
   npm install
```
 * Start the development server:
```
   npm run dev
```
 How to Use
 * Place your economics PDF in the /backend folder named economics_chapter.pdf.
 * The system will automatically split the 9-page document into ~37 chunks.
 * Ask questions about specific diagrams, such as:
   * "Explain the Kinked Demand Curve."
   * "What are the 5-firm concentration ratios for the UK grocery market?"

*PLEASE NOTE THAT THE PROJECT IS STILL UNDER DEVELOPMENT*
