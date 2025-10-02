import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDatabase } from '@/config/database';
import { JwtPayload, AuthRequest, UserResponse } from '@/types';
import { logger } from '@/utils/logger';

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acesso necessário',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não configurado');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Get user from database
    const db = getDatabase();
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo',
      });
      return;
    }

    req.user = user as UserResponse;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autenticação necessária',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissões insuficientes',
      });
      return;
    }

    next();
  };
};

export const requireAdmin = requireRole(['ADMIN', 'OWNER']);
export const requireOwner = requireRole(['OWNER']);
