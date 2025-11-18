'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
})

type PlotType = 'line' | 'scatter' | 'bar' | 'histogram' | 'box'

interface PlotVisualizationProps {
  data: string[][]
  headers: string[]
  selectedColumns: number[]
  plotType: PlotType
}

export function PlotVisualization({
  data,
  headers,
  selectedColumns,
  plotType,
}: PlotVisualizationProps) {
  const plotData = useMemo(() => {
    if (selectedColumns.length === 0) return null

    // For single column - use index as x-axis
    if (selectedColumns.length === 1) {
      const colIndex = selectedColumns[0]
      const yValues = data.map(row => parseFloat(row[colIndex])).filter(v => !isNaN(v))
      const xValues = yValues.map((_, i) => i + 1)

      return {
        data: [
          {
            x: xValues,
            y: yValues,
            type: plotType === 'histogram' ? 'histogram' : plotType,
            mode: plotType === 'scatter' ? 'markers' : plotType === 'line' ? 'lines+markers' : undefined,
            name: headers[colIndex] || `Column ${colIndex + 1}`,
            marker: {
              size: plotType === 'scatter' ? 8 : undefined,
              color: '#3b82f6',
            },
          },
        ],
        layout: {
          title: `${plotType.charAt(0).toUpperCase() + plotType.slice(1)} Plot`,
          xaxis: {
            title: plotType === 'histogram' ? headers[colIndex] : 'Index',
          },
          yaxis: {
            title: plotType === 'histogram' ? 'Frequency' : headers[colIndex] || `Column ${colIndex + 1}`,
          },
          autosize: true,
        },
      }
    }

    // For two columns - x vs y plot
    if (selectedColumns.length === 2) {
      const xIndex = selectedColumns[0]
      const yIndex = selectedColumns[1]

      const xValues = data.map(row => parseFloat(row[xIndex])).filter(v => !isNaN(v))
      const yValues = data.map(row => parseFloat(row[yIndex])).filter(v => !isNaN(v))

      const minLength = Math.min(xValues.length, yValues.length)

      return {
        data: [
          {
            x: xValues.slice(0, minLength),
            y: yValues.slice(0, minLength),
            type: plotType === 'histogram' || plotType === 'box' ? 'scatter' : plotType,
            mode: plotType === 'scatter' ? 'markers' : plotType === 'line' ? 'lines+markers' : undefined,
            name: `${headers[yIndex]} vs ${headers[xIndex]}`,
            marker: {
              size: plotType === 'scatter' ? 8 : undefined,
              color: '#3b82f6',
            },
          },
        ],
        layout: {
          title: `${headers[yIndex]} vs ${headers[xIndex]}`,
          xaxis: {
            title: headers[xIndex] || `Column ${xIndex + 1}`,
          },
          yaxis: {
            title: headers[yIndex] || `Column ${yIndex + 1}`,
          },
          autosize: true,
        },
      }
    }

    // For multiple columns - overlay on same plot
    const traces = selectedColumns.map((colIndex, idx) => {
      const yValues = data.map(row => parseFloat(row[colIndex])).filter(v => !isNaN(v))
      const xValues = yValues.map((_, i) => i + 1)

      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

      return {
        x: xValues,
        y: yValues,
        type: plotType === 'histogram' ? 'histogram' : plotType,
        mode: plotType === 'scatter' ? 'markers' : plotType === 'line' ? 'lines+markers' : undefined,
        name: headers[colIndex] || `Column ${colIndex + 1}`,
        marker: {
          size: plotType === 'scatter' ? 8 : undefined,
          color: colors[idx % colors.length],
        },
      }
    })

    return {
      data: traces,
      layout: {
        title: 'Multi-Column Comparison',
        xaxis: {
          title: 'Index',
        },
        yaxis: {
          title: 'Value',
        },
        autosize: true,
        showlegend: true,
      },
    }
  }, [data, headers, selectedColumns, plotType])

  if (selectedColumns.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold mb-2">No Columns Selected</p>
          <p className="text-sm">Click on column headers in the spreadsheet to select data for plotting</p>
        </div>
      </Card>
    )
  }

  if (!plotData) {
    return (
      <Card className="h-full flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold mb-2">Invalid Data</p>
          <p className="text-sm">Unable to generate plot from selected columns</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full p-4">
      <Plot
        data={plotData.data as any}
        layout={{
          ...plotData.layout,
          height: undefined,
          margin: { l: 50, r: 50, t: 50, b: 50 },
        } as any}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
        } as any}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler
      />
    </Card>
  )
}
