import { createHmac, timingSafeEqual } from 'node:crypto';

export const runtime='nodejs';

function json(data,status=200,headers={}){
  return new Response(JSON.stringify(data),{
    status,
    headers:{'content-type':'application/json','cache-control':'no-store',...headers}
  });
}

const loginAttempts=new Map();
const WINDOW=10*60*1000;
const LIMIT=6;
const SESSION_TTL=24*60*60*1000;

const getClientKey=request =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

function sessionToken(){
  const exp=Date.now()+SESSION_TTL;
  const payload=String(exp);
  const secret=process.env.ADMIN_SECRET;
  const sig=createHmac('sha256',secret).update('northline-admin:'+payload).digest('hex');
  return payload+'.'+sig;
}

function validSession(value){
  if(!value||!process.env.ADMIN_SECRET)return false;
  const [payload,sig]=String(value).split('.');
  const exp=Number(payload);
  if(!Number.isFinite(exp)||exp<Date.now()||!sig)return false;
  const expected=createHmac('sha256',process.env.ADMIN_SECRET).update('northline-admin:'+payload).digest('hex');
  const a=Buffer.from(sig),b=Buffer.from(expected);
  return a.length===b.length&&timingSafeEqual(a,b);
}

export function isAdminRequest(request){
  const value=request.headers.get('cookie')?.match(/(?:^|; )__Host-northline_admin=([^;]+)/)?.[1];
  return validSession(value);
}

export async function POST(request){
  if(!process.env.ADMIN_PASSWORD||!process.env.ADMIN_SECRET){
    return json({ok:false,error:'Admin credentials are not configured.'},503);
  }

  const key=getClientKey(request),now=Date.now();
  const recent=(loginAttempts.get(key)||[]).filter(t=>now-t<WINDOW);
  if(recent.length>=LIMIT){
    return json({ok:false,error:'Too many login attempts. Try again later.'},429,{'retry-after':'600'});
  }
  recent.push(now);
  loginAttempts.set(key,recent);

  let body;
  try{body=await request.json()}catch{
    return json({ok:false,error:'Invalid request.'},400);
  }

  const supplied=Buffer.from(String(body.password||''));
  const expected=Buffer.from(String(process.env.ADMIN_PASSWORD));
  if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected)){
    return json({ok:false,error:'Invalid password.'},401);
  }

  loginAttempts.delete(key);
  const cookie='__Host-northline_admin='+sessionToken()+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+Math.floor(SESSION_TTL/1000);
  return json({ok:true},200,{'set-cookie':cookie});
}

export async function DELETE(){
  return new Response(null,{
    status:204,
    headers:{'set-cookie':'__Host-northline_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'}
  });
}
