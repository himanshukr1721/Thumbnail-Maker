import { useCallback, useEffect, useState } from 'react'
import type { AppSettings } from '@/types'

const STORAGE_KEY = 'thumbforge-settings'

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  quality: 'hd',
  resolution: '1080p',
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    document.documentElement.classList.toggle('light', settings.theme === 'light')
  }, [settings])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  return { settings, updateSettings }
}
