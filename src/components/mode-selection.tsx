"use client"

import { Mic, FileText, History } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ModeSelectionProps {
    onModeSelect: (mode: "listen" | "summary" | "history") => void
    isRecording: boolean
    notesCount: number
}

export function ModeSelection({ onModeSelect, isRecording, notesCount }: ModeSelectionProps) {
    const modes = [
        {
            id: "listen" as const,
            title: "Listen Mode",
            description: "Record doctor-patient conversation with live translation",
            icon: Mic,
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            textColor: "text-blue-700",
            iconColor: "text-blue-600",
            animation: isRecording ? "animate-pulse" : "",
        },
        {
            id: "summary" as const,
            title: "Summary & Prescriptions",
            description: "Generate clinical report and send to departments",
            icon: FileText,
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            textColor: "text-green-700",
            iconColor: "text-green-600",
            animation: "",
        },
        {
            id: "history" as const,
            title: "Patient History",
            description: "View past consultations, prescriptions & download report",
            icon: History,
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
            textColor: "text-purple-700",
            iconColor: "text-purple-600",
            animation: "",
        },
    ]

    return (
        <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">Choose Documentation Mode</h3>
                <p className="text-slate-600">Select how you&apos;d like to document this patient consultation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {modes.map((mode) => {
                    const IconComponent = mode.icon
                    return (
                        <Card
                            key={mode.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${mode.bgColor} ${mode.borderColor} border-2 ${mode.animation}`}
                            onClick={() => onModeSelect(mode.id)}
                        >
                            <CardContent className="p-6 text-center h-44 flex flex-col justify-center">
                                <div className={`w-14 h-14 mx-auto mb-4 rounded-full ${mode.bgColor} flex items-center justify-center ring-2 ring-white shadow-sm`}>
                                    <IconComponent className={`w-7 h-7 ${mode.iconColor}`} />
                                </div>
                                <h4 className={`font-semibold text-base mb-1 ${mode.textColor}`}>{mode.title}</h4>
                                <p className="text-xs text-slate-500">{mode.description}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
