import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  APPOINTMENT_URL: z.string().url(),
  CRON_EXPRESSION: z.string().default("*/5 * * * *"),
  RUN_MODE: z.enum(["once", "scheduler"]).default("once"),
  APPOINTMENT_API_BASE_URL: z
    .string()
    .url()
    .default("https://www48.muenchen.de/buergeransicht/api/citizen/available-appointments-by-office/"),
  AVAILABLE_DAYS_API_BASE_URL: z
    .string()
    .url()
    .default("https://www48.muenchen.de/buergeransicht/api/citizen/available-days-by-office/"),
  LOOKAHEAD_DAYS: z.coerce.number().int().min(1).max(120).default(7),
  SERVICE_COUNT: z.coerce.number().int().min(1).max(10).default(1),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  TELEGRAM_ENABLED: z
    .string()
    .optional()
    .transform((value) => (value ?? "false").toLowerCase() === "true"),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  MAX_RETRIES: z.coerce.number().int().min(1).max(10).default(3),
  STATE_FILE_PATH: z.string().default("data/state.json"),
  LOG_FILE_PATH: z.string().default("logs/notifications.log")
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  return envSchema.parse(process.env);
}
