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
    # --- Restaurants ---
    {
        "id": "r1",
        "name": {"zh": "野宴親子餐廳（信義店）", "en": "Wild Feast Family Restaurant (Xinyi)"},
        "description": {
            "zh": "台北知名親子餐廳，設有大型室內遊戲區、球池和滑梯，提供兒童套餐與高腳椅。",
            "en": "A well-known family restaurant in Taipei with indoor playground, ball pit, slides, kids' menus and high chairs.",
        },
        "category": "restaurant",
        "coordinates": {"lat": 25.0330, "lng": 121.5654},
        "address": {
            "zh": "台北市信義區松高路68號",
            "en": "No. 68, Songgao Rd., Xinyi Dist., Taipei",
        },
        "facilities": ["stroller_accessible", "nursing_room", "high_chair", "kids_menu", "indoor_playground", "public_toilet", "changing_table"],
        "averageRating": 4.6,
        "phoneNumber": "02-2722-1234",
        "operatingHours": {
            "monday": "11:00-21:00",
            "tuesday": "11:00-21:00",
            "wednesday": "11:00-21:00",
            "thursday": "11:00-21:00",
            "friday": "11:00-22:00",
            "saturday": "10:00-22:00",
            "sunday": "10:00-21:00",
        },
        "pricing": {"isFree": False, "priceRange": "300-600 NTD/person"},
        "publicTransit": {
            "nearestMRT": {"line": "板南線", "station": "市政府站", "distance": 400},
            "busLines": ["299", "521"],
        },
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日午餐前11-12點", "peakHours": "週末午餐12-14點", "averageCrowding": "moderate"},
    },
    {
        "id": "r2",
        "name": {"zh": "貝兒絲樂園親子餐廳", "en": "Bells Land Family Restaurant"},
        "description": {
            "zh": "以公主城堡為主題的親子餐廳，專為0-12歲兒童設計，設有闖關遊戲區與表演舞台。",
            "en": "Princess castle-themed family restaurant for children aged 0-12, featuring game zones and a performance stage.",
        },
        "category": "restaurant",
        "coordinates": {"lat": 25.0478, "lng": 121.5170},
        "address": {
            "zh": "台北市中山區南京西路186號B1",
            "en": "B1, No. 186, Nanjing W. Rd., Zhongshan Dist., Taipei",
        },
        "facilities": ["stroller_accessible", "nursing_room", "high_chair", "kids_menu", "indoor_playground", "public_toilet", "changing_table"],
        "averageRating": 4.5,
        "phoneNumber": "02-2555-5678",
        "operatingHours": {
            "monday": "10:30-21:00",
            "tuesday": "10:30-21:00",
            "wednesday": "10:30-21:00",
            "thursday": "10:30-21:00",
            "friday": "10:30-21:30",
            "saturday": "10:00-21:30",
            "sunday": "10:00-21:00",
        },
        "pricing": {"isFree": False, "priceRange": "400-700 NTD/person"},
        "publicTransit": {
            "nearestMRT": {"line": "淡水信義線", "station": "中山站", "distance": 350},
            "busLines": ["222", "310"],
        },
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日下午14-16點", "peakHours": "週末全天", "averageCrowding": "high"},
    },
    {
        "id": "r3",
        "name": {"zh": "大樹先生的家親子餐廳", "en": "Mr. Tree Family Restaurant"},
        "description": {
            "zh": "森林主題的親子餐廳，設有大型攀爬架、沙坑與手作課程，適合1-10歲兒童。",
            "en": "Forest-themed family restaurant with large climbing frames, sandbox, and craft workshops for children aged 1-10.",
        },
        "category": "restaurant",
        "coordinates": {"lat": 24.9930, "lng": 121.5280},
        "address": {
            "zh": "新北市新店區中興路二段233號",
            "en": "No. 233, Sec. 2, Zhongxing Rd., Xindian Dist., New Taipei",
        },
        "facilities": ["stroller_accessible", "high_chair", "kids_menu", "indoor_playground", "public_toilet", "changing_table"],
        "averageRating": 4.7,
        "operatingHours": {
            "monday": None,
            "tuesday": "11:00-20:00",
            "wednesday": "11:00-20:00",
            "thursday": "11:00-20:00",
            "friday": "11:00-21:00",
            "saturday": "10:00-21:00",
            "sunday": "10:00-20:00",
        },
        "pricing": {"isFree": False, "priceRange": "350-600 NTD/person"},
        "publicTransit": {
            "nearestMRT": {"line": "新店線", "station": "新店站", "distance": 1200},
            "busLines": ["綠1", "849"],
        },
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "週二至週四午餐", "peakHours": "週末全天", "averageCrowding": "moderate"},
    },
    # --- Medical / Pediatric ---
    {
        "id": "med1",
        "name": {"zh": "台大醫院兒童醫院", "en": "NTUH Children's Hospital"},
        "description": {
            "zh": "國立台灣大學附設醫院兒童醫院，提供完整小兒科、新生兒、兒童急診服務，設有親子友善候診區。",
            "en": "National Taiwan University Hospital Children's Hospital offering full pediatric, neonatal, and children's ER services with family-friendly waiting areas.",
        },
        "category": "medical",
        "coordinates": {"lat": 25.0415, "lng": 121.5151},
        "address": {
            "zh": "台北市中正區中山南路8號",
            "en": "No. 8, Zhongshan S. Rd., Zhongzheng Dist., Taipei",
        },
        "facilities": ["stroller_accessible", "nursing_room", "elevator", "public_toilet", "changing_table"],
        "averageRating": 4.3,
        "phoneNumber": "02-2312-3456",
        "operatingHours": {
            "monday": "08:00-17:00",
            "tuesday": "08:00-17:00",
            "wednesday": "08:00-17:00",
            "thursday": "08:00-17:00",
            "friday": "08:00-17:00",
            "saturday": "08:00-12:00",
            "sunday": None,
        },
        "pricing": {"isFree": False, "priceRange": "依健保費用"},
        "publicTransit": {
            "nearestMRT": {"line": "淡水信義線", "station": "台大醫院站", "distance": 100},
            "busLines": ["0東", "1", "3"],
        },
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "nursingAmenities": {
            "hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True,
            "hasRefrigerator": True, "hasWarmWater": True
        },
    },
    {
        "id": "med2",
        "name": {"zh": "馬偕兒童醫院", "en": "MacKay Children's Hospital"},
        "description": {
            "zh": "馬偕醫院兒童醫院，提供兒科門診、兒童急診及新生兒加護病房，設有兒童遊戲區。",
            "en": "MacKay Children's Hospital with pediatric outpatient, ER, and NICU services, plus a children's play area.",
        },
        "category": "medical",
        "coordinates": {"lat": 25.0597, "lng": 121.5218},
        "address": {
            "zh": "台北市中山區中山北路二段92號",
            "en": "No. 92, Sec. 2, Zhongshan N. Rd., Zhongshan Dist., Taipei",
        },
        "facilities": ["stroller_accessible", "nursing_room", "elevator", "public_toilet", "changing_table"],
        "averageRating": 4.4,
        "phoneNumber": "02-2543-3535",
        "operatingHours": {
            "monday": "08:00-21:00",
            "tuesday": "08:00-21:00",
            "wednesday": "08:00-21:00",
            "thursday": "08:00-21:00",
            "friday": "08:00-21:00",
            "saturday": "08:00-17:00",
            "sunday": "08:00-12:00",
        },
        "pricing": {"isFree": False, "priceRange": "依健保費用"},
        "publicTransit": {
            "nearestMRT": {"line": "淡水信義線", "station": "中山站", "distance": 500},
            "busLines": ["3", "38", "203"],
        },
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "nursingAmenities": {
            "hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True,
            "hasRefrigerator": True, "hasWarmWater": True
        },
    },
    # --- Nursing Rooms at key transit hubs ---
    {
        "id": "nr1",
        "name": {"zh": "台北車站哺乳室（K出口旁）", "en": "Taipei Main Station Nursing Room (near Exit K)"},
        "description": {
            "zh": "台北車站地下一樓K出口旁設有專屬哺乳室，提供私密空間、尿布台、插座與溫熱水。",
            "en": "Dedicated nursing room near Exit K on B1 of Taipei Main Station with privacy curtains, changing table, power outlets, and warm water.",
        },
        "category": "nursing_room",
        "coordinates": {"lat": 25.0478, "lng": 121.5170},
        "address": {
            "zh": "台北市中正區北平西路3號B1（台北車站K出口旁）",
            "en": "B1, No. 3, Beiping W. Rd., Zhongzheng Dist., Taipei (near Exit K)",
        },
        "facilities": ["stroller_accessible", "nursing_room", "elevator", "changing_table", "public_toilet"],
        "averageRating": 4.2,
        "operatingHours": {
            "monday": "06:00-24:00",
            "tuesday": "06:00-24:00",
            "wednesday": "06:00-24:00",
            "thursday": "06:00-24:00",
            "friday": "06:00-24:00",
            "saturday": "06:00-24:00",
            "sunday": "06:00-24:00",
        },
        "pricing": {"isFree": True},
        "publicTransit": {
            "nearestMRT": {"line": "淡水信義線/板南線", "station": "台北車站", "distance": 50},
            "busLines": ["多條公車"],
        },
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "nursingAmenities": {
            "hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True,
            "hasRefrigerator": False, "hasWarmWater": True
        },
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
    },
    {
        "id": "nr2",
        "name": {"zh": "忠孝復興站哺乳室", "en": "Zhongxiao Fuxing Station Nursing Room"},
        "description": {
            "zh": "捷運忠孝復興站設有哺乳室，位於站內客服中心旁，提供私密哺乳空間與嬰兒尿布台。",
            "en": "Nursing room at Zhongxiao Fuxing MRT Station near the service center, with private nursing space and baby changing table.",
        },
        "category": "nursing_room",
        "coordinates": {"lat": 25.0419, "lng": 121.5450},
        "address": {
            "zh": "台北市大安區忠孝東路四段（捷運忠孝復興站）",
            "en": "Sec. 4, Zhongxiao E. Rd., Daan Dist., Taipei (Zhongxiao Fuxing MRT Station)",
        },
        "facilities": ["stroller_accessible", "nursing_room", "elevator", "changing_table"],
        "averageRating": 4.1,
        "operatingHours": {
            "monday": "06:00-24:00", "tuesday": "06:00-24:00", "wednesday": "06:00-24:00",
            "thursday": "06:00-24:00", "friday": "06:00-24:00",
            "saturday": "06:00-24:00", "sunday": "06:00-24:00",
        },
        "pricing": {"isFree": True},
        "publicTransit": {
            "nearestMRT": {"line": "板南線/文湖線", "station": "忠孝復興站", "distance": 10},
            "busLines": ["多條公車"],
        },
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "nursingAmenities": {
            "hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True,
            "hasRefrigerator": False, "hasWarmWater": False
        },
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
    },
    # --- Additional Parks ---
    {
        "id": "p5",
        "name": {"zh": "新北市板橋435藝文特區兒童探索館", "en": "Banqiao 435 Arts Zone Children's Discovery Museum"},
        "description": {
            "zh": "新北市板橋435藝文特區設有兒童探索館，互動展覽、手作工坊，適合全家親子同樂。",
            "en": "Children's Discovery Museum in the Banqiao 435 Arts Zone with interactive exhibits and craft workshops for the whole family.",
        },
        "category": "attraction",
        "coordinates": {"lat": 25.0087, "lng": 121.4637},
        "address": {
            "zh": "新北市板橋區中山路一段435巷2號",
            "en": "No. 2, Lane 435, Sec. 1, Zhongshan Rd., Banqiao Dist., New Taipei",
        },
        "facilities": ["stroller_accessible", "nursing_room", "elevator", "public_toilet", "changing_table"],
        "averageRating": 4.5,
        "operatingHours": {
            "monday": None,
            "tuesday": "09:00-17:00", "wednesday": "09:00-17:00",
            "thursday": "09:00-17:00", "friday": "09:00-17:00",
            "saturday": "09:00-18:00", "sunday": "09:00-18:00",
        },
        "pricing": {"isFree": True},
        "publicTransit": {
            "nearestMRT": {"line": "板南線", "station": "府中站", "distance": 600},
            "busLines": ["307", "906"],
        },
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日上午", "peakHours": "週末下午", "averageCrowding": "moderate"},
    },
    {
        "id": "p6",
        "name": {"zh": "基隆市立文化中心兒童館", "en": "Keelung City Cultural Center Children's Hall"},
        "description": {
            "zh": "基隆市立文化中心兒童館提供繪本閱讀區、STEAM教育課程與兒童劇場，免費入館。",
            "en": "Keelung City Cultural Center Children's Hall with picture book reading area, STEAM education programs, and children's theater — free admission.",
        },
        "category": "attraction",
        "coordinates": {"lat": 25.1320, "lng": 121.7423},
        "address": {
            "zh": "基隆市中正區義一路1號",
            "en": "No. 1, Yi-Yi Rd., Zhongzheng Dist., Keelung",
        },
        "facilities": ["stroller_accessible", "elevator", "public_toilet", "changing_table"],
        "averageRating": 4.3,
        "operatingHours": {
            "monday": None,
            "tuesday": "09:00-17:00", "wednesday": "09:00-17:00",
            "thursday": "09:00-17:00", "friday": "09:00-17:00",
            "saturday": "09:00-17:00", "sunday": "09:00-17:00",
        },
        "pricing": {"isFree": True},
        "publicTransit": {
            "nearestMRT": None,
            "busLines": ["基隆市公車多線"],
        },
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": False},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日全天", "peakHours": "週末及假日", "averageCrowding": "low"},
    },
    # ──────────────────────────────────────────────
    # Iteration 2 additions: 16 more curated venues
    # ──────────────────────────────────────────────
    {
        "id": "tp01",
        "name": {"zh": "台北市立動物園", "en": "Taipei Zoo"},
        "description": {
            "zh": "亞洲最大規模動物園之一，設有兒童動物區與戶外遊樂設施，適合全家親子同遊。",
            "en": "One of Asia's largest zoos with a children's animal zone and outdoor play facilities."
        },
        "category": "attraction",
        "coordinates": {"lat": 24.9994, "lng": 121.5805},
        "address": {"zh": "台北市文山區新光路二段30號", "en": "No. 30, Sec. 2, Xinguang Rd., Wenshan Dist., Taipei"},
        "facilities": ["stroller_accessible", "nursing_room", "public_toilet", "high_chair", "changing_table", "elevator"],
        "averageRating": 4.7,
        "phoneNumber": "02-2938-2300",
        "pricing": {"isFree": False, "priceRange": "60-200 NTD (children free under 6)"},
        "operatingHours": {"tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "09:00-17:00", "sunday": "09:00-17:00"},
        "publicTransit": {"nearestMRT": {"line": "文湖線", "station": "動物園站", "distance": 200}, "busLines": ["236", "237"]},
        "parking": {"available": True, "cost": "每小時50元", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": False, "hasRoof": False, "hasShade": True, "weatherProtection": "部分有遮蔽建築"},
        "crowding": {"quietHours": "平日早上9-11點", "peakHours": "週末及寒暑假", "averageCrowding": "moderate"},
        "nursingAmenities": {"hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True, "hasRefrigerator": True, "hasWarmWater": True},
    },
    {
        "id": "tp02",
        "name": {"zh": "國立故宮博物院兒童學藝中心", "en": "National Palace Museum Children's Art Center"},
        "description": {
            "zh": "故宮博物院內專為兒童設計的互動學習空間，提供觸摸文物複製品及DIY手作活動。",
            "en": "An interactive learning space inside the National Palace Museum designed for children, with hands-on cultural activities."
        },
        "category": "attraction",
        "coordinates": {"lat": 25.1023, "lng": 121.5484},
        "address": {"zh": "台北市士林區至善路二段221號", "en": "No. 221, Sec. 2, Zhishan Rd., Shilin Dist., Taipei"},
        "facilities": ["stroller_accessible", "public_toilet", "elevator", "changing_table"],
        "averageRating": 4.5,
        "phoneNumber": "02-2881-2021",
        "pricing": {"isFree": False, "priceRange": "30-350 NTD"},
        "operatingHours": {"tuesday": "08:30-18:30", "wednesday": "08:30-18:30", "thursday": "08:30-18:30", "friday": "08:30-21:00", "saturday": "08:30-21:00", "sunday": "08:30-18:30"},
        "publicTransit": {"nearestMRT": {"line": "紅線", "station": "士林站", "distance": 2000}, "busLines": ["紅30", "255", "304"]},
        "parking": {"available": True, "cost": "每小時30元", "hasValidation": True},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日上午", "peakHours": "週末及連假", "averageCrowding": "moderate"},
        "nursingAmenities": {"hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True, "hasRefrigerator": False, "hasWarmWater": False},
    },
    {
        "id": "tp03",
        "name": {"zh": "內湖運動公園", "en": "Neihu Sports Park"},
        "description": {
            "zh": "寬闊的運動公園，設有兒童遊戲場、溜冰場及草坪，全年適合親子活動。",
            "en": "A large sports park with a children's playground, skating rink, and lawns suitable for family activities year-round."
        },
        "category": "park",
        "coordinates": {"lat": 25.0683, "lng": 121.5903},
        "address": {"zh": "台北市內湖區內湖路二段底", "en": "End of Sec. 2, Neihu Rd., Neihu Dist., Taipei"},
        "facilities": ["stroller_accessible", "public_toilet", "changing_table"],
        "averageRating": 4.4,
        "pricing": {"isFree": True},
        "operatingHours": {"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-22:00", "saturday": "06:00-22:00", "sunday": "06:00-22:00"},
        "publicTransit": {"nearestMRT": {"line": "文湖線", "station": "內湖站", "distance": 1000}, "busLines": ["247", "267"]},
        "parking": {"available": True, "cost": "免費", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": False},
        "hasWiFi": False,
        "weatherCoverage": {"isIndoor": False, "hasRoof": False, "hasShade": True, "weatherProtection": "樹蔭"},
        "crowding": {"quietHours": "平日早晨", "peakHours": "週末下午", "averageCrowding": "low"},
    },
    {
        "id": "tp04",
        "name": {"zh": "美麗華百樂園摩天輪", "en": "Miramar Entertainment Park Ferris Wheel"},
        "description": {
            "zh": "台北知名地標摩天輪，旁有兒童遊樂設施、電影院及多元餐廳，雨天室內活動絕佳選擇。",
            "en": "Taipei's iconic Ferris wheel with children's rides, cinema, and diverse restaurants — a great rainy-day indoor option."
        },
        "category": "attraction",
        "coordinates": {"lat": 25.0832, "lng": 121.5573},
        "address": {"zh": "台北市中山區敬業三路20號", "en": "No. 20, Jingye 3rd Rd., Zhongshan Dist., Taipei"},
        "facilities": ["stroller_accessible", "public_toilet", "high_chair", "elevator", "changing_table", "nursing_room"],
        "averageRating": 4.3,
        "phoneNumber": "02-2175-3456",
        "pricing": {"isFree": False, "priceRange": "100-200 NTD (ferris wheel)"},
        "operatingHours": {"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-23:00", "saturday": "10:00-23:00", "sunday": "10:00-22:00"},
        "publicTransit": {"nearestMRT": {"line": "文湖線", "station": "劍南路站", "distance": 300}, "busLines": ["247", "267"]},
        "parking": {"available": True, "cost": "前2小時免費", "hasValidation": True},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "大部分室內"},
        "crowding": {"quietHours": "平日下午", "peakHours": "週末晚上", "averageCrowding": "moderate"},
        "nursingAmenities": {"hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True, "hasRefrigerator": False, "hasWarmWater": True},
    },
    {
        "id": "tp05",
        "name": {"zh": "木柵動物園貓熊館", "en": "Taipei Zoo Giant Panda House"},
        "description": {
            "zh": "台北動物園內的貓熊館，可近距離觀賞圓仔及圓圓，是親子必訪景點。",
            "en": "The Giant Panda enclosure at Taipei Zoo, home to Yuan Zi and Yuan Yuan — a must-visit for families."
        },
        "category": "attraction",
        "coordinates": {"lat": 24.9983, "lng": 121.5812},
        "address": {"zh": "台北市文山區新光路二段30號（動物園內）", "en": "Inside Taipei Zoo, No. 30, Sec. 2, Xinguang Rd., Wenshan Dist., Taipei"},
        "facilities": ["stroller_accessible", "public_toilet", "nursing_room"],
        "averageRating": 4.8,
        "pricing": {"isFree": False, "priceRange": "含動物園門票 60-200 NTD"},
        "publicTransit": {"nearestMRT": {"line": "文湖線", "station": "動物園站", "distance": 300}, "busLines": []},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": False,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "室內展館"},
        "crowding": {"quietHours": "平日早上開館時", "peakHours": "週末及連假", "averageCrowding": "busy"},
    },
    {
        "id": "ny01",
        "name": {"zh": "新北市立圖書館新總館", "en": "New Taipei City Library New Main Branch"},
        "description": {
            "zh": "新北市最新圖書館，設有寬敞兒童閱讀區、故事屋及戶外閱讀空間，是雨天親子首選。",
            "en": "The newest New Taipei City Library with a spacious children's reading area, story room, and outdoor reading space."
        },
        "category": "attraction",
        "coordinates": {"lat": 25.0129, "lng": 121.4648},
        "address": {"zh": "新北市板橋區民族路167號", "en": "No. 167, Minzu Rd., Banqiao Dist., New Taipei City"},
        "facilities": ["stroller_accessible", "public_toilet", "nursing_room", "elevator", "changing_table"],
        "averageRating": 4.6,
        "pricing": {"isFree": True},
        "operatingHours": {"tuesday": "09:00-21:00", "wednesday": "09:00-21:00", "thursday": "09:00-21:00", "friday": "09:00-21:00", "saturday": "09:00-17:00", "sunday": "09:00-17:00"},
        "publicTransit": {"nearestMRT": {"line": "藍線", "station": "新埔站", "distance": 800}, "busLines": ["板橋客運多線"]},
        "parking": {"available": True, "cost": "每小時30元", "hasValidation": True},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日早上", "peakHours": "週末下午", "averageCrowding": "low"},
        "nursingAmenities": {"hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True, "hasRefrigerator": False, "hasWarmWater": True},
    },
    {
        "id": "ny02",
        "name": {"zh": "新北市兒童藝術館", "en": "New Taipei City Children's Arts Center"},
        "description": {
            "zh": "專為12歲以下兒童打造的互動藝術空間，提供繪畫、音樂、戲劇等多元創意課程。",
            "en": "An interactive arts space designed for children under 12, offering painting, music, drama, and creative workshops."
        },
        "category": "attraction",
        "coordinates": {"lat": 25.0186, "lng": 121.4632},
        "address": {"zh": "新北市板橋區縣民大道二段7號", "en": "No. 7, Sec. 2, Xianmin Blvd., Banqiao Dist., New Taipei City"},
        "facilities": ["stroller_accessible", "public_toilet", "elevator", "changing_table", "nursing_room"],
        "averageRating": 4.5,
        "pricing": {"isFree": True},
        "operatingHours": {"tuesday": "09:30-17:30", "wednesday": "09:30-17:30", "thursday": "09:30-17:30", "friday": "09:30-17:30", "saturday": "09:30-17:30", "sunday": "09:30-17:30"},
        "publicTransit": {"nearestMRT": {"line": "藍線", "station": "板橋站", "distance": 500}, "busLines": []},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日", "peakHours": "假日及活動日", "averageCrowding": "low"},
    },
    {
        "id": "tc03",
        "name": {"zh": "台中市兒童藝術館", "en": "Taichung Children's Art Museum"},
        "description": {
            "zh": "位於台中文化創意產業園區內，以藝術互動裝置為主，適合6歲以上兒童探索。",
            "en": "Located in the Taichung Cultural Creative Park, featuring interactive art installations suitable for children 6 and above."
        },
        "category": "attraction",
        "coordinates": {"lat": 24.1369, "lng": 120.6859},
        "address": {"zh": "台中市南區復興路三段362號", "en": "No. 362, Sec. 3, Fuxing Rd., South Dist., Taichung"},
        "facilities": ["stroller_accessible", "public_toilet", "elevator"],
        "averageRating": 4.2,
        "pricing": {"isFree": True},
        "operatingHours": {"tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-18:00", "saturday": "10:00-18:00", "sunday": "10:00-18:00"},
        "publicTransit": {"nearestMRT": None, "busLines": ["21", "33", "67"]},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": False},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日", "peakHours": "假日", "averageCrowding": "low"},
    },
    {
        "id": "tc04",
        "name": {"zh": "台中科博館兒童廳", "en": "National Museum of Natural Science Children's Hall"},
        "description": {
            "zh": "國立自然科學博物館兒童廳，提供互動科學展示，專為3-12歲兒童設計，寓教於樂。",
            "en": "The Children's Hall at the National Museum of Natural Science, with interactive science exhibits designed for children aged 3-12."
        },
        "category": "attraction",
        "coordinates": {"lat": 24.1538, "lng": 120.6720},
        "address": {"zh": "台中市北區館前路1號", "en": "No. 1, Guanqian Rd., North Dist., Taichung"},
        "facilities": ["stroller_accessible", "public_toilet", "nursing_room", "elevator", "changing_table"],
        "averageRating": 4.6,
        "phoneNumber": "04-2322-6940",
        "pricing": {"isFree": False, "priceRange": "30-100 NTD"},
        "operatingHours": {"tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "09:00-17:00", "sunday": "09:00-17:00"},
        "publicTransit": {"nearestMRT": None, "busLines": ["22", "25", "300"]},
        "parking": {"available": True, "cost": "每小時30元", "hasValidation": True},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日早上", "peakHours": "連假及寒暑假", "averageCrowding": "moderate"},
        "nursingAmenities": {"hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True, "hasRefrigerator": False, "hasWarmWater": True},
    },
    {
        "id": "tn03",
        "name": {"zh": "台南市奇美博物館", "en": "Chimei Museum Tainan"},
        "description": {
            "zh": "台灣最美博物館之一，設有藝術、自然史及兵器展，外觀如歐洲宮殿，適合闔家參觀。",
            "en": "One of Taiwan's most beautiful museums with art, natural history, and armory exhibits in a European palace-style building."
        },
        "category": "attraction",
        "coordinates": {"lat": 22.9799, "lng": 120.2256},
        "address": {"zh": "台南市仁德區文華路二段66號", "en": "No. 66, Sec. 2, Wenhua Rd., Rende Dist., Tainan"},
        "facilities": ["stroller_accessible", "public_toilet", "nursing_room", "elevator", "high_chair", "changing_table"],
        "averageRating": 4.8,
        "phoneNumber": "06-266-0808",
        "pricing": {"isFree": False, "priceRange": "200-350 NTD"},
        "operatingHours": {"tuesday": "09:30-17:30", "wednesday": "09:30-17:30", "thursday": "09:30-17:30", "friday": "09:30-17:30", "saturday": "09:30-17:30", "sunday": "09:30-17:30"},
        "publicTransit": {"nearestMRT": None, "busLines": ["88"]},
        "parking": {"available": True, "cost": "免費", "hasValidation": False},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "室內展廳"},
        "crowding": {"quietHours": "平日", "peakHours": "連假及暑假", "averageCrowding": "moderate"},
        "nursingAmenities": {"hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True, "hasRefrigerator": True, "hasWarmWater": True},
    },
    {
        "id": "kh04",
        "name": {"zh": "高雄市立美術館兒童館", "en": "Kaohsiung Museum of Fine Arts Children's Gallery"},
        "description": {
            "zh": "高美館附設兒童館，提供互動藝術體驗工作坊及展覽，館外有大型草坪可野餐。",
            "en": "Children's Gallery at KMFA with interactive art workshops and exhibitions; large lawn outside perfect for picnics."
        },
        "category": "attraction",
        "coordinates": {"lat": 22.6508, "lng": 120.2930},
        "address": {"zh": "高雄市鼓山區美術館路80號", "en": "No. 80, Meishuguan Rd., Gushan Dist., Kaohsiung"},
        "facilities": ["stroller_accessible", "public_toilet", "elevator", "changing_table"],
        "averageRating": 4.5,
        "pricing": {"isFree": True},
        "operatingHours": {"tuesday": "09:30-17:30", "wednesday": "09:30-17:30", "thursday": "09:30-17:30", "friday": "09:30-17:30", "saturday": "09:30-17:30", "sunday": "09:30-17:30"},
        "publicTransit": {"nearestMRT": None, "busLines": ["168", "環狀線"]},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "室內展館"},
        "crowding": {"quietHours": "平日早上", "peakHours": "週末及連假", "averageCrowding": "low"},
    },
    {
        "id": "kh05",
        "name": {"zh": "駁二藝術特區", "en": "Pier-2 Art Center Kaohsiung"},
        "description": {
            "zh": "高雄最具特色的文創藝術園區，倉庫改建為藝術展館，廣場有大型公共藝術及兒童遊樂空間。",
            "en": "Kaohsiung's most unique cultural creative park, with warehouses converted to art spaces and public art installations for kids."
        },
        "category": "attraction",
        "coordinates": {"lat": 22.6199, "lng": 120.2816},
        "address": {"zh": "高雄市鹽埕區大勇路1號", "en": "No. 1, Dayong Rd., Yancheng Dist., Kaohsiung"},
        "facilities": ["stroller_accessible", "public_toilet", "high_chair"],
        "averageRating": 4.6,
        "pricing": {"isFree": True},
        "operatingHours": {"tuesday": "10:00-18:00", "wednesday": "10:00-18:00", "thursday": "10:00-18:00", "friday": "10:00-20:00", "saturday": "10:00-20:00", "sunday": "10:00-18:00"},
        "publicTransit": {"nearestMRT": {"line": "橘線", "station": "鹽埕埔站", "distance": 800}, "busLines": ["12", "100"]},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": False},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": False, "hasRoof": False, "hasShade": True, "weatherProtection": "戶外廣場及室內展廳"},
        "crowding": {"quietHours": "平日早晨", "peakHours": "週末下午", "averageCrowding": "moderate"},
    },
    {
        "id": "hc02",
        "name": {"zh": "新竹市立動物園", "en": "Hsinchu City Zoo"},
        "description": {
            "zh": "台灣歷史最悠久的動物園，近年翻新後親子設施完善，門票低廉，是竹北親子半日遊好去處。",
            "en": "Taiwan's oldest zoo, recently renovated with family-friendly facilities and low admission prices — great for a half-day trip."
        },
        "category": "attraction",
        "coordinates": {"lat": 24.8013, "lng": 120.9699},
        "address": {"zh": "新竹市東區動物園路2號", "en": "No. 2, Zoo Rd., East Dist., Hsinchu City"},
        "facilities": ["stroller_accessible", "public_toilet", "changing_table"],
        "averageRating": 4.3,
        "pricing": {"isFree": False, "priceRange": "20-30 NTD"},
        "operatingHours": {"tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "09:00-17:00", "sunday": "09:00-17:00"},
        "publicTransit": {"nearestMRT": None, "busLines": ["1", "2", "12"]},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": False,
        "weatherCoverage": {"isIndoor": False, "hasRoof": False, "hasShade": True, "weatherProtection": "樹蔭"},
        "crowding": {"quietHours": "平日早上", "peakHours": "寒暑假及連假", "averageCrowding": "low"},
    },
    {
        "id": "nr03",
        "name": {"zh": "台北101哺乳室", "en": "Taipei 101 Nursing Room"},
        "description": {
            "zh": "台北101購物中心3F哺乳室，設備齊全，含換尿布台、熱水供應及獨立哺乳隔間。",
            "en": "Taipei 101 Mall 3F nursing room, fully equipped with changing tables, hot water supply, and private nursing cubicles."
        },
        "category": "nursing_room",
        "coordinates": {"lat": 25.0337, "lng": 121.5648},
        "address": {"zh": "台北市信義區信義路五段7號3樓（101購物中心）", "en": "3F, No. 7, Sec. 5, Xinyi Rd., Xinyi Dist., Taipei (Taipei 101 Mall)"},
        "facilities": ["nursing_room", "changing_table", "elevator", "stroller_accessible"],
        "averageRating": 4.6,
        "publicTransit": {"nearestMRT": {"line": "信義線", "station": "台北101/世貿站", "distance": 100}, "busLines": []},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日上午", "peakHours": "週末及連假", "averageCrowding": "low"},
        "nursingAmenities": {"hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True, "hasRefrigerator": True, "hasWarmWater": True},
        "pricing": {"isFree": True},
    },
    {
        "id": "nr04",
        "name": {"zh": "桃園機場第一航廈哺乳室", "en": "Taiwan Taoyuan Airport Terminal 1 Nursing Room"},
        "description": {
            "zh": "桃園國際機場第一航廈安檢前/後各有哺乳室，設施完善，讓帶嬰兒出行的家長安心。",
            "en": "Taiwan Taoyuan International Airport Terminal 1 has nursing rooms before and after security check, fully equipped for traveling parents with infants."
        },
        "category": "nursing_room",
        "coordinates": {"lat": 25.0779, "lng": 121.2329},
        "address": {"zh": "桃園市大園區航站南路9號（第一航廈）", "en": "No. 9, Hangzhan S. Rd., Dayuan Dist., Taoyuan (Terminal 1)"},
        "facilities": ["nursing_room", "changing_table", "elevator", "stroller_accessible", "public_toilet"],
        "averageRating": 4.4,
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "深夜至清晨", "peakHours": "早上7-10點/下午4-8點", "averageCrowding": "moderate"},
        "nursingAmenities": {"hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True, "hasRefrigerator": True, "hasWarmWater": True},
        "pricing": {"isFree": True},
    },
    {
        "id": "tp06",
        "name": {"zh": "誠品生活松菸店親子閱讀區", "en": "Eslite Spectrum Songyan Children's Reading Area"},
        "description": {
            "zh": "松山文創園區誠品書店設有寬敞親子閱讀角，備有兒童繪本、木製玩具及小型座椅。",
            "en": "Eslite Spectrum at Songshan Cultural Park features a spacious children's reading corner with picture books, wooden toys, and kid-sized seating."
        },
        "category": "attraction",
        "coordinates": {"lat": 25.0440, "lng": 121.5610},
        "address": {"zh": "台北市信義區菸廠路88號誠品生活松菸店", "en": "Eslite Spectrum Songyan, No. 88, Yanchang Rd., Xinyi Dist., Taipei"},
        "facilities": ["stroller_accessible", "public_toilet", "elevator", "nursing_room"],
        "averageRating": 4.5,
        "pricing": {"isFree": True},
        "operatingHours": {"monday": "11:00-22:00", "tuesday": "11:00-22:00", "wednesday": "11:00-22:00", "thursday": "11:00-22:00", "friday": "11:00-22:00", "saturday": "10:00-22:00", "sunday": "10:00-22:00"},
        "publicTransit": {"nearestMRT": {"line": "板南線", "station": "國父紀念館站", "distance": 600}, "busLines": ["33", "52"]},
        "parking": {"available": True, "cost": "前2小時免費", "hasValidation": True},
        "toilet": {"available": True, "childrenFriendly": True, "hasChangingTable": True},
        "hasWiFi": True,
        "weatherCoverage": {"isIndoor": True, "hasRoof": True, "hasShade": True, "weatherProtection": "完全室內"},
        "crowding": {"quietHours": "平日早上", "peakHours": "週末下午", "averageCrowding": "moderate"},
        "nursingAmenities": {"hasDedicatedArea": True, "hasChangingTable": True, "hasPowerOutlet": True, "hasRefrigerator": False, "hasWarmWater": False},
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

