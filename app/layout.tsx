import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { APP_CONFIG } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: 'Resonance-based card battles on Base. Frequency-aligned NFTs powered by SynSync entrainment.',
  keywords: ['NFT', 'Base', 'SynSync', 'brainwave', 'card game', 'Farcaster'],
  authors: [{ name: 'SynSync Team' }],
  openGraph: {
    title: APP_CONFIG.name,
    description: 'Resonance-based card battles on Base',
    type: 'website',
  },
  other: {
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: `${process.env.NEXT_PUBLIC_URL}/og.png`,
      button: {
        title: 'Enter SynSync Dungeon',
        action: {
          type: 'launch_frame',
          name: APP_CONFIG.name,
          url: process.env.NEXT_PUBLIC_URL,
          splashImageUrl: `${process.env.NEXT_PUBLIC_URL}/splash.png`,
          splashBackgroundColor: '#0f0f23'
        }
      }
    })
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f0f23',
  colorScheme: 'dark'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
