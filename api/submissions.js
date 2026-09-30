import { neon } from '@neondatabase/serverless';
import { createHmac, timingSafeEqual } from 'node:crypto';

function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json',...headers}})}
function token(){return createHmac('sha256',process.env.ADMIN_SECRET).update('northline-admin').digest('hex')}
function authed(request){
  const value=request.headers.get('cookie')?.match(/northline_admin=([^;]+)/)?.[1];
  if(!value||!process.env.ADMIN_SECRET)return false;
  const a=Buffer.from(value),b=Buffer.from(token());
  return a.length===b.length&&timingSafeEqual(a,b);
}
async function ensure(sql){await sql`CREATE TABLE IF NOT EXISTS northline_submissions (id BIGSERIAL PRIMARY KEY,type TEXT NOT NULL,data JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`}

export async function GET(request){
  if(!authed(request))return json({ok:false,error:'Unauthorized.'},401);
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  const sql=neon(process.env.DATABASE_URL); await ensure(sql);
  const counts=await sql`SELECT type,COUNT(*)::int AS count FROM northline_submissions GROUP BY type`;
  const recent=await sql`SELECT id,type,data,created_at AS "createdAt" FROM northline_submissions ORDER BY created_at DESC LIMIT 50`;
  const map=Object.fromEntries(counts.map(x=>[x.type==='brand-brief'?'brand':x.type==='talent-application'?'talent':x.type,x.count]));
  return json({ok:true,counts:{brand:map.brand||0,talent:map.talent||0,total:(map.brand||0)+(map.talent||0)},recent});
}

export async function DELETE(request){
  if(!authed(request))return json({ok:false,error:'Unauthorized.'},401);
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  const id=Number(new URL(request.url).searchParams.get('id'));
  if(!Number.isInteger(id)||id<1)return json({ok:false,error:'Invalid submission id.'},400);
  const sql=neon(process.env.DATABASE_URL); await ensure(sql);
  const rows=await sql`DELETE FROM northline_submissions WHERE id=${id} RETURNING id`;
  if(!rows.length)return json({ok:false,error:'Submission not found.'},404);
  return json({ok:true});
}

export async function POST(request){
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  let body;try{body=await request.json()}catch{return json({ok:false,error:'Invalid request.'},400)}
  const type=String(body.type||'').trim();
  if(!['brand-brief','talent-application'].includes(type))return json({ok:false,error:'Invalid submission type.'},400);
  const payload=body.data&&typeof body.data==='object'?body.data:{};
  const data=Object.fromEntries(Object.entries(payload).map(([k,v])=>[String(k).slice(0,80),String(v??'').trim().slice(0,5000)]));
  if(type==='brand-brief'&&!data.email)return json({ok:false,error:'Email is required.'},400);
  const sql=neon(process.env.DATABASE_URL); await ensure(sql);
  const [row]=await sql`INSERT INTO northline_submissions(type,data) VALUES(${type},${JSON.stringify(data)}::jsonb) RETURNING id,created_at AS "createdAt"`;
  return json({ok:true,...row});
}
