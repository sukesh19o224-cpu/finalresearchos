'use client'

import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import YooptaEditor, {
  createYooptaEditor,
  type YooptaContentValue,
  type YooptaOnChangeOptions,
} from '@yoopta/editor'

// Plugins
import Paragraph from '@yoopta/paragraph'
import Blockquote from '@yoopta/blockquote'
import Code from '@yoopta/code'
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings'
import { NumberedList, BulletedList, TodoList } from '@yoopta/lists'
import Divider from '@yoopta/divider'
import Callout from '@yoopta/callout'
import Accordion from '@yoopta/accordion'
import Table from '@yoopta/table'
import ImagePlugin from '@yoopta/image'
import Video from '@yoopta/video'
import File from '@yoopta/file'
import Embed from '@yoopta/embed'
import Link from '@yoopta/link'

// Marks
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks'

// Tools
import Toolbar, { DefaultToolbarRender } from '@yoopta/toolbar'
import ActionMenu, { DefaultActionMenuRender } from '@yoopta/action-menu-list'
import LinkTool, { DefaultLinkToolRender } from '@yoopta/link-tool'

import { usePageStore } from '@/lib/stores/pageStore'

interface YooptaPageEditorProps {
  pageId: string
  projectId: string
}

async function uploadFile(file: globalThis.File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Upload failed')
  return data
}

const MARKS = [Bold, Italic, CodeMark, Underline, Strike, Highlight]

const TOOLS = {
  Toolbar: {
    tool: Toolbar,
    render: DefaultToolbarRender,
  },
  ActionMenu: {
    tool: ActionMenu,
    render: DefaultActionMenuRender,
  },
  LinkTool: {
    tool: LinkTool,
    render: DefaultLinkToolRender,
  },
}

export function YooptaPageEditor({ pageId, projectId }: YooptaPageEditorProps) {
  const editor = useMemo(() => createYooptaEditor(), [])
  const [value, setValue] = useState<YooptaContentValue | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const currentPageIdRef = useRef<string>(pageId)

  const plugins = useMemo(() => [
    Paragraph,
    HeadingOne,
    HeadingTwo,
    HeadingThree,
    Blockquote,
    Code,
    NumberedList,
    BulletedList,
    TodoList,
    Divider,
    Callout,
    Accordion,
    Table,
    Link,
    Embed,
    ImagePlugin.extend({
      options: {
        async onUpload(file: globalThis.File) {
          const data = await uploadFile(file)
          return { src: data.url, alt: file.name, sizes: { width: 800, height: 600 } }
        },
      },
    }),
    Video.extend({
      options: {
        async onUpload(file: globalThis.File) {
          const data = await uploadFile(file)
          return { src: data.url, sizes: { width: 800, height: 450 } }
        },
      },
    }),
    File.extend({
      options: {
        async onUpload(file: globalThis.File) {
          const data = await uploadFile(file)
          return { src: data.url, format: file.name.split('.').pop(), name: file.name, size: file.size }
        },
      },
    }),
  ], [])

  // Load content when pageId changes
  useEffect(() => {
    currentPageIdRef.current = pageId
    setIsLoading(true)
    setValue(undefined)

    const loadContent = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/pages/${pageId}`)
        if (res.ok && currentPageIdRef.current === pageId) {
          const data = await res.json()
          const content = data.page?.properties?.yooptaContent
          if (content && typeof content === 'object' && Object.keys(content).length > 0) {
            const firstBlock = Object.values(content)[0] as any
            if (firstBlock?.type && firstBlock?.value) {
              setValue(content)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load page content:', error)
      } finally {
        if (currentPageIdRef.current === pageId) {
          setIsLoading(false)
        }
      }
    }

    loadContent()
  }, [pageId, projectId])

  // Save content to API
  const saveContent = useCallback(
    async (content: YooptaContentValue) => {
      try {
        const res = await fetch(`/api/projects/${projectId}/pages/${pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        })
      } catch (error) {
        console.error('Failed to save:', error)
      }
    },
    [projectId, pageId]
  )

  // Debounced auto-save on change
  const onChange = useCallback(
    (newValue: YooptaContentValue, options: YooptaOnChangeOptions) => {
      setValue(newValue)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => saveContent(newValue), 1500)
    },
    [saveContent]
  )

  // Cleanup timer on unmount or pageId change
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [pageId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4" />
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Editor with constrained width */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[900px] mx-auto">
          <YooptaEditor
            editor={editor}
            plugins={plugins as any}
            marks={MARKS}
            tools={TOOLS as any}
            value={value}
            onChange={onChange}
            placeholder="Start typing or press / for commands..."
            autoFocus
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  )
}
