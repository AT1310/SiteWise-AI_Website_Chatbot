import torch

from langchain_community.embeddings import HuggingFaceEmbeddings
from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


def get_embedding_function():
    """
    Load and return the HuggingFace embedding model.

    The model name is read from settings.EMBEDDING_MODEL.
    """
    logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")

    device = "mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu"
    logger.info(f"Using device: {device} for embeddings")

    embeddings = HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
        model_kwargs={"device": device},
        encode_kwargs={"normalize_embeddings": True, "batch_size": 256},
    )

    logger.info("Embedding model loaded successfully.")
    return embeddings
