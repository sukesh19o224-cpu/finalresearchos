'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Loader2,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  FileText,
} from 'lucide-react'
import Papa from 'papaparse'

interface Insights {
  summary: string
  keyInsights: string[]
  anomalies: string[]
  trends: string[]
  nextSteps: string[]
  warnings: string[]
}

export function AIInsightsTab() {
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [datasetInfo, setDatasetInfo] = useState<{
    filename: string
    rows: number
    columns: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setInsights(null)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string

      Papa.parse(text, {
        complete: async (result) => {
          if (result.data && result.data.length > 0) {
            const parsedData = result.data as string[][]
            const headers = parsedData[0] || []
            const data = parsedData.slice(1)

            const info = {
              filename: file.name,
              rows: data.length,
              columns: headers,
            }

            setDatasetInfo(info)
            setLoading(false)

            // Auto-analyze after loading
            await analyzeData(info, data, headers)
          } else {
            setLoading(false)
          }
        },
        error: () => {
          setLoading(false)
          alert('Failed to parse CSV file')
        },
      })
    }

    reader.readAsText(file)
  }

  const analyzeData = async (
    info: { filename: string; rows: number; columns: string[] },
    data: string[][],
    headers: string[]
  ) => {
    setAnalyzing(true)

    try {
      // Prepare dataset summary
      const datasetSummary = {
        filename: info.filename,
        rows: info.rows,
        columns: headers,
        sampleData: data.slice(0, 5), // First 5 rows
      }

      // Call insights API
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetSummary,
          plotInfo: null,
          userQuery: 'Provide comprehensive analysis of this electrochemistry dataset',
        }),
      })

      if (!response.ok) throw new Error('Failed to generate insights')

      const result = await response.json()

      // Parse the insights from the AI response
      const aiInsights = parseAIInsights(result.insights)
      setInsights(aiInsights)
    } catch (error) {
      console.error('Insights error:', error)
      alert('Failed to generate insights')
    } finally {
      setAnalyzing(false)
    }
  }

  const parseAIInsights = (text: string): Insights => {
    // Simple parsing logic - in production, you'd want more robust parsing
    const lines = text.split('\n').filter(line => line.trim())

    return {
      summary: lines[0] || 'Analysis complete',
      keyInsights: lines.filter(l => l.includes('insight') || l.includes('•')).slice(0, 4),
      anomalies: lines.filter(l => l.toLowerCase().includes('anomal') || l.toLowerCase().includes('outlier')).slice(0, 3),
      trends: lines.filter(l => l.toLowerCase().includes('trend') || l.toLowerCase().includes('pattern')).slice(0, 3),
      nextSteps: lines.filter(l => l.toLowerCase().includes('recommend') || l.toLowerCase().includes('next')).slice(0, 4),
      warnings: lines.filter(l => l.toLowerCase().includes('warning') || l.toLowerCase().includes('caution')).slice(0, 2),
    }
  }

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">AI-Powered Insights</h1>
        <p className="text-gray-600">
          Upload your dataset to get intelligent analysis, anomaly detection, and recommendations
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || analyzing}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Loading Dataset...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Dataset for Analysis
                </>
              )}
            </Button>

            {datasetInfo && (
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{datasetInfo.filename}</p>
                  <p className="text-sm text-gray-600">
                    {datasetInfo.rows} rows × {datasetInfo.columns.length} columns
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analyzing State */}
      {analyzing && (
        <Card className="mb-6">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Analyzing Your Data</h3>
            <p className="text-gray-600">AI is processing your dataset...</p>
          </CardContent>
        </Card>
      )}

      {/* Insights Display */}
      {insights && !analyzing && (
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{insights.summary}</p>
            </CardContent>
          </Card>

          {/* Key Insights */}
          {insights.keyInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.keyInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">
                        {idx + 1}
                      </Badge>
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Anomalies */}
          {insights.anomalies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Anomalies Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.anomalies.map((anomaly, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">⚠</span>
                      <span className="text-gray-700">{anomaly}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Trends */}
          {insights.trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Trends Identified
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.trends.map((trend, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">📈</span>
                      <span className="text-gray-700">{trend}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {insights.nextSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Recommended Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">
                        {idx + 1}
                      </Badge>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Warnings */}
          {insights.warnings.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertTriangle className="h-5 w-5" />
                  Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {insights.warnings.map((warning, idx) => (
                    <li key={idx} className="text-red-900">
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!datasetInfo && !loading && !analyzing && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold mb-2">No Data Loaded</h3>
            <p className="text-sm">
              Upload a dataset to receive AI-powered insights and recommendations
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
