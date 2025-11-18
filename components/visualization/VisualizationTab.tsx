'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Upload,
  Loader2,
  LineChart,
  ScatterChart,
  BarChart3,
  TrendingUp,
  Box,
} from 'lucide-react'
import { PlotVisualization } from './PlotVisualization'
import Papa from 'papaparse'

type PlotType = 'line' | 'scatter' | 'bar' | 'histogram' | 'box'

export function VisualizationTab() {
  const [data, setData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(new Set())
  const [plotType, setPlotType] = useState<PlotType>('line')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string

      Papa.parse(text, {
        complete: (result) => {
          if (result.data && result.data.length > 0) {
            const parsedData = result.data as string[][]
            setHeaders(parsedData[0] || [])
            setData(parsedData.slice(1))
          }
          setLoading(false)
        },
        error: () => {
          setLoading(false)
          alert('Failed to parse CSV file')
        },
      })
    }

    reader.readAsText(file)
  }

  const handleColumnClick = (index: number) => {
    const newSelected = new Set(selectedColumns)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedColumns(newSelected)
  }

  const plotTypes: { type: PlotType; icon: any; label: string }[] = [
    { type: 'line', icon: LineChart, label: 'Line' },
    { type: 'scatter', icon: ScatterChart, label: 'Scatter' },
    { type: 'bar', icon: BarChart3, label: 'Bar' },
    { type: 'histogram', icon: TrendingUp, label: 'Histogram' },
    { type: 'box', icon: Box, label: 'Box' },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Load Dataset
              </>
            )}
          </Button>

          {data.length > 0 && (
            <span className="text-sm text-gray-600">
              {data.length} rows × {headers.length} columns
            </span>
          )}
        </div>

        {/* Plot Type Selector */}
        {data.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium mr-2">Plot Type:</span>
            {plotTypes.map(({ type, icon: Icon, label }) => (
              <Button
                key={type}
                variant={plotType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlotType(type)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Split View */}
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Upload className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold mb-2">Load a Dataset</h3>
            <p className="text-sm">Upload a CSV file to start visualizing</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Spreadsheet */}
          <div className="w-1/2 border-r overflow-auto p-4">
            <Card className="overflow-hidden">
              <div className="border rounded-lg overflow-auto max-h-[calc(100vh-12rem)]">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="border p-2 text-xs font-semibold text-gray-600 bg-gray-200">
                        #
                      </th>
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          onClick={() => handleColumnClick(index)}
                          className={`border p-2 text-sm font-semibold cursor-pointer transition-colors ${
                            selectedColumns.has(index)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                        >
                          {header || `Column ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 100).map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        <td className="border p-2 text-xs text-gray-500 bg-gray-50 font-mono">
                          {rowIndex + 1}
                        </td>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className={`border p-2 text-sm ${
                              selectedColumns.has(cellIndex)
                                ? 'bg-blue-50'
                                : ''
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.length > 100 && (
                  <div className="p-4 text-center text-sm text-gray-600 bg-gray-50 border-t">
                    Showing first 100 rows of {data.length}
                  </div>
                )}
              </div>

              {selectedColumns.size > 0 && (
                <div className="p-3 bg-blue-50 border-t">
                  <p className="text-sm text-blue-900">
                    {selectedColumns.size} column{selectedColumns.size !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Panel - Plot Visualization */}
          <div className="w-1/2 overflow-auto p-4">
            <PlotVisualization
              data={data}
              headers={headers}
              selectedColumns={Array.from(selectedColumns)}
              plotType={plotType}
            />
          </div>
        </div>
      )}
    </div>
  )
}
