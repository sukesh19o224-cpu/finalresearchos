'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  MessageSquare,
  Send,
  Sparkles,
  Loader2,
  RefreshCw,
  Brain,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ResearchAIChatProps {
  projectId?: string // NEW: Optional project ID for memory
  context?: {
    datasetInfo?: string
    plotInfo?: string
    projectInfo?: string
  }
  fullScreen?: boolean
  initialUserMessage?: string
  sidebarMode?: boolean
}

// Placeholder for searchSimilarPapers - replace with actual implementation
async function searchSimilarPapers(query: string): Promise<any[]> {
  console.log(`Searching for similar papers for: ${query}`)
  // Simulate API call
  return new Promise(resolve => setTimeout(() => resolve([
    { title: 'A Novel Approach to AI Research', year: 2023, abstract: 'This paper explores new methodologies in artificial intelligence research, focusing on large language models and their applications in scientific discovery.' },
    { title: 'Understanding Data Patterns with Llama 3.1', year: 2024, abstract: 'An in-depth analysis of Llama 3.1 capabilities in identifying complex patterns within large datasets, offering insights into its performance.' },
  ]), 1000))
}

// Simple markdown formatter
function formatMarkdown(text: string): JSX.Element {
  const parts = []
  let lastIndex = 0
  
  // Match **bold**, *italic*, `code`, and line breaks
  const regex = /(\*\*.*?\*\*)|(\*.*?\*)|(`.*?`)|(\n)/g
  let match
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    
    const matched = match[0]
    if (matched.startsWith('**')) {
      // Bold
      parts.push(<strong key={match.index}>{matched.slice(2, -2)}</strong>)
    } else if (matched.startsWith('*')) {
      // Italic
      parts.push(<em key={match.index}>{matched.slice(1, -1)}</em>)
    } else if (matched.startsWith('`')) {
      // Code
      parts.push(<code key={match.index} className="bg-gray-200 px-1 rounded text-xs">{matched.slice(1, -1)}</code>)
    } else if (matched === '\n') {
      // Line break
      parts.push(<br key={match.index} />)
    }
    
    lastIndex = regex.lastIndex
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }
  
  return <>{parts}</>
}

// ChatGPT-like interface powered by Groq Llama 3.1 8B
export function ResearchAIChat({ projectId, context, fullScreen = false, initialUserMessage, sidebarMode = false }: ResearchAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [includeSearch, setIncludeSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Load chat history when projectId is provided
  useEffect(() => {
    if (projectId) {
      loadChatHistory()
    } else {
      // No projectId - show default greeting
      setMessages([{
        role: 'assistant',
        content: 'Hello! I\'m your AI research assistant. I can help you analyze data, interpret plots, refine experimental ideas, and suggest next steps. How can I assist with your research today?',
        timestamp: new Date(),
      }])
    }
  }, [projectId])

  const loadChatHistory = async () => {
    if (!projectId) return
    
    setIsLoadingHistory(true)
    try {
      const res = await fetch(`/api/chat/history?projectId=${projectId}&limit=50`)
      if (!res.ok) throw new Error('Failed to load history')
      
      const data = await res.json()
      
      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.createdAt)
        })))
      } else {
        // No history - show greeting
        setMessages([{
          role: 'assistant',
          content: 'Hello! I\'m your AI research assistant. I can help you analyze data, interpret plots, refine experimental ideas, and suggest next steps. How can I assist with your research today?',
          timestamp: new Date(),
        }])
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [input])

  // Handle initial message
  useEffect(() => {
    if (initialUserMessage) {
      handleSendMessage(initialUserMessage)
    }
  }, [initialUserMessage])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      let searchContext = ''
      if (includeSearch) {
        const papers = await searchSimilarPapers(content)
        if (papers.length > 0) {
          searchContext = `\n\nFound similar papers:\n${papers.map(p => `- ${p.title} (${p.year}): ${p.abstract.substring(0, 150)}...`).join('\n')}`
        }
      }

      // NEW: Use project-specific memory if projectId is provided
      if (projectId) {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            message: content,
            context: {
              ...context,
              projectInfo: (context?.projectInfo || '') + searchContext
            }
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send message')
        }

        const data = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        // LEGACY: Stateless chat without project memory
        const payload = {
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([{ role: userMessage.role, content: userMessage.content }]),
          context: {
            ...context,
            projectInfo: (context?.projectInfo || '') + searchContext
          },
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send message')
        }

        const data = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${errorMessage}`, 
        timestamp: new Date() 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = () => {
    if (!input.trim()) return
    handleSendMessage(input)
    setInput('')
  }

  const clearChat = async () => {
    if (projectId) {
      // Clear from database
      try {
        const response = await fetch('/api/chat/history', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId })
        })
        
        if (response.ok) {
          setMessages([{
            role: 'assistant',
            content: 'Chat cleared. How can I help you with your research?',
            timestamp: new Date(),
          }])
          toast({
            title: 'Success',
            description: 'Chat history cleared'
          })
        }
      } catch (error) {
        console.error('Failed to clear chat:', error)
        toast({
          title: 'Error',
          description: 'Failed to clear chat history',
          variant: 'destructive'
        })
      }
    } else {
      // Local clear only
      setMessages([{
        role: 'assistant',
        content: 'Chat cleared. How can I help you with your research?',
        timestamp: new Date(),
      }])
    }
  }

  return (
    <Card className={`${fullScreen ? 'h-full flex flex-col' : ''} ${sidebarMode ? 'border-0 shadow-none rounded-none' : ''}`}>
      <CardHeader className={sidebarMode ? 'px-4 py-3' : ''}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`flex items-center gap-2 ${sidebarMode ? 'text-base' : ''}`}>
              <Brain className={`${sidebarMode ? 'h-4 w-4' : 'h-5 w-5'} text-purple-600`} />
              {!sidebarMode && 'Research AI Assistant'}
            </CardTitle>
            {!sidebarMode && (
              <CardDescription>
                Powered by Groq Llama 3.1 8B - Context-aware research help
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!sidebarMode && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <RefreshCw className={`${sidebarMode ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`${fullScreen || sidebarMode ? 'flex-1 flex flex-col min-h-0' : 'space-y-4'} ${sidebarMode ? 'px-3 py-2' : ''}`}>
        {/* Context indicators */}
        {context && (
          <div className="flex flex-wrap gap-2">
            {context.datasetInfo && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                📊 Dataset loaded
              </Badge>
            )}
            {context.plotInfo && (
              <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                📈 Plot active
              </Badge>
            )}
            {context.projectInfo && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                📁 Project context
              </Badge>
            )}
          </div>
        )}

        {/* Messages */}
        <div className={`space-y-4 overflow-y-auto ${sidebarMode || fullScreen ? 'flex-1 min-h-0' : 'h-96'} pr-2`}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <div className="text-sm whitespace-pre-wrap">{formatMarkdown(msg.content)}</div>
                <p className="text-xs mt-2 opacity-70">
                  {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`border-t bg-white ${sidebarMode ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center space-x-2 mb-2">
            <Switch id="internet-search" checked={includeSearch} onCheckedChange={setIncludeSearch} />
            <Label htmlFor="internet-search" className="text-xs text-gray-500">Search internet for papers</Label>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ask about your data, plots, or get research suggestions... (Shift+Enter for new line)"
              className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto min-h-[40px] max-h-[200px] leading-5"
              disabled={isLoading}
              rows={1}
            />
            <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
