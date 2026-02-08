'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import {
  DataManagementTab,
  VisualizationTab,
} from '@/components/LazyComponents'
import { CollaborationPanel } from '@/components/collaboration/CollaborationPanel'
import { LabNotebook } from '@/components/notebook/LabNotebook'
import { ExportPanel } from '@/components/export/ExportPanel'
import { Users, BookOpen, Download } from 'lucide-react'
import { ProjectSidebar } from '@/components/navigation/ProjectSidebar'
import { ProjectAIChatProvider } from '@/lib/hooks/useProjectAIChat'
import { ProjectAIChatSidebar } from '@/components/ai/ProjectAIChatSidebar'
import { AnalysisPage } from '@/components/analysis/AnalysisPage'
import { SplitEditorView } from '@/components/pages/SplitEditorView'
import { usePageStore } from '@/lib/stores/pageStore'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = params.id as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const activeView = searchParams.get('view') || 'overview'
  const [sidebarWidth, setSidebarWidth] = useState(64)
  const [sidebarResizing, setSidebarResizing] = useState(false)

  const setActiveView = (view: string) => {
    router.push(`/projects/${projectId}?view=${view}`, { scroll: false })
  }

  const setStoreProjectId = usePageStore((s) => s.setProjectId)
  const loadPages = usePageStore((s) => s.loadPages)
  const selectedPageId = usePageStore((s) => s.selectedPageId)
  const selectPage = usePageStore((s) => s.selectPage)
  const pages = usePageStore((s) => s.pages)

  useEffect(() => {
    if (projectId) {
      fetchProject()
      setStoreProjectId(projectId)
    }
  }, [projectId])

  // Load pages when projectId is set
  useEffect(() => {
    if (projectId) {
      loadPages()
    }
  }, [projectId, loadPages])

  // Auto-select first page if none selected
  useEffect(() => {
    if (!selectedPageId && Object.keys(pages).length > 0) {
      const sorted = Object.values(pages).sort((a, b) => a.position - b.position)
      selectPage(sorted[0].id)
    }
  }, [pages, selectedPageId, selectPage])

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

  // Research Tools
  const researchTools = [
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      description: 'Work together with your team',
      icon: Users,
      iconBg: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
    {
      id: 'export',
      title: 'Export & Publish',
      description: 'Publication-ready exports',
      icon: Download,
      iconBg: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
    {
      id: 'notebook',
      title: 'Lab Notebook',
      description: 'Document experiments with timestamps',
      icon: BookOpen,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
  ]

  const navigationItems: any[] = []

  return (
    <ProjectAIChatProvider projectId={projectId}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <ProjectSidebar
          isOpen={sidebarOpen}
          activeView={activeView}
          onViewChange={setActiveView}
          navigationItems={navigationItems}
          researchTools={researchTools}
          onWidthChange={setSidebarWidth}
          onResizingChange={setSidebarResizing}
          projectId={projectId}
        />

        <div 
          className="flex-1 overflow-y-auto transition-all"
          style={{
            transitionDuration: sidebarResizing ? '0ms' : '200ms',
          }}
        >
          <div className="h-full
              {activeView === 'overview' && (
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                </div>
              )}

              <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
                <TabsList className="hidden"></TabsList>

                {/* Overview Tab - Multi-page Editor */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ minHeight: 'calc(100vh - 220px)' }}>
                    <SplitEditorView projectId={projectId} />
                  </div>
                </TabsContent>

                {/* Visualization Tab */}
                <TabsContent value="visualization">
                  <VisualizationTab />
                </TabsContent>

                {/* Analysis Tab */}
                <TabsContent value="analysis">
                  <AnalysisPage />
                </TabsContent>

                {/* Research Tool Tabs */}
                <TabsContent value="collaboration">
                  <CollaborationPanel projectId={projectId} />
                </TabsContent>

                <TabsContent value="notebook">
                  <LabNotebook projectId={projectId} />
                </TabsContent>

                <TabsContent value="export">
                  <ExportPanel projectId={projectId} projectTitle={project.title} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* AI Chat Sidebar - accessible from all tabs */}
        <ProjectAIChatSidebar projectId={projectId} />
      </div>
    </ProjectAIChatProvider>
  )
}
