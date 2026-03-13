import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { status, result } = await req.json();
    if (result) {
        const update = db.prepare('UPDATE lab_orders SET status = ?, result = ? WHERE id = ?');
        update.run(status, result, resolvedParams.id);
    } else {
        const update = db.prepare('UPDATE lab_orders SET status = ? WHERE id = ?');
        update.run(status, resolvedParams.id);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
