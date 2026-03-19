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
      node["leisure"~"park|playground|nature_reserve|recreation_ground"]{bbox};
      way["leisure"~"park|playground|nature_reserve|recreation_ground"]{bbox};
      relation["leisure"~"park|playground|nature_reserve|recreation_ground"]{bbox};
      
      node["amenity"~"nursing_room|kindergarten|school|childcare"]{bbox};
      way["amenity"~"nursing_room|kindergarten|school|childcare"]{bbox};
      
      node["amenity"~"restaurant|cafe"]["high_chair"="yes"]{bbox};
      way["amenity"~"restaurant|cafe"]["high_chair"="yes"]{bbox};
      
      node["amenity"="toilets"]["changing_table"="yes"]{bbox};
      way["amenity"="toilets"]["changing_table"="yes"]{bbox};
    );
    out center;
    """
    
    print(f"Fetching data from OSM Overpass API for bbox {bbox}...")
    try:
        data = urllib.parse.urlencode({'data': overpass_query}).encode('utf-8')
        req = urllib.request.Request(overpass_url, data=data, headers={'User-Agent': 'FamMap/1.0 (Contact: admin@fammap.local)'})
        
        with urllib.request.urlopen(req, timeout=15.0) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        locations = []
        for element in result.get('elements', []):
            tags = element.get('tags', {})
            # Get coordinates from either 'lat'/'lon' or 'center'
            if 'lat' in element and 'lon' in element:
                lat_val = element['lat']
                lng_val = element['lon']
            elif 'center' in element:
                lat_val = element['center']['lat']
                lng_val = element['center']['lon']
            else:
                continue

            name_zh = tags.get('name:zh', tags.get('name', '未命名地點'))
            name_en = tags.get('name:en', 'Unnamed Location')
            
            # Determine category
            leisure = tags.get('leisure')
            amenity = tags.get('amenity')
            
            if leisure in ['park', 'playground', 'nature_reserve', 'recreation_ground']:
                category = 'park'
                facilities = ['stroller_accessible']
                if leisure == 'park': facilities.append('public_toilet')
                if leisure == 'playground': facilities.append('high_chair')
            elif amenity in ['nursing_room', 'toilets', 'childcare'] or tags.get('changing_table') == 'yes':
                category = 'nursing_room'
                facilities = ['nursing_room', 'changing_table']
                if name_zh == '未命名地點':
                    name_zh = '哺乳室 / 尿布台'
                    name_en = 'Nursing Room / Changing Table'
            elif amenity in ['restaurant', 'cafe']:
                category = 'restaurant'
                facilities = ['high_chair', 'stroller_accessible']
            elif amenity in ['school', 'kindergarten']:
                category = 'medical' # Using medical as a placeholder for 'care/educational' for now
                facilities = ['stroller_accessible']
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
                "coordinates": {"lat": lat_val, "lng": lng_val},
                "address": {"zh": tags.get('addr:full', "未知地址"), "en": tags.get('addr:full:en', "Unknown Address")},
                "facilities": facilities,
                "averageRating": 4.0
            }
            locations.append(loc)
        
        print(f"Collected {len(locations)} locations from OSM.")
        if len(locations) == 0:
            # If no results from OSM, we don't necessarily want to raise an exception here
            # as the caller might want to handle it.
            pass
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

def save_locations(locations):
    if not locations:
        return
    
    file_path = os.path.join(os.path.dirname(__file__), 'osm_locations.json')
    existing_locations = []
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                existing_locations = json.load(f)
        except Exception as e:
            print(f"Error reading existing locations: {e}")
    
    # Simple de-duplication based on coordinates (rounded)
    def get_coord_key(loc):
        return (round(loc['coordinates']['lat'], 5), round(loc['coordinates']['lng'], 5))
    
    existing_keys = {get_coord_key(loc) for loc in existing_locations}
    
    new_count = 0
    for loc in locations:
        if '模擬' in loc['name']['zh']: # Don't save simulated data
            continue
        key = get_coord_key(loc)
        if key not in existing_keys:
            existing_locations.append(loc)
            existing_keys.add(key)
            new_count += 1
    
    if new_count > 0:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(existing_locations, f, ensure_ascii=False, indent=2)
            print(f"Saved {new_count} new locations to {file_path}")
        except Exception as e:
            print(f"Error saving locations: {e}")

import os
if __name__ == "__main__":
    locations = fetch_osm_data()
    if locations:
        save_locations(locations)