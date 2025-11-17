'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookOpen, Plus, Lock, Calendar, Tag, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface NotebookEntry {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  locked: boolean
  author: string
}

interface LabNotebookProps {
  projectId: string
}

export function LabNotebook({ projectId }: LabNotebookProps) {
  const [entries, setEntries] = useState<NotebookEntry[]>([
    {
      id: '1',
      title: 'Initial Setup',
      content: 'Started new electrochemistry research project. Configured equipment and prepared samples.',
      tags: ['setup', 'planning'],
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
      locked: true,
      author: 'You',
    },
  ])

  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<NotebookEntry | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  const addEntry = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide both title and content.',
      })
      return
    }

    const entry: NotebookEntry = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      tags: newTags.split(',').map((t) => t.trim()).filter((t) => t),
      createdAt: new Date(),
      updatedAt: new Date(),
      locked: false,
      author: 'You',
    }

    setEntries([entry, ...entries])
    setNewTitle('')
    setNewContent('')
    setNewTags('')

    toast({
      title: 'Entry added',
      description: 'Your lab notebook entry has been recorded.',
    })
  }

  const lockEntry = (entryId: string) => {
    setEntries(
      entries.map((e) =>
        e.id === entryId ? { ...e, locked: true, updatedAt: new Date() } : e
      )
    )

    toast({
      title: 'Entry locked',
      description: 'This entry is now timestamped and cannot be edited.',
    })
  }

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Entry List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Lab Notebook
          </CardTitle>
          <CardDescription>
            Digital lab notebook with timestamps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Entries */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedEntry?.id === entry.id ? 'bg-blue-50 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">{entry.title}</p>
                    {entry.locked && <Lock className="h-3 w-3 text-gray-400" />}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                    {entry.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Entry Details / New Entry */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedEntry ? 'Entry Details' : 'New Entry'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedEntry ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedEntry.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created: {formatDate(selectedEntry.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Updated: {formatDate(selectedEntry.updatedAt)}
                  </span>
                  {selectedEntry.locked && (
                    <span className="flex items-center text-blue-600">
                      <Lock className="h-4 w-4 mr-1" />
                      Locked
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded border">
                <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
              </div>

              {selectedEntry.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex justify-between">
                <Button variant="outline" onClick={() => setSelectedEntry(null)}>
                  Back to Entries
                </Button>
                {!selectedEntry.locked && (
                  <Button onClick={() => lockEntry(selectedEntry.id)}>
                    <Lock className="h-4 w-4 mr-2" />
                    Lock Entry (Timestamp)
                  </Button>
                )}
              </div>

              {selectedEntry.locked && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <p className="text-sm text-blue-900">
                    <Lock className="h-4 w-4 inline mr-1" />
                    <strong>This entry is locked and timestamped.</strong> It cannot be edited,
                    providing a verifiable record for research integrity.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Entry Title *</label>
                <Input
                  placeholder="e.g., CV Experiment #1"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <textarea
                  className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Describe your experiment, observations, results..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <Input
                  placeholder="e.g., experiment, CV, baseline (comma-separated)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                <p className="text-sm text-yellow-900">
                  <strong>Note:</strong> Once you lock an entry, it will be timestamped and
                  cannot be edited. This ensures research integrity and compliance with lab
                  notebook standards.
                </p>
              </div>

              <Button onClick={addEntry} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
