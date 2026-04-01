import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/index.js", () => ({
  config: {
    telegramEnabled: true,
    telegramBotToken: "bot-token",
    telegramChatId: "123456"
  }
}));

import { buildNotifiers } from "../../src/notifier/index";
import { ConsoleNotifier } from "../../src/notifier/consoleNotifier";
import { TelegramNotifier } from "../../src/notifier/telegramNotifier";

describe("buildNotifiers", () => {
  it("always includes console notifier", () => {
    const notifiers = buildNotifiers();
    expect(notifiers.some((item) => item instanceof ConsoleNotifier)).toBe(true);
  });

  it("includes telegram notifier when telegram is fully configured", () => {
    const notifiers = buildNotifiers();
    expect(notifiers.some((item) => item instanceof TelegramNotifier)).toBe(true);
  });
});
