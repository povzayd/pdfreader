from langchain_openai import ChatOpenAI
from openai import OpenAI
import os

client = OpenAI()

def generate_podcast_dialogue(topic="Economics Overview"):
    # 1. Generate Script
    llm = ChatOpenAI(model_name="gpt-4o")
    prompt = f"""
    Create a short, engaging dialogue (approx 4 exchanges) between a Professor and a Student about: {topic}.
    Format exactly like this:
    Professor: [Text]
    Student: [Text]
    Professor: [Text]
    """
    response = llm.invoke(prompt).content
    
    # 2. Parse and generate Audio
    lines = response.split("\n")
    audio_segments = []
    
    for line in lines:
        if line.startswith("Professor:"):
            text = line.replace("Professor:", "").strip()
            # Generate Audio (Voice: Onyx for Professor)
            res = client.audio.speech.create(model="tts-1", voice="onyx", input=text)
            audio_segments.append({"speaker": "Professor", "text": text, "audio": res.content})
        elif line.startswith("Student:"):
            text = line.replace("Student:", "").strip()
            # Generate Audio (Voice: Nova for Student)
            res = client.audio.speech.create(model="tts-1", voice="nova", input=text)
            audio_segments.append({"speaker": "Student", "text": text, "audio": res.content})
            
    return audio_segments