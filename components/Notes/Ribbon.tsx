'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  Sparkles,
  ImagePlus,
  Loader2,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotes } from './NotesContext'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface RibbonProps {
  isSaving?: boolean
  onAddBlock?: () => void
}

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

export function Ribbon({ isSaving = false, onAddBlock }: RibbonProps = {}) {
  const { activeEditor } = useNotes()
  const [textColorOpen, setTextColorOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRephrasing, setIsRephrasing] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Track selection changes
  React.useEffect(() => {
    if (!activeEditor) return

    const updateSelection = () => {
      const { from, to } = activeEditor.state.selection
      setHasSelection(from !== to)
    }

    // Update initially
    updateSelection()

    // Update on selection change
    activeEditor.on('selectionUpdate', updateSelection)

    return () => {
      activeEditor.off('selectionUpdate', updateSelection)
    }
  }, [activeEditor])

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
        // Convert hard breaks to paragraphs for proper multi-line list formatting
        convertHardBreaksToListItems('bulletList')
        break
      case 'orderedList':
        // Convert hard breaks to paragraphs for proper multi-line list formatting
        convertHardBreaksToListItems('orderedList')
        break
      case 'taskList':
        // Convert hard breaks to paragraphs for proper multi-line list formatting
        convertHardBreaksToListItems('taskList')
        break
      case 'clearFormat':
        activeEditor.chain().focus().clearNodes().unsetAllMarks().run()
        break
    }
  }

  const convertHardBreaksToListItems = (listType: 'bulletList' | 'orderedList' | 'taskList') => {
    const { state } = activeEditor
    const { from, to } = state.selection
    const { doc, tr } = state

    // Get the content in the selection
    let hasHardBreaks = false
    doc.nodesBetween(from, to, (node) => {
      if (node.type.name === 'hardBreak') {
        hasHardBreaks = true
        return false
      }
    })

    // If no hard breaks, just toggle the list normally
    if (!hasHardBreaks) {
      if (listType === 'bulletList') {
        activeEditor.chain().focus().toggleBulletList().run()
      } else if (listType === 'orderedList') {
        activeEditor.chain().focus().toggleOrderedList().run()
      } else {
        activeEditor.chain().focus().toggleTaskList().run()
      }
      return
    }

    // Split hard breaks into separate paragraphs first
    let pos = from
    doc.nodesBetween(from, to, (node, nodePos) => {
      if (node.type.name === 'hardBreak') {
        // Replace hard break with paragraph break
        const mappedPos = tr.mapping.map(nodePos)
        tr.replaceWith(mappedPos, mappedPos + 1, state.schema.nodes.paragraph.create())
      }
    })

    // Apply the transaction
    activeEditor.view.dispatch(tr)

    // Now toggle the list
    setTimeout(() => {
      if (listType === 'bulletList') {
        activeEditor.chain().focus().toggleBulletList().run()
      } else if (listType === 'orderedList') {
        activeEditor.chain().focus().toggleOrderedList().run()
      } else {
        activeEditor.chain().focus().toggleTaskList().run()
      }
    }, 0)
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }

      const data = await response.json()
      
      // Insert image into editor
      activeEditor.chain().focus().setImage({ src: data.url }).run()
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Image upload failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const openImagePicker = () => {
    fileInputRef.current?.click()
  }

  const handleRephraseClick = async () => {
    const { from, to } = activeEditor.state.selection
    const text = activeEditor.state.doc.textBetween(from, to, ' ')
    
    if (!text.trim()) {
      alert('Please select some text to rephrase')
      return
    }

    setIsRephrasing(true)
    
    try {
      const response = await fetch('/api/ai/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to rephrase text')
      }

      const data = await response.json()
      
      // Replace selected text with rephrased version
      activeEditor.chain().focus().deleteRange({ from, to }).insertContent(data.rephrased).run()
    } catch (error) {
      console.error('Rephrase failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to rephrase text')
    } finally {
      setIsRephrasing(false)
    }
  }

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-2 sm:px-4 py-2 mb-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
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

        {/* Image Upload */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={openImagePicker}
            disabled={isUploading}
            title="Insert Image"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
          </Button>
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

        {/* AI Rephrase */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasSelection || isRephrasing}
            onClick={handleRephraseClick}
            title={hasSelection ? "AI Rephrase Selected Text" : "Select text to rephrase"}
            className="gap-1"
          >
            {isRephrasing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span className="text-xs">{isRephrasing ? 'Rephrasing...' : 'Rephrase'}</span>
          </Button>
        </div>
        </div>

        {/* Right side: Save indicator and Add Block button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Save indicator */}
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
          
          {/* Add Block button */}
          {onAddBlock && (
            <Button 
              onClick={onAddBlock}
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Block
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
