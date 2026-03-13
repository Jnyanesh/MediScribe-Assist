"use client"
import { useState, useEffect, useRef } from "react"
import { Download, FileText, Pill, Activity, Calendar, User, Printer, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import type { Patient } from "@/types/medical"

interface PatientHistoryProps {
    selectedPatient: Patient
}

export function PatientHistory({ selectedPatient }: PatientHistoryProps) {
    const [history, setHistory] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const printRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true)
            try {
                const patientId = selectedPatient.id || selectedPatient.mrn
                const res = await fetch(`/api/patients/${patientId}`)
                if (res.ok) {
                    const data = await res.json()
                    setHistory(data)
                }
            } catch (e) {
                console.error("Failed to fetch history:", e)
            }
            setLoading(false)
        }
        fetchHistory()
    }, [selectedPatient])

    const handleDownload = () => {
        if (!history) return

        const p = history.patient
        const lines: string[] = [
            "═══════════════════════════════════════════════",
            "       MEDISCRIBE — PATIENT REPORT",
            "═══════════════════════════════════════════════",
            "",
            `Patient Name    : ${p.name}`,
            `Patient ID      : ${p.id}`,
            `Age / Gender    : ${p.age} / ${p.gender}`,
            `Phone           : ${p.phone || "N/A"}`,
            `Medical History : ${p.medicalHistory || "None"}`,
            "",
            `Report Generated: ${new Date().toLocaleString()}`,
            "",
            "───────────────────────────────────────────────",
            "  CONSULTATION HISTORY",
            "───────────────────────────────────────────────",
        ]

        if (history.consultations?.length > 0) {
            history.consultations.forEach((c: any, i: number) => {
                lines.push("")
                lines.push(`  [${i + 1}] Date: ${new Date(c.date).toLocaleString()}`)
                lines.push(`      Doctor: ${c.doctor_name}`)
                lines.push(`      Summary: ${c.summary || "N/A"}`)
                if (c.transcript) {
                    lines.push(`      Transcript:`)
                    c.transcript.split("\n").forEach((t: string) => {
                        if (t.trim()) lines.push(`        ${t.trim()}`)
                    })
                }
            })
        } else {
            lines.push("  No consultations recorded.")
        }

        lines.push("")
        lines.push("───────────────────────────────────────────────")
        lines.push("  PRESCRIPTIONS")
        lines.push("───────────────────────────────────────────────")

        if (history.prescriptions?.length > 0) {
            history.prescriptions.forEach((rx: any, i: number) => {
                lines.push(`  [${i + 1}] ${rx.medication} — ${rx.dosage}`)
                lines.push(`      ${rx.frequency} for ${rx.duration}`)
                lines.push(`      Status: ${rx.status} | Doctor: ${rx.doctor_name}`)
            })
        } else {
            lines.push("  No prescriptions.")
        }

        lines.push("")
        lines.push("───────────────────────────────────────────────")
        lines.push("  LAB / DIAGNOSTIC ORDERS")
        lines.push("───────────────────────────────────────────────")

        if (history.labOrders?.length > 0) {
            history.labOrders.forEach((lab: any, i: number) => {
                lines.push(`  [${i + 1}] ${lab.test_name}`)
                lines.push(`      Reason: ${lab.reason}`)
                lines.push(`      Status: ${lab.status}`)
                if (lab.result) lines.push(`      Result: ${lab.result}`)
            })
        } else {
            lines.push("  No lab orders.")
        }

        lines.push("")
        lines.push("═══════════════════════════════════════════════")
        lines.push("  End of Report — MediScribe")
        lines.push("═══════════════════════════════════════════════")

        const blob = new Blob([lines.join("\n")], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${p.name.replace(/\s+/g, "_")}_${p.id}_report.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handlePrint = () => {
        if (printRef.current) {
            const printWindow = window.open("", "_blank")
            if (printWindow) {
                printWindow.document.write(`
                    <html><head><title>Patient Report — ${history?.patient?.name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                        h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 8px; }
                        h2 { color: #374151; margin-top: 24px; }
                        .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin: 8px 0; }
                        .badge { display: inline-block; background: #f0fdf4; color: #16a34a; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
                        .badge.pending { background: #fefce8; color: #ca8a04; }
                    </style></head><body>
                    ${printRef.current.innerHTML}
                    </body></html>
                `)
                printWindow.document.close()
                printWindow.print()
            }
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center h-full text-slate-500">Loading patient history...</div>
    }

    if (!history) {
        return <div className="flex items-center justify-center h-full text-slate-500">Unable to load patient record.</div>
    }

    const p = history.patient

    return (
        <div className="h-full flex flex-col">
            {/* Top Bar */}
            <div className="p-4 border-b bg-white/90 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-600" /> Patient History
                </h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="w-4 h-4 mr-1" /> Print
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div ref={printRef} className="max-w-2xl mx-auto space-y-4">
                    {/* Patient Info */}
                    <Card className="border-blue-200">
                        <CardContent className="p-4">
                            <h2 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                                <User className="w-5 h-5" /> {p.name}
                            </h2>
                            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                                <div><span className="text-slate-500">ID:</span> <strong>{p.id}</strong></div>
                                <div><span className="text-slate-500">Age:</span> <strong>{p.age}</strong></div>
                                <div><span className="text-slate-500">Gender:</span> <strong>{p.gender}</strong></div>
                                <div><span className="text-slate-500">Phone:</span> <strong>{p.phone || "N/A"}</strong></div>
                                <div className="col-span-2">
                                    <span className="text-slate-500">Medical History:</span>{" "}
                                    <strong>{p.medicalHistory || "None recorded"}</strong>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Consultations */}
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2 pt-2">
                        <FileText className="w-4 h-4 text-purple-600" /> Consultations ({history.consultations?.length || 0})
                    </h4>
                    {history.consultations?.length > 0 ? (
                        history.consultations.map((c: any) => (
                            <Card key={c.id} className="shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-sm font-semibold text-purple-800">Dr. {c.doctor_name}</span>
                                            <p className="text-xs text-slate-400">{new Date(c.date).toLocaleString()}</p>
                                        </div>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{c.id}</span>
                                    </div>
                                    {c.summary && <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-3 rounded whitespace-pre-wrap">{c.summary}</p>}
                                    {c.transcript && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-blue-600 cursor-pointer">View Full Transcript</summary>
                                            <p className="text-xs text-slate-500 mt-1 bg-slate-50 p-2 rounded whitespace-pre-wrap max-h-32 overflow-y-auto">{c.transcript}</p>
                                        </details>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 italic">No consultations recorded yet.</p>
                    )}

                    {/* Prescriptions */}
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2 pt-2">
                        <Pill className="w-4 h-4 text-green-600" /> Prescriptions ({history.prescriptions?.length || 0})
                    </h4>
                    {history.prescriptions?.length > 0 ? (
                        history.prescriptions.map((rx: any) => (
                            <Card key={rx.id} className="shadow-sm">
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-semibold text-green-800">{rx.medication}</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded ml-2">{rx.dosage}</span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded ${rx.status === "Dispensed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                            {rx.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{rx.frequency} • {rx.duration}</p>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 italic">No prescriptions yet.</p>
                    )}

                    {/* Lab Orders */}
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2 pt-2">
                        <Activity className="w-4 h-4 text-blue-600" /> Lab Orders ({history.labOrders?.length || 0})
                    </h4>
                    {history.labOrders?.length > 0 ? (
                        history.labOrders.map((lab: any) => (
                            <Card key={lab.id} className="shadow-sm">
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-blue-800">{lab.test_name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${lab.status?.includes("Completed") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                                            {lab.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">Reason: {lab.reason}</p>
                                    {lab.result && <p className="text-sm text-slate-800 mt-1 bg-slate-50 p-2 rounded font-mono">{lab.result}</p>}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-sm text-slate-400 italic">No lab orders yet.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
