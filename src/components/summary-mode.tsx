"use client"

import { useState, useEffect } from "react"
import { Send, FileText, Stethoscope, Pill, Calendar, Wand2, Loader2, CheckCircle, AlertTriangle, ClipboardList, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import type { Patient } from "@/types/medical"

interface SummaryModeProps {
    selectedPatient: Patient
    notesCount: number
    onNotesCountChange: (count: number) => void
}

interface ExtractedData {
    summary: string
    symptoms: string[]
    prescriptions: { med: string; dosage: string; freq: string; dur: string }[]
    labOrders: { test: string; reason: string }[]
    followUp: string
    consultationId: string
}

export function SummaryMode({ selectedPatient, notesCount, onNotesCountChange }: SummaryModeProps) {
    const [isProcessing, setIsProcessing] = useState(false)
    const [savedTranscript, setSavedTranscript] = useState("")
    const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
    const [isApproved, setIsApproved] = useState(false)
    const [manualNote, setManualNote] = useState("")
    const [manualNotes, setManualNotes] = useState<{ text: string; time: string }[]>([])

    useEffect(() => {
        const transcript = localStorage.getItem("current_transcript") || ""
        setSavedTranscript(transcript)
    }, [])

    const handleGenerate = async () => {
        const transcript = localStorage.getItem("current_transcript")
        if (!transcript || transcript.trim().length === 0) {
            alert("No transcript found. Please record a consultation first in Listen Mode.")
            return
        }

        setIsProcessing(true)
        setIsApproved(false)
        try {
            const res = await fetch("/api/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId: selectedPatient.id || selectedPatient.mrn,
                    doctorName: "Dr. Smith",
                    transcript: transcript.trim(),
                }),
            })
            const data = await res.json()
            if (data.success) {
                setExtractedData(data)
                onNotesCountChange(notesCount + 1)
            } else {
                alert("Failed to extract: " + data.error)
            }
        } catch (error) {
            alert("Network error processing transcript")
        }
        setIsProcessing(false)
    }

    const handleApprove = () => {
        setIsApproved(true)
        localStorage.removeItem("current_transcript")
        setSavedTranscript("")
    }

    const handleAddManualNote = () => {
        if (!manualNote.trim()) return
        setManualNotes(prev => [...prev, { text: manualNote.trim(), time: new Date().toLocaleTimeString() }])
        setManualNote("")
    }

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-green-50/30 to-white">
            {/* Top Bar */}
            <div className="p-4 border-b bg-white/90 backdrop-blur-sm flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-green-600" />
                        Clinical Summary — {selectedPatient.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Patient ID: {selectedPatient.id || selectedPatient.mrn}</p>
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={isProcessing || !savedTranscript}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Generate from Transcript
                </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="max-w-2xl mx-auto space-y-4">
                    {/* Pending Transcript */}
                    {savedTranscript && !extractedData && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="p-4">
                                <h4 className="font-medium text-blue-800 text-sm mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Pending Consultation Transcript
                                </h4>
                                <p className="text-sm text-blue-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {savedTranscript}
                                </p>
                                <p className="text-xs text-blue-500 mt-2">
                                    Click &quot;Generate from Transcript&quot; to create a structured clinical report.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {!savedTranscript && !extractedData && (
                        <div className="text-center py-12 text-slate-500">
                            <FileText className="w-14 h-14 mx-auto mb-4 text-slate-300" />
                            <p className="font-medium">No consultation data yet</p>
                            <p className="text-sm mt-1">Record a conversation in Listen Mode, then come here to generate the clinical summary.</p>
                        </div>
                    )}

                    {/* ── Extracted Clinical Report ── */}
                    {extractedData && (
                        <>
                            {/* Symptoms */}
                            <Card className="border-yellow-200 shadow-sm">
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-yellow-800 text-sm mb-3 flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" /> Detected Symptoms
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {extractedData.symptoms.map((s, i) => (
                                            <span key={i} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Prescriptions */}
                            <Card className="border-green-200 shadow-sm">
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-green-800 text-sm mb-3 flex items-center gap-2">
                                        <Pill className="w-4 h-4" /> Prescriptions
                                        {isApproved && <span className="text-green-600 text-xs ml-auto flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Sent to Pharmacy</span>}
                                    </h4>
                                    <div className="space-y-2">
                                        {extractedData.prescriptions.map((rx, i) => (
                                            <div key={i} className="bg-green-50 rounded-lg p-3 border border-green-100">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-semibold text-green-900">{rx.med}</span>
                                                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">{rx.dosage}</span>
                                                </div>
                                                <p className="text-sm text-green-700 mt-1">{rx.freq} • {rx.dur}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Lab Orders */}
                            {extractedData.labOrders.length > 0 && (
                                <Card className="border-blue-200 shadow-sm">
                                    <CardContent className="p-4">
                                        <h4 className="font-semibold text-blue-800 text-sm mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Lab / Diagnostic Orders
                                            {isApproved && <span className="text-blue-600 text-xs ml-auto flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Sent to Laboratory</span>}
                                        </h4>
                                        <div className="space-y-2">
                                            {extractedData.labOrders.map((lab, i) => (
                                                <div key={i} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                    <span className="font-semibold text-blue-900">{lab.test}</span>
                                                    <p className="text-sm text-blue-700 mt-1">Reason: {lab.reason}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Follow-up */}
                            <Card className="border-purple-200 shadow-sm">
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-purple-800 text-sm mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Follow-up Instructions
                                    </h4>
                                    <p className="text-sm text-purple-700">{extractedData.followUp}</p>
                                </CardContent>
                            </Card>

                            {/* Approve & Push Button */}
                            {!isApproved ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <p className="text-sm text-amber-800 mb-3 font-medium">
                                        ⚕️ Review the above clinical summary. Once approved, prescriptions will be sent to Pharmacy and lab orders to Laboratory.
                                    </p>
                                    <Button
                                        onClick={handleApprove}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Approve & Send to Departments
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="text-green-800 font-semibold">Approved & Dispatched</p>
                                    <p className="text-sm text-green-600 mt-1">
                                        {extractedData.prescriptions.length} prescription(s) → Pharmacy &nbsp;|&nbsp;
                                        {extractedData.labOrders.length} lab order(s) → Laboratory
                                    </p>
                                    <p className="text-xs text-green-500 mt-2">
                                        Consultation ID: {extractedData.consultationId}
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Manual Notes Section */}
                    {manualNotes.length > 0 && (
                        <div className="space-y-2 mt-4">
                            <h4 className="text-sm font-medium text-slate-600">Doctor&apos;s Additional Notes</h4>
                            {manualNotes.map((note, i) => (
                                <Card key={i} className="shadow-sm">
                                    <CardContent className="p-3 flex justify-between items-start">
                                        <p className="text-sm text-slate-800">{note.text}</p>
                                        <span className="text-xs text-slate-400 ml-4 shrink-0">{note.time}</span>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Manual Note Input */}
            <div className="p-4 border-t bg-white/90 backdrop-blur-sm">
                <div className="flex gap-2 max-w-2xl mx-auto">
                    <Textarea
                        placeholder="Add doctor's notes manually..."
                        value={manualNote}
                        onChange={e => setManualNote(e.target.value)}
                        className="min-h-[60px] resize-none"
                    />
                    <Button
                        onClick={handleAddManualNote}
                        disabled={!manualNote.trim()}
                        className="bg-green-600 hover:bg-green-700 self-end"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
