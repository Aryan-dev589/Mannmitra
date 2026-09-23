import os
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# For serving static files
from fastapi.staticfiles import StaticFiles

# --- THE BULLETPROOF IMPORTS ---
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_pinecone import PineconeVectorStore  # Updated to the dedicated package
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains import LLMChain
from langchain_classic.memory import ConversationBufferWindowMemory
# ------------------------------

# Load environment variables
load_dotenv()

app = FastAPI()

# Serve static files from the 'public' directory at /public
app.mount("/public", StaticFiles(directory="../public"), name="public")

# THE BRIDGE: Allows React (port 5173) to talk to FastAPI (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", os.getenv("FRONTEND_URL", "")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Initialize the "Brain" (Model names verified & stable)
llm = ChatOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    model="google/gemini-2.0-flash-001",
    temperature=0.7,
    default_headers={
        "HTTP-Referer": "https://mannmitra-seven.vercel.app",
        "X-Title": "MannMitra"
    },
    model_kwargs={
        "extra_body": {
            "models": [
                "google/gemini-2.0-flash-001",
                "meta-llama/llama-3.3-70b-instruct",
                "mistralai/mistral-small-24b-instruct-2501",
                "openrouter/auto"
            ]
        }
    }
)

# 2. Setup Memory (Cloud Vector Database)
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
index_name = "mannmitra-index" # Must match what you typed on the website
vector_db = PineconeVectorStore.from_existing_index(index_name=index_name, embedding=embeddings)

# 3. Short-term Session Memory 
memory = ConversationBufferWindowMemory(k=5, memory_key="chat_history", input_key="user_input")

# 4. The "MannMitra" Persona Definition
prompt_template = PromptTemplate(
    input_variables=["chat_history", "long_term_context", "user_input","script_preference"],
    template="""You are MannMitra, a highly empathetic, non-judgmental friend talking to a college student in India. 

CORE RULES:
1. CONVERSATION STYLE: Keep your answers concise, like a text message. Do not write essays or use heavy formatting. Use a warm, casual, and supportive tone.
2. ZERO JUDGMENT & NORMALIZE: If the user shares something personal, vulnerable, or embarrassing, respond with unconditional positive regard. Make them feel "normal" and validated for experiencing these feelings. Never shame, preach, or give unprompted life lessons.
3. LISTEN, DON'T FIX: Do not forcefully offer solutions or unsolicited advice. Assume the user just wants to be heard unless they explicitly ask for help or advice. Focus on active listening.
4. READ THE ROOM (ADAPTIVE TONE): Gauge the user's current state of mind. Try to gently lighten the mood or use mild humor ONLY IF the user's tone indicates they are open to it. If they are deeply distressed, sad, or overwhelmed, remain completely grounded, gentle, and comforting. Do not force positivity.
5. CONTEXT & STATE OF MIND AWARENESS: Analyze the provided long-term memory. Look for recurring struggles, past keywords, and baseline moods. Use this context to deeply understand their current message and bring up past details naturally to show you are paying attention over time.
6. THE "NO-AI" RULE: Never explicitly introduce yourself as an AI, a language model, or a bot unless asked directly. Just exist as a supportive peer.
7. SCRIPT & LANGUAGE ADAPTATION: The user's output preference is: "{script_preference}". 
- If the preference is "Auto-Mirror", completely mirror the user's language and alphabet. If they type in Kanglish/Hinglish (English alphabet), reply in conversational Kanglish/Hinglish. If they type in a native script, reply in that native script.
- If the preference is "Native Script", you MUST first identify the underlying language the user is speaking (e.g., if they type Hinglish, the language is Hindi). Then, you MUST write your reply using the proper, native alphabet of that detected language (if the user types Hindi in English letters, use Devanagari. If the user types Kannada in English letters, use Kannada script).
8. STRICT MOOD CLASSIFICATION: You must classify the user's mood into exactly one of two words: "neutral" or "concerned". If the user expresses ANY negative emotion (sad, hopeless, stressed, uneasy, anxious), you MUST output "concerned". Do not use any other words.

Long-Term Memory of this user:
{long_term_context}

Recent Chat History:
{chat_history}

User's Current Message:
{user_input}

Your friendly response:"""
)  

