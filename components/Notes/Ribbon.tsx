'use client'

import React, { useState } from 'react'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Palette,
  Highlighter,
  RemoveFormatting,
  Type,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotes } from './NotesContext'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const COLOR_PRESETS = [
  '#000000', '#374151', '#DC2626', '#EA580C', '#D97706', 
  '#CA8A04', '#65A30D', '#16A34A', '#059669', '#0D9488',
  '#0891B2', '#0284C7', '#2563EB', '#4F46E5', '#7C3AED',
  '#9333EA', '#C026D3', '#DB2777', '#E11D48'
]

const HIGHLIGHT_PRESETS = [
  '#FEF3C7', '#FED7AA', '#FEE2E2', '#FCE7F3', '#F3E8FF',
  '#E0E7FF', '#DBEAFE', '#D1FAE5', '#D1FAE5', '#CCFBF1'
]

export function Ribbon() {
  const { activeEditor } = useNotes()
  const [textColorOpen, setTextColorOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)

  if (!activeEditor) {
    return (
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 mb-4">
        <div className="flex items-center gap-1 opacity-50">
          <span className="text-sm text-gray-500">Click on a block to start formatting</span>
        </div>
      </div>
    )
  }

  const isActive = (format: string, attrs?: any) => {
    return activeEditor.isActive(format, attrs)
  }

  const toggleFormat = (format: string) => {
    switch (format) {
      case 'bold':
        activeEditor.chain().focus().toggleBold().run()
        break
      case 'italic':
        activeEditor.chain().focus().toggleItalic().run()
        break
      case 'underline':
        activeEditor.chain().focus().toggleUnderline().run()
        break
      case 'strike':
        activeEditor.chain().focus().toggleStrike().run()
        break
      case 'code':
        activeEditor.chain().focus().toggleCode().run()
        break
      case 'bulletList':
        activeEditor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        activeEditor.chain().focus().toggleOrderedList().run()
        break
      case 'taskList':
        activeEditor.chain().focus().toggleTaskList().run()
        break
      case 'clearFormat':
        activeEditor.chain().focus().clearNodes().unsetAllMarks().run()
        break
    }
  }

  const setHeading = (level: 1 | 2 | 3) => {
    activeEditor.chain().focus().toggleHeading({ level }).run()
  }

  const setParagraph = () => {
    activeEditor.chain().focus().setParagraph().run()
  }

  const setTextColor = (color: string) => {
    activeEditor.chain().focus().setColor(color).run()
    setTextColorOpen(false)
  }

  const setHighlight = (color: string) => {
    activeEditor.chain().focus().toggleHighlight({ color }).run()
    setHighlightOpen(false)
  }

  const removeHighlight = () => {
    activeEditor.chain().focus().unsetHighlight().run()
    setHighlightOpen(false)
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 mb-4 shadow-sm">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Text Style Buttons */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFormat('bold')}
            className={isActive('bold') ? 'bg-blue-100 text-blue-700' : ''}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFormat('italic')}
            className={isActive('italic') ? 'bg-blue-100 text-blue-700' : ''}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFormat('underline')}
            className={isActive('underline') ? 'bg-blue-100 text-blue-700' : ''}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFormat('strike')}
            className={isActive('strike') ? 'bg-blue-100 text-blue-700' : ''}
            title="Strikethrough (Ctrl+Shift+X)"
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFormat('code')}
            className={isActive('code') ? 'bg-blue-100 text-blue-700' : ''}
            title="Code (Ctrl+E)"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        {/* Heading Buttons */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          <Button
            variant="ghost"
            size="sm"
            onClick={setParagraph}
            className={isActive('paragraph') ? 'bg-blue-100 text-blue-700' : ''}
            title="Paragraph"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHeading(1)}
            className={isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : ''}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHeading(2)}
            className={isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : ''}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHeading(3)}
            className={isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : ''}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* List Buttons */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFormat('bulletList')}
            className={isActive('bulletList') ? 'bg-blue-100 text-blue-700' : ''}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFormat('orderedList')}
            className={isActive('orderedList') ? 'bg-blue-100 text-blue-700' : ''}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFormat('taskList')}
            className={isActive('taskList') ? 'bg-blue-100 text-blue-700' : ''}
            title="Task List"
          >
            <CheckSquare className="h-4 w-4" />
          </Button>
        </div>

        {/* Color Buttons */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          <Popover open={textColorOpen} onOpenChange={setTextColorOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                title="Text Color"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <p className="text-sm font-medium">Text Color</p>
                <div className="grid grid-cols-10 gap-1">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={highlightOpen} onOpenChange={setHighlightOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={isActive('highlight') ? 'bg-blue-100 text-blue-700' : ''}
                title="Highlight"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Highlight</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeHighlight}
                    className="text-xs"
                  >
                    Remove
                  </Button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {HIGHLIGHT_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setHighlight(color)}
                      className="w-10 h-10 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Formatting */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleFormat('clearFormat')}
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Rephrase (placeholder for Step 5) */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled
            title="AI Rephrase (Coming in Step 5)"
            className="gap-1"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-xs">Rephrase</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
