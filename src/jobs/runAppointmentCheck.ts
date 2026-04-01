import { config } from "../config/index";
import { logger } from "../config/logger";
import { buildNotifiers } from "../notifier/index";
import { detectNewSlots } from "../state/diff";
import { readPreviousSnapshot, writeSnapshot } from "../state/stateStore";
import type { AvailabilitySnapshot } from "../types";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { fetchAvailabilitySnapshotFromApi } from "../api/appointmentsApi";

function toErrorDetails(error: unknown): Record<string, string> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack ?? ""
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
    stack: ""
  };
}

async function withRetries<T>(run: () => Promise<T>, retries: number): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      logger.warn({ attempt, error: toErrorDetails(error) }, "Attempt failed");
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError;
}

async function scrapeSnapshot(): Promise<AvailabilitySnapshot> {
  return fetchAvailabilitySnapshotFromApi();
}

export async function runAppointmentCheck(): Promise<void> {
  const notifiers = buildNotifiers();

  const previousSnapshot = await readPreviousSnapshot();

  const currentSnapshot = await withRetries(
    () => scrapeSnapshot(),
    config.maxRetries
  );

  const newlyAvailableSlots = detectNewSlots(
    previousSnapshot.slots,
    currentSnapshot.slots
  );

  if (newlyAvailableSlots.length > 0) {
    for (const notifier of notifiers) {
      await notifier.notify(newlyAvailableSlots, {
        checkedAt: currentSnapshot.checkedAt,
        source: config.appointmentUrl
      });
    }
  } else {
    logger.info("No new availability detected");
  }

  await writeSnapshot(currentSnapshot);
}

const isDirectRun =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  runAppointmentCheck()
    .then(() => {
      logger.info("Appointment check completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error: toErrorDetails(error) }, "Appointment check failed");
      process.exit(1);
    });
}
