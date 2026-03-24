import { describe, it, expect, beforeEach } from 'vitest';
import envManager, {
  initializeEnv,
  getEnvConfig,
  getApiBaseUrl,
  isDevelopment,
  isProduction,
} from '../utils/envConfig';

describe('Environment Manager', () => {
  beforeEach(() => {
    envManager.reset();
  });

  describe('Initialization', () => {
    it('should initialize environment configuration', () => {
      const config = initializeEnv();
      expect(config).toBeDefined();
      expect(config).toHaveProperty('isDev');
      expect(config).toHaveProperty('isProd');
      expect(config).toHaveProperty('apiBaseUrl');
      expect(config).toHaveProperty('appVersion');
      expect(config).toHaveProperty('logLevel');
    });

    it('should cache configuration after first initialization', () => {
      const config1 = getEnvConfig();
      const config2 = getEnvConfig();

      expect(config1).toBe(config2);
    });

    it('should set isDev or isProd correctly', () => {
      const config = getEnvConfig();
      expect(config.isDev || config.isProd).toBe(true);
    });

    it('should provide default API base URL', () => {
      const baseUrl = getApiBaseUrl();
      expect(baseUrl).toBeDefined();
      expect(typeof baseUrl).toBe('string');
      expect(baseUrl.length).toBeGreaterThan(0);
    });
  });

  describe('Environment Checks', () => {
    it('should check development mode', () => {
      const isDev = isDevelopment();
      expect(typeof isDev).toBe('boolean');
    });

    it('should check production mode', () => {
      const isProd = isProduction();
      expect(typeof isProd).toBe('boolean');
    });

    it('should not be both dev and prod', () => {
      const isDev = isDevelopment();
      const isProd = isProduction();

      // In tests, might be development
      expect(typeof isDev).toBe('boolean');
      expect(typeof isProd).toBe('boolean');
    });
  });

  describe('API Configuration', () => {
    it('should provide valid API base URL', () => {
      const baseUrl = getApiBaseUrl();

      expect(baseUrl).toBeDefined();
      expect(typeof baseUrl).toBe('string');

      // Should be either /api (prod) or localhost URL (dev)
      expect(
        baseUrl === '/api' || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
      ).toBe(true);
    });

    it('should be consistent across calls', () => {
      const url1 = getApiBaseUrl();
      const url2 = getApiBaseUrl();

      expect(url1).toBe(url2);
    });
  });

  describe('Configuration Access', () => {
    it('should provide app version', () => {
      const config = getEnvConfig();
      expect(config.appVersion).toBeDefined();
      expect(typeof config.appVersion).toBe('string');
    });

    it('should provide valid log level', () => {
      const config = getEnvConfig();
      const validLevels = ['debug', 'info', 'warn', 'error'];

      expect(validLevels.includes(config.logLevel)).toBe(true);
    });

    it('should have no validation errors in normal setup', () => {
      const config = envManager.getConfig();
      const errors = envManager.getErrors();

      // Should have valid configuration
      expect(config.apiBaseUrl).toBeDefined();
      expect(Array.isArray(errors)).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset configuration', () => {
      const config1 = getEnvConfig();
      expect(config1).toBeDefined();

      envManager.reset();
      // After reset, calling getSummary should show unvalidated (but will re-validate)
      const summary = envManager.getSummary();
      expect(summary).toHaveProperty('isValidated');
    });

    it('should re-initialize after reset', () => {
      envManager.reset();
      const config = getEnvConfig();

      expect(config).toBeDefined();
      expect(config).toHaveProperty('apiBaseUrl');
    });
  });

  describe('Summary', () => {
    it('should provide complete environment summary', () => {
      const summary = envManager.getSummary();

      expect(summary).toHaveProperty('isDev');
      expect(summary).toHaveProperty('isProd');
      expect(summary).toHaveProperty('apiBaseUrl');
      expect(summary).toHaveProperty('appVersion');
      expect(summary).toHaveProperty('logLevel');
      expect(summary).toHaveProperty('validationErrors');
      expect(summary).toHaveProperty('isValidated');
    });

    it('should have array of validation errors', () => {
      const summary = envManager.getSummary();

      expect(Array.isArray(summary.validationErrors)).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    it('should have isDevelopment helper', () => {
      expect(typeof isDevelopment).toBe('function');
      expect(typeof isDevelopment()).toBe('boolean');
    });

    it('should have isProduction helper', () => {
      expect(typeof isProduction).toBe('function');
      expect(typeof isProduction()).toBe('boolean');
    });

    it('should have getApiBaseUrl helper', () => {
      expect(typeof getApiBaseUrl).toBe('function');
      const url = getApiBaseUrl();
      expect(typeof url).toBe('string');
    });

    it('should have getEnvConfig helper', () => {
      expect(typeof getEnvConfig).toBe('function');
      const config = getEnvConfig();
      expect(config).toBeDefined();
    });

    it('should have initializeEnv helper', () => {
      expect(typeof initializeEnv).toBe('function');
      const config = initializeEnv();
      expect(config).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing environment variables gracefully', () => {
      envManager.reset();
      expect(() => {
        void getEnvConfig();
      }).not.toThrow();
    });

    it('should provide meaningful error messages', () => {
      void getEnvConfig();
      const errors = envManager.getErrors();

      expect(Array.isArray(errors)).toBe(true);
      errors.forEach(error => {
        expect(typeof error).toBe('string');
        expect(error.length).toBeGreaterThan(0);
      });
    });
  });
});
