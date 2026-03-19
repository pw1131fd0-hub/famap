import urllib.request
import urllib.parse
import json
import uuid

def fetch_osm_data(lat=None, lng=None, radius=None):
    if lat is None or lng is None or radius is None:
        bbox = "(24.96,121.45,25.20,121.65)"
    else:
        # Approximate degrees for bounding box based on radius in meters
        lat_offset = radius / 111000.0
        lng_offset = radius / (111000.0 * 0.9)
        bbox = f"({lat - lat_offset},{lng - lng_offset},{lat + lat_offset},{lng + lng_offset})"

    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json][timeout:25];
    (
      node["leisure"="park"]{bbox};
      node["leisure"="playground"]{bbox};
      node["amenity"="nursing_room"]{bbox};
      node["amenity"="toilets"]["changing_table"="yes"]{bbox};
    );
    out body;
    >;
    out skel qt;
    """
    
    print(f"Fetching data from OSM Overpass API for bbox {bbox}...")
    try:
        data = urllib.parse.urlencode({'data': overpass_query}).encode('utf-8')
        req = urllib.request.Request(overpass_url, data=data, headers={'User-Agent': 'FamMap/1.0 (Contact: admin@fammap.local)'})
        
        with urllib.request.urlopen(req, timeout=15.0) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        locations = []
        for element in result.get('elements', []):
            if element['type'] == 'node':
                tags = element.get('tags', {})
                name_zh = tags.get('name:zh', tags.get('name', '未命名地點'))
                name_en = tags.get('name:en', 'Unnamed Location')
                
                # Determine category
                if tags.get('leisure') == 'park':
                    category = 'park'
                    facilities = ['stroller_accessible', 'public_toilet']
                elif tags.get('leisure') == 'playground':
                    category = 'park'
                    facilities = ['stroller_accessible', 'high_chair']
                elif tags.get('amenity') == 'nursing_room' or tags.get('changing_table') == 'yes':
                    category = 'nursing_room'
                    facilities = ['nursing_room', 'changing_table']
                    if name_zh == '未命名地點':
                        name_zh = '哺乳室 / 尿布台'
                        name_en = 'Nursing Room / Changing Table'
                else:
                    category = 'other'
                    facilities = []
                
                # Exclude if no meaningful name and not a nursing room
                if name_zh == '未命名地點' and category != 'nursing_room':
                    continue
                
                loc = {
                    "id": str(uuid.uuid4()),
                    "name": {"zh": name_zh, "en": name_en},
                    "description": {
                        "zh": f"來自 OSM 的自動收集資料 - {category}",
                        "en": f"Automatically collected data from OSM - {category}"
                    },
                    "category": category,
                    "coordinates": {"lat": element['lat'], "lng": element['lon']},
                    "address": {"zh": "未知地址", "en": "Unknown Address"},
                    "facilities": facilities,
                    "averageRating": 4.0
                }
                locations.append(loc)
        
        print(f"Collected {len(locations)} locations from OSM.")
        if len(locations) == 0:
            raise Exception("Empty result from OSM")
        return locations
    except Exception as e:
        print(f"Error fetching data from OSM: {e}")
        # Generate simulated data based on location to ensure there are ALWAYS points
        print("Generating fallback locations dynamically due to OSM failure or no data...")
        import random
        fallback_locations = []
        if lat is not None and lng is not None and radius is not None:
            categories = ['park', 'nursing_room', 'restaurant', 'medical']
            for i in range(5):
                cat = random.choice(categories)
                facilities = []
                if cat == 'park': facilities = ['stroller_accessible']
                elif cat == 'nursing_room': facilities = ['nursing_room', 'changing_table']
                elif cat == 'restaurant': facilities = ['high_chair', 'stroller_accessible']
                
                offset_lat = (random.random() - 0.5) * (radius / 111000.0)
                offset_lng = (random.random() - 0.5) * (radius / 111000.0)
                
                loc = {
                    "id": str(uuid.uuid4()),
                    "name": {"zh": f"模擬{cat} {i}", "en": f"Simulated {cat} {i}"},
                    "description": {"zh": "這是在自動收集失敗時生成的模擬資料。", "en": "Generated fallback data."},
                    "category": cat,
                    "coordinates": {"lat": lat + offset_lat, "lng": lng + offset_lng},
                    "address": {"zh": "模擬地址", "en": "Simulated Address"},
                    "facilities": facilities,
                    "averageRating": round(random.uniform(3.5, 5.0), 1)
                }
                fallback_locations.append(loc)
        return fallback_locations

if __name__ == "__main__":
    locations = fetch_osm_data()
    if locations:
        with open('server/data/osm_locations.json', 'w', encoding='utf-8') as f:
            json.dump(locations, f, ensure_ascii=False, indent=2)
        print("Saved to server/data/osm_locations.json")