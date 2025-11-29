'use client'

import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { useNotes } from './NotesContext'

interface BlockEditorProps {
    blockId: string
    content: string
    onChange: (content: string) => void
    onAddBlockAfter: () => void
    onDeleteBlock?: () => void
}

export function BlockEditor({ blockId, content, onChange, onAddBlockAfter, onDeleteBlock }: BlockEditorProps) {
    const { setActiveEditor } = useNotes()

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Underline,
            Highlight.configure({
                multicolor: true,
            }),
            TextStyle,
            Color,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Placeholder.configure({
                placeholder: 'Type something...',
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
            // Optional: clear active editor or keep it for ribbon access?
            // Keeping it allows clicking ribbon buttons without losing context immediately
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[100px]',
            },
            handleKeyDown: (view, event) => {
                // Enter key at end of block creates new block
                if (event.key === 'Enter' && !event.shiftKey) {
                    const { state } = view
                    const { selection } = state
                    const { $from } = selection

                    // Check if at end of document
                    if ($from.pos === state.doc.content.size - 1) {
                        event.preventDefault()
                        onAddBlockAfter()
                        return true
                    }
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
            handlePaste: (view, event, slice) => {
                const items = Array.from(event.clipboardData?.items || [])
                const images = items.filter(item => item.type.indexOf('image') === 0)

                if (images.length === 0) return false

                event.preventDefault()

                images.forEach(async (item) => {
                    const file = item.getAsFile()
                    if (!file) return

                    // Upload logic
                    const formData = new FormData()
                    formData.append('file', file)

                    try {
                        const response = await fetch('/api/files/upload', {
                            method: 'POST',
                            body: formData,
                        })

                        if (response.ok) {
                            const data = await response.json()
                            const { schema } = view.state

                            if (data.url) {
                                const node = schema.nodes.image.create({ src: data.url })
                                const transaction = view.state.tr.insert(view.state.selection.from, node)
                                view.dispatch(transaction)
                            }
                        }
                    } catch (error) {
                        console.error('Failed to upload image:', error)
                    }
                })

                return true
            },
            handleDrop: (view, event, slice, moved) => {
                if (moved) return false

                const files = Array.from(event.dataTransfer?.files || [])
                const images = files.filter(f => f.type.startsWith('image/'))

                if (images.length === 0) return false

                event.preventDefault()

                images.forEach(async (file) => {
                    const formData = new FormData()
                    formData.append('file', file)

                    try {
                        const response = await fetch('/api/files/upload', {
                            method: 'POST',
                            body: formData,
                        })

                        if (response.ok) {
                            const data = await response.json()
                            const { schema } = view.state
                            const coordinates = view.posAtCoords({
                                left: event.clientX,
                                top: event.clientY
                            })

                            if (data.url) {
                                const node = schema.nodes.image.create({ src: data.url })
                                const transaction = view.state.tr.insert(
                                    coordinates?.pos || view.state.selection.from,
                                    node
                                )
                                view.dispatch(transaction)
                            }
                        }
                    } catch (error) {
                        console.error('Failed to upload image:', error)
                    }
                })

                return true
            },
        },
    })

    // Update active editor when this component mounts/unmounts if it was focused
    useEffect(() => {
        return () => {
            if (editor?.isFocused) {
                setActiveEditor(null)
            }
        }
    }, [editor, setActiveEditor])

    return <EditorContent editor={editor} />
}
