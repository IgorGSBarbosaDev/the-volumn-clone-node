import { PrismaClient } from '@prisma/client'

declare global {
  var __theVolumnPrisma__: PrismaClient | undefined
}

export const db =
  globalThis.__theVolumnPrisma__ ??
  new PrismaClient({
    log: ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__theVolumnPrisma__ = db
}
