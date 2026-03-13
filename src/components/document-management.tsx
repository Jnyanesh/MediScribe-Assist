"use client"

import { useState } from "react"
import { Upload, FileText, ImageIcon, Calendar, Pill, Shield, Download, Eye, Star, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Patient } from "@/types/medical"

interface DocumentManagementProps {
    selectedPatient: Patient | null
}

interface Document {
    id: string
    name: string
    type: "lab" | "imaging" | "notes" | "prescription" | "insurance"
    date: string
    source: string
    keyFindings: string[]
    confidence: number
    isRelevant: boolean
}

const mockDocuments: Document[] = [
    {
        id: "1",
        name: "Complete Blood Count",
        type: "lab",
        date: "2024-01-03",
        source: "Quest Diagnostics",
        keyFindings: ["Elevated WBC count", "Normal hemoglobin"],
        confidence: 0.94,
        isRelevant: true,
    },
    {
        id: "2",
        name: "Chest X-Ray",
        type: "imaging",
        date: "2024-01-02",
        source: "Radiology Dept",
        keyFindings: ["Clear lung fields", "Normal heart size"],
        confidence: 0.89,
        isRelevant: true,
    },
    {
        id: "3",
        name: "Previous Visit Notes",
        type: "notes",
        date: "2023-12-15",
        source: "Dr. Johnson",
        keyFindings: ["Hypertension management", "Medication compliance"],
        confidence: 0.96,
        isRelevant: false,
    },
    {
        id: "4",
        name: "Lisinopril Prescription",
        type: "prescription",
        date: "2024-01-01",
        source: "Pharmacy",
        keyFindings: ["10mg daily", "Blood pressure control"],
        confidence: 0.92,
        isRelevant: true,
    },
]

export function DocumentManagement({ selectedPatient }: DocumentManagementProps) {
    const [activeTab, setActiveTab] = useState("all")
    const [dragOver, setDragOver] = useState(false)

    const getDocumentIcon = (type: string) => {
        switch (type) {
            case "lab":
                return <FileText className="w-4 h-4 text-green-600" />
            case "imaging":
                return <ImageIcon className="w-4 h-4 text-blue-600" />
            case "notes":
                return <Calendar className="w-4 h-4 text-purple-600" />
            case "prescription":
                return <Pill className="w-4 h-4 text-orange-600" />
            case "insurance":
                return <Shield className="w-4 h-4 text-slate-600" />
            default:
                return <FileText className="w-4 h-4 text-slate-600" />
        }
    }

    const filteredDocuments = mockDocuments.filter((doc) => {
        if (activeTab === "all") return true
        return doc.type === activeTab
    })

    const relevantDocuments = mockDocuments.filter((doc) => doc.isRelevant)

    if (!selectedPatient) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Select a patient to view documents</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Patient Documents</h2>
                    <Button size="sm" variant="outline">
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                    </Button>
                </div>

                {/* Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                        dragOver ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-slate-400"
                    }`}
                    onDragOver={(e) => {
                        e.preventDefault()
                        setDragOver(true)
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault()
                        setDragOver(false)
                    }}
                >
                    <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600">Drag files here or click to upload</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                </div>
            </div>

            {/* AI Insights */}
            <div className="flex-1 p-4 border-b border-slate-200 bg-blue-50">
                <div className="flex items-center space-x-2 mb-3">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-blue-900">AI Insights</h3>
                </div>
                <div className="space-y-2">
                    <div className="text-sm text-blue-800">
                        <strong>Relevant to current visit:</strong> {relevantDocuments.length} documents
                    </div>
                    <div className="text-sm text-blue-700">
                        • Recent lab results show elevated WBC count - may correlate with reported symptoms
                    </div>
                    <div className="text-sm text-blue-700">
                        • Chest X-ray from 2 days ago shows clear findings - rule out respiratory causes
                    </div>
                </div>
            </div>
        </div>
    )
}
