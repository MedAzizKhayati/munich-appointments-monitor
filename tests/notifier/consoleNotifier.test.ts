import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  appendFile: vi.fn(),
  mkdir: vi.fn()
}));

vi.mock("../../src/config/index.js", () => ({
  config: {
    logFilePath: "logs/test-notifications.log"
  }
}));

vi.mock("node:fs", () => ({
  promises: {
    appendFile: mocks.appendFile,
    mkdir: mocks.mkdir
  }
}));

import { ConsoleNotifier } from "../../src/notifier/consoleNotifier";

describe("ConsoleNotifier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    mocks.appendFile.mockReset();
    mocks.mkdir.mockReset();
  });

  it("writes lines to console and log file when slots exist", async () => {
    const notifier = new ConsoleNotifier();

    await notifier.notify(
      [
        {
          date: "02.04.2026",
          time: "08:30",
          displayText: "02.04.2026 08:30"
        }
      ],
      {
        checkedAt: "2026-04-01T13:00:00.000Z",
        source: "https://example.test"
      }
    );

    expect(console.log).toHaveBeenCalledTimes(2);
    expect(mocks.mkdir).toHaveBeenCalledTimes(2);
    expect(mocks.appendFile).toHaveBeenCalledTimes(2);
    expect(mocks.appendFile).toHaveBeenCalledWith(
      "logs/test-notifications.log",
      expect.stringContaining("New Munich appointment slots detected"),
      "utf8"
    );
  });

  it("does nothing when no slots are provided", async () => {
    const notifier = new ConsoleNotifier();

    await notifier.notify([], {
      checkedAt: "2026-04-01T13:00:00.000Z",
      source: "https://example.test"
    });

    expect(console.log).not.toHaveBeenCalled();
    expect(mocks.mkdir).not.toHaveBeenCalled();
    expect(mocks.appendFile).not.toHaveBeenCalled();
  });
});
