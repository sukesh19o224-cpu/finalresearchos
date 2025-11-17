'use client'

import { useEffect, useRef } from 'react'

interface PlotlyChartProps {
  config: any
  className?: string
}

export function PlotlyChart({ config, className = '' }: PlotlyChartProps) {
  const plotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!plotRef.current) return

    // Dynamically import Plotly to avoid SSR issues
    import('plotly.js').then((Plotly) => {
      if (!plotRef.current) return

      const data = config.data
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
          format: 'png',
          filename: 'plot',
          height: 800,
          width: 1200,
          scale: 2,
        },
      }

      Plotly.newPlot(plotRef.current, data, layout, plotConfig)
    })

    return () => {
      if (plotRef.current) {
        import('plotly.js').then((Plotly) => {
          if (plotRef.current) {
            Plotly.purge(plotRef.current)
          }
        })
      }
    }
  }, [config])

  return (
    <div
      ref={plotRef}
      className={`w-full h-full min-h-[400px] ${className}`}
    />
  )
}
