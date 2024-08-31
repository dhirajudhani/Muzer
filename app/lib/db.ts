import { PrismaClient } from "@prisma/client/extension";

export const prismaClient = new PrismaClient();
// this isnot the best , we should introduce a singleton here 