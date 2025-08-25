// context/LoaderContext.tsx
"use client"

import React, { createContext, useContext, useState } from 'react'
import { GlobalLoader, GlobalLoaderProps } from '@/components/GlobalLoader'

interface LoaderContextType {
  showLoader: (options?: Partial<GlobalLoaderProps>) => void
  hideLoader: () => void
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined)

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [loaderState, setLoaderState] = useState<GlobalLoaderProps & { isVisible: boolean }>({
    isVisible: false,
    showLoader: false,
    timeout: 10000,
    message: "Loading...",
    dismissible: false
  })

  const showLoader = (options: Partial<GlobalLoaderProps> = {}) => {
    setLoaderState(prev => ({
      ...prev,
      isVisible: true,
      showLoader: true,
      ...options
    }))
  }

  const hideLoader = () => {
    setLoaderState(prev => ({
      ...prev,
      isVisible: false,
      showLoader: false
    }))
  }

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      <GlobalLoader {...loaderState} />
    </LoaderContext.Provider>
  )
}

export const useLoader = () => {
  const context = useContext(LoaderContext)
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider')
  }
  return context
}