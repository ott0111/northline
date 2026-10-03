import { timingSafeEqual } from 'node:crypto';

export const runtime='nodejs';

function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json',...headers}})}

const loginAttempts=new Map();
const WINDOW=10*60*1000;
const LIMIT=6;
const getClientKey=request=>request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';

export async function POST(request){
  if(!process.env.ADMIN_SECRET)return json({ok:false,error:'Admin secret is not configured.'},503);
  const key=getClientKey(request),now=Date.now();
  const recent=(loginAttempts.get(key)||[]).filter(t=>now-t<WINDOW);
  if(recent.length>=LIMIT)return json({ok:false,error:'Too many login attempts. Try again later.'},429,{'retry-after':'600'});
  recent.push(now); loginAttempts.set(key,recent);
  let body;try{body=await request.json()}catch{return json({ok:false,error:'Invalid request.'},400)}
  const supplied=Buffer.from(String(body.password||''));
  const expected=Buffer.from(String(process.env.ADMIN_SECRET));
  if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return json({ok:false,error:'Invalid password.'},401);
  loginAttempts.delete(key);
  const {createHmac}=await import('node:crypto');
  const value=createHmac('sha256',process.env.ADMIN_SECRET).update('northline-admin').digest('hex');
  return json({ok:true},200,{'set-cookie':`northline_admin=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`})
}
export async function DELETE(){
  return new Response(null,{status:204,headers:{'set-cookie':'northline_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'}})
}
