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
    # === Kaohsiung Locations ===
    {
        "id": "kh1",
        "name": {"zh": "駁二藝術特區", "en": "Pier-2 Art Center"},
        "description": {
            "zh": "高雄港邊的文創藝術園區，有露天廣場、互動裝置及兒童友善空間，週末常有表演活動。",
            "en": "A creative arts district by Kaohsiung Harbor with open plazas, interactive installations, and family-friendly spaces. Weekend performances are common.",
        },
        "category": "attraction",
        "coordinates": {"lat": 22.6269, "lng": 120.2850},
        "address": {
            "zh": "高雄市鹽埕區大勇路1號",
            "en": "No. 1, Dayong Rd., Yancheng Dist., Kaohsiung",
        },
        "facilities": ["stroller_accessible", "public_toilet"],
        "averageRating": 4.7,
        "phoneNumber": "07-521-4899",
        "publicTransit": {
            "nearestMRT": {"line": "橘線", "station": "鹽埕埔站", "distance": 400},
            "busLines": ["60", "99"]
        },
        "parking": {"available": True, "cost": "每小時30元", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "allergens": {"commonAllergens": []},
        "crowding": {
            "quietHours": "平日上午10-12點",
            "peakHours": "週末下午2-5點",
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
            "weatherProtection": "大部分戶外，有倉庫改建室內展區"
        },
        "nearbyAmenities": {
            "convenientStores": 3,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "橘線鹽埕埔站 400m"
        }
    },
    {
        "id": "kh2",
        "name": {"zh": "高雄兒童美術館", "en": "Kaohsiung Museum of Fine Arts - Children's Area"},
        "description": {
            "zh": "設有大面積雕塑公園和兒童藝術教育設施，戶外腹地廣大，孩子可自由奔跑玩耍。",
            "en": "Features a large sculpture park and children's art education facilities. Outdoor space is spacious for kids to run around.",
        },
        "category": "attraction",
        "coordinates": {"lat": 22.6534, "lng": 120.2925},
        "address": {
            "zh": "高雄市鼓山區美術館路80號",
            "en": "No. 80, Museum Rd., Gushan Dist., Kaohsiung",
        },
        "facilities": ["stroller_accessible", "nursing_room", "public_toilet"],
        "averageRating": 4.6,
        "phoneNumber": "07-555-0331",
        "publicTransit": {
            "nearestMRT": {"line": "紅線", "station": "美術館站", "distance": 800},
            "busLines": ["205", "301"]
        },
        "parking": {"available": True, "cost": "免費", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "allergens": {"commonAllergens": []},
        "crowding": {
            "quietHours": "平日開館時間",
            "peakHours": "週末上午10-12點",
            "averageCrowding": "light"
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
            "hasRoof": False,
            "hasShade": True,
            "weatherProtection": "公園有大樹遮蔭，室內展館可避雨"
        },
        "nearbyAmenities": {
            "convenientStores": 2,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "紅線美術館站 800m"
        }
    },
    {
        "id": "kh3",
        "name": {"zh": "高雄夢時代購物中心親子館", "en": "Dream Mall - Family Zone"},
        "description": {
            "zh": "高雄最大購物中心內的親子遊樂區，包含室內遊樂場、哺乳室和兒童餐廳。全天候室內，下雨天首選。",
            "en": "Family zone inside Kaohsiung's largest shopping mall, featuring indoor playground, nursing rooms, and kids' dining. Fully indoors – great for rainy days.",
        },
        "category": "attraction",
        "coordinates": {"lat": 22.6097, "lng": 120.3015},
        "address": {
            "zh": "高雄市前鎮區中華五路789號",
            "en": "No. 789, Zhonghua 5th Rd., Qianzhen Dist., Kaohsiung",
        },
        "facilities": ["stroller_accessible", "nursing_room", "high_chair", "public_toilet"],
        "averageRating": 4.5,
        "phoneNumber": "07-973-3000",
        "publicTransit": {
            "nearestMRT": {"line": "紅線", "station": "凱旋站", "distance": 600},
            "busLines": ["E02", "紅52"]
        },
        "parking": {"available": True, "cost": "前兩小時免費", "hasValidation": True},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "allergens": {"commonAllergens": ["peanuts", "dairy"]},
        "crowding": {
            "quietHours": "平日上午開店時間",
            "peakHours": "週末全天及國定假日",
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
            "isIndoor": True,
            "hasRoof": True,
            "hasShade": True,
            "weatherProtection": "全室內空調，下雨天最佳選擇"
        },
        "nearbyAmenities": {
            "convenientStores": 20,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "紅線凱旋站 600m"
        }
    },
    # === Taichung Locations ===
    {
        "id": "tc1",
        "name": {"zh": "台中兒童藝術節遊戲廣場", "en": "Taichung Children's Art Festival Playground"},
        "description": {
            "zh": "台中市中央公園內的大型兒童遊戲場，設有特色攀爬架、滑梯和噴水廣場，是全台最具特色的兒童公共遊樂設施之一。",
            "en": "A large children's playground inside Taichung Central Park featuring unique climbing structures, slides, and a splash pad. One of Taiwan's most distinctive public playgrounds.",
        },
        "category": "park",
        "coordinates": {"lat": 24.1631, "lng": 120.6469},
        "address": {
            "zh": "台中市西屯區市政北七路100號",
            "en": "No. 100, Shizheng N. 7th Rd., Xitun Dist., Taichung",
        },
        "facilities": ["stroller_accessible", "public_toilet", "nursing_room"],
        "averageRating": 4.8,
        "phoneNumber": "04-2228-9111",
        "publicTransit": {
            "nearestMRT": {"line": "台中捷運綠線", "station": "市政府站", "distance": 500},
            "busLines": ["300", "302", "88"]
        },
        "parking": {"available": True, "cost": "每小時20元", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "allergens": {"commonAllergens": []},
        "crowding": {
            "quietHours": "平日上午9-11點",
            "peakHours": "週末下午1-5點及暑假",
            "averageCrowding": "moderate"
        },
        "nursingAmenities": {
            "hasDedicatedArea": True,
            "hasChangingTable": True,
            "hasPowerOutlet": True,
            "hasRefrigerator": False,
            "hasWarmWater": True
        },
        "weatherCoverage": {
            "isIndoor": False,
            "hasRoof": False,
            "hasShade": True,
            "weatherProtection": "部分遊樂設施有遮陽棚"
        },
        "nearbyAmenities": {
            "convenientStores": 5,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "捷運市政府站 500m"
        }
    },
    {
        "id": "tc2",
        "name": {"zh": "台中國立自然科學博物館", "en": "National Museum of Natural Science"},
        "description": {
            "zh": "台灣最大科學博物館，擁有IMAX劇場、植物園和恐龍展廳，寓教於樂，適合各年齡層兒童。",
            "en": "Taiwan's largest science museum with IMAX theater, botanical garden, and dinosaur exhibits. Educational and fun for all ages.",
        },
        "category": "attraction",
        "coordinates": {"lat": 24.1521, "lng": 120.6644},
        "address": {
            "zh": "台中市北區館前路1號",
            "en": "No. 1, Guanqian Rd., North Dist., Taichung",
        },
        "facilities": ["stroller_accessible", "nursing_room", "high_chair", "public_toilet"],
        "averageRating": 4.7,
        "phoneNumber": "04-2322-6940",
        "publicTransit": {
            "nearestMRT": None,
            "busLines": ["51", "300", "干城-崇德幹線"]
        },
        "parking": {"available": True, "cost": "每小時30元", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "allergens": {"commonAllergens": []},
        "crowding": {
            "quietHours": "平日下午2-4點",
            "peakHours": "週末、國定假日及寒暑假",
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
            "weatherProtection": "大部分展區室內空調，植物園有部分戶外區域"
        },
        "nearbyAmenities": {
            "convenientStores": 4,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "多路公車可達"
        }
    },
    # === Tainan Locations ===
    {
        "id": "tn1",
        "name": {"zh": "台南市立圖書館新總館兒童閱覽區", "en": "Tainan Public Library - Children's Reading Area"},
        "description": {
            "zh": "台南最美圖書館，融合自然採光設計，兒童閱覽區寬敞明亮，提供大量繪本及親子共讀服務。",
            "en": "Tainan's most beautiful library with natural lighting design. The children's reading area is spacious and bright, offering picture books and family reading services.",
        },
        "category": "attraction",
        "coordinates": {"lat": 22.9768, "lng": 120.2115},
        "address": {
            "zh": "台南市南區文南路1號",
            "en": "No. 1, Wennan Rd., South Dist., Tainan",
        },
        "facilities": ["stroller_accessible", "nursing_room", "public_toilet"],
        "averageRating": 4.9,
        "phoneNumber": "06-213-0500",
        "publicTransit": {
            "nearestMRT": None,
            "busLines": ["公車6路", "紅幹線"]
        },
        "parking": {"available": True, "cost": "免費", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "allergens": {"commonAllergens": []},
        "crowding": {
            "quietHours": "平日早上10-12點",
            "peakHours": "週末下午及寒暑假",
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
            "weatherProtection": "全室內空調"
        },
        "nearbyAmenities": {
            "convenientStores": 3,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "公車可達"
        }
    },
    {
        "id": "tn2",
        "name": {"zh": "台南孔廟文化廣場", "en": "Tainan Confucius Temple Cultural Plaza"},
        "description": {
            "zh": "台灣最古老的孔廟周邊廣場，環境典雅，有寬闊草地供兒童活動，是親子文化散策的好去處。",
            "en": "Plaza surrounding Taiwan's oldest Confucius Temple. Elegant setting with spacious lawns for children. A great family cultural walk.",
        },
        "category": "park",
        "coordinates": {"lat": 22.9971, "lng": 120.1993},
        "address": {
            "zh": "台南市中西區南門路2號",
            "en": "No. 2, Nanmen Rd., West Central Dist., Tainan",
        },
        "facilities": ["stroller_accessible", "public_toilet"],
        "averageRating": 4.6,
        "phoneNumber": "06-221-4647",
        "publicTransit": {
            "nearestMRT": None,
            "busLines": ["3路", "5路", "14路"]
        },
        "parking": {"available": True, "cost": "路邊停車計費", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": False},
        "hasWiFi": False,
        "allergens": {"commonAllergens": []},
        "crowding": {
            "quietHours": "平日上午",
            "peakHours": "週末及國定假日",
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
            "isIndoor": False,
            "hasRoof": False,
            "hasShade": True,
            "weatherProtection": "廟宇走廊可短暫避雨"
        },
        "nearbyAmenities": {
            "convenientStores": 4,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "多路公車可達"
        }
    },
    # === Hsinchu Location ===
    {
        "id": "hc1",
        "name": {"zh": "新竹市立動物園", "en": "Hsinchu City Zoo"},
        "description": {
            "zh": "台灣最老的動物園，門票便宜，園區適中，適合帶孩子悠閒半日遊。有多種台灣特有種動物。",
            "en": "Taiwan's oldest zoo with affordable admission. Moderate size, perfect for a leisurely half-day family visit. Features several Taiwan endemic species.",
        },
        "category": "attraction",
        "coordinates": {"lat": 24.8043, "lng": 120.9750},
        "address": {
            "zh": "新竹市東區動物園路101號",
            "en": "No. 101, Zoo Rd., East Dist., Hsinchu",
        },
        "facilities": ["stroller_accessible", "nursing_room", "public_toilet"],
        "averageRating": 4.5,
        "phoneNumber": "03-522-2194",
        "publicTransit": {
            "nearestMRT": None,
            "busLines": ["1路", "9路"]
        },
        "parking": {"available": True, "cost": "每次50元", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": False,
        "allergens": {"commonAllergens": []},
        "crowding": {
            "quietHours": "平日上午",
            "peakHours": "週末及寒暑假",
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
            "weatherProtection": "部分展區有遮雨棚"
        },
        "nearbyAmenities": {
            "convenientStores": 2,
            "nearbyRestrooms": True,
            "nearbyRestaurants": True,
            "nearbyPublicTransit": "公車可達"
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

