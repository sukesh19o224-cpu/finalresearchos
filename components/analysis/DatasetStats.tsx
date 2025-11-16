'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Activity, Zap, Target } from 'lucide-react'

interface DatasetStatsProps {
  dataset: any
}

export function DatasetStats({ dataset }: DatasetStatsProps) {
  if (!dataset || !dataset.parsedData?.data) {
    return null
  }

  const { data } = dataset.parsedData
  const stats = calculateStats(data)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
            <Activity className="h-4 w-4 mr-2 text-blue-600" />
            Data Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">
            {data.columns.length} columns
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
            Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.range || 'N/A'}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.rangeLabel || 'First column'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
            <Target className="h-4 w-4 mr-2 text-purple-600" />
            Technique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dataset.technique}</div>
          <p className="text-xs text-gray-500 mt-1">
            {dataset.instrument || 'Unknown'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
            <Zap className="h-4 w-4 mr-2 text-orange-600" />
            File Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.fileSize}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.fileSizeBytes} bytes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function calculateStats(data: { columns: string[]; rows: any[][] }) {
  const totalPoints = data.rows.length * data.columns.length

  // Try to get range from first numeric column
  let range = null
  let rangeLabel = null

  if (data.rows.length > 0) {
    // Find first numeric column
    for (let colIdx = 0; colIdx < data.columns.length; colIdx++) {
      const values = data.rows
        .map((row) => row[colIdx])
        .filter((v) => v !== null && v !== undefined)
        .map((v) => Number(v))
        .filter((v) => !isNaN(v))

      if (values.length > 0) {
        const min = Math.min(...values)
        const max = Math.max(...values)
        range = `${min.toExponential(2)} - ${max.toExponential(2)}`
        rangeLabel = data.columns[colIdx]
        break
      }
    }
  }

  // Estimate file size from data
  const dataString = JSON.stringify(data)
  const bytes = new Blob([dataString]).size
  const fileSize = bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(2)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`

  return {
    totalPoints,
    range,
    rangeLabel,
    fileSize,
    fileSizeBytes: bytes,
  }
}
