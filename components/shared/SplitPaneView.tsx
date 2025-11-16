'use client'

import React, { useState } from 'react'
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SplitPaneViewProps {
  left: React.ReactNode
  right: React.ReactNode
  defaultSize?: number // 0-100
  minSize?: number
  maxSize?: number
  orientation?: 'horizontal' | 'vertical'
}

export function SplitPaneView({
  left,
  right,
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  orientation = 'horizontal',
}: SplitPaneViewProps) {
  const [size, setSize] = useState(defaultSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isLeftMaximized, setIsLeftMaximized] = useState(false)
  const [isRightMaximized, setIsRightMaximized] = useState(false)

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const container = e.currentTarget
    const rect = container.getBoundingClientRect()

    let newSize
    if (orientation === 'horizontal') {
      const x = e.clientX - rect.left
      newSize = (x / rect.width) * 100
    } else {
      const y = e.clientY - rect.top
      newSize = (y / rect.height) * 100
    }

    // Clamp to min/max
    newSize = Math.max(minSize, Math.min(maxSize, newSize))
    setSize(newSize)
  }

  const handleLeftMaximize = () => {
    setIsLeftMaximized(!isLeftMaximized)
    setIsRightMaximized(false)
  }

  const handleRightMaximize = () => {
    setIsRightMaximized(!isRightMaximized)
    setIsLeftMaximized(false)
  }

  const effectiveSize = isLeftMaximized ? 100 : isRightMaximized ? 0 : size

  return (
    <div
      className={cn(
        'flex h-full',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        isDragging && 'select-none'
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Left/Top Pane */}
      <div
        style={{
          [orientation === 'horizontal' ? 'width' : 'height']: `${effectiveSize}%`,
        }}
        className="relative overflow-hidden"
      >
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-background/50 backdrop-blur"
            onClick={handleLeftMaximize}
          >
            {isLeftMaximized ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="h-full w-full overflow-auto">{left}</div>
      </div>

      {/* Divider */}
      {!isLeftMaximized && !isRightMaximized && (
        <div
          className={cn(
            'group flex items-center justify-center bg-border hover:bg-primary/20 cursor-col-resize transition-colors',
            orientation === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
          )}
          onMouseDown={handleMouseDown}
        >
          <div
            className={cn(
              'bg-muted-foreground/30 group-hover:bg-primary rounded-full',
              orientation === 'horizontal' ? 'w-1 h-12' : 'h-1 w-12'
            )}
          >
            <GripVertical
              className={cn(
                'text-muted-foreground group-hover:text-primary',
                orientation === 'vertical' && 'rotate-90'
              )}
            />
          </div>
        </div>
      )}

      {/* Right/Bottom Pane */}
      <div
        style={{
          [orientation === 'horizontal' ? 'width' : 'height']: `${100 - effectiveSize}%`,
        }}
        className="relative overflow-hidden"
      >
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-background/50 backdrop-blur"
            onClick={handleRightMaximize}
          >
            {isRightMaximized ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
        <div className="h-full w-full overflow-auto">{right}</div>
      </div>
    </div>
  )
}
