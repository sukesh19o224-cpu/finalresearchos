'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  Plus,
  X,
  Download,
  Upload,
  Copy,
  RefreshCw,
  Zap,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ChecklistItem {
  id: string
  text: string
  category: string
  critical: boolean
  completed: boolean
  notes?: string
}

interface ChecklistTemplate {
  id: string
  name: string
  technique: string
  items: number
  completionRate: number
  lastUsed?: Date
}

// Solves: Missing critical metadata that causes reproducibility failures
// Prevents "Harvard vs Berkeley" scenarios where critical steps weren't documented
export function ExperimentChecklistGenerator({ experimentId }: { experimentId?: string }) {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [customItems, setCustomItems] = useState<string>('')
  const { toast } = useToast()

  const templates: ChecklistTemplate[] = [
    {
      id: 'cv',
      name: 'Cyclic Voltammetry Complete',
      technique: 'CV',
      items: 18,
      completionRate: 0,
    },
    {
      id: 'eis',
      name: 'EIS Measurement Protocol',
      technique: 'EIS',
      items: 22,
      completionRate: 0,
    },
    {
      id: 'battery',
      name: 'Battery Formation & Cycling',
      technique: 'Battery',
      items: 25,
      completionRate: 0,
    },
    {
      id: 'general',
      name: 'General Electrochemistry',
      technique: 'General',
      items: 15,
      completionRate: 0,
    },
  ]

  const templateChecklists: Record<string, ChecklistItem[]> = {
    cv: [
      // Pre-experiment
      { id: '1', text: 'Working electrode cleaned and polished', category: 'Preparation', critical: true, completed: false },
      { id: '2', text: 'Reference electrode verified (Ag/AgCl, SCE, etc.)', category: 'Preparation', critical: true, completed: false },
      { id: '3', text: 'Counter electrode prepared', category: 'Preparation', critical: false, completed: false },
      { id: '4', text: 'Electrolyte solution prepared at correct concentration', category: 'Preparation', critical: true, completed: false },
      { id: '5', text: 'Solution pH measured and recorded', category: 'Preparation', critical: false, completed: false },
      { id: '6', text: 'Degassing performed (N2/Ar purge for X minutes)', category: 'Preparation', critical: true, completed: false },

      // During experiment
      { id: '7', text: 'Temperature recorded and maintained', category: 'Conditions', critical: true, completed: false },
      { id: '8', text: 'Scan rate(s) documented', category: 'Conditions', critical: true, completed: false },
      { id: '9', text: 'Potential window (start/end/vertex) recorded', category: 'Conditions', critical: true, completed: false },
      { id: '10', text: 'Number of cycles completed', category: 'Conditions', critical: true, completed: false },
      { id: '11', text: 'Mixing method documented (shaking/stirring/none)', category: 'Conditions', critical: true, completed: false },
      { id: '12', text: 'Stirring speed recorded (if applicable)', category: 'Conditions', critical: true, completed: false },

      // Post-experiment
      { id: '13', text: 'Instrument model & firmware version recorded', category: 'Documentation', critical: false, completed: false },
      { id: '14', text: 'Last calibration date verified', category: 'Documentation', critical: true, completed: false },
      { id: '15', text: 'Data file backed up', category: 'Documentation', critical: true, completed: false },
      { id: '16', text: 'Baseline/background measurement taken', category: 'Documentation', critical: false, completed: false },
      { id: '17', text: 'Photos of setup captured', category: 'Documentation', critical: false, completed: false },
      { id: '18', text: 'Lab notebook entry completed with all metadata', category: 'Documentation', critical: true, completed: false },
    ],
    eis: [
      { id: '1', text: 'Cell impedance measured at open circuit', category: 'Preparation', critical: true, completed: false },
      { id: '2', text: 'Frequency range selected (high to low)', category: 'Preparation', critical: true, completed: false },
      { id: '3', text: 'AC amplitude chosen (typically 5-10 mV)', category: 'Preparation', critical: true, completed: false },
      { id: '4', text: 'Working electrode area measured/calculated', category: 'Preparation', critical: true, completed: false },
      { id: '5', text: 'System stabilized at DC bias', category: 'Preparation', critical: true, completed: false },
      { id: '6', text: 'Cables shielded to reduce noise', category: 'Setup', critical: false, completed: false },
      { id: '7', text: 'Faraday cage used if available', category: 'Setup', critical: false, completed: false },
      { id: '8', text: 'Temperature controlled and stable', category: 'Conditions', critical: true, completed: false },
      { id: '9', text: 'Points per decade selected', category: 'Conditions', critical: false, completed: false },
      { id: '10', text: 'Integration time per frequency set', category: 'Conditions', critical: false, completed: false },
      { id: '11', text: 'Kramers-Kronig validation passed', category: 'Quality Check', critical: true, completed: false },
      { id: '12', text: 'Nyquist plot looks reasonable', category: 'Quality Check', critical: true, completed: false },
      { id: '13', text: 'Bode plot phase < 90°', category: 'Quality Check', critical: false, completed: false },
      { id: '14', text: 'Repeat measurement for reproducibility', category: 'Quality Check', critical: true, completed: false },
      { id: '15', text: 'Equivalent circuit model selected', category: 'Analysis', critical: false, completed: false },
      { id: '16', text: 'Fitting chi-squared value acceptable', category: 'Analysis', critical: false, completed: false },
      { id: '17', text: 'Physical meaning of circuit elements verified', category: 'Analysis', critical: false, completed: false },
      { id: '18', text: 'Data exported with full frequency range', category: 'Documentation', critical: true, completed: false },
      { id: '19', text: 'Instrument settings exported', category: 'Documentation', critical: true, completed: false },
      { id: '20', text: 'Metadata JSON created', category: 'Documentation', critical: true, completed: false },
      { id: '21', text: 'Version controlled (Git/backup)', category: 'Documentation', critical: true, completed: false },
      { id: '22', text: 'Lab notebook updated', category: 'Documentation', critical: true, completed: false },
    ],
  }

  const loadTemplate = (templateId: string) => {
    const items = templateChecklists[templateId] || templateChecklists.cv
    setChecklist(items)
    setActiveTemplate(templateId)
    toast({
      title: 'Template loaded',
      description: `${items.length} checklist items ready`,
    })
  }

  const toggleItem = (itemId: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const addCustomItem = () => {
    if (!customItems.trim()) return

    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: customItems,
      category: 'Custom',
      critical: false,
      completed: false,
    }

    setChecklist([...checklist, newItem])
    setCustomItems('')
  }

  const removeItem = (itemId: string) => {
    setChecklist(checklist.filter((item) => item.id !== itemId))
  }

  const exportChecklist = () => {
    const data = {
      timestamp: new Date().toISOString(),
      template: activeTemplate,
      completeness: calculateCompletion(),
      items: checklist,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `checklist_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Checklist exported',
      description: 'Saved as JSON with completion status',
    })
  }

  const calculateCompletion = () => {
    if (checklist.length === 0) return 0
    const completed = checklist.filter((item) => item.completed).length
    return Math.round((completed / checklist.length) * 100)
  }

  const getCriticalMissing = () => {
    return checklist.filter((item) => item.critical && !item.completed)
  }

  const completion = calculateCompletion()
  const criticalMissing = getCriticalMissing()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Experiment Checklist Generator
            </CardTitle>
            <CardDescription>
              Never miss critical steps - Prevent reproducibility failures
            </CardDescription>
          </div>
          {activeTemplate && (
            <Badge
              variant="outline"
              className={
                completion === 100
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : completion >= 70
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                  : 'bg-red-50 text-red-700 border-red-300'
              }
            >
              {completion}% Complete
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!activeTemplate ? (
          <div>
            <h3 className="text-sm font-semibold mb-3">Choose Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template.id)}
                  className="p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{template.technique}</Badge>
                    <span className="text-xs text-gray-500">{template.items} items</span>
                  </div>
                  <p className="font-medium text-sm">{template.name}</p>
                  {template.lastUsed && (
                    <p className="text-xs text-gray-600 mt-1">
                      Last used: {template.lastUsed.toLocaleDateString()}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Alert for critical missing */}
            {criticalMissing.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900 text-sm">
                      {criticalMissing.length} critical step{criticalMissing.length > 1 ? 's' : ''} incomplete
                    </p>
                    <p className="text-red-700 text-xs mt-1">
                      Complete these before proceeding to ensure reproducibility
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Checklist by category */}
            <div className="space-y-4">
              {['Preparation', 'Setup', 'Conditions', 'Quality Check', 'Analysis', 'Documentation', 'Custom'].map((category) => {
                const categoryItems = checklist.filter((item) => item.category === category)
                if (categoryItems.length === 0) return null

                const categoryComplete = categoryItems.filter((item) => item.completed).length
                const categoryTotal = categoryItems.length

                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">{category}</h3>
                      <Badge variant="outline" className="text-xs">
                        {categoryComplete}/{categoryTotal}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {categoryItems.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 border rounded-lg transition-colors ${
                            item.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() => toggleItem(item.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm ${
                                    item.completed ? 'line-through text-gray-600' : 'text-gray-900'
                                  }`}
                                >
                                  {item.text}
                                </p>
                                {item.critical && (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                                    Critical
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {category === 'Custom' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add custom item */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Add Custom Step</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Check pump flow rate is 1.5 mL/min"
                  value={customItems}
                  onChange={(e) => setCustomItems(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
                />
                <Button onClick={addCustomItem} disabled={!customItems.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button onClick={exportChecklist}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" onClick={() => setActiveTemplate(null)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                New Checklist
              </Button>
              {completion === 100 && (
                <div className="ml-auto flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">All steps complete!</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ClipboardCheck className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-purple-900 mb-1">Why Checklists Matter</p>
              <ul className="text-purple-700 text-xs space-y-1">
                <li>• Harvard & Berkeley couldn't reproduce results - missing "mixing method" metadata</li>
                <li>• Critical steps like calibration date, temperature, pH often forgotten</li>
                <li>• Prevents $28B/year wasted on non-reproducible research</li>
                <li>• Required for publication, GLP compliance, patent applications</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
