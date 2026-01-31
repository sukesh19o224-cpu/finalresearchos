'use client'

import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'

export function Breadcrumbs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Check if we're on a project detail page
  const projectDetailPattern = /^\/projects\/([^\/]+)$/
  const match = pathname.match(projectDetailPattern)
  const isProjectDetail = match && match[1] !== 'new'
  const projectId = match ? match[1] : null
  const activeView = searchParams.get('view') || 'overview'
  
  const setActiveView = (view: string) => {
    if (projectId) {
      router.push(`/projects/${projectId}?view=${view}`, { scroll: false })
    }
  }

  // Don't show breadcrumbs on dashboard home
  if (pathname === '/dashboard') {
    return null
  }

  const segments = pathname.split('/').filter((segment) => segment !== '')

  // Build breadcrumb items
  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ]

  let currentPath = ''
  segments.forEach((segment, index) => {
    // Skip 'dashboard' segment as we already have it
    if (segment === 'dashboard') return

    currentPath += `/${segment}`

    // Format the label
    let label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Special cases
    if (segment === 'new') label = 'New'
    if (segment === 'settings') label = 'Settings'
    if (segment.length === 36 || segment.length === 32) {
      // Likely a UUID/ID
      label = 'Project Details'
    }

    breadcrumbs.push({
      label,
      href: currentPath,
    })
  })

  return (
    <div className="relative mb-6">
      <nav className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
        <Link
          href="/dashboard"
          className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>

        {breadcrumbs.slice(1).map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 2

          return (
            <Fragment key={crumb.href}>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {isLast ? (
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </Fragment>
          )
        })}
      </nav>
      
      {isProjectDetail && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 flex items-center gap-[30px]">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeView === 'overview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveView('visualization')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeView === 'visualization'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Visualization
          </button>

          <button
            onClick={() => setActiveView('analysis')}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeView === 'analysis'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Analysis
          </button>
        </div>
      )}
    </div>
  )
}
