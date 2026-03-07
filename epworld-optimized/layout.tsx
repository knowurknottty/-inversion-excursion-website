/**
 * EPWORLD Optimized Layout
 * Performance-optimized root layout with minimal blocking resources
 */

import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'EPWORLD - File-Powered Fighting Game',
  description: 'Battle, discover, and transform in the ultimate file-powered fighting game on Farcaster',
  keywords: ['game', 'farcaster', 'nft', 'battle', 'files', 'epworld'],
  authors: [{ name: 'EPWORLD Team' }],
  openGraph: {
    title: 'EPWORLD',
    description: 'Battle, discover, and transform in the ultimate file-powered fighting game',
    url: 'https://epworld.game',
    siteName: 'EPWORLD',
    images: [
      {
        url: 'https://epworld.game/og-image.png',
        width: 1200,
        height: 628,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPWORLD',
    description: 'Battle, discover, and transform in the ultimate file-powered fighting game',
    images: ['https://epworld.game/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192' },
    ],
  },
  // Preconnect to external domains
  other: {
    preconnect: 'https://epworld.xyz',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true,
  colorScheme: 'dark',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Critical CSS inline to prevent render blocking */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Preconnect hints */}
        <link rel="preconnect" href="https://epworld.xyz" />
        <link rel="dns-prefetch" href="https://epworld.xyz" />
        
        {/* Farcaster Frame Meta Tags - critical for Mini App */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://epworld.game/frames/og-image.png" />
        <meta property="fc:frame:button:1" content="Enter EPWORLD" />
        <meta property="fc:frame:post_url" content="https://epworld.game/api/frames" />
        
        {/* Farcaster Mini App */}
        <meta property="of:version" content="vNext" />
        <meta property="of:image" content="https://epworld.game/frames/og-image.png" />
        <meta property="of:button:1" content="Launch EPWORLD" />
        <meta property="of:post_url" content="https://epworld.game/api/frames" />
        
        {/* Resource hints */}
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
      </head>
      <body className="bg-slate-950 text-white min-h-screen antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

// Critical CSS to prevent FOUC (Flash of Unstyled Content)
const criticalCSS = `
  /* Critical rendering path styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html {
    -webkit-text-size-adjust: 100%;
    -moz-tab-size: 4;
    tab-size: 4;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  html.dark {
    color-scheme: dark;
  }
  
  body {
    min-height: 100vh;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: rgb(2, 6, 23);
    color: rgb(255, 255, 255);
  }
  
  /* Prevent layout shift during hydration */
  #__next {
    min-height: 100vh;
  }
  
  /* Critical loading state */
  .loading-skeleton {
    background: linear-gradient(
      90deg,
      rgba(30, 41, 59, 0.8) 25%,
      rgba(51, 65, 85, 0.8) 50%,
      rgba(30, 41, 59, 0.8) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }
  
  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  
  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
