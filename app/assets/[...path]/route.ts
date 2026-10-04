import fs from 'node:fs/promises';
import path from 'node:path';
const types:Record<string,string>={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml',gif:'image/gif',ico:'image/x-icon',woff2:'font/woff2'};
export async function GET(_:Request,{params}:{params:Promise<{path:string[]}>}){
 const {path:parts}=await params;
 try{const file=await fs.readFile(path.join(process.cwd(),'assets',...parts));const ext=parts.at(-1)?.split('.').pop()?.toLowerCase()??'';return new Response(file,{headers:{'content-type':types[ext]??'application/octet-stream','cache-control':'public,max-age=31536000,immutable'}})}catch{return new Response('Not found',{status:404})}
}
