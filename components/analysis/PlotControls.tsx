'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Download,
  Image,
  FileImage,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'

interface PlotControlsProps {
  plotRef: React.RefObject<HTMLDivElement>
  plotName?: string
  onFullscreenToggle?: (fullscreen: boolean) => void
}

export function PlotControls({
  plotRef,
  plotName = 'plot',
  onFullscreenToggle,
}: PlotControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { toast } = useToast()

  const exportPlot = async (format: 'png' | 'svg' | 'jpeg') => {
    if (!plotRef.current) return

    try {
      const Plotly = await import('plotly.js-dist-min')

      const opts = {
        format,
        width: format === 'svg' ? undefined : 1200,
        height: format === 'svg' ? undefined : 800,
        filename: `${plotName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
      }

      await Plotly.downloadImage(plotRef.current, opts)

      toast({
        variant: 'success',
        title: 'Export successful!',
        description: `Plot exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: 'Could not export the plot',
      })
    }
  }

  const toggleFullscreen = () => {
    const newState = !isFullscreen
    setIsFullscreen(newState)
    if (onFullscreenToggle) {
      onFullscreenToggle(newState)
    }
  }

  return (
    <Card className="border-t-0 rounded-t-none">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hover over plot for interactive controls
          </p>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportPlot('png')}>
                  <Image className="h-4 w-4 mr-2" />
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportPlot('jpeg')}>
                  <FileImage className="h-4 w-4 mr-2" />
                  Export as JPEG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportPlot('svg')}>
                  <FileImage className="h-4 w-4 mr-2" />
                  Export as SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
