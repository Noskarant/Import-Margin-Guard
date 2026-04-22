# Import Margin Guard — strict MVP demo flow

This pass hardens the first thin slice into a coherent, persisted demo flow:

1. Sign up / sign in
2. Create organization
3. Upload CSV and parse preview
4. Map required columns and commit import
5. Create analysis with baseline + scenario B
6. Edit scenarios and compare landed-cost outputs
7. Save analysis and reopen it from Saved Analyses

## Runtime requirement (important)

Use **Node 22.x or 24.x**. Node 25+ can trigger Next.js dev-server runtime errors such as:

- `TypeError: localStorage.getItem is not a function`
- `Warning: --localstorage-file was provided without a valid path`

This repo now enforces `node < 25` via `engines` and predev/prebuild checks.

## Local run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Demo data persistence

A demo JSON store is written to:

- `data/demo-db.json`

This is intentionally simple to make the end-to-end MVP flow reliably demoable without external setup.

## Tests

```bash
npm test
```
