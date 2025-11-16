/**
 * Trash/Recycle Bin System
 * Soft delete with restore functionality
 */

export interface TrashedItem {
  id: string
  type: 'project' | 'dataset' | 'page'
  originalId: string
  name: string
  description?: string
  deletedAt: Date
  expiresAt: Date
  data: any // Original data for restoration
}

export class TrashManager {
  private static STORAGE_KEY = 'elctrdc_trash'
  private static RETENTION_DAYS = 30

  /**
   * Get all trashed items
   */
  static getAll(): TrashedItem[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []

    try {
      const items = JSON.parse(stored)
      return items.map((item: any) => ({
        ...item,
        deletedAt: new Date(item.deletedAt),
        expiresAt: new Date(item.expiresAt),
      }))
    } catch (error) {
      console.error('Error parsing trash:', error)
      return []
    }
  }

  /**
   * Move item to trash
   */
  static trash(
    type: TrashedItem['type'],
    originalId: string,
    name: string,
    data: any,
    description?: string
  ): string {
    const items = this.getAll()

    const deletedAt = new Date()
    const expiresAt = new Date(deletedAt)
    expiresAt.setDate(expiresAt.getDate() + this.RETENTION_DAYS)

    const trashedItem: TrashedItem = {
      id: `trash-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      originalId,
      name,
      description,
      deletedAt,
      expiresAt,
      data,
    }

    items.push(trashedItem)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items))

    // Clean up expired items
    this.cleanupExpired()

    return trashedItem.id
  }

  /**
   * Restore item from trash
   */
  static restore(id: string): TrashedItem | null {
    const items = this.getAll()
    const item = items.find((i) => i.id === id)

    if (!item) return null

    // Remove from trash
    const filtered = items.filter((i) => i.id !== id)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))

    return item
  }

  /**
   * Permanently delete item
   */
  static permanentDelete(id: string): boolean {
    const items = this.getAll()
    const filtered = items.filter((i) => i.id !== id)

    if (filtered.length === items.length) return false

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
    return true
  }

  /**
   * Empty trash
   */
  static empty(): number {
    const items = this.getAll()
    const count = items.length
    localStorage.removeItem(this.STORAGE_KEY)
    return count
  }

  /**
   * Clean up expired items
   */
  static cleanupExpired(): number {
    const items = this.getAll()
    const now = new Date()
    const active = items.filter((item) => item.expiresAt > now)

    const deletedCount = items.length - active.length

    if (deletedCount > 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(active))
    }

    return deletedCount
  }

  /**
   * Get items by type
   */
  static getByType(type: TrashedItem['type']): TrashedItem[] {
    return this.getAll().filter((item) => item.type === type)
  }

  /**
   * Get item by ID
   */
  static getById(id: string): TrashedItem | undefined {
    return this.getAll().find((item) => item.id === id)
  }

  /**
   * Search trash
   */
  static search(query: string): TrashedItem[] {
    const items = this.getAll()
    const lowerQuery = query.toLowerCase()

    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Get storage size
   */
  static getStorageSize(): number {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    return stored ? stored.length : 0
  }

  /**
   * Get retention period
   */
  static getRetentionDays(): number {
    return this.RETENTION_DAYS
  }
}
