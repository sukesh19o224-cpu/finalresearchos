'use client'

import { useEffect, useRef } from 'react'
import { useProjectAIChat } from '@/lib/hooks/useProjectAIChat'
import { ResearchAIChat } from './ResearchAIChat'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronRight } from 'lucide-react'

export function ProjectAIChatSidebar() {
  const { isOpen, closeSidebar, openSidebar, toggleSidebar } = useProjectAIChat()
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        closeSidebar()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, closeSidebar])

  // Toggle button position classes
  const baseClasses = 'fixed top-1/2 -translate-y-1/2 z-50 transition-all duration-300 rounded-l-lg rounded-r-none shadow-lg bg-gradient-to-b from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0'
  const positionClass = isOpen ? 'right-[400px]' : 'right-0'
  const buttonClasses = `${baseClasses} ${positionClass}`

  return (
    <>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed right-0 top-0 h-full bg-white border-l shadow-2xl transition-all duration-300 ease-in-out z-40 ${isOpen ? 'w-[400px]' : 'w-0'}`}
      >
        {/* Expanded Sidebar Content */}
        {isOpen && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">AI Research Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSidebar}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 overflow-hidden">
              <ResearchAIChat sidebarMode fullScreen />
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button - Always visible, peeks out from edge */}
      <button
        onClick={toggleSidebar}
        className={buttonClasses}
      >
        <Sparkles className="h-10 w-10" />
      </button>
    </>
  )
}
