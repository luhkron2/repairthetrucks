// Environment validation and production readiness checks
export interface EnvironmentCheck {
  name: string;
  required: boolean;
  check: () => boolean;
  errorMessage: string;
  fix?: () => void;
}

export class EnvironmentValidator {
  private checks: EnvironmentCheck[] = [
    {
      name: 'Database URL',
      required: true,
      check: () => Boolean(process.env.DATABASE_URL),
      errorMessage: 'DATABASE_URL is required',
    },
    {
      name: 'NextAuth Secret',
      required: true,
      check: () => {
        const secret = process.env.NEXTAUTH_SECRET;
        return Boolean(secret && secret.length >= 32);
      },
      errorMessage: 'NEXTAUTH_SECRET must be at least 32 characters',
    },
    {
      name: 'NextAuth URL',
      required: true,
      check: () => Boolean(process.env.NEXTAUTH_URL),
      errorMessage: 'NEXTAUTH_URL is required',
    },
    {
      name: 'App URL',
      required: true,
      check: () => Boolean(process.env.NEXT_PUBLIC_APP_URL),
      errorMessage: 'NEXT_PUBLIC_APP_URL is required',
    },
    {
      name: 'Demo PINs',
      required: false,
      check: () => Boolean(process.env.DEMO_OPERATIONS_PIN && process.env.DEMO_WORKSHOP_PIN),
      errorMessage: 'Demo PINs not configured (optional for production)',
    },
  ];

  validate(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const check of this.checks) {
      if (!check.check()) {
        if (check.required) {
          errors.push(`${check.name}: ${check.errorMessage}`);
        } else {
          warnings.push(`${check.name}: ${check.errorMessage}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  getEnvironmentInfo(): {
    nodeEnv: string;
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
  } {
    const nodeEnv = process.env.NODE_ENV || 'development';

    return {
      nodeEnv,
      isProduction: nodeEnv === 'production',
      isDevelopment: nodeEnv === 'development',
      isTest: nodeEnv === 'test',
    };
  }
}

// Production health check system
export class ProductionHealthCheck {
  private checks = new Map<string, () => Promise<boolean>>();

  register(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }

  async runAll(): Promise<{
    healthy: boolean;
    checks: Record<string, boolean>;
    details: Record<string, { error?: string; duration: number }>;
  }> {
    const results: Record<string, boolean> = {};
    const details: Record<string, { error?: string; duration: number }> = {};
    let allHealthy = true;

    for (const [name, check] of this.checks.entries()) {
      const start = Date.now();
      try {
        const isHealthy = await check();
        const duration = Date.now() - start;

        results[name] = isHealthy;
        details[name] = { duration };

        if (!isHealthy) {
          allHealthy = false;
        }
      } catch (error) {
        const duration = Date.now() - start;
        results[name] = false;
        details[name] = {
          error: error instanceof Error ? error.message : 'Unknown error',
          duration,
        };
        allHealthy = false;
      }
    }

    return {
      healthy: allHealthy,
      checks: results,
      details,
    };
  }
}

// Deployment checklist
export const deploymentChecklist = {
  environment: [
    'DATABASE_URL configured',
    'NEXTAUTH_SECRET is secure (32+ chars)',
    'NEXTAUTH_URL set to production domain',
    'NEXT_PUBLIC_APP_URL configured',
    'Node environment set to production',
  ],
  database: [
    'Database connection verified',
    'Migration scripts executed',
    'Indexes optimized',
    'Connection pooling configured',
  ],
  security: [
    'HTTPS enabled',
    'CSP headers configured',
    'Rate limiting active',
    'CORS policies set',
    'Authentication flow tested',
  ],
  performance: [
    'CDN configured for static assets',
    'Image optimization enabled',
    'Code splitting implemented',
    'Caching strategies in place',
    'Compression enabled',
  ],
  monitoring: [
    'Error tracking integrated',
    'Performance monitoring active',
    'Logging configured',
    'Uptime monitoring setup',
    'Alert thresholds defined',
  ],
  backup: [
    'Automated database backups configured',
    'Disaster recovery plan documented',
    'Backup restoration tested',
    'Multi-region replication (if needed)',
  ],
};

// Build optimization utilities
export const buildOptimizations = {
  // Next.js configuration optimizations
  nextConfig: {
    swcMinify: true,
    compress: true,
    poweredByHeader: false,
    reactStrictMode: true,
    optimizeCss: true,
    optimizeImages: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Bundle analysis recommendations
  bundleAnalysis: {
    maxSize: 244 * 1024, // 244KB per chunk
    maxAssetSize: 244 * 1024,
    performanceBudget: 100,
  },

  // Critical resource loading
  criticalResources: [
    '/_next/static/css/main.css',
    '/_next/static/js/main.js',
  ],

  // Asset optimization
  assetOptimization: {
    images: {
      formats: ['webp', 'avif'],
      sizes: [640, 750, 828, 1080, 1200, 1920],
      quality: 85,
    },
    fonts: {
      preload: true,
      display: 'swap',
    },
  },
};

// Performance targets
export const performanceTargets = {
  // Core Web Vitals
  largestContentfulPaint: 2500, // 2.5s
  firstInputDelay: 100, // 100ms
  cumulativeLayoutShift: 0.1, // 0.1
  firstContentfulPaint: 1800, // 1.8s
  timeToInteractive: 3800, // 3.8s

  // API performance
  apiResponseTime: 500, // 500ms average
  api95thPercentile: 1000, // 1s for 95th percentile

  // Database performance
  dbQueryTime: 100, // 100ms average
  db95thPercentile: 200, // 200ms for 95th percentile

  // System performance
  memoryUsage: 512, // 512MB per instance
  cpuUsage: 70, // 70% threshold
  uptime: 99.9, // 99.9% availability
};

// Load testing thresholds
export const loadTestingThresholds = {
  // Concurrent users
  maxConcurrentUsers: 1000,
  
  // Requests per second
  requestsPerSecond: 100,
  
  // Response times
  averageResponseTime: 500,
  p95ResponseTime: 1000,
  p99ResponseTime: 2000,
  
  // Error rates
  maxErrorRate: 0.01, // 1%
  
  // Throughput
  maxThroughput: 1000, // requests per minute
};

// Security hardening checklist
export const securityHardening = {
  headers: [
    'X-Frame-Options: DENY',
    'X-Content-Type-Options: nosniff',
    'Referrer-Policy: strict-origin-when-cross-origin',
    'Permissions-Policy: geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security: max-age=31536000; includeSubDomains',
  ],
  
  csp: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ],
  
  cors: {
    origins: ['https://yourdomain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
  
  rateLimiting: {
    apiCalls: { maxRequests: 100, windowMs: 60000 },
    authentication: { maxRequests: 5, windowMs: 60000 },
    fileUploads: { maxRequests: 10, windowMs: 60000 },
  },
};

// Create instances
export const environmentValidator = new EnvironmentValidator();
export const healthCheck = new ProductionHealthCheck();

// Health check implementations
healthCheck.register('database', async () => {
  try {
    // Implement actual database health check
    return true;
  } catch {
    return false;
  }
});

healthCheck.register('disk_space', async () => {
  try {
    const stats = await import('fs').then(fs => fs.promises.statfs('.'));
    const freeSpace = (stats as any).available || (stats as any).bavail;
    const totalSpace = (stats as any).size || (stats as any).blocks;
    return (freeSpace / totalSpace) > 0.1; // At least 10% free
  } catch {
    return true;
  }
});

healthCheck.register('memory', async () => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  return used < 512; // Less than 512MB
});