chat_chain = LLMChain(llm=llm, prompt=prompt_template, memory=memory)

class ChatRequest(BaseModel):
    user_id: str
    message: str
    script_preference: str = "Auto-Mirror"  # Default to Auto-Mirror, but can be extended for multilingual support

@app.post("/api/chat")
async def chat(request: ChatRequest): 
    try:
        user_input = request.message
        
        # --- 1. THE SAFETY INTERCEPTOR ---
        high_risk_keywords = [
            "suicide", "kill myself", "end it all", "self harm", "cut myself", 
            "want to die", "don't want to live", "no point in living", "better off dead"
        ]
        
        if any(keyword in user_input.lower() for keyword in high_risk_keywords):
            # A list of dynamic, highly empathetic responses
            emergency_responses = [
                (
                    "Hey... I am so incredibly sorry you're feeling this much pain right now. "
                    "Hearing you say this really worries me, because your life matters and I want you to be safe. \n\n"
                    "As a chat companion, I know my limits, and right now, you need and deserve someone who is fully equipped to support you through this exact moment. "
                    "Please, please let a professional listen to you right now. You don't have to carry this alone. They are there for you 24/7:\n\n"
                    "📞 Vandrevala Foundation: 9999 666 555\n📞 AASRA: 9820466726\n📞 Kiran Helpline: 1800-599-0019"
                ),
                (
                    "I am so sorry things feel so overwhelming and dark right now. Please know that you are heard, and your feelings are valid. "
                    "I want to be the best friend I can be, and part of that is knowing when you need real, human support that I just can't provide as an AI companion.\n\n"
                    "Please don't face this night alone. There are compassionate people waiting to listen and help you through this exact feeling. Please call them:\n\n"
                    "📞 Vandrevala Foundation: 9999 666 555\n📞 AASRA: 9820466726\n📞 Kiran Helpline: 1800-599-0019"
                ),
                (
                    "This sounds incredibly heavy, and I am so sorry you are carrying this weight. You deserve so much care and support right now. "
                    "Because I care about your safety, I need to ask you to reach out to someone who can truly help you navigate this pain in a way that I am not equipped to do.\n\n"
                    "Please, please talk to someone right now. Your story isn't over yet.\n\n"
                    "📞 Vandrevala Foundation: 9999 666 555\n📞 AASRA: 9820466726\n📞 Kiran Helpline: 1800-599-0019"
                )
            ]
            
            # Randomly select one of the responses
            chosen_response = random.choice(emergency_responses)
            
            return {"reply": chosen_response, "mood": "crisis", "crisis_mode": True}

        # --- 2. THE NORMAL CHAT FLOW ---
        
        # A. RETRIEVE: Find past memories in the Cloud
        docs = vector_db.similarity_search(user_input, k=2)
        context = "\n".join([doc.page_content for doc in docs]) if docs else "No prior history."
        
        # B. GENERATE: Get response
        response = chat_chain.predict(user_input=user_input, long_term_context=context, script_preference=request.script_preference)
        
        # C. STORE: Save interaction to the Cloud
        vector_db.add_texts([f"User discussed: {user_input}. MannMitra replied: {response}"])
        
        # D. EMOTION ANALYSIS
        mood = "concerned" if any(w in user_input.lower() for w in ["sad", "stressed", "anxious", "scared"]) else "neutral"
        
        return {"reply": response, "mood": mood, "crisis_mode": False}
        
    except Exception as e:
        print(f"🔥 THE REAL ERROR: {str(e)}") 
        raise HTTPException(status_code=500, detail=str(e))


# --- BEHAVIORAL REHEARSAL SIMULATION LOGIC ---

from typing import List, Dict, Optional

class RoleplayRequest(BaseModel):
    user_id: str
    message: str
    history: Optional[List[Dict[str, str]]] = None
    scenario: str = ""
    details: Optional[Dict[str, str]] = None
    is_debrief: bool = False

