'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  GitBranch,
  GitCommit,
  GitMerge,
  Clock,
  User,
  FileText,
  ArrowRight,
  RotateCcw,
  Plus,
  Check,
  AlertCircle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface Version {
  id: string
  version: string
  message: string
  author: string
  timestamp: Date
  changes: {
    added: number
    modified: number
    deleted: number
  }
  datasets: string[]
  tag?: string
}

interface DataVersionControlProps {
  projectId: string
}

export function DataVersionControl({ projectId }: DataVersionControlProps) {
  const [versions, setVersions] = useState<Version[]>([
    {
      id: '1',
      version: 'v1.2.0',
      message: 'Added baseline CV measurements and updated EIS data',
      author: 'You',
      timestamp: new Date(Date.now() - 3600000),
      changes: { added: 3, modified: 1, deleted: 0 },
      datasets: ['baseline_cv.csv', 'eis_data_corrected.csv', 'battery_cycle_1.csv'],
      tag: 'stable',
    },
    {
      id: '2',
      version: 'v1.1.0',
      message: 'Corrected calibration data and removed outliers',
      author: 'You',
      timestamp: new Date(Date.now() - 86400000),
      changes: { added: 1, modified: 2, deleted: 1 },
      datasets: ['calibration_fixed.csv', 'eis_data.csv'],
    },
    {
      id: '3',
      version: 'v1.0.0',
      message: 'Initial dataset upload',
      author: 'You',
      timestamp: new Date(Date.now() - 172800000),
      changes: { added: 5, modified: 0, deleted: 0 },
      datasets: ['cv_experiment_1.csv', 'cv_experiment_2.csv', 'eis_data.csv'],
      tag: 'initial',
    },
  ])

  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [commitMessage, setCommitMessage] = useState('')
  const { toast } = useToast()

  const createVersion = () => {
    if (!commitMessage.trim()) {
      toast({
        variant: 'destructive',
        title: 'Commit message required',
        description: 'Please provide a description of your changes.',
      })
      return
    }

    const newVersion: Version = {
      id: Date.now().toString(),
      version: `v${versions.length + 1}.0.0`,
      message: commitMessage,
      author: 'You',
      timestamp: new Date(),
      changes: { added: 2, modified: 1, deleted: 0 },
      datasets: ['new_data.csv', 'updated_analysis.csv'],
    }

    setVersions([newVersion, ...versions])
    setCommitMessage('')

    toast({
      title: 'Version created',
      description: `${newVersion.version} has been saved successfully.`,
    })
  }

  const revertToVersion = (version: Version) => {
    toast({
      title: 'Reverting to version',
      description: `Rolling back to ${version.version}...`,
    })

    setTimeout(() => {
      toast({
        title: 'Revert complete',
        description: `Project data restored to ${version.version}`,
      })
    }, 2000)
  }

  const compareVersions = (v1: Version, v2: Version) => {
    toast({
      title: 'Comparing versions',
      description: `Showing differences between ${v1.version} and ${v2.version}`,
    })
  }

  const currentVersion = versions[0]

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Version History */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitBranch className="h-5 w-5 mr-2" />
            Version History
          </CardTitle>
          <CardDescription>
            {versions.length} versions • Current: {currentVersion?.version}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status */}
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center space-x-2 mb-1">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Up to date</span>
            </div>
            <p className="text-xs text-green-700">All changes are committed</p>
          </div>

          {/* Create New Version */}
          <div className="space-y-2">
            <Input
              placeholder="Commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createVersion()}
            />
            <Button onClick={createVersion} className="w-full" size="sm">
              <GitCommit className="h-4 w-4 mr-2" />
              Create Version
            </Button>
          </div>

          {/* Version List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`relative p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedVersion?.id === version.id ? 'bg-blue-50 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  {/* Timeline Line */}
                  {index !== versions.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center relative z-10">
                      <GitCommit className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">{version.version}</span>
                        {version.tag && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            {version.tag}
                          </span>
                        )}
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                            current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 line-clamp-2 mb-2">
                        {version.message}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {version.author}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(version.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 text-xs">
                        {version.changes.added > 0 && (
                          <span className="text-green-600">+{version.changes.added}</span>
                        )}
                        {version.changes.modified > 0 && (
                          <span className="text-blue-600">~{version.changes.modified}</span>
                        )}
                        {version.changes.deleted > 0 && (
                          <span className="text-red-600">-{version.changes.deleted}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Version Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedVersion ? `Version ${selectedVersion.version}` : 'Version Details'}
          </CardTitle>
          <CardDescription>
            {selectedVersion
              ? 'View changes and manage this version'
              : 'Select a version to view details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedVersion ? (
            <div className="space-y-6">
              {/* Version Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedVersion.version}</h3>
                <p className="text-gray-700 mb-3">{selectedVersion.message}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {selectedVersion.author}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDate(selectedVersion.timestamp)}
                  </span>
                  {selectedVersion.tag && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {selectedVersion.tag}
                    </span>
                  )}
                </div>
              </div>

              {/* Changes Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Changes Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-2xl font-bold text-green-600">
                        {selectedVersion.changes.added}
                      </p>
                      <p className="text-xs text-green-700 mt-1">Added</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedVersion.changes.modified}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">Modified</p>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-2xl font-bold text-red-600">
                        {selectedVersion.changes.deleted}
                      </p>
                      <p className="text-xs text-red-700 mt-1">Deleted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Affected Datasets */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Affected Datasets ({selectedVersion.datasets.length})
                </h4>
                <div className="space-y-2">
                  {selectedVersion.datasets.map((dataset, index) => (
                    <div key={index} className="p-3 border rounded flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">{dataset}</span>
                      </div>
                      <Button size="sm" variant="ghost">
                        View
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => revertToVersion(selectedVersion)}
                  disabled={versions[0].id === selectedVersion.id}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Revert to This Version
                </Button>
                {selectedVersion.id !== versions[0].id && (
                  <Button
                    variant="outline"
                    onClick={() => compareVersions(versions[0], selectedVersion)}
                  >
                    <GitMerge className="h-4 w-4 mr-2" />
                    Compare with Current
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedVersion(null)}>
                  Back
                </Button>
              </div>

              {/* Warning for Revert */}
              {versions[0].id !== selectedVersion.id && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-900 font-medium">
                        Reverting to Previous Version
                      </p>
                      <p className="text-sm text-yellow-800 mt-1">
                        This will restore all datasets to their state in {selectedVersion.version}.
                        Current changes will be preserved in version history.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <GitBranch className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Version Selected</h3>
              <p className="text-sm mb-4">
                Select a version from the history to view details
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
