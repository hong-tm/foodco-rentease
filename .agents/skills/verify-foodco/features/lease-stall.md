# Lease a stall

Admin edits a stall and leases it to a tenant: name, owner, rent status, start and end date. Persists through `POST /api/stalls/:stallId`.

## Sub-features

- `lease-assign` set owner + rent status + dates on a free stall.
- `lease-edit` change name, size, tier, image on any stall.

## How to get to it (user POV)

- Sidebar `Stall availability` → a stall card (e.g. button `2 Still Empty... 11 m² · Premium RM 5,500.00`) → dialog `Stall 2: Still Empty...`.
- Overview grid button `Stall 2, Still Empty...` opens the same dialog.

## Driving it with journey-lease-stall.mjs

Preconditions: doctor OK, stall 2 free and owned by admin (fresh seed).

- **Open dialog.** Click button `/^2 Still Empty/`. Dialog `Stall 2: ...` with groups `Stall` and `Lease`.
- **Fill.** Textbox `Stall Name` = `Verify Satay Corner`; combobox showing `admin@verify.test` → option `rental@verify.test`; checkbox `Rent Status`; buttons `Start Date` / `End Date` → grid day 10 / 20.
- **Save.** Button `Update Stall`. Expect `POST /api/stalls/2` 200 and toast `Stall updated successfully`.
- **Proof.** Tab `On lease` shows `Stall 2, Verify Satay Corner`; `"Stalls"` row 2 = `Verify Satay Corner|t|rental@verify.test`. Script prints `PASS lease-stall`.

## Gotchas

- Start and End date are required by `updateStallSchema` (end after start); without them the form shows `End date must be after start date`.
- The owner combobox only lists emails that already own a stall (it is built from the stalls list), so a new tenant must own a stall first.
- Regression found 2026-11-15 on cfb5b21: the form wrapped the API call in an empty TanStack DB `createTransaction`; `commit()` skips `mutationFn` when there are no mutations, so the toast showed and no request was sent. The journey reports `never sent` for that failure mode.
