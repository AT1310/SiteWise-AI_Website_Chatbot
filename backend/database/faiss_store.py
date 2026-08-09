import hashlib
import os
from datetime import datetime, timezone
from urllib.parse import urlparse

from langchain_community.vectorstores import FAISS

from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


# Pages containing these patterns are considered junk and discarded.
INVALID_PATTERNS = [
    "404",
    "page not found",
    "access denied",
    "forbidden",
    "login",
    "sign in",
    "sign up",
    "javascript is disabled",
    "cookie policy",
    "enable javascript",
    "captcha",
    "robot check",
    "cloudflare",
    "service unavailable",
    "internal server error",
]


# ── Collection naming ──────────────────────────────────────────────────────────

def get_collection_name(url):
    """
    Derive a FAISS index name from a URL.

    Example: "https://python.langchain.com" → "default_python_langchain_com"
    """
    domain = urlparse(url).netloc.replace(".", "_")
    return f"default_{domain}"


# ── Metadata enrichment ────────────────────────────────────────────────────────

def generate_sha256(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def enrich_document_metadata(documents):
    """
    Add provenance and integrity fields to each document's metadata.
    """
    ingestion_time = datetime.now(timezone.utc).isoformat()

    for document in documents:
        source = document.metadata.get("source_url", "unknown")

        document.metadata["document_id"]       = generate_sha256(source + document.page_content)
        document.metadata["content_hash"]      = generate_sha256(document.page_content)
        document.metadata["document_size"]     = len(document.page_content)
        document.metadata["language"]          = "unknown"
        document.metadata["processing_status"] = "processed"
        document.metadata["ingestion_time"]    = ingestion_time

    logger.info(f"Metadata enriched for {len(documents)} documents.")
    return documents


# ── Validation ─────────────────────────────────────────────────────────────────

def validate_documents(documents):
    """
    Filter out low-quality documents before they enter the vector store.
    """
    validated = []
    seen_hashes = set()

    for document in documents:
        text = document.page_content.strip()

        if len(text.split()) < 10:
            continue

        lower = text.lower()
        if any(pattern in lower for pattern in INVALID_PATTERNS):
            continue

        content_hash = document.metadata.get("content_hash")

        if content_hash in seen_hashes:
            continue

        seen_hashes.add(content_hash)
        validated.append(document)

    logger.info(f"Validated: {len(validated)} / {len(documents)} documents passed.")
    return validated


# ── FAISS Initialization and Storage ────────────────────────────────────────────

def create_and_save_faiss_index(collection_name, chunks, embedding_function):
    """
    Create a FAISS index from chunks and save it to disk.
    """
    db_path = os.path.join(settings.VECTOR_DB_PATH, collection_name)
    os.makedirs(db_path, exist_ok=True)
    
    logger.info(f"Building FAISS index with {len(chunks)} chunks...")
    vectorstore = FAISS.from_documents(chunks, embedding_function)
    
    logger.info(f"Saving FAISS index to {db_path}...")
    vectorstore.save_local(db_path)
    
    return vectorstore

def load_faiss_index(collection_name, embedding_function):
    """
    Load a saved FAISS index from disk.
    """
    db_path = os.path.join(settings.VECTOR_DB_PATH, collection_name)
    
    logger.info(f"Loading FAISS index from {db_path}...")
    vectorstore = FAISS.load_local(db_path, embedding_function, allow_dangerous_deserialization=True)
    
    return vectorstore
