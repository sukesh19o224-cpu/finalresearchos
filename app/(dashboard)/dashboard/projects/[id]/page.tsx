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
import { FileManager } from '@/components/files/FileManager'
import { CollaborationPanel } from '@/components/collaboration/CollaborationPanel'
import { LabNotebook } from '@/components/notebook/LabNotebook'
import { ProjectTimeline } from '@/components/timeline/ProjectTimeline'
import { ExportPanel } from '@/components/export/ExportPanel'
import { LiteratureManager } from '@/components/literature/LiteratureManager'
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics'
import { MLPredictions } from '@/components/ml/MLPredictions'
import { DataVersionControl } from '@/components/versioning/DataVersionControl'
import { Database, FileText, BarChart3, Upload, Trash2, FolderOpen, Users, BookOpen, Target, Download, Brain, TrendingUp, GitBranch, ArrowRight, Sparkles } from 'lucide-react'
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
  const [activeView, setActiveView] = useState('overview')
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

  // Feature cards for modern navigation
  const featureCards = [
    {
      id: 'timeline',
      title: 'Project Timeline',
      description: 'Track milestones and progress',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'notebook',
      title: 'Lab Notebook',
      description: 'Document experiments with timestamps',
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      id: 'literature',
      title: 'Literature',
      description: 'Manage papers and citations',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Data quality and trend analysis',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      id: 'ml',
      title: 'ML Predictions',
      description: 'AI-powered insights and optimization',
      icon: Brain,
      color: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
    {
      id: 'versions',
      title: 'Version Control',
      description: 'Track dataset changes over time',
      icon: GitBranch,
      color: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Work together with your team',
      icon: Users,
      color: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
    {
      id: 'export',
      title: 'Export & Publish',
      description: 'Publication-ready exports',
      icon: Download,
      color: 'from-teal-500 to-teal-600',
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
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
          {activeView === 'overview' && (
            <Button onClick={() => setActiveView('upload')} className="bg-gradient-to-r from-blue-600 to-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Data
            </Button>
          )}
        </div>
      </div>

      {/* Modern Navigation */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="inline-flex h-auto p-1 bg-gray-100 rounded-lg">
          <TabsTrigger value="overview" className="rounded-md px-4 py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="data" className="rounded-md px-4 py-2">
            Data & Analysis
          </TabsTrigger>
          <TabsTrigger value="files" className="rounded-md px-4 py-2">
            Files
          </TabsTrigger>
          <TabsTrigger value="upload" className="rounded-md px-4 py-2">
            Upload
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Modern Feature Cards */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Datasets</p>
                    <p className="text-3xl font-bold mt-1">{project.datasets?.length || 0}</p>
                  </div>
                  <Database className="h-10 w-10 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Visualizations</p>
                    <p className="text-3xl font-bold mt-1">{project.visualizations?.length || 0}</p>
                  </div>
                  <BarChart3 className="h-10 w-10 text-green-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Papers</p>
                    <p className="text-3xl font-bold mt-1">{project.papers?.length || 0}</p>
                  </div>
                  <FileText className="h-10 w-10 text-purple-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium mt-1">{formatDate(project.updatedAt)}</p>
                  </div>
                  <Target className="h-10 w-10 text-orange-600 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Research Tools Section */}
          <div>
            <div className="flex items-center mb-4">
              <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-bold">Research Tools</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featureCards.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={feature.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-500 group"
                    onClick={() => setActiveView(feature.id)}
                  >
                    <CardContent className="p-6">
                      <div className={`h-12 w-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                      </div>
                      <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                      <div className="flex items-center text-sm text-blue-600 font-medium">
                        Open
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Datasets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Recent Datasets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {project.datasets && project.datasets.length > 0 ? (
                  <div className="space-y-2">
                    {project.datasets.slice(0, 3).map((dataset: any) => (
                      <div
                        key={dataset.id}
                        className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedDataset(dataset)
                          setActiveView('data')
                        }}
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => setActiveView('upload')}
                    >
                      Upload Your First Dataset
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Visualizations */}
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
                    {project.visualizations.slice(0, 3).map((viz: any) => (
                      <div
                        key={viz.id}
                        className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedVisualization(viz)
                          setActiveView('data')
                        }}
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

        {/* Data & Analysis Tab */}
        <TabsContent value="data">
          <Tabs defaultValue="datasets" className="space-y-6">
            <TabsList className="inline-flex h-auto p-1 bg-gray-100 rounded-lg">
              <TabsTrigger value="datasets" className="rounded-md px-4 py-2">
                Datasets
              </TabsTrigger>
              <TabsTrigger value="visualizations" className="rounded-md px-4 py-2">
                Visualizations
              </TabsTrigger>
            </TabsList>

            {/* Datasets */}
            <TabsContent value="datasets">
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

            {/* Visualizations */}
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
          </Tabs>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2" />
                Project Files
              </CardTitle>
              <CardDescription>
                Organize your research files and documents in an Ubuntu-style file manager
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileManager projectId={projectId} />
            </CardContent>
          </Card>
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

        {/* Individual Feature Views */}
        <TabsContent value="timeline">
          <ProjectTimeline projectId={projectId} />
        </TabsContent>

        <TabsContent value="notebook">
          <LabNotebook projectId={projectId} />
        </TabsContent>

        <TabsContent value="collaboration">
          <CollaborationPanel projectId={projectId} />
        </TabsContent>

        <TabsContent value="literature">
          <LiteratureManager projectId={projectId} />
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedAnalytics projectId={projectId} datasets={project.datasets} />
        </TabsContent>

        <TabsContent value="ml">
          <MLPredictions projectId={projectId} />
        </TabsContent>

        <TabsContent value="versions">
          <DataVersionControl projectId={projectId} />
        </TabsContent>

        <TabsContent value="export">
          <ExportPanel projectId={projectId} projectTitle={project.title} />
        </TabsContent>
      </Tabs>

      {/* AI Chat */}
      <AIChat projectId={projectId} />
    </div>
  )
}
