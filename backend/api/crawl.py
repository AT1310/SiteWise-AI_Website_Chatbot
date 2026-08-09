import time
from fastapi import APIRouter, Request

from core.exceptions import CrawlException
from core.logging import get_logger
from models.request_models import CrawlRequest
from models.response_models import CrawlResponse
from services.chunker import create_chunks
from services.crawler import crawl_website, get_crawl_strategy
from services.document_processor import process_all_documents
from services.vector_store import build_vector_store

router = APIRouter()
logger = get_logger(__name__)


@router.post("/crawl", response_model=CrawlResponse)
def crawl_endpoint(body: CrawlRequest, request: Request):
    """
    Crawl a website and build a searchable vector store from its content.

    Pipeline:
      1. Detect crawl strategy (llms.txt index or standard BFS crawl)
      2. Crawl the website — collect HTML pages and document URLs
      3. Convert pages + documents into LangChain Documents
      4. Chunk documents into smaller pieces
      5. Enrich metadata, validate, embed, and store in Chroma
      6. Save the collection name in app.state for the /chat endpoint

    Returns a summary of what was crawled and stored.
    """
    url = str(body.url)
    logger.info(f"Crawl request received: {url}")
    start_time = time.time()

    try:
        # Step 1: decide how to crawl
        strategy = get_crawl_strategy(url)
        logger.info(f"Crawl strategy: {strategy['strategy']}")

        # Step 2: crawl — both strategies use crawl_website() since
        # llms.txt is picked up naturally as a .txt document link during crawl
        pages, document_urls = crawl_website(url)

        if not pages and not document_urls:
            raise CrawlException(f"No content found at: {url}")

        website_title = url
        if pages:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(pages[0]["html"], "html.parser")
            website_title = (soup.title.string or url).strip() if soup.title else url

        # Step 3: convert raw HTML + file URLs into Documents
        documents = process_all_documents(pages, document_urls)

        if not documents:
            raise CrawlException("No readable content could be extracted from the site.")

        # Step 4: chunk documents
        chunks = create_chunks(documents)

        # Extract combined content for ReaderView
        combined_content = "\n\n---\n\n".join(doc.page_content for doc in documents if hasattr(doc, "page_content"))
        if len(combined_content) > 100000:
            combined_content = combined_content[:100000] + "\n\n...[Content truncated]..."

        # Step 5: embed and store in Chroma
        vectorstore, collection_name = build_vector_store(chunks, url)

        # Step 6: persist collection name so /chat can reload the vector store
        request.app.state.collection_name = collection_name

        logger.info(f"Crawl complete. Collection: {collection_name}, Chunks: {len(chunks)}")
        
        time_taken = time.time() - start_time

        return CrawlResponse(
            message="Website crawled and indexed successfully.",
            website_url=url,
            website_title=website_title,
            collection_name=collection_name,
            crawl_strategy=strategy["strategy"],
            pages_crawled=len(pages),
            documents_processed=len(documents),
            chunks_created=len(chunks),
            time_taken=time_taken,
            content=combined_content,
        )

    except CrawlException:
        raise

    except Exception as e:
        logger.error(f"Crawl failed: {e}")
        raise CrawlException(str(e))
