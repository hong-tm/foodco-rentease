# Appointments and feedback

Admin approves or rejects stall appointment requests, and deletes feedback with an undo countdown. Both use TanStack DB optimistic updates that commit after the undo window.

## Sub-features

- `appointment-approve` / `appointment-reject` on `/dashboard/admin-appointment`.
- `feedback-delete-undo` on `/dashboard/feedback`.

## How to get to it (user POV)

- Sidebar `Stall appointments`; sidebar `Feedback`.

## Driving it with drive.mjs

Preconditions: doctor OK. The seed has one feedback on stall 1 and no appointment notifications.

- Not yet scripted. Start with `node scripts/drive.mjs admin /dashboard/feedback` to read labels, then write a journey that waits for the server `DELETE` after the undo window and reads `"Feedbacks"` back.

## Gotchas

- The server request fires only when the undo ring runs out; wait for the response, not for the row to vanish from the UI (that happens instantly and proves nothing).
- Appointment tests need a seeded row in `"Notifications"` with `appointmentDate` and `stallNumber`; add it to seed.mjs first.
