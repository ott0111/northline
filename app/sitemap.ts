import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const routes=['','/talent','/roster','/team','/past-work','/services','/work','/about','/process','/apply','/contact','/faq'];
  return routes.map((route)=>({url:`https://northline.co${route}`,lastModified:new Date(),changeFrequency:route===''?'weekly':'monthly',priority:route===''?1:0.7}));
}