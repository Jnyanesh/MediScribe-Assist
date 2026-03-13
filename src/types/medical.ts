export interface Patient {
    id: string
    name: string
    age: number
    mrn: string
    lastVisit: string
    status: "up-to-date" | "pending" | "completed"
    allergies: string[]
    conditions: string[]
    appointmentTime: string
}

export interface VitalSigns {
    bloodPressure: string
    heartRate: number
    temperature: number
    respiratoryRate: number
    oxygenSaturation: number
}

export interface ClinicalNote {
    id: string
    patientId: string
    date: string
    type: "consultation" | "follow-up" | "procedure"
    chiefComplaint: string
    assessment: string
    plan: string
    providerId: string
}
