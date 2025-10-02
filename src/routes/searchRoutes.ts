import { Router } from 'express';
import { query } from 'express-validator';
import { SearchController } from '@/controllers/searchController';
import { validateRequest } from '@/middleware/validateRequest';

const router = Router();

// Validation schemas
const searchValidation = [
  query('q').notEmpty().withMessage('Termo de busca é obrigatório'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
];

const searchProvincesValidation = [
  query('q').notEmpty().withMessage('Termo de busca é obrigatório'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
];

const searchMunicipalitiesValidation = [
  query('q').notEmpty().withMessage('Termo de busca é obrigatório'),
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limite deve ser entre 1 e 50'),
];

// Public routes
router.get('/', searchValidation, validateRequest, SearchController.search);
router.get('/provinces', searchProvincesValidation, validateRequest, SearchController.searchProvinces);
router.get('/municipalities', searchMunicipalitiesValidation, validateRequest, SearchController.searchMunicipalities);

export default router;
