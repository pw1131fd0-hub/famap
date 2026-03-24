/**
 * Environment Configuration & Validation
 * Ensures proper environment setup and provides safe config access
 */

import { addBreadcrumb, captureException } from './sentryConfig';

export interface EnvironmentConfig {
  isDev: boolean;
  isProd: boolean;
  apiBaseUrl: string;
  appVersion: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class EnvironmentManager {
  private config: EnvironmentConfig | null = null;
  private isValidated = false;
  private errors: string[] = [];

  /**
   * Initialize and validate environment
   */
  init(): EnvironmentConfig {
    if (this.config && this.isValidated) {
      return this.config;
    }

    try {
      this.config = this.buildConfig();
      this.validate();
      this.isValidated = true;

      addBreadcrumb(
        'Environment configuration initialized',
        'info',
        'environment',
        {
          isDev: this.config.isDev,
          isProd: this.config.isProd,
          apiBaseUrl: this.config.apiBaseUrl,
        }
      );

      return this.config;
    } catch (error) {
      const errorMsg = `Environment configuration failed: ${String(error)}`;
      captureException(new Error(errorMsg));
      addBreadcrumb(errorMsg, 'error', 'environment');
      throw new Error(errorMsg);
    }
  }

  /**
   * Build configuration from environment variables
   */
  private buildConfig(): EnvironmentConfig {
    const isDev = import.meta.env.DEV;
    const isProd = import.meta.env.PROD;

    // Get API base URL from env or use defaults
    let apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;
    if (!apiBaseUrl) {
      // Use relative URL in production, localhost in dev
      apiBaseUrl = isProd ? '/api' : 'http://localhost:8000/api';
    }

    const appVersion = import.meta.env.VITE_APP_VERSION as string || '1.0.0';
    const logLevel = (import.meta.env.VITE_LOG_LEVEL as any) || (isDev ? 'debug' : 'info');

    return {
      isDev,
      isProd,
      apiBaseUrl,
      appVersion,
      logLevel,
    };
  }

  /**
   * Validate configuration
   */
  private validate(): void {
    if (!this.config) {
      throw new Error('Configuration not initialized');
    }

    // Validate API URL
    if (!this.config.apiBaseUrl) {
      this.errors.push('API base URL is not configured');
    }

    // Validate log level
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(this.config.logLevel)) {
      this.errors.push(`Invalid log level: ${this.config.logLevel}`);
    }

    // Log validation issues
    if (this.errors.length > 0) {
      addBreadcrumb(
        `Environment validation warnings: ${this.errors.join(', ')}`,
        'warning',
        'environment'
      );
    }
  }

  /**
   * Get configuration (after validation)
   */
  getConfig(): EnvironmentConfig {
    if (!this.config || !this.isValidated) {
      return this.init();
    }
    return this.config;
  }

  /**
   * Get API base URL
   */
  getApiBaseUrl(): string {
    return this.getConfig().apiBaseUrl;
  }

  /**
   * Check if development mode
   */
  isDevelopment(): boolean {
    return this.getConfig().isDev;
  }

  /**
   * Check if production mode
   */
  isProduction(): boolean {
    return this.getConfig().isProd;
  }

  /**
   * Get app version
   */
  getAppVersion(): string {
    return this.getConfig().appVersion;
  }

  /**
   * Get log level
   */
  getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
    return this.getConfig().logLevel;
  }

  /**
   * Get validation errors
   */
  getErrors(): string[] {
    return [...this.errors];
  }

  /**
   * Reset configuration (useful for testing)
   */
  reset(): void {
    this.config = null;
    this.isValidated = false;
    this.errors = [];
  }

  /**
   * Get full environment summary
   */
  getSummary() {
    const config = this.getConfig();
    return {
      ...config,
      validationErrors: this.errors,
      isValidated: this.isValidated,
    };
  }
}

// Create singleton instance
const envManager = new EnvironmentManager();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  try {
    envManager.init();
  } catch (error) {
    // Error already logged via captureException and addBreadcrumb
  }
}

export const initializeEnv = () => envManager.init();
export const getEnvConfig = () => envManager.getConfig();
export const getApiBaseUrl = () => envManager.getApiBaseUrl();
export const isDevelopment = () => envManager.isDevelopment();
export const isProduction = () => envManager.isProduction();

export default envManager;
