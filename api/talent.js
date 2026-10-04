import { neon } from '@neondatabase/serverless';
import { createHmac, timingSafeEqual } from 'node:crypto';
export const runtime='nodejs';
function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store',...headers}})}
function authed(request){
 const value=request.headers.get('cookie')?.match(/(?:^|; )__Host-northline_admin=([^;]+)/)?.[1];
 if(!value||!process.env.ADMIN_SECRET)return false;
 const [payload,sig]=String(value).split('.'); const exp=Number(payload);
 if(!Number.isFinite(exp)||exp<Date.now()||!sig)return false;
 const expected=createHmac('sha256',process.env.ADMIN_SECRET).update('northline-admin:'+payload).digest('hex');
 const a=Buffer.from(sig),b=Buffer.from(expected); return a.length===b.length&&timingSafeEqual(a,b);
}
async function ensure(sql){return sql`CREATE TABLE IF NOT EXISTS northline_talent_notes (talent_handle TEXT PRIMARY KEY,status TEXT NOT NULL DEFAULT 'active',note TEXT NOT NULL DEFAULT '',updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`}
export async function GET(request){
 if(!authed(request))return json({ok:false,error:'Unauthorized.'},401);
 const base=await fetch(new URL('/data/talent/index.json',request.url),{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]);
 if(!process.env.DATABASE_URL)return json({ok:true,talent:base.map(x=>({...x,internalStatus:'active',note:''}))});
 const sql=neon(process.env.DATABASE_URL); await ensure(sql);
 const notes=await sql`SELECT talent_handle AS "talentHandle",status,note,updated_at AS "updatedAt" FROM northline_talent_notes`;
 const map=new Map(notes.map(x=>[x.talentHandle,x]));
 return json({ok:true,talent:base.map(x=>({...x,internalStatus:map.get(x.handle)?.status||'active',note:map.get(x.handle)?.note||'',noteUpdatedAt:map.get(x.handle)?.updatedAt||null}))});
}
export async function PATCH(request){
 if(!authed(request))return json({ok:false,error:'Unauthorized.'},401);
 if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
 const body=await request.json().catch(()=>null), talentHandle=String(body?.talentHandle||'').trim().slice(0,100), status=String(body?.status||'active').trim(), note=String(body?.note||'').trim().slice(0,4000);
 if(!talentHandle||!['active','paused','prospect','former'].includes(status))return json({ok:false,error:'Invalid talent update.'},400);
 const sql=neon(process.env.DATABASE_URL); await ensure(sql);
 const [row]=await sql`INSERT INTO northline_talent_notes(talent_handle,status,note) VALUES(${talentHandle},${status},${note}) ON CONFLICT(talent_handle) DO UPDATE SET status=EXCLUDED.status,note=EXCLUDED.note,updated_at=NOW() RETURNING talent_handle AS "talentHandle",status,note,updated_at AS "updatedAt"`;
 return json({ok:true,...row});
}
