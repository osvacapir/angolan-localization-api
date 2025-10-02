import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from '@/utils/logger';

let prisma: PrismaClient<Prisma.PrismaClientOptions, 'query'>;

export const connectDatabase = async (): Promise<void> => {
  try {
    prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'info', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query', (e) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Params: ${e.params}`);
        logger.debug(`Duration: ${e.duration}ms`);
      });
    }

    await prisma.$connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Failed to disconnect from database:', error);
    throw error;
  }
};

export const getDatabase = (): PrismaClient<Prisma.PrismaClientOptions, 'query'> => {
  if (!prisma) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return prisma;
};

// Handle database errors
export const handleDatabaseError = (error: any): never => {
  logger.error('Database error:', error);
  
  if (error.code === 'P2002') {
    throw new Error('Registro duplicado encontrado');
  }
  
  if (error.code === 'P2025') {
    throw new Error('Registro não encontrado');
  }
  
  if (error.code === 'P2003') {
    throw new Error('Violação de chave estrangeira');
  }
  
  throw new Error('Erro interno do banco de dados');
};
