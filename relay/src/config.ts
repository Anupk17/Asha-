import dotenv from "dotenv";
import { z } from "zod";

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

