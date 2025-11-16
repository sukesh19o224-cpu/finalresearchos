'use client'

import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Maximize2, Download, RotateCw, Settings } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface Plot3DProps {
  data: {
    x: number[]
    y: number[]
    z: number[][] | number[]
  }
  title?: string
  xLabel?: string
  yLabel?: string
  zLabel?: string
  colorScale?: string
}

export function Plot3D({
  data,
  title = '3D Visualization',
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  zLabel = 'Z Axis',
  colorScale = 'Viridis',
}: Plot3DProps) {
  const [plotType, setPlotType] = useState<'surface' | 'contour' | 'scatter3d' | 'mesh3d'>('surface')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [showSettings, setShowSettings] = useState(false)
  const [colorscale, setColorscale] = useState(colorScale)
  const containerRef = useRef<HTMLDivElement>(null)

  const colorScales = [
    'Viridis',
    'Plasma',
    'Inferno',
    'Magma',
    'Cividis',
    'Electric',
    'Hot',
    'Jet',
    'Portland',
    'Blackbody',
    'Earth',
    'Picnic',
  ]

  // Create plot data based on type
  const getPlotData = () => {
    switch (plotType) {
      case 'surface':
        return [
          {
            type: 'surface',
            x: data.x,
            y: data.y,
            z: data.z,
            colorscale: colorscale,
            colorbar: {
              title: zLabel,
              titleside: 'right',
            },
          },
        ]

      case 'contour':
        return [
          {
            type: 'contour',
            x: data.x,
            y: data.y,
            z: data.z,
            colorscale: colorscale,
            contours: {
              coloring: 'heatmap',
              showlabels: true,
              labelfont: {
                family: 'Raleway',
                size: 12,
                color: 'white',
              },
            },
            colorbar: {
              title: zLabel,
              titleside: 'right',
            },
          },
        ]

      case 'scatter3d':
        // Flatten z data for scatter plot
        const scatterData: { x: number[]; y: number[]; z: number[] } = {
          x: [],
          y: [],
          z: [],
        }

        if (Array.isArray(data.z[0])) {
          // 2D array
          data.y.forEach((yVal, i) => {
            data.x.forEach((xVal, j) => {
              scatterData.x.push(xVal)
              scatterData.y.push(yVal)
              scatterData.z.push((data.z as number[][])[i][j])
            })
          })
        } else {
          scatterData.x = data.x
          scatterData.y = data.y
          scatterData.z = data.z as number[]
        }

        return [
          {
            type: 'scatter3d',
            mode: 'markers',
            x: scatterData.x,
            y: scatterData.y,
            z: scatterData.z,
            marker: {
              size: 4,
              color: scatterData.z,
              colorscale: colorscale,
              showscale: true,
              colorbar: {
                title: zLabel,
                titleside: 'right',
              },
            },
          },
        ]

      case 'mesh3d':
        return [
          {
            type: 'mesh3d',
            x: data.x,
            y: data.y,
            z: data.z,
            colorscale: colorscale,
            intensity: data.z,
            showscale: true,
            colorbar: {
              title: zLabel,
              titleside: 'right',
            },
          },
        ]

      default:
        return []
    }
  }

  const layout: any = {
    title: title,
    autosize: true,
    scene: {
      xaxis: { title: xLabel },
      yaxis: { title: yLabel },
      zaxis: { title: zLabel },
      camera: {
        eye: {
          x: 1.5 + rotation.x / 100,
          y: 1.5 + rotation.y / 100,
          z: 1.5 + rotation.z / 100,
        },
      },
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { l: 0, r: 0, t: 40, b: 0 },
  }

  // For contour plots, use different layout
  if (plotType === 'contour') {
    delete layout.scene
    layout.xaxis = { title: xLabel }
    layout.yaxis = { title: yLabel }
  }

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: `elctrdc-3d-plot-${Date.now()}`,
      height: 1200,
      width: 1600,
      scale: 2,
    },
  }

  const handleRotationReset = () => {
    setRotation({ x: 0, y: 0, z: 0 })
  }

  const handleExport = (format: 'png' | 'svg' | 'html') => {
    // Implementation would export the plot in the specified format
    console.log(`Exporting as ${format}`)
  }

  return (
    <div
      ref={containerRef}
      className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-8' : ''}`}
    >
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Tabs value={plotType} onValueChange={(v) => setPlotType(v as any)}>
          <TabsList>
            <TabsTrigger value="surface">Surface</TabsTrigger>
            <TabsTrigger value="contour">Contour</TabsTrigger>
            <TabsTrigger value="scatter3d">Scatter 3D</TabsTrigger>
            <TabsTrigger value="mesh3d">Mesh 3D</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4" />
          </Button>
          {plotType !== 'contour' && (
            <Button variant="outline" size="sm" onClick={handleRotationReset}>
              <RotateCw className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Color Scale</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={colorscale}
              onChange={(e) => setColorscale(e.target.value)}
            >
              {colorScales.map((scale) => (
                <option key={scale} value={scale}>
                  {scale}
                </option>
              ))}
            </select>
          </div>

          {plotType !== 'contour' && (
            <>
              <div className="space-y-2">
                <Label>Camera X: {rotation.x}</Label>
                <Slider
                  value={[rotation.x]}
                  onValueChange={([x]) => setRotation({ ...rotation, x })}
                  min={-100}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Camera Y: {rotation.y}</Label>
                <Slider
                  value={[rotation.y]}
                  onValueChange={([y]) => setRotation({ ...rotation, y })}
                  min={-100}
                  max={100}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Camera Z: {rotation.z}</Label>
                <Slider
                  value={[rotation.z]}
                  onValueChange={([z]) => setRotation({ ...rotation, z })}
                  min={-100}
                  max={100}
                  step={1}
                />
              </div>
            </>
          )}
        </Card>
      )}

      {/* Plot */}
      <Card className="p-4">
        <Plot
          data={getPlotData() as any}
          layout={layout}
          config={config}
          style={{ width: '100%', height: isFullscreen ? 'calc(100vh - 200px)' : '600px' }}
          useResizeHandler={true}
        />
      </Card>

      {/* Info */}
      <div className="text-sm text-muted-foreground">
        <p>
          Showing {Array.isArray(data.z) ? (Array.isArray(data.z[0]) ? data.z.length * data.z[0].length : data.z.length) : 0} data points
        </p>
      </div>
    </div>
  )
}