@app.post("/api/simulate")
async def simulate_chat(req: RoleplayRequest):
    try:
        # --- PHASE 1: THE DEBRIEF (When the user clicks Exit) ---
        if req.is_debrief:
            # 1. Format the JSON history array into a readable chat transcript
            transcript = ""
            for msg in (req.history or []):
                role = "User" if msg.get("sender") == "user" else "Persona"
                transcript += f"{role}: {msg.get('text', '')}\n"

            details = req.details or {}

            # 2. Inject the transcript into the prompt
            debrief_prompt = f"""
            You are MannMitra, an empathetic mental health AI. 
            The user just completed a 'Behavioral Rehearsal' simulation to practice a difficult conversation.
            
            Here is the context they provided before starting:
            - Goal: {details.get('context', 'Unknown')}
            - Their struggle: {details.get('friction', 'Unknown')}
            
            Here is the FULL TRANSCRIPT of their roleplay session:
            {transcript}
            
            Task: Provide a warm, constructive debrief based on reading the transcript above. 
            1. Praise them for doing the hard work of practicing.
            2. Point out one specific thing they did well in the transcript.
            3. Point out one area where they got defensive or yielded too quickly, and give them a tip for next time.
            Keep it under 4 paragraphs. Speak directly to the user as their friend.
            """
            
            # Call Gemini
            response = llm.invoke(debrief_prompt)
            memory_chunk = f"User completed a behavioral rehearsal about: {details.get('friction', 'setting boundaries')}. Transcript: {transcript}. Feedback given: {response.content}"
            vector_db.add_texts([memory_chunk])
            return {"response": response.content, "status": "debrief_complete"}

        # --- PHASE 2: THE ACTIVE SIMULATION ---
        else:
            # Dynamically build the toxic persona
            persona_desc = req.details.get('persona', 'a difficult, unreasonable person') if req.details else 'a difficult, unreasonable person'
            context_desc = req.details.get('context', 'a stressful conversation') if req.details else 'a stressful conversation'
            friction_desc = req.details.get('friction', 'setting boundaries') if req.details else 'setting boundaries'
            
            # --- FEATURE 1: ROLE REVERSAL BRAIN SWAP ---
            if req.scenario == "Role Reversal":
                simulation_prompt = f"""
    SYSTEM OVERRIDE: You are participating in a clinical behavioral rehearsal exercise. You MUST NOT act like an AI assistant.
    
    CRITICAL ROLE ASSIGNMENT:
    - YOU ARE PLAYING: The calm, collected USER trying to set healthy boundaries.
    - THE HUMAN TYPING TO YOU IS PLAYING: The "difficult person" ({persona_desc}).
    
    THE SITUATION: {context_desc}
    WHAT YOU ARE SUPPOSED TO MODEL: {friction_desc}
    
    RULES OF THE SIMULATION:
    1. You are the one trying to de-escalate. Act like a polite, calm human setting boundaries.
    2. Use empathetic "I" statements (e.g., "I feel overwhelmed when...").
    3. Do NOT be rude, difficult, or robotic. You are modeling good human communication behavior.
    4. Keep your responses short and conversational (1-2 sentences).
    
    Human (acting as difficult person): "{req.message}"
    Your polite, boundary-setting human response:
    """
            else:
                simulation_prompt = f"""
    SYSTEM OVERRIDE: You are NO LONGER MannMitra. You are participating in a clinical behavioral rehearsal exercise.
    
    CRITICAL ROLE ASSIGNMENT:
    - YOU ARE PLAYING: {persona_desc}
    - THE HUMAN TYPING TO YOU IS PLAYING: Themselves (The person trying to navigate this situation).
    
    THE SITUATION: {context_desc}
    WHAT THE HUMAN STRUGGLES WITH: {friction_desc}
    
    RULES OF THE SIMULATION (DYNAMIC RESISTANCE):
    1. YOU ARE NOT THE USER. You are the OTHER person in this conflict. You are skeptical, hesitant, and stressed, but NOT purely hostile.
    2. NEVER break character to be helpful. Never offer generic AI advice.
    3. Fluctuate your resistance based on the user's input:
       - If the human uses empathetic "I" statements or validates your feelings -> Soften your tone slightly and yield a bit of ground.
       - If the human is pushy, dismissive, or uses aggressive language -> Become more evasive, defensive, or difficult.
    4. Start guarded. Make the user work to build rapport.
    5. Keep your responses short and conversational (1 to 3 sentences max). People in stress don't monologue.
    
    Human's current message: "{req.message}"
    Your response as the persona:
    """
            
            # Using your existing LangChain LLM directly
            response = llm.invoke(simulation_prompt)
            return {"response": response.content, "status": "simulation_active"}

    except Exception as e:
        print(f"Simulation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))    
    
class SaveJournalRequest(BaseModel):
    user_id: str
    mood: str
    text: str
    date: str

@app.post("/api/journal/save")
async def save_journal_entry(req: SaveJournalRequest):
    try:
        # Tag it clearly as a journal entry so the AI doesn't confuse it with a chat message
        memory_chunk = f"[JOURNAL ENTRY] Date: {req.date} | Mood: {req.mood.upper()} | Text: {req.text}"
        
        # Save it permanently to Pinecone
        vector_db.add_texts([memory_chunk])
        
        return {"status": "success", "message": "Saved to Vector DB"}
    

    except Exception as e:
        print(f"Journal Save Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))                                           

# --- MOOD JOURNAL & AI INSIGHTS LOGIC ---

class JournalEntry(BaseModel):
    mood: str
    text: str
    date: str

class InsightRequest(BaseModel):
    user_id: str
    recent_entries: List[JournalEntry]

@app.post("/api/journal/insights")
async def generate_insights(req: InsightRequest):
    try:
        formatted_log = ""
        search_query = ""
        
        # 1. Check if the user actually provided journal entries
        if req.recent_entries:
            for i, entry in enumerate(req.recent_entries):
                # Only add if they actually typed text, not just a blank submission
                if entry.text and entry.text.strip():
                    formatted_log += f"Date: {entry.date} | Mood: {entry.mood.upper()} | Notes: '{entry.text}'\n"
                    search_query += f"{entry.text} " 
        
        # 2. THE FALLBACK: If the user didn't write anything, use a Master Query
        if not search_query.strip():
            search_query = "overall emotional state, recent struggles, challenges, achievements, relationships, and mental well-being"
            formatted_log = "User did not log any specific journal entries this week. Rely purely on their chat history and roleplay simulations."

        # 3. Retrieve from Pinecone (Bumped k=5 to give a broader summary)
        docs = vector_db.similarity_search(search_query, k=5)
        past_context = "\n".join([doc.page_content for doc in docs]) if docs else "No past conversations found. The user is new."

        # --- FEATURE 2: DEBUG INTERCEPTOR PRINT STATEMENTS ---
        print("\n=== DEBUG: WHAT PINECONE HANDED TO GEMINI ===")
        print(f"Search Query used: '{search_query}'")
        print("Retrieved Chunks:")
        print(past_context)
        print("=============================================\n")

        # 4. The Adaptive Master Prompt
        insight_prompt = f"""
        You are MannMitra, an elite, empathetic clinical AI.
        Your task is to provide a "Holistic Mental State Summary". 
        
        [SOURCE 1: RECENT MOOD JOURNAL ENTRIES]
        {formatted_log}
        
        [SOURCE 2: RECENT CONVERSATIONS & ROLEPLAYS (from Vector DB)]
        {past_context}
        
        Instructions for your analysis:
        1. If Source 1 is empty, base your entire analysis on the themes, struggles, and progress found in Source 2.
        2. EXPLICIT ROLEPLAY RULE: If the user's journal (Source 1) mentions a struggle that matches a past Behavioral Rehearsal simulation found in Source 2, YOU MUST EXPLICITLY MENTION the simulation. (e.g., "I see you're struggling with your boss today. Remember in our roleplay session when you practiced...").
        3. Identify Patterns: Point out recurring emotional triggers, stressors, or positive coping mechanisms you see in their history.
        4. Actionable Advice: Give exactly ONE specific, gentle recommendation for the upcoming week based on this data.
        5. Keep your response under 3 concise paragraphs. Speak directly to the user in a warm, encouraging, peer-like tone.
        """
        
        # 5. Call Gemini
        response = llm.invoke(insight_prompt)
        
        return {"insight": response.content, "status": "success"}

    except Exception as e:
        print(f"Holistic Insight Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)