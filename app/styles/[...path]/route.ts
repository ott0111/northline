import fs from 'node:fs/promises';
import path from 'node:path';
export async function GET(_:Request,{params}:{params:Promise<{path:string[]}>}){
  const {path:parts}=await params;
  try{const file=await fs.readFile(path.join(process.cwd(),'styles',...parts));return new Response(file,{headers:{'content-type':'text/css; charset=utf-8','cache-control':'public,max-age=31536000,immutable'}});}
  catch{return new Response('Not found',{status:404});}
}
