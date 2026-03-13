import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const patients = db.prepare('SELECT * FROM patients').all();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, age, gender, phone, medicalHistory } = await req.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
    }

    const id = 'P' + Date.now();
    const stmt = db.prepare(
      'INSERT INTO patients (id, name, age, gender, phone, medicalHistory) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, name, age || 0, gender || 'Unknown', phone || '', medicalHistory || '');

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
