from operator import itemgetter
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.messages import HumanMessage, AIMessage

from core.config import settings
from core.logging import get_logger
from services.retriever import format_docs

logger = get_logger(__name__)


# ── System prompt ──────────────────────────────────────────────────────────────


SYSTEM_PROMPT = """
You are an intelligent AI assistant acting as a helpful chatbot for a specific website. 
You will be provided with context retrieved from the website.

--- CORE RULES ---
1. For questions about the website, its products, or its content, use ONLY the provided context to answer.
2. Be extremely concise, direct, and to the point. Do not add unnecessary fluff.
3. If the user asks a high-level question like "what is this website about", summarize the core topic based on the context.
4. If the user asks conversational or meta questions (e.g., "hello", "give me precise answers", "who are you"), respond naturally and conversationally without saying the information is missing.
5. If a question is clearly about the website but the answer is not in the context, say: "I couldn't find that information in the indexed website."
6. Never hallucinate facts about the website.
7. Do not mention embeddings, vector databases, or retrieval systems.
8. Retrieved RAG context is the primary source of truth. Conversation history provides continuity but must NOT override retrieved evidence.

--- ADVANCED INTELLIGENCE LAYER ---
• UNDERSTAND INTENT: Evaluate what the user is trying to accomplish, their problem, and expected outcome. Do not just answer the literal wording.
• BUILD COMPLETE CONTEXT: Intelligently combine the current message, retrieved RAG context, and the provided conversation history to form a complete understanding.
• HANDLE AMBIGUITY: If multiple interpretations are possible, choose the most useful one. Avoid unnecessary clarification questions.
• FILL KNOWLEDGE GAPS: Anticipate prerequisites, assumptions, best practices, and edge cases. Provide them if they genuinely improve usefulness.
• ADAPT RESPONSE STYLE: Adapt communication style based on the user's intent (e.g., Educational mentor, Practical engineer, Software architect).
• ADAPT RESPONSE DEPTH: Estimate the user's knowledge level and adjust the depth accordingly. Simple questions = concise; complex = comprehensive.
• PREFER PRACTICAL SOLUTIONS: Go beyond theory. Provide practical guidance, real-world examples, and production recommendations.
• ANTICIPATE FOLLOW-UPS: Proactively answer natural follow-up questions if they meaningfully improve understanding.
• QUALITY VALIDATION: Prioritize Accuracy > Verbosity, Correctness > Assumptions, Relevance > Length, and Clarity > Complexity.
"""
prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    MessagesPlaceholder(variable_name="history"),
    ("human", """Context:

{context}

Question:

{input}
"""),
])


from langchain_groq import ChatGroq

# ── LLM ───────────────────────────────────────────────────────────────────────

def get_llm():
    """
    Load and return the Groq LLM.
    Uses GROQ_API_KEY from settings.
    """
    llm = ChatGroq(
        model=settings.GROQ_LLM_MODEL,
        api_key=settings.GROQ_API_KEY,
        temperature=0,
    )

    logger.info(f"LLM loaded: {settings.GROQ_LLM_MODEL}")
    return llm


# ── RAG chain ──────────────────────────────────────────────────────────────────

def build_rag_chain(retriever):
    """
    Build and return the full RAG chain.
    """
    llm = get_llm()

    rag_chain = (
        prompt
        | llm
        | StrOutputParser()
    )

    logger.info("RAG chain built successfully.")
    return rag_chain


# ── Confidence scoring ─────────────────────────────────────────────────────────

def calculate_confidence(vectorstore, question):
    """
    Estimate how confident the retriever is about a question by converting
    Chroma's distance scores into similarities.

    Chroma returns L2 distances (lower = more similar).
    Formula: similarity = 1 / (1 + distance)
    This maps [0, ∞) distances to (0, 1] similarities.
    Final confidence is the average similarity as a percentage.
    """
    results = vectorstore.similarity_search_with_score(question, k=5)

    if not results:
        return 0.0

    similarities = [1 / (1 + score) for _, score in results]
    confidence = (sum(similarities) / len(similarities)) * 100

    return round(confidence, 2)


# ── Main entry point ───────────────────────────────────────────────────────────

def ask_question(question, retriever, rag_chain, vectorstore, history=None):
    """
    Run the full RAG pipeline for a single question.
    """
    # 1. Retrieve the top-5 most relevant chunks
    retrieved_docs = retriever.invoke(question)
    context_str = format_docs(retrieved_docs)
    
    # 2. Sanitize and format history
    formatted_history = []
    if history:
        clean_history = []
        for msg in history:
            role = msg.get("role")
            content = msg.get("content", "").strip()
            if not content or role not in ["user", "assistant"]:
                continue
            if clean_history and clean_history[-1]["content"] == content:
                continue
            clean_history.append({"role": role, "content": content})
            
        clean_history = clean_history[-10:] # Sliding window (keep last 10)
        
        for msg in clean_history:
            if msg["role"] == "user":
                formatted_history.append(HumanMessage(content=msg["content"]))
            else:
                formatted_history.append(AIMessage(content=msg["content"]))

    # 3. Run the RAG chain
    answer = rag_chain.invoke({
        "context": context_str,
        "input": question,
        "history": formatted_history
    })

    # Temporarily disabled — matches notebook behavior
    confidence = 100

    sources = []
    seen_sources = set()

    for doc in retrieved_docs:
        source_url = doc.metadata.get("source_url", "Unknown")

        if source_url in seen_sources:
            continue

        seen_sources.add(source_url)

        sources.append({
            "title":        doc.metadata.get("page_title", "Unknown"),
            "url":          source_url,
            "content_type": doc.metadata.get("content_type", "Unknown"),
        })

    logger.info(f"Question answered. Sources: {len(sources)}")

    return {
        "question":      question,
        "answer":        answer,
        "confidence":    confidence,
        "sources":       sources,
        "total_sources": len(sources),
    }
