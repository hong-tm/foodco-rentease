# Admin overview

The admin landing page: occupancy summary, stall grid, follow-up counts.

## Sub-features

- `overview-summary` sentence "N of 8 stalls are let".
- `overview-grid` one button per stall.

## How to get to it (user POV)

- Sign in as admin; `/dashboard` redirects to `/dashboard/admin-dashboard`. Sidebar link `Overview`.

## Driving it with drive.mjs

Preconditions: doctor OK, fresh seed.

- **Open.** `node scripts/drive.mjs admin /dashboard overview`. URL ends `/dashboard/admin-dashboard`; heading `Overview` (level 1).
- **Summary.** Paragraph reads `1 of 8 stalls are let.`
- **Grid.** Buttons `Stall 1, Verify Noodle House` through `Stall 8, Still Empty...`. Links `Free 7`, `On lease 1`.

## Gotchas

- Counts change after lease-stall runs; relaunch for the baseline numbers.
