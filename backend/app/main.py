from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import auth, conversations, messages, formats, llm

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Structura Backend",
    version="0.1.0",
    description="FastAPI Backend for Structura - LLM Structured Outputs",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(formats.router, prefix="/api")
app.include_router(llm.router, prefix="/api")


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "status": "ok",
        "message": "Structura Backend API",
        "version": "0.1.0",
        "docs": "/api/docs"
    }


@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy"}
