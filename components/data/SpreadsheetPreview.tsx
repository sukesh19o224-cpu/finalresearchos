'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Loader2, Download } from 'lucide-react'
import Papa from 'papaparse'

interface Dataset {
  id: string
  name: string
  url: string
  downloadUrl: string
  size: number
  uploadedAt: Date
}

interface SpreadsheetPreviewProps {
  dataset: Dataset
  onClose: () => void
  onColumnSelect?: (columns: number[]) => void
}

export function SpreadsheetPreview({
  dataset,
  onClose,
  onColumnSelect,
}: SpreadsheetPreviewProps) {
  const [data, setData] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadData()
  }, [dataset])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(dataset.downloadUrl)
      if (!response.ok) throw new Error('Failed to fetch data')

      const text = await response.text()

      Papa.parse(text, {
        complete: (result) => {
          if (result.data && result.data.length > 0) {
            const parsedData = result.data as string[][]
            setHeaders(parsedData[0] || [])
            setData(parsedData.slice(1))
          }
          setLoading(false)
        },
        error: (err: Error) => {
          setError(err.message)
          setLoading(false)
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  const handleColumnClick = (index: number) => {
    const newSelected = new Set(selectedColumns)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedColumns(newSelected)
    onColumnSelect?.(Array.from(newSelected))
  }

  const handleDownload = () => {
    window.open(dataset.downloadUrl, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{dataset.name}</h2>
            <p className="text-sm text-gray-600">
              {data.length} rows × {headers.length} columns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-red-600">
                <p className="font-semibold mb-2">Error loading data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
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
                            ? 'bg-blue-100 text-blue-900'
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
                  Showing first 100 rows of {data.length} total rows
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedColumns.size > 0 && (
          <div className="p-4 border-t bg-blue-50">
            <p className="text-sm text-blue-900">
              {selectedColumns.size} column{selectedColumns.size !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
