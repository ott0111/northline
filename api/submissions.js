import { neon } from '@neondatabase/serverless';

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}})}

export async function GET(){
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  const sql=neon(process.env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS northline_submissions (id BIGSERIAL PRIMARY KEY,type TEXT NOT NULL,data JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  const counts=await sql`SELECT type,COUNT(*)::int AS count FROM northline_submissions GROUP BY type`;
  const recent=await sql`SELECT id,type,created_at AS "createdAt" FROM northline_submissions ORDER BY created_at DESC LIMIT 20`;
  const map=Object.fromEntries(counts.map(x=>[x.type==='brand-brief'?'brand':x.type==='talent-application'?'talent':x.type,x.count]));
  return json({ok:true,counts:{brand:map.brand||0,talent:map.talent||0,total:(map.brand||0)+(map.talent||0)},recent});
}

export async function POST(request){
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  let body;try{body=await request.json()}catch{return json({ok:false,error:'Invalid request.'},400)}
  const type=String(body.type||'').trim();
  if(!['brand-brief','talent-application'].includes(type))return json({ok:false,error:'Invalid submission type.'},400);
  const payload=body.data&&typeof body.data==='object'?body.data:{};
  const data=Object.fromEntries(Object.entries(payload).map(([k,v])=>[String(k).slice(0,80),String(v??'').trim().slice(0,5000)]));
  if(type==='brand-brief'&&!data.email)return json({ok:false,error:'Email is required.'},400);
  const sql=neon(process.env.DATABASE_URL);
  await sql`CREATE TABLE IF NOT EXISTS northline_submissions (id BIGSERIAL PRIMARY KEY,type TEXT NOT NULL,data JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  const [row]=await sql`INSERT INTO northline_submissions(type,data) VALUES(${type},${JSON.stringify(data)}::jsonb) RETURNING id,created_at AS "createdAt"`;
  return json({ok:true,...row});
}