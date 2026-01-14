"""
AI Integration Service
Handles integration between different AI services to avoid circular imports
"""

import logging
from typing import Dict, Optional
import database as db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)


def moderate_content_with_fallback(content: str, title: str = "", author_role: str = "student") -> Dict:
    """
    Moderate content using Gemini AI when available, falling back to keyword analysis
    This function avoids circular imports between services
    """
    # Try Gemini AI first
    try:
        from .gemini_ai_service import moderate_content_with_gemini
        gemini_result = moderate_content_with_gemini(content, title, author_role)
        
        # If Gemini AI was used successfully, return its results
        if gemini_result.get('confidence_score', 0) > 0:
            return gemini_result
    except ImportError:
        logger.debug("Gemini AI service not available, using fallback")
    except Exception as e:
        logger.warning(f"Gemini AI moderation failed: {e}, using fallback")
    
    # Fall back to keyword-based analysis
    try:
        from .ai_moderation_service import AIContentModerationService
        return AIContentModerationService.analyze_content(content, title, author_role)
    except Exception as e:
        logger.error(f"Fallback moderation also failed: {e}")
        # Ultimate fallback
        return {
            "is_flagged": False,
            "risk_category": None,
            "risk_severity": "low",
            "confidence_score": 0.0,
            "reasoning": "Moderation service unavailable",
            "keywords_found": []
        }


def generate_insights_with_fallback(issues: list, moments: list) -> list:
    """
    Generate insights using Gemini AI when available, falling back to basic clustering
    This function avoids circular imports between services
    """
    # Try Gemini AI first
    try:
        from .gemini_ai_service import generate_insights_with_gemini
        gemini_service = __import__('services.gemini_ai_service', fromlist=['get_gemini_service']).get_gemini_service()
        
        if gemini_service.is_available():
            logger.info("Using Gemini AI for insights generation")
            return generate_insights_with_gemini(issues, moments)
        else:
            logger.info("Gemini AI not available, using fallback")
    except ImportError:
        logger.debug("Gemini AI service not available, using fallback")
    except Exception as e:
        logger.warning(f"Gemini AI insights failed: {e}, using fallback")
    
    # Fall back to basic clustering
    try:
        from .ai_clustering_service import AIClusteringService
        # Combine issues and approved moments for clustering
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
                'created_at': issue.get('created_at', ''),
                'updated_at': issue.get('updated_at', issue.get('created_at', '')),
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
                    'affected_count': 0,
                    'created_at': moment.get('created_at', ''),
                    'updated_at': moment.get('updated_at', moment.get('created_at', '')),
                })
        
        return AIClusteringService.cluster_issues_from_list(formatted_items)
    except Exception as e:
        logger.error(f"Fallback insights generation also failed: {e}")
        return []


def flag_content_with_integrated_moderation(post_id: str, post_type: str, content: str, title: str,
                                          author_id: str, author_name: str, author_role: str,
                                          classroom: str = None, department: str = None) -> Optional[str]:
    """
    Flag content using integrated moderation approach
    """
    analysis = moderate_content_with_fallback(content, title, author_role)
    
    if not analysis.get("is_flagged"):
        return None
    
    # Create flagged content entry
    import uuid
    from datetime import datetime, timezone
    
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
        "risk_category": analysis.get("risk_category"),
        "risk_severity": analysis.get("risk_severity"),
        "confidence_score": analysis.get("confidence_score"),
        "ai_reasoning": analysis.get("reasoning"),
        "keywords_found": ",".join(analysis.get("keywords_found", [])),
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


# Convenience functions for different content types
def moderate_moment_with_integrated_ai(moment_data: Dict) -> Optional[str]:
    """Moderate moment content using integrated AI approach"""
    return flag_content_with_integrated_moderation(
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


def moderate_comment_with_integrated_ai(comment_data: Dict) -> Optional[str]:
    """Moderate comment content using integrated AI approach"""
    return flag_content_with_integrated_moderation(
        post_id=comment_data.get("comment_id"),
        post_type="comment",
        content=comment_data.get("content", ""),
        title="",
        author_id=comment_data.get("user_id"),
        author_name=comment_data.get("user_name"),
        author_role=comment_data.get("user_role", "student"),
        classroom=comment_data.get("user_classroom"),
        department=comment_data.get("user_department")
    )