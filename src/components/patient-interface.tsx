"use client"

import { useState } from "react"
import { ArrowLeft, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeSelection } from "@/components/mode-selection"
import { ListenMode } from "@/components/listen-mode"
import { SummaryMode } from "@/components/summary-mode"

import { PatientHistory } from "@/components/patient-history"
import type { Patient } from "@/types/medical"

interface PatientInterfaceProps {
    selectedPatient: Patient | null
    isRecording: boolean
    onToggleRecording: () => void
    sessionTime: string
    onResetSession: () => void
    activeMode: "selection" | "listen" | "summary" | "history"
    onModeChange: (mode: "selection" | "listen" | "summary" | "history") => void
    onBack?: () => void
}

export function PatientInterface({
                                     selectedPatient,
                                     isRecording,
                                     onToggleRecording,
                                     sessionTime,
                                     onResetSession,
                                     activeMode,
                                     onModeChange,
                                     onBack,
                                 }: PatientInterfaceProps) {
    const [notesCount, setNotesCount] = useState(0)


    if (!selectedPatient) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                    <Heart className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Select a patient to begin consultation</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Patient Header Section */}
            <div className="px-4 py-2 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
                <div className="flex items-center justify-between ">
                    <div className="flex items-center space-x-3">
                        {(onBack || activeMode !== "selection") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (activeMode !== "selection") {
                                        onModeChange("selection")
                                    } else if (onBack) {
                                        onBack()
                                    }
                                }}
                                className="inline-flex mr-2"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600 hover:text-slate-900" />
                            </Button>
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">{selectedPatient.name}</h2>
                            <p className="text-sm text-slate-600">
                                Age {selectedPatient.age} • {selectedPatient.mrn}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mode Interface */}
            <div className="flex-1 overflow-hidden">
                {activeMode === "selection" && (
                    <ModeSelection
                        onModeSelect={onModeChange}
                        isRecording={isRecording}
                        notesCount={notesCount}

                    />
                )}
                {activeMode === "listen" && (
                    <ListenMode
                        selectedPatient={selectedPatient}
                        isRecording={isRecording}
                        onToggleRecording={onToggleRecording}
                        onResetSession={onResetSession}
                    />
                )}
                {activeMode === "summary" && (
                    <SummaryMode selectedPatient={selectedPatient} notesCount={notesCount} onNotesCountChange={setNotesCount} />
                )}
                {activeMode === "history" && (
                    <PatientHistory selectedPatient={selectedPatient} />
                )}

            </div>
        </div>
    )
}
