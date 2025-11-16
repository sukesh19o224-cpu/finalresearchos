'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, AlertTriangle, Info, TrendingUp, Zap, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  generateDataInsights,
  detectAnomaliesZScore,
  detectAnomaliesIQR,
  detectAnomaliesMovingAverage,
  getAIRecommendations,
  DataInsight,
  AnomalyDetectionResult,
} from '@/lib/ai/data-insights'
import { Skeleton } from '@/components/ui/skeleton'

interface AIInsightsPanelProps {
  xData: number[]
  yData: number[]
  context?: {
    type?: 'CV' | 'EIS' | 'CA' | 'CP' | 'LSV'
    xLabel?: string
    yLabel?: string
  }
}

export function AIInsightsPanel({ xData, yData, context }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<DataInsight[]>([])
  const [anomalies, setAnomalies] = useState<AnomalyDetectionResult | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [anomalyMethod, setAnomalyMethod] = useState<'zscore' | 'iqr' | 'moving_average'>(
    'zscore'
  )

  useEffect(() => {
    if (xData.length > 0 && yData.length > 0) {
      analyzeData()
    }
  }, [xData, yData, context])

  const analyzeData = async () => {
    setLoading(true)

    try {
      // Generate insights
      const dataInsights = generateDataInsights(xData, yData, context)
      setInsights(dataInsights)

      // Detect anomalies
      const anomalyResult = detectAnomaliesZScore(yData)
      setAnomalies(anomalyResult)

      // Get AI recommendations (optional, requires Ollama)
      if (dataInsights.length > 0) {
        const recommendations = await getAIRecommendations(
          context?.type || 'Unknown',
          dataInsights
        )
        setAiRecommendations(recommendations)
      }
    } catch (error) {
      console.error('Error analyzing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnomalyMethodChange = (method: 'zscore' | 'iqr' | 'moving_average') => {
    setAnomalyMethod(method)

    let result: AnomalyDetectionResult
    switch (method) {
      case 'zscore':
        result = detectAnomaliesZScore(yData)
        break
      case 'iqr':
        result = detectAnomaliesIQR(yData)
        break
      case 'moving_average':
        result = detectAnomaliesMovingAverage(yData)
        break
    }

    setAnomalies(result)
  }

  const getSeverityIcon = (severity: DataInsight['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: DataInsight['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20'
      case 'warning':
        return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'info':
        return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20'
    }
  }

  const getTypeIcon = (type: DataInsight['type']) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4" />
      case 'trend':
        return <TrendingUp className="h-4 w-4" />
      case 'pattern':
        return <Zap className="h-4 w-4" />
      case 'recommendation':
        return <Sparkles className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
        </div>
        <Button variant="outline" size="sm" onClick={analyzeData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="insights">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="insights">
            Insights ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="anomalies">
            Anomalies ({anomalies?.anomalies.length || 0})
          </TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-3">
          {insights.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No insights generated yet.</p>
              <p className="text-sm mt-2">Load data to see AI-powered analysis.</p>
            </Card>
          ) : (
            insights.map((insight, index) => (
              <Card key={index} className={`p-4 ${getSeverityColor(insight.severity)}`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getSeverityIcon(insight.severity)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(insight.type)}
                        <h4 className="font-semibold">{insight.title}</h4>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {(insight.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>

                    {insight.affectedDataPoints && insight.affectedDataPoints.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Affected points: {insight.affectedDataPoints.slice(0, 5).join(', ')}
                        {insight.affectedDataPoints.length > 5 &&
                          ` (+${insight.affectedDataPoints.length - 5} more)`}
                      </p>
                    )}

                    {insight.suggestion && (
                      <div className="mt-3 p-3 bg-background/50 rounded-md">
                        <p className="text-xs font-medium mb-1">Suggestion:</p>
                        <p className="text-sm">{insight.suggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={anomalyMethod === 'zscore' ? 'default' : 'outline'}
              onClick={() => handleAnomalyMethodChange('zscore')}
            >
              Z-Score
            </Button>
            <Button
              size="sm"
              variant={anomalyMethod === 'iqr' ? 'default' : 'outline'}
              onClick={() => handleAnomalyMethodChange('iqr')}
            >
              IQR
            </Button>
            <Button
              size="sm"
              variant={anomalyMethod === 'moving_average' ? 'default' : 'outline'}
              onClick={() => handleAnomalyMethodChange('moving_average')}
            >
              Moving Average
            </Button>
          </div>

          {anomalies && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Anomaly Detection Results</h4>
                  <Badge variant={anomalies.anomalies.length > 0 ? 'destructive' : 'default'}>
                    {anomalies.anomalies.length} anomalies
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Method</p>
                    <p className="font-medium capitalize">{anomalies.method.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Threshold</p>
                    <p className="font-medium">{anomalies.threshold.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Points</p>
                    <p className="font-medium">{yData.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Anomaly Rate</p>
                    <p className="font-medium">
                      {((anomalies.anomalies.length / yData.length) * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>

                {anomalies.anomalies.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Anomalous indices (first 20):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {anomalies.anomalies.slice(0, 20).map((idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {idx}
                        </Badge>
                      ))}
                      {anomalies.anomalies.length > 20 && (
                        <Badge variant="outline" className="text-xs">
                          +{anomalies.anomalies.length - 20} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card className="p-6">
            {aiRecommendations ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <h4 className="font-semibold">AI Recommendations</h4>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{aiRecommendations}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>AI recommendations unavailable</p>
                <p className="text-sm mt-2">
                  Ensure Ollama is running locally for AI-powered insights
                </p>
                <Button className="mt-4" variant="outline" onClick={analyzeData}>
                  Try Again
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
