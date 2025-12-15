'use client'

import React from 'react'
import { BlockHeader } from './BlockHeader'
import { NoteBlock } from './NotesContainer'
import { Button } from '@/components/ui/button'
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react'

interface BlockProps {
  block: NoteBlock
  onDelete: () => void
  onUpdate: (updates: Partial<NoteBlock>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  canDelete: boolean
}

export function Block({
  block,
  onDelete,
  onUpdate,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  canDelete
}: BlockProps) {
  return (
    <div 
      className="
        group relative bg-white rounded-lg border border-gray-200 
        shadow-sm hover:shadow-md transition-all duration-200 p-6
      "
      data-block-id={block.id}
    >
      {/* Control buttons (visible on hover) */}
      <div className="
        absolute top-3 right-3 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-200
        flex items-center gap-1
      ">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-gray-100"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          title="Move up"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-gray-100"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          title="Move down"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-red-50 text-red-500 hover:text-red-600"
          onClick={onDelete}
          disabled={!canDelete}
          title={canDelete ? "Delete block" : "Cannot delete last block"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Block content */}
      <div className="space-y-4 pr-24">
        <BlockHeader
          value={block.header}
          onChange={(header: string) => onUpdate({ header })}
        />

        <textarea
          className="
            w-full min-h-[120px] p-3 
            border border-gray-200 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            resize-y font-sans text-gray-700
            placeholder:text-gray-400
          "
          value={block.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Type your notes here..."
        />
      </div>
    </div>
  )
}
