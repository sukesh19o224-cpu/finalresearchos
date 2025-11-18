// Plot generation API using Plotly
// Vercel-compatible serverless function

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs' // Need Node.js for Plotly

export interface PlotRequest {
  data: {
    x: number[] | string[]
    y: number[]
    name?: string
  }[]
  layout: {
    title: string
    xaxis: { title: string }
    yaxis: { title: string }
  }
  type: 'line' | 'scatter' | 'bar' | 'histogram' | 'box'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PlotRequest

    // Return Plotly configuration
    // Client will render using react-plotly.js
    return NextResponse.json({
      data: body.data.map(trace => ({
        ...trace,
        type: body.type,
        mode: body.type === 'scatter' ? 'markers' : undefined,
      })),
      layout: {
        ...body.layout,
        autosize: true,
        margin: { l: 50, r: 50, t: 50, b: 50 },
      },
    })
  } catch (error) {
    console.error('Plot generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate plot' },
      { status: 500 }
    )
  }
}
