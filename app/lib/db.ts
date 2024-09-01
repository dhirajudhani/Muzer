import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient();
// this isnot the best , we should introduce a singleton here 