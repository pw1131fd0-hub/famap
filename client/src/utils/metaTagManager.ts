/**
 * Meta Tag Manager - Dynamic SEO and Open Graph tag management
 * Enables proper social sharing and search engine optimization
 */

import type { Location, OperatingHours } from '../types';

export interface MetaTagConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  locale?: string;
}

/**
 * Update meta tags for SEO and social sharing
 */
export function updateMetaTags(config: MetaTagConfig): void {
  // Update basic meta tags
  updateMetaTag('name', 'description', config.description);
  updateMetaTag('name', 'keywords', config.keywords?.join(',') || '');

  // Update Open Graph tags for social sharing
  updateOrCreateMetaTag('property', 'og:title', config.title);
  updateOrCreateMetaTag('property', 'og:description', config.description);
  updateOrCreateMetaTag('property', 'og:type', config.type || 'website');
  updateOrCreateMetaTag('property', 'og:locale', config.locale || 'zh_TW');

  if (config.image) {
    updateOrCreateMetaTag('property', 'og:image', config.image);
  }

  if (config.url) {
    updateOrCreateMetaTag('property', 'og:url', config.url);
  }

  // Update Twitter Card tags
  updateOrCreateMetaTag('name', 'twitter:title', config.title);
  updateOrCreateMetaTag('name', 'twitter:description', config.description);
  updateOrCreateMetaTag('name', 'twitter:card', 'summary_large_image');

  if (config.image) {
    updateOrCreateMetaTag('name', 'twitter:image', config.image);
  }

  // Update page title
  document.title = config.title;
}

/**
 * Reset meta tags to default values
 */
export function resetMetaTags(): void {
  updateMetaTags({
    title: 'FamMap 親子地圖 - 發現家庭友善地點',
    description: '發現台灣最完善的親子友善地點。從公園、育嬰室到家庭餐廳，FamMap 幫助家長規劃完美的家庭出遊。',
    keywords: ['親子', '育嬰室', '公園', '家庭', '台灣', '地圖'],
    image: '/og-image.png',
    url: window.location.href,
    locale: 'zh_TW'
  });
}

/**
 * Generate meta tags for a location
 */
export function generateLocationMetaTags(location: Location, language: 'zh' | 'en'): MetaTagConfig {
  const name = location.name[language];
  const description = location.description?.[language] ||
    `${name} - 台灣親子地點 | 查看地址、評價、設施等詳細資訊`;
  const address = location.address?.[language] || '';

  const keywords = [
    name,
    location.category,
    address,
    '親子',
    '家庭',
    '台灣'
  ].filter(Boolean);

  // Get first review photo as image, fallback to default OG image
  const image = '/og-image.png';

  return {
    title: `${name} - FamMap 親子地圖`,
    description: description.substring(0, 160), // Meta description should be < 160 chars
    keywords,
    image,
    url: `${window.location.origin}/location/${location.id}`,
    type: 'article',
    locale: language === 'zh' ? 'zh_TW' : 'en_US'
  };
}

/**
 * Helper to update or create a meta tag
 */
function updateOrCreateMetaTag(attrName: string, attrValue: string, content: string): void {
  let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

/**
 * Helper to update existing meta tag
 */
function updateMetaTag(attrName: string, attrValue: string, content: string): void {
  updateOrCreateMetaTag(attrName, attrValue, content);
}

/**
 * Generate JSON-LD structured data for a location
 */
export function generateLocationSchema(location: Location, language: 'zh' | 'en') {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: location.name[language],
    description: location.description?.[language],
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address?.[language],
      addressCountry: 'TW'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.coordinates.lat,
      longitude: location.coordinates.lng
    },
    url: `${window.location.origin}/location/${location.id}`,
    image: '/og-image.png',
    areaServed: 'Taiwan'
  };

  // Add optional properties if they exist
  if (location.averageRating) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: location.averageRating,
      ratingCount: 1 // Default to 1 since we don't have review count
    };
  }

  if (location.phoneNumber) {
    schema.telephone = location.phoneNumber;
  }

  if (location.operatingHours) {
    schema.openingHoursSpecification = generateOpeningHours(location.operatingHours);
  }

  if (location.pricing?.priceRange) {
    schema.priceRange = location.pricing.priceRange;
  }

  return schema;
}

/**
 * Convert location hours to schema.org format
 */
function generateOpeningHours(hours: OperatingHours) {
  const specs: Record<string, any>[] = [];
  const hoursAsRecord = hours as Record<string, string | undefined>;

  Object.entries(hoursAsRecord).forEach(([day, time]) => {
    if (time && time.includes('-')) {
      const [opens, closes] = time.split('-').map((t: string) => t.trim());
      specs.push({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: mapDayToSchema(day),
        opens,
        closes
      });
    }
  });

  return specs;
}

/**
 * Map day names to schema.org format
 */
function mapDayToSchema(day: string): string {
  const dayMap: Record<string, string> = {
    '一': 'Monday',
    '二': 'Tuesday',
    '三': 'Wednesday',
    '四': 'Thursday',
    '五': 'Friday',
    '六': 'Saturday',
    '日': 'Sunday'
  };
  return dayMap[day] || day;
}

/**
 * Inject JSON-LD schema into page head
 */
export function injectSchema(schema: object): void {
  // Remove existing schema script if present
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) {
    existing.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}
