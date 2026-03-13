"use client"
import { useState, useEffect } from "react"
import { Pill, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PharmacyDashboard() {
  const [prescriptions, setPrescriptions] = useState<any[]>([])

  const fetchRx = async () => {
    try {
      const res = await fetch('/api/pharmacy')
      const data = await res.json()
      if (Array.isArray(data)) setPrescriptions(data)
    } catch(e) {}
  }

  useEffect(() => {
    fetchRx()
    const interval = setInterval(fetchRx, 5000)
    return () => clearInterval(interval)
  }, [])

  const markDispensed = async (id: string) => {
    await fetch(`/api/pharmacy/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Dispensed' })
    })
    fetchRx()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center mb-6"><Pill className="mr-3 text-green-600"/> Pharmacy Workspace</h1>
      <div className="grid gap-4">
        {prescriptions.map(rx => (
          <div key={rx.id} className="border rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white">
            <div className="mb-4 sm:mb-0">
               <h3 className="font-semibold text-lg">{rx.medication} ({rx.dosage})</h3>
               <p className="text-sm text-slate-600">Patient: {rx.patient_name} | Doctor: {rx.doctor_name}</p>
               <p className="text-sm text-slate-600">Instructions: {rx.frequency} for {rx.duration}</p>
               <p className="text-sm font-medium mt-2">Status: <span className={rx.status === 'Dispensed' ? "text-green-600" : "text-yellow-600"}>{rx.status}</span></p>
            </div>
            {rx.status !== 'Dispensed' && (
              <Button onClick={() => markDispensed(rx.id)} className="bg-green-600 hover:bg-green-700 text-white shrink-0">
                <CheckCircle className="mr-2 h-4 w-4" /> Mark Dispensed
              </Button>
            )}
          </div>
        ))}
        {prescriptions.length === 0 && <p className="text-slate-500">No prescriptions in queue.</p>}
      </div>
    </div>
  )
}
