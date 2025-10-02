import { Request, Response } from 'express';
import { getDatabase } from '@/config/database';
import { cache } from '@/config/redis';
import { 
  ProvinceResponse, 
  ProvinceCreateInput, 
  ProvinceUpdateInput,
  PaginationQuery,
  ApiResponse 
} from '@/types';
import { logger } from '@/utils/logger';

export class ProvinceController {
  // Get all provinces with pagination and search
  static async getProvinces(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 15,
        search,
        sort = 'name',
        order = 'asc'
      } = req.query as PaginationQuery;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Create cache key
      const cacheKey = `provinces:${page}:${limit}:${search || ''}:${sort}:${order}`;

      // Try to get from cache first
      const cachedData = await cache.get<ApiResponse<ProvinceResponse[]>>(cacheKey);
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const db = getDatabase();
      
      // Build where clause
      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
          { capital: { contains: search, mode: 'insensitive' as const } },
        ]
      } : {};

      // Get provinces with municipalities count
      const [provinces, total] = await Promise.all([
        db.province.findMany({
          where,
          skip,
          take,
          orderBy: { [sort]: order },
          include: {
            _count: {
              select: { municipalities: true }
            }
          }
        }),
        db.province.count({ where })
      ]);

      // Transform data
      const transformedProvinces: ProvinceResponse[] = provinces.map(province => ({
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

      const response: ApiResponse<ProvinceResponse[]> = {
        success: true,
        message: 'Províncias recuperadas com sucesso',
        data: transformedProvinces,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
        },
      };

      // Cache the response
      await cache.set(cacheKey, response, 3600); // 1 hour

      res.json(response);
    } catch (error) {
      logger.error('Error getting provinces:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Get single province by ID
  static async getProvince(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const cacheKey = `province:${id}`;
      const cachedData = await cache.get<ApiResponse<ProvinceResponse>>(cacheKey);
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const db = getDatabase();
      const province = await db.province.findUnique({
        where: { id },
        include: {
          _count: {
            select: { municipalities: true }
          }
        }
      });

      if (!province) {
        res.status(404).json({
          success: false,
          message: 'Província não encontrada',
        });
        return;
      }

      const transformedProvince: ProvinceResponse = {
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
      };

      const response: ApiResponse<ProvinceResponse> = {
        success: true,
        message: 'Província recuperada com sucesso',
        data: transformedProvince,
      };

      // Cache the response
      await cache.set(cacheKey, response, 3600);

      res.json(response);
    } catch (error) {
      logger.error('Error getting province:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Create new province (Admin only)
  static async createProvince(req: Request, res: Response): Promise<void> {
    try {
      const provinceData: ProvinceCreateInput = req.body;

      const db = getDatabase();
      const province = await db.province.create({
        data: provinceData,
        include: {
          _count: {
            select: { municipalities: true }
          }
        }
      });

      const transformedProvince: ProvinceResponse = {
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
      };

      // Clear related caches
      await cache.del('provinces:*');

      res.status(201).json({
        success: true,
        message: 'Província criada com sucesso',
        data: transformedProvince,
      });
    } catch (error) {
      logger.error('Error creating province:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Update province (Admin only)
  static async updateProvince(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: ProvinceUpdateInput = req.body;

      const db = getDatabase();
      const province = await db.province.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: { municipalities: true }
          }
        }
      });

      const transformedProvince: ProvinceResponse = {
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
      };

      // Clear related caches
      await cache.del('provinces:*');
      await cache.del(`province:${id}`);

      res.json({
        success: true,
        message: 'Província atualizada com sucesso',
        data: transformedProvince,
      });
    } catch (error) {
      logger.error('Error updating province:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Delete province (Admin only)
  static async deleteProvince(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const db = getDatabase();
      await db.province.delete({
        where: { id }
      });

      // Clear related caches
      await cache.del('provinces:*');
      await cache.del(`province:${id}`);

      res.json({
        success: true,
        message: 'Província excluída com sucesso',
      });
    } catch (error) {
      logger.error('Error deleting province:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Get municipalities of a province
  static async getProvinceMunicipalities(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 15,
        search,
        sort = 'name',
        order = 'asc'
      } = req.query as PaginationQuery;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const cacheKey = `province:${id}:municipalities:${page}:${limit}:${search || ''}:${sort}:${order}`;
      const cachedData = await cache.get<ApiResponse<any[]>>(cacheKey);
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const db = getDatabase();
      
      // First check if province exists
      const province = await db.province.findUnique({
        where: { id },
        select: { code: true }
      });

      if (!province) {
        res.status(404).json({
          success: false,
          message: 'Província não encontrada',
        });
        return;
      }

      // Build where clause
      const where = {
        provinceCode: province.code,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { code: { contains: search, mode: 'insensitive' as const } },
          ]
        })
      };

      const [municipalities, total] = await Promise.all([
        db.municipality.findMany({
          where,
          skip,
          take,
          orderBy: { [sort]: order },
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
        db.municipality.count({ where })
      ]);

      const totalPages = Math.ceil(total / take);

      const response: ApiResponse<any[]> = {
        success: true,
        message: 'Municípios da província recuperados com sucesso',
        data: municipalities,
        meta: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
        },
      };

      // Cache the response
      await cache.set(cacheKey, response, 3600);

      res.json(response);
    } catch (error) {
      logger.error('Error getting province municipalities:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
