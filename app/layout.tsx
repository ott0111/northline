import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://northline.co'),
  title: {
    default: 'Northline — Talent. Representation. Built to grow.',
    template: '%s — Northline',
  },
  description: 'Northline is an independent talent agency representing creators, competitive players, and digital talent.',
  icons: { icon: '/assets/logo-mark.png', apple: '/assets/logo-mark.png' },
  openGraph: {
    siteName: 'Northline',
    type: 'website',
    images: [{ url: '/assets/1500x500%20(1).jpg', alt: 'Northline' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
