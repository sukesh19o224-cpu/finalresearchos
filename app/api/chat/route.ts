// Groq API Integration for Llama 3.1 8B
// Node.js Runtime for better environment variable support

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs' // Use Node.js Runtime for reliable env var loading

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GroqChatRequest {
  messages: ChatMessage[]
  context?: {
    datasetInfo?: string
    plotInfo?: string
    projectInfo?: string
  }
}

export async function POST(req: NextRequest) {
  try {
    // Debug: Log API key status
    console.log('🔑 GROQ_API_KEY status:', GROQ_API_KEY ? 'LOADED ✓' : 'MISSING ✗')
    
    // Check if GROQ_API_KEY is set
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured')
      return NextResponse.json(
        { error: 'AI service not configured. Please contact administrator.' },
        { status: 500 }
      )
    }

    const body = await req.json() as GroqChatRequest
    const { messages, context } = body

    console.log('Chat API received:', { messagesCount: messages?.length, hasContext: !!context })

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('Invalid messages:', messages)
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Build context-aware system message
    let systemMessage = `You are an expert research assistant specializing in electrochemistry and scientific data analysis. You help researchers with:
- Analyzing experimental data and plots
- Suggesting next experimental steps
- Refining research ideas and hypotheses
- Interpreting trends and anomalies
- Writing and improving experiment documentation

Always be concise, actionable, and scientifically accurate.`

    if (context?.datasetInfo) {
      systemMessage += `\n\nCurrent Dataset Context:\n${context.datasetInfo}`
    }
    if (context?.plotInfo) {
      systemMessage += `\n\nCurrent Plot Context:\n${context.plotInfo}`
    }
    if (context?.projectInfo) {
      systemMessage += `\n\nProject Context:\n${context.projectInfo}`
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Groq's fastest Llama 3.1 model
        messages: [
          { role: 'system', content: systemMessage },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Groq API error:', {
        status: response.status,
        statusText: response.statusText,
        error,
        apiKey: GROQ_API_KEY ? 'SET' : 'NOT SET'
      })
      return NextResponse.json(
        { error: `AI service error: ${response.status} - ${response.statusText}. ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices[0]?.message?.content || 'No response'

    console.log('Chat API success:', { messageLength: assistantMessage.length })

    return NextResponse.json({
      message: assistantMessage,
      usage: data.usage,
    })
  } catch (error: any) {
    console.error('Chat API error:', {
      message: error.message,
      stack: error.stack,
      error
    })
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}
