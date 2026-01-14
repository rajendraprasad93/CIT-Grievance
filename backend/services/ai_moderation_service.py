"""
AI Content Moderation Service

This service analyzes user-generated content (moments, comments) for inappropriate content
and automatically flags posts that violate community guidelines.
"""

import uuid
import re
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple
import database as db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

def get_gemini_moderation_result(content: str, title: str = "", author_role: str = "student") -> Optional[Dict]:
    """Get moderation result from Gemini AI if available"""
    # Since we have a circular import issue, we'll return None
    # The actual Gemini integration will be handled in the server
    return None


class AIContentModerationService:
    """Service for analyzing and flagging inappropriate content"""
    
    # Harassment and personal attack keywords
    HARASSMENT_KEYWORDS = [
        'useless', 'stupid', 'idiot', 'moron', 'dumb', 'pathetic', 'loser', 'failure',
        'worthless', 'incompetent', 'terrible', 'awful', 'worst', 'hate', 'disgusting',
        'should be fired', 'get rid of', 'kick out', 'remove', 'fire', 'sack'
    ]
    
    # Hate speech and discriminatory language
    HATE_SPEECH_KEYWORDS = [
        'don\'t belong', 'go back', 'not welcome', 'outsider', 'different state',
        'your kind', 'people like you', 'not from here', 'foreigner'
    ]
    
    # Bullying and exclusion keywords
    BULLYING_KEYWORDS = [
        'nobody likes', 'everyone hates', 'no friends', 'loner', 'weirdo', 'freak',
        'don\'t talk to', 'ignore', 'exclude', 'stay away', 'not cool', 'embarrassing'
    ]
    
    # Self-harm and mental health concern keywords
    SELF_HARM_KEYWORDS = [
        'want to die', 'kill myself', 'end it all', 'can\'t take it', 'give up',
        'no point', 'worthless life', 'better off dead', 'suicide', 'harm myself',
        'too much pressure', 'overwhelmed', 'can\'t handle', 'hopeless', 'desperate'
    ]
    
    # Misinformation and false claims
    MISINFORMATION_KEYWORDS = [
        'heard from friend', 'someone told me', 'rumor', 'leaked', 'secret',
        'inside information', 'conspiracy', 'cover up', 'they don\'t want you to know'
    ]
    
    # Policy violation keywords (financial scams, impersonation)
    POLICY_VIOLATION_KEYWORDS = [
        'pay money to', 'send cash', 'personal account', 'urgent payment',
        'mandatory fee', 'immediate payment', 'transfer funds', 'bank details'
    ]
    
    # Academic integrity violations
    ACADEMIC_VIOLATION_KEYWORDS = [
        'exam answers', 'test leak', 'cheat sheet', 'copy assignment',
        'plagiarize', 'fake certificate', 'buy degree', 'assignment help'
    ]
    
    @staticmethod
    def analyze_content(content: str, title: str = "", author_role: str = "student") -> Dict:
        """
        Analyze content for inappropriate material and return moderation result
        Uses Gemini AI when available, falls back to keyword-based analysis
        
        Returns:
        {
            "is_flagged": bool,
            "risk_category": str,
            "risk_severity": str,
            "confidence_score": float,
            "reasoning": str,
            "keywords_found": List[str]
        }
        """
        if not content and not title:
            return {
                "is_flagged": False,
                "risk_category": None,
                "risk_severity": "low",
                "confidence_score": 0.0,
                "reasoning": "No content to analyze",
                "keywords_found": []
            }
        
        # Try to use Gemini AI for analysis if available
        gemini_result = get_gemini_moderation_result(content, title, author_role)
        if gemini_result:
            return {
                "is_flagged": gemini_result.get('is_flagged', False),
                "risk_category": gemini_result.get('risk_category', 'none'),
                "risk_severity": gemini_result.get('risk_severity', 'low'),
                "confidence_score": gemini_result.get('confidence_score', 0.0),
                "reasoning": gemini_result.get('reasoning', 'Gemini AI analysis'),
                "keywords_found": gemini_result.get('keywords_identified', [])
            }
        
        # Fall back to keyword-based analysis
        # Combine title and content for analysis
        full_text = f"{title} {content}".lower().strip()
        
        # Track found keywords and calculate scores
        found_keywords = []
        category_scores = {}
        
        # Check for harassment
        harassment_matches = AIContentModerationService._check_keywords(
            full_text, AIContentModerationService.HARASSMENT_KEYWORDS
        )
        if harassment_matches:
            found_keywords.extend(harassment_matches)
            category_scores['harassment'] = len(harassment_matches)
        
        # Check for hate speech
        hate_speech_matches = AIContentModerationService._check_keywords(
            full_text, AIContentModerationService.HATE_SPEECH_KEYWORDS
        )
        if hate_speech_matches:
            found_keywords.extend(hate_speech_matches)
            category_scores['hate_speech'] = len(hate_speech_matches) * 1.5  # Higher weight
        
        # Check for bullying
        bullying_matches = AIContentModerationService._check_keywords(
            full_text, AIContentModerationService.BULLYING_KEYWORDS
        )
        if bullying_matches:
            found_keywords.extend(bullying_matches)
            category_scores['bullying'] = len(bullying_matches)
        
        # Check for self-harm indicators
        self_harm_matches = AIContentModerationService._check_keywords(
            full_text, AIContentModerationService.SELF_HARM_KEYWORDS
        )
        if self_harm_matches:
            found_keywords.extend(self_harm_matches)
            category_scores['self_harm'] = len(self_harm_matches) * 2.0  # Highest weight
        
        # Check for misinformation
        misinfo_matches = AIContentModerationService._check_keywords(
            full_text, AIContentModerationService.MISINFORMATION_KEYWORDS
        )
        if misinfo_matches:
            found_keywords.extend(misinfo_matches)
            category_scores['misinformation'] = len(misinfo_matches)
        
        # Check for policy violations
        policy_matches = AIContentModerationService._check_keywords(
            full_text, AIContentModerationService.POLICY_VIOLATION_KEYWORDS
        )
        if policy_matches:
            found_keywords.extend(policy_matches)
            category_scores['policy_violation'] = len(policy_matches) * 1.3
        
        # Check for academic violations
        academic_matches = AIContentModerationService._check_keywords(
            full_text, AIContentModerationService.ACADEMIC_VIOLATION_KEYWORDS
        )
        if academic_matches:
            found_keywords.extend(academic_matches)
            category_scores['academic_violation'] = len(academic_matches)
        
        # Determine if content should be flagged
        if not category_scores:
            return {
                "is_flagged": False,
                "risk_category": None,
                "risk_severity": "low",
                "confidence_score": 0.0,
                "reasoning": "No concerning keywords detected",
                "keywords_found": []
            }
        
        # Find the highest scoring category
        primary_category = max(category_scores, key=category_scores.get)
        primary_score = category_scores[primary_category]
        
        # Calculate confidence and severity
        confidence_score = min(primary_score * 0.2, 1.0)  # Scale to 0-1
        
        # Determine severity based on category and score
        if primary_category in ['self_harm', 'hate_speech'] or primary_score >= 3:
            severity = 'critical'
        elif primary_category in ['harassment', 'policy_violation'] or primary_score >= 2:
            severity = 'high'
        elif primary_score >= 1:
            severity = 'medium'
        else:
            severity = 'low'
        
        # Generate reasoning
        reasoning = AIContentModerationService._generate_reasoning(
            primary_category, found_keywords, author_role
        )
        
        return {
            "is_flagged": True,
            "risk_category": primary_category,
            "risk_severity": severity,
            "confidence_score": confidence_score,
            "reasoning": reasoning,
            "keywords_found": found_keywords
        }
    
    @staticmethod
    def _check_keywords(text: str, keywords: List[str]) -> List[str]:
        """Check if any keywords are present in the text"""
        found = []
        for keyword in keywords:
            if keyword in text:
                found.append(keyword)
        return found
    
    @staticmethod
    def _generate_reasoning(category: str, keywords: List[str], author_role: str) -> str:
        """Generate human-readable reasoning for the flagging decision"""
        keyword_list = ", ".join(keywords[:3])  # Show first 3 keywords
        
        reasoning_templates = {
            'harassment': f"Content contains personal attacks and derogatory language ({keyword_list}). This violates community guidelines regarding respectful communication.",
            'hate_speech': f"Content contains discriminatory language targeting identity or background ({keyword_list}). This is a clear violation of anti-discrimination policies.",
            'bullying': f"Content promotes social exclusion and contains language targeting an individual ({keyword_list}). This indicates potential bullying behavior.",
            'self_harm': f"Content indicates potential mental health concerns with phrases suggesting distress ({keyword_list}). Flagged for immediate review and support.",
            'misinformation': f"Content contains unverified claims that could spread false information ({keyword_list}). This may cause panic or confusion.",
            'policy_violation': f"Content appears to violate institutional policies, possibly involving financial irregularities ({keyword_list}). Requires verification.",
            'academic_violation': f"Content suggests academic dishonesty or integrity violations ({keyword_list}). This undermines educational standards."
        }
        
        base_reasoning = reasoning_templates.get(category, f"Content flagged for review due to concerning language ({keyword_list}).")
        
        if author_role == 'teacher':
            base_reasoning += " Extra attention required as this involves faculty member."
        
        return base_reasoning
    
    @staticmethod
    def flag_content(post_id: str, post_type: str, content: str, title: str, 
                    author_id: str, author_name: str, author_role: str,
                    classroom: str = None, department: str = None) -> Optional[str]:
        """
        Analyze content and create a flagged content entry if inappropriate
        
        Returns:
            flag_id if content was flagged, None if content is clean
        """
        analysis = AIContentModerationService.analyze_content(content, title, author_role)
        
        if not analysis["is_flagged"]:
            return None
        
        # Create flagged content entry
        flag_id = f"flag_{uuid.uuid4().hex[:12]}"
        
        flagged_entry = {
            "flag_id": flag_id,
            "post_id": post_id,
            "post_type": post_type,
            "content": content,
            "title": title,
            "author_id": author_id,
            "author_name": author_name,
            "author_role": author_role,
            "classroom": classroom,
            "department": department,
            "risk_category": analysis["risk_category"],
            "risk_severity": analysis["risk_severity"],
            "confidence_score": analysis["confidence_score"],
            "ai_reasoning": analysis["reasoning"],
            "keywords_found": ",".join(analysis["keywords_found"]),
            "status": "pending",
            "flagged_at": datetime.now(timezone.utc).isoformat(),
            "reviewed_by": None,
            "reviewed_at": None,
            "admin_action": None,
            "admin_reason": None
        }
        
        # Store in database
        db.create_flagged_content(flagged_entry)
        
        return flag_id


