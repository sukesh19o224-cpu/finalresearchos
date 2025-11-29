'use client'

import { useEffect, useState } from 'react'

interface BackgroundWatermarkProps {
  text?: string
  opacity?: number
  fontSize?: number
  color?: string
  rotate?: number
}

export function BackgroundWatermark({
  text = 'ResearchOS Research Platform',
  opacity = 0.03,
  fontSize = 48,
  color = '#000000',
  rotate = -45,
}: BackgroundWatermarkProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `rotate(${rotate}deg)`,
          transformOrigin: 'center',
        }}
      >
        <div className="grid grid-cols-3 gap-32">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                opacity,
                fontSize: `${fontSize}px`,
                color,
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Session info watermark - shows session ID and timestamp
 */
export function SessionWatermark() {
  const [sessionInfo, setSessionInfo] = useState({
    id: '',
    startTime: '',
  })

  useEffect(() => {
    // Generate session ID
    const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const startTime = new Date().toISOString()

    setSessionInfo({
      id: sessionId,
      startTime,
    })

    // Store in sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('session_id', sessionId)
      sessionStorage.setItem('session_start', startTime)
    }
  }, [])

  return (
    <div className="fixed bottom-2 right-2 text-[8px] text-gray-300 pointer-events-none select-none font-mono z-0">
      {sessionInfo.id} • {sessionInfo.startTime.split('T')[0]}
    </div>
  )
}

/**
 * Animated background pattern
 */
export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
    </div>
  )
}
