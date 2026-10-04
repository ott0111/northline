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
async function ensure(sql){return sql`CREATE TABLE IF NOT EXISTS northline_talent_profiles (
 talent_handle TEXT PRIMARY KEY,name TEXT,bio TEXT,category TEXT,discipline TEXT,public_status TEXT,pfp TEXT,
 socials JSONB NOT NULL DEFAULT '{}'::jsonb,status TEXT NOT NULL DEFAULT 'active',note TEXT NOT NULL DEFAULT '',
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`}
const clean=v=>String(v??'').trim();
const safeUrl=v=>{const value=clean(v).slice(0,1000);if(!value)return '';if(/^https?:\/\//i.test(value)||value.startsWith('/')||value.startsWith('./'))return value;return ''};
export async function GET(request){
 if(!authed(request))return json({ok:false,error:'Unauthorized.'},401);
 const base=await fetch(new URL('/data/talent/index.json',request.url),{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]);
 if(!process.env.DATABASE_URL)return json({ok:true,talent:base.map(x=>({...x,internalStatus:'active',note:''}))});
 const sql=neon(process.env.DATABASE_URL);await ensure(sql);
 const rows=await sql`SELECT talent_handle AS "talentHandle",name,bio,category,discipline,public_status AS "publicStatus",pfp,socials,status,note,updated_at AS "updatedAt" FROM northline_talent_profiles`;
 const map=new Map(rows.map(x=>[x.talentHandle,x]));
 return json({ok:true,talent:base.map(x=>{
  const p=map.get(x.handle);if(!p)return {...x,internalStatus:'active',note:''};
  return {...x,name:p.name||x.name,bio:p.bio||x.bio,category:p.category||x.category,discipline:p.discipline||x.discipline,
   status:p.publicStatus||x.status||x.status,pfp:p.pfp||x.pfp||'',socials:{...(x.socials||{}),...(p.socials||{})},
   internalStatus:p.status||'active',note:p.note||'',noteUpdatedAt:p.updatedAt||null};
 })});
}
export async function PATCH(request){
 if(!authed(request))return json({ok:false,error:'Unauthorized.'},401);
 if(!process.env.DATABASE_URL)return json({ok:false,error:'Storage is not configured yet.'},503);
 const body=await request.json().catch(()=>null),talentHandle=clean(body?.talentHandle).slice(0,100);
 if(!talentHandle)return json({ok:false,error:'Talent handle is required.'},400);
 const status=clean(body?.status||'active');
 if(!['active','paused','prospect','former'].includes(status))return json({ok:false,error:'Invalid internal status.'},400);
 const name=clean(body?.name).slice(0,160),bio=clean(body?.bio).slice(0,1000),category=clean(body?.category).slice(0,80);
 const discipline=clean(body?.discipline).slice(0,120),publicStatus=clean(body?.publicStatus).slice(0,80),pfp=safeUrl(body?.pfp),note=clean(body?.note).slice(0,4000);
 const rawSocials=body?.socials&&typeof body.socials==='object'?body.socials:{},socials={};
 for(const key of ['x','youtube','twitch','instagram','tiktok','tracker','website']){const value=safeUrl(rawSocials[key]);if(value)socials[key]=value}
 const sql=neon(process.env.DATABASE_URL);await ensure(sql);
 const [row]=await sql`INSERT INTO northline_talent_profiles(talent_handle,name,bio,category,discipline,public_status,pfp,socials,status,note)
 VALUES(${talentHandle},${name},${bio},${category},${discipline},${publicStatus},${pfp},${JSON.stringify(socials)}::jsonb,${status},${note})
 ON CONFLICT(talent_handle) DO UPDATE SET name=EXCLUDED.name,bio=EXCLUDED.bio,category=EXCLUDED.category,discipline=EXCLUDED.discipline,public_status=EXCLUDED.public_status,pfp=EXCLUDED.pfp,socials=EXCLUDED.socials,status=EXCLUDED.status,note=EXCLUDED.note,updated_at=NOW()
 RETURNING talent_handle AS "talentHandle",name,bio,category,discipline,public_status AS "publicStatus",pfp,socials,status,note,updated_at AS "updatedAt"`;
 return json({ok:true,profile:row});
}