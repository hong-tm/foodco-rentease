# Utility bill

Admin creates a water or electric bill for a leased stall; the tenant sees it as a pending payment. Persists through `POST /api/payments/create-utility-payment`.

## Sub-features

- `bill-create` new bill from the dialog.
- `bill-filter` tabs `All`/`Unpaid`/`Paid`, comboboxes `Filter by type` / `Filter by tenant`.

## How to get to it (user POV)

- Sidebar `Utilities` (`/dashboard/stall-payment`) → button `New bill` → dialog `New bill`.

## Driving it with journey-utility-bill.mjs

Preconditions: doctor OK, stall 1 leased (fresh seed).

- **Fill.** Combobox `Stall` → stall 1; combobox `Type` → water; spinbutton `Amount (RM)` = `42.50`; button `Bill date` → day 10.
- **Save.** Button `Create bill`. Expect `POST /api/payments/create-utility-payment` 201.
- **Proof.** A table row containing `42.50`; `"Payments"` gains one row with `stallId 1`, `paymentType water`. Script prints `PASS utility-bill`.

## Gotchas

- `paymentAmount` is stored as text without trailing zeros (`42.5`); compare with `::numeric`.
- Same empty-transaction regression as lease-stall existed here on cfb5b21.
