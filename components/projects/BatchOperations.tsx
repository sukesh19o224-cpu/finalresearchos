'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Download,
  Trash2,
  Archive,
  Star,
  Move,
  Tags,
  MoreHorizontal,
  CheckSquare,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface BatchOperationsProps {
  selectedItems: string[]
  totalItems: number
  onSelectAll: (selected: boolean) => void
  onClearSelection: () => void
}

export function BatchOperations({
  selectedItems,
  totalItems,
  onSelectAll,
  onClearSelection,
}: BatchOperationsProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBatchAction = async (action: string) => {
    setIsProcessing(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast({
      title: `${action} completed`,
      description: `Successfully ${action.toLowerCase()}d ${selectedItems.length} items`,
    })

    setIsProcessing(false)
    onClearSelection()
  }

  if (selectedItems.length === 0) return null

  return (
    <div className="sticky top-0 z-10 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectedItems.length === totalItems}
            onCheckedChange={(checked: boolean) => onSelectAll(!!checked)}
          />
          <div>
            <p className="font-medium">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </p>
            <button
              onClick={onClearSelection}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear selection
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBatchAction('Download')}
            disabled={isProcessing}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBatchAction('Star')}
            disabled={isProcessing}
          >
            <Star className="h-4 w-4 mr-2" />
            Star
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBatchAction('Archive')}
            disabled={isProcessing}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleBatchAction('Move')}>
                <Move className="h-4 w-4 mr-2" />
                Move to...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBatchAction('Tag')}>
                <Tags className="h-4 w-4 mr-2" />
                Add tags
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBatchAction('Export')}>
                <Download className="h-4 w-4 mr-2" />
                Export all
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleBatchAction('Delete')}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
          <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Processing {selectedItems.length} items...
        </div>
      )}
    </div>
  )
}

/**
 * Selectable item wrapper
 */
export function SelectableItem({
  id,
  isSelected,
  onSelectionChange,
  children,
}: {
  id: string
  isSelected: boolean
  onSelectionChange: (id: string, selected: boolean) => void
  children: React.ReactNode
}) {
  return (
    <div className={`relative group ${isSelected ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked: boolean) => onSelectionChange(id, !!checked)}
          className="bg-white shadow-lg"
        />
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-blue-600">Selected</Badge>
        </div>
      )}
      <div className={isSelected ? 'opacity-75' : ''}>
        {children}
      </div>
    </div>
  )
}
