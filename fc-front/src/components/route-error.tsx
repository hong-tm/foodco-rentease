import { useEffect } from 'react'
import * as Sentry from '@sentry/react'

/** Fallback for a render error in any route; keeps the app shell usable. */
export function RouteError({ error }: { error: unknown }) {
  useEffect(() => {
    // Route boundaries swallow the exception from the global handlers, so
    // report it here; one report per failed render.
    if (error) Sentry.captureException(error)
  }, [error])

  return (
    <div className="p-2">Something went wrong, please refresh the page ...</div>
  )
}
