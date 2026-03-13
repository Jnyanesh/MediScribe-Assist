import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const rx = db.prepare(`
        SELECT p.*, pt.name as patient_name, c.doctor_name
        FROM prescriptions p
        JOIN patients pt ON pt.id = p.patient_id
        JOIN consultations c ON c.id = p.consultation_id
        ORDER BY c.date DESC
    `).all();
    return NextResponse.json(rx);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
