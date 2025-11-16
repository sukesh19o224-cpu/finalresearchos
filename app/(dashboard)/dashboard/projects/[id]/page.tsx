'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { DatasetUploader } from '@/components/analysis/DatasetUploader'
import { BatchUploader } from '@/components/analysis/BatchUploader'
import { PlotlyChart } from '@/components/analysis/PlotlyChart'
import { DataTable } from '@/components/analysis/DataTable'
import { DatasetStats } from '@/components/analysis/DatasetStats'
import { AIChat } from '@/components/ai/AIChat'
import { Database, FileText, BarChart3, Upload, Trash2 } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDataset, setSelectedDataset] = useState<any>(null)
  const [selectedVisualization, setSelectedVisualization] = useState<any>(null)
  const [creatingViz, setCreatingViz] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      const data = await res.json()
      setProject(data.project)
    } catch (error) {
      console.error('Failed to fetch project:', error)
    } finally {
      setLoading(false)
    }
  }

  const createVisualization = async (datasetId: string, plotType: string) => {
    setCreatingViz(true)
    try {
      const dataset = project.datasets.find((d: any) => d.id === datasetId)
      const res = await fetch('/api/visualizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          datasetId,
          name: `${dataset?.name} - ${plotType}`,
          plotType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create visualization')
      }

      await fetchProject()
      setSelectedVisualization(data.visualization)

      toast({
        variant: 'success',
        title: 'Visualization created!',
        description: `${plotType} plot has been generated successfully.`,
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to create visualization',
        description: error.message,
      })
    } finally {
      setCreatingViz(false)
    }
  }

  const deleteDataset = async (datasetId: string) => {
    if (!confirm('Delete this dataset?')) return

    try {
      await fetch(`/api/datasets/${datasetId}`, { method: 'DELETE' })
      await fetchProject()
      toast({
        title: 'Dataset deleted',
        description: 'The dataset has been removed from your project.',
      })
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete dataset',
        description: error.message,
      })
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Project not found</h3>
            <p className="text-gray-600">
              This project may have been deleted or you don't have access to it.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        {project.description && (
          <p className="text-gray-600">{project.description}</p>
        )}
        {project.researchType && (
          <div className="mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded">
              {project.researchType}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data">
            Data ({project.datasets?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="visualizations">
            Visualizations ({project.visualizations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Datasets Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Datasets ({project.datasets?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.datasets && project.datasets.length > 0 ? (
                  <div className="space-y-2">
                    {project.datasets.slice(0, 5).map((dataset: any) => (
                      <div
                        key={dataset.id}
                        className="p-3 border rounded hover:bg-gray-50"
                      >
                        <p className="font-medium">{dataset.name}</p>
                        <p className="text-sm text-gray-600">
                          {dataset.technique} • {dataset.instrument}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {dataset.rowCount} rows • {formatDate(dataset.uploadedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No datasets yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Visualizations Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Recent Visualizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.visualizations && project.visualizations.length > 0 ? (
                  <div className="space-y-2">
                    {project.visualizations.slice(0, 5).map((viz: any) => (
                      <div
                        key={viz.id}
                        className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedVisualization(viz)}
                      >
                        <p className="font-medium">{viz.name}</p>
                        <p className="text-sm text-gray-600">{viz.plotType}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(viz.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No visualizations yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Datasets List */}
            <Card>
              <CardHeader>
                <CardTitle>All Datasets</CardTitle>
                <CardDescription>
                  Click a dataset to view details and create visualizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.datasets && project.datasets.length > 0 ? (
                  <div className="space-y-2">
                    {project.datasets.map((dataset: any) => (
                      <div
                        key={dataset.id}
                        className={`p-3 border rounded cursor-pointer transition-colors relative group ${
                          selectedDataset?.id === dataset.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedDataset(dataset)}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteDataset(dataset.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <p className="font-medium">{dataset.name}</p>
                        <p className="text-sm text-gray-600">
                          {dataset.technique} • {dataset.instrument}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {dataset.rowCount} rows × {dataset.columnCount} columns
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No datasets yet</p>
                    <p className="text-sm mt-2">Upload data to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dataset Details */}
            {selectedDataset && (
              <div className="space-y-4">
                {/* Quick Stats */}
                <DatasetStats dataset={selectedDataset} />

                <Card>
                  <CardHeader>
                    <CardTitle>Dataset Details</CardTitle>
                    <CardDescription>{selectedDataset.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Information</h4>
                    <dl className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Technique:</dt>
                        <dd className="font-medium">{selectedDataset.technique}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Instrument:</dt>
                        <dd className="font-medium">{selectedDataset.instrument}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Rows:</dt>
                        <dd className="font-medium">{selectedDataset.rowCount}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Columns:</dt>
                        <dd className="font-medium">{selectedDataset.columnCount}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Uploaded:</dt>
                        <dd className="font-medium">
                          {formatDate(selectedDataset.uploadedAt)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Create Visualization</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDataset.technique === 'CV' && (
                        <Button
                          size="sm"
                          onClick={() => createVisualization(selectedDataset.id, 'cv_plot')}
                          disabled={creatingViz}
                        >
                          CV Plot
                        </Button>
                      )}
                      {selectedDataset.technique === 'EIS' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              createVisualization(selectedDataset.id, 'nyquist')
                            }
                            disabled={creatingViz}
                          >
                            Nyquist
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              createVisualization(selectedDataset.id, 'bode')
                            }
                            disabled={creatingViz}
                          >
                            Bode
                          </Button>
                        </>
                      )}
                      {selectedDataset.technique === 'BatteryCycling' && (
                        <Button
                          size="sm"
                          onClick={() =>
                            createVisualization(selectedDataset.id, 'battery_cycling')
                          }
                          disabled={creatingViz}
                        >
                          Cycling Plot
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedDataset.parsedData?.data?.columns && (
                    <div>
                      <h4 className="font-medium mb-2">Columns</h4>
                      <div className="max-h-40 overflow-y-auto">
                        <ul className="text-sm space-y-1">
                          {selectedDataset.parsedData.data.columns.map(
                            (col: string, i: number) => (
                              <li key={i} className="text-gray-700">
                                {col}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Data Preview Table */}
              {selectedDataset.parsedData?.data && (
                <DataTable
                  data={selectedDataset.parsedData.data}
                  title={`Data Preview: ${selectedDataset.name}`}
                  description={`${selectedDataset.technique} • ${selectedDataset.rowCount} rows × ${selectedDataset.columnCount} columns`}
                />
              )}
            </div>
            )}
          </div>
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="visualizations">
          {selectedVisualization ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedVisualization.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedVisualization.plotType}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedVisualization(null)}
                >
                  Back to Gallery
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <PlotlyChart config={selectedVisualization.config} />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.visualizations && project.visualizations.length > 0 ? (
                project.visualizations.map((viz: any) => (
                  <Card
                    key={viz.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedVisualization(viz)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base line-clamp-1">
                        {viz.name}
                      </CardTitle>
                      <CardDescription>{viz.plotType}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(viz.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">
                      No visualizations yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upload data and create your first plot
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload">
          <div className="max-w-4xl mx-auto space-y-6">
            <Tabs defaultValue="single">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="single">Single Upload</TabsTrigger>
                <TabsTrigger value="batch">Batch Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="mt-6">
                <DatasetUploader projectId={projectId} onUploadComplete={fetchProject} />
              </TabsContent>

              <TabsContent value="batch" className="mt-6">
                <BatchUploader projectId={projectId} onUploadComplete={fetchProject} />
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Chat */}
      <AIChat projectId={projectId} />
    </div>
  )
}
