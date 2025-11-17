'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

// Dynamically import react-plotly.js to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface PlotlyChartProps {
  config: any
  className?: string
}

export function PlotlyChart({ config, className = '' }: PlotlyChartProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className={`w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-gray-500">Loading plot...</div>
      </div>
    )
  }

  const data = config.data || []
  const layout = {
    ...config.layout,
    autosize: true,
    margin: { t: 40, r: 40, b: 60, l: 60 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      family: 'Inter, system-ui, sans-serif',
      size: 12,
      color: '#374151',
    },
  }

  const plotConfig = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png' as const,
      filename: 'plot',
      height: 800,
      width: 1200,
      scale: 2,
    },
  }

  return (
    <div className={`w-full h-full min-h-[400px] ${className}`}>
      <Plot
        data={data}
        layout={layout}
        config={plotConfig}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  )
}
