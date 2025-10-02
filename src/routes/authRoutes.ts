import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '@/controllers/authController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validateRequest';
import { authRateLimiter } from '@/middleware/rateLimiter';

const router = Router();

// Validation schemas
const loginValidation = [
  body('email').isEmail().withMessage('Email deve ser válido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
];

const registerValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email deve ser válido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role').optional().isIn(['USER', 'ADMIN', 'OWNER']).withMessage('Role deve ser USER, ADMIN ou OWNER'),
];

const updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('email').optional().isEmail().withMessage('Email deve ser válido'),
  body('password').optional().isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token é obrigatório'),
];

// Public routes
router.post('/login', authRateLimiter, loginValidation, validateRequest, AuthController.login);
router.post('/refresh-token', refreshTokenValidation, validateRequest, AuthController.refreshToken);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, validateRequest, AuthController.updateProfile);
router.post('/logout', authenticateToken, AuthController.logout);

// Admin only routes
router.post('/register', authenticateToken, requireAdmin, registerValidation, validateRequest, AuthController.register);

export default router;
