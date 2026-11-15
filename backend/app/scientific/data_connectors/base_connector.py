"""
Base Scientific Data Connector
===============================
Standardizes external API querying with timeouts, retries, error handling,
and rigorous provenance metadata logging.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
import httpx
import logging

logger = logging.getLogger("terratwin.connectors")


class BaseDataConnector(ABC):
    """
    Abstract base class for all Earth, Moon, and Mars data connectors.
    Ensures that every retrieved record retains its source URL, sensor product ID,
    acquisition timestamp, coordinate reference system, and data status.
    """

    def __init__(self, name: str, provider: str, base_url: str, timeout_seconds: float = 15.0):
        self.name = name
        self.provider = provider
        self.base_url = base_url
        self.timeout = timeout_seconds

    @abstractmethod
    async def fetch_data(self, **kwargs) -> Dict[str, Any]:
        """Fetch data from the external API or return a standardized error status."""
        pass

    def build_metadata(
        self,
        product_id: str,
        spatial_resolution: str,
        units: str,
        crs: str,
        status: str = "LIVE_DATA",
        notes: str = "",
    ) -> Dict[str, Any]:
        """Generate standardized provenance metadata dictionary."""
        return {
            "source_provider": self.provider,
            "dataset_name": self.name,
            "base_url": self.base_url,
            "product_id": product_id,
            "spatial_resolution": spatial_resolution,
            "units": units,
            "crs": crs,
            "retrieved_at": datetime.utcnow().isoformat() + "Z",
            "data_status": status,
            "notes": notes,
        }

    async def _safe_get(self, endpoint: str, params: Optional[Dict[str, Any]] = None, headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Execute HTTP GET with timeout and error capture. Never raises unhandled crash."""
        url = f"{self.base_url.rstrip('/')}/{endpoint.lstrip('/')}" if endpoint else self.base_url
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(url, params=params, headers=headers)
                if response.status_code == 200:
                    return {
                        "success": True,
                        "status_code": 200,
                        "data": response.json(),
                        "url": str(response.url),
                    }
                else:
                    logger.warning(f"Connector [{self.name}] failed HTTP {response.status_code} for {url}")
                    return {
                        "success": False,
                        "status_code": response.status_code,
                        "error": f"HTTP {response.status_code}: {response.text[:200]}",
                        "url": str(response.url),
                    }
            except httpx.TimeoutException:
                logger.error(f"Connector [{self.name}] timed out querying {url}")
                return {
                    "success": False,
                    "status_code": 408,
                    "error": f"Request to {self.name} timed out after {self.timeout}s",
                    "url": url,
                }
            except Exception as e:
                logger.error(f"Connector [{self.name}] error querying {url}: {e}")
                return {
                    "success": False,
                    "status_code": 500,
                    "error": str(e),
                    "url": url,
                }

