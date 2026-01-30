'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Plus, Trash2 } from 'lucide-react'

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
          data: Array(20).fill(null).map(() => Array(10).fill('')),
          columns: Array(10).fill(null).map((_, i) => ({
            type: 'text',
            title: String.fromCharCode(65 + i), // A, B, C, etc.
            width: 120
          })),
          minDimensions: [10, 20],
          allowInsertRow: true,
          allowInsertColumn: true,
          allowDeleteRow: true,
          allowDeleteColumn: true,
          allowRenameColumn: true,
          contextMenu: true,
          tableOverflow: true,
          tableHeight: '600px',
          tableWidth: '100%',
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

          // First row as headers
          const headers = jsonData[0].map((col: any) => String(col || ''))
          const rows = jsonData.slice(1)

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
                title: header || String.fromCharCode(65 + i),
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
            })
            setJspreadsheet(table)
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
      const selected = jspreadsheet.getSelected()
      if (selected) {
        jspreadsheet.deleteColumn()
      }
    }
  }

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

        <div className="ml-auto text-xs text-gray-500">
          Excel-like Spreadsheet
        </div>
      </div>

      {/* Spreadsheet Container */}
      <div className="flex-1 overflow-auto p-4">
        <div ref={spreadsheetRef} />
      </div>
    </div>
  )
}
