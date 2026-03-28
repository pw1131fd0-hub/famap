import { describe, it, expect } from 'vitest';
import {
  getWeatherActivityScores,
  recommendVenuesByWeather,
  getIndoorVenueAlternatives,
  getOutdoorVenueAlternatives,
  getWeatherBasedActivitySuggestions,
  formatWeatherCondition,
  type WeatherData,
  type FamilyWeatherPreferences
} from '../utils/weatherAwareRecommender';
import type { Location } from '../types';

describe('weatherAwareRecommender', () => {
  const sampleWeather: WeatherData = {
    temperature: 25,
    humidity: 60,
    windSpeed: 10,
    precipitation: 0,
    condition: 'sunny',
    uvi: 6,
    visibility: 10
  };

  const sampleVenue: Location = {
    id: 'test-venue',
    name: { zh: '公園', en: 'Park' },
    category: 'park',
    coordinates: { lat: 25, lng: 121 },
    address: { zh: '台北', en: 'Taipei' },
    facilities: ['playground', 'outdoor_play'],
    rating: 4.5,
    reviews: []
  };

  const createVenueWithCategory = (category: string, name: string): Location => ({
    ...sampleVenue,
    id: `venue-${category}`,
    name: { zh: name, en: name },
    category: category as any,
    facilities: [category]
  });

  describe('getWeatherActivityScores', () => {
    it('should calculate activity scores for sunny weather', () => {
      const scores = getWeatherActivityScores(sampleWeather, ['playground', 'beach']);
      expect(scores).toHaveLength(2);
      expect(scores[0].score).toBeGreaterThan(50);
    });

    it('should score playground highly in sunny weather', () => {
      const scores = getWeatherActivityScores(sampleWeather, ['playground']);
      expect(scores[0].suitability).toBe('ideal');
      expect(scores[0].reasoning.length).toBeGreaterThan(0);
    });

    it('should score playground poorly in rainy weather', () => {
      const rainySample: WeatherData = {
        ...sampleWeather,
        condition: 'rainy',
        precipitation: 10
      };
      const scores = getWeatherActivityScores(rainySample, ['playground']);
      expect(scores[0].score).toBeLessThan(50);
      expect(scores[0].warnings.length).toBeGreaterThan(0);
    });

    it('should score museum highly in rainy weather', () => {
      const rainySample: WeatherData = {
        ...sampleWeather,
        condition: 'rainy',
        precipitation: 10
      };
      const scores = getWeatherActivityScores(rainySample, ['museum']);
      expect(scores[0].score).toBeGreaterThan(50);
    });

    it('should score water park highly in hot sunny weather', () => {
      const hotSunny: WeatherData = {
        ...sampleWeather,
        temperature: 32,
        condition: 'sunny'
      };
      const scores = getWeatherActivityScores(hotSunny, ['water_park']);
      expect(scores[0].score).toBeGreaterThan(75);
    });

    it('should provide tips for high UV index', () => {
      const highUV: WeatherData = {
        ...sampleWeather,
        uvi: 10
      };
      const scores = getWeatherActivityScores(highUV, ['beach']);
      expect(scores[0].tips.some(t => t.includes('sunscreen'))).toBe(true);
    });

    it('should handle default activities when none provided', () => {
      const scores = getWeatherActivityScores(sampleWeather);
      expect(scores.length).toBeGreaterThan(10);
    });

    it('should warn about cold temperatures for water activities', () => {
      const coldWeather: WeatherData = {
        ...sampleWeather,
        temperature: 10,
        condition: 'sunny'
      };
      const scores = getWeatherActivityScores(coldWeather, ['swimming']);
      expect(scores[0].warnings.length).toBeGreaterThan(0);
    });

    it('should warn about strong winds', () => {
      const windyWeather: WeatherData = {
        ...sampleWeather,
        windSpeed: 35,
        condition: 'sunny'
      };
      const scores = getWeatherActivityScores(windyWeather, ['cycling']);
      expect(scores[0].warnings.length).toBeGreaterThan(0);
    });
  });

  describe('recommendVenuesByWeather', () => {
    it('should recommend venues sorted by weather suitability', () => {
      const venues = [
        createVenueWithCategory('park', 'Outdoor Park'),
        createVenueWithCategory('museum', 'Indoor Museum')
      ];

      const recommendations = recommendVenuesByWeather(venues, sampleWeather);
      expect(recommendations).toHaveLength(2);
      expect(recommendations[0].currentScore).toBeGreaterThanOrEqual(recommendations[1].currentScore);
    });

    it('should score outdoor venues higher in sunny weather', () => {
      const venues = [createVenueWithCategory('park', 'Park')];
      const recommendations = recommendVenuesByWeather(venues, sampleWeather);

      expect(recommendations[0].currentScore).toBeGreaterThan(50);
      expect(recommendations[0].suitability).not.toBe('poor');
    });

    it('should score indoor venues higher in rainy weather', () => {
      const venues = [createVenueWithCategory('museum', 'Museum')];
      const rainySample: WeatherData = {
        ...sampleWeather,
        condition: 'rainy',
        precipitation: 10
      };

      const recommendations = recommendVenuesByWeather(venues, rainySample);
      expect(recommendations[0].currentScore).toBeGreaterThan(50);
    });

    it('should provide weather impact analysis', () => {
      const venues = [sampleVenue];
      const recommendations = recommendVenuesByWeather(venues, sampleWeather);

      expect(recommendations[0].weatherImpact.positive.length).toBeGreaterThan(0);
      expect(Array.isArray(recommendations[0].weatherImpact.negative)).toBe(true);
      expect(Array.isArray(recommendations[0].weatherImpact.mitigation)).toBe(true);
    });

    it('should apply family weather preferences', () => {
      const venues = [sampleVenue];
      const coldPreferences: FamilyWeatherPreferences = {
        maxTemperature: 20,
        minTemperature: 5,
        maxWindSpeed: 15,
        maxPrecipitation: 2,
        sunSensitivity: 'moderate',
        rainTolerance: 'low'
      };

      const warmWeather: WeatherData = {
        ...sampleWeather,
        temperature: 32
      };

      const recommendations = recommendVenuesByWeather(venues, warmWeather, coldPreferences);
      expect(recommendations[0].currentScore).toBeLessThan(60);
    });

    it('should handle temperature preferences', () => {
      const venues = [sampleVenue];
      const preferences: FamilyWeatherPreferences = {
        maxTemperature: 28,
        minTemperature: 15,
        maxWindSpeed: 20,
        maxPrecipitation: 5,
        sunSensitivity: 'moderate',
        rainTolerance: 'moderate'
      };

      const perfectWeather: WeatherData = {
        ...sampleWeather,
        temperature: 22
      };

      const recommendations = recommendVenuesByWeather(venues, perfectWeather, preferences);
      expect(recommendations[0].weatherImpact.positive.length).toBeGreaterThan(0);
    });
  });

  describe('getIndoorVenueAlternatives', () => {
    it('should return indoor venues for rainy weather', () => {
      const venues = [
        createVenueWithCategory('park', 'Park'),
        createVenueWithCategory('museum', 'Museum')
      ];

      const rainySample: WeatherData = {
        ...sampleWeather,
        condition: 'rainy'
      };

      const alternatives = getIndoorVenueAlternatives(venues, rainySample);
      expect(alternatives.length).toBeGreaterThan(0);
    });

    it('should return empty for sunny weather', () => {
      const venues = [sampleVenue];
      const alternatives = getIndoorVenueAlternatives(venues, sampleWeather);
      expect(alternatives).toHaveLength(0);
    });
  });

  describe('getOutdoorVenueAlternatives', () => {
    it('should return outdoor venues for ideal weather', () => {
      const venues = [
        { ...sampleVenue, category: 'park', facilities: ['outdoor_play'] },
        createVenueWithCategory('museum', 'Museum')
      ];

      const alternatives = getOutdoorVenueAlternatives(venues, sampleWeather);
      expect(alternatives.length).toBeGreaterThan(0);
    });

    it('should return empty for cold weather', () => {
      const venues = [sampleVenue];
      const coldWeather: WeatherData = {
        ...sampleWeather,
        temperature: 8
      };

      const alternatives = getOutdoorVenueAlternatives(venues, coldWeather);
      expect(alternatives).toHaveLength(0);
    });
  });

  describe('getWeatherBasedActivitySuggestions', () => {
    it('should provide sunny weather suggestions in English', () => {
      const suggestions = getWeatherBasedActivitySuggestions(sampleWeather, undefined, 'en');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toContain('outdoor');
    });

    it('should provide rainy weather suggestions', () => {
      const rainySample: WeatherData = {
        ...sampleWeather,
        condition: 'rainy'
      };

      const suggestions = getWeatherBasedActivitySuggestions(rainySample, undefined, 'en');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].toLowerCase()).toContain('indoor');
    });

    it('should provide bilingual suggestions', () => {
      const suggestionsZh = getWeatherBasedActivitySuggestions(sampleWeather, undefined, 'zh');
      const suggestionsEn = getWeatherBasedActivitySuggestions(sampleWeather, undefined, 'en');

      expect(suggestionsZh.length).toBe(suggestionsEn.length);
      expect(suggestionsZh[0]).not.toBe(suggestionsEn[0]);
    });
  });

  describe('formatWeatherCondition', () => {
    it('should format weather condition in English', () => {
      expect(formatWeatherCondition('sunny', 'en')).toBe('Sunny');
      expect(formatWeatherCondition('rainy', 'en')).toBe('Rainy');
      expect(formatWeatherCondition('cloudy', 'en')).toBe('Cloudy');
      expect(formatWeatherCondition('snow', 'en')).toBe('Snowy');
    });

    it('should format weather condition in Chinese', () => {
      expect(formatWeatherCondition('sunny', 'zh')).toBe('晴天');
      expect(formatWeatherCondition('rainy', 'zh')).toBe('下雨');
      expect(formatWeatherCondition('cloudy', 'zh')).toBe('多雲');
    });

    it('should default to English', () => {
      expect(formatWeatherCondition('sunny')).toBe('Sunny');
    });
  });

  describe('Edge cases and scenarios', () => {
    it('should handle extreme heat appropriately', () => {
      const extremeHeat: WeatherData = {
        ...sampleWeather,
        temperature: 40,
        uvi: 12
      };

      const venues = [
        { ...sampleVenue, category: 'park' },
        { ...sampleVenue, id: 'museum', category: 'museum', facilities: ['indoor_activities'] }
      ];

      const recommendations = recommendVenuesByWeather(venues, extremeHeat);
      expect(recommendations[0].id).toBe('museum');
    });

    it('should handle extreme cold appropriately', () => {
      const extremeCold: WeatherData = {
        ...sampleWeather,
        temperature: -10,
        condition: 'snow'
      };

      const venues = [
        { ...sampleVenue, category: 'park' },
        { ...sampleVenue, id: 'shopping', category: 'shopping_mall', facilities: ['indoor'] }
      ];

      const recommendations = recommendVenuesByWeather(venues, extremeCold);
      expect(recommendations[0].id).toBe('shopping');
    });

    it('should handle high humidity', () => {
      const humid: WeatherData = {
        ...sampleWeather,
        humidity: 90,
        temperature: 28
      };

      const scores = getWeatherActivityScores(humid, ['outdoor_play']);
      expect(scores[0].warnings).toBeDefined();
    });

    it('should handle zero visibility', () => {
      const foggy: WeatherData = {
        ...sampleWeather,
        visibility: 0.5,
        condition: 'cloudy'
      };

      const scores = getWeatherActivityScores(foggy, ['hiking']);
      expect(scores[0].score).toBeLessThan(50);
    });
  });
});
