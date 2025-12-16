'use client'

import React, { useState } from 'react'
import { X, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RephraseVariation {
  tone: string
  text: string
}

interface RephraseModalProps {
  isOpen: boolean
  onClose: () => void
  originalText: string
  onReplace: (newText: string) => void
}

export function RephraseModal({ isOpen, onClose, originalText, onReplace }: RephraseModalProps) {
  const [variations, setVariations] = useState<RephraseVariation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Fetch variations when modal opens
  React.useEffect(() => {
    if (isOpen && originalText && variations.length === 0) {
      fetchVariations()
    }
  }, [isOpen, originalText])

  const fetchVariations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/rephrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: originalText }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate variations')
      }

      const data = await response.json()
      setVariations(data.variations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReplace = () => {
    if (selectedIndex !== null && variations[selectedIndex]) {
      onReplace(variations[selectedIndex].text)
      handleClose()
    }
  }

  const handleClose = () => {
    setVariations([])
    setSelectedIndex(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Rephrase</DialogTitle>
          <DialogDescription>
            Choose a variation to replace your selected text
          </DialogDescription>
        </DialogHeader>

        {/* Original Text */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Original:</p>
          <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm">
            {originalText}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Generating variations...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVariations}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Variations */}
        {!isLoading && !error && variations.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Select a variation:</p>
            {variations.map((variation, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-600 uppercase">
                    {variation.tone}
                  </span>
                  {selectedIndex === index && (
                    <Check className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <p className="text-sm text-gray-800">{variation.text}</p>
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReplace}
            disabled={selectedIndex === null || isLoading}
          >
            Replace Text
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
