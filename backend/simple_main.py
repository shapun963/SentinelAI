"""
Sentinel AI - FastAPI Backend (Simplified)
Advanced AI Content Security Analysis Platform
"""

import os
import re
import asyncio
import logging
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


class SimpleAdShield:
    """
    Simplified AdShield analysis engine for content security analysis.
    """
    
    def __init__(self):
        """Initialize SimpleAdShield with patterns and rules."""
        self._init_pii_patterns()
        self._init_injection_patterns()
        self._init_bias_keywords()
    
    def _init_pii_patterns(self):
        """Initialize patterns for PII detection."""
        self.pii_patterns = {
            "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            "phone": r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            "ssn": r'\b\d{3}-?\d{2}-?\d{4}\b',
            "credit_card": r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
            "ip_address": r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
        }
    
    def _init_injection_patterns(self):
        """Initialize patterns for prompt injection detection."""
        self.injection_patterns = {
            "ignore_instructions": [
                r"ignore\s+(?:all\s+)?(?:previous\s+)?instructions?",
                r"disregard\s+(?:all\s+)?(?:previous\s+)?instructions?",
                r"forget\s+(?:all\s+)?(?:previous\s+)?instructions?",
            ],
            "role_manipulation": [
                r"you\s+are\s+now\s+(?:a\s+)?(?:different\s+)?(?:ai|assistant|bot)",
                r"act\s+as\s+(?:a\s+)?(?:different\s+)?(?:ai|assistant|bot)",
                r"pretend\s+(?:to\s+be\s+)?(?:a\s+)?(?:different\s+)?(?:ai|assistant|bot)",
            ],
            "jailbreak_attempts": [
                r"developer\s+mode",
                r"jailbreak",
                r"bypass\s+safety",
                r"disable\s+filters?",
            ]
        }
    
    def _init_bias_keywords(self):
        """Initialize keywords for bias detection."""
        self.bias_keywords = {
            "racial": ["race", "ethnicity", "skin color", "african", "asian", "hispanic", "white", "black"],
            "gender": ["gender", "male", "female", "man", "woman", "masculine", "feminine"],
            "age": ["age", "old", "young", "elderly", "teenager", "child", "adult"],
            "religious": ["religion", "christian", "muslim", "jewish", "hindu", "buddhist"],
        }
    
    def analyze(self, text: str, generated_output: str = "") -> Dict[str, Any]:
        """Perform comprehensive analysis on input text."""
        full_text = f"{text} {generated_output}".strip()
        
        # Perform individual analyses
        prompt_injection = self._analyze_prompt_injection(text)
        pii_analysis = self._analyze_pii(full_text)
        bias_analysis = self._analyze_bias(full_text)
        
        # Calculate overall risk score
        overall_score = self._calculate_overall_score(prompt_injection, pii_analysis, bias_analysis)
        risk_level = self._determine_risk_level(overall_score)
        
        # Generate summary
        summary = self._generate_summary(prompt_injection, pii_analysis, bias_analysis, risk_level)
        
        return {
            "promptInjection": prompt_injection,
            "pii": pii_analysis,
            "bias": bias_analysis,
            "overall": {
                "score": overall_score,
                "riskLevel": risk_level
            },
            "summary": summary
        }
    
    def _analyze_prompt_injection(self, text: str) -> Dict[str, Any]:
        """Analyze text for prompt injection attempts."""
        text_lower = text.lower()
        detections = []
        total_score = 0
        
        for category, patterns in self.injection_patterns.items():
            for pattern in patterns:
                matches = list(re.finditer(pattern, text_lower, re.IGNORECASE))
                for match in matches:
                    severity = "high" if category == "jailbreak_attempts" else "medium"
                    score = 75 if severity == "high" else 50
                    total_score = max(total_score, score)
                    
                    detections.append({
                        "start": match.start(),
                        "end": match.end(),
                        "type": category,
                        "severity": severity
                    })
        
        return {
            "score": min(total_score, 100),
            "detected": len(detections) > 0,
            "indices": detections
        }
    
    def _analyze_pii(self, text: str) -> Dict[str, Any]:
        """Analyze text for PII."""
        detections = []
        total_score = 0
        
        for pii_type, pattern in self.pii_patterns.items():
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            for match in matches:
                score = {"ssn": 100, "credit_card": 100, "email": 60, "phone": 70, "ip_address": 30}.get(pii_type, 50)
                total_score = max(total_score, score)
                
                detections.append({
                    "start": match.start(),
                    "end": match.end(),
                    "type": "pii",
                    "piiType": pii_type
                })
        
        return {
            "score": min(total_score, 100),
            "detected": len(detections) > 0,
            "indices": detections
        }
    
    def _analyze_bias(self, text: str) -> Dict[str, Any]:
        """Analyze text for bias."""
        text_lower = text.lower()
        detections = []
        bias_scores = {"racial": 0, "gender": 0, "age": 0, "religious": 0}
        
        for bias_type, keywords in self.bias_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    pos = text_lower.find(keyword)
                    bias_scores[bias_type] = max(bias_scores[bias_type], 30)
                    
                    detections.append({
                        "start": pos,
                        "end": pos + len(keyword),
                        "type": "bias",
                        "biasType": bias_type
                    })
        
        overall_bias_score = max(bias_scores.values())
        
        return {
            "score": min(overall_bias_score, 100),
            "detected": len(detections) > 0,
            "indices": detections,
            "racial": bias_scores["racial"],
            "gender": bias_scores["gender"],
            "age": bias_scores["age"],
            "religious": bias_scores["religious"]
        }
    
    def _calculate_overall_score(self, prompt_injection: Dict, pii_analysis: Dict, bias_analysis: Dict) -> int:
        """Calculate overall risk score."""
        scores = [prompt_injection["score"], pii_analysis["score"], bias_analysis["score"]]
        weights = [0.4, 0.3, 0.3]
        weighted_score = sum(score * weight for score, weight in zip(scores, weights))
        return min(int(weighted_score), 100)
    
    def _determine_risk_level(self, score: int) -> str:
        """Determine risk level based on score."""
        if score >= 80:
            return "high"
        elif score >= 50:
            return "medium"
        else:
            return "low"
    
    def _generate_summary(self, prompt_injection: Dict, pii_analysis: Dict, bias_analysis: Dict, risk_level: str) -> Dict[str, Any]:
        """Generate analysis summary."""
        risk_factors = []
        recommendations = []
        
        if prompt_injection["detected"]:
            risk_factors.append("Potential prompt injection attempts detected")
            recommendations.append("Review and sanitize user inputs before processing")
        
        if pii_analysis["detected"]:
            risk_factors.append("Personally identifiable information found in content")
            recommendations.append("Implement PII masking or removal procedures")
        
        if bias_analysis["detected"]:
            risk_factors.append("Potential bias indicators found in content")
            recommendations.append("Review content for inclusive language")
        
        if not risk_factors:
            risk_factors.append("No significant security risks detected")
            recommendations.append("Content appears safe for processing")
        
        trust_lens = f"The analyzed content presents {risk_level} security risks. " + " ".join(risk_factors)
        
        return {
            "trustLens": trust_lens,
            "recommendations": recommendations,
            "riskFactors": risk_factors
        }


