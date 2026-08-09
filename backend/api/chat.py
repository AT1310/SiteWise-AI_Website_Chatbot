from fastapi import APIRouter, Request

from core.exceptions import ChatException
from core.logging import get_logger
from models.request_models import ChatRequest
from models.response_models import ChatResponse, Source
from services.rag_engine import ask_question, build_rag_chain
from services.retriever import get_retriever
from services.vector_store import load_vector_store

router = APIRouter()
logger = get_logger(__name__)


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(body: ChatRequest, request: Request):
    """
    Answer a question using the most recently indexed website.

    Pipeline:
      1. Read the collection name stored by the last /crawl call
      2. Reload the Chroma vectorstore from disk
      3. Build the retriever (similarity, k=5)
      4. Build the RAG chain (retriever → prompt → LLM)
      5. Run ask_question and return a structured response

    Raises 400 if /crawl has not been called yet.
    Raises 500 for any unexpected error during inference.
    """
    collection_name = getattr(request.app.state, "collection_name", None)

    if not collection_name:
        raise ChatException(
            "No indexed website found. Please call POST /crawl first."
        )

    logger.info(f"Chat request: '{body.question}' | Collection: {collection_name}")

    try:
        vectorstore = load_vector_store(collection_name)
        retriever   = get_retriever(vectorstore)
        rag_chain   = build_rag_chain(retriever)

        result = ask_question(
            question=body.question,
            retriever=retriever,
            rag_chain=rag_chain,
            vectorstore=vectorstore,
            history=body.history,
        )

        sources = [Source(**source) for source in result["sources"]]

        return ChatResponse(
            question=result["question"],
            answer=result["answer"],
            confidence=result["confidence"],
            sources=sources,
            total_sources=result["total_sources"],
        )

    except ChatException:
        raise

    except Exception as e:
        error_str = str(e).lower()
        if "quota" in error_str or "rate limit" in error_str or "429" in error_str or "resourceexhausted" in error_str:
            logger.warning(f"Rate limit hit: {e}")
            raise ChatException("Groq API rate limit reached. Please wait 1-2 minutes and try again.")
            
        logger.error(f"Chat failed: {e}")
        raise ChatException(str(e))
