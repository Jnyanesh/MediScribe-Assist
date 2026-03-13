import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { patientId, doctorName, transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Enhanced keyword-based NLP extraction (mock LLM)
    // Covers 20+ common symptoms in English and Hindi
    const lower = transcript.toLowerCase();
    
    let symptoms: string[] = [];
    let prescriptions: { med: string; dosage: string; freq: string; dur: string }[] = [];
    let labOrders: { test: string; reason: string }[] = [];
    let followUp = "";

    // ── Symptom Detection (English + Hindi) ──
    const symptomMap: Record<string, string> = {
      "fever": "Fever", "बुखार": "Fever (बुखार)",
      "headache": "Headache", "सिरदर्द": "Headache (सिरदर्द)", "head pain": "Headache",
      "cough": "Cough", "खांसी": "Cough (खांसी)", "dry cough": "Dry Cough",
      "cold": "Cold/Rhinitis", "सर्दी": "Cold (सर्दी)", "runny nose": "Rhinitis",
      "sore throat": "Sore Throat", "गला दर्द": "Sore Throat (गला दर्द)",
      "chest pain": "Chest Pain", "छाती में दर्द": "Chest Pain (छाती में दर्द)",
      "stomach pain": "Abdominal Pain", "पेट दर्द": "Abdominal Pain (पेट दर्द)", "abdominal": "Abdominal Pain",
      "vomiting": "Vomiting", "उल्टी": "Vomiting (उल्टी)", "nausea": "Nausea",
      "diarrhea": "Diarrhea", "दस्त": "Diarrhea (दस्त)", "loose motion": "Diarrhea",
      "body pain": "Body Pain/Myalgia", "बदन दर्द": "Body Pain (बदन दर्द)", "body ache": "Body Pain",
      "fatigue": "Fatigue", "थकान": "Fatigue (थकान)", "weakness": "Weakness", "कमज़ोरी": "Weakness",
      "dizziness": "Dizziness", "चक्कर": "Dizziness (चक्कर)",
      "breathing": "Breathing Difficulty", "सांस": "Breathing Issue (सांस)", "breathlessness": "Dyspnea",
      "back pain": "Back Pain", "कमर दर्द": "Back Pain (कमर दर्द)",
      "joint pain": "Joint Pain", "जोड़ों में दर्द": "Joint Pain",
      "rash": "Skin Rash", "itching": "Itching/Pruritus", "खुजली": "Itching (खुजली)",
      "diabetes": "Diabetes", "sugar": "Diabetes/Hyperglycemia", "मधुमेह": "Diabetes",
      "blood pressure": "Hypertension", "bp": "Blood Pressure Issue",
      "swelling": "Edema/Swelling", "सूजन": "Swelling (सूजन)",
      "weight loss": "Unexplained Weight Loss", "weight gain": "Weight Gain",
      "allergy": "Allergic Reaction", "एलर्जी": "Allergic Reaction",
      "anxiety": "Anxiety", "insomnia": "Insomnia", "नींद": "Sleep Issues",
      "infection": "Suspected Infection", "pain": "Pain (General)", "दर्द": "Pain (दर्द)",
    };

    for (const [keyword, symptom] of Object.entries(symptomMap)) {
      if (lower.includes(keyword) && !symptoms.includes(symptom)) {
        symptoms.push(symptom);
      }
    }

    // ── Prescription Generation based on symptoms ──
    if (lower.includes("fever") || lower.includes("बुखार")) {
      prescriptions.push({ med: "Paracetamol (Dolo 650)", dosage: "650mg", freq: "Twice daily after food", dur: "3 days" });
    }
    if (lower.includes("headache") || lower.includes("सिरदर्द") || lower.includes("head pain")) {
      if (!prescriptions.some(p => p.med.includes("Paracetamol"))) {
        prescriptions.push({ med: "Paracetamol", dosage: "500mg", freq: "As needed (max 3/day)", dur: "3 days" });
      }
    }
    if (lower.includes("cough") || lower.includes("खांसी")) {
      prescriptions.push({ med: "Cough Syrup (Benadryl)", dosage: "10ml", freq: "Three times daily", dur: "5 days" });
    }
    if (lower.includes("cold") || lower.includes("सर्दी") || lower.includes("runny nose")) {
      prescriptions.push({ med: "Cetirizine", dosage: "10mg", freq: "Once daily at night", dur: "5 days" });
    }
    if (lower.includes("sore throat") || lower.includes("गला")) {
      prescriptions.push({ med: "Strepsils / Throat lozenges", dosage: "1 lozenge", freq: "Every 4 hours", dur: "3 days" });
    }
    if (lower.includes("vomiting") || lower.includes("उल्टी") || lower.includes("nausea")) {
      prescriptions.push({ med: "Ondansetron (Emeset)", dosage: "4mg", freq: "Before meals", dur: "3 days" });
    }
    if (lower.includes("diarrhea") || lower.includes("दस्त") || lower.includes("loose motion")) {
      prescriptions.push({ med: "ORS Sachets", dosage: "1 packet in 1L water", freq: "Sip throughout day", dur: "3 days" });
      prescriptions.push({ med: "Racecadotril", dosage: "100mg", freq: "Three times daily", dur: "3 days" });
    }
    if (lower.includes("stomach pain") || lower.includes("पेट दर्द") || lower.includes("abdominal")) {
      prescriptions.push({ med: "Pantoprazole", dosage: "40mg", freq: "Once daily before breakfast", dur: "7 days" });
    }
    if (lower.includes("body pain") || lower.includes("बदन दर्द") || lower.includes("joint pain") || lower.includes("back pain")) {
      prescriptions.push({ med: "Ibuprofen", dosage: "400mg", freq: "Twice daily after food", dur: "5 days" });
    }
    if (lower.includes("allergy") || lower.includes("एलर्जी") || lower.includes("itching") || lower.includes("rash")) {
      prescriptions.push({ med: "Cetirizine", dosage: "10mg", freq: "Once daily", dur: "7 days" });
    }
    if (lower.includes("infection")) {
      prescriptions.push({ med: "Amoxicillin", dosage: "500mg", freq: "Three times daily", dur: "5 days" });
    }
    if (lower.includes("anxiety") || lower.includes("insomnia") || lower.includes("नींद")) {
      prescriptions.push({ med: "Melatonin", dosage: "3mg", freq: "Once at bedtime", dur: "14 days" });
    }
    if (lower.includes("breathing") || lower.includes("सांस") || lower.includes("breathlessness")) {
      prescriptions.push({ med: "Salbutamol Inhaler", dosage: "2 puffs", freq: "As needed", dur: "30 days" });
    }

    // ── Lab Orders based on symptoms ──
    if (lower.includes("fever") || lower.includes("बुखार") || lower.includes("infection")) {
      labOrders.push({ test: "Complete Blood Count (CBC)", reason: "Check for infection / WBC levels" });
    }
    if (lower.includes("chest") || lower.includes("breathing") || lower.includes("cough")) {
      labOrders.push({ test: "Chest X-Ray", reason: "Rule out pneumonia / respiratory infection" });
    }
    if (lower.includes("diabetes") || lower.includes("sugar") || lower.includes("मधुमेह")) {
      labOrders.push({ test: "HbA1c + Fasting Blood Sugar", reason: "Monitor glucose levels" });
    }
    if (lower.includes("blood pressure") || lower.includes("bp") || lower.includes("swelling")) {
      labOrders.push({ test: "Kidney Function Test (KFT)", reason: "Check renal parameters" });
      labOrders.push({ test: "Lipid Profile", reason: "Assess cardiovascular risk" });
    }
    if (lower.includes("fatigue") || lower.includes("weakness") || lower.includes("थकान") || lower.includes("dizziness")) {
      labOrders.push({ test: "Thyroid Function Test (TFT)", reason: "Rule out hypothyroidism" });
      labOrders.push({ test: "Vitamin D + B12 Levels", reason: "Check for deficiencies" });
    }
    if (lower.includes("vomiting") || lower.includes("stomach") || lower.includes("diarrhea")) {
      labOrders.push({ test: "Liver Function Test (LFT)", reason: "Evaluate hepatic function" });
    }
    if (lower.includes("joint pain") || lower.includes("swelling")) {
      labOrders.push({ test: "Uric Acid + RA Factor", reason: "Rule out gout / rheumatoid arthritis" });
    }

    // Default if nothing detected
    if (symptoms.length === 0) {
      symptoms.push("General consultation - no specific symptoms detected");
    }
    if (prescriptions.length === 0) {
      prescriptions.push({ med: "Multivitamin", dosage: "1 tablet", freq: "Once daily", dur: "30 days" });
    }

    // ── Follow-up ──
    if (labOrders.length > 0) {
      followUp = "Follow-up visit in 3 days after lab results are available.";
    } else {
      followUp = "Follow up if symptoms persist beyond 5 days.";
    }

    // ── Build Summary ──
    const summary = `Clinical Summary:\n` +
      `Symptoms: ${symptoms.join(", ")}\n` +
      `Prescriptions: ${prescriptions.map(p => `${p.med} ${p.dosage}`).join(", ")}\n` +
      `Lab Tests: ${labOrders.length > 0 ? labOrders.map(l => l.test).join(", ") : "None ordered"}\n` +
      `Follow-up: ${followUp}`;

    // ── Ensure patient exists ──
    const ensurePatient = db.prepare(
      'INSERT OR IGNORE INTO patients (id, name, age, gender, phone, medicalHistory) VALUES (?, ?, ?, ?, ?, ?)'
    );
    ensurePatient.run(patientId || 'P001', 'Walk-in Patient', 0, 'Unknown', '', '');

    // ── Insert Consultation ──
    const consultationId = 'C' + Date.now();
    const date = new Date().toISOString();

    const insertConsult = db.prepare(
      'INSERT INTO consultations (id, patient_id, doctor_name, date, transcript, summary) VALUES (?, ?, ?, ?, ?, ?)'
    );
    insertConsult.run(consultationId, patientId || 'P001', doctorName || 'Dr. Smith', date, transcript, summary);

    // ── Insert Prescriptions ──
    const insertRx = db.prepare(
      'INSERT INTO prescriptions (id, consultation_id, patient_id, medication, dosage, frequency, duration) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    prescriptions.forEach((p, i) => {
      insertRx.run(`RX${Date.now()}-${i}`, consultationId, patientId || 'P001', p.med, p.dosage, p.freq, p.dur);
    });

    // ── Insert Lab Orders ──
    const insertLab = db.prepare(
      'INSERT INTO lab_orders (id, consultation_id, patient_id, test_name, reason) VALUES (?, ?, ?, ?, ?)'
    );
    labOrders.forEach((l, i) => {
      insertLab.run(`LAB${Date.now()}-${i}`, consultationId, patientId || 'P001', l.test, l.reason);
    });

    return NextResponse.json({
      success: true,
      consultationId,
      summary,
      symptoms,
      prescriptions,
      labOrders,
      followUp,
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: 'Failed to process consultation' }, { status: 500 });
  }
}
