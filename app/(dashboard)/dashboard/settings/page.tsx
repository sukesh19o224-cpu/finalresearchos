'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import {
  Settings,
  User,
  Bell,
  Palette,
  Database,
  Download,
  Trash2,
  RefreshCw,
} from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [dataBackup, setDataBackup] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  useEffect(() => {
    fetchUser()
    loadPreferences()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPreferences = () => {
    const prefs = localStorage.getItem('elctrdc_preferences')
    if (prefs) {
      const parsed = JSON.parse(prefs)
      setEmailNotifications(parsed.emailNotifications ?? true)
      setDataBackup(parsed.dataBackup ?? true)
      setAutoSave(parsed.autoSave ?? true)
    }
  }

  const savePreferences = () => {
    const prefs = {
      emailNotifications,
      dataBackup,
      autoSave,
    }
    localStorage.setItem('elctrdc_preferences', JSON.stringify(prefs))
    toast({
      variant: 'success',
      title: 'Preferences saved',
      description: 'Your settings have been updated successfully.',
    })
  }

  const resetTour = () => {
    localStorage.removeItem('elctrdc_tour_completed')
    toast({
      title: 'Tour reset',
      description: 'The onboarding tour will show again on next page load.',
    })
    setTimeout(() => window.location.reload(), 1000)
  }

  const clearCache = () => {
    localStorage.removeItem('elctrdc_preferences')
    toast({
      title: 'Cache cleared',
      description: 'All cached data has been removed.',
    })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Settings className="h-8 w-8 mr-3" />
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Data & Privacy
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  defaultValue={user?.name}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  placeholder="your.email@example.com"
                  disabled
                />
                <p className="text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>
              <div className="pt-4">
                <Button>Save Profile</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-gray-500">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive email updates about your research
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-save</p>
                  <p className="text-sm text-gray-500">
                    Automatically save your work
                  </p>
                </div>
                <Switch
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Backup</p>
                  <p className="text-sm text-gray-500">
                    Automatically backup your data
                  </p>
                </div>
                <Switch
                  checked={dataBackup}
                  onCheckedChange={setDataBackup}
                />
              </div>
              <div className="pt-4">
                <Button onClick={savePreferences}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how ElctrDc looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  Use the theme toggle in the sidebar to switch between light and dark mode
                </p>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Reset Onboarding Tour</p>
                  <p className="text-sm text-gray-500">
                    Show the welcome tour again
                  </p>
                </div>
                <Button variant="outline" onClick={resetTour}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Tour
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Privacy Tab */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your data and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Export All Data</p>
                  <p className="text-sm text-gray-500">
                    Download all your projects and datasets
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Clear Cache</p>
                  <p className="text-sm text-gray-500">
                    Remove all cached data from your browser
                  </p>
                </div>
                <Button variant="outline" onClick={clearCache}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>
                Your data privacy and security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                ElctrDc stores all your research data securely. We never share your data with third parties.
                All data transmission is encrypted, and your datasets are stored with enterprise-grade security.
              </p>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>End-to-end encryption for data transfer</li>
                <li>Secure database with automatic backups</li>
                <li>No third-party data sharing</li>
                <li>GDPR compliant data handling</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
