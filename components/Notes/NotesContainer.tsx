'use client'

import React, { useState, useEffect } from 'react'
import { Block } from './Block'
import { NotesProvider } from './NotesContext'
import { Ribbon } from './Ribbon'
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
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <NotesProvider>
      <div className="h-full overflow-auto bg-gray-50">
        {/* Formatting Ribbon */}
        <Ribbon />

        <div className="px-6 pt-2 pb-6">
          {/* Save indicator */}
          <div className="mb-4 flex items-center justify-between">
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
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={addBlock}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Block
            </Button>
          </div>
        </div>
      </div>
    </NotesProvider>
  )
}
