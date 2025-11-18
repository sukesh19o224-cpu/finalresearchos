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

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ResearchAIChatProps {
  context?: {
    datasetInfo?: string
    plotInfo?: string
    projectInfo?: string
  }
  fullScreen?: boolean
}

// ChatGPT-like interface powered by Groq Llama 3.1 8B
export function ResearchAIChat({ context, fullScreen = false }: ResearchAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI research assistant powered by Llama 3.1. I can help you analyze data, interpret plots, refine experimental ideas, and suggest next steps. How can I assist with your research today?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })).concat([
            { role: 'user', content: input }
          ]),
          context,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. How can I help you with your research?',
        timestamp: new Date(),
      },
    ])
  }

  return (
    <Card className={fullScreen ? 'h-full flex flex-col' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Research AI Assistant
            </CardTitle>
            <CardDescription>
              Powered by Groq Llama 3.1 8B - Context-aware research help
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`space-y-4 ${fullScreen ? 'flex-1 flex flex-col' : ''}`}>
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
        <div className={`space-y-4 overflow-y-auto ${fullScreen ? 'flex-1' : 'h-96'} pr-2`}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
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
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your data, plots, or get research suggestions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={!input.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput('Analyze this dataset and suggest next steps')}
            disabled={isLoading}
          >
            Analyze data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput('What insights can you find in this plot?')}
            disabled={isLoading}
          >
            Interpret plot
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInput('Suggest improvements to my experiment')}
            disabled={isLoading}
          >
            Improve experiment
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
