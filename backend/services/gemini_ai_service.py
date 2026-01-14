"""
Gemini AI Service - Advanced AI-powered content moderation and insights
Uses Google's Gemini AI for sophisticated content analysis and insights
"""

import os
import logging
import json
import google.generativeai as genai
from typing import Dict, List, Optional
from datetime import datetime, timezone
import database as db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class GeminiAIService:
    """Advanced AI service using Gemini for content analysis and insights"""
    
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model = None
        
        if self.api_key:
            try:
                # Try to initialize the model
                available_models = []
                try:
                    for model in genai.list_models():
                        if 'generateContent' in model.supported_generation_methods:
                            available_models.append(model.name)
                except Exception:
                    # If list_models fails, use a default model
                    available_models = ["models/gemini-1.5-flash", "models/gemini-1.5-pro-latest", "models/gemini-1.0-pro"]
                
                # Use the best available model
                model_name = "models/gemini-1.5-flash-latest"  # Default to latest
                if available_models:
                    # Look for newer model names first
                    for candidate in ["models/gemini-1.5-flash-latest", "models/gemini-1.5-flash", "models/gemini-1.5-pro-latest", "models/gemini-1.5-pro", "models/gemini-1.0-pro"]:
                        if candidate in available_models:
                            model_name = candidate
                            break
                
                # If no model is found, use a simple fallback
                if model_name not in available_models and available_models:
                    model_name = available_models[0]
                
                self.model = genai.GenerativeModel(model_name)
                logger.info(f"✅ Gemini AI initialized with model: {model_name}")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Gemini model: {e}")
                self.model = None
        else:
            logger.warning("⚠️ GEMINI_API_KEY not found - AI features will use fallback methods")

    def is_available(self) -> bool:
        """Check if Gemini AI is available"""
        return self.model is not None and bool(self.api_key)

    def analyze_content_for_moderation(self, content: str, title: str = "", author_role: str = "student") -> Dict:
        """
        Analyze content using Gemini AI for moderation
        
        Args:
            content: Content to analyze
            title: Title of the content (optional)
            author_role: Role of the author (student, teacher, admin)
        
        Returns:
            Analysis result with risk assessment
        """
        if not self.is_available():
            return self._fallback_moderation_analysis(content, title, author_role)
        
        try:
            prompt = f"""
            You are an expert content moderator for a university campus platform. 
            Analyze this content for potential violations of community guidelines.
            
            AUTHOR ROLE: {author_role}
            TITLE: {title}
            CONTENT: {content}
            
            ANALYSIS CATEGORIES:
            1. HARASSMENT - Personal attacks, offensive language, threats
            2. HATE SPEECH - Discriminatory language based on identity
            3. SELF_HARM - Mental health concerns, suicidal thoughts
            4. BULLYING - Targeting individuals, exclusion tactics
            5. MISINFORMATION - False claims that could spread
            6. POLICY VIOLATION - Financial scams, impersonation
            7. ACADEMIC VIOLATION - Cheating, plagiarism
            
            RESPONSE FORMAT (JSON only):
            {{
                "is_flagged": true/false,
                "risk_category": "harassment|hate_speech|self_harm|bullying|misinformation|policy_violation|academic_violation|none",
                "risk_severity": "critical|high|medium|low",
                "confidence_score": 0.0-1.0,
                "reasoning": "Detailed explanation of why flagged",
                "suggested_action": "warn|review|remove|approve",
                "keywords_identified": ["keyword1", "keyword2"],
                "sentiment_analysis": {{"score": -1.0 to 1.0, "category": "very_negative|negative|neutral|positive|very_positive"}}
            }}
            
            Be thorough but fair. Consider the university context and student well-being.
            """
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean response if it contains markdown
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
                result_text = result_text.strip()
            
            result = json.loads(result_text)
            return result
            
        except Exception as e:
            logger.error(f"Gemini moderation analysis failed: {e}")
            return self._fallback_moderation_analysis(content, title, author_role)

    def _fallback_moderation_analysis(self, content: str, title: str, author_role: str) -> Dict:
        """Fallback moderation analysis when Gemini is not available"""
        from services.ai_moderation_service import AIContentModerationService
        analysis = AIContentModerationService.analyze_content(content, title, author_role)
        
        # Convert to Gemini-compatible format
        return {
            "is_flagged": analysis["is_flagged"],
            "risk_category": analysis["risk_category"],
            "risk_severity": analysis["risk_severity"],
            "confidence_score": analysis["confidence_score"],
            "reasoning": analysis["reasoning"],
            "suggested_action": "review" if analysis["is_flagged"] else "approve",
            "keywords_identified": analysis["keywords_found"],
            "sentiment_analysis": {"score": -0.3, "category": "negative"}
        }

    def generate_insights_from_issues_and_moments(self, issues: List[Dict], moments: List[Dict]) -> List[Dict]:
        """
        Generate AI insights by analyzing issues and moments using Gemini AI
        
        Args:
            issues: List of issues to analyze
            moments: List of moments to analyze
        
        Returns:
            List of aggregated insights/clusters
        """
        if not self.is_available():
            return self._fallback_insights_analysis(issues, moments)
        
        try:
            # Prepare data for analysis
            issues_text = []
            for issue in issues:
                issues_text.append({
                    "title": issue.get("title", ""),
                    "description": issue.get("description", ""),
                    "category": issue.get("category", ""),
                    "location": issue.get("location", ""),
                    "status": issue.get("status", ""),
                    "created_at": issue.get("created_at", ""),
                    "affected_count": issue.get("affected_count", 1)
                })
            
            moments_text = []
            for moment in moments:
                if moment.get("status") == "approved":
                    moments_text.append({
                        "title": moment.get("title", ""),
                        "content": moment.get("content", ""),
                        "type": moment.get("moment_type", ""),
                        "created_at": moment.get("created_at", "")
                    })
            
            prompt = f"""
            You are an AI analyst for a university campus platform. 
            Analyze these reported issues and community moments to identify patterns and insights.
            
            ISSUES DATA: {json.dumps(issues_text[:50], indent=2)[:3000]}  # Limit to first 50 and 3000 chars
            MOMENTS DATA: {json.dumps(moments_text[:50], indent=2)[:2000]}  # Limit to first 50 and 2000 chars
            
            ANALYSIS REQUIREMENTS:
            1. Cluster similar issues and moments together
            2. Identify common themes and categories
            3. Assess severity and urgency
            4. Identify locations and departments most affected
            5. Detect trending issues (getting worse) vs resolving issues
            6. Calculate sentiment of the community around these topics
            7. Suggest priority areas for administrative attention
            
            RESPONSE FORMAT (JSON only):
            {{
                "insights_summary": {{
                    "total_clusters": number,
                    "critical_issues_count": number,
                    "trending_issues_count": number,
                    "total_affected_students": number,
                    "top_categories": ["category1", "category2"],
                    "most_affected_locations": ["location1", "location2"]
                }},
                "clusters": [
                    {{
                        "id": "unique_cluster_id",
                        "title": "Descriptive cluster title",
                        "ai_summary": "Detailed AI-generated summary of the cluster",
                        "category": "Main category of the cluster",
                        "severity": "critical|high|medium|low",
                        "total_affected": number,
                        "related_count": number,
                        "sentiment": {{"score": -1.0 to 1.0, "category": "negative|neutral|positive"}},
                        "locations": ["location1", "location2"],
                        "trend": "increasing|decreasing|stable",
                        "status": "reported|acknowledged|in_progress|resolved",
                        "first_reported": "ISO datetime",
                        "last_activity": "ISO datetime",
                        "related_items": [
                            {{
                                "id": "item_id",
                                "title": "Original title",
                                "type": "issue|moment",
                                "source": "original data source",
                                "affected": number
                            }}
                        ]
                    }}
                ],
                "recommendations": [
                    "Priority recommendation 1",
                    "Priority recommendation 2"
                ]
            }}
            
            Focus on actionable insights that administrators can use to improve campus life.
            """
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean response if it contains markdown
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
                result_text = result_text.strip()
            
            result = json.loads(result_text)
            return result.get("clusters", [])
            
        except Exception as e:
            logger.error(f"Gemini insights analysis failed: {e}")
            return self._fallback_insights_analysis(issues, moments)

    def _fallback_insights_analysis(self, issues: List[Dict], moments: List[Dict]) -> List[Dict]:
        """Fallback insights analysis when Gemini is not available"""
        from services.ai_clustering_service import AIClusteringService
        
        # Combine issues and approved moments
        formatted_items = []
        
        for issue in issues:
            formatted_items.append({
                'issue_id': issue.get('issue_id', f"iss_{hash(issue.get('title', ''))}"),
                'title': issue.get('title', ''),
                'description': issue.get('description', ''),
                'category': issue.get('category', 'general'),
                'location': issue.get('location', ''),
                'status': issue.get('status', 'reported'),
                'affected_count': issue.get('affected_count', 1),
                'created_at': issue.get('created_at', datetime.now(timezone.utc).isoformat()),
                'updated_at': issue.get('updated_at', issue.get('created_at', datetime.now(timezone.utc).isoformat())),
            })
        
        for moment in moments:
            if moment.get('status') == 'approved':
                formatted_items.append({
                    'issue_id': moment.get('moment_id', f"mom_{hash(moment.get('title', ''))}"),
                    'title': moment.get('title', ''),
                    'description': moment.get('content', ''),
                    'category': moment.get('moment_type', 'general'),
                    'location': '',  # Moments don't have specific locations
                    'status': moment.get('status', 'reported'),
                    'affected_count': 0,  # We can calculate this based on reactions/comments
                    'created_at': moment.get('created_at', datetime.now(timezone.utc).isoformat()),
                    'updated_at': moment.get('updated_at', moment.get('created_at', datetime.now(timezone.utc).isoformat())),
                })
        
        # Use the existing clustering service
        clusters = AIClusteringService.cluster_issues_from_list(formatted_items)
        return clusters

    def analyze_user_behavior_patterns(self, user_id: str) -> Dict:
        """
        Analyze user behavior patterns for potential moderation flags
        
        Args:
            user_id: ID of the user to analyze
        
        Returns:
            Behavior analysis results
        """
        if not self.is_available():
            return self._fallback_user_behavior_analysis(user_id)
        
        try:
            # Get user's content history
            user_moments = db.get_moments_by_user(user_id)
            user_issues = db.get_issues_by_user(user_id)
            
            prompt = f"""
            Analyze this user's behavior patterns on the campus platform.
            
            USER MOMENTS: {json.dumps(user_moments[-10:], indent=2)[:1500]}  # Last 10 moments
            USER ISSUES: {json.dumps(user_issues[-10:], indent=2)[:1500]}    # Last 10 issues
            
            ANALYSIS FOCUS:
            1. Content tone and sentiment patterns
            2. Frequency of posts (normal vs spammy)
            3. Topics commonly discussed
            4. Engagement patterns (likes, comments)
            5. Potential red flags (aggressive, repetitive, concerning content)
            6. Overall contribution quality
            
            RESPONSE FORMAT (JSON only):
            {{
                "behavior_summary": "Overall assessment of user behavior",
                "risk_level": "low|medium|high|critical",
                "patterns_identified": ["pattern1", "pattern2"],
                "red_flags": ["flag1", "flag2"],
                "positive_signals": ["signal1", "signal2"],
                "recommendations": ["recommendation1", "recommendation2"],
                "monitoring_needed": true/false,
                "confidence_score": 0.0-1.0
            }}
            """
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean response if it contains markdown
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
                result_text = result_text.strip()
            
            return json.loads(result_text)
            
        except Exception as e:
            logger.error(f"Gemini user behavior analysis failed: {e}")
            return self._fallback_user_behavior_analysis(user_id)

    def _fallback_user_behavior_analysis(self, user_id: str) -> Dict:
        """Fallback user behavior analysis when Gemini is not available"""
        return {
            "behavior_summary": "Behavior analysis unavailable",
            "risk_level": "low",
            "patterns_identified": [],
            "red_flags": [],
            "positive_signals": [],
            "recommendations": ["Manual review recommended"],
            "monitoring_needed": False,
            "confidence_score": 0.0
        }


# Singleton instance
gemini_service = GeminiAIService()


def get_gemini_service() -> GeminiAIService:
    """Get the singleton Gemini AI service instance"""
    return gemini_service


def moderate_content_with_gemini(content: str, title: str = "", author_role: str = "student") -> Dict:
    """Convenience function to moderate content using Gemini AI"""
    return gemini_service.analyze_content_for_moderation(content, title, author_role)


def generate_insights_with_gemini(issues: List[Dict], moments: List[Dict]) -> List[Dict]:
    """Convenience function to generate insights using Gemini AI"""
    return gemini_service.generate_insights_from_issues_and_moments(issues, moments)


def analyze_user_behavior_with_gemini(user_id: str) -> Dict:
    """Convenience function to analyze user behavior using Gemini AI"""
    return gemini_service.analyze_user_behavior_patterns(user_id)