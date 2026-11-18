import assert from 'node:assert/strict'
import { test } from 'node:test'

import { payRows } from './pay-rows.ts'

const row = (
  id: number,
  stall: number,
  date: string,
  read: boolean | null,
) => ({
  notificationId: id,
  stallNumber: stall,
  appointmentDate: date,
  notificationRead: read,
})

test('one pay row per stall: the latest approved visit', () => {
  const rows = [
    row(1, 7, '2026-10-25', true),
    row(2, 7, '2026-11-19', true),
    row(3, 14, '2026-11-25', true),
    row(4, 7, '2026-11-30', null),
  ]
  const pay = payRows(rows, () => false)
  assert.deepEqual(
    [...pay.entries()].map(([stall, r]) => [stall, r.notificationId]),
    [
      [7, 2],
      [14, 3],
    ],
  )
})

test('a paid or rejected stall gets no pay row', () => {
  const rows = [row(1, 7, '2026-10-25', true), row(2, 9, '2026-11-01', false)]
  assert.equal(payRows(rows, (stall) => stall === 7).size, 0)
})
