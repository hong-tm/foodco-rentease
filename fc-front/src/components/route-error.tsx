/** Fallback for a render error in any route; keeps the app shell usable. */
export function RouteError() {
  return (
    <div className="p-2">Something went wrong, please refresh the page ...</div>
  )
}
