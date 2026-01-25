'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, Sparkles } from 'lucide-react'
import { useProjectAIChat } from '@/lib/hooks/useProjectAIChat'

interface InsightsTabProps {
    dataSummary: string
    plotSummary?: string
}

export function InsightsTab({ dataSummary, plotSummary }: InsightsTabProps) {
    const { openSidebar } = useProjectAIChat()

    const [uploadedFiles, setUploadedFiles] = React.useState<Array<{
        id: string
        name: string
        type: string
        url: string
    }>>([])

    const generateReport = () => {
        openSidebar()
        // You can optionally trigger a message in the AI chat here later
    }

    const handleFileUpload = async (files: FileList) => {
        for (const file of Array.from(files)) {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('source', 'insights')

            const response = await fetch('/api/files/upload', {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                const { fileId, fileUrl, mimeType } = await response.json()

                setUploadedFiles(prev => [...prev, {
                    id: fileId,
                    name: file.name,
                    type: mimeType,
                    url: fileUrl
                }])

                // Trigger analysis (placeholder for now)
                console.log('Analyzing file:', file.name)
            }
        }
    }

    return (
        <div className="h-full flex flex-col gap-4 overflow-y-auto p-1">
            <Card className="bg-purple-50 border-purple-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between text-purple-800">
                        <div className="flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Automated Insights
                        </div>
                        <Button
                            size="sm"
                            onClick={generateReport}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Generate Report
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-purple-700">
                        The AI has analyzed your selected data. Click "Generate Report" for a full analysis or ask specific questions below.
                    </p>
                </CardContent>
            </Card>

            {/* Upload Area */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Multi-Modal Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer bg-gray-50"
                        onDrop={(e) => {
                            e.preventDefault()
                            handleFileUpload(e.dataTransfer.files)
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => document.getElementById('insights-file-input')?.click()}
                    >
                        <p className="text-gray-600 text-sm">
                            Drag & drop PDFs, plots, or datasets here for combined analysis
                        </p>
                        <input
                            id="insights-file-input"
                            type="file"
                            multiple
                            accept=".pdf,.png,.jpg,.jpeg,.svg,.csv"
                            className="hidden"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        />
                    </div>

                    {/* Upload History */}
                    {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {uploadedFiles.map(file => (
                                <div key={file.id} className="flex items-center justify-between p-2 border rounded bg-white text-sm">
                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-xs text-gray-500">{file.type}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Chat Trigger */}
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="py-6">
                    <div className="text-center">
                        <Sparkles className="h-8 w-8 mx-auto mb-3 text-purple-600" />
                        <h3 className="font-semibold text-lg mb-2">Ask AI About These Insights</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Open the AI assistant to discuss trends, anomalies, and recommendations
                        </p>
                        <Button
                            onClick={openSidebar}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Open AI Assistant
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
