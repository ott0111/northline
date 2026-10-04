import fs from 'node:fs/promises';
import path from 'node:path';
import { notFound } from 'next/navigation';

type Props = { file: string };

const titles: Record<string, string> = {
  'index.html': 'Northline — Talent. Representation. Built to grow.',
  'talent.html': 'Talent — Northline',
  'roster.html': 'Roster — Northline',
  'team.html': 'Team — Northline',
  'services.html': 'Services — Northline',
  'work.html': 'For Brands — Northline',
  'past-work.html': 'Past Work — Northline',
  'about.html': 'About — Northline',
  'process.html': 'Process — Northline',
  'apply.html': 'Apply — Northline',
  'contact.html': 'Contact — Northline',
  'faq.html': 'FAQ — Northline',
};

export async function readLegacyPage(file: string) {
  try {
    return await fs.readFile(path.join(process.cwd(), 'pages', file), 'utf8');
  } catch {
    notFound();
  }
}

function stripDocument(source: string) {
  return source
    .replace(/<!doctype[^>]*>/i, '')
    .replace(/<html[^>]*>|<\/html>/gi, '')
    .replace(/<head>[\s\S]*?<\/head>/i, '')
    .replace(/<body[^>]*>|<\/body>/gi, '');
}

export default async function LegacyPage({ file }: Props) {
  const source = await readLegacyPage(file);
  const body = stripDocument(source);

  return (
    <main data-next-migration="legacy-content" data-page={file}>
            <div dangerouslySetInnerHTML={{ __html: body }} />
    </main>
  );
}
