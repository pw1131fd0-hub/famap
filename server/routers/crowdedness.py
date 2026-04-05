"""
Real-time crowdedness reporting via WebSocket and REST endpoints.
Supports live broadcast of crowdedness updates to all connected clients.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Query, Depends
from typing import List, Optional
import json
import uuid
import asyncio
from datetime import datetime, timezone
import sys
sys.path.append('..')
from routers.auth import get_current_user_dep

router = APIRouter()

# In-memory crowdedness reports store
mock_crowdedness_reports: List[dict] = [
    {
        "id": "cr1",
        "locationId": "1",
        "level": "moderate",
        "reportedBy": "u1",
        "timestamp": "2026-04-05T08:00:00Z",
        "comment": "週末早上人不多，停車位還有",
    },
    {
        "id": "cr2",
        "locationId": "2",
        "level": "busy",
        "reportedBy": "u1",
        "timestamp": "2026-04-05T10:30:00Z",
        "comment": "假日人潮多，排隊約20分鐘",
    },
]

VALID_LEVELS = {"quiet", "moderate", "busy", "very_busy"}


class ConnectionManager:
    """Manages active WebSocket connections per location."""

    def __init__(self) -> None:
        # Maps location_id -> list of websockets
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, location_id: str) -> None:
        await websocket.accept()
        if location_id not in self.active_connections:
            self.active_connections[location_id] = []
        self.active_connections[location_id].append(websocket)

    def disconnect(self, websocket: WebSocket, location_id: str) -> None:
        if location_id in self.active_connections:
            self.active_connections[location_id] = [
                ws for ws in self.active_connections[location_id] if ws is not websocket
            ]

    async def broadcast(self, location_id: str, message: dict) -> None:
        """Broadcast a message to all clients watching this location."""
        connections = self.active_connections.get(location_id, [])
        dead = []
        for ws in connections:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, location_id)

    def connection_count(self, location_id: str) -> int:
        return len(self.active_connections.get(location_id, []))


manager = ConnectionManager()


# ---------------------------------------------------------------------------
# WebSocket endpoint
# ---------------------------------------------------------------------------

@router.websocket("/ws/crowdedness/{location_id}")
async def crowdedness_ws(websocket: WebSocket, location_id: str):
    """
    WebSocket endpoint for real-time crowdedness updates.

    Clients connect to receive live broadcasts whenever a new crowdedness
    report is submitted for this location.  On connect, the server sends
    the latest report (if any) so the client can display an initial state.
    """
    await manager.connect(websocket, location_id)
    try:
        # Send current crowdedness snapshot on connect
        recent = [r for r in mock_crowdedness_reports if r["locationId"] == location_id]
        if recent:
            latest = max(recent, key=lambda r: r["timestamp"])
            await websocket.send_text(json.dumps({
                "type": "snapshot",
                "data": latest,
                "connectedClients": manager.connection_count(location_id),
            }))
        else:
            await websocket.send_text(json.dumps({
                "type": "snapshot",
                "data": None,
                "connectedClients": manager.connection_count(location_id),
            }))

        # Keep connection alive; wait for client to disconnect
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30)
            except asyncio.TimeoutError:
                # Send a heartbeat ping
                await websocket.send_text(json.dumps({"type": "ping"}))
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket, location_id)


# ---------------------------------------------------------------------------
# REST endpoints
# ---------------------------------------------------------------------------

@router.get("/crowdedness/{location_id}", tags=["crowdedness"])
async def get_crowdedness(
    location_id: str,
    limit: int = Query(default=10, ge=1, le=50),
):
    """Get recent crowdedness reports for a location (newest first)."""
    reports = [r for r in mock_crowdedness_reports if r["locationId"] == location_id]
    reports_sorted = sorted(reports, key=lambda r: r["timestamp"], reverse=True)
    return reports_sorted[:limit]


@router.post("/crowdedness/{location_id}", tags=["crowdedness"])
async def report_crowdedness(
    location_id: str,
    level: str = Query(..., description="quiet | moderate | busy | very_busy"),
    comment: Optional[str] = Query(default=None, max_length=200),
    current_user: dict = Depends(get_current_user_dep),
):
    """
    Submit a crowdedness report and broadcast it to all WebSocket subscribers.
    """
    if level not in VALID_LEVELS:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid level '{level}'. Must be one of: {sorted(VALID_LEVELS)}",
        )

    report = {
        "id": str(uuid.uuid4()),
        "locationId": location_id,
        "level": level,
        "reportedBy": current_user["id"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "comment": comment or "",
    }
    mock_crowdedness_reports.append(report)

    # Broadcast to all WebSocket subscribers for this location
    await manager.broadcast(location_id, {"type": "update", "data": report})

    return report


@router.get("/crowdedness/{location_id}/summary", tags=["crowdedness"])
async def get_crowdedness_summary(location_id: str):
    """
    Aggregate crowdedness summary: most recent level and a breakdown of
    recent reports (last 20) to show trends.
    """
    reports = [r for r in mock_crowdedness_reports if r["locationId"] == location_id]
    if not reports:
        return {
            "locationId": location_id,
            "currentLevel": None,
            "reportCount": 0,
            "breakdown": {},
            "lastUpdated": None,
        }

    recent = sorted(reports, key=lambda r: r["timestamp"], reverse=True)[:20]
    breakdown: dict[str, int] = {}
    for r in recent:
        breakdown[r["level"]] = breakdown.get(r["level"], 0) + 1

    return {
        "locationId": location_id,
        "currentLevel": recent[0]["level"],
        "reportCount": len(reports),
        "breakdown": breakdown,
        "lastUpdated": recent[0]["timestamp"],
    }
