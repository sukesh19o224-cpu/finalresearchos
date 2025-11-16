'use client'

import { useRef, useState } from 'react'
import { PlotlyChart } from './PlotlyChart'
import { PlotControls } from './PlotControls'
import { Card, CardContent } from '@/components/ui/card'

interface EnhancedPlotlyChartProps {
  config: any
  name?: string
  className?: string
}

export function EnhancedPlotlyChart({
  config,
  name = 'plot',
  className = '',
}: EnhancedPlotlyChartProps) {
  const plotRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-8' : ''}`}>
      <Card className={className}>
        <CardContent className="p-6">
          <PlotlyChart config={config} />
          <div ref={plotRef} className="hidden" /> {/* Hidden ref for export */}
        </CardContent>
      </Card>
      <PlotControls
        plotRef={plotRef}
        plotName={name}
        onFullscreenToggle={setIsFullscreen}
      />
    </div>
  )
}
