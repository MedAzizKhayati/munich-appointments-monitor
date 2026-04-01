import { config } from "./config/index";
import { logger } from "./config/logger";
import { runAppointmentCheck } from "./jobs/runAppointmentCheck";
import { startScheduler } from "./jobs/scheduler";

async function main(): Promise<void> {
  if (config.runMode === "scheduler" || process.argv.includes("--scheduler")) {
    startScheduler();
    return;
  }

  await runAppointmentCheck();
}

main().catch((error) => {
  logger.error({ error }, "Application failed");
  process.exit(1);
});
