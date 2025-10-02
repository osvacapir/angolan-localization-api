import { PrismaClient } from '@prisma/client';

// Setup global test configuration
beforeAll(async () => {
  // Setup test database connection
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/angola_test';
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
});

afterAll(async () => {
  // Cleanup after all tests
  const prisma = new PrismaClient();
  await prisma.$disconnect();
});

// Global test timeout
jest.setTimeout(10000);
