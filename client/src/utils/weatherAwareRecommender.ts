/**
 * Weather-Aware Activity Recommender System
 * Provides intelligent recommendations based on real-time weather conditions
 * Helps families find perfect activities regardless of weather
 */

import type { Location, FamilyProfile } from '../types';

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // percentage
  windSpeed: number; // km/h
  precipitation: number; // mm
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snow';
  uvi?: number; // UV Index
  visibility?: number; // km
}

export interface ActivityWeatherScore {
  activity: string;
  score: number; // 0-100
  suitability: 'ideal' | 'good' | 'fair' | 'poor';
  reasoning: string[];
  warnings: string[];
  tips: string[];
}

export interface WeatherRecommendation {
  location: Location;
  weather: WeatherData;
  currentScore: number; // 0-100
  forecastedScore: number; // predicted score for ideal weather
  suitability: 'excellent' | 'good' | 'moderate' | 'poor';
  weatherImpact: {
    positive: string[];
    negative: string[];
    mitigation: string[];
  };
  alternativeIndoorVenues?: Location[];
}

export interface FamilyWeatherPreferences {
  maxTemperature: number; // Celsius
  minTemperature: number;
  maxWindSpeed: number; // km/h
  maxPrecipitation: number; // mm
  sunSensitivity: 'low' | 'moderate' | 'high';
  rainTolerance: 'low' | 'moderate' | 'high';
  preferredConditions?: ('sunny' | 'cloudy' | 'rainy')[];
}

/**
 * Default weather preferences for families with young children
 */
const DEFAULT_FAMILY_WEATHER_PREFERENCES: FamilyWeatherPreferences = {
  maxTemperature: 32,
  minTemperature: 10,
  maxWindSpeed: 25,
  maxPrecipitation: 5,
  sunSensitivity: 'high',
  rainTolerance: 'low',
  preferredConditions: ['sunny', 'cloudy']
};

/**
 * Get weather-appropriate activity recommendations
 */
export function getWeatherActivityScores(
  weather: WeatherData,
  activityTypes: string[] = []
): ActivityWeatherScore[] {
  const activities = activityTypes.length > 0 ? activityTypes : getDefaultActivities();
  return activities.map(activity => calculateActivityWeatherScore(activity, weather));
}

/**
 * Calculate suitability score for an activity given weather conditions
 */
function calculateActivityWeatherScore(activity: string, weather: WeatherData): ActivityWeatherScore {
  let score = 50;
  const reasoning: string[] = [];
  const warnings: string[] = [];
  const tips: string[] = [];

  switch (activity.toLowerCase()) {
    case 'playground':
    case 'outdoor_play':
      if (weather.condition === 'sunny') {
        score += 30;
        reasoning.push('Perfect sunny weather for outdoor play');
        tips.push('Apply sunscreen and bring a hat');
      } else if (weather.condition === 'cloudy') {
        score += 20;
        reasoning.push('Comfortable cloudy conditions for play');
      } else if (weather.condition === 'rainy') {
        score -= 40;
        warnings.push('Wet playground equipment is slippery');
        tips.push('Look for covered play areas');
      }

      if (weather.temperature > 28) {
        score += 10;
        tips.push('Visit during early morning or late afternoon to avoid heat');
      }
      if (weather.temperature < 12) {
        score -= 15;
        warnings.push('Cold temperature may limit outdoor play enjoyment');
      }

      if (weather.windSpeed > 20) {
        warnings.push('Strong wind may affect play equipment safety');
        score -= 10;
      }

      if (weather.uvi && weather.uvi > 7) {
        warnings.push('High UV index detected');
        tips.push('Seek shade frequently and reapply sunscreen often');
      }
      break;

    case 'water_park':
    case 'beach':
    case 'swimming':
      if (weather.condition === 'sunny') {
        score += 40;
        reasoning.push('Ideal sunny weather for water activities');
      } else if (weather.condition === 'cloudy') {
        score += 20;
        reasoning.push('Acceptable weather for water activities');
      } else if (weather.condition === 'rainy') {
        score -= 20;
        warnings.push('Rainy weather may reduce visibility and safety');
      }

      if (weather.temperature > 25) {
        score += 15;
        tips.push('Water activities perfect for hot weather');
      }
      if (weather.temperature < 15) {
        score -= 20;
        warnings.push('Cold water may be uncomfortable for children');
      }

      if (weather.windSpeed > 30) {
        warnings.push('Strong wind hazard for water safety');
        score -= 15;
      }
      break;

    case 'museum':
    case 'indoor_activity':
    case 'shopping_mall':
    case 'entertainment_center':
      if (weather.condition === 'rainy') {
        score += 40;
        reasoning.push('Perfect indoor activity for rainy weather');
      }
      if (weather.condition === 'sunny') {
        score -= 10;
        reasoning.push('Nice weather outside, but indoor activities still available');
      }

      if (weather.temperature > 32) {
        score += 20;
        reasoning.push('Indoor activity great for escaping extreme heat');
      }
      if (weather.temperature < 5) {
        score += 15;
        reasoning.push('Cozy indoor activity for cold weather');
      }
      break;

    case 'hiking':
    case 'nature_trail':
      if (weather.condition === 'sunny' || weather.condition === 'cloudy') {
        score += 30;
        reasoning.push('Good weather conditions for hiking');
      } else if (weather.condition === 'rainy') {
        score -= 40;
        warnings.push('Wet trails are slippery and hazardous');
      }

      if (weather.temperature > 25 && weather.temperature < 28) {
        score += 15;
        reasoning.push('Ideal temperature range for hiking');
      }

      if (weather.windSpeed > 25) {
        warnings.push('Strong wind may make trails less safe');
        score -= 15;
      }

      if (weather.visibility && weather.visibility < 2) {
        warnings.push('Poor visibility on trails');
        score -= 20;
      }
      break;

    case 'picnic':
      if (weather.condition === 'sunny' && weather.temperature > 20 && weather.temperature < 28) {
        score += 40;
        reasoning.push('Perfect weather for a picnic');
      } else if (weather.condition === 'cloudy') {
        score += 20;
        reasoning.push('Suitable weather for picnic');
      } else if (weather.condition === 'rainy') {
        score -= 50;
        warnings.push('Rainy weather unsuitable for outdoor picnic');
      }

      if (weather.windSpeed > 20) {
        warnings.push('Wind may scatter food and items');
        tips.push('Secure food and use windproof containers');
      }

      if (weather.uvi && weather.uvi > 8) {
        tips.push('Bring canopy or umbrella for shade');
      }
      break;

    case 'cycling':
    case 'outdoor_sports':
      if (weather.condition === 'sunny' || weather.condition === 'cloudy') {
        score += 30;
        reasoning.push('Good weather for outdoor sports');
      } else if (weather.condition === 'rainy') {
        score -= 40;
        warnings.push('Wet conditions are hazardous for cycling');
      }

      if (weather.windSpeed > 25) {
        warnings.push('Strong wind may be challenging');
        score -= 15;
      }

      if (weather.temperature > 30) {
        tips.push('Ensure adequate hydration breaks');
      }
      break;
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));

  const suitability =
    score >= 75 ? 'ideal' : score >= 50 ? 'good' : score >= 25 ? 'fair' : 'poor';

  return {
    activity,
    score,
    suitability,
    reasoning,
    warnings,
    tips
  };
}

