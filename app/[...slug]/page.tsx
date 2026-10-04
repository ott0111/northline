import { notFound } from 'next/navigation';
import LegacyPage, { readLegacyPage } from '../legacy-page';

const allowed = new Set([
  'about','apply','contact','faq','past-work','process','roster','services','talent','team','work',
  'talent-drgxpb','talent-hxvacfn','talent-kingston','talent-creep','talent-joki','talent-devade',
  'privacy','terms','cookies'
]);

export const dynamic = 'force-dynamic';

export default async function LegacyRoute({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (slug.length !== 1 || !allowed.has(slug[0])) notFound();

  const file = `${slug[0]}.html`;
  await readLegacyPage(file);
  return <LegacyPage file={file} />;
}
