import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Northline — Talent / Partnerships / Management',description:'Northline is an independent talent agency representing creators and competitive talent.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
