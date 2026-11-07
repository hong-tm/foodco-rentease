import type { StallUserAttributes } from '@server/db/userModel'

// The board reproduces the recorded floor plan: seven stalls along the front,
// three back-to-back pairs across the centre aisle, seven along the rear. A
// stall set of any other size falls back to a plain grid.
export const FRONT_ROW = 7
export const AISLE_PAIRS = 3
export const FLOOR_PLAN_SIZE = FRONT_ROW * 2 + AISLE_PAIRS * 2

export type StallState = 'rented' | 'vacant' | 'ended'

export function stallState(stall: StallUserAttributes): StallState {
  if (!stall.rentStatus) return 'vacant'
  if (stall.endAt && new Date(stall.endAt).getTime() < Date.now())
    return 'ended'
  return 'rented'
}
