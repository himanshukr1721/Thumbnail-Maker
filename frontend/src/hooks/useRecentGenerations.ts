import { useCallback, useEffect, useState } from 'react'
import type { GeneratedThumbnail } from '@/types'

const STORAGE_KEY = 'thumbforge-recent'

export function useRecentGenerations() {
  const [recent, setRecent] = useState<GeneratedThumbnail[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent))
  }, [recent])

  const addGenerations = useCallback((items: GeneratedThumbnail[]) => {
    setRecent((prev) => {
      const merged = [...items, ...prev]
      const seen = new Set<string>()
      return merged.filter((item) => {
        if (seen.has(item.id)) return false
        seen.add(item.id)
        return true
      }).slice(0, 48)
    })
  }, [])

  const removeGeneration = useCallback((id: string) => {
    setRecent((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setRecent([])
  }, [])

  return { recent, addGenerations, removeGeneration, clearAll }
}
