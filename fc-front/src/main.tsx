import { StrictMode } from 'react'
import * as Sentry from '@sentry/react'
import { createRoot } from 'react-dom/client'

import './index.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { queryClient } from '@/lib/query-client'

import { RouteError } from '@/components/route-error'
import { ThemeProvider } from '@/components/theme-provider'

import { routeTree } from './routeTree.gen'

Sentry.init({
  dsn:
    import.meta.env.VITE_SENTRY_DSN ??
    'https://b9dbcd2dee8f1c3285c6c88eb43c7dca@o4509593903497216.ingest.us.sentry.io/4512437299249152',
  release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  // Queries own the caching; preloading only warms the route chunk.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultErrorComponent: RouteError,
  // An unknown URL shows the full-page 404, not a 404 inside the dashboard.
  notFoundMode: 'root',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <ReactQueryDevtools initialIsOpen={false} />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
