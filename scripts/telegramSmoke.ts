import { config } from "../src/config/index";
import { TelegramNotifier } from "../src/notifier/telegramNotifier";

async function main(): Promise<void> {
  if (!config.telegramBotToken || !config.telegramChatId) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env");
  }

  const notifier = new TelegramNotifier();

  await notifier.notify(
    [
      {
        date: "01.04.2026",
        time: "12:00",
        displayText: "Live smoke test message"
      }
    ],
    {
      checkedAt: new Date().toISOString(),
      source: "telegram-smoke-test"
    }
  );

  console.log("Telegram smoke test sent successfully.");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Telegram smoke test failed: ${message}`);
  process.exit(1);
});
