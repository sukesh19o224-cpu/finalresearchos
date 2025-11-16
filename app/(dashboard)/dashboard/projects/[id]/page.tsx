'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Database, FileText, BarChart3, MessageSquare } from 'lucide-react'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <Upload className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle className="text-lg">Upload Data</CardTitle>
            <CardDescription>
              Add electrochemistry data files
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-50">
          <CardHeader>
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle className="text-lg">Add Notes</CardTitle>
            <CardDescription>
              Create project pages
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-50">
          <CardHeader>
            <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle className="text-lg">Visualize</CardTitle>
            <CardDescription>
              Create plots and charts
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-50">
          <CardHeader>
            <MessageSquare className="h-8 w-8 text-orange-600 mb-2" />
            <CardTitle className="text-lg">Ask AI</CardTitle>
            <CardDescription>
              Get research insights
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Datasets */}
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
                {project.datasets.map((dataset: any) => (
                  <div
                    key={dataset.id}
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-medium">{dataset.name}</p>
                    <p className="text-sm text-gray-600">
                      {dataset.technique} • {dataset.instrument}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No datasets yet</p>
                <Button className="mt-4" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Pages ({project.pages?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.pages && project.pages.length > 0 ? (
              <div className="space-y-2">
                {project.pages.map((page: any) => (
                  <div
                    key={page.id}
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-medium">{page.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No pages yet</p>
                <Button className="mt-4" size="sm" variant="outline">
                  Create Page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visualizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Visualizations ({project.visualizations?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.visualizations && project.visualizations.length > 0 ? (
              <div className="space-y-2">
                {project.visualizations.map((viz: any) => (
                  <div
                    key={viz.id}
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-medium">{viz.name}</p>
                    <p className="text-sm text-gray-600">{viz.plotType}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No visualizations yet</p>
                <Button className="mt-4" size="sm" variant="outline">
                  Create Plot
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Papers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Literature ({project.papers?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.papers && project.papers.length > 0 ? (
              <div className="space-y-2">
                {project.papers.map((paper: any) => (
                  <div
                    key={paper.id}
                    className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-medium line-clamp-1">{paper.title}</p>
                    <p className="text-sm text-gray-600">
                      {paper.authors.join(', ')} ({paper.year})
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No papers yet</p>
                <Button className="mt-4" size="sm" variant="outline">
                  Upload Paper
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
