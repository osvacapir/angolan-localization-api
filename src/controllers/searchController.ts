import { Request, Response } from 'express';
import { getDatabase } from '@/config/database';
import { cache } from '@/config/redis';
import { SearchQuery, SearchResult, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

export class SearchController {
  // Global search across provinces and municipalities
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const { q, page = 1, limit = 20 } = req.query as unknown as SearchQuery;

      if (!q || q.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Termo de busca deve ter pelo menos 2 caracteres',
        });
        return;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Create cache key
      const cacheKey = `search:${q.toLowerCase()}:${page}:${limit}`;

      // Try to get from cache first
      const cachedData = await cache.get<ApiResponse<SearchResult>>(cacheKey);
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const db = getDatabase();
      const searchTerm = q.trim();

      // Search provinces
      const provinces = await db.province.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' as const } },
            { code: { contains: searchTerm, mode: 'insensitive' as const } },
            { capital: { contains: searchTerm, mode: 'insensitive' as const } },
            { region: { contains: searchTerm, mode: 'insensitive' as const } },
          ]
        },
        select: {
          id: true,
          name: true,
          code: true,
          capital: true,
          region: true,
          latitude: true,
          longitude: true,
          population: true,
          area: true,
          density: true,
        },
        take: Math.ceil(take / 2), // Split results between provinces and municipalities
      });

      // Search municipalities
      const municipalities = await db.municipality.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' as const } },
            { code: { contains: searchTerm, mode: 'insensitive' as const } },
            { region: { contains: searchTerm, mode: 'insensitive' as const } },
          ]
        },
        select: {
          id: true,
          name: true,
          code: true,
          provinceCode: true,
          region: true,
          latitude: true,
          longitude: true,
          population: true,
          area: true,
          density: true,
          province: {
            select: {
              name: true,
              code: true,
              capital: true,
            }
          }
        },
        take: Math.floor(take / 2),
        skip: Math.max(0, skip - provinces.length),
      });

      // Transform data
      const transformedProvinces = provinces.map(province => ({
        ...province,
        coordinates: {
          latitude: Number(province.latitude),
          longitude: Number(province.longitude),
        },
        stats: {
          population: province.population,
          area: province.area,
          density: province.density,
        },
      }));

      const transformedMunicipalities = municipalities.map(municipality => ({
        ...municipality,
        coordinates: {
          latitude: Number(municipality.latitude),
          longitude: Number(municipality.longitude),
        },
        stats: {
          population: municipality.population,
          area: municipality.area,
          density: municipality.density,
        },
        province: {
          name: municipality.province.name,
          code: municipality.province.code,
          capital: municipality.province.capital,
        },
      }));

      const totalResults = transformedProvinces.length + transformedMunicipalities.length;

      const searchResult: SearchResult = {
        query: searchTerm,
        provinces: transformedProvinces as any,
        municipalities: transformedMunicipalities as any,
        totalResults,
      };

      const response: ApiResponse<SearchResult> = {
        success: true,
        message: 'Busca realizada com sucesso',
        data: searchResult,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total: totalResults,
        },
      };

      // Cache the response for 30 minutes
      await cache.set(cacheKey, response, 1800);

      res.json(response);
    } catch (error) {
      logger.error('Search error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Search only provinces
  static async searchProvinces(req: Request, res: Response): Promise<void> {
    try {
      const { q, page = 1, limit = 15 } = req.query as unknown as SearchQuery;

      if (!q || q.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Termo de busca deve ter pelo menos 2 caracteres',
        });
        return;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const cacheKey = `search:provinces:${q.toLowerCase()}:${page}:${limit}`;
      const cachedData = await cache.get<ApiResponse<any[]>>(cacheKey);
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const db = getDatabase();
      const searchTerm = q.trim();

      const [provinces, total] = await Promise.all([
        db.province.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' as const } },
              { code: { contains: searchTerm, mode: 'insensitive' as const } },
              { capital: { contains: searchTerm, mode: 'insensitive' as const } },
              { region: { contains: searchTerm, mode: 'insensitive' as const } },
            ]
          },
          skip,
          take,
          orderBy: { name: 'asc' },
          include: {
            _count: {
              select: { municipalities: true }
            }
          }
        }),
        db.province.count({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' as const } },
              { code: { contains: searchTerm, mode: 'insensitive' as const } },
              { capital: { contains: searchTerm, mode: 'insensitive' as const } },
              { region: { contains: searchTerm, mode: 'insensitive' as const } },
            ]
          }
        })
      ]);

      const transformedProvinces = provinces.map(province => ({
        ...province,
        municipalitiesCount: province._count.municipalities,
        coordinates: {
          latitude: Number(province.latitude),
          longitude: Number(province.longitude),
        },
        stats: {
          population: province.population,
          area: province.area,
          density: province.density,
        },
      }));

      const totalPages = Math.ceil(total / take);

      const response: ApiResponse<any[]> = {
        success: true,
        message: 'Busca de províncias realizada com sucesso',
        data: transformedProvinces,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
        },
      };

      await cache.set(cacheKey, response, 1800);
      res.json(response);
    } catch (error) {
      logger.error('Search provinces error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Search only municipalities
  static async searchMunicipalities(req: Request, res: Response): Promise<void> {
    try {
      const { q, page = 1, limit = 15 } = req.query as unknown as SearchQuery;

      if (!q || q.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Termo de busca deve ter pelo menos 2 caracteres',
        });
        return;
      }

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const cacheKey = `search:municipalities:${q.toLowerCase()}:${page}:${limit}`;
      const cachedData = await cache.get<ApiResponse<any[]>>(cacheKey);
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const db = getDatabase();
      const searchTerm = q.trim();

      const [municipalities, total] = await Promise.all([
        db.municipality.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' as const } },
              { code: { contains: searchTerm, mode: 'insensitive' as const } },
              { region: { contains: searchTerm, mode: 'insensitive' as const } },
            ]
          },
          skip,
          take,
          orderBy: { name: 'asc' },
          include: {
            province: {
              select: {
                name: true,
                code: true,
                capital: true,
              }
            }
          }
        }),
        db.municipality.count({
          where: {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' as const } },
              { code: { contains: searchTerm, mode: 'insensitive' as const } },
              { region: { contains: searchTerm, mode: 'insensitive' as const } },
            ]
          }
        })
      ]);

      const transformedMunicipalities = municipalities.map(municipality => ({
        ...municipality,
        coordinates: {
          latitude: Number(municipality.latitude),
          longitude: Number(municipality.longitude),
        },
        stats: {
          population: municipality.population,
          area: municipality.area,
          density: municipality.density,
        },
        province: {
          name: municipality.province.name,
          code: municipality.province.code,
          capital: municipality.province.capital,
        },
      }));

      const totalPages = Math.ceil(total / take);

      const response: ApiResponse<any[]> = {
        success: true,
        message: 'Busca de municípios realizada com sucesso',
        data: transformedMunicipalities,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
        },
      };

      await cache.set(cacheKey, response, 1800);
      res.json(response);
    } catch (error) {
      logger.error('Search municipalities error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
