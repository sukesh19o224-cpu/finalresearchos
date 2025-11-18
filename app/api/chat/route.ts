// Groq API Integration for Llama 3.1 8B
// Vercel Edge Function compatible

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge' // Use Vercel Edge Runtime for low latency

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
    const body = await req.json() as GroqChatRequest
    const { messages, context } = body

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
      console.error('Groq API error:', error)
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      message: data.choices[0]?.message?.content || 'No response',
      usage: data.usage,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
