# Munich Appointment Monitor

Cron-driven appointment monitor for Munich citizen service bookings. It uses backend API endpoints to detect new appointment availability and notify only on changes.

## Highlights

- API-first implementation (no browser automation required)
- Runs as one-shot CLI job (ideal for cron)
- Optional internal scheduler mode with `node-cron`
- State-based change detection (notify only on new availability)
- Modular notifier design (console/file + Telegram)

## Quick start

1. Install dependencies:

```bash
pnpm install
```

2. Create local environment file:

```bash
cp .env.example .env
```

3. Run one-shot check:

```bash
pnpm run job
```

## Configuration

Set values in `.env`.

- `APPOINTMENT_URL`: Source URL containing `/services/{id}/locations/{id}`
- `APPOINTMENT_API_BASE_URL`: Times endpoint
- `AVAILABLE_DAYS_API_BASE_URL`: Available days endpoint
- `LOOKAHEAD_DAYS`: Future window to scan
- `SERVICE_COUNT`: Requested service count
- `REQUEST_TIMEOUT_MS`: HTTP request timeout
- `MAX_RETRIES`: Retries for transient failures
- `TELEGRAM_ENABLED`: Enable or disable Telegram notifier
- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `TELEGRAM_CHAT_ID`: Telegram chat or channel id
- `CRON_EXPRESSION`: Internal scheduler cron expression
- `RUN_MODE`: `once` or `scheduler`
- `STATE_FILE_PATH`: Snapshot storage path
- `LOG_FILE_PATH`: Console/file notifier log path

## Run modes

One-shot mode (recommended for external cron):

```bash
pnpm run job
```

Internal scheduler mode:

```bash
pnpm run scheduler
```

External cron example:

```cron
*/5 * * * * cd /opt/munich-appointment-monitor && /usr/bin/pnpm run job >> /var/log/munich-monitor.log 2>&1
```

## Script reference

- `pnpm run check`: Type-check project
- `pnpm test`: Run unit tests
- `pnpm run job`: Run one-shot monitor job
- `pnpm run scheduler`: Start internal scheduler
- `pnpm run test:telegram-live`: Send live Telegram smoke test message

## API strategy

The monitor uses two endpoints:

- `available-days-by-office`: discover days with potential availability
- `available-appointments-by-office`: fetch times for those days only

Fallback behavior:

If a day is reported as available but times endpoint returns empty, a day-level fallback slot is stored so new day availability can still trigger notification.

## Notifications

Current notifiers:

- Console/file notifier (default)
- Telegram notifier (optional)

Telegram notes:

- Bot must be started in the target chat (or added to group/channel with proper permissions).
- Use `pnpm run test:telegram-live` to verify delivery.

## Development

```bash
pnpm run check
pnpm test
```

## Open-source release checklist

- Ensure `.env` is not committed.
- Rotate any leaked credentials before publishing.
- Keep `.env.example` placeholders only.
- Run checks and tests before tagging a release.

## Disclaimer

This project is not affiliated with the City of Munich. Use responsibly and respect target service terms and fair-use limits.

## License

MIT. See [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).
