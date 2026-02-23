import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma?: InstanceType<typeof PrismaClient>;
};

function sqliteFilePathFromDatabaseUrl(databaseUrl: string) {
  if (!databaseUrl.startsWith("file:")) {
    throw new Error('DATABASE_URL must start with "file:" for sqlite.');
  }

  let p = databaseUrl.slice("file:".length);
  p = (p.split("?")[0] ?? "").trim();
  if (p.startsWith("//")) p = p.slice(2);
  if (!p) throw new Error("DATABASE_URL is empty.");

  return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
}

function createPrismaClient() {
  const dbPath = sqliteFilePathFromDatabaseUrl(
    process.env.DATABASE_URL ?? "file:./dev.db",
  );

  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

