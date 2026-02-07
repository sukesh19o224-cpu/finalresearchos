'use client'

import { LucideIcon } from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { FileManagerSection } from '@/components/files/FileManagerSection'
import { PageManagerSection } from '@/components/pages/PageManagerSection'

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
  const [isHovering, setIsHovering] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

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

  // Resizable drag logic
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    if (onResizingChange) onResizingChange(true)
  }, [onResizingChange])

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
  }, [isResizing])

  return (
    <div
      ref={sidebarRef}
      className="fixed left-0 top-0 h-full bg-white border-r shadow-lg transition-all ease-in-out z-50 overflow-hidden"
      style={{
        width: shouldShow ? `${sidebarWidth}px` : '0px',
        transitionDuration: isResizing ? '0ms' : '300ms',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full" style={{ minWidth: `${sidebarWidth}px` }}>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* File Manager Section */}
          <FileManagerSection projectId={projectId} />

          {/* Editor Pages Section */}
          <PageManagerSection projectId={projectId} />

          {/* Research Tools - Moved to bottom */}
          <div className="pt-6 mt-6 border-t">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Research Tools
            </div>
            {researchTools.map((tool) => {
              const Icon = tool.icon
              const isActive = activeView === tool.id
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

      {/* Resize handle */}
      {shouldShow && (
        <div
          onMouseDown={startResize}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 transition-colors"
          style={{ backgroundColor: isResizing ? '#3b82f6' : 'transparent' }}
        />
      )}
    </div>
  )
}
