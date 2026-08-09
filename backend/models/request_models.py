from typing import List, Dict, Any, Optional
from pydantic import BaseModel, HttpUrl


class CrawlRequest(BaseModel):
    url: HttpUrl


class ChatRequest(BaseModel):
    question: str
    history: Optional[List[Dict[str, Any]]] = None
