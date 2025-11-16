'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { projectTemplates, type ProjectTemplate } from '@/lib/project-templates'
import { ArrowLeft, Check } from 'lucide-react'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState<'template' | 'details'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setStep('details')
    // Pre-fill title and description
    setTitle(`New ${template.name} Project`)
    setDescription(template.description)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || undefined,
          researchType: selectedTemplate?.researchType || 'Other',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create project')
      }

      // TODO: Create default pages and tags from template
      // This would require additional API endpoints

      toast({
        variant: 'success',
        title: 'Project created!',
        description: `${title} has been successfully created.`,
      })

      router.push(`/dashboard/projects/${data.project.id}`)
    } catch (err: any) {
      setError(err.message)
      toast({
        variant: 'destructive',
        title: 'Failed to create project',
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  if (step === 'template') {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
          <p className="text-gray-600">
            Choose a template to get started quickly, or start from scratch
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectTemplates.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all group"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-4xl mb-2">{template.icon}</div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Check className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription className="min-h-[3rem]">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Includes:</p>
                  <ul className="text-xs space-y-1">
                    <li>• {template.defaultStructure.pages.length} pre-configured pages</li>
                    <li>• {template.defaultStructure.tags.length} suggested tags</li>
                    <li>• Best practices for {template.researchType}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => setStep('template')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>
        <h1 className="text-3xl font-bold mb-2">Project Details</h1>
        <p className="text-gray-600">
          Using template: <strong>{selectedTemplate?.name}</strong> {selectedTemplate?.icon}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>
            Customize your project details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Li-ion Battery Degradation Study"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Describe the goals and scope of your research..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                <strong>This template includes:</strong>
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {selectedTemplate?.defaultStructure.pages.map((page, idx) => (
                  <li key={idx}>• Page: "{page.title}"</li>
                ))}
                {selectedTemplate && selectedTemplate.defaultStructure.tags.length > 0 && (
                  <li>• Tags: {selectedTemplate.defaultStructure.tags.join(', ')}</li>
                )}
              </ul>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('template')}
              >
                Back
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
