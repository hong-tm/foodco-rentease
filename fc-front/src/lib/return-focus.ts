/**
 * Dialogs opened from a menu item have no trigger left to focus when they close,
 * so focus fell to <body>. Remember the last control pressed outside any overlay
 * and hand focus back to it.
 */
let lastControl: HTMLElement | null = null

function remember(event: Event) {
  const target = event.target
  if (!(target instanceof Element)) return
  const control = target.closest<HTMLElement>(
    'button, a[href], input, select, textarea, [role="button"], [tabindex]',
  )
  if (
    control &&
    !control.closest(
      '[role="menu"], [role="dialog"], [role="alertdialog"], [role="listbox"]',
    )
  ) {
    lastControl = control
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', remember, true)
  document.addEventListener('keydown', remember, true)
}

export function returnFocus(event: Event) {
  if (lastControl?.isConnected) {
    event.preventDefault()
    lastControl.focus()
  }
}