/**
 * Example usage with electrochemistry data
 */
export function Example3DPlot() {
  // Generate example data: cyclic voltammetry surface plot
  const generateCVSurfaceData = () => {
    const potential = Array.from({ length: 50 }, (_, i) => -0.5 + (i * 1.5) / 49) // -0.5V to 1.0V
    const time = Array.from({ length: 30 }, (_, i) => i * 2) // 0 to 58 seconds
    const current = time.map((t) =>
      potential.map((E) => {
        // Simulated CV response with time-dependent degradation
        const E0 = 0.2 // Standard potential
        const n = 1 // Electrons transferred
        const F = 96485 // Faraday constant
        const R = 8.314 // Gas constant
        const T = 298 // Temperature
        const k0 = 0.01 * Math.exp(-t / 100) // Time-dependent rate constant (degradation)

        // Butler-Volmer equation
        const eta = E - E0
        const i0 = 1e-6 * (1 - t / 200) // Exchange current density (degradation)
        const alpha = 0.5

        const current =
          i0 *
          (Math.exp((alpha * n * F * eta) / (R * T)) -
            Math.exp((-(1 - alpha) * n * F * eta) / (R * T)))

        // Add some noise
        return current * 1e6 + Math.random() * 0.1
      })
    )

    return { x: potential, y: time, z: current }
  }

  return (
    <Plot3D
      data={generateCVSurfaceData()}
      title="Cyclic Voltammetry - Time Evolution"
      xLabel="Potential (V vs. Ag/AgCl)"
      yLabel="Time (s)"
      zLabel="Current (µA)"
      colorScale="Viridis"
    />
  )
}
