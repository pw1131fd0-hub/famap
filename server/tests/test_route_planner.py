"""Tests for route planning functionality"""

import pytest
from routers.route_planner import (
    haversine_distance,
    estimate_travel_time,
    LocationStop,
    nearest_neighbor_tsp
)


class TestHaversineDistance:
    """Test Haversine distance calculation"""

    def test_distance_same_point(self):
        """Distance between same point should be 0"""
        distance = haversine_distance(25.0330, 121.5654, 25.0330, 121.5654)
        assert distance < 0.01  # Allow for floating point errors

    def test_distance_taipei_to_nearby(self):
        """Test distance calculation for Taipei to nearby location"""
        # Taipei to a point ~1km away
        distance = haversine_distance(25.0330, 121.5654, 25.0430, 121.5654)
        assert 1 < distance < 1.2  # Should be approximately 1 km

    def test_distance_symmetry(self):
        """Distance from A to B should equal B to A"""
        dist_ab = haversine_distance(25.0, 121.5, 25.1, 121.6)
        dist_ba = haversine_distance(25.1, 121.6, 25.0, 121.5)
        assert abs(dist_ab - dist_ba) < 0.001


class TestTravelTimeEstimate:
    """Test travel time estimation"""

    def test_zero_distance(self):
        """Zero distance should give minimum time"""
        time = estimate_travel_time(0)
        assert time == 5  # Minimum 5 minutes

    def test_time_calculation(self):
        """Test time calculation for known distances"""
        # 30 km at 30 km/h = 60 minutes
        time = estimate_travel_time(30)
        assert time == 60

    def test_short_distance(self):
        """Short distances should have minimum time buffer"""
        time = estimate_travel_time(0.5)
        assert time >= 5


class TestLocationStop:
    """Test LocationStop class"""

    def test_location_stop_creation(self):
        """Test creating a location stop"""
        stop = LocationStop("loc1", 25.0330, 121.5654, "Test Location")
        assert stop.location_id == "loc1"
        assert stop.lat == 25.0330
        assert stop.lng == 121.5654
        assert stop.name == "Test Location"

    def test_distance_between_stops(self):
        """Test distance calculation between stops"""
        stop1 = LocationStop("loc1", 25.0330, 121.5654, "Location 1")
        stop2 = LocationStop("loc2", 25.0430, 121.5654, "Location 2")
        distance = stop1.distance_to(stop2)
        assert 1 < distance < 1.2


class TestNearestNeighborTSP:
    """Test TSP solving with nearest neighbor"""

    def test_empty_locations(self):
        """Nearest neighbor with empty locations should return empty"""
        start = LocationStop("start", 25.0330, 121.5654, "Start")
        result = nearest_neighbor_tsp(start, [])
        assert result == []

    def test_single_location(self):
        """Nearest neighbor with single location"""
        start = LocationStop("start", 25.0330, 121.5654, "Start")
        loc1 = LocationStop("loc1", 25.0430, 121.5654, "Location 1")
        result = nearest_neighbor_tsp(start, [loc1])
        # Result includes start and the location
        assert len(result) == 2
        assert result[1].location_id == "loc1"

    def test_multiple_locations(self):
        """Nearest neighbor should return all locations"""
        start = LocationStop("start", 25.0330, 121.5654, "Start")
        loc1 = LocationStop("loc1", 25.0430, 121.5654, "Location 1")
        loc2 = LocationStop("loc2", 25.0530, 121.5754, "Location 2")
        loc3 = LocationStop("loc3", 25.0630, 121.5854, "Location 3")

        result = nearest_neighbor_tsp(start, [loc1, loc2, loc3])
        # Result includes start and all locations
        assert len(result) == 4
        location_ids = {stop.location_id for stop in result[1:]}
        assert location_ids == {"loc1", "loc2", "loc3"}


class TestEstimateTravelTime:
    """Additional tests for travel time estimation"""

    def test_travel_time_15km(self):
        """Test travel time for 15km"""
        time = estimate_travel_time(15)
        # 15 km at 30 km/h = 30 minutes
        assert time == 30

    def test_travel_time_60km(self):
        """Test travel time for 60km"""
        time = estimate_travel_time(60)
        # 60 km at 30 km/h = 120 minutes
        assert time == 120
