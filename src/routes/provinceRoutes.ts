import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { ProvinceController } from '@/controllers/provinceController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validateRequest';

const router = Router();

// Validation schemas
const createProvinceValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('code').notEmpty().withMessage('Código é obrigatório'),
  body('capital').notEmpty().withMessage('Capital é obrigatória'),
  body('population').notEmpty().withMessage('População é obrigatória'),
  body('area').notEmpty().withMessage('Área é obrigatória'),
  body('density').notEmpty().withMessage('Densidade é obrigatória'),
  body('region').notEmpty().withMessage('Região é obrigatória'),
  body('timezone').notEmpty().withMessage('Timezone é obrigatório'),
  body('currency').notEmpty().withMessage('Moeda é obrigatória'),
  body('language').notEmpty().withMessage('Idioma é obrigatório'),
  body('religion').notEmpty().withMessage('Religião é obrigatória'),
  body('government').notEmpty().withMessage('Governo é obrigatório'),
  body('chiefAdministrator').notEmpty().withMessage('Administrador chefe é obrigatório'),
  body('areaCode').notEmpty().withMessage('Código de área é obrigatório'),
  body('postalCode').notEmpty().withMessage('Código postal é obrigatório'),
  body('latitude').isNumeric().withMessage('Latitude deve ser um número'),
  body('longitude').isNumeric().withMessage('Longitude deve ser um número'),
];

const updateProvinceValidation = [
  param('id').isUUID().withMessage('ID inválido'),
  body('name').optional().notEmpty().withMessage('Nome não pode estar vazio'),
  body('code').optional().notEmpty().withMessage('Código não pode estar vazio'),
  body('capital').optional().notEmpty().withMessage('Capital não pode estar vazia'),
  body('population').optional().notEmpty().withMessage('População não pode estar vazia'),
  body('area').optional().notEmpty().withMessage('Área não pode estar vazia'),
  body('density').optional().notEmpty().withMessage('Densidade não pode estar vazia'),
  body('region').optional().notEmpty().withMessage('Região não pode estar vazia'),
  body('timezone').optional().notEmpty().withMessage('Timezone não pode estar vazio'),
  body('currency').optional().notEmpty().withMessage('Moeda não pode estar vazia'),
  body('language').optional().notEmpty().withMessage('Idioma não pode estar vazio'),
  body('religion').optional().notEmpty().withMessage('Religião não pode estar vazia'),
  body('government').optional().notEmpty().withMessage('Governo não pode estar vazio'),
  body('chiefAdministrator').optional().notEmpty().withMessage('Administrador chefe não pode estar vazio'),
  body('areaCode').optional().notEmpty().withMessage('Código de área não pode estar vazio'),
  body('postalCode').optional().notEmpty().withMessage('Código postal não pode estar vazio'),
  body('latitude').optional().isNumeric().withMessage('Latitude deve ser um número'),
  body('longitude').optional().isNumeric().withMessage('Longitude deve ser um número'),
];

const getProvinceValidation = [
  param('id').isUUID().withMessage('ID inválido'),
];

const getProvincesValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('search').optional().isLength({ min: 2 }).withMessage('Busca deve ter pelo menos 2 caracteres'),
  query('sort').optional().isIn(['name', 'code', 'capital', 'region', 'createdAt']).withMessage('Campo de ordenação inválido'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Ordem deve ser asc ou desc'),
];

const getProvinceMunicipalitiesValidation = [
  param('id').isUUID().withMessage('ID inválido'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('search').optional().isLength({ min: 2 }).withMessage('Busca deve ter pelo menos 2 caracteres'),
  query('sort').optional().isIn(['name', 'code', 'createdAt']).withMessage('Campo de ordenação inválido'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('Ordem deve ser asc ou desc'),
];

// Public routes
router.get('/', getProvincesValidation, validateRequest, ProvinceController.getProvinces);
router.get('/:id', getProvinceValidation, validateRequest, ProvinceController.getProvince);
router.get('/:id/municipalities', getProvinceMunicipalitiesValidation, validateRequest, ProvinceController.getProvinceMunicipalities);

// Protected routes (Admin only)
router.post('/', authenticateToken, requireAdmin, createProvinceValidation, validateRequest, ProvinceController.createProvince);
router.put('/:id', authenticateToken, requireAdmin, updateProvinceValidation, validateRequest, ProvinceController.updateProvince);
router.delete('/:id', authenticateToken, requireAdmin, getProvinceValidation, validateRequest, ProvinceController.deleteProvince);

export default router;
