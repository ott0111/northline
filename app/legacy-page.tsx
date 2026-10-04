import fs from 'node:fs/promises';
import path from 'node:path';
export default async function LegacyPage({file}:{file:string}){
  const source=await fs.readFile(path.join(process.cwd(),'pages',file),'utf8');
  const body=source.match(/<body[^>]*>([\\s\\S]*?)<\\/body>/i)?.[1] ?? source;
  return <div dangerouslySetInnerHTML={{__html:body}} />;
}
