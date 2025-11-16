'use client'

import React, { useState, useEffect } from 'react'
import { Star, FolderKanban, Database, Trash2, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FavoritesManager, FavoriteItem } from '@/lib/favorites'
import { useToast } from '@/components/ui/use-toast'
import { EmptyState } from '@/components/shared/EmptyState'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'datasets'>('all')
  const { toast } = useToast()

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    const allFavorites = FavoritesManager.getFavorites()
    setFavorites(allFavorites)
  }

  const handleRemove = (id: string, type: 'project' | 'dataset') => {
    FavoritesManager.removeFavorite(id, type)
    loadFavorites()
    toast({
      variant: 'success',
      title: 'Removed from favorites',
      description: 'Item has been unstarred',
    })
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all favorites?')) {
      FavoritesManager.clearAll()
      loadFavorites()
      toast({
        variant: 'success',
        title: 'Favorites cleared',
        description: 'All favorites have been removed',
      })
    }
  }

  const handleExport = () => {
    const json = FavoritesManager.exportFavorites()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `elctrdc-favorites-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      variant: 'success',
      title: 'Favorites exported',
      description: 'Your favorites have been downloaded as JSON',
    })
  }

  const filteredFavorites = favorites.filter((f) => {
    if (activeTab === 'all') return true
    if (activeTab === 'projects') return f.type === 'project'
    if (activeTab === 'datasets') return f.type === 'dataset'
    return true
  })

  const projectCount = favorites.filter((f) => f.type === 'project').length
  const datasetCount = favorites.filter((f) => f.type === 'dataset').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Favorites</h1>
          <p className="text-muted-foreground mt-1">
            Quick access to your starred projects and datasets
          </p>
        </div>
        <div className="flex gap-2">
          {favorites.length > 0 && (
            <>
              <Button variant="outline" onClick={handleExport}>
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{favorites.length}</p>
              <p className="text-sm text-muted-foreground">Total Favorites</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FolderKanban className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{projectCount}</p>
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
              <p className="text-2xl font-bold">{datasetCount}</p>
              <p className="text-sm text-muted-foreground">Datasets</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({favorites.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({projectCount})</TabsTrigger>
          <TabsTrigger value="datasets">Datasets ({datasetCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredFavorites.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No favorites yet"
              description="Star projects and datasets to add them to your favorites for quick access"
              action={{
                label: 'Browse Projects',
                href: '/dashboard/projects',
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFavorites.map((favorite) => (
                <Card key={`${favorite.type}-${favorite.id}`} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {favorite.type === 'project' ? (
                        <FolderKanban className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Database className="h-5 w-5 text-green-500" />
                      )}
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {favorite.type}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(favorite.id, favorite.type)}
                    >
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </Button>
                  </div>

                  <h3 className="font-semibold mb-2 line-clamp-1">{favorite.name}</h3>

                  <p className="text-sm text-muted-foreground mb-4">
                    Starred {formatDistanceToNow(favorite.starredAt, { addSuffix: true })}
                  </p>

                  <Link
                    href={
                      favorite.type === 'project'
                        ? `/dashboard/projects/${favorite.id}`
                        : `/dashboard/datasets/${favorite.id}`
                    }
                  >
                    <Button className="w-full" variant="outline">
                      Open {favorite.type}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
