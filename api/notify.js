import { neon } from '@neondatabase/serverless';

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json'}})}

export async function POST(request){
  if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
  if(!process.env.RESEND_API_KEY||!process.env.ADMIN_EMAIL||!process.env.FROM_EMAIL)return json({ok:false,error:'Email is not configured yet.'},503);
  const body=await request.json().catch(()=>null);
  const id=Number(body?.id);
  if(!Number.isInteger(id)||id<1)return json({ok:false,error:'Invalid submission id.'},400);
  const sql=neon(process.env.DATABASE_URL);
  const rows=await sql`SELECT id,type,data,created_at AS "createdAt" FROM northline_submissions WHERE id=${id}`;
  if(!rows.length)return json({ok:false,error:'Submission not found.'},404);
  const item=rows[0];
  const label=item.type==='brand-brief'?'Brand Brief':'Talent Application';
  const rowsHtml=Object.entries(item.data||{}).map(([k,v])=>'<tr><td style="padding:8px 12px;color:#777">'+String(k).replace(/[<>&"]/g,'')+'</td><td style="padding:8px 12px">'+String(v??'').replace(/[<>&"]/g,'')+'</td></tr>').join('');
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.FROM_EMAIL,to:[process.env.ADMIN_EMAIL],subject:'Northline — '+label+' #'+item.id,html:'<h1>Northline</h1><p>New '+label+' received.</p><table>'+rowsHtml+'</table>'})});
  if(!response.ok)return json({ok:false,error:'Email provider rejected the request.'},502);
  return json({ok:true});
}
