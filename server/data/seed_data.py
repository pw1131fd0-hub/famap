from typing import List, Dict, Any
import json
import os

mock_users: List[Dict[str, Any]] = [
    {
        "id": "u1",
        "email": "mom@example.com",
        "passwordHash": "hashed_password_1",
        "displayName": "小明媽",
        "createdAt": "2026-01-01T00:00:00Z",
    },
]

mock_locations: List[Dict[str, Any]] = [
    {
        "id": "1",
        "name": {"zh": "大安森林公園", "en": "Daan Forest Park"},
        "description": {
            "zh": "台北市中心最大的森林公園，有大型兒童遊戲場和沙坑。",
            "en": "The largest forest park in Taipei with a large playground and sandbox.",
        },
        "category": "park",
        "coordinates": {"lat": 25.0312, "lng": 121.5361},
        "address": {
            "zh": "台北市大安區新生南路二段1號",
            "en": "No. 1, Sec. 2, Xinsheng S. Rd., Daan Dist., Taipei",
        },
        "facilities": ["stroller_accessible", "nursing_room", "public_toilet"],
        "averageRating": 4.8,
    },
    {
        "id": "2",
        "name": {"zh": "台北市兒童新樂園", "en": "Taipei Children's Amusement Park"},
        "description": {
            "zh": "專為兒童設計的主題樂園，設施豐富。",
            "en": "A theme park designed specifically for children with many attractions.",
        },
        "category": "park",
        "coordinates": {"lat": 25.0970, "lng": 121.5147},
        "address": {
            "zh": "台北市士林區承德路五段55號",
            "en": "No. 55, Sec. 5, Chengde Rd., Shilin Dist., Taipei",
        },
        "facilities": ["stroller_accessible", "nursing_room", "high_chair"],
        "averageRating": 4.7,
    },
    {
        "id": "3",
        "name": {"zh": "國立臺灣博物館", "en": "National Taiwan Museum"},
        "description": {
            "zh": "日治時期建築，有適合兒童的自然生態展示區。",
            "en": "Japanese colonial era building with natural ecology exhibits for children.",
        },
        "category": "medical",
        "coordinates": {"lat": 25.0428, "lng": 121.5148},
        "address": {
            "zh": "台北市中正區襄陽路2號",
            "en": "No. 2, Xiangyang Rd., Zhongzheng Dist., Taipei",
        },
        "facilities": ["stroller_accessible", "nursing_room"],
        "averageRating": 4.5,
    },
    {
        "id": "4",
        "name": {"zh": "親子餐廳範例", "en": "Kids Friendly Restaurant"},
        "description": {
            "zh": "提供室內遊戲室和兒童餐。",
            "en": "Offers indoor playground and kids menu.",
        },
        "category": "restaurant",
        "coordinates": {"lat": 25.0330, "lng": 121.5654},
        "address": {"zh": "台北市信義區", "en": "Xinyi Dist., Taipei"},
        "facilities": ["high_chair", "nursing_room"],
        "averageRating": 4.2,
    },
]

mock_reviews: List[Dict[str, Any]] = [
    {
        "id": "101",
        "locationId": "1",
        "userId": "u1",
        "userName": "小明媽",
        "rating": 5,
        "comment": "空間很大，非常適合小孩跑跳！",
        "createdAt": "2026-03-01T10:00:00Z",
    },
    {
        "id": "102",
        "locationId": "1",
        "userId": "u2",
        "userName": "Mike",
        "rating": 4,
        "comment": "Nice place but can be crowded on weekends.",
        "createdAt": "2026-03-05T14:30:00Z",
    },
    {
        "id": "103",
        "locationId": "2",
        "userId": "u3",
        "userName": "小美爸",
        "rating": 5,
        "comment": "設施很多，小朋友玩得很開心。",
        "createdAt": "2026-03-10T09:15:00Z",
    },
]

mock_favorites: List[Dict[str, Any]] = []

# Load automatically collected OSM data if available
osm_data_path = os.path.join(os.path.dirname(__file__), 'osm_locations.json')
if os.path.exists(osm_data_path):
    try:
        with open(osm_data_path, 'r', encoding='utf-8') as f:
            osm_locations = json.load(f)
            mock_locations.extend(osm_locations)
    except Exception as e:
        print(f"Failed to load osm_locations.json: {e}")

