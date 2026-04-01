import path from "node:path";
import { loadEnv } from "./env";

const env = loadEnv();

export const config = {
  appointmentUrl: env.APPOINTMENT_URL,
  appointmentApiBaseUrl: env.APPOINTMENT_API_BASE_URL,
  availableDaysApiBaseUrl: env.AVAILABLE_DAYS_API_BASE_URL,
  lookaheadDays: env.LOOKAHEAD_DAYS,
  serviceCount: env.SERVICE_COUNT,
  requestTimeoutMs: env.REQUEST_TIMEOUT_MS,
  telegramEnabled: env.TELEGRAM_ENABLED,
  telegramBotToken: env.TELEGRAM_BOT_TOKEN,
  telegramChatId: env.TELEGRAM_CHAT_ID,
  cronExpression: env.CRON_EXPRESSION,
  runMode: env.RUN_MODE,
  maxRetries: env.MAX_RETRIES,
  stateFilePath: path.resolve(env.STATE_FILE_PATH),
  logFilePath: path.resolve(env.LOG_FILE_PATH)
} as const;
