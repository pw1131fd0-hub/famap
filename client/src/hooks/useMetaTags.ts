/**
 * Hook for managing meta tags dynamically
 */

import { useEffect } from 'react';
import { updateMetaTags, resetMetaTags, generateLocationMetaTags, generateLocationSchema, injectSchema, type MetaTagConfig } from '../utils/metaTagManager';
import type { Location } from '../types';

/**
 * Hook to update meta tags for a page or location
 */
export function useMetaTags(config: MetaTagConfig | null): void {
  useEffect(() => {
    if (config) {
      updateMetaTags(config);
    } else {
      resetMetaTags();
    }
  }, [config]);
}

/**
 * Hook to update meta tags for a location detail page
 */
export function useLocationMetaTags(location: Location | null, language: 'zh' | 'en'): void {
  useEffect(() => {
    if (location) {
      const config = generateLocationMetaTags(location, language);
      updateMetaTags(config);

      // Also inject structured data
      const schema = generateLocationSchema(location, language);
      injectSchema(schema);
    } else {
      resetMetaTags();
    }
  }, [location, language]);
}
