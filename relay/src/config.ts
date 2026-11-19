import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Look for .env in relay/ or project root
const candidatePaths = [
  path.resolve(__dirname, "../.env"),
  path.resolve(__dirname, "../../relay/.env"),
  path.resolve(process.cwd(), "relay/.env"),
  path.resolve(process.cwd(), ".env"),
];

for (const envPath of candidatePaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5174,http://localhost:5173"),
  GNANI_API_KEY: z.string().default("dev_placeholder_gnani_key"),
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  FIREBASE_SERVICE_ACCOUNT_B64: z.string().optional().default(""),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ CRITICAL: Relay environment validation failed!");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  throw new Error("Missing or invalid relay environment variables. Check relay/.env");
}

export const config = parsed.data;

