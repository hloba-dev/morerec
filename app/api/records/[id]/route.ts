import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb, RECORDS_COLLECTION } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// DELETE /api/records/:id — удалить сохранённую запись.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'bad_id' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db
      .collection(RECORDS_COLLECTION)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/records/:id error', err);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
}
