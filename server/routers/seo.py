"""
SEO and Content Discovery Routes
Includes sitemap generation, robots.txt, and OpenAPI documentation
"""

from fastapi import APIRouter, Response
from fastapi.responses import PlainTextResponse
from datetime import datetime, UTC
from data.seed_data import mock_locations

router = APIRouter()

BASE_URL = "https://fammap.tw"  # Should be configurable


@router.get("/sitemap.xml", response_class=Response)
async def sitemap():
    """
    Generate XML sitemap for SEO
    Includes homepage and all location pages
    """
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
    xml_content += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'

    # Homepage
    xml_content += f"""  <url>
    <loc>{BASE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
"""

    # Location pages
    for location in mock_locations:
        xml_content += f"""  <url>
    <loc>{BASE_URL}/location/{location['id']}</loc>
    <lastmod>{datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%SZ')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
"""

    xml_content += '</urlset>'

    return Response(content=xml_content, media_type="application/xml")


@router.get("/robots.txt", response_class=PlainTextResponse)
async def robots_txt():
    """
    Generate robots.txt for search engine crawlers
    """
    robots_content = """# FamMap Robots Configuration
User-agent: *
Allow: /
Allow: /sitemap.xml
Allow: /api/locations
Allow: /location/

# Disallow admin and sensitive areas
Disallow: /admin/
Disallow: /private/
Disallow: /.well-known/

# Crawl-delay to be respectful
Crawl-delay: 1

# Sitemap location
Sitemap: https://fammap.tw/sitemap.xml
Sitemap: https://fammap.tw/api/sitemaps/locations.xml

# Block bad bots
User-agent: MJ12bot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /
"""
    return robots_content


@router.get("/.well-known/security.txt", response_class=PlainTextResponse)
async def security_txt():
    """
    Security.txt for responsible disclosure
    """
    security_content = """Contact: security@fammap.tw
Expires: 2027-03-24T00:00:00Z
Preferred-Languages: en,zh
Canonical: https://fammap.tw/.well-known/security.txt
"""
    return security_content


@router.get("/api/sitemaps/locations.xml", response_class=Response)
async def locations_sitemap():
    """
    Location-specific sitemap for better SEO
    """
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    for location in mock_locations:
        xml_content += f"""  <url>
    <loc>{BASE_URL}/location/{location['id']}</loc>
    <lastmod>{datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%SZ')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
"""

    xml_content += '</urlset>'

    return Response(content=xml_content, media_type="application/xml")


@router.get("/api/schema/faq.json")
async def faq_schema():
    """
    JSON-LD FAQ schema for featured snippets
    """
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is FamMap?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "FamMap is a family-friendly location discovery platform in Taiwan that helps parents find nursing rooms, playgrounds, restaurants with high chairs, and other family-friendly facilities."
                }
            },
            {
                "@type": "Question",
                "name": "How do I find a nursing room near me?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Use the search feature in FamMap to filter by 'nursing rooms' or 'facilities' and the app will show nearby options based on your location."
                }
            },
            {
                "@type": "Question",
                "name": "Can I add new locations to FamMap?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, registered users can add new locations and facilities to help other families discover great spots."
                }
            },
            {
                "@type": "Question",
                "name": "Is FamMap available offline?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, FamMap is a Progressive Web App and supports offline mode with previously viewed locations cached on your device."
                }
            }
        ]
    }


@router.get("/api/schema/organization.json")
async def organization_schema():
    """
    Organization schema for brand recognition
    """
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "FamMap",
        "alternateName": "親子地圖",
        "url": BASE_URL,
        "logo": f"{BASE_URL}/logo.png",
        "description": "Taiwan's premier family-friendly location discovery platform",
        "areaServed": "TW",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+886-2-xxxx-xxxx",
            "contactType": "Customer Service"
        },
        "sameAs": [
            "https://facebook.com/fammap",
            "https://instagram.com/fammap",
            "https://twitter.com/fammap"
        ]
    }
