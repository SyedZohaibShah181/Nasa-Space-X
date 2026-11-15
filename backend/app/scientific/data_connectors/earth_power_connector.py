"""
NASA POWER Climatology Data Connector
======================================
Retrieves real, validated Earth surface temperature and precipitation climatology
from the NASA POWER (Prediction Of Worldwide Energy Resources) API.

Endpoint: https://power.larc.nasa.gov/api/temporal/climatology/point
Authentication: Public open access (No API key required)
"""
from typing import Dict, Any
from app.scientific.data_connectors.base_connector import BaseDataConnector


class NasaPowerConnector(BaseDataConnector):
    """Connector for querying real NASA satellite climatology datasets."""

    def __init__(self):
        super().__init__(
            name="NASA POWER Climatology",
            provider="NASA Langley Research Center",
            base_url="https://power.larc.nasa.gov/api",
            timeout_seconds=20.0,
        )

    async def fetch_data(self, latitude: float, longitude: float) -> Dict[str, Any]:
        """
        Fetch real annual climatology for a given Earth latitude and longitude.

        Parameters queried:
        - T2M: Temperature at 2 Meters (°C)
        - T2M_MAX: Maximum Temperature at 2 Meters (°C)
        - T2M_MIN: Minimum Temperature at 2 Meters (°C)
        - PRECTOTCORR: Corrected Total Precipitation (mm/day)
        """
        params = {
            "parameters": "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR",
            "community": "AG",
            "longitude": longitude,
            "latitude": latitude,
            "format": "JSON",
        }

        res = await self._safe_get("temporal/climatology/point", params=params)

        metadata = self.build_metadata(
            product_id="NASA_POWER_MERRA2_CLIMATOLOGY",
            spatial_resolution="0.5 x 0.625 degree (approx. 50 km)",
            units="Temperature: Celsius, Precipitation: mm/day",
            crs="WGS84 (EPSG:4326)",
            status="REAL_NASA_DATA" if res["success"] else "OFFLINE_FALLBACK",
            notes="Derived from NASA GMAO MERRA-2 assimilation model and CERES satellite data.",
        )

        if not res["success"]:
            return {
                "success": False,
                "error": res["error"],
                "metadata": metadata,
                "measurements": None,
            }

        # Parse NASA POWER JSON response structure
        try:
            properties = res["data"]["properties"]["parameter"]
            # Annual values are stored under key "ANN"
            t2m_ann = properties["T2M"].get("ANN")
            t2m_max_ann = properties["T2M_MAX"].get("ANN")
            t2m_min_ann = properties["T2M_MIN"].get("ANN")
            precip_daily = properties["PRECTOTCORR"].get("ANN")
            annual_precip_mm = round(precip_daily * 365.25, 1) if precip_daily is not None else None

            return {
                "success": True,
                "metadata": metadata,
                "source_url": res["url"],
                "measurements": {
                    "mean_temperature_c": t2m_ann,
                    "max_temperature_c": t2m_max_ann,
                    "min_temperature_c": t2m_min_ann,
                    "temperature_range_c": [t2m_min_ann, t2m_max_ann],
                    "annual_precipitation_mm": annual_precip_mm,
                },
            }
        except KeyError as ke:
            return {
                "success": False,
                "error": f"Unexpected NASA POWER response format: missing {ke}",
                "metadata": metadata,
                "measurements": None,
            }
