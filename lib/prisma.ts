import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as any;

// Debug environment values to help diagnose engine selection
console.debug('PRISMA_CLIENT_ENGINE_TYPE=', process.env.PRISMA_CLIENT_ENGINE_TYPE);
console.debug('DATABASE_URL present=', !!process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['error', 'warn'] });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
