import { create } from 'zustand'

export type PageNode = {
  id: string
  title: string
  icon: string | null
  parentPageId: string | null
  position: number
  isExpanded: boolean
}

type PageStore = {
  pages: Record<string, PageNode>
  selectedPageId: string | null
  splitPageId: string | null
  isSplit: boolean
  projectId: string | null
  isLoading: boolean

  setProjectId: (id: string) => void
  loadPages: () => Promise<void>
  selectPage: (id: string | null) => void
  toggleExpand: (id: string) => void
  createPage: (title: string, parentPageId?: string | null) => Promise<string | null>
  renamePage: (id: string, newTitle: string) => Promise<void>
  deletePage: (id: string) => Promise<void>

  // Reorder
  movePage: (id: string, direction: 'up' | 'down') => void

  // Split view
  toggleSplit: () => void
  setSplitPageId: (id: string | null) => void
}

export const usePageStore = create<PageStore>((set, get) => ({
  pages: {},
  selectedPageId: null,
  splitPageId: null,
  isSplit: false,
  projectId: null,
  isLoading: false,

  setProjectId: (id) => set({ projectId: id }),

  loadPages: async () => {
    const { projectId } = get()
    if (!projectId) return

    set({ isLoading: true })
    try {
      const res = await fetch(`/api/projects/${projectId}/pages`)
      if (res.ok) {
        const data = await res.json()
        const pageMap: Record<string, PageNode> = {}
        data.pages.forEach((p: any) => {
          pageMap[p.id] = {
            id: p.id,
            title: p.title,
            icon: p.icon,
            parentPageId: p.parentPageId,
            position: p.position,
            isExpanded: true,
          }
        })
        set({ pages: pageMap, isLoading: false })
      }
    } catch (error) {
      console.error('Failed to load pages:', error)
      set({ isLoading: false })
    }
  },

  selectPage: (id) => set({ selectedPageId: id }),

  toggleExpand: (id) => {
    const { pages } = get()
    const page = pages[id]
    if (page) {
      set({
        pages: { ...pages, [id]: { ...page, isExpanded: !page.isExpanded } },
      })
    }
  },

  createPage: async (title, parentPageId = null) => {
    const { projectId, pages } = get()
    if (!projectId) return null

    try {
      const res = await fetch(`/api/projects/${projectId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, parentPageId }),
      })
      if (res.ok) {
        const data = await res.json()
        const newPage: PageNode = {
          id: data.page.id,
          title: data.page.title,
          icon: data.page.icon,
          parentPageId: data.page.parentPageId,
          position: data.page.position,
          isExpanded: true,
        }
        set({
          pages: { ...pages, [newPage.id]: newPage },
          selectedPageId: newPage.id,
        })
        return newPage.id
      }
    } catch (error) {
      console.error('Failed to create page:', error)
    }
    return null
  },

  renamePage: async (id, newTitle) => {
    const { projectId, pages } = get()
    if (!projectId) return

    try {
      const res = await fetch(`/api/projects/${projectId}/pages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })
      if (res.ok) {
        set({
          pages: { ...pages, [id]: { ...pages[id], title: newTitle } },
        })
      }
    } catch (error) {
      console.error('Failed to rename page:', error)
    }
  },

  deletePage: async (id) => {
    const { projectId, pages, selectedPageId, splitPageId } = get()
    if (!projectId) return

    try {
      const res = await fetch(`/api/projects/${projectId}/pages/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        const newPages = { ...pages }
        // Remove page and children
        const removeRecursive = (pageId: string) => {
          delete newPages[pageId]
          Object.values(pages).forEach((p) => {
            if (p.parentPageId === pageId) removeRecursive(p.id)
          })
        }
        removeRecursive(id)

        const updates: Partial<PageStore> = { pages: newPages }
        if (selectedPageId === id) updates.selectedPageId = null
        if (splitPageId === id) updates.splitPageId = null
        set(updates as any)
      }
    } catch (error) {
      console.error('Failed to delete page:', error)
    }
  },

  toggleSplit: () => {
    const { isSplit, selectedPageId } = get()
    if (isSplit) {
      set({ isSplit: false, splitPageId: null })
    } else {
      set({ isSplit: true })
    }
  },

  setSplitPageId: (id) => set({ splitPageId: id }),

  movePage: (id, direction) => {
    const { pages, projectId } = get()
    const page = pages[id]
    if (!page || !projectId) return

    const siblings = Object.values(pages)
      .filter((p) => p.parentPageId === page.parentPageId)
      .sort((a, b) => a.position - b.position)

    const idx = siblings.findIndex((p) => p.id === id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= siblings.length) return

    const other = siblings[swapIdx]
    const newPages = {
      ...pages,
      [id]: { ...page, position: other.position },
      [other.id]: { ...other, position: page.position },
    }
    set({ pages: newPages })

    // Persist both position changes
    fetch(`/api/projects/${projectId}/pages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: other.position }),
    }).catch(() => {})
    fetch(`/api/projects/${projectId}/pages/${other.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: page.position }),
    }).catch(() => {})
  },
}))
