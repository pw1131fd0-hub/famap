"""Shared pytest fixtures for server tests."""
import sys
import os
import pytest

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(autouse=True)
def reset_helpful_votes():
    """Reset the in-memory helpful votes state before each test to prevent cross-test contamination."""
    try:
        from routers.review import _helpful_votes
        _helpful_votes.clear()
    except ImportError:
        pass
    yield
    try:
        from routers.review import _helpful_votes
        _helpful_votes.clear()
    except ImportError:
        pass
