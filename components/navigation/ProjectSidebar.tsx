'use client'

import { LucideIcon } from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { FileManagerSection } from '@/components/files/FileManagerSection'
import { PageManagerSection } from '@/components/pages/PageManagerSection'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'

interface NavigationItem {
  id: string
  label: string
  icon: LucideIcon
}

interface ResearchTool {
  id: string
  title: string
  description: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
}

interface ProjectSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  navigationItems: NavigationItem[]
  researchTools: ResearchTool[]
  onWidthChange?: (width: number) => void
  onResizingChange?: (resizing: boolean) => void
  projectId: string
}

export function ProjectSidebar({
  activeView,
  onViewChange,
  navigationItems,
  researchTools,
  onWidthChange,
  onResizingChange,
  projectId,
}: ProjectSidebarProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const COLLAPSED_WIDTH = 64

  // Current width: collapsed (64px) or expanded (sidebarWidth)
  const currentWidth = isHovering ? sidebarWidth : COLLAPSED_WIDTH
  const isCollapsed = !isHovering

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    if (isResizing) return
    setIsHovering(false)
  }

  // Notify parent of width changes
  useEffect(() => {
    if (onWidthChange) {
      onWidthChange(currentWidth)
    }
  }, [currentWidth, onWidthChange])

  // Resizable drag logic (only when hovering/expanded)
  const startResize = useCallback((e: React.MouseEvent) => {
    if (!isHovering) return
    e.preventDefault()
    setIsResizing(true)
    if (onResizingChange) onResizingChange(true)
  }, [onResizingChange, isHovering])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(e.clientX, 200), 600)
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      if (onResizingChange) onResizingChange(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  return (
    <div
      ref={sidebarRef}
      className="h-full bg-white border-r shadow-lg transition-all ease-in-out overflow-hidden"
      style={{
        width: `${currentWidth}px`,
        transitionDuration: isResizing ? '0ms' : '200ms',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full" style={{ minWidth: `${sidebarWidth}px` }}>
        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2 space-y-1' : 'p-4 space-y-2'}`}>
          {/* File Manager Section */}
          <FileManagerSection projectId={projectId} isCollapsed={isCollapsed} />

          {/* Editor Pages Section */}
          <PageManagerSection projectId={projectId} isCollapsed={isCollapsed} />

          {/* Research Tools - Moved to bottom */}
          <div className={`${isCollapsed ? 'pt-2 mt-2 border-t space-y-1' : 'pt-6 mt-6 border-t'}`}>
            {!isCollapsed && (
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Research Tools
              </div>
            )}
            {researchTools.map((tool) => {
              const Icon = tool.icon
              const isActive = activeView === tool.id

              if (isCollapsed) {
                return (
                  <AnimatedTooltip key={tool.id} content={tool.title}>
                    <button
                      onClick={() => onViewChange(tool.id)}
                      className={`
                        w-full flex items-center justify-center
                        p-3 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      aria-label={tool.title}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                    </button>
                  </AnimatedTooltip>
                )
              }

              const btnBaseClasses = 'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all'
              const btnActiveClasses = isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
              const buttonClasses = btnBaseClasses + ' ' + btnActiveClasses

              return (
                <button
                  key={tool.id}
                  onClick={() => onViewChange(tool.id)}
                  className={buttonClasses}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{tool.title}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Resize handle (only visible when hovering) */}
      {isHovering && (
        <div
          onMouseDown={startResize}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 transition-colors"
          style={{ backgroundColor: isResizing ? '#3b82f6' : 'transparent' }}
        />
      )}
    </div>
  )
}
