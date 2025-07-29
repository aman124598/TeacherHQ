'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface DarkModeWrapperProps {
  children: React.ReactNode
}

export function DarkModeWrapper({ children }: DarkModeWrapperProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const htmlElement = document.documentElement
      if (theme === 'dark') {
        htmlElement.classList.add('dark')
      } else {
        htmlElement.classList.remove('dark')
      }
    }
  }, [theme, mounted])

  return <>{children}</>
}
