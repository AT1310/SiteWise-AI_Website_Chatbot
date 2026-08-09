# SiteWise - AI Website Chatbot

SiteWise is a Retrieval-Augmented Generation (RAG) full-stack application that allows users to chat with any website. Simply paste a URL, and the system will crawl the website, extract and chunk its content, create vector embeddings, and provide a floating AI assistant capable of answering questions about the page—with direct source citations.

## 🌟 Features

- **Automated Web Crawling & Scraping**: Give it a URL, and it intelligently crawls the site, extracting meaningful content using BeautifulSoup.
- **RAG Pipeline**: Utilizes LangChain, ChromaDB (vector database), and Sentence Transformers to handle document processing, embedding, and semantic search.
- **AI Chat with Citations**: Get accurate answers to your questions based solely on the provided website content, complete with source tracking.
- **Modern UI**: A beautiful, responsive frontend built with React, Vite, TailwindCSS, and Radix UI components.
- **High-Performance API**: Backend powered by FastAPI, ensuring fast and reliable endpoints.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS 4, Framer Motion for animations
- **State & Routing**: TanStack Router, React Query
- **UI Components**: Radix UI, Lucide React

### Backend
- **Framework**: FastAPI, Python
- **LLM & Orchestration**: LangChain, Groq/Gemini integrations
- **Vector Store**: ChromaDB
- **Embeddings**: Sentence Transformers (Local HuggingFace embeddings)
- **Scraping**: BeautifulSoup4, lxml

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js & npm (or Bun)
- Virtual Environment (recommended)

### 1. Backend Setup

```bash
# Navigate to project root
cd RAG_Project

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Ensure your .env file is present with the required API keys (e.g. LLM API keys).

# Run the FastAPI server
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The backend API will be available at `http://localhost:8000`. You can view the Swagger documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd RAG_Project/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will run on `http://localhost:8080` (or the port specified by Vite).

## 📁 Project Structure

```text
RAG_Project/
├── backend/                # FastAPI application
│   ├── api/                # API routers (chat, crawl, health)
│   ├── core/               # Configuration and core logic
│   ├── models/             # Pydantic models for requests/responses
│   └── services/           # Business logic (vector_store, retriever, crawler, etc.)
├── frontend/               # React application
│   ├── src/                # React components, routes, and services
│   └── package.json        # Frontend dependencies
├── requirements.txt        # Python backend dependencies
└── README.md               # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
