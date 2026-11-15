"""
TerraTwin Backend Application
==============================
Earth-Moon-Mars Analog Discovery & Research Platform

NASA Space Apps Challenge
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.init_db import init_db
from app.api.routes import health, planets, regions, sites, datasets, analysis, discovery, rankings, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables and initial demonstration data exist
    init_db()
    yield


app = FastAPI(
    title="TerraTwin API",
    description=(
        "Earth-Moon-Mars Analog Discovery & Research Platform\n\n"
        "Provides endpoints for discovering, comparing, and ranking terrestrial "
        "analog environments that share measurable characteristics with selected "
        "regions of the Moon and Mars.\n\n"
        "**Data Notice:** All endpoints clearly label whether data is real "
        "scientific data or demonstration/sample data."
    ),
    version="1.0.0",
    contact={"name": "TerraTwin Team", "url": "https://github.com/terratwin"},
    license_info={"name": "MIT"},
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─────────────────────────────────────────────
# CORS – allow the React frontend to call the API
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Routers
# ─────────────────────────────────────────────
app.include_router(health.router,    tags=["Health"])
app.include_router(planets.router,   prefix="/api", tags=["Planets"])
app.include_router(regions.router,   prefix="/api", tags=["Reference Regions"])
app.include_router(sites.router,     prefix="/api", tags=["Candidate Sites"])
app.include_router(datasets.router,  prefix="/api", tags=["Datasets"])
app.include_router(discovery.router, prefix="/api", tags=["Discovery"])
app.include_router(analysis.router,  prefix="/api", tags=["Analysis"])
app.include_router(rankings.router,  prefix="/api", tags=["Rankings"])
app.include_router(reports.router,   prefix="/api", tags=["Reports"])


# ─────────────────────────────────────────────
# Root endpoint
# ─────────────────────────────────────────────
@app.get("/", tags=["Root"])
def root():
    """TerraTwin API root – confirms the service is running."""
    return {
        "project": "TerraTwin",
        "title": "Earth-Moon-Mars Analog Discovery & Research Platform",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.APP_ENV,
        "database": "SQLite (Development) / PostGIS Architecture Ready",
        "docs": "/docs",
        "health": "/api/health",
        "notice": "NASA Space Apps Challenge project",
    }
