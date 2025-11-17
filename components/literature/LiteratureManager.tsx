'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Plus,
  Search,
  Tag,
  FileText,
  Link as LinkIcon,
  Copy,
  X,
  Filter,
  Download,
  ExternalLink,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Paper {
  id: string
  title: string
  authors: string[]
  journal: string
  year: number
  doi?: string
  url?: string
  tags: string[]
  notes: string
  addedAt: Date
}

interface LiteratureManagerProps {
  projectId?: string
}

export function LiteratureManager({ projectId }: LiteratureManagerProps) {
  const [papers, setPapers] = useState<Paper[]>([
    {
      id: '1',
      title: 'Fundamentals of Electrochemical Impedance Spectroscopy',
      authors: ['Smith, J.', 'Johnson, A.'],
      journal: 'Journal of Electrochemical Science',
      year: 2023,
      doi: '10.1016/j.electacta.2023.142567',
      url: 'https://doi.org/10.1016/j.electacta.2023.142567',
      tags: ['EIS', 'fundamentals', 'review'],
      notes: 'Excellent overview of EIS theory and applications.',
      addedAt: new Date(Date.now() - 86400000),
    },
  ])

  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Form state
  const [newTitle, setNewTitle] = useState('')
  const [newAuthors, setNewAuthors] = useState('')
  const [newJournal, setNewJournal] = useState('')
  const [newYear, setNewYear] = useState('')
  const [newDoi, setNewDoi] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newTags, setNewTags] = useState('')
  const [newNotes, setNewNotes] = useState('')

  const { toast } = useToast()

  const addPaper = () => {
    if (!newTitle.trim() || !newAuthors.trim() || !newJournal.trim() || !newYear.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide title, authors, journal, and year.',
      })
      return
    }

    const paper: Paper = {
      id: Date.now().toString(),
      title: newTitle,
      authors: newAuthors.split(',').map((a) => a.trim()).filter((a) => a),
      journal: newJournal,
      year: parseInt(newYear),
      doi: newDoi || undefined,
      url: newUrl || undefined,
      tags: newTags.split(',').map((t) => t.trim()).filter((t) => t),
      notes: newNotes,
      addedAt: new Date(),
    }

    setPapers([paper, ...papers])
    resetForm()

    toast({
      title: 'Paper added',
      description: 'The paper has been added to your library.',
    })
  }

  const resetForm = () => {
    setNewTitle('')
    setNewAuthors('')
    setNewJournal('')
    setNewYear('')
    setNewDoi('')
    setNewUrl('')
    setNewTags('')
    setNewNotes('')
    setShowAddForm(false)
  }

  const deletePaper = (paperId: string) => {
    setPapers(papers.filter((p) => p.id !== paperId))
    if (selectedPaper?.id === paperId) {
      setSelectedPaper(null)
    }
    toast({
      title: 'Paper removed',
      description: 'The paper has been removed from your library.',
    })
  }

  const generateCitation = (paper: Paper, format: 'apa' | 'mla' | 'chicago' | 'bibtex') => {
    const authorsList = paper.authors.join(', ')
    let citation = ''

    switch (format) {
      case 'apa':
        citation = `${authorsList} (${paper.year}). ${paper.title}. ${paper.journal}${paper.doi ? `. https://doi.org/${paper.doi}` : ''}`
        break
      case 'mla':
        citation = `${authorsList}. "${paper.title}." ${paper.journal}, ${paper.year}${paper.doi ? `, doi:${paper.doi}` : ''}.`
        break
      case 'chicago':
        citation = `${authorsList}. "${paper.title}." ${paper.journal} (${paper.year})${paper.doi ? `. https://doi.org/${paper.doi}` : ''}.`
        break
      case 'bibtex':
        const key = paper.authors[0]?.split(',')[0]?.toLowerCase() + paper.year
        citation = `@article{${key},\n  title={${paper.title}},\n  author={${authorsList}},\n  journal={${paper.journal}},\n  year={${paper.year}}${paper.doi ? `,\n  doi={${paper.doi}}` : ''}\n}`
        break
    }

    navigator.clipboard.writeText(citation)
    toast({
      title: 'Citation copied',
      description: `${format.toUpperCase()} citation copied to clipboard.`,
    })
  }

  const allTags = Array.from(new Set(papers.flatMap((p) => p.tags)))

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      paper.journal.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tag) => paper.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Paper List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Literature Library
          </CardTitle>
          <CardDescription>{papers.length} papers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter by tags
                </p>
                {selectedTags.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTags([])}
                    className="h-auto py-0 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`inline-block px-2 py-1 text-xs rounded transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Button */}
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full"
            variant={showAddForm ? 'outline' : 'default'}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Paper'}
          </Button>

          {/* Papers List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 relative group ${
                    selectedPaper?.id === paper.id ? 'bg-blue-50 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedPaper(paper)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deletePaper(paper.id)
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="font-medium text-sm line-clamp-2 pr-6">{paper.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{paper.authors.join(', ')}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {paper.journal} ({paper.year})
                  </p>
                  {paper.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {paper.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredPapers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No papers found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Paper Details / Add Form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{showAddForm ? 'Add New Paper' : selectedPaper ? 'Paper Details' : 'Select a Paper'}</CardTitle>
        </CardHeader>
        <CardContent>
          {showAddForm ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Paper title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Authors * (comma-separated)</Label>
                  <Input
                    placeholder="Smith, J., Johnson, A."
                    value={newAuthors}
                    onChange={(e) => setNewAuthors(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Journal *</Label>
                  <Input
                    placeholder="Journal name"
                    value={newJournal}
                    onChange={(e) => setNewJournal(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Year *</Label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                  />
                </div>
                <div>
                  <Label>DOI (optional)</Label>
                  <Input
                    placeholder="10.1016/j.example.2024.12345"
                    value={newDoi}
                    onChange={(e) => setNewDoi(e.target.value)}
                  />
                </div>
                <div>
                  <Label>URL (optional)</Label>
                  <Input
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="EIS, fundamentals, review"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <textarea
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Add your notes about this paper..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={addPaper}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Paper
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : selectedPaper ? (
            <div className="space-y-6">
              {/* Paper Info */}
              <div>
                <h3 className="text-xl font-semibold mb-2">{selectedPaper.title}</h3>
                <p className="text-gray-700 mb-1">{selectedPaper.authors.join(', ')}</p>
                <p className="text-gray-600 text-sm">
                  {selectedPaper.journal}, {selectedPaper.year}
                </p>
              </div>

              {/* Links */}
              {(selectedPaper.doi || selectedPaper.url) && (
                <div className="flex space-x-2">
                  {selectedPaper.doi && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`https://doi.org/${selectedPaper.doi}`, '_blank')}
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      DOI
                    </Button>
                  )}
                  {selectedPaper.url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(selectedPaper.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Link
                    </Button>
                  )}
                </div>
              )}

              {/* Tags */}
              {selectedPaper.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPaper.tags.map((tag) => (
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

              {/* Notes */}
              {selectedPaper.notes && (
                <div>
                  <p className="text-sm font-medium mb-2">Notes</p>
                  <div className="bg-gray-50 p-4 rounded border">
                    <p className="text-sm whitespace-pre-wrap">{selectedPaper.notes}</p>
                  </div>
                </div>
              )}

              {/* Citations */}
              <div>
                <p className="text-sm font-medium mb-3">Generate Citation</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateCitation(selectedPaper, 'apa')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    APA
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateCitation(selectedPaper, 'mla')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    MLA
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateCitation(selectedPaper, 'chicago')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Chicago
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => generateCitation(selectedPaper, 'bibtex')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    BibTeX
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedPaper(null)}>
                  Back to Library
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">No Paper Selected</h3>
              <p className="text-sm mb-4">Select a paper from the list to view details</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Paper
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
