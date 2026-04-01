import cron from "node-cron";
import { config } from "../config/index";
import { logger } from "../config/logger";
import { runAppointmentCheck } from "./runAppointmentCheck";
import { fileURLToPath } from "node:url";
import path from "node:path";

let running = false;

async function runSafely(): Promise<void> {
  if (running) {
    logger.warn("Skipping tick because previous run is still in progress");
    return;
  }

  running = true;
  try {
    await runAppointmentCheck();
  } catch (error) {
    logger.error({ error }, "Scheduled run failed");
  } finally {
    running = false;
  }
}

export function startScheduler(): void {
  logger.info({ cron: config.cronExpression }, "Starting scheduler");
  cron.schedule(config.cronExpression, () => {
    void runSafely();
  });
}

const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  startScheduler();
}
