'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Skip if in input field (except for Cmd/Ctrl combinations)
      if (isInputField && !e.metaKey && !e.ctrlKey) {
        return
      }

      // G + H: Go to Home
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !isInputField) {
        const nextKey = (nextE: KeyboardEvent) => {
          if (nextE.key === 'h') {
            router.push('/dashboard')
          } else if (nextE.key === 'p') {
            router.push('/dashboard/projects')
          }
          document.removeEventListener('keydown', nextKey)
        }
        document.addEventListener('keydown', nextKey)
        setTimeout(() => document.removeEventListener('keydown', nextKey), 1000)
      }

      // N + P: New Project
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !isInputField) {
        const nextKey = (nextE: KeyboardEvent) => {
          if (nextE.key === 'p') {
            router.push('/dashboard/projects/new')
          }
          document.removeEventListener('keydown', nextKey)
        }
        document.addEventListener('keydown', nextKey)
        setTimeout(() => document.removeEventListener('keydown', nextKey), 1000)
      }

      // Cmd/Ctrl + U: Focus upload (if on project page)
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault()
        // Trigger click on upload tab if it exists
        const uploadTab = document.querySelector('[data-tab="upload"]') as HTMLElement
        if (uploadTab) {
          uploadTab.click()
        }
      }

      // Cmd/Ctrl + /: Toggle sidebar (future feature)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        // Future: toggle sidebar
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [router])
}
