'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Zap, Home, FolderOpen, Settings, LogOut, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { KeyboardShortcutsModal } from '@/components/shared/KeyboardShortcutsModal'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])

  // Enable keyboard shortcuts
  useKeyboardShortcuts()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setUser(data.user)

      // Fetch projects for command palette
      const projectsRes = await fetch('/api/projects')
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData.projects || [])
      }
    } catch (error) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Zap className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">ElctrDc</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard">
            <Button
              variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>

          <Link href="/dashboard/projects">
            <Button
              variant={pathname?.startsWith('/dashboard/projects') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              Projects
            </Button>
          </Link>

          <Link href="/dashboard/settings">
            <Button
              variant={pathname === '/dashboard/settings' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>

          <div className="pt-4">
            <Link href="/dashboard/projects/new">
              <Button className="w-full justify-start">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </Link>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Command Palette */}
      <CommandPalette projects={projects} />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal />

      {/* Onboarding Tour */}
      <OnboardingTour />
    </div>
  )
}
