"""
Audit Service for Admin Actions

This service provides centralized audit logging functionality for all admin actions
in the CIT Campus Connect platform. It tracks who did what, when, and on which entities.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, Dict
import database as db


class AuditService:
    """Service for logging admin actions to maintain accountability trail"""
    
    @staticmethod
    def log_action(
        admin_id: str,
        admin_name: str,
        action_type: str,
        entity_type: str,
        entity_id: str,
        old_value: Optional[str] = None,
        new_value: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict:
        """
        Log an admin action to the audit trail
        
        Args:
            admin_id: User ID of the admin performing the action
            admin_name: Name of the admin performing the action
            action_type: Type of action (e.g., "update_status", "approve_content")
            entity_type: Type of entity being acted upon (e.g., "issue", "flagged_content")
            entity_id: ID of the specific entity
            old_value: Previous value (optional)
            new_value: New value (optional)
            ip_address: IP address of the request (optional)
            user_agent: User agent string (optional)
            
        Returns:
            Dict containing the created audit log entry
        """
        log_id = f"audit_{uuid.uuid4().hex[:12]}"
        
        log_entry = {
            "log_id": log_id,
            "admin_id": admin_id,
            "admin_name": admin_name,
            "action_type": action_type,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "old_value": old_value,
            "new_value": new_value,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        return db.create_audit_log(log_entry)
    
    @staticmethod
    def get_logs(
        admin_id: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> list:
        """
        Retrieve audit logs with optional filtering
        
        Args:
            admin_id: Filter by specific admin (optional)
            entity_type: Filter by entity type (optional)
            entity_id: Filter by specific entity ID (optional)
            limit: Maximum number of logs to return
            offset: Number of logs to skip (for pagination)
            
        Returns:
            List of audit log entries
        """
        return db.get_audit_logs(
            admin_id=admin_id,
            entity_type=entity_type,
            entity_id=entity_id,
            limit=limit,
            offset=offset
        )
