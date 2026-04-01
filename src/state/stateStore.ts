import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "../config/index";
import type { AvailabilitySnapshot } from "../types";

const EMPTY_SNAPSHOT: AvailabilitySnapshot = {
  checkedAt: "",
  hasAvailability: false,
  slots: []
};

async function ensureDirectory(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function readPreviousSnapshot(): Promise<AvailabilitySnapshot> {
  try {
    const content = await fs.readFile(config.stateFilePath, "utf8");
    const parsed = JSON.parse(content) as AvailabilitySnapshot;

    if (!Array.isArray(parsed.slots)) {
      return EMPTY_SNAPSHOT;
    }

    return parsed;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

export async function writeSnapshot(snapshot: AvailabilitySnapshot): Promise<void> {
  await ensureDirectory(config.stateFilePath);
  const tempPath = `${config.stateFilePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(snapshot, null, 2), "utf8");
  await fs.rename(tempPath, config.stateFilePath);
}
