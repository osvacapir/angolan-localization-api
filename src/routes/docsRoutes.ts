import { Router, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const router = Router();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: process.env.SWAGGER_TITLE || 'API de Localização de Angola',
      version: process.env.SWAGGER_VERSION || '1.0.0',
      description: process.env.SWAGGER_DESCRIPTION || 'API RESTful para consulta de províncias e municípios de Angola',
      contact: {
        name: process.env.SWAGGER_CONTACT_NAME || 'Comunidade de Desenvolvedores Angolanos',
        email: process.env.SWAGGER_CONTACT_EMAIL || 'contato@angola-dev.com',
        url: process.env.SWAGGER_CONTACT_URL || 'https://github.comosvacapir/angolan-localization-api',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000/api',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://api.angolan-localization-api.com/api',
        description: 'Servidor de Produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se a operação foi bem-sucedida',
            },
            message: {
              type: 'string',
              description: 'Mensagem descritiva da operação',
            },
            data: {
              type: 'object',
              description: 'Dados retornados pela operação',
            },
            meta: {
              type: 'object',
              description: 'Metadados adicionais (paginação, etc.)',
            },
          },
        },
        Province: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Luanda' },
            code: { type: 'string', example: 'LDA' },
            capital: { type: 'string', example: 'Luanda' },
            population: { type: 'string', example: '8.3 milhões' },
            area: { type: 'string', example: '18.826 km²' },
            density: { type: 'string', example: '441 hab/km²' },
            region: { type: 'string', example: 'Norte' },
            timezone: { type: 'string', example: 'WAT (UTC+1)' },
            currency: { type: 'string', example: 'Kwanza (AOA)' },
            language: { type: 'string', example: 'Português' },
            religion: { type: 'string', example: 'Cristianismo' },
            government: { type: 'string', example: 'Provincial' },
            chiefAdministrator: { type: 'string', example: 'Governador' },
            areaCode: { type: 'string', example: '222' },
            postalCode: { type: 'string', example: '1000-9999' },
            latitude: { type: 'number', example: -8.8390 },
            longitude: { type: 'number', example: 13.2894 },
            municipalitiesCount: { type: 'number', example: 9 },
            coordinates: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
            stats: {
              type: 'object',
              properties: {
                population: { type: 'string' },
                area: { type: 'string' },
                density: { type: 'string' },
              },
            },
          },
        },
        Municipality: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Luanda' },
            code: { type: 'string', example: 'LDA001' },
            provinceCode: { type: 'string', example: 'LDA' },
            population: { type: 'string', example: '2.8 milhões' },
            area: { type: 'string', example: '2.257 km²' },
            density: { type: 'string', example: '1.241 hab/km²' },
            region: { type: 'string', example: 'Norte' },
            timezone: { type: 'string', example: 'WAT (UTC+1)' },
            currency: { type: 'string', example: 'Kwanza (AOA)' },
            language: { type: 'string', example: 'Português' },
            religion: { type: 'string', example: 'Cristianismo' },
            government: { type: 'string', example: 'Municipal' },
            chiefAdministrator: { type: 'string', example: 'Administrador' },
            areaCode: { type: 'string', example: '222' },
            postalCode: { type: 'string', example: '1000-1999' },
            latitude: { type: 'number', example: -8.8390 },
            longitude: { type: 'number', example: 13.2894 },
            province: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                code: { type: 'string' },
                capital: { type: 'string' },
              },
            },
            coordinates: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
            stats: {
              type: 'object',
              properties: {
                population: { type: 'string' },
                area: { type: 'string' },
                density: { type: 'string' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', format: 'email', example: 'joao@example.com' },
            role: { type: 'string', enum: ['USER', 'ADMIN', 'OWNER'], example: 'USER' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Erro interno do servidor' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'INTERNAL_ERROR' },
                message: { type: 'string', example: 'Erro interno do servidor' },
                details: { type: 'string', example: 'Stack trace...' },
              },
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Provinces',
        description: 'Operações relacionadas às províncias de Angola',
      },
      {
        name: 'Municipalities',
        description: 'Operações relacionadas aos municípios de Angola',
      },
      {
        name: 'Search',
        description: 'Operações de busca em províncias e municípios',
      },
      {
        name: 'Auth',
        description: 'Operações de autenticação e autorização',
      },
      {
        name: 'Stats',
        description: 'Estatísticas e métricas da API',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Swagger UI options
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API de Localização de Angola - Documentação',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
};

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(specs, swaggerUiOptions));

// Serve raw JSON
router.get('/json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Serve YAML
router.get('/yaml', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.send(specs);
});

export default router;
