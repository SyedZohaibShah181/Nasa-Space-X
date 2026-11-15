"""
Scientific data connectors unit tests
======================================
Tests connector initialization, metadata construction, and data retrieval logic
for Earth, Moon, and Mars sources.
"""
import pytest
from app.scientific.data_connectors import (
    NasaPowerConnector,
    NasaCmrConnector,
    MarsMolaConnector,
    MoonLolaConnector,
)


@pytest.mark.asyncio
async def test_mars_mola_connector_jezero():
    connector = MarsMolaConnector()
    result = await connector.fetch_site_metrics("jezero_crater")
    assert result["success"] is True
    assert result["metrics"]["name"] == "Jezero Crater"
    assert result["metrics"]["elevation_m"] == -2500.0
    assert result["metadata"]["source_provider"] == "NASA PDS Geosciences Node / USGS Astrogeology"
    assert result["metadata"]["crs"] == "IAU Mars 2000 Planetocentric Sphere (EPSG:49900)"


@pytest.mark.asyncio
async def test_mars_mola_connector_invalid():
    connector = MarsMolaConnector()
    result = await connector.fetch_site_metrics("unknown_region_xyz")
    assert result["success"] is False
    assert "not found" in result["error"].lower()


@pytest.mark.asyncio
async def test_moon_lola_connector_south_pole():
    connector = MoonLolaConnector()
    result = await connector.fetch_site_metrics("lunar_south_pole")
    assert result["success"] is True
    assert result["metrics"]["elevation_m"] == -4200.0
    assert result["metadata"]["crs"] == "IAU Moon 2000 Polar Stereographic (EPSG:104903)"
    assert "Permanently Shadowed Regolith" in result["metrics"]["geological_units"]


@pytest.mark.asyncio
async def test_nasa_cmr_connector_metadata_generation():
    connector = NasaCmrConnector()
    metadata = connector.build_metadata(
        product_id="SRTMGL1",
        spatial_resolution="30m",
        units="meters",
        crs="EPSG:4326",
    )
    assert metadata["product_id"] == "SRTMGL1"
    assert metadata["source_provider"] == "NASA Earth Science Data and Information System (ESDIS)"
    assert "retrieved_at" in metadata


@pytest.mark.asyncio
async def test_nasa_power_connector_build_metadata():
    connector = NasaPowerConnector()
    metadata = connector.build_metadata(
        product_id="NASA_POWER_MERRA2",
        spatial_resolution="0.5x0.625 deg",
        units="Celsius",
        crs="EPSG:4326",
    )
    assert metadata["dataset_name"] == "NASA POWER Climatology"
    assert metadata["units"] == "Celsius"

