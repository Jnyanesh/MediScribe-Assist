"use client"
import { useState, useEffect } from "react"
import { Building2, Plus, Settings, ChevronRight, CheckCircle, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Department {
    id: string
    name: string
    description: string
    icon: string
    fields: string
    created_at: string
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        name: "", description: "", icon: "🏥", fields: ""
    })

    const fetchDepartments = async () => {
        try {
            const res = await fetch("/api/departments")
            const data = await res.json()
            if (Array.isArray(data)) setDepartments(data)
        } catch (e) {
            console.error("Failed to fetch departments:", e)
        }
    }

    useEffect(() => { fetchDepartments() }, [])

    const handleCreate = async () => {
        if (!formData.name.trim()) return
        try {
            const fields = formData.fields
                .split(",")
                .map(f => f.trim())
                .filter(f => f.length > 0)

            const res = await fetch("/api/departments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, fields }),
            })
            const data = await res.json()
            if (data.id) {
                setDepartments(prev => [...prev, data])
                setShowAddForm(false)
                setFormData({ name: "", description: "", icon: "🏥", fields: "" })
            } else {
                alert(data.error || "Failed to create department")
            }
        } catch (e) {
            alert("Error creating department")
        }
    }

    const iconOptions = ["🏥", "💊", "🔬", "📡", "🏃", "🩺", "🧪", "🩻", "🦷", "👁️", "🧠", "❤️", "🦴", "🫁"]

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/20">
            <div className="p-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                            <Building2 className="text-blue-600" /> Hospital Departments
                        </h1>
                        <p className="text-slate-500 mt-1">Manage departments and their workflows</p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Department
                    </Button>
                </div>

                {/* Add Department Form */}
                {showAddForm && (
                    <div className="bg-white rounded-xl p-6 shadow-lg border mb-8">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-600" /> New Department
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Department Name *</label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    placeholder="e.g. Cardiology"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Icon</label>
                                <div className="flex gap-1 flex-wrap mt-1">
                                    {iconOptions.map(icon => (
                                        <button
                                            key={icon}
                                            onClick={() => setFormData(p => ({ ...p, icon }))}
                                            className={`text-2xl p-1 rounded-lg border-2 transition-all ${
                                                formData.icon === icon ? "border-blue-500 bg-blue-50" : "border-transparent hover:border-slate-200"
                                            }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Description</label>
                                <Input
                                    value={formData.description}
                                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    placeholder="e.g. Heart-related diagnosis and treatment"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-slate-700">Custom Fields (comma-separated)</label>
                                <Input
                                    value={formData.fields}
                                    onChange={e => setFormData(p => ({ ...p, fields: e.target.value }))}
                                    placeholder="e.g. ecg_result, blood_pressure, cholesterol_level"
                                />
                                <p className="text-xs text-slate-400 mt-1">Define custom data fields for this department</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleCreate}
                                disabled={!formData.name.trim()}
                            >
                                Create Department
                            </Button>
                        </div>
                    </div>
                )}

                {/* Department Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    {departments.map(dept => {
                        let parsedFields: string[] = []
                        try { parsedFields = JSON.parse(dept.fields || "[]") } catch { }

                        return (
                            <div
                                key={dept.id}
                                className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{dept.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900">{dept.name}</h3>
                                            <p className="text-sm text-slate-500">{dept.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                                {parsedFields.length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-slate-400 mb-2">Data Fields:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {parsedFields.map((field: string, i: number) => (
                                                <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">
                                                    {field}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Active</span>
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Open</span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {departments.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium">No departments configured</p>
                        <p className="text-sm mt-1">Click &quot;Add Department&quot; to set up hospital departments</p>
                    </div>
                )}
            </div>
        </div>
    )
}
