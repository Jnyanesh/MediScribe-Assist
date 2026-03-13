"use client"

import { useState, useEffect } from "react"
import { PatientDirectory } from "@/components/patient-directory"
import { PatientInterface } from "@/components/patient-interface"

import { TopNavigation } from "@/components/top-navigation"
import type { Patient } from "@/types/medical"
import {isAuthenticated} from "@/lib/auth";
import {useRouter} from "next/navigation";

// Mock patient data
const mockPatients: Patient[] = [
    {
        id: "1",
        name: "Sarah Johnson",
        age: 34,
        mrn: "MRN-001234",
        lastVisit: "2024-01-05",
        status: "pending",
        allergies: ["Penicillin", "Shellfish"],
        conditions: ["Hypertension", "Diabetes Type 2"],
        appointmentTime: "09:00 AM",
    },
    {
        id: "2",
        name: "Michael Chen",
        age: 67,
        mrn: "MRN-005678",
        lastVisit: "2024-01-03",
        status: "up-to-date",
        allergies: ["Latex"],
        conditions: ["COPD", "Arthritis"],
        appointmentTime: "09:30 AM",
    },
    {
        id: "3",
        name: "Emily Rodriguez",
        age: 28,
        mrn: "MRN-009876",
        lastVisit: "2023-12-15",
        status: "up-to-date",
        allergies: [],
        conditions: [],
        appointmentTime: "10:00 AM",
    },
    {
        id: "4",
        name: "Robert Williams",
        age: 45,
        mrn: "MRN-004321",
        lastVisit: "2024-01-04",
        status: "up-to-date",
        allergies: ["Aspirin"],
        conditions: ["High Cholesterol"],
        appointmentTime: "10:30 AM",
    },
]

export default function Dashboard() {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(mockPatients[0])
    const [isRecording, setIsRecording] = useState(false)
    const [sessionTime, setSessionTime] = useState(0)
    const [activeMode, setActiveMode] = useState<"selection" | "listen" | "summary" | "history">("selection")
    const router = useRouter();

    useEffect(() => {
        isAuthenticated().then(r => !r && router.replace('/login')).catch(() => router.replace("/login"))
    }, []);

    useEffect(() => {
        // Recording logic disabled
    }, [isRecording])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <TopNavigation />

            <div className="flex h-[calc(100vh-4rem)]">
                {/* Left Panel - Patient Directory */}
                <div className="w-full lg:w-[20%] border-r border-slate-200 bg-white">
                    <PatientDirectory
                        patients={mockPatients}
                        selectedPatient={selectedPatient}
                        onSelectPatient={setSelectedPatient}
                    />
                </div>

                {/* Center Panel - Voice Interface */}
                <div className="hidden lg:block lg:flex-1 border-r border-slate-200 bg-white">
                    <PatientInterface
                        selectedPatient={selectedPatient}
                        isRecording={isRecording}
                        onToggleRecording={() => setIsRecording(!isRecording)}
                        sessionTime={formatTime(sessionTime)}
                        onResetSession={() => setSessionTime(0)}
                        activeMode={activeMode}
                        onModeChange={setActiveMode}
                        onBack={() => setSelectedPatient(null)}
                    />
                </div>


            </div>

            {/* Mobile Voice Interface - Shows when patient is selected on mobile */}
            <div className="lg:hidden">
                {selectedPatient && (
                    <div className="fixed inset-0 bg-white z-50">
                        <PatientInterface
                            selectedPatient={selectedPatient}
                            isRecording={isRecording}
                            onToggleRecording={() => setIsRecording(!isRecording)}
                            sessionTime={formatTime(sessionTime)}
                            onResetSession={() => setSessionTime(0)}
                            onBack={() => setSelectedPatient(null)}
                            activeMode={activeMode}
                            onModeChange={setActiveMode}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
