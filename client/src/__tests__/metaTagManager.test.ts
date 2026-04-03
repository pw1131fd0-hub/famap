/**
 * Tests for meta tag manager
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { updateMetaTags, resetMetaTags, type MetaTagConfig } from '../utils/metaTagManager';

describe('metaTagManager', () => {
  beforeEach(() => {
    document.title = '';
    // Clear any existing meta tags
    const existingTags = document.querySelectorAll('meta');
    existingTags.forEach((tag) => {
      if (tag.getAttribute('name')?.startsWith('description') ||
          tag.getAttribute('name')?.startsWith('keywords') ||
          tag.getAttribute('property')?.startsWith('og:') ||
          tag.getAttribute('name')?.startsWith('twitter:')) {
        tag.remove();
      }
    });
  });

  afterEach(() => {
    // Cleanup
    document.title = '';
    const existingTags = document.querySelectorAll('meta');
    existingTags.forEach((tag) => {
      if (tag.getAttribute('name')?.startsWith('description') ||
          tag.getAttribute('name')?.startsWith('keywords') ||
          tag.getAttribute('property')?.startsWith('og:') ||
          tag.getAttribute('name')?.startsWith('twitter:')) {
        tag.remove();
      }
    });
  });

  describe('updateMetaTags', () => {
    it('should update page title', () => {
      const config = {
        title: 'Test Location | FamMap',
        description: 'This is a test location'
      };
      updateMetaTags(config);
      expect(document.title).toBe('Test Location | FamMap');
    });

    it('should update meta description', () => {
      const config = {
        title: 'Test',
        description: 'Test description'
      };
      updateMetaTags(config);
      const metaTag = document.querySelector('meta[name="description"]');
      expect(metaTag?.getAttribute('content')).toBe('Test description');
    });

    it('should update keywords meta tag', () => {
      const config = {
        title: 'Test',
        description: 'Test',
        keywords: ['playground', 'park', 'family']
      };
      updateMetaTags(config);
      const metaTag = document.querySelector('meta[name="keywords"]');
      expect(metaTag?.getAttribute('content')).toContain('playground');
      expect(metaTag?.getAttribute('content')).toContain('park');
      expect(metaTag?.getAttribute('content')).toContain('family');
    });

    it('should update Open Graph tags', () => {
      const config: MetaTagConfig = {
        title: 'Test Park',
        description: 'A beautiful park',
        type: 'article'
      };
      updateMetaTags(config);

      expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content'))
        .toBe('Test Park');
      expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content'))
        .toBe('A beautiful park');
      expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content'))
        .toBe('article');
    });

    it('should set default og:type to website', () => {
      const config = {
        title: 'Test',
        description: 'Test'
      };
      updateMetaTags(config);
      expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content'))
        .toBe('website');
    });

    it('should set default og:locale to zh_TW', () => {
      const config = {
        title: 'Test',
        description: 'Test'
      };
      updateMetaTags(config);
      expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content'))
        .toBe('zh_TW');
    });

    it('should update og:image if provided', () => {
      const config = {
        title: 'Test',
        description: 'Test',
        image: 'https://example.com/image.jpg'
      };
      updateMetaTags(config);
      expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content'))
        .toBe('https://example.com/image.jpg');
    });

    it('should update og:url if provided', () => {
      const config = {
        title: 'Test',
        description: 'Test',
        url: 'https://fammap.com/locations/123'
      };
      updateMetaTags(config);
      expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content'))
        .toBe('https://fammap.com/locations/123');
    });

    it('should update Twitter Card tags', () => {
      const config = {
        title: 'Test Location',
        description: 'Test location description'
      };
      updateMetaTags(config);

      expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content'))
        .toBe('Test Location');
      expect(document.querySelector('meta[name="twitter:description"]')?.getAttribute('content'))
        .toBe('Test location description');
      expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'))
        .toBe('summary_large_image');
    });

    it('should update twitter:image if provided', () => {
      const config = {
        title: 'Test',
        description: 'Test',
        image: 'https://example.com/image.jpg'
      };
      updateMetaTags(config);
      expect(document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'))
        .toBe('https://example.com/image.jpg');
    });

    it('should support custom locale', () => {
      const config = {
        title: 'Test',
        description: 'Test',
        locale: 'en_US'
      };
      updateMetaTags(config);
      expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content'))
        .toBe('en_US');
    });

    it('should handle multiple calls without duplicating tags', () => {
      const config1 = {
        title: 'First Title',
        description: 'First description'
      };
      const config2 = {
        title: 'Second Title',
        description: 'Second description'
      };

      updateMetaTags(config1);
      updateMetaTags(config2);

      // Should have only one title tag with updated value
      const titleTags = document.querySelectorAll('meta[property="og:title"]');
      expect(titleTags.length).toBeGreaterThan(0);
      expect(titleTags[titleTags.length - 1].getAttribute('content')).toBe('Second Title');
    });

    it('should handle empty keywords array', () => {
      const config = {
        title: 'Test',
        description: 'Test',
        keywords: []
      };
      updateMetaTags(config);
      const metaTag = document.querySelector('meta[name="keywords"]');
      expect(metaTag?.getAttribute('content')).toBe('');
    });
  });

  describe('resetMetaTags', () => {
    it('should reset to default FamMap values', () => {
      // First set custom values
      updateMetaTags({
        title: 'Custom Title',
        description: 'Custom description'
      });

      // Then reset
      resetMetaTags();

      // Check title contains FamMap
      expect(document.title).toContain('FamMap');
      expect(document.title).toContain('親子地圖');
    });

    it('should reset to default description', () => {
      // First set custom values
      updateMetaTags({
        title: 'Custom Title',
        description: 'Custom description'
      });

      // Then reset
      resetMetaTags();

      // Check description
      const metaTag = document.querySelector('meta[name="description"]');
      expect(metaTag?.getAttribute('content')).toContain('台灣');
      expect(metaTag?.getAttribute('content')).toContain('親子');
    });

    it('should reset default keywords', () => {
      // First set custom values
      updateMetaTags({
        title: 'Custom Title',
        description: 'Custom description'
      });

      // Then reset
      resetMetaTags();

      // Check keywords include expected values
      const metaTag = document.querySelector('meta[name="keywords"]');
      const content = metaTag?.getAttribute('content') || '';
      expect(content).toContain('親子');
    });

    it('should restore default Open Graph tags', () => {
      // First set custom values
      updateMetaTags({
        title: 'Custom Title',
        description: 'Custom description',
        type: 'article'
      });

      // Then reset
      resetMetaTags();

      // Check og:type is default (website or not article)
      const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content');
      expect(ogType).toBe('website');
    });

    it('should restore to zh_TW locale', () => {
      // First set custom values
      updateMetaTags({
        title: 'Custom Title',
        description: 'Custom description',
        locale: 'en_US'
      });

      // Then reset
      resetMetaTags();

      // Check locale is reset
      const locale = document.querySelector('meta[property="og:locale"]')?.getAttribute('content');
      expect(locale).toBe('zh_TW');
    });
  });

  describe('integration scenarios', () => {
    it('should handle location detail page', () => {
      const config: MetaTagConfig = {
        title: '台北大安森林公園 | FamMap 親子地圖',
        description: '台北大安森林公園 - 台灣最好的親子地點之一。有遊樂場、步道、休息區。',
        keywords: ['森林公園', '台北', '遊樂場', '親子', '台灣'],
        image: 'https://fammap.com/images/park.jpg',
        url: 'https://fammap.com/locations/park-123',
        type: 'article',
        locale: 'zh_TW'
      };

      updateMetaTags(config);

      // Verify all tags were set
      expect(document.title).toContain('台北大安森林公園');
      expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('遊樂場');
      expect(document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toContain('park.jpg');
      expect(document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toContain('park-123');
    });

    it('should handle location list page', () => {
      const config: MetaTagConfig = {
        title: '台北市親子地點 | FamMap 親子地圖',
        description: '發現台北市的所有親子友善地點 - 公園、餐廳、育嬰室等',
        keywords: ['台北', '親子', '公園', '餐廳'],
        type: 'website',
        locale: 'zh_TW'
      };

      updateMetaTags(config);

      expect(document.title).toContain('台北市');
      const ogType = document.querySelector('meta[property="og:type"]')?.getAttribute('content');
      expect(ogType).toBe('website');
    });
  });
});
