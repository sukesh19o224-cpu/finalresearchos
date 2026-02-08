'use client'

import { useState } from 'react'
import { ResearchAIChat } from './ResearchAIChat'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronRight } from 'lucide-react'

interface ProjectAIChatSidebarProps {
  projectId: string
  onWidthChange?: (width: number) => void
}

export function ProjectAIChatSidebar({ projectId, onWidthChange }: ProjectAIChatSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const COLLAPSED_WIDTH = 64
  const EXPANDED_WIDTH = 400

  const currentWidth = (isExpanded || isHovering) ? EXPANDED_WIDTH : COLLAPSED_WIDTH
  const isVisible = isExpanded || isHovering

  const handleMouseEnter = () => {
    setIsHovering(true)
    setIsExpanded(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setIsExpanded(false) // Close when mouse leaves the sidebar
  }

  const handleClose = () => {
    setIsExpanded(false)
    setIsHovering(false)
  }

  return (
    <div
      className="h-full bg-white border-l shadow-lg transition-all ease-in-out overflow-hidden"
      style={{
        width: `${currentWidth}px`,
        transitionDuration: '200ms',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full" style={{ minWidth: `${currentWidth}px` }}>
        {/* Collapsed State - Icon Only */}
        {!isVisible && (
          <div className="flex items-center justify-center h-full">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
        )}

        {/* Expanded State - Full Interface */}
        {isVisible && (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">AI Research Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col min-h-0">
              <ResearchAIChat projectId={projectId} sidebarMode fullScreen />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
