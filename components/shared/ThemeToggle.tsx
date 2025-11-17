'use client'

import { Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  // Disabled for now - light mode only
  return (
    <Button variant="ghost" size="icon" disabled title="Light mode">
      <Sun className="h-5 w-5" />
    </Button>
  )
}
