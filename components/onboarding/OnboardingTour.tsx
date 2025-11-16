'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Rocket,
  FolderOpen,
  Upload,
  BarChart3,
  Zap,
  CheckCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

interface TourStep {
  title: string
  description: string
  icon: React.ReactNode
  target?: string
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to ElctrDc! 🎉',
    description: 'Your complete electrochemistry research operating system. Let\'s take a quick tour to get you started!',
    icon: <Rocket className="h-12 w-12 text-blue-600" />,
  },
  {
    title: 'Create Projects',
    description: 'Organize your research into projects. Each project can contain datasets, visualizations, notes, and more.',
    icon: <FolderOpen className="h-12 w-12 text-green-600" />,
  },
  {
    title: 'Upload Data',
    description: 'Upload electrochemistry data from BioLogic (.mpt), Gamry (.dta), or CSV files. We automatically detect techniques like CV, EIS, and Battery Cycling.',
    icon: <Upload className="h-12 w-12 text-purple-600" />,
  },
  {
    title: 'Visualize Results',
    description: 'Create beautiful, interactive plots with one click. Export as PNG, JPEG, or SVG for your publications.',
    icon: <BarChart3 className="h-12 w-12 text-orange-600" />,
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Work faster with keyboard shortcuts! Press ⌘K to open the command palette, or ? to see all shortcuts.',
    icon: <Zap className="h-12 w-12 text-yellow-600" />,
  },
  {
    title: 'You\'re All Set!',
    description: 'You\'re ready to start your electrochemistry research. Create your first project to begin!',
    icon: <CheckCircle className="h-12 w-12 text-green-600" />,
  },
]

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('elctrdc_tour_completed')
    if (!hasSeenTour) {
      // Show tour after a short delay
      setTimeout(() => setOpen(true), 1000)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('elctrdc_tour_completed', 'true')
    setOpen(false)
  }

  const handleComplete = () => {
    localStorage.setItem('elctrdc_tour_completed', 'true')
    setOpen(false)
  }

  const step = tourSteps[currentStep]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{step.title}</DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <Card className="border-0 shadow-none">
            <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20">
                {step.icon}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {step.description}
              </p>
            </CardContent>
          </Card>

          {/* Progress indicators */}
          <div className="flex justify-center space-x-2 mt-6">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-8 bg-blue-600'
                    : idx < currentStep
                    ? 'w-2 bg-blue-400'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep < tourSteps.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                'Get Started!'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
