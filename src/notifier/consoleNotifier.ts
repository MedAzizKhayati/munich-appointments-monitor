import { promises as fs } from "node:fs";
import path from "node:path";
import { config } from "../config/index";
import type { Notifier, NotifierContext } from "./notifier";
import type { AppointmentSlot } from "../types";

async function appendLog(line: string): Promise<void> {
  await fs.mkdir(path.dirname(config.logFilePath), { recursive: true });
  await fs.appendFile(config.logFilePath, `${line}\n`, "utf8");
}

export class ConsoleNotifier implements Notifier {
  async notify(newSlots: AppointmentSlot[], context: NotifierContext): Promise<void> {
    if (newSlots.length === 0) {
      return;
    }

    const lines = [
      `[${context.checkedAt}] New Munich appointment slots detected (${newSlots.length})`,
      ...newSlots.map((slot) => `- ${slot.date} ${slot.time} | ${slot.displayText}`)
    ];

    for (const line of lines) {
      console.log(line);
      await appendLog(line);
    }
  }
}
