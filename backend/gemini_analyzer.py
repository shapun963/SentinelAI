"""
Gemini AI Integration for Enhanced Analysis
Provides intelligent explanations and contextual analysis using Google's Gemini API
"""

import json
import logging
from typing import Dict, Any, Optional
import google.generativeai as genai

logger = logging.getLogger(__name__)


def analyze_with_gemini(adshield_report: Dict[str, Any], original_text: str, model) -> str:
    """
    Analyze AdShield report using Gemini AI for enhanced explanations and insights.
    
    Args:
        adshield_report: The complete AdShield analysis report
        original_text: The original text that was analyzed
        model: Configured Gemini model instance
        
    Returns:
        JSON string with enhanced analysis and explanations
    """
    try:
        # Construct the prompt for Gemini analysis
        prompt = _build_gemini_prompt(adshield_report, original_text)
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        
        # Parse and validate the response
        return _process_gemini_response(response.text)
        
    except Exception as e:
        logger.error(f"Gemini analysis failed: {e}")
        return _fallback_analysis(adshield_report)


def _build_gemini_prompt(report: Dict[str, Any], original_text: str) -> str:
    """Build a comprehensive prompt for Gemini analysis."""
    
    # Extract key metrics from AdShield report
    prompt_injection_score = report.get("promptInjection", {}).get("score", 0)
    pii_score = report.get("pii", {}).get("score", 0)
    bias_score = report.get("bias", {}).get("score", 0)
    overall_score = report.get("overall", {}).get("score", 0)
    risk_level = report.get("overall", {}).get("riskLevel", "unknown")
    
    # Build detections summary
    detections_summary = _summarize_detections(report)
    
    prompt = f"""
You are TrustLens, an AI security expert specializing in content analysis and risk assessment. 

Analyze the following AdShield security report and provide enhanced insights in JSON format.

ORIGINAL TEXT: "{original_text[:500]}{'...' if len(original_text) > 500 else ''}"

ADSHIELD ANALYSIS RESULTS:
- Overall Risk Score: {overall_score}/100 ({risk_level} risk)
- Prompt Injection Score: {prompt_injection_score}/100
- PII Detection Score: {pii_score}/100
- Bias Analysis Score: {bias_score}/100

DETECTIONS SUMMARY:
{detections_summary}

Please provide a JSON response with the following structure:
{{
  "enhancedAnalysis": {{
    "riskAssessment": "Detailed risk assessment with specific concerns",
    "contextualInsights": "Why these findings matter in practical terms",
    "securityImplications": "What could happen if these issues aren't addressed",
    "mitigationStrategies": ["Specific actionable steps to address identified risks"]
  }},
  "technicalDetails": {{
    "promptInjectionAnalysis": "Detailed explanation of any prompt injection attempts",
    "piiAnalysis": "Analysis of privacy risks and data exposure",
    "biasAnalysis": "Assessment of bias patterns and fairness concerns"
  }},
  "recommendations": {{
    "immediate": ["Urgent actions needed right now"],
    "shortTerm": ["Actions to take within 24-48 hours"],
    "longTerm": ["Strategic improvements for ongoing security"]
  }},
  "confidence": {{
    "overall": 0.85,
    "reasoning": "Explanation of confidence level and any uncertainties"
  }}
}}

Focus on practical, actionable insights. Be specific about risks and clear about recommended actions.
"""
    
    return prompt


def _summarize_detections(report: Dict[str, Any]) -> str:
    """Create a human-readable summary of all detections."""
    summary_parts = []
    
    # Prompt injection detections
    injection_data = report.get("promptInjection", {})
    if injection_data.get("detected", False):
        injection_count = len(injection_data.get("indices", []))
        injection_types = set(item.get("type", "unknown") for item in injection_data.get("indices", []))
        summary_parts.append(f"- {injection_count} prompt injection attempt(s) detected: {', '.join(injection_types)}")
    
    # PII detections
    pii_data = report.get("pii", {})
    if pii_data.get("detected", False):
        pii_count = len(pii_data.get("indices", []))
        pii_types = set(item.get("piiType", "unknown") for item in pii_data.get("indices", []))
        summary_parts.append(f"- {pii_count} PII instance(s) found: {', '.join(pii_types)}")
    
    # Bias detections
    bias_data = report.get("bias", {})
    if bias_data.get("detected", False):
        bias_count = len(bias_data.get("indices", []))
        bias_types = set(item.get("biasType", "unknown") for item in bias_data.get("indices", []))
        summary_parts.append(f"- {bias_count} bias indicator(s) detected: {', '.join(bias_types)}")
    
    if not summary_parts:
        summary_parts.append("- No significant security issues detected")
    
    return "\n".join(summary_parts)


