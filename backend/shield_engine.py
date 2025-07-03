"""
AdShield - Advanced AI Content Analysis Engine
Comprehensive analysis for prompt injection, PII detection, and bias analysis
"""

import re
import json
import torch
from typing import Dict, List, Any, Optional
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AdShield:
    """
    AdShield analysis engine for comprehensive content security analysis.
    Provides prompt injection detection, PII identification, and bias analysis.
    """
    
    def __init__(self):
        """Initialize AdShield with necessary models and patterns."""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Initializing AdShield on device: {self.device}")
        
        # Initialize models
        self._init_models()
        
        # Initialize PII patterns
        self._init_pii_patterns()
        
        # Initialize prompt injection patterns
        self._init_injection_patterns()
        
        # Initialize bias detection keywords
        self._init_bias_keywords()
    
    def _init_models(self):
        """Initialize AI models for analysis."""
        try:
            # Bias detection model
            self.bias_classifier = pipeline(
                "text-classification",
                model="unitary/toxic-bert",
                device=0 if self.device == "cuda" else -1
            )
            
            # Sentiment analysis for additional context
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest",
                device=0 if self.device == "cuda" else -1
            )
            
            logger.info("Models initialized successfully")
        except Exception as e:
            logger.warning(f"Model initialization failed: {e}. Using fallback analysis.")
            self.bias_classifier = None
            self.sentiment_analyzer = None
    
    def _init_pii_patterns(self):
        """Initialize patterns for PII detection."""
        self.pii_patterns = {
            "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            "phone": r'(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            "ssn": r'\b\d{3}-?\d{2}-?\d{4}\b',
            "credit_card": r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
            "ip_address": r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
            "address": r'\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Plaza|Pl)',
            "date_of_birth": r'\b(?:0[1-9]|1[0-2])[/-](?:0[1-9]|[12][0-9]|3[01])[/-](?:19|20)\d{2}\b',
            "passport": r'\b[A-Z]{1,2}\d{6,9}\b',
            "license_plate": r'\b[A-Z]{1,3}[-\s]?\d{1,4}[-\s]?[A-Z]{0,3}\b'
        }
    
    def _init_injection_patterns(self):
        """Initialize patterns for prompt injection detection."""
        self.injection_patterns = {
            "ignore_instructions": [
                r"ignore\s+(?:all\s+)?(?:previous\s+)?instructions?",
                r"disregard\s+(?:all\s+)?(?:previous\s+)?instructions?",
                r"forget\s+(?:all\s+)?(?:previous\s+)?instructions?",
                r"override\s+(?:all\s+)?(?:previous\s+)?instructions?"
            ],
            "role_manipulation": [
                r"you\s+are\s+now\s+(?:a\s+)?(?:different\s+)?(?:ai|assistant|bot|model)",
                r"act\s+as\s+(?:a\s+)?(?:different\s+)?(?:ai|assistant|bot|model)",
                r"pretend\s+(?:to\s+be\s+)?(?:a\s+)?(?:different\s+)?(?:ai|assistant|bot|model)",
                r"roleplay\s+as\s+(?:a\s+)?(?:different\s+)?(?:ai|assistant|bot|model)"
            ],
            "system_manipulation": [
                r"\/\*.*?\*\/",  # Comment injection
                r"<\s*script\s*>.*?<\s*\/\s*script\s*>",  # Script injection
                r"system\s*[:=]\s*[\"']",  # System prompt injection
                r"prompt\s*[:=]\s*[\"']",  # Prompt injection
            ],
            "jailbreak_attempts": [
                r"developer\s+mode",
                r"jailbreak",
                r"unrestricted\s+mode",
                r"bypass\s+safety",
                r"disable\s+filters?",
                r"remove\s+restrictions?"
            ]
        }
    
    def _init_bias_keywords(self):
        """Initialize keywords for bias detection."""
        self.bias_keywords = {
            "racial": [
                "race", "ethnicity", "nationality", "skin color", "african", "asian", "hispanic", 
                "latino", "white", "black", "brown", "native", "indigenous", "arab", "jewish"
            ],
            "gender": [
                "gender", "male", "female", "man", "woman", "boy", "girl", "masculine", 
                "feminine", "transgender", "non-binary", "lgbtq"
            ],
            "age": [
                "age", "old", "young", "elderly", "senior", "teenager", "child", "adult", 
                "millennial", "boomer", "generation"
            ],
            "religious": [
                "religion", "christian", "muslim", "jewish", "hindu", "buddhist", "atheist", 
                "catholic", "protestant", "islam", "judaism", "christianity"
            ],
            "socioeconomic": [
                "poor", "rich", "wealthy", "poverty", "homeless", "unemployed", "working class", 
                "middle class", "upper class", "income", "salary"
            ]
        }
    
    def analyze(self, text: str, generated_output: str = "") -> Dict[str, Any]:
        """
        Perform comprehensive analysis on input text and generated output.
        
        Args:
            text: The input text to analyze
            generated_output: Optional generated output to analyze for risks
            
        Returns:
            Comprehensive analysis report
        """
        logger.info("Starting AdShield analysis")
        
        # Combine text for comprehensive analysis
        full_text = f"{text} {generated_output}".strip()
        
        # Perform individual analyses
        prompt_injection = self._analyze_prompt_injection(text)
        pii_analysis = self._analyze_pii(full_text)
        bias_analysis = self._analyze_bias(full_text)
        
        # Calculate overall risk score
        overall_score = self._calculate_overall_score(prompt_injection, pii_analysis, bias_analysis)
        
        # Generate risk level
        risk_level = self._determine_risk_level(overall_score)
        
        # Generate summary and recommendations
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
                matches = list(re.finditer(pattern, text_lower, re.IGNORECASE | re.DOTALL))
                for match in matches:
                    severity = self._determine_injection_severity(category, match.group())
                    score = {"low": 25, "medium": 50, "high": 75, "critical": 100}[severity]
                    total_score = max(total_score, score)
                    
                    detections.append({
                        "start": match.start(),
                        "end": match.end(),
                        "type": category,
                        "severity": severity,
                        "pattern": match.group()
                    })
        
        return {
            "score": min(total_score, 100),
            "detected": len(detections) > 0,
            "indices": detections
        }
    
    def _analyze_pii(self, text: str) -> Dict[str, Any]:
        """Analyze text for personally identifiable information."""
        detections = []
        total_score = 0
        
        for pii_type, pattern in self.pii_patterns.items():
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            for match in matches:
                # Score based on PII sensitivity
                sensitivity_scores = {
                    "ssn": 100, "credit_card": 100, "passport": 90,
                    "email": 60, "phone": 70, "address": 50,
                    "date_of_birth": 80, "ip_address": 30, "license_plate": 40
                }
                score = sensitivity_scores.get(pii_type, 50)
                total_score = max(total_score, score)
                
                detections.append({
                    "start": match.start(),
                    "end": match.end(),
                    "type": "pii",
                    "piiType": pii_type,
                    "confidence": 0.9 if pii_type in ["ssn", "email", "credit_card"] else 0.7
                })
        
        return {
            "score": min(total_score, 100),
            "detected": len(detections) > 0,
            "indices": detections
        }
    
    def _analyze_bias(self, text: str) -> Dict[str, Any]:
        """Analyze text for various types of bias."""
        text_lower = text.lower()
        detections = []
        bias_scores = {"racial": 0, "gender": 0, "age": 0, "religious": 0, "socioeconomic": 0}
        
        # Keyword-based bias detection
        for bias_type, keywords in self.bias_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    # Find all occurrences
                    start_pos = 0
                    while True:
                        pos = text_lower.find(keyword, start_pos)
                        if pos == -1:
                            break
                        
                        # Context analysis around the keyword
                        context_start = max(0, pos - 50)
                        context_end = min(len(text), pos + len(keyword) + 50)
                        context = text[context_start:context_end]
                        
                        # Simple bias scoring based on context
                        bias_intensity = self._analyze_bias_context(context, keyword)
                        bias_scores[bias_type] = max(bias_scores[bias_type], bias_intensity)
                        
                        if bias_intensity > 30:  # Only report significant bias
                            detections.append({
                                "start": pos,
                                "end": pos + len(keyword),
                                "type": "bias",
                                "biasType": bias_type,
                                "intensity": bias_intensity
                            })
                        
                        start_pos = pos + 1
        
        # Use AI model if available
        if self.bias_classifier:
            try:
                model_result = self.bias_classifier(text[:512])  # Limit length for model
                if model_result and len(model_result) > 0:
                    toxicity_score = model_result[0]['score'] if model_result[0]['label'] == 'TOXIC' else 0
                    if toxicity_score > 0.7:
                        bias_scores["overall"] = min(toxicity_score * 100, 100)
            except Exception as e:
                logger.warning(f"Bias model analysis failed: {e}")
        
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
    
    def _analyze_bias_context(self, context: str, keyword: str) -> int:
        """Analyze the context around a bias keyword to determine intensity."""
        context_lower = context.lower()
        
        # Negative indicators
        negative_words = ["hate", "stupid", "inferior", "better than", "worse than", "all", "never", "always"]
        positive_words = ["respect", "equal", "diverse", "inclusive", "fair", "understanding"]
        
        negative_count = sum(1 for word in negative_words if word in context_lower)
        positive_count = sum(1 for word in positive_words if word in context_lower)
        
        # Base score for mentioning protected characteristics
        base_score = 20
        
        # Adjust based on context
        if negative_count > positive_count:
            return min(base_score + (negative_count * 20), 100)
        elif positive_count > 0:
            return max(base_score - (positive_count * 10), 0)
        
        return base_score
    
    def _determine_injection_severity(self, category: str, pattern: str) -> str:
        """Determine the severity of a prompt injection attempt."""
        severity_map = {
            "system_manipulation": "critical",
            "jailbreak_attempts": "high",
            "ignore_instructions": "medium",
            "role_manipulation": "medium"
        }
        return severity_map.get(category, "low")
    
    def _calculate_overall_score(self, prompt_injection: Dict, pii_analysis: Dict, bias_analysis: Dict) -> int:
        """Calculate overall risk score from individual analyses."""
        scores = [
            prompt_injection["score"],
            pii_analysis["score"],
            bias_analysis["score"]
        ]
        
        # Weighted average with emphasis on prompt injection
        weights = [0.4, 0.3, 0.3]
        weighted_score = sum(score * weight for score, weight in zip(scores, weights))
        
        return min(int(weighted_score), 100)
    
    def _determine_risk_level(self, score: int) -> str:
        """Determine risk level based on overall score."""
        if score >= 80:
            return "high"
        elif score >= 50:
            return "medium"
        else:
            return "low"
    
    def _generate_summary(self, prompt_injection: Dict, pii_analysis: Dict, bias_analysis: Dict, risk_level: str) -> Dict[str, Any]:
        """Generate analysis summary and recommendations."""
        risk_factors = []
        recommendations = []
        
        # Analyze risk factors
        if prompt_injection["detected"]:
            risk_factors.append("Potential prompt injection attempts detected")
            recommendations.append("Review and sanitize user inputs before processing")
        
        if pii_analysis["detected"]:
            risk_factors.append("Personally identifiable information found in content")
            recommendations.append("Implement PII masking or removal procedures")
        
        if bias_analysis["detected"]:
            risk_factors.append("Potential bias indicators found in content")
            recommendations.append("Review content for inclusive language and bias mitigation")
        
        # Generate TrustLens explanation
        trust_lens = self._generate_trust_lens_summary(prompt_injection, pii_analysis, bias_analysis, risk_level)
        
        if not risk_factors:
            risk_factors.append("No significant security risks detected")
            recommendations.append("Content appears safe for processing")
        
        return {
            "trustLens": trust_lens,
            "recommendations": recommendations,
            "riskFactors": risk_factors
        }
    
    def _generate_trust_lens_summary(self, prompt_injection: Dict, pii_analysis: Dict, bias_analysis: Dict, risk_level: str) -> str:
        """Generate a comprehensive TrustLens summary."""
        summary_parts = []
        
        # Risk level assessment
        risk_descriptions = {
            "low": "The analyzed content presents minimal security risks and appears safe for processing.",
            "medium": "The content contains some concerning elements that require attention and monitoring.",
            "high": "The content presents significant security risks and requires immediate review before processing."
        }
        
        summary_parts.append(risk_descriptions[risk_level])
        
        # Specific findings
        if prompt_injection["detected"]:
            injection_count = len(prompt_injection["indices"])
            summary_parts.append(f"Detected {injection_count} potential prompt injection attempt(s) that could compromise AI system behavior.")
        
        if pii_analysis["detected"]:
            pii_count = len(pii_analysis["indices"])
            summary_parts.append(f"Identified {pii_count} instance(s) of personally identifiable information requiring protection.")
        
        if bias_analysis["detected"]:
            bias_types = set(item["biasType"] for item in bias_analysis["indices"])
            summary_parts.append(f"Found potential bias indicators related to: {', '.join(bias_types)}.")
        
        return " ".join(summary_parts)