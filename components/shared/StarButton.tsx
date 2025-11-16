'use client'

import React, { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FavoritesManager } from '@/lib/favorites'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface StarButtonProps {
  id: string
  type: 'project' | 'dataset'
  name: string
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function StarButton({
  id,
  type,
  name,
  className,
  variant = 'ghost',
  size = 'icon',
}: StarButtonProps) {
  const [isStarred, setIsStarred] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsStarred(FavoritesManager.isFavorite(id, type))
  }, [id, type])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newState = FavoritesManager.toggleFavorite(id, type, name)
    setIsStarred(newState)

    toast({
      variant: 'success',
      title: newState ? 'Added to favorites' : 'Removed from favorites',
      description: newState
        ? `${name} has been starred`
        : `${name} has been unstarred`,
    })
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(className)}
          onClick={handleToggle}
        >
          <Star
            className={cn(
              'h-4 w-4 transition-all',
              isStarred
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground hover:text-yellow-400'
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isStarred ? 'Unstar' : 'Star'} this {type}</p>
      </TooltipContent>
    </Tooltip>
  )
}