/**
 * Recommend venues based on weather and family preferences
 */
export function recommendVenuesByWeather(
  venues: Location[],
  weather: WeatherData,
  preferences: FamilyWeatherPreferences = DEFAULT_FAMILY_WEATHER_PREFERENCES
): WeatherRecommendation[] {
  return venues
    .map(venue => calculateWeatherRecommendation(venue, weather, preferences))
    .sort((a, b) => b.currentScore - a.currentScore);
}

/**
 * Calculate weather recommendation for a specific venue
 */
function calculateWeatherRecommendation(
  venue: Location,
  weather: WeatherData,
  preferences: FamilyWeatherPreferences
): WeatherRecommendation {
  let currentScore = 50;
  const weatherImpact = {
    positive: [] as string[],
    negative: [] as string[],
    mitigation: [] as string[]
  };

  // Temperature assessment
  if (weather.temperature > preferences.maxTemperature) {
    currentScore -= 15;
    weatherImpact.negative.push(`Temperature ${weather.temperature}°C exceeds comfortable range`);
    weatherImpact.mitigation.push('Seek indoor or shaded venues');
  } else if (weather.temperature < preferences.minTemperature) {
    currentScore -= 10;
    weatherImpact.negative.push(`Temperature ${weather.temperature}°C is quite cold`);
    weatherImpact.mitigation.push('Ensure proper clothing and warm breaks');
  } else {
    currentScore += 10;
    weatherImpact.positive.push(`Temperature ${weather.temperature}°C is ideal`);
  }

  // Weather condition assessment
  if (weather.condition === 'sunny') {
    currentScore += 15;
    weatherImpact.positive.push('Sunny weather is great for outdoor activities');
    if (preferences.sunSensitivity === 'high') {
      weatherImpact.mitigation.push('Remember sunscreen and UV protection');
    }
  } else if (weather.condition === 'rainy') {
    if (preferences.rainTolerance === 'low') {
      currentScore -= 30;
      weatherImpact.negative.push('Rainy weather may limit outdoor activities');
    } else {
      currentScore -= 15;
      weatherImpact.negative.push('Rainy conditions require covered activities');
    }
    weatherImpact.mitigation.push('Look for indoor venues or covered areas');
  } else if (weather.condition === 'cloudy') {
    currentScore += 5;
    weatherImpact.positive.push('Cloudy weather is comfortable for most activities');
  }

  // Wind assessment
  if (weather.windSpeed > preferences.maxWindSpeed) {
    currentScore -= 10;
    weatherImpact.negative.push(`Wind speed ${weather.windSpeed} km/h is strong`);
    weatherImpact.mitigation.push('Seek sheltered venues');
  }

  // Precipitation assessment
  if (weather.precipitation > preferences.maxPrecipitation) {
    currentScore -= 20;
    weatherImpact.negative.push('Significant precipitation expected');
  }

  // Clamp score
  currentScore = Math.max(0, Math.min(100, Math.round(currentScore)));

  // Predict score for ideal weather
  let forecastedScore = 50;
  if (preferences.preferredConditions?.length) {
    forecastedScore = preferences.preferredConditions.includes('sunny') ? 85 : 75;
  } else {
    forecastedScore = 80;
  }

  const suitability =
    currentScore >= 75
      ? 'excellent'
      : currentScore >= 50
        ? 'good'
        : currentScore >= 25
          ? 'moderate'
          : 'poor';

  return {
    location: venue,
    weather,
    currentScore,
    forecastedScore,
    suitability,
    weatherImpact
  };
}

