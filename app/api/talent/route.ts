import { NextRequest, NextResponse } from 'next/server';
import { ensureTalentTable, db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const handle = request.nextUrl.searchParams.get('handle')?.trim();
  if (!handle || !db) return NextResponse.json({ok:false,error:'Not found'},{status:404});
  await ensureTalentTable();
  const rows = await db`SELECT talent_handle AS "talentHandle", name, bio, category, discipline,
    public_status AS "publicStatus", pfp, socials FROM northline_talent_profiles
    WHERE lower(talent_handle)=lower(${handle}) AND public_status='published' LIMIT 1`;
  if (!rows.length) return NextResponse.json({ok:false,error:'Not found'},{status:404});
  return NextResponse.json({ok:true,profile:rows[0]},{headers:{'cache-control':'public, s-maxage=60, stale-while-revalidate=300'}});
}
