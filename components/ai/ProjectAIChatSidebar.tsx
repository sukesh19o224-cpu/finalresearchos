'use client'

import { useState, useEffect, useRef } from 'react'
import { useProjectAIChat } from '@/lib/hooks/useProjectAIChat'
import { ResearchAIChat } from './ResearchAIChat'
import { Button } from '@/components/ui/button'
import { X, Sparkles, ChevronLeft } from 'lucide-react'

export function ProjectAIChatSidebar() {
  const { isOpen, closeSidebar, openSidebar } = useProjectAIChat()
  const [isHovering, setIsHovering] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Determine sidebar state
  const shouldExpand = isOpen || isHovering
  
  // Width states
  const getWidthClass = () => {
    if (isOpen) return 'w-[400px]' // Fully expanded
    if (isHovering) return 'w-16' // Hover preview
    return 'w-12' // Collapsed (edge tab only)
  }

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

  return (
    <div
      ref={sidebarRef}
      className={`fixed right-0 top-0 h-full bg-white border-l shadow-2xl transition-all duration-300 ease-in-out z-50 ${getWidthClass()}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Edge Tab (always visible when collapsed) */}
      {!isOpen && (
        <div className="h-full flex items-center justify-center">
          <button
            onClick={openSidebar}
            className="flex flex-col items-center justify-center gap-2 py-8 px-2 bg-gradient-to-b from-purple-600 to-blue-600 text-white rounded-l-lg shadow-lg hover:px-3 transition-all"
          >
            <Sparkles className="h-5 w-5" />
            {isHovering && (
              <span className="text-xs font-medium transform -rotate-90 whitespace-nowrap">
                AI Assistant
              </span>
            )}
          </button>
        </div>
      )}

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
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 overflow-hidden">
            <ResearchAIChat sidebarMode fullScreen />
          </div>
        </div>
      )}
    </div>
  )
}
