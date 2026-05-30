import { NextRequest, NextResponse } from 'next/server';
import { getDb, RECORDS_COLLECTION } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// GET /api/records — последние сохранённые реквизиты.
export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection(RECORDS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    const records = docs.map((d) => ({
      _id: d._id.toString(),
      text: d.text ?? '',
      total: d.total ?? 0,
      lang: d.lang ?? 'ru',
      payments: d.payments ?? [],
      createdAt: d.createdAt ?? new Date().toISOString(),
    }));

    return NextResponse.json({ records });
  } catch (err) {
    console.error('GET /api/records error', err);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
}

// POST /api/records — сохранить скопированные реквизиты.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string = typeof body.text === 'string' ? body.text : '';

    if (!text.trim()) {
      return NextResponse.json({ error: 'empty_text' }, { status: 400 });
    }

    const doc = {
      text,
      total: typeof body.total === 'number' ? body.total : 0,
      lang: body.lang === 'en' ? 'en' : 'ru',
      payments: Array.isArray(body.payments) ? body.payments : [],
      createdAt: new Date().toISOString(),
    };

    const db = await getDb();
    const result = await db.collection(RECORDS_COLLECTION).insertOne(doc);

    return NextResponse.json({
      record: { _id: result.insertedId.toString(), ...doc },
    });
  } catch (err) {
    console.error('POST /api/records error', err);
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }
}
