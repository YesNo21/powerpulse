import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'
import { createCaller, type AppRouter } from '@/server/api/root'
import { createInnerTRPCContext } from '@/server/api/trpc'

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
export const createContext = cache(async () => {
  const heads = new Headers(headers())
  heads.set('x-trpc-source', 'rsc')

  return createInnerTRPCContext({
    headers: heads,
  })
})

export const api = createCaller(createContext)