# Global variables
adshield_engine: Optional[SimpleAdShield] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    global adshield_engine
    logger.info("Starting Sentinel AI Backend")
    
    try:
        adshield_engine = SimpleAdShield()
        logger.info("AdShield engine initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize AdShield: {e}")
        raise RuntimeError("Failed to initialize AdShield engine")
    
    yield
    
    logger.info("Shutting down Sentinel AI Backend")


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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class AnalysisRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000)
    generated_output: Optional[str] = Field(None, max_length=10000)


class AnalysisResponse(BaseModel):
    promptInjection: Dict[str, Any]
    pii: Dict[str, Any]
    bias: Dict[str, Any]
    overall: Dict[str, Any]
    summary: Dict[str, Any]


# API Routes
@app.get("/")
async def root():
    """Root endpoint providing API information."""
    return {
        "service": "Sentinel AI",
        "version": "2.0.0",
        "description": "Advanced AI Content Security Analysis Platform",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "operational" if adshield_engine else "unavailable",
        "version": "2.0.0",
        "components": {
            "adshield": "operational" if adshield_engine else "unavailable"
        }
    }


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_content(request: AnalysisRequest):
    """Analyze content for security risks, PII, and bias."""
    try:
        if not adshield_engine:
            raise HTTPException(status_code=503, detail="AdShield engine not available")
        
        logger.info(f"Analyzing content: {len(request.prompt)} characters")
        
        # Perform analysis
        results = adshield_engine.analyze(
            text=request.prompt,
            generated_output=request.generated_output or ""
        )
        
        # Log results
        risk_level = results.get("overall", {}).get("riskLevel", "unknown")
        score = results.get("overall", {}).get("score", 0)
        logger.info(f"Analysis complete: {score}/100 ({risk_level} risk)")
        
        return AnalysisResponse(**results)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run("simple_main:app", host=host, port=port, reload=True)