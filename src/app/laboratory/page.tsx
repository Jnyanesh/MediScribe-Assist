"use client"
import { useState, useEffect } from "react"
import { Activity, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LaboratoryDashboard() {
  const [orders, setOrders] = useState<any[]>([])

  const fetchLab = async () => {
    try {
      const res = await fetch('/api/lab')
      const data = await res.json()
      if (Array.isArray(data)) setOrders(data)
    } catch(e) {}
  }

  useEffect(() => {
    fetchLab()
    const interval = setInterval(fetchLab, 5000)
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (id: string, status: string, result?: string) => {
    await fetch(`/api/lab/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, result })
    })
    fetchLab()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center mb-6"><Activity className="mr-3 text-blue-600"/> Laboratory Workspace</h1>
      <div className="grid gap-4">
        {orders.map(order => (
          <div key={order.id} className="border rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-start sm:items-center bg-white">
            <div className="mb-4 sm:mb-0 max-w-2xl">
               <h3 className="font-semibold text-lg">{order.test_name}</h3>
               <p className="text-sm text-slate-600">Patient: {order.patient_name} | Doctor: {order.doctor_name}</p>
               <p className="text-sm text-slate-600">Reason: {order.reason}</p>
               <p className="text-sm font-medium mt-2">Status: <span className={order.status.includes('Completed') ? "text-green-600" : "text-blue-600"}>{order.status}</span></p>
               {order.result && <p className="text-sm mt-2 bg-slate-50 border p-3 rounded text-slate-800 font-mono">Result: {order.result}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              {order.status !== 'Sample Collected' && !order.status.includes('Completed') && (
                <Button onClick={() => updateStatus(order.id, 'Sample Collected')} variant="outline">
                  Mark Sample Collected
                </Button>
              )}
              {order.status === 'Sample Collected' && (
                <Button onClick={() => {
                  const res = prompt("Enter test result summary:")
                  if(res) updateStatus(order.id, 'Completed - Results Available', res)
                }} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="mr-2 h-4 w-4" /> Upload Results
                </Button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-slate-500">No lab orders in queue.</p>}
      </div>
    </div>
  )
}
