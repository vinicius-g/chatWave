import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Evidência / Best practice: https://www.prisma.io/docs/guides/database/troubleshooting-orm/help-prisma-client-initializing

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
