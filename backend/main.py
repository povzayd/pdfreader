from fastapi import FastAPI, UploadFile, BackgroundTasks
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Import our modules
from rag_engine import initialize_rag, ask_question, generate_summary
from audio_gen import generate_podcast_dialogue

load_dotenv()

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG on startup
@app.on_event("startup")
async def startup_event():
    # In production, use background task to not block boot
    initialize_rag()

class QueryRequest(BaseModel):
    query: str

@app.post("/chat")
def chat_endpoint(request: QueryRequest):
    answer = ask_question(request.query)
    return {"response": answer}

@app.get("/summary")
def summary_endpoint():
    tips = generate_summary()
    return {"tips": tips}

@app.get("/podcast")
def podcast_endpoint(topic: str = "General Economics"):
    # Returns list of text segments. 
    # Frontend will request specific audio blobs by index to play them.
    # For MVP simplicity, we generate fresh every time.
    dialogue = generate_podcast_dialogue(topic)
    # We can't send bytes JSON easily, so we'll save temp files or base64.
    # Strategy: Return text transcript, separate endpoint for audio blob.
    
    import base64
    response_data = []
    for seg in dialogue:
        b64_audio = base64.b64encode(seg['audio']).decode('utf-8')
        response_data.append({
            "speaker": seg['speaker'],
            "text": seg['text'],
            "audio_base64": b64_audio
        })
        
    return response_data
    '''
def initialize_rag():
    global vector_store, qa_chain
    print("🚀 Starting RAG Initialization...") # ADD THIS
    
    docs = []
    
    if os.path.exists(PDF_PATH):
        print(f"📖 Loading PDF from {PDF_PATH}...") # ADD THIS
        loader = PyPDFLoader(PDF_PATH)
        docs.extend(loader.load())
        print(f"✅ PDF Loaded. Total pages: {len(docs)}") # ADD THIS
    else:
        print(f"❌ ERROR: {PDF_PATH} not found!") 

    print("🎥 Loading YouTube transcripts...") # ADD THIS
    # ... (rest of your loading code)
    
    print("🧠 Creating Vector Store (this might take a minute)...") # ADD THIS
    vector_store = FAISS.from_documents(splits, embeddings)
    
    print("🤖 Setting up Chat Chain...") # ADD THIS
    # ... (rest of your chain code)
    
    print("✨ RAG System Ready!") 
    '''
    # ADD THIS
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)









    '''''
/ecostudy-assignment
├── /backend                 # Python FastAPI Backend
│   ├── .env                 # Store your OPENAI_API_KEY here
│   ├── requirements.txt     # Python dependencies list
│   ├── main.py              # The API entry point (FastAPI app)
│   ├── rag_engine.py        # Logic for PDF/YouTube processing & RAG
│   ├── audio_gen.py         # Logic for generating the Podcast audio
│   └── economics_chapter.pdf # The downloaded PDF file (You must place this here!)
│
└── /frontend                # Next.js React Frontend
    ├── /app
    │   ├── globals.css      # Global styles (Tailwind directives)
    │   ├── layout.tsx       # Main layout wrapper
    │   └── page.tsx         # The main UI code (Chat & Audio interface)
    ├── /public              # Static assets (images, icons)
    ├── package.json         # Node dependencies list
    ├── tailwind.config.ts   # Tailwind configuration
    ├── next.config.js       # Next.js configuration
    └── tsconfig.json        # TypeScript configuration

    '''