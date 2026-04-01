import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/index.js", () => ({
  config: {
    telegramBotToken: "bot-token",
    telegramChatId: "123456"
  }
}));

import { TelegramNotifier } from "../../src/notifier/telegramNotifier";

describe("TelegramNotifier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a telegram message when slots exist", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true
    });

    vi.stubGlobal("fetch", fetchMock);

    const notifier = new TelegramNotifier();

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

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("https://api.telegram.org/botbot-token/sendMessage");
    expect(init.method).toBe("POST");
  });

  it("throws when telegram API responds with non-ok status", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => "bad request"
    });

    vi.stubGlobal("fetch", fetchMock);

    const notifier = new TelegramNotifier();

    await expect(
      notifier.notify(
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
      )
    ).rejects.toThrow("Telegram notify failed: 400 bad request");
  });
});
