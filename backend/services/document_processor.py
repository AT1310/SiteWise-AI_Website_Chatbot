import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from langchain_core.documents import Document
from langchain_community.document_loaders import (
    PyMuPDFLoader,
    TextLoader,
    CSVLoader,
    UnstructuredWordDocumentLoader,
    UnstructuredPowerPointLoader,
    UnstructuredExcelLoader,
    UnstructuredHTMLLoader,
    UnstructuredMarkdownLoader,
    UnstructuredXMLLoader,
    UnstructuredImageLoader,
    UnstructuredEmailLoader,
)

from core.logging import get_logger
from services.crawler import USER_AGENT, REQUEST_TIMEOUT

logger = get_logger(__name__)


# Maps file extensions to their LangChain loaders.
LOADER_MAPPING = {
    ".pdf":  PyMuPDFLoader,
    ".docx": UnstructuredWordDocumentLoader,
    ".doc":  UnstructuredWordDocumentLoader,
    ".pptx": UnstructuredPowerPointLoader,
    ".ppt":  UnstructuredPowerPointLoader,
    ".xlsx": UnstructuredExcelLoader,
    ".xls":  UnstructuredExcelLoader,
    ".csv":  CSVLoader,
    ".txt":  TextLoader,
    ".xml":  UnstructuredXMLLoader,
    ".md":   UnstructuredMarkdownLoader,
    ".png":  UnstructuredImageLoader,
    ".jpg":  UnstructuredImageLoader,
    ".jpeg": UnstructuredImageLoader,
    ".eml":  UnstructuredEmailLoader,
    ".msg":  UnstructuredEmailLoader,
    ".json": TextLoader,
    ".yaml": TextLoader,
    ".yml":  TextLoader,
    ".rtf":  TextLoader,
}


# ── HTML pages → Documents ─────────────────────────────────────────────────────

def convert_pages_to_documents(pages):
    """
    Convert raw HTML pages (from crawl_website) into LangChain Documents.

    Each document stores cleaned text and metadata:
    source_url, domain, page_title, crawl_time, content_type.
    """
    documents = []
    crawl_time = datetime.now(timezone.utc).isoformat()

    for page in pages:
        soup = BeautifulSoup(page["html"], "html.parser")

        title = (soup.title.string or "").strip() if soup.title else "Untitled"
        title = title or "Untitled"

        # Remove layout/noise tags before extracting text
        for tag in soup(["script", "style", "noscript", "header", "footer", "svg"]):
            tag.decompose()

        # Convert <a> tags to markdown format so the LLM can see the URLs
        for a_tag in soup.find_all("a", href=True):
            link_text = a_tag.get_text(strip=True)
            href_attr = a_tag["href"]
            href = href_attr[0] if isinstance(href_attr, list) else str(href_attr)
            
            if href.startswith("/"):
                from urllib.parse import urljoin
                href = urljoin(page["url"], href)
            
            if link_text and href:
                a_tag.replace_with(f"[{link_text}]({href})")

        text = soup.get_text(separator="\n", strip=True)

        if not text:
            continue

        document = Document(
            page_content=text,
            metadata={
                "source_url":   page["url"],
                "domain":       urlparse(page["url"]).netloc,
                "page_title":   title,
                "crawl_time":   crawl_time,
                "content_type": "website",
            },
        )
        documents.append(document)

    logger.info(f"Converted {len(documents)} HTML pages into Documents.")
    return documents


# ── File URLs → Documents ──────────────────────────────────────────────────────

def process_document_url(url, visited_documents):
    """
    Download a file URL, save it to a temp file, load it with the correct
    LangChain loader, enrich its metadata, and return the resulting Documents.

    Returns an empty list if the URL has already been processed or the
    file type is unsupported.
    """
    extension = Path(urlparse(url).path).suffix.lower()

    if extension not in LOADER_MAPPING:
        return []

    if url in visited_documents:
        return []

    temp_path = None

    try:
        response = requests.get(url, headers=USER_AGENT, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()

        # Write content to a temp file so the loader can read it from disk
        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temp:
            temp.write(response.content)
            temp_path = temp.name

        loader = LOADER_MAPPING[extension](temp_path)
        documents = loader.load()

        for document in documents:
            document.metadata.update({
                "source_url":   url,
                "domain":       urlparse(url).netloc,
                "file_name":    Path(urlparse(url).path).name,
                "file_type":    extension,
                "content_type": "document",
            })

        visited_documents.add(url)
        logger.info(f"Loaded document: {url}")
        return documents

    except Exception as e:
        logger.warning(f"Failed to load document: {url} — {e}")
        return []

    finally:
        if temp_path:
            try:
                os.remove(temp_path)
            except Exception:
                pass


# ── Merge + deduplicate ────────────────────────────────────────────────────────

def merge_documents(website_documents, downloaded_documents):
    """
    Combine website and downloaded documents into a single deduplicated list.

    Deduplication is based on a hash of the text content.
    Documents shorter than 20 characters are also dropped.
    """
    merged = []
    seen_content = set()

    all_documents = website_documents + downloaded_documents

    for document in all_documents:
        if document is None:
            continue

        if not hasattr(document, "page_content"):
            continue

        text = document.page_content.strip()

        if len(text) < 20:
            continue

        content_hash = hash(text)

        if content_hash in seen_content:
            continue

        seen_content.add(content_hash)

        # Ensure required metadata keys always exist
        metadata = document.metadata.copy()
        metadata.setdefault("source_url",   "Unknown")
        metadata.setdefault("domain",       "Unknown")
        metadata.setdefault("content_type", "Unknown")
        document.metadata = metadata

        merged.append(document)

    logger.info(f"Merged document count: {len(merged)}")
    return merged


# ── Orchestrator ───────────────────────────────────────────────────────────────

def process_all_documents(pages, document_urls):
    """
    Full document processing pipeline:
      1. Convert crawled HTML pages to Documents
      2. Download and load all discovered file URLs
      3. Merge and deduplicate both sets

    Returns the final merged list of Documents.
    """
    website_documents = convert_pages_to_documents(pages)

    visited_documents = set()
    downloaded_documents = []

    for url in document_urls:
        docs = process_document_url(url, visited_documents)
        downloaded_documents.extend(docs)

    logger.info(f"Downloaded {len(downloaded_documents)} file document(s).")

    return merge_documents(website_documents, downloaded_documents)
