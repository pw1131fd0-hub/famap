import sys
import os
import time
import asyncio

# Add the server directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data.auto_collect import fetch_osm_data, save_locations

async def collect_all():
    print("Starting chunked Taipei data collection...")
    # (24.96,121.45,25.20,121.65)
    lat_start, lat_end = 24.96, 25.21
    lng_start, lng_end = 121.45, 121.66
    
    step = 0.03 # Roughly 3km x 3km chunks
    
    lat = lat_start
    while lat < lat_end:
        lng = lng_start
        while lng < lng_end:
            center_lat = lat + step / 2
            center_lng = lng + step / 2
            radius = 3000 # 3km radius covers the chunk
            
            print(f"Collecting chunk near {center_lat:.4f}, {center_lng:.4f}...")
            locations = await fetch_osm_data(center_lat, center_lng, radius)
            if locations:
                # Filter out simulated data if any
                real_locations = [loc for loc in locations if '模擬' not in loc['name']['zh']]
                if real_locations:
                    save_locations(real_locations)
                    print(f"Added {len(real_locations)} real locations.")
            
            lng += step
            await asyncio.sleep(1) # Be nice to Overpass
        lat += step

if __name__ == "__main__":
    asyncio.run(collect_all())