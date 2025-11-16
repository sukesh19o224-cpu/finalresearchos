'use client'

import React, { useState } from 'react'
import { FileText, Download, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PDFReportGenerator, ReportMetadata, ReportSection } from '@/lib/reports/pdf-generator'
import { useToast } from '@/components/ui/use-toast'

export function ReportGenerator() {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()

  const [metadata, setMetadata] = useState<ReportMetadata>({
    title: '',
    author: '',
    institution: '',
    projectName: '',
    description: '',
    date: new Date(),
  })

  const [sections, setSections] = useState<ReportSection[]>([])

  const handleGenerate = async () => {
    if (!metadata.title) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a report title',
      })
      return
    }

    setGenerating(true)

    try {
      const generator = new PDFReportGenerator()
      const pdfBlob = await generator.generateReport(metadata, sections)

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${metadata.title.replace(/\s+/g, '-')}-${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        variant: 'success',
        title: 'Report generated',
        description: 'Your PDF report has been downloaded',
      })

      setOpen(false)
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
      })
    } finally {
      setGenerating(false)
    }
  }

  const addSection = (type: ReportSection['type']) => {
    const newSection: ReportSection = { type }
    setSections([...sections, newSection])
  }

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  const updateSection = (index: number, updates: Partial<ReportSection>) => {
    const updated = [...sections]
    updated[index] = { ...updated[index], ...updates }
    setSections(updated)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate PDF Report</DialogTitle>
          <DialogDescription>
            Create a publication-ready report with your data, plots, and analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Metadata */}
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">Report Information</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Electrochemical Characterization of..."
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  placeholder="Your name"
                  value={metadata.author}
                  onChange={(e) => setMetadata({ ...metadata, author: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  placeholder="University/Organization"
                  value={metadata.institution}
                  onChange={(e) => setMetadata({ ...metadata, institution: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project Name</Label>
              <Input
                id="project"
                placeholder="Project name"
                value={metadata.projectName}
                onChange={(e) => setMetadata({ ...metadata, projectName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the research..."
                rows={3}
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              />
            </div>
          </Card>

          {/* Sections */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Report Sections</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addSection('title')}>
                  Title
                </Button>
                <Button size="sm" variant="outline" onClick={() => addSection('text')}>
                  Text
                </Button>
                <Button size="sm" variant="outline" onClick={() => addSection('table')}>
                  Table
                </Button>
                <Button size="sm" variant="outline" onClick={() => addSection('plot')}>
                  Plot
                </Button>
              </div>
            </div>

            {sections.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No sections added yet. Click the buttons above to add content to your report.
              </p>
            ) : (
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{section.type}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeSection(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {(section.type === 'title' ||
                      section.type === 'subtitle' ||
                      section.type === 'text') && (
                      <Textarea
                        placeholder={`Enter ${section.type} content...`}
                        value={section.content || ''}
                        onChange={(e) => updateSection(index, { content: e.target.value })}
                        rows={section.type === 'text' ? 4 : 2}
                      />
                    )}

                    {section.type === 'plot' && (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const reader = new FileReader()
                              reader.onload = (event) => {
                                updateSection(index, {
                                  image: event.target?.result as string,
                                })
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                        <Input
                          placeholder="Figure caption"
                          value={section.content || ''}
                          onChange={(e) => updateSection(index, { content: e.target.value })}
                        />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                'Generating...'
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
