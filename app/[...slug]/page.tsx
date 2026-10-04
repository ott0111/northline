import { notFound } from 'next/navigation';
import LegacyPage, { readLegacyPage } from '../legacy-page';
import RosterPage from '../roster/page';

const legacyRoutes = new Set(['about','apply','contact','faq','past-work','process','services','talent','team','work','privacy','terms','cookies']);

export const dynamic = 'force-dynamic';

export default async function RoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (slug.length !== 1) notFound();
  if (slug[0] === 'roster') return <RosterPage />;
  if (!legacyRoutes.has(slug[0])) notFound();
  const file = `${slug[0]}.html`;
  await readLegacyPage(file);
  return <LegacyPage file={file} />;
}
