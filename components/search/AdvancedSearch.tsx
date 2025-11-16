'use client'

import React, { useState } from 'react'
import { Search, X, Filter, Calendar, Tag, User, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export interface SearchFilters {
  query: string
  type?: 'project' | 'dataset' | 'page' | 'all'
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  researchType?: string
  fileFormat?: string
  status?: 'active' | 'archived' | 'all'
  sortBy?: 'relevance' | 'date' | 'name' | 'modified'
  sortOrder?: 'asc' | 'desc'
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  placeholder?: string
}

export function AdvancedSearch({ onSearch, placeholder = 'Search everything...' }: AdvancedSearchProps) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    status: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc',
  })
  const [activeTags, setActiveTags] = useState<string[]>([])

  const handleSearch = () => {
    onSearch({ ...filters, tags: activeTags })
    setOpen(false)
  }

  const handleQuickSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch({ query: filters.query, type: 'all' })
    }
  }

  const addTag = (tag: string) => {
    if (tag && !activeTags.includes(tag)) {
      setActiveTags([...activeTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setActiveTags(activeTags.filter((t) => t !== tag))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      status: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc',
    })
    setActiveTags([])
  }

  const researchTypes = [
    'Battery Research',
    'Fuel Cell',
    'Corrosion',
    'Electrocatalysis',
    'Sensor Development',
    'Other',
  ]

  const fileFormats = ['CSV', 'Excel', 'JSON', 'TXT', 'DTA', 'MPT']

  return (
    <div className="relative flex-1 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-9 pr-20"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          onKeyDown={handleQuickSearch}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Search & Filters</DialogTitle>
              <DialogDescription>
                Refine your search with powerful filters to find exactly what you need
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Search Query */}
              <div className="space-y-2">
                <Label htmlFor="search-query">Search Query</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search-query"
                    placeholder="Search for projects, datasets, pages..."
                    className="pl-9"
                    value={filters.query}
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type-filter">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Content Type
                  </Label>
                  <select
                    id="type-filter"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                  >
                    <option value="all">All Types</option>
                    <option value="project">Projects</option>
                    <option value="dataset">Datasets</option>
                    <option value="page">Pages</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">
                    <User className="inline h-4 w-4 mr-1" />
                    Status
                  </Label>
                  <select
                    id="status-filter"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date Range
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date-from" className="text-xs text-muted-foreground">
                      From
                    </Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-to" className="text-xs text-muted-foreground">
                      To
                    </Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Research Type */}
              <div className="space-y-2">
                <Label htmlFor="research-type">Research Type</Label>
                <select
                  id="research-type"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={filters.researchType || ''}
                  onChange={(e) => setFilters({ ...filters, researchType: e.target.value })}
                >
                  <option value="">All Research Types</option>
                  {researchTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Format */}
              <div className="space-y-2">
                <Label htmlFor="file-format">File Format</Label>
                <select
                  id="file-format"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={filters.fileFormat || ''}
                  onChange={(e) => setFilters({ ...filters, fileFormat: e.target.value })}
                >
                  <option value="">All Formats</option>
                  {fileFormats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">
                  <Tag className="inline h-4 w-4 mr-1" />
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add tag and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
                {activeTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {activeTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:bg-background/50 rounded-full"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort-by">Sort By</Label>
                  <select
                    id="sort-by"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="date">Date Created</option>
                    <option value="modified">Last Modified</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort-order">Order</Label>
                  <select
                    id="sort-order"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={filters.sortOrder}
                    onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as any })}
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSearch}>Apply Filters</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Filters Display */}
      {(activeTags.length > 0 || filters.type !== 'all' || filters.researchType) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.type !== 'all' && (
            <Badge variant="outline">Type: {filters.type}</Badge>
          )}
          {filters.researchType && (
            <Badge variant="outline">Research: {filters.researchType}</Badge>
          )}
          {activeTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
