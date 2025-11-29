'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  FileSpreadsheet,
  Code,
  BarChart3,
  Workflow,
  ExternalLink,
  Download,
  Zap,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Software {
  id: string
  name: string
  description: string
  icon: any
  category: 'analysis' | 'visualization' | 'computation' | 'spreadsheet'
  protocol: string // URL protocol handler
  fileTypes: string[]
  color: string
  status: 'available' | 'install-required'
}

const supportedSoftware: Software[] = [
  {
    id: 'origin',
    name: 'OriginLab',
    description: 'Professional graphing & data analysis',
    icon: BarChart3,
    category: 'visualization',
    protocol: 'origin://',
    fileTypes: ['.opj', '.ogw', '.csv'],
    color: 'bg-blue-500',
    status: 'available',
  },
  {
    id: 'excel',
    name: 'Microsoft Excel',
    description: 'Spreadsheet analysis',
    icon: FileSpreadsheet,
    category: 'spreadsheet',
    protocol: 'ms-excel:ofe|u|',
    fileTypes: ['.xlsx', '.csv'],
    color: 'bg-green-600',
    status: 'available',
  },
  {
    id: 'python',
    name: 'Jupyter Notebook',
    description: 'Interactive Python analysis',
    icon: Code,
    category: 'computation',
    protocol: 'jupyter://',
    fileTypes: ['.ipynb', '.py'],
    color: 'bg-orange-500',
    status: 'available',
  },
  {
    id: 'matlab',
    name: 'MATLAB',
    description: 'Numerical computing environment',
    icon: Workflow,
    category: 'computation',
    protocol: 'matlab://',
    fileTypes: ['.mat', '.m'],
    color: 'bg-red-500',
    status: 'available',
  },
  {
    id: 'igor',
    name: 'Igor Pro',
    description: 'Scientific graphing & analysis',
    icon: BarChart3,
    category: 'visualization',
    protocol: 'igor://',
    fileTypes: ['.pxp', '.itx'],
    color: 'bg-purple-500',
    status: 'available',
  },
  {
    id: 'python-vscode',
    name: 'VS Code (Python)',
    description: 'Code editor with Python support',
    icon: Code,
    category: 'computation',
    protocol: 'vscode://file/',
    fileTypes: ['.py', '.ipynb'],
    color: 'bg-blue-700',
    status: 'available',
  },
]

interface SoftwareHubProps {
  datasetId: string
  fileName: string
  filePath: string
  fileType: string
}

export function SoftwareHub({ datasetId, fileName, filePath, fileType }: SoftwareHubProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const compatibleSoftware = supportedSoftware.filter((software) =>
    software.fileTypes.some((type) => fileName.endsWith(type) || type === '.csv')
  )

  const handleOpenInSoftware = async (software: Software) => {
    try {
      // Download the file first
      const response = await fetch(`/api/datasets/${datasetId}/download`)
      const blob = await response.blob()
      const fileUrl = URL.createObjectURL(blob)

      // Try to open with protocol handler
      const protocolUrl = `${software.protocol}${encodeURIComponent(filePath)}`

      // Attempt to open via protocol
      window.location.href = protocolUrl

      // Show success message
      toast({
        title: `Opening in ${software.name}`,
        description: `If ${software.name} doesn't open automatically, make sure it's installed on your system.`,
      })

      // Fallback: Download the file
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = fileName
        link.click()
        URL.revokeObjectURL(fileUrl)
      }, 1000)

      setIsOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: `Could not open file in ${software.name}. The file will be downloaded instead.`,
        variant: 'destructive',
      })
    }
  }

  const handleDirectDownload = async (format: string) => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}/export?format=${format}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName.replace(/\.[^/.]+$/, `.${format}`)
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Download started',
        description: `Downloading ${fileName} as ${format.toUpperCase()}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          Open With...
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Open in External Software
          </DialogTitle>
          <DialogDescription>
            Choose how you want to analyze <strong>{fileName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Compatible Software */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Compatible Software ({compatibleSoftware.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {compatibleSoftware.map((software) => {
                const Icon = software.icon
                return (
                  <button
                    key={software.id}
                    onClick={() => handleOpenInSoftware(software)}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 ${software.color} rounded-lg flex items-center justify-center text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                          {software.name}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {software.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {software.status === 'available' ? (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Ready
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                              Install Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Export Options */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Quick Export
            </h3>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDirectDownload('csv')}
                className="w-full"
              >
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDirectDownload('json')}
                className="w-full"
              >
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDirectDownload('xlsx')}
                className="w-full"
              >
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDirectDownload('txt')}
                className="w-full"
              >
                TXT
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">How this works</p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• ResearchOS attempts to open the file in your chosen software</li>
                  <li>• The software must be installed on your computer</li>
                  <li>• If the software doesn't open, the file will be downloaded instead</li>
                  <li>• You can also directly export to common formats</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Quick action buttons for common software
 */
export function QuickOpenButtons({ datasetId, fileName, filePath }: Omit<SoftwareHubProps, 'fileType'>) {
  const { toast } = useToast()

  const handleQuickOpen = (software: string) => {
    toast({
      title: `Opening in ${software}`,
      description: 'File will open if software is installed',
    })
    // Handle protocol-based opening
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickOpen('Origin')}
        className="text-xs"
      >
        <BarChart3 className="h-3 w-3 mr-1" />
        Origin
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickOpen('Excel')}
        className="text-xs"
      >
        <FileSpreadsheet className="h-3 w-3 mr-1" />
        Excel
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleQuickOpen('Python')}
        className="text-xs"
      >
        <Code className="h-3 w-3 mr-1" />
        Python
      </Button>
    </div>
  )
}
