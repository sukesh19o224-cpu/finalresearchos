import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Battery, Zap, FlaskConical, LineChart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">ElctrDc</span>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          Electrochemistry Research OS
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The all-in-one platform for electrochemistry research.
          Analyze data, manage literature, and accelerate your discoveries
          with AI-powered insights.
        </p>
        <div className="space-x-4">
          <Link href="/register">
            <Button size="lg">Start Free Trial</Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need for Electrochemistry Research
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <FlaskConical className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Data Analysis</CardTitle>
              <CardDescription>
                Powerful tools for CV, EIS, battery cycling, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Multi-format data import</li>
                <li>• Publication-ready plots</li>
                <li>• Statistical analysis</li>
                <li>• Automated workflows</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Battery className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Technique Support</CardTitle>
              <CardDescription>
                Support for all major electrochemistry techniques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Cyclic Voltammetry</li>
                <li>• EIS (Nyquist, Bode)</li>
                <li>• Battery Testing</li>
                <li>• Tafel Analysis</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <LineChart className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Context-aware AI trained on electrochemistry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Data interpretation</li>
                <li>• Literature comparison</li>
                <li>• Next-step suggestions</li>
                <li>• Privacy-first (local AI)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Project Management</CardTitle>
              <CardDescription>
                Organize research like never before
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Notion-like pages</li>
                <li>• Literature management</li>
                <li>• Integrated notes</li>
                <li>• Team collaboration</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Supported Instruments Section */}
      <section className="container mx-auto px-4 py-20 bg-gray-50 rounded-lg my-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Supported Instruments
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="font-semibold text-gray-700">BioLogic</p>
            <p className="text-sm text-gray-500">.mpt, .mpr</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Gamry</p>
            <p className="text-sm text-gray-500">.dta</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Neware</p>
            <p className="text-sm text-gray-500">Battery cyclers</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Generic CSV</p>
            <p className="text-sm text-gray-500">Universal format</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to accelerate your research?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join researchers using ElctrDc to organize, analyze, and publish faster.
        </p>
        <Link href="/register">
          <Button size="lg">Get Started Free</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 ElctrDc. Built for electrochemistry researchers.</p>
        </div>
      </footer>
    </div>
  )
}
