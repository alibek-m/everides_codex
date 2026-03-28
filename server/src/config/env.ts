import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  USE_MOCK_DATA: z.coerce.boolean().default(true),
  ENABLE_DEV_AUTH: z.coerce.boolean().default(true),
  API_ALLOWED_ORIGINS: z.string().default("http://localhost:8081,http://localhost:19006"),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/everides"),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  PERSONA_TEMPLATE_ID: z.string().optional(),
  STORAGE_BUCKET: z.string().optional()
});

export type AppEnv = z.infer<typeof envSchema> & {
  allowedOrigins: string[];
};

export const env: AppEnv = (() => {
  const parsed = envSchema.parse(process.env);

  return {
    ...parsed,
    allowedOrigins: parsed.API_ALLOWED_ORIGINS.split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  };
})();
