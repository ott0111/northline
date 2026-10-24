import { neon } from '@neondatabase/serverless';

function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json',...headers}})}
export function OPTIONS(){return new Response(null,{status:204})}
const submissionAttempts=new Map();
const SUBMISSION_WINDOW=10*60*1000;
const SUBMISSION_LIMIT=12;
const MAX_BODY_BYTES=25000;
const getClientKey=request=>request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';

let schemaReady;
async function ensure(sql){
  if(schemaReady)return schemaReady;
  schemaReady=sql`CREATE TABLE IF NOT EXISTS northline_submissions (id BIGSERIAL PRIMARY KEY,type TEXT NOT NULL,data JSONB NOT NULL,status TEXT NOT NULL DEFAULT 'new',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`.catch(error=>{schemaReady=null;throw error});
  return schemaReady;
}


export async function POST(request){
  const key=getClientKey(request),now=Date.now();
  const recent=(submissionAttempts.get(key)||[]).filter(t=>now-t<SUBMISSION_WINDOW);
  if(recent.length>=SUBMISSION_LIMIT)return json({ok:false,error:'Too many submissions. Please try again later.'},429,{'retry-after':'600'});
  recent.push(now); submissionAttempts.set(key,recent);
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  let body;try{const raw=await request.text();if(raw.length>MAX_BODY_BYTES)return json({ok:false,error:'Request is too large.'},413);body=JSON.parse(raw)}catch{return json({ok:false,error:'Invalid request.'},400)}
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
  const sql=neon(process.env.DATABASE_URL); await ensure(sql);
  const [row]=await sql`INSERT INTO northline_submissions(type,data) VALUES(${type},${JSON.stringify(data)}::jsonb) RETURNING id,created_at AS "createdAt"`;
  if(process.env.RESEND_API_KEY&&process.env.NOTIFICATION_EMAIL&&process.env.FROM_EMAIL){
    const label=type==='brand-brief'?'Brand Brief':type==='talent-application'?'Talent Application':'Contact Message';
    const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const rowsHtml=Object.entries(data).map(([k,v])=>'<tr><td style="padding:8px 12px;color:#777">'+esc(k)+'</td><td style="padding:8px 12px">'+esc(v)+'</td></tr>').join('');
    try{await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.FROM_EMAIL,to:[process.env.NOTIFICATION_EMAIL],subject:'Northline — '+label+' #'+row.id,html:'<h1>Northline</h1><p>New '+esc(label)+' received.</p><table>'+rowsHtml+'</table>'})})}catch{}
  }
  return json({ok:true,...row});
}