def moderate_moment_content(moment_data: Dict) -> Optional[str]:
    """
    Convenience function to moderate moment content
    
    Args:
        moment_data: Dictionary containing moment information
        
    Returns:
        flag_id if flagged, None if clean
    """
    return AIContentModerationService.flag_content(
        post_id=moment_data.get("moment_id"),
        post_type="moment",
        content=moment_data.get("content", ""),
        title=moment_data.get("title", ""),
        author_id=moment_data.get("user_id"),
        author_name=moment_data.get("user_name"),
        author_role=moment_data.get("user_role", "student"),
        classroom=moment_data.get("user_classroom"),
        department=moment_data.get("user_department")
    )


def moderate_comment_content(comment_data: Dict) -> Optional[str]:
    """
    Convenience function to moderate comment content
    
    Args:
        comment_data: Dictionary containing comment information
        
    Returns:
        flag_id if flagged, None if clean
    """
    return AIContentModerationService.flag_content(
        post_id=comment_data.get("comment_id"),
        post_type="comment",
        content=comment_data.get("content", ""),
        title="",  # Comments don't have titles
        author_id=comment_data.get("user_id"),
        author_name=comment_data.get("user_name"),
        author_role=comment_data.get("user_role", "student"),
        classroom=comment_data.get("user_classroom"),
        department=comment_data.get("user_department")
    )