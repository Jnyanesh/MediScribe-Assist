"use client"

import { useState } from "react"
import { Shield, User, Activity, Beaker, Building2, ChevronDown, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const DOCTORS = [
    { id: "dr-smith", name: "Dr. Smith", specialty: "General Medicine" },
    { id: "dr-patel", name: "Dr. Patel", specialty: "Pediatrics" },
    { id: "dr-kumar", name: "Dr. Kumar", specialty: "Cardiology" },
    { id: "dr-sharma", name: "Dr. Sharma", specialty: "Orthopedics" },
]

export function TopNavigation() {
    const [activeDoctor, setActiveDoctor] = useState(DOCTORS[0])
    const [showDoctorMenu, setShowDoctorMenu] = useState(false)

    return (
        <header className="h-14 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-blue-800/50 flex items-center justify-between px-6 shadow-lg">
            <div className="flex items-center space-x-8">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center space-x-2.5 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-blue-500/30 transition-shadow">
                        <Stethoscope className="w-4.5 h-4.5 text-white" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-white">
                        Medi<span className="text-blue-400">Scribe</span>
                    </h1>
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center space-x-0.5">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-blue-800/50 font-medium text-sm">
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/pharmacy">
                        <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-blue-800/50 font-medium text-sm">
                            <Activity className="w-3.5 h-3.5 mr-1.5" /> Pharmacy
                        </Button>
                    </Link>
                    <Link href="/laboratory">
                        <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-blue-800/50 font-medium text-sm">
                            <Beaker className="w-3.5 h-3.5 mr-1.5" /> Laboratory
                        </Button>
                    </Link>
                    <Link href="/departments">
                        <Button variant="ghost" size="sm" className="text-blue-200 hover:text-white hover:bg-blue-800/50 font-medium text-sm">
                            <Building2 className="w-3.5 h-3.5 mr-1.5" /> Departments
                        </Button>
                    </Link>
                </nav>
            </div>

            {/* Doctor Switcher */}
            <div className="relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDoctorMenu(!showDoctorMenu)}
                    className="bg-blue-800/40 hover:bg-blue-800/60 text-white rounded-full px-3 h-9 flex items-center gap-2 border border-blue-700/40"
                >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                        {activeDoctor.name.charAt(4)}
                    </div>
                    <div className="hidden sm:block text-left">
                        <span className="text-sm font-semibold">{activeDoctor.name}</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
                </Button>

                {showDoctorMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowDoctorMenu(false)} />
                        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-1 overflow-hidden">
                            <div className="px-3 py-2 border-b border-slate-100">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Switch Doctor</p>
                            </div>
                            {DOCTORS.map(doctor => (
                                <button
                                    key={doctor.id}
                                    onClick={() => {
                                        setActiveDoctor(doctor)
                                        setShowDoctorMenu(false)
                                    }}
                                    className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                                        activeDoctor.id === doctor.id
                                            ? "bg-blue-50 text-blue-700"
                                            : "hover:bg-slate-50 text-slate-700"
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                                        activeDoctor.id === doctor.id ? "bg-blue-600" : "bg-slate-400"
                                    }`}>
                                        {doctor.name.charAt(4)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{doctor.name}</p>
                                        <p className="text-xs text-slate-400">{doctor.specialty}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </header>
    )
}
