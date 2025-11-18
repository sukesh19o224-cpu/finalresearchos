// AI-powered insights for datasets and plots
// Uses Groq Llama 3.1 8B for context-aware analysis

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export interface InsightsRequest {
  datasetSummary: {
    rows: number
    columns: string[]
    statistics?: Record<string, any>
  }
  plotInfo?: {
    type: string
    xAxis: string
    yAxis: string
    description: string
  }
  userQuery?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as InsightsRequest
    const { datasetSummary, plotInfo, userQuery } = body

    // Build context for AI
    let analysisPrompt = `Analyze this electrochemistry research data:\n\n`
    analysisPrompt += `Dataset: ${datasetSummary.rows} rows, Columns: ${datasetSummary.columns.join(', ')}\n`

    if (plotInfo) {
      analysisPrompt += `\nPlot: ${plotInfo.type} showing ${plotInfo.yAxis} vs ${plotInfo.xAxis}\n`
      analysisPrompt += `Description: ${plotInfo.description}\n`
    }

    if (userQuery) {
      analysisPrompt += `\nUser Question: ${userQuery}\n`
    }

    analysisPrompt += `\nProvide:
1. Key insights about the data/plot
2. Any anomalies or unusual patterns detected
3. Trend interpretation
4. Recommended next experimental steps
5. Potential issues or warnings

Be concise and actionable.`

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are an expert electrochemistry data analyst. Provide scientific insights, detect anomalies, and suggest next steps.',
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        temperature: 0.5, // Lower temperature for more factual analysis
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      insights: data.choices[0]?.message?.content || 'No insights generated',
      usage: data.usage,
    })
  } catch (error) {
    console.error('Insights API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
