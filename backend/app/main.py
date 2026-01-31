import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import engine, Base
from app.api import auth, conversations, messages, formats, llm, settings

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
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
app.include_router(settings.router, prefix="/api")


@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy"}


# Serve static files for frontend if directory exists
if os.path.exists("static"):
    # Mount assets and static files
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
    
    # Catch-all route to serve index.html for React routing
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Exclude API and documentation routes from catch-all
        if full_path.startswith("api") or full_path.startswith("docs"):
            return {"detail": "Not Found"}
        
        # Serve index.html
        return FileResponse(os.path.join("static", "index.html"))
else:
    @app.get("/")
    def root():
        """Root endpoint"""
        return {
            "status": "ok",
            "message": "Structura Backend API",
            "version": "0.1.0",
            "docs": "/api/docs"
        }
