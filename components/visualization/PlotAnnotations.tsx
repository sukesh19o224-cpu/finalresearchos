'use client'

import React, { useState } from 'react'
import { Type, ArrowRight, Circle, Square, Minus, Plus, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface Annotation {
  id: string
  type: 'text' | 'arrow' | 'circle' | 'rectangle' | 'line' | 'hline' | 'vline'
  x: number
  y: number
  x2?: number // For arrows, lines, rectangles
  y2?: number
  text?: string
  color?: string
  fontSize?: number
  opacity?: number
  width?: number // For lines
  radius?: number // For circles
}

interface PlotAnnotationsProps {
  annotations: Annotation[]
  onAdd: (annotation: Annotation) => void
  onUpdate: (id: string, annotation: Partial<Annotation>) => void
  onDelete: (id: string) => void
}

export function PlotAnnotations({ annotations, onAdd, onUpdate, onDelete }: PlotAnnotationsProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Annotation['type']>('text')
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    text: '',
    x: 0,
    y: 0,
    x2: 0,
    y2: 0,
    color: '#3b82f6',
    fontSize: 12,
    opacity: 0.8,
    width: 2,
    radius: 20,
  })

  const handleAdd = () => {
    const newAnnotation: Annotation = {
      id: `annotation-${Date.now()}`,
      type: activeTab,
      x: formData.x,
      y: formData.y,
      color: formData.color,
      opacity: formData.opacity,
    }

    if (activeTab === 'text') {
      newAnnotation.text = formData.text
      newAnnotation.fontSize = formData.fontSize
    } else if (activeTab === 'arrow' || activeTab === 'line' || activeTab === 'rectangle') {
      newAnnotation.x2 = formData.x2
      newAnnotation.y2 = formData.y2
      newAnnotation.width = formData.width
    } else if (activeTab === 'circle') {
      newAnnotation.radius = formData.radius
      newAnnotation.width = formData.width
    } else if (activeTab === 'hline' || activeTab === 'vline') {
      newAnnotation.width = formData.width
    }

    onAdd(newAnnotation)
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      text: '',
      x: 0,
      y: 0,
      x2: 0,
      y2: 0,
      color: '#3b82f6',
      fontSize: 12,
      opacity: 0.8,
      width: 2,
      radius: 20,
    })
    setEditingId(null)
  }

  const annotationTypeIcons = {
    text: Type,
    arrow: ArrowRight,
    circle: Circle,
    rectangle: Square,
    line: Minus,
    hline: Minus,
    vline: Minus,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Annotations</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Annotation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Plot Annotation</DialogTitle>
              <DialogDescription>
                Add text, arrows, shapes to annotate your plots
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid grid-cols-7">
                <TabsTrigger value="text">
                  <Type className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="arrow">
                  <ArrowRight className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="circle">
                  <Circle className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="rectangle">
                  <Square className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="line">
                  <Minus className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="hline">H-Line</TabsTrigger>
                <TabsTrigger value="vline">V-Line</TabsTrigger>
              </TabsList>

              {/* Text Annotation */}
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text">Text</Label>
                  <Input
                    id="text"
                    placeholder="Enter annotation text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-x">X Position</Label>
                    <Input
                      id="text-x"
                      type="number"
                      step="0.01"
                      value={formData.x}
                      onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text-y">Y Position</Label>
                    <Input
                      id="text-y"
                      type="number"
                      step="0.01"
                      value={formData.y}
                      onChange={(e) => setFormData({ ...formData, y: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-color">Color</Label>
                    <Input
                      id="text-color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text-size">Font Size</Label>
                    <Input
                      id="text-size"
                      type="number"
                      min="8"
                      max="48"
                      value={formData.fontSize}
                      onChange={(e) => setFormData({ ...formData, fontSize: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Arrow Annotation */}
              <TabsContent value="arrow" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrow-x1">Start X</Label>
                    <Input
                      id="arrow-x1"
                      type="number"
                      step="0.01"
                      value={formData.x}
                      onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrow-y1">Start Y</Label>
                    <Input
                      id="arrow-y1"
                      type="number"
                      step="0.01"
                      value={formData.y}
                      onChange={(e) => setFormData({ ...formData, y: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrow-x2">End X</Label>
                    <Input
                      id="arrow-x2"
                      type="number"
                      step="0.01"
                      value={formData.x2}
                      onChange={(e) => setFormData({ ...formData, x2: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrow-y2">End Y</Label>
                    <Input
                      id="arrow-y2"
                      type="number"
                      step="0.01"
                      value={formData.y2}
                      onChange={(e) => setFormData({ ...formData, y2: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="arrow-color">Color</Label>
                    <Input
                      id="arrow-color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="arrow-width">Width</Label>
                    <Input
                      id="arrow-width"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Circle Annotation */}
              <TabsContent value="circle" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="circle-x">Center X</Label>
                    <Input
                      id="circle-x"
                      type="number"
                      step="0.01"
                      value={formData.x}
                      onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="circle-y">Center Y</Label>
                    <Input
                      id="circle-y"
                      type="number"
                      step="0.01"
                      value={formData.y}
                      onChange={(e) => setFormData({ ...formData, y: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="circle-radius">Radius</Label>
                    <Input
                      id="circle-radius"
                      type="number"
                      min="1"
                      value={formData.radius}
                      onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="circle-color">Color</Label>
                    <Input
                      id="circle-color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="circle-width">Border Width</Label>
                    <Input
                      id="circle-width"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="circle-opacity">Opacity: {formData.opacity}</Label>
                  <Input
                    id="circle-opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.opacity}
                    onChange={(e) => setFormData({ ...formData, opacity: parseFloat(e.target.value) })}
                  />
                </div>
              </TabsContent>

              {/* Rectangle Annotation */}
              <TabsContent value="rectangle" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rect-x1">X1</Label>
                    <Input
                      id="rect-x1"
                      type="number"
                      step="0.01"
                      value={formData.x}
                      onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rect-y1">Y1</Label>
                    <Input
                      id="rect-y1"
                      type="number"
                      step="0.01"
                      value={formData.y}
                      onChange={(e) => setFormData({ ...formData, y: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rect-x2">X2</Label>
                    <Input
                      id="rect-x2"
                      type="number"
                      step="0.01"
                      value={formData.x2}
                      onChange={(e) => setFormData({ ...formData, x2: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rect-y2">Y2</Label>
                    <Input
                      id="rect-y2"
                      type="number"
                      step="0.01"
                      value={formData.y2}
                      onChange={(e) => setFormData({ ...formData, y2: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rect-color">Color</Label>
                    <Input
                      id="rect-color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rect-opacity">Opacity: {formData.opacity}</Label>
                    <Input
                      id="rect-opacity"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.opacity}
                      onChange={(e) => setFormData({ ...formData, opacity: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Line, H-Line, V-Line similar implementations */}
              <TabsContent value="line" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Draw a line between two points
                </p>
                {/* Similar to arrow but without arrowhead */}
              </TabsContent>

              <TabsContent value="hline" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hline-y">Y Position</Label>
                  <Input
                    id="hline-y"
                    type="number"
                    step="0.01"
                    value={formData.y}
                    onChange={(e) => setFormData({ ...formData, y: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hline-color">Color</Label>
                    <Input
                      id="hline-color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hline-width">Width</Label>
                    <Input
                      id="hline-width"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vline" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vline-x">X Position</Label>
                  <Input
                    id="vline-x"
                    type="number"
                    step="0.01"
                    value={formData.x}
                    onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vline-color">Color</Label>
                    <Input
                      id="vline-color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vline-width">Width</Label>
                    <Input
                      id="vline-width"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.width}
                      onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd}>Add Annotation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Annotations List */}
      {annotations.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No annotations yet. Click "Add Annotation" to get started.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {annotations.map((annotation) => {
            const Icon = annotationTypeIcons[annotation.type]
            return (
              <Card key={annotation.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium capitalize">{annotation.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {annotation.type === 'text' && annotation.text}
                      {annotation.type !== 'text' &&
                        `(${annotation.x.toFixed(2)}, ${annotation.y.toFixed(2)})`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingId(annotation.id)
                      setOpen(true)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(annotation.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Convert annotations to Plotly format
 */
export function convertAnnotationsToPlotly(annotations: Annotation[]) {
  return annotations.map((ann) => {
    const base: any = {
      x: ann.x,
      y: ann.y,
      showarrow: false,
      opacity: ann.opacity || 0.8,
    }

    if (ann.type === 'text') {
      return {
        ...base,
        text: ann.text,
        font: {
          size: ann.fontSize || 12,
          color: ann.color || '#000000',
        },
        showarrow: false,
      }
    } else if (ann.type === 'arrow') {
      return {
        ...base,
        ax: ann.x2,
        ay: ann.y2,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: ann.width || 2,
        arrowcolor: ann.color || '#3b82f6',
      }
    }

    // Other annotation types would be converted to shapes
    return base
  })
}

export function convertAnnotationsToShapes(annotations: Annotation[]) {
  return annotations
    .filter((ann) => ann.type !== 'text' && ann.type !== 'arrow')
    .map((ann) => {
      if (ann.type === 'circle') {
        return {
          type: 'circle',
          xref: 'x',
          yref: 'y',
          x0: ann.x - (ann.radius || 20),
          y0: ann.y - (ann.radius || 20),
          x1: ann.x + (ann.radius || 20),
          y1: ann.y + (ann.radius || 20),
          line: {
            color: ann.color || '#3b82f6',
            width: ann.width || 2,
          },
          fillcolor: 'rgba(59, 130, 246, 0.1)',
          opacity: ann.opacity || 0.8,
        }
      } else if (ann.type === 'rectangle') {
        return {
          type: 'rect',
          xref: 'x',
          yref: 'y',
          x0: ann.x,
          y0: ann.y,
          x1: ann.x2,
          y1: ann.y2,
          line: {
            color: ann.color || '#3b82f6',
            width: ann.width || 2,
          },
          fillcolor: 'rgba(59, 130, 246, 0.1)',
          opacity: ann.opacity || 0.8,
        }
      } else if (ann.type === 'line') {
        return {
          type: 'line',
          xref: 'x',
          yref: 'y',
          x0: ann.x,
          y0: ann.y,
          x1: ann.x2,
          y1: ann.y2,
          line: {
            color: ann.color || '#3b82f6',
            width: ann.width || 2,
          },
        }
      } else if (ann.type === 'hline') {
        return {
          type: 'line',
          xref: 'paper',
          yref: 'y',
          x0: 0,
          x1: 1,
          y0: ann.y,
          y1: ann.y,
          line: {
            color: ann.color || '#3b82f6',
            width: ann.width || 2,
            dash: 'dash',
          },
        }
      } else if (ann.type === 'vline') {
        return {
          type: 'line',
          xref: 'x',
          yref: 'paper',
          x0: ann.x,
          x1: ann.x,
          y0: 0,
          y1: 1,
          line: {
            color: ann.color || '#3b82f6',
            width: ann.width || 2,
            dash: 'dash',
          },
        }
      }

      return null
    })
    .filter(Boolean)
}
