import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton for Next.js.
 *
 * In `next dev`, modules hot-reload often. Creating a new PrismaClient on every
 * reload would open many DB connections. We store one instance on `globalThis`
 * in development so the whole process shares a single client.
 *
 * Interview note: "singleton" = exactly one shared instance of a resource.
 */
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
