"""
Tests for SEO/content discovery endpoints.
Covers sitemap, robots.txt, security.txt, and JSON-LD schema endpoints.
"""

from fastapi.testclient import TestClient
import pytest
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from main import app
    from data.seed_data import mock_locations
except ImportError:
    from server.main import app
    from server.data.seed_data import mock_locations

client = TestClient(app)


class TestSitemap:
    """Tests for sitemap.xml endpoint"""

    def test_sitemap_returns_200(self):
        """Sitemap should return 200 OK"""
        response = client.get("/sitemap.xml")
        assert response.status_code == 200

    def test_sitemap_content_type(self):
        """Sitemap should return XML content type"""
        response = client.get("/sitemap.xml")
        assert "xml" in response.headers.get("content-type", "")

    def test_sitemap_valid_xml(self):
        """Sitemap should be valid XML"""
        response = client.get("/sitemap.xml")
        content = response.text
        assert '<?xml version="1.0"' in content
        assert '<urlset' in content
        assert '</urlset>' in content

    def test_sitemap_includes_homepage(self):
        """Sitemap should include the homepage URL"""
        response = client.get("/sitemap.xml")
        content = response.text
        assert "fammap.tw" in content

    def test_sitemap_includes_locations(self):
        """Sitemap should include location URLs"""
        response = client.get("/sitemap.xml")
        content = response.text
        if mock_locations:
            loc_id = mock_locations[0]["id"]
            assert loc_id in content

    def test_sitemap_url_structure(self):
        """Each URL in sitemap should have loc, changefreq, priority"""
        response = client.get("/sitemap.xml")
        content = response.text
        assert "<loc>" in content
        assert "<changefreq>" in content
        assert "<priority>" in content


class TestRobotsTxt:
    """Tests for robots.txt endpoint"""

    def test_robots_returns_200(self):
        """robots.txt should return 200 OK"""
        response = client.get("/robots.txt")
        assert response.status_code == 200

    def test_robots_content_type(self):
        """robots.txt should return plain text"""
        response = client.get("/robots.txt")
        assert "text/plain" in response.headers.get("content-type", "")

    def test_robots_has_user_agent(self):
        """robots.txt should have User-agent directive"""
        response = client.get("/robots.txt")
        assert "User-agent:" in response.text

    def test_robots_has_sitemap_reference(self):
        """robots.txt should reference the sitemap"""
        response = client.get("/robots.txt")
        assert "Sitemap:" in response.text
        assert "sitemap.xml" in response.text

    def test_robots_disallows_admin(self):
        """robots.txt should disallow admin area"""
        response = client.get("/robots.txt")
        assert "Disallow: /admin/" in response.text

    def test_robots_allows_api_locations(self):
        """robots.txt should allow location API"""
        response = client.get("/robots.txt")
        assert "/api/locations" in response.text


class TestSecurityTxt:
    """Tests for /.well-known/security.txt endpoint"""

    def test_security_txt_returns_200(self):
        """security.txt should return 200 OK"""
        response = client.get("/.well-known/security.txt")
        assert response.status_code == 200

    def test_security_txt_has_contact(self):
        """security.txt should have Contact field"""
        response = client.get("/.well-known/security.txt")
        assert "Contact:" in response.text

    def test_security_txt_has_expires(self):
        """security.txt should have Expires field"""
        response = client.get("/.well-known/security.txt")
        assert "Expires:" in response.text


class TestLocationsSitemap:
    """Tests for /api/sitemaps/locations.xml endpoint"""

    def test_locations_sitemap_returns_200(self):
        """Locations sitemap should return 200"""
        response = client.get("/api/sitemaps/locations.xml")
        assert response.status_code == 200

    def test_locations_sitemap_is_xml(self):
        """Locations sitemap should be valid XML"""
        response = client.get("/api/sitemaps/locations.xml")
        content = response.text
        assert '<?xml version="1.0"' in content
        assert '<urlset' in content
        assert '</urlset>' in content

    def test_locations_sitemap_has_location_urls(self):
        """Locations sitemap should include all locations"""
        response = client.get("/api/sitemaps/locations.xml")
        content = response.text
        if mock_locations:
            for loc in mock_locations[:3]:  # Check first 3
                assert loc["id"] in content


class TestFaqSchema:
    """Tests for /api/schema/faq.json endpoint"""

    def test_faq_schema_returns_200(self):
        """FAQ schema should return 200 OK"""
        response = client.get("/api/schema/faq.json")
        assert response.status_code == 200

    def test_faq_schema_structure(self):
        """FAQ schema should have proper JSON-LD structure"""
        response = client.get("/api/schema/faq.json")
        data = response.json()
        assert data["@context"] == "https://schema.org"
        assert data["@type"] == "FAQPage"
        assert "mainEntity" in data

    def test_faq_schema_has_questions(self):
        """FAQ schema should contain questions"""
        response = client.get("/api/schema/faq.json")
        data = response.json()
        entities = data["mainEntity"]
        assert len(entities) > 0
        for entity in entities:
            assert entity["@type"] == "Question"
            assert "name" in entity
            assert "acceptedAnswer" in entity


class TestOrganizationSchema:
    """Tests for /api/schema/organization.json endpoint"""

    def test_org_schema_returns_200(self):
        """Organization schema should return 200 OK"""
        response = client.get("/api/schema/organization.json")
        assert response.status_code == 200

    def test_org_schema_structure(self):
        """Organization schema should have proper structure"""
        response = client.get("/api/schema/organization.json")
        data = response.json()
        assert data["@context"] == "https://schema.org"
        assert data["@type"] == "Organization"
        assert data["name"] == "FamMap"

    def test_org_schema_has_required_fields(self):
        """Organization schema should have all required SEO fields"""
        response = client.get("/api/schema/organization.json")
        data = response.json()
        assert "url" in data
        assert "logo" in data
        assert "description" in data
        assert "areaServed" in data
