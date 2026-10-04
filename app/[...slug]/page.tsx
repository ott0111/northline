import { notFound } from 'next/navigation';
import LegacyPage, { readLegacyPage } from '../legacy-page';
import RosterPage from '../roster/page';
import TalentProfilePage from '../talent/[handle]/page';

const legacyRoutes = new Set(['about','apply','contact','faq','past-work','process','services','talent','team','work','privacy','terms','cookies']);
const talentRoutes = new Set(['talent-hxvacfn','talent-kingston','talent-creep','talent-joki','talent-devade','talent-drgxpb']);

export const dynamic = 'force-dynamic';

export default async function RoutePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (slug.length !== 1) notFound();
  if (slug[0] === 'roster') return <RosterPage />;
  if (talentRoutes.has(slug[0])) return <TalentProfilePage handle={slug[0].replace('talent-','')} />;
  if (!legacyRoutes.has(slug[0])) notFound();
  const file = `${slug[0]}.html`;
  await readLegacyPage(file);
  return <LegacyPage file={file} />;
}
