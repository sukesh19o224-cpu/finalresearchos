'use client'

import { useEffect, useState } from 'react'
import { Plus, FileText } from 'lucide-react'
import { usePageStore } from '@/lib/stores/pageStore'
import { PageItem } from './PageItem'
import { AnimatedTooltip } from '@/components/ui/animated-tooltip'

interface PageManagerSectionProps {
  projectId: string
  isCollapsed?: boolean
}

export function PageManagerSection({ projectId, isCollapsed = false }: PageManagerSectionProps) {
  const { pages, isLoading, setProjectId, loadPages, createPage } = usePageStore()
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    setProjectId(projectId)
    loadPages()
  }, [projectId, setProjectId, loadPages])

  const rootPages = Object.values(pages)
    .filter((p) => !p.parentPageId)
    .sort((a, b) => a.position - b.position)

  const handleCreate = async () => {
    const title = newTitle.trim() || 'Untitled'
    await createPage(title)
    setNewTitle('')
    setIsCreating(false)
  }

  const handleCreateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreate()
    if (e.key === 'Escape') {
      setIsCreating(false)
      setNewTitle('')
    }
  }

  // Collapsed view - just show an icon with tooltip
  if (isCollapsed) {
    const pageCount = rootPages.length
    return (
      <div className="mb-2">
        <AnimatedTooltip 
          content={
            <div className="min-w-[200px]">
              <div className="font-semibold mb-1">Editor</div>
              <div className="text-xs text-gray-300">
                {pageCount} {pageCount === 1 ? 'page' : 'pages'}
              </div>
            </div>
          }
        >
          <button
            className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Editor pages"
          >
            <FileText className="h-5 w-5 text-gray-500" />
          </button>
        </AnimatedTooltip>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Editor
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700"
          title="New page"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {isCreating && (
        <div className="flex items-center gap-1 px-2 py-1.5 mb-1">
          <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={handleCreate}
            onKeyDown={handleCreateKeyDown}
            placeholder="Page name..."
            className="flex-1 text-sm bg-white border rounded px-1 py-0.5 outline-none focus:border-blue-400 min-w-0"
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-xs text-gray-400 px-2 py-2">Loading...</div>
      ) : rootPages.length === 0 && !isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full text-left text-xs text-gray-400 px-2 py-3 hover:text-gray-600 hover:bg-gray-50 rounded"
        >
          + Create your first page
        </button>
      ) : (
        rootPages.map((page) => (
          <PageItem key={page.id} page={page} depth={0} />
        ))
      )}
    </div>
  )
}
