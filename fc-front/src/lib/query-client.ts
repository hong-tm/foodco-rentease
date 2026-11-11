import { QueryClient } from '@tanstack/react-query'

// Single shared QueryClient: main.tsx provides it to <QueryClientProvider>,
// TanStack DB collections read and write the same cache through it.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
  },
})
