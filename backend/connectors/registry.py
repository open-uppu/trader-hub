from typing import Dict, List, Optional, Any
from .base import BaseConnector


class ConnectorRegistry:
    """Central registry holding all active project connectors."""

    def __init__(self):
        self._connectors: Dict[str, BaseConnector] = {}

    def register(self, connector: BaseConnector) -> None:
        self._connectors[connector.project_id] = connector

    def get(self, project_id: str) -> Optional[BaseConnector]:
        return self._connectors.get(project_id)

    def list_all(self) -> List[Dict[str, Any]]:
        result = []
        for pid, conn in self._connectors.items():
            status_info = conn.get_status()
            result.append({
                "id": pid,
                "name": conn.project_name,
                "description": conn.description,
                "category": conn.category,
                "status": status_info.get("status", "unknown"),
                "online": status_info.get("online", False),
                "summary": conn.get_summary()
            })
        return result
