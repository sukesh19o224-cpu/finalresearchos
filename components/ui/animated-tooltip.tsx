'use client'

import { ReactNode } from 'react'

interface AnimatedTooltipProps {
  content: string | ReactNode
  children: ReactNode
  side?: 'right' | 'left' | 'top' | 'bottom'
  className?: string
}

export function AnimatedTooltip({
  content,
  children,
  side = 'right',
  className = '',
}: AnimatedTooltipProps) {
  const positions = {
    right: 'left-[calc(100%+1.5rem)] top-1/2 -translate-y-1/2 origin-left',
    left: 'right-[calc(100%+1.5rem)] top-1/2 -translate-y-1/2 origin-right',
    top: 'bottom-[calc(100%+1rem)] left-1/2 -translate-x-1/2 origin-bottom',
    bottom: 'top-[calc(100%+1rem)] left-1/2 -translate-x-1/2 origin-top',
  }

  const pointerPositions = {
    right: 'left-[-5px] top-1/2 -translate-y-1/2 rotate-45',
    left: 'right-[-5px] top-1/2 -translate-y-1/2 rotate-45',
    top: 'top-[calc(100%-6px)] left-1/2 -translate-x-1/2 rotate-45',
    bottom: 'bottom-[calc(100%-6px)] left-1/2 -translate-x-1/2 rotate-45',
  }

  return (
    <div className="relative group">
      {children}
      <div
        className={`
          absolute ${positions[side]}
          bg-gray-900 text-white text-sm
          px-3 py-2 rounded-lg
          whitespace-nowrap
          pointer-events-none
          z-50
          scale-0 opacity-0
          group-hover:scale-100 group-hover:opacity-100
          transition-all duration-150 ease-out
          shadow-lg
          ${className}
        `}
      >
        {content}
        <div
          className={`
            absolute w-3 h-3
            bg-gray-900
            ${pointerPositions[side]}
          `}
        />
      </div>
    </div>
  )
}