def _process_gemini_response(response_text: str) -> str:
    """Process and validate Gemini's response."""
    try:
        # Clean up the response (remove any markdown formatting)
        cleaned_response = response_text.strip()
        if cleaned_response.startswith("```json"):
            cleaned_response = cleaned_response[7:]
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3]
        cleaned_response = cleaned_response.strip()
        
        # Validate JSON structure
        parsed_json = json.loads(cleaned_response)
        
        # Ensure required fields exist
        required_fields = ["enhancedAnalysis", "technicalDetails", "recommendations", "confidence"]
        for field in required_fields:
            if field not in parsed_json:
                logger.warning(f"Missing required field in Gemini response: {field}")
                parsed_json[field] = _get_default_field_value(field)
        
        return json.dumps(parsed_json, indent=2)
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini JSON response: {e}")
        return _fallback_analysis({})
    except Exception as e:
        logger.error(f"Error processing Gemini response: {e}")
        return _fallback_analysis({})


def _get_default_field_value(field: str) -> Dict[str, Any]:
    """Get default values for missing fields."""
    defaults = {
        "enhancedAnalysis": {
            "riskAssessment": "Unable to generate detailed risk assessment",
            "contextualInsights": "Analysis incomplete due to processing error",
            "securityImplications": "Please review findings manually",
            "mitigationStrategies": ["Conduct manual security review"]
        },
        "technicalDetails": {
            "promptInjectionAnalysis": "Analysis unavailable",
            "piiAnalysis": "Analysis unavailable", 
            "biasAnalysis": "Analysis unavailable"
        },
        "recommendations": {
            "immediate": ["Review content manually"],
            "shortTerm": ["Implement additional security measures"],
            "longTerm": ["Establish comprehensive content review process"]
        },
        "confidence": {
            "overall": 0.5,
            "reasoning": "Analysis incomplete due to processing limitations"
        }
    }
    return defaults.get(field, {})


def _fallback_analysis(adshield_report: Dict[str, Any]) -> str:
    """Provide fallback analysis when Gemini is unavailable."""
    logger.info("Using fallback analysis due to Gemini unavailability")
    
    overall_score = adshield_report.get("overall", {}).get("score", 0)
    risk_level = adshield_report.get("overall", {}).get("riskLevel", "unknown")
    
    fallback_response = {
        "enhancedAnalysis": {
            "riskAssessment": f"Content assessed with {overall_score}/100 risk score ({risk_level} risk level). AdShield analysis completed successfully.",
            "contextualInsights": "Automated analysis completed. Review specific findings for detailed security assessment.",
            "securityImplications": "Refer to AdShield findings for specific security considerations.",
            "mitigationStrategies": [
                "Review all flagged content sections",
                "Apply appropriate security measures based on findings",
                "Monitor for similar patterns in future content"
            ]
        },
        "technicalDetails": {
            "promptInjectionAnalysis": f"Prompt injection score: {adshield_report.get('promptInjection', {}).get('score', 0)}/100",
            "piiAnalysis": f"PII detection score: {adshield_report.get('pii', {}).get('score', 0)}/100",
            "biasAnalysis": f"Bias analysis score: {adshield_report.get('bias', {}).get('score', 0)}/100"
        },
        "recommendations": {
            "immediate": ["Review AdShield findings"],
            "shortTerm": ["Implement findings-based security measures"],
            "longTerm": ["Establish regular content security monitoring"]
        },
        "confidence": {
            "overall": 0.8,
            "reasoning": "High confidence in automated analysis results. Enhanced AI insights unavailable."
        }
    }
    
    return json.dumps(fallback_response, indent=2)