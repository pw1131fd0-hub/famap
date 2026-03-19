import sys
import os
import time
import asyncio

# Add the server directory to Python path
sys.path.insert(0, '/home/crawd_user/project/famap/server')

from data.auto_collect import fetch_osm_data, save_locations

async def collect_all():
    # Split Taipei into 4 quadrants
    # (24.96,121.45,25.20,121.65)
    lat_mid = (24.96 + 25.20) / 2
    lng_mid = (121.45 + 121.65) / 2
    
    quadrants = [
        (24.96, 121.45, lat_mid, lng_mid),      # SW
        (lat_mid, 121.45, 25.20, lng_mid),      # NW
        (24.96, lng_mid, lat_mid, 121.65),      # SE
        (lat_mid, lng_mid, 25.20, 121.65),      # NE
    ]
    
    for bbox in quadrants:
        print(f"Collecting quadrant: {bbox}")
        center_lat = (bbox[0] + bbox[2]) / 2
        center_lng = (bbox[1] + bbox[3]) / 2
        radius = 5000 
        
        locations = await fetch_osm_data(center_lat, center_lng, radius)
        if locations:
            save_locations(locations)
        await asyncio.sleep(2) 

if __name__ == "__main__":
    asyncio.run(collect_all())
