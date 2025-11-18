'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Code,
} from 'lucide-react'

// Notion-style editor for Overview tab
export function NotionStyleEditor() {
  const [content, setContent] = useState('')

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end)

    setContent(newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 10)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('**', '**')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('*', '*')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('# ', '')}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('## ', '')}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('- ', '')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('1. ', '')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('> ', '')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('`', '`')}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <textarea
        id="editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing... Use markdown formatting"
        className="w-full min-h-[600px] p-6 resize-none focus:outline-none font-mono text-sm"
        style={{ lineHeight: '1.6' }}
      />

      {/* Footer */}
      <div className="p-2 border-t bg-gray-50 text-xs text-gray-600">
        <p>Supports Markdown: **bold**, *italic*, # headings, - lists, &gt; quotes, `code`</p>
      </div>
    </div>
  )
}
