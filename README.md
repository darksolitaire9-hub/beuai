# beuai

Scan bills. Get CSV. Do your own analysis.

## Why this exists

Most tools want your data and your attention.
This one just turns messy bills into structured rows and lets you leave.

## What you get

- Scan bills and receipts (photos or uploads).
- Extract line items: store, date, items, quantities, prices, discounts.
- Keep a local history of scanned receipts in your browser.
- Export everything as CSV (one row per line item) for your own workflows:
  Sheets, Excel, Python, DuckDB, whatever.

## What you don't get (yet)

- No dashboards, budgeting, or “AI insights”.
- No accounts, sync, or team features.
- No hand-holding on analysis — you own the data and the decisions.

## How it works

- Frontend: Nuxt 4 + Vue 3 + Nuxt UI.
- Storage: IndexedDB in the browser (data stays on your device).
- Export: CSV download of all saved receipts.


## Development

```bash
pnpm install
pnpm dev
```

## License

MIT
