import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET all departments
export async function GET() {
  try {
    const departments = db.prepare('SELECT * FROM departments ORDER BY name').all();
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

// POST create a new department
export async function POST(req: Request) {
  try {
    const { name, description, icon, fields } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    const id = 'DEPT_' + Date.now();
    const stmt = db.prepare(
      'INSERT INTO departments (id, name, description, icon, fields) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(id, name, description || '', icon || '🏥', JSON.stringify(fields || []));

    const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
    return NextResponse.json(dept);
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Department with this name already exists' }, { status: 409 });
    }
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
