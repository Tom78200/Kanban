'use client'

import { useEffect } from 'react'

export const useTheme = () => {
  useEffect(() => {
    // Charger le thème depuis localStorage au démarrage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    if (savedDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  const toggleTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('darkMode', isDark.toString())
  }

  return { toggleTheme }
} 
 
 