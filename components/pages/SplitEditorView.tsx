'use client'

import { Columns2, X, FileText } from 'lucide-react'
import { usePageStore } from '@/lib/stores/pageStore'
import { YooptaPageEditor } from '@/components/yoopta/YooptaPageEditor'

interface SplitEditorViewProps {
  projectId: string
}

export function SplitEditorView({ projectId }: SplitEditorViewProps) {
  const selectedPageId = usePageStore((s) => s.selectedPageId)
  const splitPageId = usePageStore((s) => s.splitPageId)
  const isSplit = usePageStore((s) => s.isSplit)
  const pages = usePageStore((s) => s.pages)
  const toggleSplit = usePageStore((s) => s.toggleSplit)
  const setSplitPageId = usePageStore((s) => s.setSplitPageId)

  const pageList = Object.values(pages).sort((a, b) => a.position - b.position)

  if (!selectedPageId) {
    return (
      <div className="flex flex-col h-full min-h-[700px]">
        <div className="flex items-center justify-end px-4 py-2 border-b bg-white">
          <button
            onClick={toggleSplit}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <Columns2 className="h-4 w-4" />
            <span>Split View</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50/30">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No page selected</p>
            <p className="text-sm text-gray-400">Hover on the left edge to open the sidebar and select a page</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-[700px]">
      {/* Toolbar */}
      <div className="flex items-center justify-end px-4 py-2 border-b bg-white">
        <button
          onClick={toggleSplit}
          className={
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ' +
            (isSplit
              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700')
          }
          title={isSplit ? 'Close split view' : 'Split view'}
        >
          <Columns2 className="h-4 w-4" />
          <span>{isSplit ? 'Close Split' : 'Split View'}</span>
        </button>
      </div>

      {/* Editor content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Primary editor */}
        <div className={isSplit ? 'w-1/2 border-r' : 'w-full'}>
          <YooptaPageEditor
            key={selectedPageId}
            pageId={selectedPageId}
            projectId={projectId}
          />
        </div>

        {/* Split editor */}
        {isSplit && (
          <div className="w-1/2 flex flex-col">
            {splitPageId ? (
              <div className="flex-1 relative">
                <YooptaPageEditor
                  key={splitPageId}
                  pageId={splitPageId}
                  projectId={projectId}
                />
                <button
                  onClick={() => setSplitPageId(null)}
                  className="absolute top-2.5 right-3 p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200 z-10"
                  title="Close this panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50">
                <p className="text-sm text-gray-500 mb-4 font-medium">Open a page</p>
                <div className="space-y-1 max-w-[220px] w-full px-4">
                  {pageList
                    .filter((p) => p.id !== selectedPageId)
                    .map((page) => (
                      <button
                        key={page.id}
                        onClick={() => setSplitPageId(page.id)}
                        className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                      >
                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{page.title}</span>
                      </button>
                    ))}
                  {pageList.filter((p) => p.id !== selectedPageId).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No other pages available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
