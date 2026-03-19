import urllib.request
import urllib.parse
import json
import uuid

def fetch_osm_data():
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = """
    [out:json][timeout:25];
    (
      node["leisure"="park"](24.96,121.45,25.20,121.65);
      node["leisure"="playground"](24.96,121.45,25.20,121.65);
      node["amenity"="nursing_room"](24.96,121.45,25.20,121.65);
      node["amenity"="toilets"]["changing_table"="yes"](24.96,121.45,25.20,121.65);
    );
    out body;
    >;
    out skel qt;
    """
    
    print("Fetching data from OSM Overpass API...")
    try:
        data = urllib.parse.urlencode({'data': overpass_query}).encode('utf-8')
        req = urllib.request.Request(overpass_url, data=data)
        
        with urllib.request.urlopen(req, timeout=30.0) as response:
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
                    "address": {"zh": "台北市", "en": "Taipei City"},
                    "facilities": facilities,
                    "averageRating": 4.0
                }
                locations.append(loc)
        
        print(f"Collected {len(locations)} locations.")
        return locations
    except Exception as e:
        print(f"Error fetching data: {e}")
        return []

if __name__ == "__main__":
    locations = fetch_osm_data()
    if locations:
        with open('server/data/osm_locations.json', 'w', encoding='utf-8') as f:
            json.dump(locations, f, ensure_ascii=False, indent=2)
        print("Saved to server/data/osm_locations.json")