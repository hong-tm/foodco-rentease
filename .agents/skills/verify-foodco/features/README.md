# FoodCo RentEase verification map

Maintained recipes for the user-facing features. Read this index, then the feature file.

## Baseline preconditions

- `scripts/launch.sh` finished and `scripts/doctor.sh` prints `doctor: OK`.
- Seed data as listed in `SKILL.md`. Journeys mutate it; relaunch (teardown + launch) for a clean baseline.
- `NODE_PATH=/usr/local/lib/node_modules` for browser scripts.

## Driving conventions

- Select by ARIA role and accessible name. Labels below are copied from the live ARIA snapshot on cfb5b21.
- Wait for the specific API response, not for time.
- Read the database row back after every mutation.

## Features

| ID | File | Role | Driven by a journey |
|---|---|---|---|
| sign-in | [sign-in.md](sign-in.md) | all | API only (`login.mjs`) |
| admin-overview | [admin-overview.md](admin-overview.md) | admin | `drive.mjs` snapshot |
| lease-stall | [lease-stall.md](lease-stall.md) | admin | `journey-lease-stall.mjs` |
| utility-bill | [utility-bill.md](utility-bill.md) | admin | `journey-utility-bill.mjs` |
| appointments-feedback | [appointments-feedback.md](appointments-feedback.md) | admin | not yet |
