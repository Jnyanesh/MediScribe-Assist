import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const labs = db.prepare(`
        SELECT l.*, pt.name as patient_name, c.doctor_name
        FROM lab_orders l
        JOIN patients pt ON pt.id = l.patient_id
        JOIN consultations c ON c.id = l.consultation_id
        ORDER BY c.date DESC
    `).all();
    return NextResponse.json(labs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
