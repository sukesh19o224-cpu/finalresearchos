import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Call Groq API with Llama 3.1
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a professional scientific writing assistant. Your task is to rephrase research text while preserving its exact meaning, technical accuracy, and key terminology. Generate 3 different variations with these tones: 1) Professional/Formal, 2) Clear/Concise, 3) Technical/Detailed. Keep all scientific terms, numbers, and citations unchanged. Output as a JSON array with objects containing "tone" and "text" fields.'
          },
          {
            role: 'user',
            content: `Rephrase this research text in 3 different ways:\n\n${text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    })

    if (!groqResponse.ok) {
      const error = await groqResponse.text()
      console.error('Groq API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate rephrased text' },
        { status: 500 }
      )
    }

    const data = await groqResponse.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    // Parse JSON response
    let variations
    try {
      const parsed = JSON.parse(content)
      variations = parsed.variations || parsed
    } catch {
      // Fallback: If not JSON, split by numbered list
      const lines = content.split(/\d+\)\s+/).filter(Boolean)
      variations = [
        { tone: 'Professional', text: lines[0]?.trim() || content },
        { tone: 'Concise', text: lines[1]?.trim() || content },
        { tone: 'Technical', text: lines[2]?.trim() || content }
      ]
    }

    return NextResponse.json({
      original: text,
      variations: Array.isArray(variations) ? variations : [
        { tone: 'Professional', text: content },
        { tone: 'Concise', text: content },
        { tone: 'Technical', text: content }
      ]
    })

  } catch (error) {
    console.error('Rephrase API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
