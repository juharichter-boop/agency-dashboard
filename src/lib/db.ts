import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let prisma: PrismaClient;

try {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient({
      log: ['error'],
    } as any);
  } else {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: ['query', 'error', 'warn'],
      } as any);
    }
    prisma = globalForPrisma.prisma;
  }
} catch (error) {
  // During build time, Prisma initialization may fail
  // This will be properly initialized at runtime
  console.warn('Prisma initialization deferred to runtime');
}

export { prisma };
