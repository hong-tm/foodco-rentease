// Run: node --test src/components/undo-window.test.ts
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createUndoWindow } from './undo-window.ts'

function fakeClock() {
  let pending: (() => void) | null = null
  return {
    setTimer: (fn: () => void) => ((pending = fn), 1),
    clearTimer: () => (pending = null),
    fire: () => pending?.(),
  }
}

function setup() {
  const clock = fakeClock()
  const calls: string[] = []
  const w = createUndoWindow({
    ms: 5000,
    commit: () => calls.push('commit'),
    rollback: () => calls.push('rollback'),
    onCommitted: () => calls.push('dismiss'),
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
  })
  return { w, clock, calls }
}

test('commits and dismisses when the window runs out', () => {
  const { w, clock, calls } = setup()
  clock.fire()
  assert.deepEqual(calls, ['commit', 'dismiss'])
  assert.equal(w.state, 'committed')
})

test('undo after the window committed does nothing', () => {
  const { w, clock, calls } = setup()
  clock.fire()
  assert.equal(w.undo(), false)
  assert.deepEqual(calls, ['commit', 'dismiss'])
})

test('undo inside the window rolls back once and never commits', () => {
  const { w, clock, calls } = setup()
  assert.equal(w.undo(), true)
  assert.equal(w.undo(), false)
  clock.fire()
  assert.deepEqual(calls, ['rollback'])
  assert.equal(w.state, 'undone')
})
