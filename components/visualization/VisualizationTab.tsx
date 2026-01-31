'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Plus, Trash2, BarChart3, TrendingUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

declare global {
  interface Window {
    jspreadsheet: any
    XLSX: any
  }
}

export function VisualizationTab() {
  const spreadsheetRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [jspreadsheet, setJspreadsheet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showHeaderDialog, setShowHeaderDialog] = useState(false)
  const [pendingFileData, setPendingFileData] = useState<{
    headers: any[]
    rows: any[][]
  } | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<number[]>([])
  const [plotData, setPlotData] = useState<any>(null)
  const [plotType, setPlotType] = useState<'scatter' | 'line' | 'bar' | 'scatter+line'>('scatter')
  const [markerSize, setMarkerSize] = useState(8)
  const [markerColor, setMarkerColor] = useState('#3b82f6')
  const [xAxisTitle, setXAxisTitle] = useState('X Axis')
  const [yAxisTitle, setYAxisTitle] = useState('Y Axis')
  const [plotTitle, setPlotTitle] = useState('Data Plot')
  const [showLegend, setShowLegend] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [fontSize, setFontSize] = useState(12)
  const [fontBold, setFontBold] = useState(false)
  const [fontItalic, setFontItalic] = useState(false)
  const [fontUnderline, setFontUnderline] = useState(false)

  useEffect(() => {
    // Load Jspreadsheet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/jspreadsheet-ce@4.13.1/dist/jspreadsheet.min.css'
    document.head.appendChild(link)

    // Load Jsuites CSS (required dependency)
    const jsuitesLink = document.createElement('link')
    jsuitesLink.rel = 'stylesheet'
    jsuitesLink.href = 'https://cdn.jsdelivr.net/npm/jsuites@4.15.0/dist/jsuites.min.css'
    document.head.appendChild(jsuitesLink)

    // Load XLSX library from CDN
    const xlsxScript = document.createElement('script')
    xlsxScript.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
    xlsxScript.async = true

    // Load Jsuites JS
    const jsuitesScript = document.createElement('script')
    jsuitesScript.src = 'https://cdn.jsdelivr.net/npm/jsuites@4.15.0/dist/jsuites.min.js'
    jsuitesScript.async = true

    // Load Jspreadsheet JS after Jsuites
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jspreadsheet-ce@4.13.1/dist/index.min.js'
    script.async = true

    document.head.appendChild(xlsxScript)
    
    xlsxScript.onload = () => {
      document.head.appendChild(jsuitesScript)
    }

    jsuitesScript.onload = () => {
      document.head.appendChild(script)
    }

    script.onload = () => {
      setIsLoading(false)
      if (spreadsheetRef.current && window.jspreadsheet) {
        // Initialize with default empty spreadsheet
        const table = window.jspreadsheet(spreadsheetRef.current, {
          data: Array(20).fill(null).map(() => Array(26).fill('')),
          columns: Array(26).fill(null).map((_, i) => ({
            type: 'text',
            title: String.fromCharCode(65 + i), // A-Z
            width: 120
          })),
          minDimensions: [26, 20],
          allowInsertRow: true,
          allowInsertColumn: true,
          allowDeleteRow: true,
          allowDeleteColumn: true,
          allowRenameColumn: true,
          contextMenu: true,
          tableOverflow: true,
          tableHeight: '600px',
          tableWidth: '100%',
          onselection: (instance: any, x1: number, y1: number, x2: number, y2: number) => {
            updateSelectedColumns(instance, x1, y1, x2, y2)
          },
        })
        setJspreadsheet(table)
      }
    }

    return () => {
      // Cleanup
      if (jspreadsheet) {
        try {
          jspreadsheet.destroy()
        } catch (e) {
          console.error('Cleanup error:', e)
        }
      }
    }
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !window.XLSX) return

    try {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const data = event.target?.result
          const workbook = window.XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = window.XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

          if (jsonData.length === 0) {
            alert('Empty file')
            return
          }

          // Get first row to check if it's all numbers
          const firstRow = jsonData[0]
          const hasNumericHeaders = firstRow.every((col: any) => {
            const val = String(col || '').trim()
            return val !== '' && !isNaN(Number(val))
          })

          // If first row contains all numbers, ask user
          if (hasNumericHeaders && firstRow.length > 0) {
            setPendingFileData({
              headers: firstRow,
              rows: jsonData.slice(1)
            })
            setShowHeaderDialog(true)
          } else {
            // Use first row as headers (they're text)
            const headers = firstRow.map((col: any) => String(col || ''))
            const rows = jsonData.slice(1)
            createSpreadsheetWithData(headers, rows)
          }
        } catch (error) {
          console.error('Parse error:', error)
          alert('Failed to parse file. Please ensure it is a valid CSV or Excel file.')
        }
      }

      reader.onerror = () => {
        alert('Failed to read file')
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const createSpreadsheetWithData = (headers: any[], rows: any[][]) => {
    // Destroy existing spreadsheet
    if (jspreadsheet && spreadsheetRef.current) {
      jspreadsheet.destroy()
    }

    // Create new spreadsheet with uploaded data
    if (spreadsheetRef.current && window.jspreadsheet) {
      const table = window.jspreadsheet(spreadsheetRef.current, {
        data: rows.length > 0 ? rows : Array(20).fill(null).map(() => Array(headers.length).fill('')),
        columns: headers.map((header, i) => ({
          type: 'text',
          title: String(header || ''),
          width: 120
        })),
        minDimensions: [headers.length, Math.max(rows.length, 20)],
        allowInsertRow: true,
        allowInsertColumn: true,
        allowDeleteRow: true,
        allowDeleteColumn: true,
        allowRenameColumn: true,
        contextMenu: true,
        tableOverflow: true,
        tableHeight: '600px',
        tableWidth: '100%',
        onselection: (instance: any, x1: number, y1: number, x2: number, y2: number) => {
          updateSelectedColumns(instance, x1, y1, x2, y2)
        },
      })
      setJspreadsheet(table)
    }
  }

  const handleUseNumericHeaders = () => {
    if (pendingFileData) {
      const headers = pendingFileData.headers.map((col: any) => String(col || ''))
      createSpreadsheetWithData(headers, pendingFileData.rows)
      setShowHeaderDialog(false)
      setPendingFileData(null)
    }
  }

  const handleUseAlphabeticHeaders = () => {
    if (pendingFileData) {
      // Use A, B, C... as headers and include the numeric row as first data row
      const numCols = pendingFileData.headers.length
      const alphabeticHeaders = Array.from({ length: numCols }, (_, i) => 
        String.fromCharCode(65 + i)
      )
      const rows = [pendingFileData.headers, ...pendingFileData.rows]
      createSpreadsheetWithData(alphabeticHeaders, rows)
      setShowHeaderDialog(false)
      setPendingFileData(null)
    }
  }

  const handleAddRow = () => {
    if (jspreadsheet) {
      jspreadsheet.insertRow()
    }
  }

  const handleDeleteRow = () => {
    if (jspreadsheet) {
      const selectedRows = jspreadsheet.getSelectedRows()
      if (selectedRows && selectedRows.length > 0) {
        jspreadsheet.deleteRow(selectedRows.length)
      } else {
        jspreadsheet.deleteRow()
      }
    }
  }

  const handleAddColumn = () => {
    if (jspreadsheet) {
      jspreadsheet.insertColumn()
    }
  }

  const handleDeleteColumn = () => {
    if (jspreadsheet) {
      // Simply call deleteColumn - it deletes the currently selected column
      jspreadsheet.deleteColumn()
    }
  }

  const updateSelectedColumns = (instance: any, x1: number, y1: number, x2: number, y2: number) => {
    const cols = []
    for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++) {
      cols.push(i)
    }
    setSelectedColumns(cols)
  }

  const handlePlot = () => {
    if (!jspreadsheet || selectedColumns.length < 2) {
      alert('Please select at least 2 columns to create a plot')
      return
    }

    const data = jspreadsheet.getData()
    const headers = jspreadsheet.getHeaders().split(',')
    
    // Get column data
    const xCol = selectedColumns[0]
    const yCol = selectedColumns[1]
    
    const xData = data.map((row: any[]) => row[xCol]).filter((val: any) => val !== '')
    const yData = data.map((row: any[]) => row[yCol]).filter((val: any) => val !== '')
    
    const xLabel = headers[xCol] || `Column ${xCol + 1}`
    const yLabel = headers[yCol] || `Column ${yCol + 1}`
    
    setXAxisTitle(xLabel)
    setYAxisTitle(yLabel)
    generatePlot(xData, yData, xLabel, yLabel)
  }

  const generatePlot = (xData: any[], yData: any[], xLabel: string, yLabel: string) => {
    const trace: any = {
      x: xData,
      y: yData,
      name: yLabel,
    }

    if (plotType === 'scatter') {
      trace.type = 'scatter'
      trace.mode = 'markers'
      trace.marker = { size: markerSize, color: markerColor }
    } else if (plotType === 'line') {
      trace.type = 'scatter'
      trace.mode = 'lines'
      trace.line = { color: markerColor, width: 2 }
    } else if (plotType === 'bar') {
      trace.type = 'bar'
      trace.marker = { color: markerColor }
    } else if (plotType === 'scatter+line') {
      trace.type = 'scatter'
      trace.mode = 'lines+markers'
      trace.marker = { size: markerSize, color: markerColor }
      trace.line = { color: markerColor, width: 2 }
    }

    const fontFamily = 'Arial, sans-serif'
    const fontWeight = fontBold ? 'bold' : 'normal'

    setPlotData({
      data: [trace],
      layout: {
        title: {
          text: plotTitle,
          font: {
            size: fontSize + 4,
            family: fontFamily,
            weight: fontWeight,
          },
        },
        plot_bgcolor: 'white',
        paper_bgcolor: 'white',
        xaxis: {
          title: {
            text: xAxisTitle,
            font: { size: fontSize, family: fontFamily, weight: fontWeight },
          },
          showline: true,
          linecolor: '#000000',
          linewidth: 2,
          ticks: 'outside',
          showgrid: showGrid,
          gridcolor: '#e5e5e5',
          mirror: false,
        },
        yaxis: {
          title: {
            text: yAxisTitle,
            font: { size: fontSize, family: fontFamily, weight: fontWeight },
          },
          showline: true,
          linecolor: '#000000',
          linewidth: 2,
          ticks: 'outside',
          showgrid: showGrid,
          gridcolor: '#e5e5e5',
          mirror: false,
        },
        showlegend: showLegend,
        legend: {
          font: { size: fontSize - 2 },
          orientation: 'v',
          x: 1,
          y: 1,
          xanchor: 'right',
          yanchor: 'top',
          bgcolor: 'rgba(255,255,255,0.8)',
          bordercolor: '#cccccc',
          borderwidth: 1,
        },
        autosize: true,
        margin: { l: 60, r: 20, t: 60, b: 60 },
      },
      config: { responsive: true },
    })
  }

  // Update plot when settings change
  useEffect(() => {
    if (plotData && jspreadsheet && selectedColumns.length >= 2) {
      const data = jspreadsheet.getData()
      const headers = jspreadsheet.getHeaders().split(',')
      const xCol = selectedColumns[0]
      const yCol = selectedColumns[1]
      const xData = data.map((row: any[]) => row[xCol]).filter((val: any) => val !== '')
      const yData = data.map((row: any[]) => row[yCol]).filter((val: any) => val !== '')
      const xLabel = headers[xCol] || `Column ${xCol + 1}`
      const yLabel = headers[yCol] || `Column ${yCol + 1}`
      generatePlot(xData, yData, xLabel, yLabel)
    }
  }, [plotType, markerSize, markerColor, xAxisTitle, yAxisTitle, plotTitle, showLegend, showGrid, fontSize, fontBold, fontItalic, fontUnderline])

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading spreadsheet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Dialog */}
      <Dialog open={showHeaderDialog} onOpenChange={setShowHeaderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Column Headers Detected</DialogTitle>
            <DialogDescription>
              The first row of your dataset contains only numbers. Would you like to use them as column headers, or use default alphabetic headers (A, B, C, etc.)?
            </DialogDescription>
          </DialogHeader>
          
          {pendingFileData && (
            <div className="py-4">
              <p className="text-sm text-gray-600 mb-2">First row values:</p>
              <div className="p-3 bg-gray-100 rounded-md font-mono text-sm">
                {pendingFileData.headers.slice(0, 10).join(', ')}
                {pendingFileData.headers.length > 10 && '...'}
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleUseAlphabeticHeaders}
            >
              Use A, B, C... (Keep numeric row as data)
            </Button>
            <Button
              onClick={handleUseNumericHeaders}
            >
              Use Numeric Values as Headers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-3 flex items-center gap-3 flex-shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload File
        </Button>

        <div className="h-6 w-px bg-gray-300" />

        <Button
          onClick={handleAddRow}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>

        <Button
          onClick={handleDeleteRow}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Row
        </Button>

        <Button
          onClick={handleAddColumn}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Column
        </Button>

        <Button
          onClick={handleDeleteColumn}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Column
        </Button>

        <div className="h-6 w-px bg-gray-300" />

        <Button
          onClick={handlePlot}
          disabled={selectedColumns.length < 2}
          size="sm"
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        >
          <TrendingUp className="h-4 w-4" />
          Plot {selectedColumns.length >= 2 ? `(${selectedColumns.length} cols)` : ''}
        </Button>

        <div className="ml-auto text-xs text-gray-500">
          Excel-like Spreadsheet • Click column headers to rename
        </div>
      </div>

      {/* Split Container - Fixed 50/50 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Plot Visualization */}
        <div 
          className="overflow-auto bg-gray-50 flex flex-col border-r"
          style={{ width: '50%' }}
        >
          {/* Plot Area */}
          <div className="flex-1 overflow-auto">
            {plotData ? (
              <div className="h-full p-4">
                <Plot
                  data={plotData.data}
                  layout={plotData.layout}
                  config={plotData.config}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Plots are ready to be created
                  </h3>
                  <p className="text-sm text-gray-500">
                    Select at least 2 columns from the spreadsheet and click Plot
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Plot Settings Panel */}
          {plotData && (
            <div className="border-t bg-white p-4 space-y-4">
              <h3 className="font-semibold text-sm mb-3">Plot Settings</h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Plot Type */}
                <div className="space-y-2">
                  <Label className="text-xs">Plot Type</Label>
                  <Select value={plotType} onValueChange={(v: any) => setPlotType(v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scatter">Scatter Plot</SelectItem>
                      <SelectItem value="line">Line Plot</SelectItem>
                      <SelectItem value="bar">Bar Plot</SelectItem>
                      <SelectItem value="scatter+line">Scatter + Line</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Marker Size */}
                <div className="space-y-2">
                  <Label className="text-xs">Marker Size</Label>
                  <Input
                    type="number"
                    value={markerSize}
                    onChange={(e) => setMarkerSize(Number(e.target.value))}
                    min={1}
                    max={30}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Marker Color */}
                <div className="space-y-2">
                  <Label className="text-xs">Marker Color</Label>
                  <Input
                    type="color"
                    value={markerColor}
                    onChange={(e) => setMarkerColor(e.target.value)}
                    className="h-8"
                  />
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <Label className="text-xs">Font Size</Label>
                  <Input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    min={8}
                    max={24}
                    className="h-8 text-xs"
                  />
                </div>

                {/* X-Axis Title */}
                <div className="space-y-2">
                  <Label className="text-xs">X-Axis Title</Label>
                  <Input
                    value={xAxisTitle}
                    onChange={(e) => setXAxisTitle(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Y-Axis Title */}
                <div className="space-y-2">
                  <Label className="text-xs">Y-Axis Title</Label>
                  <Input
                    value={yAxisTitle}
                    onChange={(e) => setYAxisTitle(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Plot Title */}
                <div className="space-y-2">
                  <Label className="text-xs">Plot Title</Label>
                  <Input
                    value={plotTitle}
                    onChange={(e) => setPlotTitle(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  <Label className="text-xs">Show Legend</Label>
                  <Select value={showLegend ? 'true' : 'false'} onValueChange={(v) => setShowLegend(v === 'true')}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Grid */}
                <div className="space-y-2">
                  <Label className="text-xs">Show Grid</Label>
                  <Select value={showGrid ? 'true' : 'false'} onValueChange={(v) => setShowGrid(v === 'true')}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Font Style Options */}
              <div className="flex gap-2 items-center">
                <Label className="text-xs mr-2">Font Style:</Label>
                <Button
                  variant={fontBold ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontBold(!fontBold)}
                  className="h-7 px-3 text-xs font-bold"
                >
                  B
                </Button>
                <Button
                  variant={fontItalic ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontItalic(!fontItalic)}
                  className="h-7 px-3 text-xs italic"
                >
                  I
                </Button>
                <Button
                  variant={fontUnderline ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFontUnderline(!fontUnderline)}
                  className="h-7 px-3 text-xs underline"
                >
                  U
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Spreadsheet */}
        <div 
          className="overflow-x-auto overflow-y-auto"
          style={{ width: '50%' }}
        >
          <div className="p-4 min-w-max">
            <div ref={spreadsheetRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