/**
 * Get alternative indoor venues when weather is poor
 */
export function getIndoorVenueAlternatives(
  allVenues: Location[],
  weather: WeatherData
): Location[] {
  if (weather.condition === 'rainy' || weather.condition === 'snow') {
    return allVenues.filter(venue =>
      venue.facilities?.includes('indoor_activities') || venue.category === 'attraction'
    );
  }
  return [];
}

/**
 * Get outdoor venue alternatives when weather is ideal
 */
export function getOutdoorVenueAlternatives(
  allVenues: Location[],
  weather: WeatherData
): Location[] {
  if ((weather.condition === 'sunny' || weather.condition === 'cloudy') && weather.temperature > 15) {
    return allVenues.filter(
      venue =>
        venue.facilities?.includes('outdoor_play') ||
        venue.category === 'park' ||
        venue.facilities?.includes('water_play_area')
    );
  }
  return [];
}

/**
 * Get default activity types
 */
function getDefaultActivities(): string[] {
  return [
    'playground',
    'outdoor_play',
    'water_park',
    'beach',
    'swimming',
    'museum',
    'indoor_activity',
    'shopping_mall',
    'entertainment_center',
    'hiking',
    'nature_trail',
    'picnic',
    'cycling',
    'outdoor_sports'
  ];
}

/**
 * Format weather conditions for display
 */
export function formatWeatherCondition(
  condition: string,
  lang: 'zh' | 'en' = 'en'
): string {
  const translations: Record<string, Record<string, string>> = {
    sunny: { en: 'Sunny', zh: '晴天' },
    cloudy: { en: 'Cloudy', zh: '多雲' },
    rainy: { en: 'Rainy', zh: '下雨' },
    snow: { en: 'Snowy', zh: '下雪' }
  };

  return translations[condition.toLowerCase()]?.[lang] || condition;
}

/**
 * Get weather-based family activity suggestions
 */
export function getWeatherBasedActivitySuggestions(
  weather: WeatherData,
  _familyProfile?: FamilyProfile,
  lang: 'zh' | 'en' = 'en'
): string[] {
  const suggestions: Record<string, Record<string, string[]>> = {
    sunny: {
      en: [
        'Perfect day for outdoor play at the park',
        'Water activities are ideal in this weather',
        'Consider a family picnic',
        'Great time for outdoor sports'
      ],
      zh: [
        '非常適合到公園戶外遊樂',
        '這天氣下水上活動最理想',
        '考慮舉家野餐',
        '戶外運動的好時機'
      ]
    },
    cloudy: {
      en: [
        'Comfortable conditions for most outdoor activities',
        'Good time for hiking or nature walks',
        'Shopping and indoor activities are also available',
        'Perfect for moderate physical activities'
      ],
      zh: [
        '大多數戶外活動的舒適條件',
        '登山或自然散步的好時機',
        '購物和室內活動也很適合',
        '中等強度運動的完美時機'
      ]
    },
    rainy: {
      en: [
        'Perfect time for indoor activities like museums',
        'Visit an entertainment center or shopping mall',
        'Consider swimming at an indoor pool',
        'Enjoy creative indoor activities with the family'
      ],
      zh: [
        '進行博物館等室內活動的完美時機',
        '訪問娛樂中心或購物中心',
        '考慮到室內游泳池游泳',
        '享受與家人進行創意室內活動'
      ]
    },
    snow: {
      en: [
        'Enjoy outdoor snow activities',
        'Visit indoor venues for comfort',
        'Plan a warm family gathering',
        'Consider skiing or winter sports'
      ],
      zh: [
        '享受戶外雪上活動',
        '訪問室內場地舒適活動',
        '計劃溫暖的家庭聚會',
        '考慮滑雪或冬季運動'
      ]
    }
  };

  return suggestions[weather.condition.toLowerCase()]?.[lang] || [];
}
