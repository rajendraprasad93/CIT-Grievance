"""
AI Issue Clustering Service

This service provides basic issue clustering functionality by grouping similar issues
based on keywords, categories, and locations. This is a simplified version that doesn't
require ML models but provides useful issue aggregation.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional
import re
from collections import defaultdict, Counter
import database as db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def _parse_datetime(date_str):
    """Helper function to parse datetime strings consistently"""
    if not date_str:
        return datetime.now(timezone.utc)
    
    try:
        # Handle ISO format with timezone
        if date_str.endswith('Z'):
            date_str = date_str[:-1] + '+00:00'
        elif '+' not in date_str and date_str.count(':') == 2 and date_str.count('-') >= 2:
            # Assume UTC if no timezone info
            date_str = date_str + '+00:00'
            
        parsed_date = datetime.fromisoformat(date_str)
        
        # Ensure the datetime is timezone-aware
        if parsed_date.tzinfo is None:
            parsed_date = parsed_date.replace(tzinfo=timezone.utc)
        
        return parsed_date
    except ValueError:
        # Return current time if parsing fails
        return datetime.now(timezone.utc)


class AIClusteringService:
    """Service for clustering similar issues together"""
    
    # Common keywords that indicate similar issues
    SIMILARITY_KEYWORDS = {
        'water': ['water', 'tap', 'leak', 'plumbing', 'pipe', 'faucet', 'drain'],
        'electricity': ['power', 'electricity', 'light', 'bulb', 'switch', 'outlet', 'electrical'],
        'ac': ['ac', 'air', 'conditioning', 'cooling', 'temperature', 'hot', 'cold'],
        'wifi': ['wifi', 'internet', 'network', 'connection', 'online', 'router'],
        'food': ['food', 'mess', 'canteen', 'meal', 'dining', 'kitchen', 'cook'],
        'cleanliness': ['clean', 'dirty', 'trash', 'garbage', 'hygiene', 'sanitation'],
        'furniture': ['chair', 'table', 'desk', 'bench', 'furniture', 'broken'],
        'bathroom': ['toilet', 'bathroom', 'washroom', 'restroom', 'shower'],
        'library': ['library', 'book', 'study', 'reading', 'quiet'],
        'parking': ['parking', 'vehicle', 'car', 'bike', 'motorcycle', 'space'],
    }
    
    @staticmethod
    def extract_keywords(text: str) -> List[str]:
        """Extract keywords from issue title and description"""
        # Convert to lowercase and extract words
        words = re.findall(r'\b\w+\b', text.lower())
        return [word for word in words if len(word) > 2]
    
    @staticmethod
    def calculate_similarity(issue1: Dict, issue2: Dict) -> float:
        """Calculate similarity score between two issues (0-1)"""
        score = 0.0
        
        # Category match (high weight)
        if issue1.get('category') == issue2.get('category'):
            score += 0.4
        
        # Location similarity (medium weight)
        loc1 = issue1.get('location', '').lower()
        loc2 = issue2.get('location', '').lower()
        if loc1 and loc2:
            # Check if locations share common words
            loc1_words = set(re.findall(r'\b\w+\b', loc1))
            loc2_words = set(re.findall(r'\b\w+\b', loc2))
            if loc1_words & loc2_words:  # Intersection
                score += 0.3
        
        # Keyword similarity (medium weight)
        text1 = f"{issue1.get('title', '')} {issue1.get('description', '')}"
        text2 = f"{issue2.get('title', '')} {issue2.get('description', '')}"
        
        keywords1 = set(AIClusteringService.extract_keywords(text1))
        keywords2 = set(AIClusteringService.extract_keywords(text2))
        
        if keywords1 and keywords2:
            common_keywords = keywords1 & keywords2
            total_keywords = keywords1 | keywords2
            keyword_similarity = len(common_keywords) / len(total_keywords)
            score += keyword_similarity * 0.3
        
        return min(score, 1.0)
    
    @staticmethod
    def detect_issue_category(issue: Dict) -> str:
        """Detect the main category of an issue based on keywords"""
        text = f"{issue.get('title', '')} {issue.get('description', '')}".lower()
        
        category_scores = {}
        for category, keywords in AIClusteringService.SIMILARITY_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text)
            if score > 0:
                category_scores[category] = score
        
        if category_scores:
            return max(category_scores, key=category_scores.get)
        
        # Fallback to original category
        return issue.get('category', 'other')
    
    @staticmethod
    def calculate_sentiment(issue: Dict) -> float:
        """Calculate sentiment score (-1 to 1) based on keywords"""
        text = f"{issue.get('title', '')} {issue.get('description', '')}".lower()
        
        # Negative sentiment keywords
        negative_words = [
            'broken', 'not working', 'failed', 'terrible', 'awful', 'worst',
            'useless', 'horrible', 'disgusting', 'dirty', 'smelly', 'urgent',
            'emergency', 'critical', 'serious', 'dangerous', 'unsafe'
        ]
        
        # Positive sentiment keywords (rare in issues but possible)
        positive_words = [
            'good', 'working', 'fixed', 'resolved', 'clean', 'nice',
            'improved', 'better', 'excellent', 'great'
        ]
        
        negative_score = sum(1 for word in negative_words if word in text)
        positive_score = sum(1 for word in positive_words if word in text)
        
        # Calculate sentiment (-1 to 1)
        total_words = len(text.split())
        if total_words == 0:
            return -0.3  # Default slightly negative for issues
        
        sentiment = (positive_score - negative_score) / max(total_words * 0.1, 1)
        return max(-1.0, min(1.0, sentiment))
    
    @staticmethod
    def cluster_issues() -> List[Dict]:
        """Cluster all issues and return aggregated results"""
        # Get all issues from database
        issues = db.get_issues()
        
        if len(issues) < 2:
            return []
        
        # Group issues by similarity
        clusters = []
        processed_issues = set()
        
        for i, issue in enumerate(issues):
            if issue['issue_id'] in processed_issues:
                continue
            
            # Start a new cluster with this issue
            cluster_issues = [issue]
            processed_issues.add(issue['issue_id'])
            
            # Find similar issues
            for j, other_issue in enumerate(issues):
                if i != j and other_issue['issue_id'] not in processed_issues:
                    similarity = AIClusteringService.calculate_similarity(issue, other_issue)
                    
                    # If similarity is above threshold, add to cluster
                    if similarity >= 0.6:  # 60% similarity threshold
                        cluster_issues.append(other_issue)
                        processed_issues.add(other_issue['issue_id'])
            
            # Only create cluster if it has multiple issues
            if len(cluster_issues) >= 2:
                clusters.append(cluster_issues)
        
        # Convert clusters to aggregated format
        aggregated_issues = []
        
        for cluster in clusters:
            # Calculate cluster statistics
            total_affected = sum(issue.get('affected_count', 1) for issue in cluster)
            total_comments = 0  # Would need to count comments from database
            
            # Determine cluster category and locations
            categories = [AIClusteringService.detect_issue_category(issue) for issue in cluster]
            main_category = Counter(categories).most_common(1)[0][0]
            
            locations = list(set(issue.get('location', '') for issue in cluster if issue.get('location')))
            
            # Calculate average sentiment
            sentiments = [AIClusteringService.calculate_sentiment(issue) for issue in cluster]
            avg_sentiment = sum(sentiments) / len(sentiments)
            
            # Determine severity based on affected count and keywords
            if total_affected >= 50 or any('critical' in issue.get('description', '').lower() for issue in cluster):
                severity = 'critical'
            elif total_affected >= 20 or any('urgent' in issue.get('description', '').lower() for issue in cluster):
                severity = 'high'
            elif total_affected >= 10:
                severity = 'medium'
            else:
                severity = 'low'
            
            # Generate cluster title and summary
            common_keywords = set()
            for issue in cluster:
                keywords = AIClusteringService.extract_keywords(f"{issue.get('title', '')} {issue.get('description', '')}")
                common_keywords.update(keywords)
            
            # Find most common words for title
            title_words = []
            for issue in cluster:
                title_words.extend(issue.get('title', '').split())
            
            common_title_words = [word for word, count in Counter(title_words).most_common(3) if count > 1]
            
            if common_title_words:
                cluster_title = f"{main_category.title()} Issues - {' '.join(common_title_words[:2]).title()}"
            else:
                cluster_title = f"{main_category.title()} Issues in {locations[0] if locations else 'Campus'}"
            
            # Generate AI summary
            ai_summary = f"Multiple reports of {main_category} issues affecting {total_affected} students. "
            if locations:
                ai_summary += f"Primarily reported in: {', '.join(locations[:3])}. "
            
            status_counts = Counter(issue.get('status', 'reported') for issue in cluster)
            most_common_status = status_counts.most_common(1)[0][0]
            
            if most_common_status == 'resolved':
                ai_summary += "Most issues in this cluster have been resolved."
            elif most_common_status == 'in_progress':
                ai_summary += "Issues are currently being addressed by the maintenance team."
            else:
                ai_summary += "These issues require immediate attention from the administration."
            
            # Determine trend (simplified)
            recent_issues = []
            for issue in cluster:
                try:
                    issue_date = _parse_datetime(issue['created_at'])
                    days_diff = (datetime.now(timezone.utc) - issue_date).days
                    if days_diff <= 7:
                        recent_issues.append(issue)
                except ValueError:
                    # If date parsing fails, skip this item
                    continue
            
            if len(recent_issues) >= len(cluster) * 0.7:
                trend = 'increasing'
            elif len(recent_issues) <= len(cluster) * 0.3:
                trend = 'decreasing'
            else:
                trend = 'stable'
            
            # Create aggregated issue
            agg_id = f"agg_{uuid.uuid4().hex[:12]}"
            
            aggregated_issue = {
                "id": agg_id,
                "title": cluster_title,
                "aiSummary": ai_summary,
                "severity": severity,
                "relatedCount": len(cluster),
                "totalComments": total_comments,
                "totalAffected": total_affected,
                "sentiment": round(avg_sentiment, 2),
                "category": main_category.title(),
                "locations": locations[:5],  # Limit to 5 locations
                "status": most_common_status,
                "trend": trend,
                "lastActivity": max(_parse_datetime(issue.get('updated_at', issue.get('created_at'))) for issue in cluster).isoformat(),
                "createdAt": min(_parse_datetime(issue.get('created_at')) for issue in cluster).isoformat(),
                "relatedIssues": [
                    {
                        "id": issue['issue_id'],
                        "title": issue['title'],
                        "status": issue.get('status', 'reported'),
                        "affected": issue.get('affected_count', 1)
                    }
                    for issue in cluster
                ]
            }
            
            aggregated_issues.append(aggregated_issue)
        
        # Sort by severity and affected count
        severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        aggregated_issues.sort(key=lambda x: (severity_order.get(x['severity'], 4), -x['totalAffected']))
        
        return aggregated_issues

    @staticmethod
    def cluster_issues_from_list(items_list) -> List[Dict]:
        """Cluster given list of issues and return aggregated results"""
        
        if len(items_list) < 2:
            return []
        
        # Group items by similarity
        clusters = []
        processed_items = set()
        
        for i, item in enumerate(items_list):
            if item.get('issue_id') in processed_items:
                continue
            
            # Start a new cluster with this item
            cluster_items = [item]
            processed_items.add(item.get('issue_id'))
            
            # Find similar items
            for j, other_item in enumerate(items_list):
                if i != j and other_item.get('issue_id') not in processed_items:
                    similarity = AIClusteringService.calculate_similarity(item, other_item)
                    
                    # If similarity is above threshold, add to cluster
                    if similarity >= 0.6:  # 60% similarity threshold
                        cluster_items.append(other_item)
                        processed_items.add(other_item.get('issue_id'))
            
            # Only create cluster if it has multiple items
            if len(cluster_items) >= 2:
                clusters.append(cluster_items)
        
        # Convert clusters to aggregated format
        aggregated_issues = []
        
        for cluster in clusters:
            # Calculate cluster statistics
            total_affected = sum(item.get('affected_count', 1) for item in cluster)
            total_comments = 0  # Would need to count comments from database
            
            # Determine cluster category and locations
            categories = [AIClusteringService.detect_issue_category(item) for item in cluster]
            main_category = Counter(categories).most_common(1)[0][0]
            
            locations = list(set(item.get('location', '') for item in cluster if item.get('location')))
            
            # Calculate average sentiment
            sentiments = [AIClusteringService.calculate_sentiment(item) for item in cluster]
            avg_sentiment = sum(sentiments) / len(sentiments)
            
            # Determine severity based on affected count and keywords
            if total_affected >= 50 or any('critical' in item.get('description', '').lower() for item in cluster):
                severity = 'critical'
            elif total_affected >= 20 or any('urgent' in item.get('description', '').lower() for item in cluster):
                severity = 'high'
            elif total_affected >= 10:
                severity = 'medium'
            else:
                severity = 'low'
            
            # Generate cluster title and summary
            common_keywords = set()
            for item in cluster:
                keywords = AIClusteringService.extract_keywords(f"{item.get('title', '')} {item.get('description', '')}")
                common_keywords.update(keywords)
            
            # Find most common words for title
            title_words = []
            for item in cluster:
                title_words.extend(item.get('title', '').split())
            
            common_title_words = [word for word, count in Counter(title_words).most_common(3) if count > 1]
            
            if common_title_words:
                cluster_title = f"{main_category.title()} Issues - {' '.join(common_title_words[:2]).title()}"
            else:
                cluster_title = f"{main_category.title()} Issues in {locations[0] if locations else 'Campus'}"
            
            # Generate AI summary
            ai_summary = f"Multiple reports of {main_category} issues affecting {total_affected} students. "
            if locations:
                ai_summary += f"Primarily reported in: {', '.join(locations[:3])}. "
            
            status_counts = Counter(item.get('status', 'reported') for item in cluster)
            most_common_status = status_counts.most_common(1)[0][0]
            
            if most_common_status == 'resolved':
                ai_summary += "Most issues in this cluster have been resolved."
            elif most_common_status == 'in_progress':
                ai_summary += "Issues are currently being addressed by the maintenance team."
            else:
                ai_summary += "These issues require immediate attention from the administration."
            
            # Determine trend (simplified)
            recent_items = []
            for item in cluster:
                try:
                    item_date = _parse_datetime(item['created_at'])
                    days_diff = (datetime.now(timezone.utc) - item_date).days
                    if days_diff <= 7:
                        recent_items.append(item)
                except ValueError:
                    # If date parsing fails, skip this item
                    continue
            
            if len(recent_items) >= len(cluster) * 0.7:
                trend = 'increasing'
            elif len(recent_items) <= len(cluster) * 0.3:
                trend = 'decreasing'
            else:
                trend = 'stable'
            
            # Create aggregated issue
            agg_id = f"agg_{uuid.uuid4().hex[:12]}"
            
            aggregated_issue = {
                "id": agg_id,
                "title": cluster_title,
                "aiSummary": ai_summary,
                "severity": severity,
                "relatedCount": len(cluster),
                "totalComments": total_comments,
                "totalAffected": total_affected,
                "sentiment": round(avg_sentiment, 2),
                "category": main_category.title(),
                "locations": locations[:5],  # Limit to 5 locations
                "status": most_common_status,
                "trend": trend,
                "lastActivity": max(_parse_datetime(item.get('updated_at', item.get('created_at'))) for item in cluster).isoformat(),
                "createdAt": min(_parse_datetime(item.get('created_at')) for item in cluster).isoformat(),
                "relatedIssues": [
                    {
                        "id": item.get('issue_id'),
                        "title": item.get('title'),
                        "status": item.get('status', 'reported'),
                        "affected": item.get('affected_count', 1)
                    }
                    for item in cluster
                ]
            }
            
            aggregated_issues.append(aggregated_issue)
        
        # Sort by severity and affected count
        severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
        aggregated_issues.sort(key=lambda x: (severity_order.get(x['severity'], 4), -x['totalAffected']))
        
        return aggregated_issues


def run_ai_analysis() -> Dict:
    """Run AI analysis and return results"""
    try:
        # Get fresh issues and moments from database
        all_issues = db.get_issues(limit=1000)  # Get more issues for better clustering
        all_moments = db.get_moments(limit=1000)  # Get moments as well
        
        print(f"AI Analysis: Processing {len(all_issues)} issues and {len(all_moments)} moments")
        
        # Convert moments to issue-like format for processing
        formatted_moments = []
        for moment in all_moments:
            if moment.get('status') == 'approved':  # Only process approved moments
                formatted_moments.append({
                    'issue_id': moment.get('moment_id', f"mom_{uuid.uuid4().hex[:8]}"),
                    'title': moment.get('title', ''),
                    'description': moment.get('content', ''),
                    'category': moment.get('moment_type', 'general'),
                    'location': '',  # Moments don't have specific locations
                    'status': moment.get('status', 'reported'),
                    'affected_count': 0,  # We can calculate this based on reactions/comments
                    'created_at': moment.get('created_at', datetime.now(timezone.utc).isoformat()),
                    'updated_at': moment.get('updated_at', moment.get('created_at', datetime.now(timezone.utc).isoformat())),
                    'user_id': moment.get('user_id'),
                    'user_name': moment.get('user_name')
                })
        
        # Combine issues and moments for analysis
        all_complaints = all_issues + formatted_moments
        
        print(f"AI Analysis: Total {len(all_complaints)} items for clustering")
        
        # Run clustering on all complaints
        aggregated_issues = AIClusteringService.cluster_issues_from_list(all_complaints)
        
        print(f"AI Analysis: Found {len(aggregated_issues)} clusters")
        
        # Add more detailed logging
        for i, cluster in enumerate(aggregated_issues):
            print(f"Cluster {i+1}: {cluster['title']} - {cluster['totalAffected']} affected users")
        
        return {
            "success": True,
            "clusters_found": len(aggregated_issues),
            "aggregated_issues": aggregated_issues,
            "analysis_time": datetime.now(timezone.utc).isoformat(),
            "total_issues_processed": len(all_complaints)
        }
    except Exception as e:
        print(f"AI Analysis failed: {e}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {
            "success": False,
            "error": str(e),
            "clusters_found": 0,
            "aggregated_issues": [],
            "analysis_time": datetime.now(timezone.utc).isoformat()
        }