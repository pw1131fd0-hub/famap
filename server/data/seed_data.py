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
        "phoneNumber": "02-2700-8600",
        "publicTransit": {
            "nearestMRT": {"line": "信義線", "station": "大安站", "distance": 300},
            "busLines": ["15", "235", "240", "278"]
        },
        "parking": {"available": True, "cost": "每小時40元", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": False,
        "allergens": {"commonAllergens": []},
        "crowding": {
            "quietHours": "平日上午9-11點",
            "peakHours": "週末下午2-6點",
            "averageCrowding": "moderate"
        },
        "nursingAmenities": {
            "hasDedicatedArea": True,
            "hasChangingTable": True,
            "hasPowerOutlet": True,
            "hasRefrigerator": False,
            "hasWarmWater": False
        },
        "weatherCoverage": {
            "isIndoor": False,
            "hasRoof": False,
            "hasShade": True,
            "weatherProtection": "樹蔭覆蓋，下雨時人煙稀少"
        },
        "nearbyAmenities": {
            "convenientStores": 5,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "信義線大安站 300m"
        }
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
        "phoneNumber": "02-2833-6666",
        "publicTransit": {
            "nearestMRT": {"line": "淡水線", "station": "劍潭站", "distance": 500},
            "busLines": ["255", "260", "303", "325"]
        },
        "parking": {"available": True, "cost": "每小時40-80元", "hasValidation": True},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "allergens": {"commonAllergens": []},
        "crowding": {
            "quietHours": "平日下午1-3點",
            "peakHours": "週末全天，特別是假日",
            "averageCrowding": "heavy"
        },
        "nursingAmenities": {
            "hasDedicatedArea": True,
            "hasChangingTable": True,
            "hasPowerOutlet": True,
            "hasRefrigerator": True,
            "hasWarmWater": True
        },
        "weatherCoverage": {
            "isIndoor": False,
            "hasRoof": True,
            "hasShade": True,
            "weatherProtection": "部分設施有遮蔽，室內館也有"
        },
        "nearbyAmenities": {
            "convenientStores": 8,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "淡水線劍潭站 500m"
        }
    },
    {
        "id": "3",
        "name": {"zh": "國立臺灣博物館", "en": "National Taiwan Museum"},
        "description": {
            "zh": "日治時期建築，有適合兒童的自然生態展示區。",
            "en": "Japanese colonial era building with natural ecology exhibits for children.",
        },
        "category": "attraction",
        "coordinates": {"lat": 25.0428, "lng": 121.5148},
        "address": {
            "zh": "台北市中正區襄陽路2號",
            "en": "No. 2, Xiangyang Rd., Zhongzheng Dist., Taipei",
        },
        "facilities": ["stroller_accessible", "nursing_room"],
        "averageRating": 4.5,
        "phoneNumber": "02-2382-2566",
        "publicTransit": {
            "nearestMRT": {"line": "紅線", "station": "台大醫院站", "distance": 200},
            "busLines": ["1", "3", "15", "227"]
        },
        "parking": {"available": True, "cost": "每小時40元", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": False},
        "hasWiFi": True,
        "allergens": {"commonAllergens": []},
        "crowding": {
            "quietHours": "平日上午10-12點",
            "peakHours": "週末下午3-5點",
            "averageCrowding": "light"
        },
        "nursingAmenities": {
            "hasDedicatedArea": False,
            "hasChangingTable": False,
            "hasPowerOutlet": False,
            "hasRefrigerator": False,
            "hasWarmWater": False
        },
        "weatherCoverage": {
            "isIndoor": True,
            "hasRoof": True,
            "hasShade": True,
            "weatherProtection": "室內展廳，完全不受天候影響"
        },
        "nearbyAmenities": {
            "convenientStores": 10,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "紅線台大醫院站 200m"
        }
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
        "phoneNumber": "02-8789-5555",
        "publicTransit": {
            "nearestMRT": {"line": "信義線", "station": "信義安和站", "distance": 150},
            "busLines": ["46", "207", "297"]
        },
        "parking": {"available": True, "cost": "消費滿額可折抵", "hasValidation": True},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "allergens": {"commonAllergens": ["milk", "eggs", "peanuts"]},
        "crowding": {
            "quietHours": "平日上午11點-下午1點",
            "peakHours": "週末中午11-1點，下午3-6點",
            "averageCrowding": "moderate"
        },
        "nursingAmenities": {
            "hasDedicatedArea": True,
            "hasChangingTable": True,
            "hasPowerOutlet": True,
            "hasRefrigerator": True,
            "hasWarmWater": True
        },
        "weatherCoverage": {
            "isIndoor": True,
            "hasRoof": True,
            "hasShade": True,
            "weatherProtection": "完全室內，可舒適進餐"
        },
        "nearbyAmenities": {
            "convenientStores": 12,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "信義線信義安和站 150m"
        }
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

