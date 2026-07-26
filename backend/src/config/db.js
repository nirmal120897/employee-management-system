import { PrismaClient } from "@prisma/client";

// Singleton pattern - avoid creating multiple Prisma instances in dev (hot reload)
const prisma = new PrismaClient();

export default prisma;
