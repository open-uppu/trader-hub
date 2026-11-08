from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseConnector(ABC):
    """Abstract Base Class for all project connectors in the Hub."""

    project_id: str = "base_project"
    project_name: str = "Base Project"
    description: str = "Base connector description"
    category: str = "Finance"

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Returns connection and execution status (e.g. active, idle, offline)."""
        pass

    @abstractmethod
    def get_summary(self) -> Dict[str, Any]:
        """Returns high-level KPI cards and metrics for the main Overview screen."""
        pass

    @abstractmethod
    def get_details(self) -> Dict[str, Any]:
        """Returns detailed project payload for the dedicated project screen."""
        pass
