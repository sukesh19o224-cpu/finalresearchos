'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  FileText,
  Play,
  Copy,
  Star,
  Search,
  Filter,
  Zap,
  CheckCircle,
  Clock,
  Users,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ProtocolTemplate {
  id: string
  name: string
  description: string
  technique: string
  category: 'standard' | 'custom' | 'community'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  steps: number
  usageCount: number
  rating: number
  author: string
  tags: string[]
  parameters: {
    name: string
    value: string
    unit?: string
  }[]
}

const templates: ProtocolTemplate[] = [
  {
    id: '1',
    name: 'Standard CV Scan',
    description: 'Basic cyclic voltammetry for reversibility testing',
    technique: 'Cyclic Voltammetry',
    category: 'standard',
    difficulty: 'beginner',
    duration: '30 min',
    steps: 5,
    usageCount: 1247,
    rating: 4.8,
    author: 'ResearchOS Team',
    tags: ['CV', 'Quick', 'Standard'],
    parameters: [
      { name: 'Scan Rate', value: '100', unit: 'mV/s' },
      { name: 'Start Potential', value: '-0.5', unit: 'V' },
      { name: 'End Potential', value: '1.0', unit: 'V' },
      { name: 'Cycles', value: '3', unit: '' },
    ],
  },
  {
    id: '2',
    name: 'Battery Formation Protocol',
    description: 'Initial formation cycling for Li-ion cells',
    technique: 'Galvanostatic Cycling',
    category: 'standard',
    difficulty: 'intermediate',
    duration: '48 hours',
    steps: 8,
    usageCount: 856,
    rating: 4.9,
    author: 'Battery Research Lab',
    tags: ['Battery', 'Formation', 'Long-term'],
    parameters: [
      { name: 'C-Rate', value: '0.1', unit: 'C' },
      { name: 'Upper Voltage', value: '4.2', unit: 'V' },
      { name: 'Lower Voltage', value: '3.0', unit: 'V' },
      { name: 'Formation Cycles', value: '3', unit: '' },
    ],
  },
  {
    id: '3',
    name: 'EIS Full Spectrum',
    description: 'Complete impedance spectroscopy analysis',
    technique: 'EIS',
    category: 'standard',
    difficulty: 'intermediate',
    duration: '2 hours',
    steps: 6,
    usageCount: 634,
    rating: 4.7,
    author: 'ResearchOS Team',
    tags: ['EIS', 'Impedance', 'Full Range'],
    parameters: [
      { name: 'Frequency Range', value: '100kHz - 10mHz', unit: '' },
      { name: 'Amplitude', value: '10', unit: 'mV' },
      { name: 'Points per Decade', value: '10', unit: '' },
    ],
  },
  {
    id: '4',
    name: 'Fast Screening CV',
    description: 'High-throughput screening protocol',
    technique: 'Cyclic Voltammetry',
    category: 'custom',
    difficulty: 'advanced',
    duration: '15 min',
    steps: 4,
    usageCount: 423,
    rating: 4.6,
    author: 'Dr. Sarah Chen',
    tags: ['CV', 'Fast', 'Screening'],
    parameters: [
      { name: 'Scan Rate', value: '500', unit: 'mV/s' },
      { name: 'Window', value: '-1.0 to 1.0', unit: 'V' },
      { name: 'Cycles', value: '1', unit: '' },
    ],
  },
  {
    id: '5',
    name: 'Tafel Plot Analysis',
    description: 'Corrosion rate determination',
    technique: 'Tafel',
    category: 'community',
    difficulty: 'intermediate',
    duration: '45 min',
    steps: 7,
    usageCount: 289,
    rating: 4.5,
    author: 'Corrosion Lab MIT',
    tags: ['Tafel', 'Corrosion', 'Analysis'],
    parameters: [
      { name: 'Scan Rate', value: '0.5', unit: 'mV/s' },
      { name: 'Range', value: '±250', unit: 'mV vs OCP' },
    ],
  },
]

export function ProtocolTemplateLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ProtocolTemplate | null>(null)
  const { toast } = useToast()

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = !selectedCategory || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleUseTemplate = (template: ProtocolTemplate) => {
    toast({
      title: 'Protocol loaded',
      description: `${template.name} has been loaded. You can now customize parameters.`,
    })
    setSelectedTemplate(null)
  }

  const handleCloneTemplate = (template: ProtocolTemplate) => {
    toast({
      title: 'Protocol cloned',
      description: `Created a copy of ${template.name} in your custom protocols.`,
    })
  }

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  }

  const categoryColors = {
    standard: 'bg-blue-100 text-blue-800',
    custom: 'bg-purple-100 text-purple-800',
    community: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Protocol Template Library
          </CardTitle>
          <CardDescription>
            Standardized experimental protocols - Start experiments faster with proven methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search protocols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              <Button
                variant={selectedCategory === 'standard' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('standard')}
              >
                Standard
              </Button>
              <Button
                variant={selectedCategory === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('custom')}
              >
                Custom
              </Button>
              <Button
                variant={selectedCategory === 'community' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('community')}
              >
                Community
              </Button>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={categoryColors[template.category]} variant="outline">
                      {template.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {template.rating}
                    </div>
                  </div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <Badge className={difficultyColors[template.difficulty]} variant="outline">
                      {template.difficulty}
                    </Badge>
                    <span className="text-gray-600">{template.technique}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {template.usageCount}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Play className="h-3 w-3 mr-2" />
                        Use This Protocol
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{template.name}</DialogTitle>
                        <DialogDescription>{template.description}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Protocol Info */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Technique</p>
                            <p className="font-medium text-sm">{template.technique}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Duration</p>
                            <p className="font-medium text-sm">{template.duration}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Difficulty</p>
                            <Badge className={difficultyColors[template.difficulty]}>
                              {template.difficulty}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Steps</p>
                            <p className="font-medium text-sm">{template.steps} steps</p>
                          </div>
                        </div>

                        {/* Parameters */}
                        <div>
                          <h3 className="text-sm font-semibold mb-3">Parameters</h3>
                          <div className="space-y-2">
                            {template.parameters.map((param, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <span className="text-sm font-medium">{param.name}</span>
                                <div className="flex items-center gap-2">
                                  <Input
                                    defaultValue={param.value}
                                    className="w-24 h-8 text-sm"
                                  />
                                  {param.unit && (
                                    <span className="text-sm text-gray-600">{param.unit}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleUseTemplate(template)} className="flex-1">
                            <Play className="h-4 w-4 mr-2" />
                            Start Experiment
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleCloneTemplate(template)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Clone & Edit
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">No protocols found</p>
              <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
