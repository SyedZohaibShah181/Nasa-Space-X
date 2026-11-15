"""
NASA Common Metadata Repository (CMR) Connector
================================================
Searches NASA Earthdata collections and granules across SRTM, MODIS, and EMIT.

Endpoint: https://cmr.earthdata.nasa.gov/search
Authentication: Public search queries (Free NASA Earthdata account required for raw file download)
"""
from typing import Dict, Any, Optional
from app.scientific.data_connectors.base_connector import BaseDataConnector


class NasaCmrConnector(BaseDataConnector):
    """Connector for querying the NASA Common Metadata Repository (CMR)."""

    def __init__(self):
        super().__init__(
            name="NASA Common Metadata Repository (CMR)",
            provider="NASA Earth Science Data and Information System (ESDIS)",
            base_url="https://cmr.earthdata.nasa.gov/search",
            timeout_seconds=20.0,
        )

    async def search_granules(
        self,
        short_name: str,
        bounding_box: Optional[str] = None,
        limit: int = 5,
    ) -> Dict[str, Any]:
        """
        Search granules by product short name (e.g. 'MOD11A2', 'SRTMGL1')
        and optional bounding box (W, S, E, N).
        """
        params: Dict[str, Any] = {
            "short_name": short_name,
            "page_size": limit,
        }
        if bounding_box:
            params["bounding_box"] = bounding_box

        res = await self._safe_get("granules.json", params=params)

        metadata = self.build_metadata(
            product_id=short_name,
            spatial_resolution="Varies by sensor (30m to 1km)",
            units="Metadata entries",
            crs="WGS84 (EPSG:4326)",
            status="REAL_NASA_CMR_METADATA" if res["success"] else "OFFLINE",
            notes="Catalog query via NASA ESDIS CMR Search API.",
        )

        if not res["success"]:
            return {
                "success": False,
                "error": res["error"],
                "metadata": metadata,
                "granules": [],
            }

        try:
            entries = res["data"]["feed"]["entry"]
            granules = [
                {
                    "id": g.get("id"),
                    "title": g.get("title"),
                    "updated": g.get("updated"),
                    "data_center": g.get("data_center"),
                    "links": [
                        {"rel": link.get("rel"), "href": link.get("href")}
                        for link in g.get("links", [])
                        if link.get("href")
                    ],
                }
                for g in entries
            ]
            return {
                "success": True,
                "metadata": metadata,
                "count": len(granules),
                "granules": granules,
            }
        except KeyError as ke:
            return {
                "success": False,
                "error": f"Unexpected CMR response format: missing {ke}",
                "metadata": metadata,
                "granules": [],
            }

    async def fetch_data(self, **kwargs) -> Dict[str, Any]:
        short_name = kwargs.get("short_name", "MOD11A2")
        bbox = kwargs.get("bounding_box")
        return await self.search_granules(short_name=short_name, bounding_box=bbox)
