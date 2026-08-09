import os
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.chat import router as chat_router
from api.crawl import router as crawl_router
from api.health import router as health_router
from api.utils import router as utils_router

app = FastAPI(
    title="AI Website Chatbot",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(crawl_router)
app.include_router(chat_router)

@app.get("/")
def home():
    return {"message": "Backend is running successfully."}

app.include_router(utils_router)
