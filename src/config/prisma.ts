import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import fs from "node:fs";
import path from "node:path";

const isProduction = process.env["NODE_ENV"] === "production";

// #region agent log
const debugLog = (hypothesisId: string, message: string, data: Record<string, unknown>) => {
  fetch("http://127.0.0.1:7523/ingest/ce54c940-3e63-4f04-958f-638908550afc", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1202ca" },
    body: JSON.stringify({
      sessionId: "1202ca",
      runId: "pre-fix",
      hypothesisId,
      location: "src/config/prisma.ts",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
// #endregion

// #region agent log
debugLog("H1", "prisma-module-imported", {
  cwd: process.cwd(),
  nodeEnv: process.env["NODE_ENV"] ?? null,
  databaseUrlPresent: Boolean(process.env["DATABASE_URL"]),
});
// #endregion

// #region agent log
const prismaClientPackagePath = path.join(process.cwd(), "node_modules", "@prisma", "client", "package.json");
const generatedClientIndexPath = path.join(process.cwd(), "node_modules", ".prisma", "client", "index.js");
const generatedClientPackagePath = path.join(process.cwd(), "node_modules", ".prisma", "client", "package.json");
let prismaClientVersion: string | null = null;
let generatedClientVersion: string | null = null;
try {
  prismaClientVersion = JSON.parse(fs.readFileSync(prismaClientPackagePath, "utf8")).version ?? null;
} catch {}
try {
  generatedClientVersion = JSON.parse(fs.readFileSync(generatedClientPackagePath, "utf8")).version ?? null;
} catch {}
debugLog("H2", "prisma-client-files-and-versions", {
  prismaClientPackageExists: fs.existsSync(prismaClientPackagePath),
  generatedClientIndexExists: fs.existsSync(generatedClientIndexPath),
  generatedClientPackageExists: fs.existsSync(generatedClientPackagePath),
  prismaClientVersion,
  generatedClientVersion,
});
// #endregion

const pool = new pg.Pool({
  connectionString: process.env["DATABASE_URL"],
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Neon (and other hosted DBs) require SSL; use verify-full to silence pg deprecation
  ssl: isProduction ? { rejectUnauthorized: true } : undefined,
});

const adapter = new PrismaPg(pool);
// #region agent log
debugLog("H3", "adapter-created", {
  poolMax: 10,
  sslEnabled: isProduction,
});
// #endregion
const prisma = new PrismaClient({ adapter });

// #region agent log
debugLog("H4", "prisma-client-instantiated", {
  instantiated: Boolean(prisma),
});
// #endregion

export async function connectDB(): Promise<void> {
  await prisma.$connect();
  console.log("Database connected successfully");
}

export default prisma;