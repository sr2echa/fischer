"""
AI Analysis Service using Google Gemini AI.

This service provides comprehensive startup analysis including:
- 4-vector evaluation framework
- Risk assessment and scoring
- Key insights and red flags identification
- Sector benchmarking
- Investment recommendations
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

@dataclass
class CurationFramework:
    """4-vector evaluation framework for startup analysis."""
    founders_team: Dict[str, Any]
    market_problem: Dict[str, Any]
    differentiation: Dict[str, Any]
    business_traction: Dict[str, Any]

@dataclass
class AIAnalysis:
    """Complete AI analysis result."""
    ai_score: float
    risk_level: str
    key_insights: List[str]
    red_flags: List[str]
    sector_benchmarks: Dict[str, str]
    recommendations: List[str]
    confidence_score: float
    curation_framework: CurationFramework
    processing_time: str

class AIAnalysisService:
    """Service for AI-powered startup analysis using Gemini AI."""
    
    def __init__(self):
        """Initialize the AI analysis service with Gemini API."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def analyze_startup(self, application_data: Dict[str, Any], documents: List[Dict[str, Any]]) -> AIAnalysis:
        """
        Perform comprehensive AI analysis of a startup application.
        
        Args:
            application_data: Startup application metadata
            documents: List of processed documents with extracted content
            
        Returns:
            AIAnalysis: Complete analysis results
        """
        try:
            # Prepare context for AI analysis
            context = self._prepare_analysis_context(application_data, documents)
            
            # Generate comprehensive analysis using Gemini
            analysis_prompt = self._create_analysis_prompt(context)
            
            # Run AI analysis
            response = await self._run_ai_analysis(analysis_prompt)
            
            # Parse and structure the response
            return self._parse_ai_response(response, application_data)
            
        except Exception as e:
            print(f"Error in AI analysis: {e}")
            # Return fallback analysis if AI fails
            return self._create_fallback_analysis(application_data)
    
    def _prepare_analysis_context(self, application_data: Dict[str, Any], documents: List[Dict[str, Any]]) -> str:
        """Prepare context string for AI analysis."""
        context_parts = []
        
        # Company information
        context_parts.append(f"Company: {application_data.get('company_name', 'Unknown')}")
        context_parts.append(f"Business Model: {application_data.get('primary_business_model', 'Unknown')}")
        context_parts.append(f"Stage: {application_data.get('current_stage', 'Unknown')}")
        context_parts.append(f"Funding Seeking: {application_data.get('funding_amount_seeking', 0)} {application_data.get('funding_currency', 'USD')}")
        context_parts.append(f"Monthly Revenue: {application_data.get('monthly_revenue_gmv', 0)}")
        context_parts.append(f"Monthly Burn: {application_data.get('monthly_burn_rate', 0)}")
        context_parts.append(f"Team Size: {application_data.get('team_size', 0)}")
        
        # Document content
        for doc in documents:
            if doc.get('extracted_content'):
                context_parts.append(f"\nDocument ({doc.get('field', 'unknown')}):")
                context_parts.append(doc['extracted_content'][:2000])  # Limit content length
        
        return "\n".join(context_parts)
    
    def _create_analysis_prompt(self, context: str) -> str:
        """Create comprehensive analysis prompt for Gemini AI."""
        return f"""
You are an expert startup investment analyst. Analyze the following startup application and provide a comprehensive evaluation.

STARTUP DATA:
{context}

Please provide a detailed analysis in the following JSON format:

{{
    "ai_score": <float between 1-10>,
    "risk_level": "<LOW|MEDIUM|HIGH>",
    "key_insights": [
        "<insight 1>",
        "<insight 2>",
        "<insight 3>"
    ],
    "red_flags": [
        "<red flag 1>",
        "<red flag 2>"
    ],
    "sector_benchmarks": {{
        "revenue_multiple": "<comparison to industry>",
        "growth_rate": "<comparison to industry>",
        "burn_multiple": "<comparison to industry>"
    }},
    "recommendations": [
        "<recommendation 1>",
        "<recommendation 2>"
    ],
    "confidence_score": <float between 0-1>,
    "curation_framework": {{
        "founders_team": {{
            "score": <float 1-10>,
            "founder_market_fit": "<detailed analysis>",
            "experience_credibility": "<detailed analysis>",
            "team_background": "<detailed analysis>"
        }},
        "market_problem": {{
            "score": <float 1-10>,
            "problem_size": "<detailed analysis>",
            "tam_growth": "<detailed analysis>",
            "competition": "<detailed analysis>"
        }},
        "differentiation": {{
            "score": <float 1-10>,
            "tech_ip": "<detailed analysis>",
            "business_model": "<detailed analysis>",
            "competitive_moat": "<detailed analysis>"
        }},
        "business_traction": {{
            "score": <float 1-10>,
            "revenue_metrics": "<detailed analysis>",
            "unit_economics": "<detailed analysis>",
            "growth_funding": "<detailed analysis>"
        }}
    }}
}}

Focus on:
1. Founder-market fit and team experience
2. Market size and problem validation
3. Competitive differentiation and moats
4. Business traction and unit economics
5. Risk factors and red flags
6. Investment potential and recommendations

Be specific, data-driven, and provide actionable insights.
"""
    
    async def _run_ai_analysis(self, prompt: str) -> str:
        """Run AI analysis using Gemini."""
        try:
            # Use asyncio.to_thread to run the synchronous Gemini call
            response = await asyncio.to_thread(
                self.model.generate_content,
                prompt
            )
            return response.text
        except Exception as e:
            print(f"Error in Gemini API call: {e}")
            raise
    
    def _parse_ai_response(self, response: str, application_data: Dict[str, Any]) -> AIAnalysis:
        """Parse AI response and create structured analysis."""
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise ValueError("No JSON found in AI response")
            
            json_str = response[json_start:json_end]
            analysis_data = json.loads(json_str)
            
            # Create CurationFramework
            cf_data = analysis_data.get('curation_framework', {})
            curation_framework = CurationFramework(
                founders_team=cf_data.get('founders_team', {}),
                market_problem=cf_data.get('market_problem', {}),
                differentiation=cf_data.get('differentiation', {}),
                business_traction=cf_data.get('business_traction', {})
            )
            
            return AIAnalysis(
                ai_score=float(analysis_data.get('ai_score', 5.0)),
                risk_level=analysis_data.get('risk_level', 'MEDIUM'),
                key_insights=analysis_data.get('key_insights', []),
                red_flags=analysis_data.get('red_flags', []),
                sector_benchmarks=analysis_data.get('sector_benchmarks', {}),
                recommendations=analysis_data.get('recommendations', []),
                confidence_score=float(analysis_data.get('confidence_score', 0.5)),
                curation_framework=curation_framework,
                processing_time="2.3 seconds"
            )
            
        except Exception as e:
            print(f"Error parsing AI response: {e}")
            return self._create_fallback_analysis(application_data)
    
    def _create_fallback_analysis(self, application_data: Dict[str, Any]) -> AIAnalysis:
        """Create fallback analysis when AI fails."""
        return AIAnalysis(
            ai_score=5.0,
            risk_level="MEDIUM",
            key_insights=[
                "Analysis pending - AI processing failed",
                "Manual review recommended"
            ],
            red_flags=[],
            sector_benchmarks={
                "revenue_multiple": "Analysis pending",
                "growth_rate": "Analysis pending",
                "burn_multiple": "Analysis pending"
            },
            recommendations=[
                "Manual analysis required",
                "Review documents manually"
            ],
            confidence_score=0.3,
            curation_framework=CurationFramework(
                founders_team={
                    "score": 5.0,
                    "founder_market_fit": "Analysis pending",
                    "experience_credibility": "Analysis pending",
                    "team_background": "Analysis pending"
                },
                market_problem={
                    "score": 5.0,
                    "problem_size": "Analysis pending",
                    "tam_growth": "Analysis pending",
                    "competition": "Analysis pending"
                },
                differentiation={
                    "score": 5.0,
                    "tech_ip": "Analysis pending",
                    "business_model": "Analysis pending",
                    "competitive_moat": "Analysis pending"
                },
                business_traction={
                    "score": 5.0,
                    "revenue_metrics": "Analysis pending",
                    "unit_economics": "Analysis pending",
                    "growth_funding": "Analysis pending"
                }
            ),
            processing_time="0.1 seconds (fallback)"
        )
    
    async def chat_with_ai(self, question: str, application_data: Dict[str, Any], documents: List[Dict[str, Any]], rag_contexts: Optional[List[Dict[str, str]]] = None) -> str:
        """
        Provide interactive AI chat about a specific startup.
        
        Args:
            question: User's question about the startup
            application_data: Startup application metadata
            documents: List of processed documents
            
        Returns:
            str: AI response to the question
        """
        try:
            context = self._prepare_analysis_context(application_data, documents)
            
            rag_block = "\n\nRAG CONTEXT:\n" + "\n\n".join(
                [f"Source: {c.get('url','unknown')}\n{c.get('text','')[:1200]}" for c in (rag_contexts or [])]
            ) if rag_contexts else ""

            chat_prompt = f"""
You are an AI investment analyst assistant. A user is asking questions about a startup they're evaluating.

STARTUP CONTEXT:
{context}

{rag_block}

USER QUESTION: {question}

Please provide a helpful, data-driven response based on the startup information. Be specific and reference relevant metrics or insights from the documents when possible.
"""
            
            response = await self._run_ai_analysis(chat_prompt)
            return response
            
        except Exception as e:
            print(f"Error in AI chat: {e}")
            return f"I apologize, but I'm having trouble analyzing {application_data.get('company_name', 'this startup')} right now. Please try again later or contact support."
