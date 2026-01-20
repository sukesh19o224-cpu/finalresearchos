'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Block } from './Block'
import { NotesProvider } from './NotesContext'
import { Ribbon } from './Ribbon'
import { ErrorBoundary } from './ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export interface NoteBlock {
  id: string
  header: string
  content: string
  order: number
}

interface NotesContainerProps {
  noteId: string
}

export function NotesContainer({ noteId }: NotesContainerProps) {
  const [blocks, setBlocks] = useState<NoteBlock[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load blocks on mount
  useEffect(() => {
    loadBlocks()
  }, [noteId])

  const loadBlocks = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/notes/${noteId}/blocks`)
      const data = await res.json()
      
      if (data.blocks && data.blocks.length > 0) {
        setBlocks(data.blocks)
      } else {
        // Initialize with one empty block
        setBlocks([{
          id: uuidv4(),
          header: 'New block header name',
          content: '',
          order: 1
        }])
      }
    } catch (error) {
      console.error('Failed to load blocks:', error)
      // Initialize with one empty block on error
      setBlocks([{
        id: uuidv4(),
        header: 'New block header name',
        content: '',
        order: 1
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-save with debounce
  useEffect(() => {
    if (isLoading) return // Don't save during initial load

    const timer = setTimeout(async () => {
      setIsSaving(true)
      try {
        await fetch(`/api/notes/${noteId}/blocks`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocks }),
        })
      } catch (error) {
        console.error('Failed to save blocks:', error)
      } finally {
        setIsSaving(false)
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(timer)
  }, [blocks, noteId, isLoading])

  const addBlock = () => {
    const newBlock: NoteBlock = {
      id: uuidv4(),
      header: 'New block header name',
      content: '',
      order: blocks.length + 1
    }
    setBlocks([...blocks, newBlock])
  }

  const deleteBlock = (blockId: string) => {
    // Don't allow deleting the last block
    if (blocks.length === 1) return
    
    const newBlocks = blocks.filter(b => b.id !== blockId)
    // Renumber remaining blocks
    newBlocks.forEach((b, idx) => b.order = idx + 1)
    setBlocks(newBlocks)
  }

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(b => b.id === blockId)
    
    if (direction === 'up' && index > 0) {
      const newBlocks = [...blocks]
      // Swap with previous block
      ;[newBlocks[index], newBlocks[index - 1]] = [newBlocks[index - 1], newBlocks[index]]
      // Update order numbers
      newBlocks.forEach((b, idx) => b.order = idx + 1)
      setBlocks(newBlocks)
    }
    
    if (direction === 'down' && index < blocks.length - 1) {
      const newBlocks = [...blocks]
      // Swap with next block
      ;[newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]]
      // Update order numbers
      newBlocks.forEach((b, idx) => b.order = idx + 1)
      setBlocks(newBlocks)
    }
  }

  const updateBlock = (blockId: string, changes: Partial<NoteBlock>) => {
    setBlocks(blocks.map(b => 
      b.id === blockId ? { ...b, ...changes } : b
    ))
  }

  const addBlockAfter = (blockId: string) => {
    const index = blocks.findIndex(b => b.id === blockId)
    const newBlock: NoteBlock = {
      id: uuidv4(),
      header: 'New block header name',
      content: '',
      order: index + 1.5 // Will be renormalized
    }

    // Insert after current block
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    // Renumber all blocks
    newBlocks.forEach((b, idx) => b.order = idx + 1)
    setBlocks(newBlocks)

    // Focus new block after a short delay
    setTimeout(() => {
      const newBlockElement = document.querySelector(`[data-block-id="${newBlock.id}"] .ProseMirror`)
      if (newBlockElement instanceof HTMLElement) {
        newBlockElement.focus()
      }
    }, 100)
  }

  if (isLoading) {
    return (
      <ErrorBoundary>
        <NotesProvider>
          <div className="h-full overflow-auto bg-gray-50">
            <Ribbon />
            <div className="px-6 pt-2 pb-6">
              {/* Loading skeleton */}
              <div className="space-y-4 animate-pulse">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </NotesProvider>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <NotesProvider>
        <div className="h-full flex flex-col bg-gray-50">
          {/* Header with save status and Add Block button */}
          <div className="flex-shrink-0 px-4 py-3 bg-white border-b flex items-center justify-between">
            <div className="text-sm">
              {isSaving ? (
                <span className="flex items-center text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Saving...
                </span>
              ) : (
                <span className="text-gray-500">All changes saved</span>
              )}
            </div>
            <Button 
              onClick={addBlock}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Block
            </Button>
          </div>

          {/* Formatting Ribbon - Sticky */}
          <div className="flex-shrink-0 sticky top-0 z-10 bg-white border-b">
            <Ribbon />
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-auto">
            <div className="px-6 pt-2 pb-6">
              {/* Blocks */}
              <div className="space-y-4">
          {blocks.map((block, index) => (
            <Block
              key={block.id}
              block={block}
              canMoveUp={index > 0}
              canMoveDown={index < blocks.length - 1}
              canDelete={blocks.length > 1}
              onUpdate={(changes: Partial<NoteBlock>) => updateBlock(block.id, changes)}
              onDelete={() => deleteBlock(block.id)}
              onMoveUp={() => moveBlock(block.id, 'up')}
              onMoveDown={() => moveBlock(block.id, 'down')}
              onAddBlockAfter={() => addBlockAfter(block.id)}
            />
          ))}
        </div>

          {/* Add block button at bottom */}
          <div className=\"mt-6 flex justify-center\">
            <Button 
              onClick={addBlock}
              variant=\"outline\"
              size=\"lg\"
              className=\"gap-2\"
            >
              <Plus className=\"h-4 w-4\" />
              Add Block
            </Button>
          </div>
        </div>
      </div>
    </div>
    </NotesProvider>
    </ErrorBoundary>
  )
}
