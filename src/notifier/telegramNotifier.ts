import { config } from "../config/index";
import type { AppointmentSlot } from "../types";
import type { Notifier, NotifierContext } from "./notifier";

function escapeMarkdownV2(value: string): string {
  return value.replace(/([_\-*\[\]()~`>#+=|{}.!\\])/g, "\\$1");
}

export class TelegramNotifier implements Notifier {
  async notify(newSlots: AppointmentSlot[], context: NotifierContext): Promise<void> {
    if (!config.telegramBotToken || !config.telegramChatId || newSlots.length === 0) {
      return;
    }

    const header = `*New Munich appointment slots* (${newSlots.length})`;
    const meta = `Checked: ${context.checkedAt}`;
    const source = `Source: ${context.source}`;
    const slots = newSlots
      .slice(0, 30)
      .map((slot) => `- ${slot.date} ${slot.time}`)
      .join("\n");

    const suffix =
      newSlots.length > 30 ? `\n...and ${newSlots.length - 30} more slots` : "";

    const text = [header, meta, source, "", slots + suffix]
      .map(escapeMarkdownV2)
      .join("\n");

    const endpoint = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        chat_id: config.telegramChatId,
        text,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`Telegram notify failed: ${response.status} ${errorBody}`);
    }
  }
}
