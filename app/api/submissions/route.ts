import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function POST(request: NextRequest) {
  if (!db) return NextResponse.json({ok:false,error:'Database unavailable'},{status:503});
  const body = await request.json().catch(()=>null);
  if (!body || typeof body.type !== 'string' || !body.data || typeof body.data !== 'object') return NextResponse.json({ok:false,error:'Invalid submission'},{status:400});
  const allowed = new Set(['brand-brief','talent-application','contact']);
  if (!allowed.has(body.type)) return NextResponse.json({ok:false,error:'Unsupported submission'},{status:400});
  await db`CREATE TABLE IF NOT EXISTS northline_submissions (id BIGSERIAL PRIMARY KEY, type TEXT NOT NULL, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await db`INSERT INTO northline_submissions (type,data) VALUES (${body.type}, ${JSON.stringify(body.data)}::jsonb)`;
  return NextResponse.json({ok:true});
}