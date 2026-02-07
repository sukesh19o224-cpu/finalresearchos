'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarToggleProps {
  isOpen: boolean
  onToggle: () => void
  sidebarWidth?: number
  isResizing?: boolean
}

export function SidebarToggle({ isOpen, onToggle, sidebarWidth = 280, isResizing = false }: SidebarToggleProps) {
  return (
    <Button
      onClick={onToggle}
      className="fixed top-1/2 -translate-y-1/2 z-50 rounded-r-lg rounded-l-none shadow-lg"
      style={{
        left: isOpen ? `${sidebarWidth}px` : '0px',
        transition: isResizing ? 'none' : 'left 300ms ease-in-out',
      }}
      size="sm"
      variant="default"
    >
      {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </Button>
  )
}
