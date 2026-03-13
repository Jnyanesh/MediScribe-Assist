import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET patient history: consultations, prescriptions, lab orders
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const consultations = db.prepare(
      'SELECT * FROM consultations WHERE patient_id = ? ORDER BY date DESC'
    ).all(id);

    const prescriptions = db.prepare(
      `SELECT p.*, c.doctor_name, c.date as consultation_date
       FROM prescriptions p 
       JOIN consultations c ON c.id = p.consultation_id 
       WHERE p.patient_id = ? ORDER BY c.date DESC`
    ).all(id);

    const labOrders = db.prepare(
      `SELECT l.*, c.doctor_name, c.date as consultation_date
       FROM lab_orders l 
       JOIN consultations c ON c.id = l.consultation_id 
       WHERE l.patient_id = ? ORDER BY c.date DESC`
    ).all(id);

    const departmentRecords = db.prepare(
      `SELECT dr.*, d.name as department_name, d.icon
       FROM department_records dr 
       JOIN departments d ON d.id = dr.department_id 
       WHERE dr.patient_id = ? ORDER BY dr.created_at DESC`
    ).all(id);

    return NextResponse.json({
      patient,
      consultations,
      prescriptions,
      labOrders,
      departmentRecords,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch patient history' }, { status: 500 });
  }
}

// PATCH update patient details
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, age, gender, phone, medicalHistory } = await req.json();

    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (age !== undefined) { updates.push('age = ?'); values.push(age); }
    if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (medicalHistory !== undefined) { updates.push('medicalHistory = ?'); values.push(medicalHistory); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    db.prepare(`UPDATE patients SET ${updates.join(', ')} WHERE id = ?`).run(...values);

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}
