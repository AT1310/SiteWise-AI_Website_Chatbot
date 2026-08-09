from core.logging import get_logger

logger = get_logger(__name__)


def get_retriever(vectorstore):
    """
    Create a similarity-based retriever that returns the top 5 chunks
    most relevant to the query.
    """
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 8, "fetch_k": 30},
    )

    logger.info("Retriever created. search_type=mmr, k=8")
    return retriever


def format_docs(docs):
    """
    Join retrieved document chunks into a single context string.

    Each chunk is separated by a blank line so the LLM can distinguish
    between different pieces of context.
    """
    return "\n\n".join(doc.page_content for doc in docs)
