'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Beaker,
  Battery,
  Zap,
  FileText,
  X,
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  features: string[]
}

interface ProjectTemplatesModalProps {
  open: boolean
  onClose: () => void
}

export function ProjectTemplatesModal({ open, onClose }: ProjectTemplatesModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const templates: Template[] = [
    {
      id: 'cv',
      name: 'Cyclic Voltammetry Study',
      description: 'Standard CV experiments with data analysis',
      icon: Zap,
      color: 'blue',
      features: ['CV protocols', 'Peak analysis', 'Electroactive species'],
    },
    {
      id: 'battery',
      name: 'Battery Research',
      description: 'Battery testing, cycling, and characterization',
      icon: Battery,
      color: 'green',
      features: ['Charge/discharge cycles', 'Capacity tracking', 'Impedance'],
    },
    {
      id: 'eis',
      name: 'EIS Analysis',
      description: 'Electrochemical Impedance Spectroscopy',
      icon: Beaker,
      color: 'purple',
      features: ['Nyquist plots', 'Bode plots', 'Circuit fitting'],
    },
    {
      id: 'blank',
      name: 'Blank Project',
      description: 'Start from scratch with no template',
      icon: FileText,
      color: 'gray',
      features: ['Full customization', 'All tools available'],
    },
  ]

  const handleCreate = () => {
    if (selectedTemplate) {
      // Navigate to create project with template
      window.location.href = `/projects/new?template=${selectedTemplate}`
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold">Choose a Project Template</h2>
            <p className="text-gray-600 mt-1">Select a template to get started quickly</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => {
            const Icon = template.icon
            const isSelected = selectedTemplate === template.id

            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  isSelected
                    ? `border-${template.color}-500 bg-${template.color}-50 ring-2 ring-${template.color}-200`
                    : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      template.color === 'blue' ? 'bg-blue-100' :
                      template.color === 'green' ? 'bg-green-100' :
                      template.color === 'purple' ? 'bg-purple-100' :
                      'bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${
                      template.color === 'blue' ? 'text-blue-600' :
                      template.color === 'green' ? 'text-green-600' :
                      template.color === 'purple' ? 'text-purple-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 sticky bottom-0 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!selectedTemplate}>
            Create Project
          </Button>
        </div>
      </div>
    </div>
  )
}
