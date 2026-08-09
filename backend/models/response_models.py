from pydantic import BaseModel


class CrawlResponse(BaseModel):
    status: str = "success"
    message: str
    website_url: str
    website_title: str
    collection_name: str
    crawl_strategy: str
    pages_crawled: int
    documents_processed: int
    chunks_created: int
    time_taken: float
    content: str | None = None


class Source(BaseModel):
    title: str
    url: str
    content_type: str


class ChatResponse(BaseModel):
    question: str
    answer: str
    confidence: float
    sources: list[Source]
    total_sources: int
