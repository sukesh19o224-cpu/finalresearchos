/**
 * Favorites/Starring System
 * Allows users to star/favorite projects and datasets for quick access
 */

export interface FavoriteItem {
  id: string
  type: 'project' | 'dataset'
  name: string
  starredAt: Date
}

export class FavoritesManager {
  private static STORAGE_KEY = 'elctrdc_favorites'

  /**
   * Get all favorited items
   */
  static getFavorites(): FavoriteItem[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []

    try {
      const favorites = JSON.parse(stored)
      return favorites.map((f: any) => ({
        ...f,
        starredAt: new Date(f.starredAt),
      }))
    } catch (error) {
      console.error('Error parsing favorites:', error)
      return []
    }
  }

  /**
   * Check if an item is favorited
   */
  static isFavorite(id: string, type: 'project' | 'dataset'): boolean {
    const favorites = this.getFavorites()
    return favorites.some((f) => f.id === id && f.type === type)
  }

  /**
   * Add item to favorites
   */
  static addFavorite(id: string, type: 'project' | 'dataset', name: string): void {
    const favorites = this.getFavorites()

    // Check if already favorited
    if (this.isFavorite(id, type)) {
      return
    }

    const newFavorite: FavoriteItem = {
      id,
      type,
      name,
      starredAt: new Date(),
    }

    favorites.push(newFavorite)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites))
  }

  /**
   * Remove item from favorites
   */
  static removeFavorite(id: string, type: 'project' | 'dataset'): void {
    const favorites = this.getFavorites()
    const filtered = favorites.filter((f) => !(f.id === id && f.type === type))
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  /**
   * Toggle favorite status
   */
  static toggleFavorite(id: string, type: 'project' | 'dataset', name: string): boolean {
    if (this.isFavorite(id, type)) {
      this.removeFavorite(id, type)
      return false
    } else {
      this.addFavorite(id, type, name)
      return true
    }
  }

  /**
   * Get favorites by type
   */
  static getFavoritesByType(type: 'project' | 'dataset'): FavoriteItem[] {
    const favorites = this.getFavorites()
    return favorites.filter((f) => f.type === type)
  }

  /**
   * Get favorite projects
   */
  static getFavoriteProjects(): FavoriteItem[] {
    return this.getFavoritesByType('project')
  }

  /**
   * Get favorite datasets
   */
  static getFavoriteDatasets(): FavoriteItem[] {
    return this.getFavoritesByType('dataset')
  }

  /**
   * Clear all favorites
   */
  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Export favorites as JSON
   */
  static exportFavorites(): string {
    const favorites = this.getFavorites()
    return JSON.stringify(favorites, null, 2)
  }

  /**
   * Import favorites from JSON
   */
  static importFavorites(json: string): void {
    try {
      const favorites = JSON.parse(json)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error('Error importing favorites:', error)
      throw new Error('Invalid favorites JSON')
    }
  }
}
