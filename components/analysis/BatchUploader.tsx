'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Loader2, CheckCircle2, XCircle, Trash2, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface BatchUploaderProps {
  projectId: string
  onUploadComplete?: () => void
}

interface FileUploadStatus {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

export function BatchUploader({ projectId, onUploadComplete }: BatchUploaderProps) {
  const [files, setFiles] = useState<FileUploadStatus[]>([])
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      const newFiles: FileUploadStatus[] = selectedFiles.map((file) => ({
        file,
        status: 'pending',
        progress: 0,
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFile = async (fileStatus: FileUploadStatus, index: number) => {
    try {
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: 'uploading', progress: 0 } : f))
      )

      const formData = new FormData()
      formData.append('file', fileStatus.file)

      const res = await fetch(`/api/projects/${projectId}/datasets/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'success', progress: 100 } : f
        )
      )
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: 'error', progress: 0, error: err.message }
            : f
        )
      )
    }
  }

  const handleBatchUpload = async () => {
    if (files.length === 0) return

    setUploading(true)

    try {
      // Upload files sequentially to avoid overwhelming the server
      for (let i = 0; i < files.length; i++) {
        if (files[i].status === 'pending') {
          await uploadFile(files[i], i)
        }
      }

      const successCount = files.filter((f) => f.status === 'success').length
      const errorCount = files.filter((f) => f.status === 'error').length

      toast({
        variant: successCount > 0 ? 'success' : 'destructive',
        title: 'Batch upload completed',
        description: `${successCount} file(s) uploaded successfully${
          errorCount > 0 ? `, ${errorCount} failed` : ''
        }`,
      })

      if (onUploadComplete) {
        onUploadComplete()
      }
    } finally {
      setUploading(false)
    }
  }

  const retryFailed = async () => {
    const failedFiles = files
      .map((f, i) => ({ ...f, index: i }))
      .filter((f) => f.status === 'error')

    for (const file of failedFiles) {
      await uploadFile(file, file.index)
    }
  }

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== 'success'))
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const successCount = files.filter((f) => f.status === 'success').length
  const errorCount = files.filter((f) => f.status === 'error').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Batch Upload
          </div>
          {successCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearCompleted}>
              Clear Completed
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Upload multiple electrochemistry data files at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              id="batch-file-upload"
              accept=".mpt,.dta,.csv,.txt"
              onChange={handleFileChange}
              className="hidden"
              multiple
            />
            <label
              htmlFor="batch-file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="font-medium mb-1">Click to select files</p>
              <p className="text-sm text-gray-500">
                Supports .mpt, .dta, .csv files (multiple selection)
              </p>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  Files ({files.length}) - {pendingCount} pending, {successCount} success,{' '}
                  {errorCount} failed
                </span>
                <Button
                  size="sm"
                  onClick={handleBatchUpload}
                  disabled={uploading || pendingCount === 0}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    `Upload ${pendingCount} File${pendingCount !== 1 ? 's' : ''}`
                  )}
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-2">
                {files.map((fileStatus, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded border"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {fileStatus.status === 'pending' && (
                        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                      {fileStatus.status === 'uploading' && (
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
                      )}
                      {fileStatus.status === 'success' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      )}
                      {fileStatus.status === 'error' && (
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fileStatus.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(fileStatus.file.size / 1024).toFixed(2)} KB
                          {fileStatus.error && (
                            <span className="text-red-600 ml-2">{fileStatus.error}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      disabled={fileStatus.status === 'uploading'}
                      className="flex-shrink-0"
                    >
                      {fileStatus.status === 'pending' || fileStatus.status === 'error' ? (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>

              {errorCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryFailed}
                  disabled={uploading}
                  className="w-full"
                >
                  Retry Failed Uploads ({errorCount})
                </Button>
              )}
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium">Tips:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Select multiple files at once using Ctrl/Cmd+Click</li>
              <li>Files are uploaded sequentially to ensure data integrity</li>
              <li>Failed uploads can be retried individually</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
