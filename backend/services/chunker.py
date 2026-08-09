import uuid

from langchain_text_splitters import RecursiveCharacterTextSplitter

from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


def create_chunks(documents):
    """
    Split documents into chunks using RecursiveCharacterTextSplitter.

    Chunk size and overlap are read from config so they can be tuned
    via .env without touching code.

    Each chunk gets two extra metadata fields:
      chunk_id     — unique UUID for that chunk
      chunk_number — 1-based position in the overall chunk list
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", "? ", "! ", " ", ""],
    )

    chunks = splitter.split_documents(documents)

    for index, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"]     = str(uuid.uuid4())
        chunk.metadata["chunk_number"] = index + 1

    logger.info(f"Created {len(chunks)} chunks from {len(documents)} documents.")
    return chunks
