"use client"

import { useEffect, useState } from "react"
import { Plus, CheckCircle, Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import type { Patient } from "@/types/medical"

interface PatientDirectoryProps {
    patients: Patient[]
    selectedPatient: Patient | null
    onSelectPatient: (patient: Patient) => void
}

export function PatientDirectory({ selectedPatient, onSelectPatient }: PatientDirectoryProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [patients, setPatients] = useState<any[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "", age: "", gender: "Male", phone: "", medicalHistory: ""
    })

    // Fetch patients from local SQLite API
    const fetchPatients = async () => {
        try {
            const res = await fetch("/api/patients")
            const data = await res.json()
            if (Array.isArray(data)) setPatients(data)
        } catch (e) {
            console.error("Failed to fetch patients:", e)
        }
    }

    useEffect(() => {
        fetchPatients()
    }, [])

    const handleCreatePatient = async () => {
        if (!formData.name.trim()) return
        try {
            const res = await fetch("/api/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            const newPatient = await res.json()
            if (newPatient && newPatient.id) {
                setPatients(prev => [...prev, newPatient])
            }
        } catch (e) {
            console.error("Failed to create patient:", e)
        }
        setIsDialogOpen(false)
        setFormData({ name: "", age: "", gender: "Male", phone: "", medicalHistory: "" })
    }

    const filteredPatients = patients.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="h-full flex flex-col relative w-full">
            <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-slate-900">Patients List</h2>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" /> Add Patient
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Add Patient Dialog */}
                {isDialogOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-600" /> Register New Patient
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Full Name *</label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g. Rahul Sharma"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Age</label>
                                        <Input
                                            type="number"
                                            value={formData.age}
                                            onChange={e => setFormData(p => ({ ...p, age: e.target.value }))}
                                            placeholder="e.g. 35"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-700">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))}
                                            className="w-full border rounded-md px-3 py-2 text-sm"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Phone</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="e.g. +91 9876543210"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Medical History</label>
                                    <Input
                                        value={formData.medicalHistory}
                                        onChange={e => setFormData(p => ({ ...p, medicalHistory: e.target.value }))}
                                        placeholder="e.g. Diabetes, Hypertension"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-3">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={handleCreatePatient}
                                        disabled={!formData.name.trim()}
                                    >
                                        Register Patient
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredPatients.map((patient) => (
                    <Card
                        key={patient.id}
                        className={`cursor-pointer transition-all shadow-sm hover:shadow-md ${
                            selectedPatient?.id === patient.id
                                ? "ring-2 ring-blue-500 bg-blue-50"
                                : "hover:bg-slate-50"
                        }`}
                        onClick={() => onSelectPatient({
                            ...patient,
                            mrn: patient.id,
                            lastVisit: "",
                            status: "up-to-date",
                            allergies: patient.medicalHistory ? patient.medicalHistory.split(",").map((s: string) => s.trim()) : [],
                            conditions: [],
                            appointmentTime: "",
                        })}
                    >
                        <CardContent className="px-4 py-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-slate-900">{patient.name}</h3>
                                    <p className="text-sm text-slate-500">
                                        Age {patient.age} • {patient.gender} • ID: {patient.id}
                                    </p>
                                    {patient.phone && (
                                        <p className="text-xs text-slate-400 mt-1">📞 {patient.phone}</p>
                                    )}
                                </div>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                            {patient.medicalHistory && (
                                <p className="text-xs text-slate-500 mt-2 bg-slate-50 px-2 py-1 rounded">
                                    History: {patient.medicalHistory}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {filteredPatients.length === 0 && (
                    <p className="text-center text-slate-500 p-4">
                        {searchTerm ? "No matching patients" : "No patients yet. Click '+ Add Patient' to register."}
                    </p>
                )}
            </div>
        </div>
    )
}