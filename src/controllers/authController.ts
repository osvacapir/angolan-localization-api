import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '@/config/database';
import { LoginInput, LoginResponse, UserCreateInput, UserResponse, ApiResponse, AuthRequest } from '@/types';
import { logger } from '@/utils/logger';

export class AuthController {
  // Helper function to generate JWT tokens
  private static generateToken(payload: any, secret: string, expiresIn: string): string {
    return jwt.sign(payload, secret, { expiresIn } as any);
  }

  // User login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginInput = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios',
        });
        return;
      }

      const db = getDatabase();
      const user = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Credenciais inválidas',
        });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não configurado');
      }

      // Generate tokens
      const token = this.generateToken(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        jwtSecret as string,
        process.env.JWT_EXPIRES_IN || '24h'
      );

      const refreshToken = this.generateToken(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          type: 'refresh'
        },
        jwtSecret as string,
        process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      );

      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };

      const response: ApiResponse<LoginResponse> = {
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: userResponse,
          token,
          refreshToken,
        },
      };

      logger.info(`User logged in: ${user.email}`, {
        userId: user.id,
        role: user.role,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(response);
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // User registration (Admin only)
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, email, password, role = 'USER' }: UserCreateInput = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Nome, email e senha são obrigatórios',
        });
        return;
      }

      const db = getDatabase();
      
      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Usuário já existe com este email',
        });
        return;
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: 'Usuário criado com sucesso',
        data: user,
      };

      logger.info(`User registered: ${user.email}`, {
        userId: user.id,
        role: user.role,
        createdBy: req.user?.id,
      });

      res.status(201).json(response);
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Get current user profile
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: 'Perfil recuperado com sucesso',
        data: user,
      };

      res.json(response);
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Update user profile
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { name, email, password } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      const db = getDatabase();
      
      // Check if email is already taken by another user
      if (email) {
        const existingUser = await db.user.findFirst({
          where: {
            email,
            id: { not: userId }
          }
        });

        if (existingUser) {
          res.status(409).json({
            success: false,
            message: 'Email já está em uso por outro usuário',
          });
          return;
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      const user = await db.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      const response: ApiResponse<UserResponse> = {
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: user,
      };

      logger.info(`User profile updated: ${user.email}`, {
        userId: user.id,
        updatedFields: Object.keys(updateData),
      });

      res.json(response);
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Logout (invalidate token)
  static async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      // In a real application, you would add the token to a blacklist
      // For now, we'll just return a success message
      // The client should remove the token from storage

      logger.info(`User logged out: ${req.user?.email}`, {
        userId: req.user?.id,
        ip: req.ip,
      });

      res.json({
        success: true,
        message: 'Logout realizado com sucesso',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  // Refresh token
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token é obrigatório',
        });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET não configurado');
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtSecret) as any;
      
      if (decoded.type !== 'refresh') {
        res.status(401).json({
          success: false,
          message: 'Token inválido',
        });
        return;
      }

      const db = getDatabase();
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        }
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          message: 'Usuário não encontrado ou inativo',
        });
        return;
      }

      // Generate new tokens
      const newToken = this.generateToken(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        jwtSecret as string,
        process.env.JWT_EXPIRES_IN || '24h'
      );

      const newRefreshToken = this.generateToken(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          type: 'refresh'
        },
        jwtSecret as string,
        process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      );

      res.json({
        success: true,
        message: 'Token renovado com sucesso',
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado',
      });
    }
  }
}
