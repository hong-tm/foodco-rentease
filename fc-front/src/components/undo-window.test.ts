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
    undo: () => calls.push('undo'),
    onExpired: () => calls.push('expired'),
    setTimer: clock.setTimer,
    clearTimer: clock.clearTimer,
  })
  return { w, clock, calls }
}

test('expires quietly when nobody undoes', () => {
  const { w, clock, calls } = setup()
  clock.fire()
  assert.deepEqual(calls, ['expired'])
  assert.equal(w.state, 'expired')
})

test('undo after the window expired does nothing', () => {
  const { w, clock, calls } = setup()
  clock.fire()
  assert.equal(w.undo(), false)
  assert.deepEqual(calls, ['expired'])
})

test('undo inside the window runs once and the window never expires', () => {
  const { w, clock, calls } = setup()
  assert.equal(w.undo(), true)
  assert.equal(w.undo(), false)
  clock.fire()
  assert.deepEqual(calls, ['undo'])
  assert.equal(w.state, 'undone')
})

test('a failed change closes the window so undo cannot fire', () => {
  const { w, clock, calls } = setup()
  assert.equal(w.fail(), true)
  assert.equal(w.undo(), false)
  clock.fire()
  assert.deepEqual(calls, [])
  assert.equal(w.state, 'failed')
})
