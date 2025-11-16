'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  Search,
  Home,
  FolderOpen,
  PlusCircle,
  Upload,
  Keyboard,
  HelpCircle,
} from 'lucide-react'

interface Shortcut {
  keys: string[]
  description: string
  icon?: React.ReactNode
}

const shortcuts: { category: string; items: Shortcut[] }[] = [
  {
    category: 'Navigation',
    items: [
      {
        keys: ['⌘', 'K'],
        description: 'Open command palette',
        icon: <Search className="h-4 w-4" />,
      },
      {
        keys: ['G', 'H'],
        description: 'Go to home / dashboard',
        icon: <Home className="h-4 w-4" />,
      },
      {
        keys: ['G', 'P'],
        description: 'Go to projects',
        icon: <FolderOpen className="h-4 w-4" />,
      },
      {
        keys: ['N', 'P'],
        description: 'Create new project',
        icon: <PlusCircle className="h-4 w-4" />,
      },
    ],
  },
  {
    category: 'Actions',
    items: [
      {
        keys: ['⌘', 'U'],
        description: 'Upload dataset (in project)',
        icon: <Upload className="h-4 w-4" />,
      },
      {
        keys: ['⌘', 'S'],
        description: 'Save (in editor)',
        icon: null,
      },
      {
        keys: ['⌘', '/'],
        description: 'Toggle sidebar',
        icon: null,
      },
    ],
  },
  {
    category: 'General',
    items: [
      {
        keys: ['?'],
        description: 'Show keyboard shortcuts',
        icon: <HelpCircle className="h-4 w-4" />,
      },
      {
        keys: ['ESC'],
        description: 'Close modal / dialog',
        icon: null,
      },
    ],
  },
]

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Open shortcuts modal with "?"
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement
        // Don't trigger if in an input field
        if (
          target.tagName !== 'INPUT' &&
          target.tagName !== 'TEXTAREA' &&
          !target.isContentEditable
        ) {
          e.preventDefault()
          setOpen(true)
        }
      }

      // Close on ESC
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Keyboard className="h-6 w-6 mr-2" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {shortcuts.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center space-x-3">
                      {shortcut.icon && (
                        <div className="text-gray-500">{shortcut.icon}</div>
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <kbd
                          key={keyIdx}
                          className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> Press <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border rounded">?</kbd> anytime to view shortcuts, or{' '}
            <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border rounded">⌘K</kbd> to open the command palette.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
