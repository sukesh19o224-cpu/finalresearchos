'use client'

import { useState, useRef, useEffect } from 'react'
import { FileText, ChevronRight, ChevronDown, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { usePageStore, type PageNode } from '@/lib/stores/pageStore'

interface PageItemProps {
  page: PageNode
  depth: number
}

export function PageItem({ page, depth }: PageItemProps) {
  const { pages, selectedPageId, selectPage, toggleExpand, renamePage, deletePage, movePage } = usePageStore()
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(page.title)
  const [isHovering, setIsHovering] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isSelected = selectedPageId === page.id
  const childPages = Object.values(pages).filter((p) => p.parentPageId === page.id).sort((a, b) => a.position - b.position)
  const hasChildren = childPages.length > 0

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  const handleClick = () => {
    selectPage(page.id)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
    setRenameValue(page.title)
  }

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== page.title) {
      renamePage(page.id, trimmed)
    }
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleRenameSubmit()
    if (e.key === 'Escape') setIsRenaming(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Delete "${page.title}"?`)) {
      deletePage(page.id)
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleExpand(page.id)
  }

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    movePage(page.id, 'up')
  }

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    movePage(page.id, 'down')
  }

  return (
    <>
      <div
        className={`group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors ${
          isSelected ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {hasChildren ? (
          <button onClick={handleToggle} className="flex-shrink-0 p-0.5 rounded hover:bg-gray-200">
            {page.isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-4.5 flex-shrink-0" />
        )}

        <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />

        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            className="flex-1 text-sm bg-white border rounded px-1 py-0 outline-none focus:border-blue-400 min-w-0"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate">{page.title}</span>
        )}

        {isHovering && !isRenaming && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={handleMoveUp}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              title="Move up"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              onClick={handleMoveDown}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
              title="Move down"
            >
              <ArrowDown className="h-3 w-3" />
            </button>
            <button
              onClick={handleDelete}
              className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {hasChildren && page.isExpanded && (
        childPages.map((child) => (
          <PageItem key={child.id} page={child} depth={depth + 1} />
        ))
      )}
    </>
  )
}
