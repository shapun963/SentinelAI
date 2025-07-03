"""
Sentinel AI - FastAPI Backend
Advanced AI Content Security Analysis Platform
"""

import os
import asyncio
import logging
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

import google.generativeai as genai
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from shield_engine import AdShield
from gemini_analyzer import analyze_with_gemini

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Global variables for shared resources
adshield_engine: Optional[AdShield] = None
gemini_model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    # Startup
    logger.info("🚀 Starting Sentinel AI Backend")
    
    # Initialize AdShield engine
    global adshield_engine
    try:
        logger.info("📡 Initializing AdShield engine...")
        adshield_engine = AdShield()
        logger.info("✅ AdShield engine initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize AdShield: {e}")
        raise RuntimeError("Failed to initialize AdShield engine")
    
    # Initialize Gemini API
    global gemini_model
    try:
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            gemini_model = genai.GenerativeModel("gemini-1.5-flash")
            logger.info("✅ Gemini API configured successfully")
        else:
            logger.warning("⚠️ GEMINI_API_KEY not found. Enhanced analysis will be limited.")
    except Exception as e:
        logger.warning(f"⚠️ Gemini API configuration failed: {e}")
    
    logger.info("🎯 Sentinel AI Backend ready for analysis")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down Sentinel AI Backend")


# Create FastAPI application
app = FastAPI(
    title="Sentinel AI",
    description="Advanced AI Content Security Analysis Platform",
    version="2.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class AnalysisRequest(BaseModel):
    """Request model for content analysis."""
    prompt: str = Field(..., min_length=1, max_length=10000, description="Text to analyze")
    generated_output: Optional[str] = Field(None, max_length=10000, description="Optional AI-generated output to analyze")
    include_gemini_analysis: bool = Field(True, description="Whether to include enhanced Gemini analysis")


class AnalysisResponse(BaseModel):
    """Response model for analysis results."""
    promptInjection: Dict[str, Any]
    pii: Dict[str, Any]
    bias: Dict[str, Any]
    overall: Dict[str, Any]
    summary: Dict[str, Any]
    gemini_insights: Optional[Dict[str, Any]] = None


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    version: str
    components: Dict[str, str]


# API Routes
@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint providing API information."""
    return {
        "service": "Sentinel AI",
        "version": "2.0.0",
        "description": "Advanced AI Content Security Analysis Platform",
        "status": "operational",
        "endpoints": {
            "analyze": "/api/analyze",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    component_status = {
        "adshield": "operational" if adshield_engine else "unavailable",
        "gemini": "operational" if gemini_model else "limited",
        "api": "operational"
    }
    
    overall_status = "operational" if adshield_engine else "degraded"
    
    return HealthResponse(
        status=overall_status,
        version="2.0.0",
        components=component_status
    )


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_content(request: AnalysisRequest, background_tasks: BackgroundTasks):
    """
    Analyze content for security risks, PII, and bias.
    
    This endpoint performs comprehensive analysis using:
    - AdShield engine for prompt injection, PII, and bias detection
    - Optional Gemini AI for enhanced insights and explanations
    """
    try:
        if not adshield_engine:
            raise HTTPException(
                status_code=503, 
                detail="AdShield engine not available. Service temporarily unavailable."
            )
        
        logger.info(f"🔍 Analyzing content: {len(request.prompt)} characters")
        
        # Perform AdShield analysis
        adshield_results = adshield_engine.analyze(
            text=request.prompt,
            generated_output=request.generated_output or ""
        )
        
        # Prepare response
        response_data = AnalysisResponse(**adshield_results)
        
        # Add enhanced Gemini analysis if requested and available
        if request.include_gemini_analysis and gemini_model:
            try:
                logger.info("🧠 Performing enhanced Gemini analysis")
                gemini_response = analyze_with_gemini(
                    adshield_results, 
                    request.prompt, 
                    gemini_model
                )
                
                # Parse Gemini response
                import json
                response_data.gemini_insights = json.loads(gemini_response)
                
            except Exception as e:
                logger.warning(f"Gemini analysis failed: {e}")
                # Continue without Gemini insights
        
        # Log analysis summary
        risk_level = adshield_results.get("overall", {}).get("riskLevel", "unknown")
        score = adshield_results.get("overall", {}).get("score", 0)
        logger.info(f"📊 Analysis complete: {score}/100 ({risk_level} risk)")
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@app.get("/api/models/status")
async def get_model_status():
    """Get the status of all AI models and components."""
    return {
        "adshield": {
            "status": "operational" if adshield_engine else "unavailable",
            "components": {
                "bias_classifier": "operational" if adshield_engine and adshield_engine.bias_classifier else "unavailable",
                "sentiment_analyzer": "operational" if adshield_engine and adshield_engine.sentiment_analyzer else "unavailable",
                "pattern_detection": "operational" if adshield_engine else "unavailable"
            }
        },
        "gemini": {
            "status": "operational" if gemini_model else "unavailable",
            "model": "gemini-1.5-flash" if gemini_model else None
        }
    }


@app.post("/api/analyze/batch")
async def analyze_batch(requests: list[AnalysisRequest]):
    """Analyze multiple content items in batch."""
    if not adshield_engine:
        raise HTTPException(
            status_code=503,
            detail="AdShield engine not available"
        )
    
    if len(requests) > 50:  # Limit batch size
        raise HTTPException(
            status_code=400,
            detail="Batch size too large. Maximum 50 items per request."
        )
    
    results = []
    for i, request in enumerate(requests):
        try:
            logger.info(f"🔍 Batch analysis {i+1}/{len(requests)}")
            analysis = adshield_engine.analyze(
                text=request.prompt,
                generated_output=request.generated_output or ""
            )
            results.append({
                "index": i,
                "status": "success",
                "analysis": analysis
            })
        except Exception as e:
            logger.error(f"Batch item {i} failed: {e}")
            results.append({
                "index": i,
                "status": "error",
                "error": str(e)
            })
    
    return {"results": results}


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred during processing",
            "type": "server_error"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    # Run the application
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )