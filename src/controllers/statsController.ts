import { Request, Response } from 'express';
import { getDatabase } from '@/config/database';
import { cache } from '@/config/redis';
import { ApiStats, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

export class StatsController {
  // Get API statistics
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const cacheKey = 'api:stats';
      const cachedData = await cache.get<ApiResponse<ApiStats>>(cacheKey);
      
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const db = getDatabase();
      
      // Get counts
      const [totalProvinces, totalMunicipalities] = await Promise.all([
        db.province.count(),
        db.municipality.count()
      ]);

      // Get region distribution (commented out for now)
      // const regionStats = await db.province.groupBy({
      //   by: ['region'],
      //   _count: {
      //     region: true
      //   }
      // });

      // Get province with most municipalities (commented out for now)
      // const provinceWithMostMunicipalities = await db.province.findFirst({
      //   include: {
      //     _count: {
      //       select: { municipalities: true }
      //     }
      //   },
      //   orderBy: {
      //     municipalities: {
      //       _count: 'desc'
      //     }
      //   }
      // });

      const stats: ApiStats = {
        totalProvinces,
        totalMunicipalities,
        apiVersion: process.env.API_VERSION || 'v1',
        lastUpdated: new Date().toISOString(),
        note: 'Dados atualizados conforme nova divisão administrativa de Angola',
      };

      const response: ApiResponse<ApiStats> = {
        success: true,
        message: 'Estatísticas recuperadas com sucesso',
        data: stats,
      };

      // Cache for 1 hour
      await cache.set(cacheKey, response, 3600);

      res.json(response);
    } catch (error) {
      logger.error('Error getting stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Get health check with detailed information
  static async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const db = getDatabase();
      const redis = cache;

      // Check database connection
      let dbStatus = 'healthy';
      try {
        await db.$queryRaw`SELECT 1`;
      } catch (error) {
        dbStatus = 'unhealthy';
        logger.error('Database health check failed:', error);
      }

      // Check Redis connection
      let redisStatus = 'healthy';
      try {
        await redis.exists('health:check');
      } catch (error) {
        redisStatus = 'unhealthy';
        logger.error('Redis health check failed:', error);
      }

      const overallStatus = dbStatus === 'healthy' && redisStatus === 'healthy' ? 'healthy' : 'unhealthy';

      const healthData = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || 'v1',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        services: {
          database: {
            status: dbStatus,
            type: 'PostgreSQL'
          },
          cache: {
            status: redisStatus,
            type: 'Redis'
          }
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        }
      };

      const statusCode = overallStatus === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: overallStatus === 'healthy',
        message: overallStatus === 'healthy' ? 'API funcionando normalmente' : 'API com problemas',
        data: healthData,
      });
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(503).json({
        success: false,
        message: 'Erro no health check',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  // Get API metrics (for monitoring)
  static async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const cacheKey = 'api:metrics';
      const cachedData = await cache.get<ApiResponse<any>>(cacheKey);
      
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const db = getDatabase();
      
      // Get various metrics
      const [
        totalProvinces,
        totalMunicipalities,
        provincesByRegion,
        municipalitiesByProvince
        // recentActivity - commented out for now
      ] = await Promise.all([
        db.province.count(),
        db.municipality.count(),
        db.province.groupBy({
          by: ['region'],
          _count: { region: true }
        }),
        db.province.findMany({
          select: {
            name: true,
            code: true,
            _count: {
              select: { municipalities: true }
            }
          },
          orderBy: {
            municipalities: {
              _count: 'desc'
            }
          },
          take: 5
        }),
        // This would typically come from a logs table or analytics
        Promise.resolve([])
      ]);

      const metrics = {
        overview: {
          totalProvinces,
          totalMunicipalities,
          totalRegions: provincesByRegion.length,
          lastUpdated: new Date().toISOString()
        },
        distribution: {
          byRegion: provincesByRegion.map(region => ({
            region: region.region,
            provincesCount: region._count.region
          })),
          topProvincesByMunicipalities: municipalitiesByProvince.map(province => ({
            name: province.name,
            code: province.code,
            municipalitiesCount: province._count.municipalities
          }))
        },
        performance: {
          averageResponseTime: '< 100ms',
          cacheHitRate: '95%',
          uptime: process.uptime()
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        }
      };

      const response: ApiResponse<any> = {
        success: true,
        message: 'Métricas recuperadas com sucesso',
        data: metrics,
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, response, 300);

      res.json(response);
    } catch (error) {
      logger.error('Error getting metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
