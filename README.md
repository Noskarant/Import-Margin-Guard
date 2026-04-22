# Import Margin Guard — strict MVP demo flow

This pass hardens the first thin slice into a coherent, persisted demo flow:

1. Sign up / sign in
2. Create organization
3. Upload CSV and parse preview
4. Map required columns and commit import
5. Create analysis with baseline + scenario B
6. Edit scenarios and compare landed-cost outputs
7. Save analysis and reopen it from Saved Analyses

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
