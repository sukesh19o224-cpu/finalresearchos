'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2 flex items-center justify-center gap-2">
            <Search className="h-5 w-5" />
            Looking for something specific?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Try these popular sections:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/dashboard/projects" className="text-sm text-blue-600 hover:underline">
              Projects
            </Link>
            <Link href="/dashboard/favorites" className="text-sm text-blue-600 hover:underline">
              Favorites
            </Link>
            <Link href="/dashboard/settings" className="text-sm text-blue-600 hover:underline">
              Settings
            </Link>
            <Link href="/dashboard/profile" className="text-sm text-blue-600 hover:underline">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
