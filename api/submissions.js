import { neon } from '@neondatabase/serverless';
import { createHmac, timingSafeEqual } from 'node:crypto';

function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json',...headers}})}
function token(){return createHmac('sha256',process.env.ADMIN_SECRET).update('northline-admin').digest('hex')}
async function ensure(sql){await sql`CREATE TABLE IF NOT EXISTS northline_submissions (id BIGSERIAL PRIMARY KEY,type TEXT NOT NULL,data JSONB NOT NULL,status TEXT NOT NULL DEFAULT 'new',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`}

function authed(request){
  const value=request.headers.get('cookie')?.match(/northline_admin=([^;]+)/)?.[1];
  if(!value||!process.env.ADMIN_SECRET)return false;
  const a=Buffer.from(value),b=Buffer.from(token());
  return a.length===b.length&&timingSafeEqual(a,b);
}
export async function GET(request){
  if(!authed(request))return json({ok:false,error:'Unauthorized.'},401);
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  const sql=neon(process.env.DATABASE_URL); await ensure(sql);
  const counts=await sql`SELECT type,COUNT(*)::int AS count FROM northline_submissions GROUP BY type`;
  const recent=await sql`SELECT id,type,data,status,created_at AS "createdAt" FROM northline_submissions ORDER BY created_at DESC LIMIT 50`;
  const map=Object.fromEntries(counts.map(x=>[x.type==='brand-brief'?'brand':x.type==='talent-application'?'talent':x.type,x.count]));
  return json({ok:true,counts:{brand:map.brand||0,talent:map.talent||0,contact:map.contact||0,total:(map.brand||0)+(map.talent||0)+(map.contact||0)},recent});
}

export async function DELETE(request){
  if(!authed(request))return json({ok:false,error:'Unauthorized.'},401);
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  const id=Number(new URL(request.url).searchParams.get('id'));
  if(!Number.isInteger(id)||id<1)return json({ok:false,error:'Invalid submission id.'},400);
  const sql=neon(process.env.DATABASE_URL);
  const rows=await sql`DELETE FROM northline_submissions WHERE id=${id} RETURNING id`;
  if(!rows.length)return json({ok:false,error:'Submission not found.'},404);
  return json({ok:true});
}

export async function PATCH(request){
  if(!authed(request))return json({ok:false,error:'Unauthorized.'},401);
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  const body=await request.json().catch(()=>null); const id=Number(body?.id); const status=String(body?.status||'');
  if(!Number.isInteger(id)||id<1||!['new','reviewing','contacted','closed'].includes(status))return json({ok:false,error:'Invalid submission update.'},400);
  const sql=neon(process.env.DATABASE_URL); await ensure(sql);
  const rows=await sql`UPDATE northline_submissions SET status=${status} WHERE id=${id} RETURNING id,status`;
  if(!rows.length)return json({ok:false,error:'Submission not found.'},404);
  return json({ok:true,...rows[0]});
}

export async function POST(request){
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  let body;try{body=await request.json()}catch{return json({ok:false,error:'Invalid request.'},400)}
  const type=String(body.type||'').trim();
  if(!['brand-brief','talent-application','contact'].includes(type))return json({ok:false,error:'Invalid submission type.'},400);
  const payload=body.data&&typeof body.data==='object'?body.data:{};
  if(Object.keys(payload).length>30)return json({ok:false,error:'Too many fields.'},400);
  if(String(payload.website||'').trim())return json({ok:true});
  const data=Object.fromEntries(Object.entries(payload).map(([k,v])=>[String(k).slice(0,80),String(v??'').trim().slice(0,5000)]));
  const required=type==='brand-brief'?['company','name','email','type','goal']:type==='talent-application'?['type','name','social','category','about','why']:['name','email','type','subject','message'];
  const missing=required.filter(key=>!data[key]);
  if(missing.length)return json({ok:false,error:'Please complete all required fields.'},400);
  if(['brand-brief','contact'].includes(type)&&!/^\S+@\S+\.\S+$/.test(data.email))return json({ok:false,error:'Please provide a valid email.'},400);
  const sql=neon(process.env.DATABASE_URL);
  const [row]=await sql`INSERT INTO northline_submissions(type,data) VALUES(${type},${JSON.stringify(data)}::jsonb) RETURNING id,created_at AS "createdAt"`;
  if(process.env.RESEND_API_KEY&&process.env.ADMIN_EMAIL&&process.env.FROM_EMAIL){
    const label=type==='brand-brief'?'Brand Brief':type==='talent-application'?'Talent Application':'Contact Message';
    const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const rowsHtml=Object.entries(data).map(([k,v])=>'<tr><td style="padding:8px 12px;color:#777">'+esc(k)+'</td><td style="padding:8px 12px">'+esc(v)+'</td></tr>').join('');
    try{await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.FROM_EMAIL,to:[process.env.ADMIN_EMAIL],subject:'Northline — '+label+' #'+row.id,html:'<h1>Northline</h1><p>New '+esc(label)+' received.</p><table>'+rowsHtml+'</table>'})})}catch{}
  }
  return json({ok:true,...row});
}
