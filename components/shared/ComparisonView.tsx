'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeftRight, X } from 'lucide-react'

interface ComparisonViewProps {
  datasets: any[]
  onClose: () => void
}

export function ComparisonView({ datasets, onClose }: ComparisonViewProps) {
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([])

  const toggleDataset = (id: string) => {
    if (selectedDatasets.includes(id)) {
      setSelectedDatasets(selectedDatasets.filter((d) => d !== id))
    } else {
      if (selectedDatasets.length < 4) {
        setSelectedDatasets([...selectedDatasets, id])
      }
    }
  }

  const selected = datasets.filter((d) => selectedDatasets.includes(d.id))

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <ArrowLeftRight className="h-6 w-6 mr-2" />
          Compare Datasets
        </h2>
        <Button variant="ghost" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Dataset Selection Sidebar */}
        <div className="w-64 border-r p-4 overflow-y-auto">
          <h3 className="font-semibold mb-3">Select Datasets (max 4)</h3>
          <div className="space-y-2">
            {datasets.map((dataset) => (
              <div key={dataset.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedDatasets.includes(dataset.id)}
                  onCheckedChange={() => toggleDataset(dataset.id)}
                  disabled={
                    !selectedDatasets.includes(dataset.id) &&
                    selectedDatasets.length >= 4
                  }
                />
                <label className="text-sm cursor-pointer flex-1">
                  {dataset.name}
                  <span className="text-xs text-gray-500 block">
                    {dataset.technique}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {selected.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <ArrowLeftRight className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p>Select datasets from the sidebar to compare</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selected.map((dataset) => (
                <Card key={dataset.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{dataset.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Technique:</dt>
                        <dd className="font-medium">{dataset.technique}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Instrument:</dt>
                        <dd className="font-medium">{dataset.instrument}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Rows:</dt>
                        <dd className="font-medium">{dataset.rowCount}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Columns:</dt>
                        <dd className="font-medium">{dataset.columnCount}</dd>
                      </div>
                      {dataset.parsedData?.metadata && (
                        <div className="pt-2 border-t">
                          <dt className="text-gray-600 mb-1">Metadata:</dt>
                          <dd className="text-xs font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {JSON.stringify(dataset.parsedData.metadata, null, 2).slice(
                              0,
                              200
                            )}
                            ...
                          </dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
