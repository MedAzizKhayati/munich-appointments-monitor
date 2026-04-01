import { config } from "../config/index";
import { ConsoleNotifier } from "./consoleNotifier";
import type { Notifier } from "./notifier";
import { TelegramNotifier } from "./telegramNotifier";

export function buildNotifiers(): Notifier[] {
  const notifiers: Notifier[] = [new ConsoleNotifier()];

  if (config.telegramEnabled && config.telegramBotToken && config.telegramChatId) {
    notifiers.push(new TelegramNotifier());
  }

  return notifiers;
}
