'use client'

import React, { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { useSession } from './SessionContext'
import { Message } from './Message'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function ChatWindow() {
    const { sessionId } = useSession()
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const { data: session, error, mutate } = useSWR(
        sessionId ? `/api/research-assistant/sessions/${sessionId}` : null,
        fetcher
    )

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [session?.messages])

    const sendMessage = async () => {
        if (!input.trim() || !sessionId) return

        const tempMsg = {
            id: 'temp-' + Date.now(),
            role: 'user',
            content: input,
            createdAt: new Date().toISOString()
        }

        // Optimistic update
        mutate({
            ...session,
            messages: [...(session?.messages || []), tempMsg]
        }, false)

        setInput('')

        try {
            const response = await fetch(`/api/research-assistant/sessions/${sessionId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'user', content: tempMsg.content })
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('API Error:', errorData)
                alert(`Failed to send message: ${errorData.error || 'Please try again'}`)
                // Revert optimistic update
                mutate()
                return
            }

            mutate() // Revalidate to get the AI response
        } catch (error) {
            console.error('Failed to send message:', error)
            alert('Failed to send message. Please try again.')
            // Revert optimistic update
            mutate()
        }
    }

    if (!sessionId) {
        return (
            <div className="flex-1 flex items-center justify-center text-gray-500">
                Select or create a session to start chatting
            </div>
        )
    }

    if (error) return <div className="p-4 text-red-500">Failed to load session</div>
    if (!session) return (
        <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
    )

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
                {session.messages?.map((msg: any) => (
                    <Message key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="min-h-[60px]"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                sendMessage()
                            }
                        }}
                    />
                    <Button onClick={sendMessage} className="h-auto" disabled={!input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
