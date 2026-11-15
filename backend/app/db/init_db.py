"""
Database initialization and demonstration seeding
=================================================
Creates all tables and seeds verified baseline demonstration records.
All records are strictly stamped with data_status="DEMO_DATA" or "METADATA_ONLY"
in accordance with NASA Space Apps Challenge research transparency rules.
"""
from datetime import datetime
from app.db.session import engine, Base, SessionLocal
from app.models.all_models import (
    User,
    PlanetaryBody,
    ReferenceRegion,
    CandidateSite,
    Dataset,
    Measurement,
)


def init_db():
    """Create all tables in the configured database (SQLite or PostgreSQL)."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(PlanetaryBody).first():
            print("Database already contains data, skipping seed.")
            return

        print("Seeding initial database records...")

        # 1. Seed Planetary Bodies
        moon = PlanetaryBody(
            id="moon",
            name="Moon",
            full_name="Earth's Moon (Luna)",
            body_type="natural_satellite",
            distance_from_earth_km=384400.0,
            radius_km=1737.4,
            gravity_ms2=1.62,
            atmosphere="None (trace exosphere)",
            surface_temperature_min_c=-173.0,
            surface_temperature_max_c=127.0,
            primary_datasets=["LOLA", "LROC", "Lunar Mineralogy Mapper"],
            reference_regions_count=2,
            data_status="DEMO_DATA",
        )
        mars = PlanetaryBody(
            id="mars",
            name="Mars",
            full_name="Mars (The Red Planet)",
            body_type="planet",
            distance_from_earth_km=225000000.0,
            radius_km=3389.5,
            gravity_ms2=3.72,
            atmosphere="Thin CO2 (0.6% Earth pressure)",
            surface_temperature_min_c=-125.0,
            surface_temperature_max_c=20.0,
            primary_datasets=["MOLA", "HiRISE", "CTX", "CRISM"],
            reference_regions_count=3,
            data_status="DEMO_DATA",
        )
        db.add_all([moon, mars])
        db.flush()

        # 2. Seed Reference Regions
        regions = [
            ReferenceRegion(
                id="jezero_crater",
                planet_id="mars",
                name="Jezero Crater",
                latitude=18.38,
                longitude=77.58,
                diameter_km=49.0,
                elevation_m=-2500.0,
                description=(
                    "Ancient lake-delta system. Primary landing site for NASA Perseverance rover. "
                    "Contains layered carbonate and clay minerals with high biosignature preservation potential."
                ),
                key_features=["ancient delta deposits", "carbonate rocks", "clay minerals", "olivine"],
                primary_dataset="MOLA + HiRISE",
                mission_relevance="Perseverance Rover (Mars 2020)",
                data_status="DEMO_DATA",
            ),
            ReferenceRegion(
                id="gale_crater",
                planet_id="mars",
                name="Gale Crater",
                latitude=-5.38,
                longitude=137.44,
                diameter_km=154.0,
                elevation_m=-4500.0,
                description=(
                    "5 km central mound (Aeolis Mons / Mount Sharp). Layered sedimentary record "
                    "explored by NASA Curiosity rover. Confirmed ancient habitable lacustrine environment."
                ),
                key_features=["layered sediments", "sulfate minerals", "mudstones", "fluvial channels"],
                primary_dataset="MOLA + HiRISE + CRISM",
                mission_relevance="Curiosity Rover (MSL)",
                data_status="DEMO_DATA",
            ),
            ReferenceRegion(
                id="hellas_basin",
                planet_id="mars",
                name="Hellas Planitia",
                latitude=-42.4,
                longitude=70.0,
                diameter_km=2300.0,
                elevation_m=-7152.0,
                description=(
                    "Largest confirmed impact basin on Mars (~7 km below datum). "
                    "Complex geological history with periglacial features and atmospheric pressure anomalies."
                ),
                key_features=["deep basin", "volcanic deposits", "periglacial features"],
                primary_dataset="MOLA",
                mission_relevance="Future human exploration target",
                data_status="DEMO_DATA",
            ),
            ReferenceRegion(
                id="lunar_south_pole",
                planet_id="moon",
                name="Lunar South Pole",
                latitude=-89.9,
                longitude=0.0,
                diameter_km=100.0,
                elevation_m=-4200.0,
                description=(
                    "Permanently shadowed craters harboring water ice deposits. "
                    "Connecting ridge between Shackleton and de Gerlache craters targeted for Artemis."
                ),
                key_features=["permanently shadowed regions", "water ice", "Shackleton Crater"],
                primary_dataset="LOLA + LROC",
                mission_relevance="Artemis Program",
                data_status="DEMO_DATA",
            ),
            ReferenceRegion(
                id="tycho_crater",
                planet_id="moon",
                name="Tycho Crater",
                latitude=-43.3,
                longitude=-11.2,
                diameter_km=85.0,
                elevation_m=-4800.0,
                description=(
                    "Young impact crater (~108 Ma) displaying pristine central peaks, impact melt ponds, "
                    "and extensive high-albedo ray systems extending 1,500 km."
                ),
                key_features=["central peak", "melt sheet", "ejecta rays", "young morphology"],
                primary_dataset="LOLA + LROC NAC",
                mission_relevance="Geological reference site",
                data_status="DEMO_DATA",
            ),
        ]
        db.add_all(regions)
        db.flush()

        # 3. Seed Candidate Sites (Earth Analogs)
        sites = [
            CandidateSite(
                id="atacama_desert",
                name="Atacama Desert (Yungay / Salar de Atacama)",
                country="Chile",
                latitude=-23.5,
                longitude=-68.2,
                environment_type="Hyper-arid desert",
                planetary_target="mars",
                analog_score=78.5,
                features={
                    "elevation_m": 2400,
                    "aridity": "hyper-arid",
                    "geology": "salt flats, volcanic rock, nitrates, perchlorates",
                    "temperature_range_c": [-10, 40],
                    "annual_rainfall_mm": 1,
                },
                why_analog=(
                    "Extreme desiccation, UV radiation flux, nitrate/perchlorate mineralization, "
                    "and endolithic habitability limits directly analogous to Martian regolith."
                ),
                research_status="well_documented",
                data_sources=["NASA Earthdata", "USGS", "ESA Copernicus"],
                data_status="DEMO_DATA",
            ),
            CandidateSite(
                id="haughton_crater",
                name="Haughton Impact Crater (Devon Island)",
                country="Canada",
                latitude=75.22,
                longitude=-89.67,
                environment_type="Arctic impact crater",
                planetary_target="moon",
                analog_score=72.3,
                features={
                    "elevation_m": 50,
                    "aridity": "polar desert",
                    "geology": "impact breccia, shocked dolomite, shatter cones",
                    "temperature_range_c": [-40, 10],
                    "annual_rainfall_mm": 50,
                },
                why_analog=(
                    "23 km impact crater in cold polar desert. Investigated by NASA Haughton-Mars Project "
                    "for rover traverse mechanics, drill testing, and crater ejecta analysis."
                ),
                research_status="active_research_site",
                data_sources=["NASA Haughton-Mars Project", "USGS"],
                data_status="DEMO_DATA",
            ),
            CandidateSite(
                id="mcmurdo_dry_valleys",
                name="McMurdo Dry Valleys (University Valley)",
                country="Antarctica",
                latitude=-77.5,
                longitude=162.5,
                environment_type="Polar hyper-arid desert",
                planetary_target="mars",
                analog_score=70.1,
                features={
                    "elevation_m": 500,
                    "aridity": "polar desert",
                    "geology": "permafrost, dry till, patterned ground, endoliths",
                    "temperature_range_c": [-40, 2],
                    "annual_rainfall_mm": 0,
                },
                why_analog=(
                    "Coldest and driest polar desert on Earth. Dry permafrost, sublimating ice tables, "
                    "and cryptoendolithic communities mimicking high-latitude Martian terrain."
                ),
                research_status="active_research_site",
                data_sources=["NASA Earthdata", "ESA Copernicus", "USGS"],
                data_status="DEMO_DATA",
            ),
            CandidateSite(
                id="death_valley",
                name="Death Valley (Badwater Basin / Ubehebe)",
                country="USA",
                latitude=36.5,
                longitude=-117.1,
                environment_type="Extensional tectonic basin",
                planetary_target="mars",
                analog_score=65.8,
                features={
                    "elevation_m": -86,
                    "aridity": "arid",
                    "geology": "evaporites, borate salts, alluvial fans, sand dunes",
                    "temperature_range_c": [-5, 56],
                    "annual_rainfall_mm": 50,
                },
                why_analog=(
                    "Extreme thermal fluctuations, polygon salt crusts, and extensive alluvial fans "
                    "resembling Gale and Jezero basin sedimentary structures."
                ),
                research_status="well_documented",
                data_sources=["NASA Earthdata", "USGS"],
                data_status="DEMO_DATA",
            ),
        ]
        db.add_all(sites)
        db.flush()

        # 4. Seed Datasets
        datasets = [
            Dataset(
                id="srtm_dem",
                name="SRTM Digital Elevation Model",
                provider="NASA / USGS",
                dataset_type="Earth elevation",
                url="https://www2.jpl.nasa.gov/srtm/",
                spatial_resolution="30 m (1 arc-second)",
                coverage="Global (60°N to 56°S)",
                format="GeoTIFF",
                units="Meters above sea level",
                crs="WGS84 (EPSG:4326)",
                authentication_required=False,
                integration_status="active",
                data_status="METADATA_ONLY",
            ),
            Dataset(
                id="mola_dem",
                name="Mars Orbiter Laser Altimeter (MOLA)",
                provider="NASA PDS / USGS Astrogeology",
                dataset_type="Mars elevation",
                url="https://astrogeology.usgs.gov/search/map/Mars/GlobalSurveyor/MOLA",
                spatial_resolution="463 m/pixel (global)",
                coverage="Global Mars",
                format="GeoTIFF / IMG",
                units="Meters above MOLA datum",
                crs="IAU Mars 2000 Sphere (EPSG:49900)",
                authentication_required=False,
                integration_status="active",
                data_status="METADATA_ONLY",
            ),
            Dataset(
                id="lola_dem",
                name="Lunar Orbiter Laser Altimeter (LOLA)",
                provider="NASA PDS / USGS Astrogeology",
                dataset_type="Lunar elevation",
                url="https://astrogeology.usgs.gov/search/map/Moon/LRO/LOLA",
                spatial_resolution="118 m/pixel (global)",
                coverage="Global Moon",
                format="GeoTIFF / IMG",
                units="Meters above lunar datum",
                crs="IAU Moon 2000 (EPSG:104903)",
                authentication_required=False,
                integration_status="active",
                data_status="METADATA_ONLY",
            ),
            Dataset(
                id="modis_lst",
                name="MODIS Land Surface Temperature (MOD11A2)",
                provider="NASA Earthdata",
                dataset_type="Earth surface temperature",
                url="https://search.earthdata.nasa.gov/",
                spatial_resolution="1 km",
                coverage="Global",
                format="HDF4",
                units="Kelvin",
                crs="Sinusoidal projection",
                authentication_required=True,
                auth_note="Free NASA Earthdata credentials required",
                integration_status="active",
                data_status="METADATA_ONLY",
            ),
            Dataset(
                id="emit_minerals",
                name="EMIT Surface Mineral Dust",
                provider="NASA JPL / Earthdata",
                dataset_type="Earth mineral mapping",
                url="https://earth.jpl.nasa.gov/emit/",
                spatial_resolution="60 m",
                coverage="Arid and semi-arid regions",
                format="NetCDF",
                units="Reflectance / mineral abundance",
                crs="UTM / WGS84",
                authentication_required=True,
                auth_note="Free NASA Earthdata account required",
                integration_status="active",
                data_status="METADATA_ONLY",
            ),
        ]
        db.add_all(datasets)
        db.flush()

        # 5. Seed Demonstration Measurements
        measurements = [
            Measurement(
                id="meas_atacama_elev",
                candidate_site_id="atacama_desert",
                dataset_id="srtm_dem",
                parameter_name="elevation",
                numerical_value=2400.0,
                units="meters",
                spatial_resolution="30m",
                crs="EPSG:4326",
                uncertainty=5.0,
                notes="SRTM 1 arc-second tile central pixel elevation",
            ),
            Measurement(
                id="meas_jezero_elev",
                reference_region_id="jezero_crater",
                dataset_id="mola_dem",
                parameter_name="elevation",
                numerical_value=-2500.0,
                units="meters",
                spatial_resolution="463m",
                crs="EPSG:49900",
                uncertainty=1.0,
                notes="MOLA PEDR orbital altimetry track intersection",
            ),
        ]
        db.add_all(measurements)

        # 6. Seed Demo Researcher User
        admin_user = User(
            id="user_researcher_01",
            email="researcher@nasaspaceapps.org",
            hashed_password="demo_hashed_password_for_testing",
            full_name="Lead Planetary Scientist",
            role="researcher",
            organization="Planetary Analogs Research Group",
            is_active=True,
        )
        db.add(admin_user)

        db.commit()
        print("Database initialized and seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_db()

