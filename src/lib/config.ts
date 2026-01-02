// Enhanced type-safe configuration management
export interface AppConfig {
  database: {
    url: string;
    ssl?: boolean;
    connectionLimit?: number;
  };
  auth: {
    secret: string;
    url: string;
    sessionMaxAge: number;
  };
  security: {
    corsOrigins: string[];
    rateLimitWindow: number;
    maxRequestsPerWindow: number;
  };
  features: {
    enableDebugMode: boolean;
    enableAnalytics: boolean;
    enableFileUploads: boolean;
  };
}

export const config: AppConfig = {
  database: {
    url: process.env.DATABASE_URL || '',
    ssl: process.env.NODE_ENV === 'production',
    connectionLimit: 10,
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET || '',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    sessionMaxAge: 24 * 60 * 60, // 24 hours
  },
  security: {
    corsOrigins: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000'],
    rateLimitWindow: 60 * 1000, // 1 minute
    maxRequestsPerWindow: 100,
  },
  features: {
    enableDebugMode: process.env.NODE_ENV === 'development',
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableFileUploads: true,
  },
};

// Validation helpers
export const validateConfig = (): void => {
  if (!config.database.url) {
    throw new Error('DATABASE_URL is required');
  }
  if (!config.auth.secret || config.auth.secret.length < 32) {
    throw new Error('NEXTAUTH_SECRET must be at least 32 characters');
  }
  if (!config.auth.url) {
    throw new Error('NEXTAUTH_URL is required');
  }
};

export const isProduction = (): boolean => process.env.NODE_ENV === 'production';
export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';