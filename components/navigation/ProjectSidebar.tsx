'use client'

import { LucideIcon, Pin, PinOff } from 'lucide-react'
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
  isOpen: boolean
  activeView: string
  onViewChange: (view: string) => void
  navigationItems: NavigationItem[]
  researchTools: ResearchTool[]
  onOpenChange?: (open: boolean) => void
  onWidthChange?: (width: number) => void
  onResizingChange?: (resizing: boolean) => void
  projectId: string
}

export function ProjectSidebar({
  isOpen,
  activeView,
  onViewChange,
  navigationItems,
  researchTools,
  onOpenChange,
  onWidthChange,
  onResizingChange,
  projectId,
}: ProjectSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const COLLAPSED_WIDTH = 64
  const EXPANDED_WIDTH = 280

  // Determine current width based on collapsed state
  const currentWidth = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth
  const shouldShow = isOpen || isHovering

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (onOpenChange) onOpenChange(true)
  }

  const handleMouseLeave = () => {
    if (isResizing) return
    setIsHovering(false)
    if (onOpenChange && !isOpen) onOpenChange(false)
  }

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
    if (!isCollapsed) {
      // Collapsing
      if (onWidthChange) onWidthChange(COLLAPSED_WIDTH)
    } else {
      // Expanding
      if (onWidthChange) onWidthChange(sidebarWidth)
    }
  }

  // Resizable drag logic (only when expanded)
  const startResize = useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return
    e.preventDefault()
    setIsResizing(true)
    if (onResizingChange) onResizingChange(true)
  }, [onResizingChange, isCollapsed])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(e.clientX, 200), 600)
      setSidebarWidth(newWidth)
      if (onWidthChange) onWidthChange(newWidth)
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
  }, [isResizing, onWidthChange])

  return (
    <div
      ref={sidebarRef}
      className="fixed left-0 top-0 h-full bg-white border-r shadow-lg transition-all ease-in-out z-50 overflow-hidden"
      style={{
        width: shouldShow ? `${currentWidth}px` : '0px',
        transitionDuration: isResizing ? '0ms' : '300ms',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full" style={{ minWidth: `${currentWidth}px` }}>
        {/* Header with Pin/Unpin Toggle */}
        <div className={`p-3 border-b flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <span className="text-sm font-semibold text-gray-700">Navigation</span>
          )}
          <AnimatedTooltip content={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}>
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <Pin className="h-4 w-4 text-gray-600" />
              ) : (
                <PinOff className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </AnimatedTooltip>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* File Manager Section */}
          <FileManagerSection projectId={projectId} isCollapsed={isCollapsed} />

          {/* Editor Pages Section */}
          <PageManagerSection projectId={projectId} isCollapsed={isCollapsed} />

          {/* Research Tools - Moved to bottom */}
          <div className={`pt-6 mt-6 border-t ${isCollapsed ? 'space-y-1' : ''}`}>
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

      {/* Resize handle (only visible when expanded) */}
      {shouldShow && !isCollapsed && (
        <div
          onMouseDown={startResize}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 transition-colors"
          style={{ backgroundColor: isResizing ? '#3b82f6' : 'transparent' }}
        />
      )}
    </div>
  )
}
