// Enhanced database connection and query optimization
import { PrismaClient } from '@prisma/client';
import { PerformanceMonitor } from './performance';
import { ApplicationError, createDatabaseError } from './errors';

// Connection pool optimization
class DatabaseManager {
  private static instance: PrismaClient;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000;

  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: 'pretty',
      });
    }
    return this.instance;
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.$disconnect();
    }
  }

  // Optimized query with retries and performance monitoring
  static async executeQuery<T>(
    queryName: string,
    query: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    return PerformanceMonitor.measure(queryName, async () => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const result = await query();
          return result;
        } catch (error) {
          if (attempt === retries) {
            throw createDatabaseError(error as Error, { queryName, attempt });
          }
          
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, attempt - 1))
          );
        }
      }
      throw new Error('Query failed after maximum retries');
    });
  }

  // Batch operations for performance
  static async batchCreate<T>(
    model: any,
    data: T[],
    batchSize: number = 100
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchResults = await this.executeQuery(
        `batchCreate_${model.name}`,
        () => model.createMany({ data: batch })
      );
      results.push(...(batchResults as T[]));
    }
    
    return results;
  }

  // Optimized findMany with pagination and caching
  static async findManyOptimized<T>(
    model: any,
    options: {
      where?: any;
      select?: any;
      orderBy?: any;
      page?: number;
      limit?: number;
      includeTotal?: boolean;
    } = {}
  ): Promise<{ data: T[]; total?: number; page: number; limit: number }> {
    const { page = 1, limit = 50, includeTotal = false, ...queryOptions } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.executeQuery(
        `findMany_${model.name}`,
        () => model.findMany({
          ...queryOptions,
          skip,
          take: limit,
        })
      ) as Promise<T[]>,
      includeTotal ? this.executeQuery(
        `count_${model.name}`,
        () => model.count({ where: options.where })
      ) : Promise.resolve(undefined)
    ]);

    return { data: data as T[], total: total as number | undefined, page, limit };
  }
}

// Query optimization utilities
export class QueryBuilder {
  private static escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static buildSearchFilter(fields: string[], searchTerm: string): any {
    if (!searchTerm) return {};

    const escapedTerm = this.escapeRegex(searchTerm);
    const searchConditions = fields.map(field => ({
      [field]: { contains: escapedTerm, mode: 'insensitive' }
    }));

    return { OR: searchConditions };
  }

  static buildDateRangeFilter(
    field: string,
    startDate?: Date,
    endDate?: Date
  ): any {
    const filter: any = {};
    
    if (startDate || endDate) {
      filter[field] = {};
      if (startDate) filter[field].gte = startDate;
      if (endDate) filter[field].lte = endDate;
    }
    
    return filter;
  }

  static buildStatusFilter(field: string, statuses: string[]): any {
    if (!statuses.length) return {};
    return { [field]: { in: statuses } };
  }
}

// Database health check
export const checkDatabaseHealth = async (): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> => {
  const start = Date.now();
  
  try {
    await DatabaseManager.executeQuery(
      'health_check',
      () => DatabaseManager.getInstance().$queryRaw`SELECT 1`
    );
    
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Export singleton instance
export const prisma = DatabaseManager.getInstance();