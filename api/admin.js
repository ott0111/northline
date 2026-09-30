export const runtime='nodejs';

function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json',...headers}})}

export async function POST(request){
  if(!process.env.ADMIN_SECRET)return json({ok:false,error:'Admin secret is not configured.'},503);
  let body;try{body=await request.json()}catch{return json({ok:false,error:'Invalid request.'},400)}
  if(String(body.password||'')!==process.env.ADMIN_SECRET)return json({ok:false,error:'Invalid password.'},401);
  const {createHmac}=await import('node:crypto');
  const value=createHmac('sha256',process.env.ADMIN_SECRET).update('northline-admin').digest('hex');
  return json({ok:true},{status:200,headers:{'set-cookie':`northline_admin=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`}})
}
export async function DELETE(){
  return new Response(null,{status:204,headers:{'set-cookie':'northline_admin=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'}})
}
