import { NextResponse } from 'next/server';
import { getBuilders } from '@/lib/sheets';

export const revalidate = 3600; // revalidate every hour

export async function GET() {
  try {
    const builders = await getBuilders();
    return NextResponse.json({ builders });
  } catch (err) {
    console.error('Data fetch error:', err);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
