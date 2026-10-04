import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  if (!db) return NextResponse.json({ok:false,database:'missing'},{status:503});
  try { await db`SELECT 1`; return NextResponse.json({ok:true,database:'connected'}); }
  catch { return NextResponse.json({ok:false,database:'error'},{status:503}); }
}
