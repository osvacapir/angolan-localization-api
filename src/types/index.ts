import { Province, Municipality, User, UserRole } from '@prisma/client';
import { Request } from 'express';

// Base types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  q: string;
}

// Province types
export interface ProvinceCreateInput {
  name: string;
  code: string;
  capital: string;
  population: string;
  area: string;
  density: string;
  region: string;
  timezone: string;
  currency: string;
  language: string;
  religion: string;
  government: string;
  chiefAdministrator: string;
  areaCode: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export interface ProvinceUpdateInput extends Partial<ProvinceCreateInput> {}

export interface ProvinceResponse extends Omit<Province, 'createdAt' | 'updatedAt'> {
  municipalitiesCount?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  stats?: {
    population: string;
    area: string;
    density: string;
  };
}

// Municipality types
export interface MunicipalityCreateInput {
  name: string;
  code: string;
  provinceCode: string;
  population: string;
  area: string;
  density: string;
  region: string;
  timezone: string;
  currency: string;
  language: string;
  religion: string;
  government: string;
  chiefAdministrator: string;
  areaCode: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export interface MunicipalityUpdateInput extends Partial<MunicipalityCreateInput> {}

export interface MunicipalityResponse extends Omit<Municipality, 'createdAt' | 'updatedAt'> {
  province?: {
    name: string;
    code: string;
    capital: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  stats?: {
    population: string;
    area: string;
    density: string;
  };
}

// User types
export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserResponse extends Omit<User, 'password' | 'createdAt' | 'updatedAt'> {}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
  refreshToken: string;
}

// Auth types
export interface AuthRequest extends Request {
  user?: UserResponse;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Search types
export interface SearchResult {
  query: string;
  provinces: ProvinceResponse[];
  municipalities: MunicipalityResponse[];
  totalResults: number;
}

// Stats types
export interface ApiStats {
  totalProvinces: number;
  totalMunicipalities: number;
  apiVersion: string;
  lastUpdated: string;
  note: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Cache types
export interface CacheOptions {
  ttl?: number;
  key?: string;
  tags?: string[];
}

// Export Prisma types
export type { Province, Municipality, User, UserRole };
