'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, FolderKanban, Database, FileText, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  id: string
  title: string
  type: 'project' | 'dataset' | 'visualization' | 'file'
  description?: string
  url: string
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const icons = {
    project: FolderKanban,
    dataset: Database,
    visualization: TrendingUp,
    file: FileText,
  }

  const typeColors = {
    project: 'bg-blue-100 text-blue-800',
    dataset: 'bg-green-100 text-green-800',
    visualization: 'bg-purple-100 text-purple-800',
    file: 'bg-orange-100 text-orange-800',
  }

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)

    // Simulate API call - replace with actual search API
    await new Promise(resolve => setTimeout(resolve, 300))

    const mockResults: SearchResult[] = ([
      {
        id: '1',
        title: 'Battery Cycling Project',
        type: 'project' as const,
        description: 'Li-ion battery performance study',
        url: '/dashboard/projects/1',
      },
      {
        id: '2',
        title: 'CV_sample_01.csv',
        type: 'dataset' as const,
        description: 'Cyclic voltammetry data',
        url: '/dashboard/projects/1',
      },
      {
        id: '3',
        title: 'Nyquist Plot Analysis',
        type: 'visualization' as const,
        description: 'EIS impedance analysis',
        url: '/dashboard/projects/1',
      },
    ] as SearchResult[]).filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    setResults(mockResults)
    setIsSearching(false)
  }, [])

  useEffect(() => {
    const debounce = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, performSearch])

  const handleSelectResult = (result: SearchResult) => {
    onOpenChange(false)
    router.push(result.url)
    setQuery('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 mr-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, datasets, visualizations..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {isSearching ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result) => {
                const Icon = icons[result.type]
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-xs text-gray-500 truncate">{result.description}</p>
                      )}
                    </div>
                    <Badge className={typeColors[result.type]}>
                      {result.type}
                    </Badge>
                  </button>
                )
              })}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-gray-500">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">Start typing to search...</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">Recent</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="font-medium">Favorites</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-2 px-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 rounded">↑↓</kbd>
            <span>Navigate</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-100 rounded">ESC</kbd>
            <span>Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
