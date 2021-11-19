import { PrismaClient } from ".prisma/client";

export function prismaClient(): PrismaClient {
    const prisma = new PrismaClient({
        log: ["query", "info", "error", "warn"]
    })
    return prisma;
}