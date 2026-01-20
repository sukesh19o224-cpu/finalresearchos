'use client'

import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import { useNotes } from './NotesContext'

interface BlockEditorProps {
  blockId: string
  content: string
  onChange: (content: string) => void
  onAddBlockAfter: () => void
  onDeleteBlock?: () => void
}

export function BlockEditor({ 
  blockId, 
  content, 
  onChange, 
  onAddBlockAfter, 
  onDeleteBlock 
}: BlockEditorProps) {
  const { setActiveEditor } = useNotes()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure heading levels
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Type something or press / for commands...',
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onFocus: ({ editor }) => {
      setActiveEditor(editor)
    },
    onBlur: () => {
      // Keep active editor for ribbon to work after clicking buttons
      // Don't clear it immediately
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2 leading-normal',
      },
      handleKeyDown: (view, event) => {
        // Shift+Enter creates new block
        if (event.key === 'Enter' && event.shiftKey) {
          event.preventDefault()
          onAddBlockAfter()
          return true
        }

        // Enter creates soft break (new line within same block)
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault()
          const { state, dispatch } = view
          const { tr } = state
          // Insert a hard break (br tag) for consistent line spacing
          dispatch(tr.replaceSelectionWith(state.schema.nodes.hardBreak.create()).scrollIntoView())
          return true
        }

        // Backspace on empty block deletes it
        if (event.key === 'Backspace' && onDeleteBlock) {
          const { state } = view
          const isEmpty = state.doc.textContent.trim() === ''

          if (isEmpty) {
            event.preventDefault()
            onDeleteBlock()
            return true
          }
        }

        return false
      },
    },
  })

  // Update editor content when prop changes (for undo/redo from outside)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div 
      className="border border-gray-200 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
      data-block-id={blockId}
    >
      <EditorContent editor={editor} />
    </div>
  )
}
