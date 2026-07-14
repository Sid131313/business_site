# Tariff cache and cron

This site loads tariff cards from local JSON through `api/tariffs.php`.

## Daily update

Run this from cron once a day, preferably at night:

```bash
php /path/to/site/cron/update-tariffs.php
```

## What the update script does

- fetches city pages from JustConnect;
- parses home and business tariff blocks;
- writes a temporary JSON file first;
- replaces `data/tariffs.json` atomically after a successful build;
- keeps the previous cache if the update fails.

## Safe manual run

Use CLI only:

```bash
php cron/update-tariffs.php
```

## Notes

- `api/tariffs.php` serves the cached JSON to the frontend.
- The city list is stored in `script.js` and the slug map must match the actual JustConnect city URLs.
- If a city has no public tariffs, the page shows a clear fallback message instead of fake cards.
