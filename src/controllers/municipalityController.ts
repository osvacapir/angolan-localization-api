import { Request, Response } from 'express';
import { getDatabase } from '@/config/database';
import { cache } from '@/config/redis';
import { 
  MunicipalityResponse, 
  MunicipalityCreateInput, 
  MunicipalityUpdateInput,
  PaginationQuery,
  ApiResponse 
} from '@/types';
import { logger } from '@/utils/logger';

export class MunicipalityController {
  // Get all municipalities with pagination and search
  static async getMunicipalities(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 15,
        search,
        province_code,
        region,
        sort = 'name',
        order = 'asc'
      } = req.query as PaginationQuery & { province_code?: string; region?: string };

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Create cache key
      const cacheKey = `municipalities:${page}:${limit}:${search || ''}:${province_code || ''}:${region || ''}:${sort}:${order}`;

      // Try to get from cache first
      const cachedData = await cache.get<ApiResponse<MunicipalityResponse[]>>(cacheKey);
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const db = getDatabase();
      
      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
        ];
      }
      
      if (province_code) {
        where.provinceCode = province_code;
      }
      
      if (region) {
        where.region = region;
      }

      // Get municipalities with province info
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

      // Transform data
      const transformedMunicipalities: MunicipalityResponse[] = municipalities.map(municipality => ({
        ...municipality,
        province: {
          name: municipality.province.name,
          code: municipality.province.code,
          capital: municipality.province.capital,
        },
        coordinates: {
          latitude: Number(municipality.latitude),
          longitude: Number(municipality.longitude),
        },
        stats: {
          population: municipality.population,
          area: municipality.area,
          density: municipality.density,
        },
      }));

      const totalPages = Math.ceil(total / take);

      const response: ApiResponse<MunicipalityResponse[]> = {
        success: true,
        message: 'Municípios recuperados com sucesso',
        data: transformedMunicipalities,
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
      logger.error('Error getting municipalities:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Get single municipality by ID
  static async getMunicipality(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const cacheKey = `municipality:${id}`;
      const cachedData = await cache.get<ApiResponse<MunicipalityResponse>>(cacheKey);
      if (cachedData) {
        res.json(cachedData);
        return;
      }

      const db = getDatabase();
      const municipality = await db.municipality.findUnique({
        where: { id },
        include: {
          province: {
            select: {
              name: true,
              code: true,
              capital: true,
            }
          }
        }
      });

      if (!municipality) {
        res.status(404).json({
          success: false,
          message: 'Município não encontrado',
        });
        return;
      }

      const transformedMunicipality: MunicipalityResponse = {
        ...municipality,
        province: {
          name: municipality.province.name,
          code: municipality.province.code,
          capital: municipality.province.capital,
        },
        coordinates: {
          latitude: Number(municipality.latitude),
          longitude: Number(municipality.longitude),
        },
        stats: {
          population: municipality.population,
          area: municipality.area,
          density: municipality.density,
        },
      };

      const response: ApiResponse<MunicipalityResponse> = {
        success: true,
        message: 'Município recuperado com sucesso',
        data: transformedMunicipality,
      };

      // Cache the response
      await cache.set(cacheKey, response, 3600);

      res.json(response);
    } catch (error) {
      logger.error('Error getting municipality:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Create new municipality (Admin only)
  static async createMunicipality(req: Request, res: Response): Promise<void> {
    try {
      const municipalityData: MunicipalityCreateInput = req.body;

      const db = getDatabase();
      
      // Verify province exists
      const province = await db.province.findUnique({
        where: { code: municipalityData.provinceCode }
      });

      if (!province) {
        res.status(400).json({
          success: false,
          message: 'Província não encontrada',
        });
        return;
      }

      const municipality = await db.municipality.create({
        data: municipalityData,
        include: {
          province: {
            select: {
              name: true,
              code: true,
              capital: true,
            }
          }
        }
      });

      const transformedMunicipality: MunicipalityResponse = {
        ...municipality,
        province: {
          name: municipality.province.name,
          code: municipality.province.code,
          capital: municipality.province.capital,
        },
        coordinates: {
          latitude: Number(municipality.latitude),
          longitude: Number(municipality.longitude),
        },
        stats: {
          population: municipality.population,
          area: municipality.area,
          density: municipality.density,
        },
      };

      // Clear related caches
      await cache.del('municipalities:*');
      await cache.del(`province:${province.id}:municipalities:*`);

      res.status(201).json({
        success: true,
        message: 'Município criado com sucesso',
        data: transformedMunicipality,
      });
    } catch (error) {
      logger.error('Error creating municipality:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Update municipality (Admin only)
  static async updateMunicipality(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: MunicipalityUpdateInput = req.body;

      const db = getDatabase();
      
      // If updating province code, verify new province exists
      if (updateData.provinceCode) {
        const province = await db.province.findUnique({
          where: { code: updateData.provinceCode }
        });

        if (!province) {
          res.status(400).json({
            success: false,
            message: 'Província não encontrada',
          });
          return;
        }
      }

      const municipality = await db.municipality.update({
        where: { id },
        data: updateData,
        include: {
          province: {
            select: {
              name: true,
              code: true,
              capital: true,
            }
          }
        }
      });

      const transformedMunicipality: MunicipalityResponse = {
        ...municipality,
        province: {
          name: municipality.province.name,
          code: municipality.province.code,
          capital: municipality.province.capital,
        },
        coordinates: {
          latitude: Number(municipality.latitude),
          longitude: Number(municipality.longitude),
        },
        stats: {
          population: municipality.population,
          area: municipality.area,
          density: municipality.density,
        },
      };

      // Clear related caches
      await cache.del('municipalities:*');
      await cache.del(`municipality:${id}`);
      await cache.del(`province:${municipality.province.code}:municipalities:*`);

      res.json({
        success: true,
        message: 'Município atualizado com sucesso',
        data: transformedMunicipality,
      });
    } catch (error) {
      logger.error('Error updating municipality:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Delete municipality (Admin only)
  static async deleteMunicipality(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const db = getDatabase();
      
      // Get municipality info before deletion for cache clearing
      const municipality = await db.municipality.findUnique({
        where: { id },
        select: { provinceCode: true }
      });

      await db.municipality.delete({
        where: { id }
      });

      // Clear related caches
      await cache.del('municipalities:*');
      await cache.del(`municipality:${id}`);
      if (municipality) {
        await cache.del(`province:*:municipalities:*`);
      }

      res.json({
        success: true,
        message: 'Município excluído com sucesso',
      });
    } catch (error) {
      logger.error('Error deleting municipality:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
