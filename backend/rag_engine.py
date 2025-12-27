import os
import json
from dotenv import load_dotenv

# New LangChain modular imports
from langchain_community.document_loaders import PyPDFLoader, YoutubeLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

load_dotenv()

# --- CONFIG ---
PDF_PATH = "economics_chapter.pdf" 
YOUTUBE_URLS = [
    "https://www.youtube.com/watch?v=Ec19IjjvlCI",
    "https://www.youtube.com/watch?v=Z_S0VA4jKes"
]

# Initialize global variables
embeddings = OpenAIEmbeddings()
vector_store = None
qa_chain = None

def initialize_rag():
    global vector_store, qa_chain
    print("🚀 Starting RAG Initialization...")
    
    docs = []
    
    # 1. Load PDF logic
    if os.path.exists(PDF_PATH):
        try:
            print(f"📖 Loading PDF from {PDF_PATH}...")
            loader = PyPDFLoader(PDF_PATH)
            pdf_pages = loader.load()
            docs.extend(pdf_pages)
            print(f"✅ PDF Loaded. Total pages: {len(pdf_pages)}")
        except Exception as e:
            print(f"❌ Error reading PDF: {e}")
    else:
        print(f"⚠️ WARNING: {PDF_PATH} not found in backend directory!")

    # 2. Load YouTube Transcripts
    print("🎥 Attempting to load YouTube transcripts...")
    for url in YOUTUBE_URLS:
        try:
            loader = YoutubeLoader.from_youtube_url(url, add_video_info=True)
            video_content = loader.load()
            docs.extend(video_content)
            print(f"✅ Loaded Video: {url}")
        except Exception as e:
            print(f"⚠️ YouTube access blocked for {url}. Skipping video content.")

    # 3. Validation
    if not docs:
        print("🛑 CRITICAL ERROR: No content found! Put 'economics_chapter.pdf' in /backend.")
        return

    # 4. Text Splitting
    print(f"✂️ Splitting {len(docs)} documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    splits = text_splitter.split_documents(docs)
    print(f"✅ Created {len(splits)} text chunks.")

    # 5. Create Vector Store
    print("🧠 Generating Embeddings & Creating Vector Store (FAISS)...")
    try:
        vector_store = FAISS.from_documents(splits, embeddings)
        print("✅ Vector Store Ready.")
    except Exception as e:
        print(f"❌ FAISS Creation Error: {e}")
        return
    
    # 6. Setup Conversational AI Chain
    print("🤖 Configuring LLM Chat Chain...")
    llm = ChatOpenAI(model_name="gpt-4o", temperature=0.2)
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    
    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vector_store.as_retriever(search_kwargs={"k": 3}),
        memory=memory
    )
    print("✨ RAG System Fully Operational!")

def ask_question(query: str):
    if not qa_chain:
        return "The system is still initializing or encountered an error."
    try:
        result = qa_chain.invoke({"question": query})
        return result["answer"]
    except Exception as e:
        return f"Error: {str(e)}"

def generate_summary():
    """Generates the 'Exam Tips' displayed on the frontend."""
    if not vector_store:
        return ["System not initialized"]
    
    try:
        llm = ChatOpenAI(model_name="gpt-4o")
        docs = vector_store.similarity_search("key economic concepts and exam takeaways", k=4)
        context = "\n".join([d.page_content for d in docs])
        
        prompt = f"""
        Based on the following material:
        {context}
        
        List exactly 3 high-impact 'Exam Tips' for a student.
        Format your response as a JSON list of strings only.
        """
        response = llm.invoke(prompt)
        raw_content = response.content.replace("```json", "").replace("```", "").strip()
        return json.loads(raw_content)
    except Exception as e:
        print(f"Summary Error: {e}")
        return ["Focus on Supply/Demand Curves", "Understand Opportunity Cost", "Review Market Equilibrium"]
