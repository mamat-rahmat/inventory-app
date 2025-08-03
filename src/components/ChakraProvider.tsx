'use client'

import { ChakraProvider as ChakraUIProvider } from '@chakra-ui/react'
import { CacheProvider } from '@chakra-ui/next-js'
import { SessionProvider } from 'next-auth/react'

export function ChakraProvider({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraUIProvider>
        <SessionProvider>
          {children}
        </SessionProvider>
      </ChakraUIProvider>
    </CacheProvider>
  )
}