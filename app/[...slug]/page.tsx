import fs from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';
import LegacyPage from '../legacy-page';
export const dynamic='force-dynamic';
export default async function LegacyRoute({params}:{params:Promise<{slug:string[]}>}){
  const {slug}=await params;
  for(const file of [slug.join('/')+'.html',slug.join('/')+'/index.html']){
    try{await fs.access(path.join(process.cwd(),'pages',file));return <LegacyPage file={file}/>;}catch{}
  }
  notFound();
}
