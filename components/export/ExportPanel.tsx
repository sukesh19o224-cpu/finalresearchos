'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Download,
  FileText,
  Image as ImageIcon,
  FileJson,
  FileSpreadsheet,
  BookOpen,
  Presentation,
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ExportPanelProps {
  projectId: string
  projectTitle: string
}

export function ExportPanel({ projectId, projectTitle }: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'svg' | 'csv' | 'json'>('pdf')
  const [includeData, setIncludeData] = useState(true)
  const [includePlots, setIncludePlots] = useState(true)
  const [includeAnalysis, setIncludeAnalysis] = useState(true)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  const exportOptions = [
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Publication-ready PDF with figures and analysis',
      icon: FileText,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'png',
      name: 'High-Res Images',
      description: 'Publication-quality PNG figures (300 DPI)',
      icon: ImageIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'svg',
      name: 'Vector Graphics',
      description: 'Scalable SVG figures for presentations',
      icon: Presentation,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'csv',
      name: 'CSV Data',
      description: 'Processed data in CSV format',
      icon: FileSpreadsheet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'json',
      name: 'JSON Export',
      description: 'Complete project data in JSON',
      icon: FileJson,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const handleExport = async () => {
    setExporting(true)

    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast({
      title: 'Export complete!',
      description: `Your ${exportFormat.toUpperCase()} file has been downloaded.`,
    })

    setExporting(false)
  }

  const quickExports = [
    { name: 'Quick PDF', format: 'pdf', icon: FileText },
    { name: 'All Figures (PNG)', format: 'png', icon: ImageIcon },
    { name: 'Data Package (CSV)', format: 'csv', icon: FileSpreadsheet },
  ]

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Export Options */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Project
          </CardTitle>
          <CardDescription>
            Create publication-ready reports and figures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="standard">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">Standard Export</TabsTrigger>
              <TabsTrigger value="custom">Custom Template</TabsTrigger>
            </TabsList>

            <TabsContent value="standard" className="space-y-6">
              {/* Format Selection */}
              <div className="space-y-3">
                <Label>Export Format</Label>
                <div className="grid gap-3">
                  {exportOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.id}
                        onClick={() => setExportFormat(option.id as any)}
                        className={`flex items-start p-4 border rounded-lg hover:shadow transition-all ${
                          exportFormat === option.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${option.bgColor}`}>
                          <Icon className={`h-5 w-5 ${option.color}`} />
                        </div>
                        <div className="ml-4 flex-1 text-left">
                          <p className="font-medium">{option.name}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        {exportFormat === option.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                <Label>Include in Export</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeData}
                      onChange={(e) => setIncludeData(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <div>
                      <p className="font-medium">Raw Data</p>
                      <p className="text-sm text-gray-600">Include all dataset files</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePlots}
                      onChange={(e) => setIncludePlots(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <div>
                      <p className="font-medium">Visualizations</p>
                      <p className="text-sm text-gray-600">All plots and figures</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAnalysis}
                      onChange={(e) => setIncludeAnalysis(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <div>
                      <p className="font-medium">Analysis Results</p>
                      <p className="text-sm text-gray-600">Calculated parameters and statistics</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Export Settings */}
              {exportFormat === 'pdf' && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <p className="text-sm text-blue-900 font-medium mb-2">PDF Settings</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• High-quality figures (300 DPI)</li>
                    <li>• ACS journal format compatible</li>
                    <li>• Includes table of contents</li>
                    <li>• SI units throughout</li>
                  </ul>
                </div>
              )}

              {exportFormat === 'png' && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <p className="text-sm text-blue-900 font-medium mb-2">Image Settings</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Resolution: 300 DPI (publication quality)</li>
                    <li>• Format: PNG with transparency</li>
                    <li>• Size: 1200 x 800 pixels</li>
                    <li>• Color space: RGB</li>
                  </ul>
                </div>
              )}

              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full"
                size="lg"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {exportFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="text-center py-8">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Custom Templates</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create custom export templates for your institution or journal
                </p>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export</CardTitle>
          <CardDescription>One-click exports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickExports.map((quick) => {
            const Icon = quick.icon
            return (
              <Button
                key={quick.name}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setExportFormat(quick.format as any)
                  handleExport()
                }}
              >
                <Icon className="h-4 w-4 mr-2" />
                {quick.name}
              </Button>
            )
          })}

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Recent Exports</p>
            <div className="space-y-2">
              <div className="text-sm p-2 bg-gray-50 rounded">
                <p className="font-medium">Report_2025.pdf</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
              <div className="text-sm p-2 bg-gray-50 rounded">
                <p className="font-medium">Figures_CV.zip</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
