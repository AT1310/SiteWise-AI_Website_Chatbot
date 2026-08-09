from database.faiss_store import (
    enrich_document_metadata,
    get_collection_name,
    create_and_save_faiss_index,
    load_faiss_index,
    validate_documents,
)
from services.embeddings import get_embedding_function
from core.logging import get_logger

logger = get_logger(__name__)


def build_vector_store(chunks, url):
    """
    Run the full pipeline from chunks to a persisted FAISS index.

    Steps:
      1. Enrich each chunk's metadata (document_id, content_hash, etc.)
      2. Validate and filter out low-quality chunks
      3. Derive the collection name from the crawled URL
      4. Load the embedding model
      5. Initialize and save the FAISS vectorstore
    """
    logger.info("Starting FAISS vector store build pipeline.")

    chunks = enrich_document_metadata(chunks)
    chunks = validate_documents(chunks)

    if not chunks:
        raise ValueError("No valid chunks to store after validation.")

    collection_name = get_collection_name(url)
    embedding_function = get_embedding_function()
    
    vectorstore = create_and_save_faiss_index(collection_name, chunks, embedding_function)

    logger.info(f"FAISS Vector store ready. Collection: {collection_name}, Chunks: {len(chunks)}")
    return vectorstore, collection_name


def load_vector_store(collection_name):
    """
    Re-open an existing FAISS index from disk.
    """
    embedding_function = get_embedding_function()
    vectorstore = load_faiss_index(collection_name, embedding_function)

    logger.info(f"Loaded FAISS vector store from disk. Collection: {collection_name}")
    return vectorstore
