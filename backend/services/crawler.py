from collections import deque
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_fixed

from core.logging import get_logger

logger = get_logger(__name__)


# ── Constants ─────────────────────────────────────────────────────────────────

MAX_CRAWL_DEPTH = 3
MAX_PAGES = 100
REQUEST_TIMEOUT = 15

USER_AGENT = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/138.0.0.0 Safari/537.36"
    )
}

# Extensions that should be downloaded as documents rather than crawled as HTML.
SUPPORTED_EXTENSIONS = (
    ".pdf", ".docx", ".doc", ".pptx", ".ppt",
    ".xlsx", ".xls", ".csv", ".txt",
    ".xml", ".md", ".png", ".jpg",
    ".jpeg", ".eml", ".msg", ".json", ".yaml",
    ".yml", ".rtf",
)


# ── Page fetching ──────────────────────────────────────────────────────────────

@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def fetch_page(url):
    """Fetch a URL with retry logic. Raises on HTTP errors."""
    response = requests.get(url, headers=USER_AGENT, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    return response


# ── Link extraction ────────────────────────────────────────────────────────────

def is_same_domain(base_url, target_url):
    return urlparse(base_url).netloc == urlparse(target_url).netloc


def extract_links(base_url, html):
    """
    Parse HTML and split discovered links into two sets:
      - page_links: same-domain HTML pages to continue crawling
      - document_links: same-domain URLs with a supported file extension
    """
    soup = BeautifulSoup(html, "html.parser")

    page_links = set()
    document_links = set()

    for tag in soup.find_all("a", href=True):
        href = str(tag.get("href") or "").strip()

        if not href:
            continue

        # Skip non-navigable links
        if href.startswith(("#", "javascript:", "mailto:", "tel:")):
            continue

        absolute_url = urljoin(base_url, href)
        parsed = urlparse(absolute_url)

        # Strip fragment (#section) to avoid duplicate visits
        clean_url = parsed._replace(fragment="").geturl()

        if not is_same_domain(base_url, clean_url):
            continue

        extension = Path(parsed.path).suffix.lower()

        if extension in SUPPORTED_EXTENSIONS:
            document_links.add(clean_url)
        else:
            page_links.add(clean_url)

    return page_links, document_links


# ── BFS Crawler ────────────────────────────────────────────────────────────────

def crawl_website(start_url):
    """
    BFS crawl starting from start_url.

    Returns:
        pages     — list of {"url": ..., "html": ...} dicts
        documents — list of document URLs discovered during crawl
    """
    queue = deque()
    queue.append((start_url, 0))

    visited_urls = set()
    pages = []
    documents = set()

    while queue:
        current_url, depth = queue.popleft()

        if current_url in visited_urls:
            continue

        if depth > MAX_CRAWL_DEPTH:
            continue

        if len(visited_urls) >= MAX_PAGES:
            break

        try:
            response = fetch_page(current_url)
            visited_urls.add(current_url)

            pages.append({"url": current_url, "html": response.text})

            page_links, document_links = extract_links(current_url, response.text)
            documents.update(document_links)

            for link in page_links:
                if link not in visited_urls:
                    queue.append((link, depth + 1))

            logger.info(f"Crawled: {current_url}")

        except Exception as e:
            logger.warning(f"Failed: {current_url} — {e}")

    logger.info(f"Crawl complete. Pages: {len(pages)}, Documents: {len(documents)}")
    return pages, list(documents)


# ── LLMs.txt strategy detection ────────────────────────────────────────────────

def detect_llms_txt(base_url):
    """
    Check if the website exposes /llms.txt (an LLM-friendly documentation index).
    Returns the URL if found, None otherwise.
    """
    llms_url = urljoin(base_url, "/llms.txt")

    try:
        response = requests.get(llms_url, headers=USER_AGENT, timeout=10)

        if response.status_code == 200:
            logger.info(f"llms.txt found: {llms_url}")
            return llms_url

        logger.info("llms.txt not found.")
        return None

    except Exception as e:
        logger.warning(f"Error checking llms.txt: {e}")
        return None


def get_crawl_strategy(base_url):
    """
    Decide crawl strategy based on whether the site has /llms.txt.

    Returns a dict with "strategy" key:
      {"strategy": "llms_txt", "llms_url": "..."}  — site has llms.txt
      {"strategy": "crawler",  "start_url": "..."}  — standard BFS crawl
    """
    llms_url = detect_llms_txt(base_url)

    if llms_url:
        logger.info("Strategy selected: LLM Documentation Index")
        return {"strategy": "llms_txt", "llms_url": llms_url}

    logger.info("Strategy selected: Standard Website Crawl")
    return {"strategy": "crawler", "start_url": base_url}
