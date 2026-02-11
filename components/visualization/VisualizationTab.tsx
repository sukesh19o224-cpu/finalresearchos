'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, BarChart3 } from 'lucide-react'
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
import { useDatasetStore } from '@/lib/stores/datasetStore'
import { useVisualizationStore } from '@/lib/stores/visualizationStore'
import {
  convertToXSpreadsheetFormat,
  convertFromXSpreadsheetFormat,
} from '@/lib/utils/spreadsheet-converter'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

declare global {
  interface Window {
    XLSX: any
    x_spreadsheet: any
  }
}

export function VisualizationTab() {
  const spreadsheetRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [spreadsheet, setSpreadsheet] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showHeaderDialog, setShowHeaderDialog] = useState(false)
  const [pendingFileData, setPendingFileData] = useState<{
    headers: any[]
    rows: any[][]
  } | null>(null)
  const [currentFilename, setCurrentFilename] = useState('')
  
  const { setDataset } = useDatasetStore()
  const {
    spreadsheetData,
    headers: storedHeaders,
    selectedColumns,
    plotData,
    plotType,
    markerSize,
    markerColor,
    xAxisTitle,
    yAxisTitle,
    plotTitle,
    showLegend,
    showGrid,
    fontSize,
    fontBold,
    fontItalic,
    fontUnderline,
    xTickCount,
    yTickCount,
    setSpreadsheetData,
    setSelectedColumns,
    setPlotData,
    setPlotType,
    setMarkerSize,
    setMarkerColor,
    setXAxisTitle,
    setYAxisTitle,
    setPlotTitle,
    setShowLegend,
    setShowGrid,
    setFontSize,
    setFontBold,
    setFontItalic,
    setFontUnderline,
    setXTickCount,
    setYTickCount,
  } = useVisualizationStore()

  // Load XLSX library from CDN
  useEffect(() => {
    const xlsxScript = document.createElement('script')
    xlsxScript.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
    xlsxScript.async = true

    xlsxScript.onload = () => {
      // Load x-spreadsheet CSS
      const xsCSS = document.createElement('link')
      xsCSS.rel = 'stylesheet'
      xsCSS.href = 'https://unpkg.com/x-data-spreadsheet@1.1.9/dist/xspreadsheet.css'
      document.head.appendChild(xsCSS)

      // Load x-spreadsheet JS
      const xsScript = document.createElement('script')
      xsScript.src = 'https://unpkg.com/x-data-spreadsheet@1.1.9/dist/xspreadsheet.js'
      xsScript.async = true
      
      xsScript.onload = () => {
        setIsLoading(false)
      }
      
      document.head.appendChild(xsScript)
    }

    document.head.appendChild(xlsxScript)

    return () => {
      // Cleanup if needed
    }
  }, [])

  // Initialize x-spreadsheet
  useEffect(() => {
    if (isLoading || !spreadsheetRef.current || spreadsheet || !window.x_spreadsheet) return

    // Initialize x-spreadsheet from CDN
    const initSpreadsheet = () => {
      try {
        // Add custom CSS
        const customCSS = document.createElement('style')
        customCSS.textContent = `
          .x-spreadsheet {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 13px;
          }
          .x-spreadsheet-sheet {
            border: none;
            border-radius: 0;
          }
          .x-spreadsheet-bottombar {
            display: none !important;
          }
          .x-spreadsheet-selector {
            border: 2px solid #3b82f6 !important;
            background-color: rgba(59, 130, 246, 0.1);
          }
          .x-spreadsheet-selector-corner {
            background-color: #3b82f6 !important;
          }
          #xspreadsheet-vis-tab {
            width: 100%;
            height: 100%;
          }
        `
        document.head.appendChild(customCSS)
        
        const Spreadsheet = window.x_spreadsheet
        
        // Set container ID
        const containerId = 'xspreadsheet-vis-tab'
        if (spreadsheetRef.current) {
          spreadsheetRef.current.id = containerId
        }

        // Initialize x-spreadsheet
        const xs = new Spreadsheet(`#${containerId}`, {
          mode: 'edit',
          showToolbar: true,
          showGrid: true,
          showContextmenu: true,
          showBottomBar: false,
          view: {
            height: () => spreadsheetRef.current?.clientHeight || 600,
            width: () => spreadsheetRef.current?.clientWidth || 800,
          },
          row: {
            len: 100,
            height: 25,
          },
          col: {
            len: 26,
            width: 120,
            indexWidth: 60,
            minWidth: 60,
          },
        })

        // Load data if available from store
        if (spreadsheetData && storedHeaders && spreadsheetData.length > 0) {
          const xsData = convertToXSpreadsheetFormat(spreadsheetData, storedHeaders)
          xs.loadData([xsData])
        } else {
          // Initialize with empty data
          const defaultHeaders = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
          const defaultData = Array(20).fill(null).map(() => Array(26).fill(''))
          const xsData = convertToXSpreadsheetFormat(defaultData, defaultHeaders)
          xs.loadData([xsData])
        }

        // Bind cell selection event
        xs.on('cells-selected', (cell: any, range: { sri: number; sci: number; eri: number; eci: number }) => {
          const cols = []
          for (let i = Math.min(range.sci, range.eci); i <= Math.max(range.sci, range.eci); i++) {
            cols.push(i)
          }
          setSelectedColumns(cols)
        })

        // Bind cell edited event (optional - for future use)
        xs.on('cell-edited', (text: string, ri: number, ci: number) => {
          console.log('Cell edited:', { text, ri, ci })
        })

        setSpreadsheet(xs)
      } catch (error) {
        console.error('Failed to load x-data-spreadsheet:', error)
      }
    }

    initSpreadsheet()
  }, [isLoading, spreadsheetData, storedHeaders, spreadsheet])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !window.XLSX) return

    setCurrentFilename(file.name)

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
    if (!spreadsheet) return

    // Convert and load data into x-spreadsheet
    const xsData = convertToXSpreadsheetFormat(
      rows.length > 0 ? rows : Array(20).fill(null).map(() => Array(headers.length).fill('')),
      headers
    )
    
    spreadsheet.loadData([xsData])
    
    // Save to visualization store
    setSpreadsheetData(rows, headers, currentFilename)
    
    // Save dataset to store for Analysis page
    saveDatasetToStore(headers, rows)
  }

  const saveDatasetToStore = (headers: any[], rows: any[][]) => {
    // Convert spreadsheet data to dataset format
    const data: Record<string, number[]> = {}
    
    headers.forEach((header, colIndex) => {
      data[String(header)] = rows.map(row => {
        const val = row[colIndex]
        return val !== null && val !== undefined && val !== '' 
          ? parseFloat(String(val)) 
          : 0
      }).filter(v => !isNaN(v))
    })
    
    const indexArray = Array.from({ length: rows.length }, (_, i) => i)
    
    setDataset({
      filename: currentFilename,
      headers: headers.map(h => String(h)),
      data,
      indexArray,
      uploadedAt: Date.now()
    })
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

  const handlePlot = () => {
    if (!spreadsheet || selectedColumns.length < 2) {
      alert('Please select at least 2 columns to create a plot')
      return
    }

    // Get data from x-spreadsheet
    const xsData = spreadsheet.getData()
    const { data, headers } = convertFromXSpreadsheetFormat(xsData)
    
    const xCol = selectedColumns[0]
    const yCol = selectedColumns[1]
    
    const xData = data.map((row: any[]) => row[xCol]).filter((val: any) => val !== null && val !== undefined && val !== '')
    const yData = data.map((row: any[]) => row[yCol]).filter((val: any) => val !== null && val !== undefined && val !== '')
    
    const xLabel = headers[xCol] || `Column ${xCol + 1}`
    const yLabel = headers[yCol] || `Column ${yCol + 1}`
    
    setXAxisTitle(xLabel)
    setYAxisTitle(yLabel)
    generatePlot(xData, yData, xLabel, yLabel)
  }

  const generatePlot = (xData: any[], yData: any[], xLabel: string, yLabel: string) => {
    // Use the user's chosen color
    const traceColor = markerColor

    const trace: any = {
      x: xData,
      y: yData,
      name: yLabel,
    }

    if (plotType === 'scatter') {
      trace.type = 'scatter'
      trace.mode = 'markers'
      trace.marker = {
        size: markerSize,
        color: traceColor,
        opacity: 0.7,
        symbol: 'circle',
        line: { width: 0.5, color: '#000' },
      }
    } else if (plotType === 'line') {
      trace.type = 'scatter'
      trace.mode = 'lines'
      trace.line = { color: traceColor, width: 2, shape: 'linear' }
    } else if (plotType === 'bar') {
      trace.type = 'bar'
      trace.marker = { color: traceColor, line: { width: 0.5, color: '#000' } }
    } else if (plotType === 'scatter+line') {
      trace.type = 'scatter'
      trace.mode = 'lines+markers'
      trace.marker = {
        size: markerSize,
        color: traceColor,
        opacity: 0.7,
        symbol: 'circle',
        line: { width: 0.5, color: '#000' },
      }
      trace.line = { color: traceColor, width: 2, shape: 'linear' }
    }

    // Academic / publication font stack
    const fontFamily = 'Inter, IBM Plex Sans, Helvetica Neue, Arial, sans-serif'

    setPlotData({
      data: [trace],
      layout: {
        template: 'none',
        title: plotTitle ? {
          text: plotTitle,
          font: { size: fontSize + 2, family: fontFamily, color: '#111' },
          x: 0.5,
          xanchor: 'center',
        } : undefined,
        plot_bgcolor: 'white',
        paper_bgcolor: 'white',
        font: {
          family: fontFamily,
          size: fontSize,
          color: '#111',
        },
        xaxis: {
          title: {
            text: xAxisTitle,
            font: { size: fontSize + 1, family: fontFamily, color: '#111' },
            standoff: 12,
          },
          showline: true,
          linecolor: '#000',
          linewidth: 1,
          ticks: 'outside',
          ticklen: 5,
          tickwidth: 1,
          tickcolor: '#000',
          tickfont: { size: 11, family: fontFamily, color: '#333' },
          showgrid: showGrid,
          gridcolor: showGrid ? 'rgba(0,0,0,0.05)' : undefined,
          gridwidth: showGrid ? 1 : undefined,
          mirror: false,
          zeroline: false,
          nticks: xTickCount,
        },
        yaxis: {
          title: {
            text: yAxisTitle,
            font: { size: fontSize + 1, family: fontFamily, color: '#111' },
            standoff: 8,
          },
          showline: true,
          linecolor: '#000',
          linewidth: 1,
          ticks: 'outside',
          ticklen: 5,
          tickwidth: 1,
          tickcolor: '#000',
          tickfont: { size: 11, family: fontFamily, color: '#333' },
          showgrid: showGrid,
          gridcolor: showGrid ? 'rgba(0,0,0,0.05)' : undefined,
          gridwidth: showGrid ? 1 : undefined,
          mirror: false,
          zeroline: false,
          nticks: yTickCount,
        },
        showlegend: showLegend,
        legend: {
          font: { size: 11, family: fontFamily, color: '#333' },
          bgcolor: 'rgba(0,0,0,0)',
          borderwidth: 0,
          orientation: 'v',
          x: 1,
          y: 1,
          xanchor: 'right',
          yanchor: 'top',
        },
        hovermode: 'closest',
        autosize: true,
        margin: { l: 60, r: 20, t: plotTitle ? 40 : 20, b: 50 },
      },
      config: {
        displayModeBar: false,
        responsive: true,
        scrollZoom: false,
      },
    })
  }

  // Update plot when settings change
  useEffect(() => {
    if (plotData && spreadsheet && selectedColumns.length >= 2) {
      // Extract data from x-spreadsheet
      const sheetData = spreadsheet.getData()
      const { data, headers } = convertFromXSpreadsheetFormat(sheetData[0])
      
      const xCol = selectedColumns[0]
      const yCol = selectedColumns[1]
      const xData = data.map((row: any[]) => row[xCol]).filter((val: any) => val !== '')
      const yData = data.map((row: any[]) => row[yCol]).filter((val: any) => val !== '')
      const xLabel = headers[xCol] || `Column ${xCol + 1}`
      const yLabel = headers[yCol] || `Column ${yCol + 1}`
      generatePlot(xData, yData, xLabel, yLabel)
    }
  }, [plotType, markerSize, markerColor, xAxisTitle, yAxisTitle, plotTitle, showLegend, showGrid, fontSize, fontBold, fontItalic, fontUnderline, xTickCount, yTickCount])

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
    <div className="flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 180px)', minHeight: '600px' }}>
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
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleUseAlphabeticHeaders}
              className="w-full whitespace-normal h-auto py-3"
            >
              Use A, B, C... (Keep numeric row as data)
            </Button>
            <Button
              onClick={handleUseNumericHeaders}
              className="w-full whitespace-normal h-auto py-3"
            >
              Use Numeric Values as Headers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Minimal Toolbar */}
      <div className="border-b bg-white px-3 py-2 flex items-center justify-between flex-shrink-0">
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

        <Button
          onClick={handlePlot}
          disabled={selectedColumns.length < 2}
          size="sm"
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <BarChart3 className="h-4 w-4" />
          {selectedColumns.length === 0 
            ? 'Select Columns to Plot' 
            : selectedColumns.length === 1
            ? 'Select 1 More Column'
            : `Plot ${selectedColumns.length} Columns`}
        </Button>
      </div>

      {/* Split Container - Fixed 50/50 */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Spreadsheet */}
        <div 
          className="overflow-hidden border-r"
          style={{ width: '50%' }}
        >
          <div className="h-full w-full">
            <div ref={spreadsheetRef} className="h-full w-full" />
          </div>
        </div>

        {/* Right Panel - Plot Visualization */}
        <div 
          className="overflow-auto bg-gray-50 flex flex-col"
          style={{ width: '50%' }}
        >
          {/* Plot Area */}
          <div className="flex-1 overflow-auto" style={{ minHeight: '400px' }}>
            {plotData ? (
              <div className="h-full p-4" style={{ minHeight: '400px' }}>
                <Plot
                  data={plotData.data}
                  layout={plotData.layout}
                  config={plotData.config}
                  style={{ width: '100%', height: '100%' }}
                  useResizeHandler={true}
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

                {/* Trace Color */}
                <div className="space-y-2">
                  <Label className="text-xs">Color</Label>
                  <div className="flex items-center gap-1 flex-wrap">
                    {['#2E3440','#5E81AC','#A3BE8C','#BF616A','#D08770','#B48EAD','#4C566A','#88C0D0'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setMarkerColor(c)}
                        className={`w-6 h-6 rounded-sm border ${markerColor === c ? 'border-black ring-1 ring-black' : 'border-gray-300'}`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
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

                {/* X-Tick Count */}
                <div className="space-y-2">
                  <Label className="text-xs">X-Tick Count</Label>
                  <Input
                    type="number"
                    value={xTickCount}
                    onChange={(e) => setXTickCount(Number(e.target.value))}
                    min={2}
                    max={20}
                    className="h-8 text-xs"
                  />
                </div>

                {/* Y-Tick Count */}
                <div className="space-y-2">
                  <Label className="text-xs">Y-Tick Count</Label>
                  <Input
                    type="number"
                    value={yTickCount}
                    onChange={(e) => setYTickCount(Number(e.target.value))}
                    min={2}
                    max={20}
                    className="h-8 text-xs"
                  />
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
      </div>
    </div>
  )
}
