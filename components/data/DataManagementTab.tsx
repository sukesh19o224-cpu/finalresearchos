'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  Edit2,
  Loader2,
} from 'lucide-react'
import { SpreadsheetPreview } from './SpreadsheetPreview'

interface Dataset {
  id: string
  name: string
  url: string
  downloadUrl: string
  size: number
  uploadedAt: Date
}

export function DataManagementTab() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const result = await response.json()

      const newDataset: Dataset = {
        id: crypto.randomUUID(),
        name: file.name,
        url: result.url,
        downloadUrl: result.downloadUrl,
        size: file.size,
        uploadedAt: new Date(),
      }

      setDatasets([...datasets, newDataset])
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRename = (id: string, newName: string) => {
    setDatasets(datasets.map(d =>
      d.id === id ? { ...d, name: newName } : d
    ))
    setEditingId(null)
    setEditName('')
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this dataset?')) {
      setDatasets(datasets.filter(d => d.id !== id))
    }
  }

  const handlePreview = (dataset: Dataset) => {
    setSelectedDataset(dataset)
    setShowPreview(true)
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="flex h-full">
      {/* Sidebar - Dataset List */}
      <div className="w-80 border-r bg-gray-50 p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Datasets</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload and manage your research data files
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={handleUpload}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Dataset
              </>
            )}
          </Button>
        </div>

        {/* Dataset List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {datasets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No datasets uploaded yet</p>
            </div>
          ) : (
            datasets.map((dataset) => (
              <Card key={dataset.id} className="p-3 hover:shadow-md transition-shadow">
                {editingId === dataset.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRename(dataset.id, editName)
                        }
                        if (e.key === 'Escape') {
                          setEditingId(null)
                          setEditName('')
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRename(dataset.id, editName)}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {dataset.name}
                        </h3>
                        <Badge variant="outline" className="text-xs mt-1">
                          {formatSize(dataset.size)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(dataset)}
                        title="Preview"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(dataset.id)
                          setEditName(dataset.name)
                        }}
                        title="Rename"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(dataset.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        {datasets.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Upload className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No Data Yet</h3>
              <p className="text-sm">
                Upload your first dataset to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">Select a Dataset</h3>
              <p className="text-sm">
                Click the eye icon to preview any dataset
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Spreadsheet Preview Modal */}
      {showPreview && selectedDataset && (
        <SpreadsheetPreview
          dataset={selectedDataset}
          onClose={() => {
            setShowPreview(false)
            setSelectedDataset(null)
          }}
        />
      )}
    </div>
  )
}
