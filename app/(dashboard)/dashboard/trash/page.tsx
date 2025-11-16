'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, RotateCcw, X, AlertTriangle, FolderKanban, Database, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TrashManager, TrashedItem } from '@/lib/trash'
import { useToast } from '@/components/ui/use-toast'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDistanceToNow } from 'date-fns'

export default function TrashPage() {
  const [trashedItems, setTrashedItems] = useState<TrashedItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadTrash()
  }, [])

  const loadTrash = () => {
    const items = TrashManager.getAll()
    setTrashedItems(items)
  }

  const handleRestore = (id: string) => {
    const item = TrashManager.restore(id)

    if (item) {
      toast({
        variant: 'success',
        title: 'Item restored',
        description: `${item.name} has been restored`,
      })
      loadTrash()
    }
  }

  const handlePermanentDelete = (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`
      )
    ) {
      const success = TrashManager.permanentDelete(id)

      if (success) {
        toast({
          variant: 'success',
          title: 'Item permanently deleted',
          description: `${name} has been permanently removed`,
        })
        loadTrash()
      }
    }
  }

  const handleEmptyTrash = () => {
    if (
      confirm(
        'Are you sure you want to empty the trash? All items will be permanently deleted.'
      )
    ) {
      const count = TrashManager.empty()
      toast({
        variant: 'success',
        title: 'Trash emptied',
        description: `${count} items permanently deleted`,
      })
      loadTrash()
    }
  }

  const getTypeIcon = (type: TrashedItem['type']) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="h-5 w-5 text-blue-500" />
      case 'dataset':
        return <Database className="h-5 w-5 text-green-500" />
      case 'page':
        return <FileText className="h-5 w-5 text-purple-500" />
    }
  }

  const filteredItems = searchQuery
    ? TrashManager.search(searchQuery)
    : trashedItems

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trash2 className="h-8 w-8" />
            Trash
          </h1>
          <p className="text-muted-foreground mt-1">
            Items are automatically deleted after {TrashManager.getRetentionDays()} days
          </p>
        </div>
        {trashedItems.length > 0 && (
          <Button variant="destructive" onClick={handleEmptyTrash}>
            <Trash2 className="h-4 w-4 mr-2" />
            Empty Trash
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Trash2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trashedItems.length}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {trashedItems.filter((i) => i.type === 'project').length}
              </p>
              <p className="text-sm text-muted-foreground">Projects</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {trashedItems.filter((i) => i.type === 'dataset').length}
              </p>
              <p className="text-sm text-muted-foreground">Datasets</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      {trashedItems.length > 0 && (
        <Input
          type="search"
          placeholder="Search trash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      )}

      {/* Items */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title={searchQuery ? 'No results found' : 'Trash is empty'}
          description={
            searchQuery
              ? 'Try adjusting your search query'
              : 'Deleted items will appear here'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const daysLeft = getDaysUntilExpiry(item.expiresAt)
            const isExpiringSoon = daysLeft <= 7

            return (
              <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getTypeIcon(item.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.type}
                        </Badge>
                        {isExpiringSoon && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {daysLeft} days left
                          </Badge>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Deleted {formatDistanceToNow(item.deletedAt, { addSuffix: true })}
                        </span>
                        <span>
                          Expires{' '}
                          {formatDistanceToNow(item.expiresAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(item.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePermanentDelete(item.id, item.name)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
