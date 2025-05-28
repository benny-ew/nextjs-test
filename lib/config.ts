/**
 * Application configuration utilities
 * Centralizes environment variable management and provides type safety
 */

export interface ApiConfig {
  baseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

/**
 * Get the current environment
 */
function getEnvironment(): 'development' | 'staging' | 'production' {
  if (process.env.NODE_ENV === 'development') return 'development';
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging') return 'staging';
  return 'production';
}

/**
 * Get API configuration from environment variables
 */
export function getApiConfig(): ApiConfig {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const environment = getEnvironment();

  return {
    baseUrl,
    environment,
  };
}

/**
 * Validate required environment variables
 */
export function validateEnvironment(): string[] {
  const errors: string[] = [];
  
  const config = getApiConfig();
  
  // Validate API URL format
  try {
    new URL(config.baseUrl);
  } catch {
    errors.push(`Invalid API URL: ${config.baseUrl}`);
  }
  
  return errors;
}

/**
 * Log configuration for debugging
 */
export function logConfiguration(): void {
  const config = getApiConfig();
  const errors = validateEnvironment();
  
  console.group('🔧 Application Configuration');
  console.log('Environment:', config.environment);
  console.log('API Base URL:', config.baseUrl);
  
  if (errors.length > 0) {
    console.warn('⚠️ Configuration Issues:');
    errors.forEach(error => console.warn(`  - ${error}`));
  } else {
    console.log('✅ Configuration is valid');
  }
  
  console.groupEnd();
}
