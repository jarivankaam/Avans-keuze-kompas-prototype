/**
 * ConfigManager - Singleton Pattern
 * Centralized configuration management for the application
 * Provides type-safe access to environment variables and app settings
 */
class ConfigManager {
  private static instance: ConfigManager;

  // API Configuration
  readonly API_BASE: string;
  readonly API_TIMEOUT: number;

  // Authentication Configuration
  readonly TOKEN_KEY: string;
  readonly TOKEN_REFRESH_THRESHOLD: number; // Minutes before expiry to refresh

  // Application Configuration
  readonly APP_NAME: string;
  readonly IS_DEVELOPMENT: boolean;
  readonly IS_PRODUCTION: boolean;

  /**
   * Private constructor to prevent direct instantiation
   * Use ConfigManager.getInstance() instead
   */
  private constructor() {
    // API Configuration
    this.API_BASE =
      process.env.NEXT_PUBLIC_API_BASE ||
      "https://akk-backend.panel.evonix-development.tech";
    this.API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

    // Authentication Configuration
    this.TOKEN_KEY = "token";
    this.TOKEN_REFRESH_THRESHOLD = 5; // Refresh token 5 minutes before expiry

    // Application Configuration
    this.APP_NAME = "Avans Keuze Kompas";
    this.IS_DEVELOPMENT = process.env.NODE_ENV === "development";
    this.IS_PRODUCTION = process.env.NODE_ENV === "production";
  }

  /**
   * Get the singleton instance of ConfigManager
   * Creates the instance if it doesn't exist
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get the full API URL for an endpoint
   * @param endpoint - The API endpoint (e.g., '/vkm' or 'vkm')
   * @returns The full URL
   */
  getApiUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    return `${this.API_BASE}${cleanEndpoint}`;
  }

  /**
   * Check if a feature flag is enabled
   * Useful for future feature toggles
   */
  isFeatureEnabled(feature: string): boolean {
    const featureFlag =
      process.env[`NEXT_PUBLIC_FEATURE_${feature.toUpperCase()}`];
    return featureFlag === "true";
  }
}

// Export singleton instance getter
export const getConfig = () => ConfigManager.getInstance();

// Export class for testing purposes
export default ConfigManager;
