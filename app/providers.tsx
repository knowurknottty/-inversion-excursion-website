'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { AuthKitProvider } from '@farcaster/auth-kit';
import '@rainbow-me/rainbowkit/styles.css';
import { wagmiConfig } from '@/lib/wagmi';

const queryClient = new QueryClient();

const farcasterConfig = {
  domain: process.env.NEXT_PUBLIC_FARCASTER_DOMAIN || 'sinsync.fun',
  siweUri: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/auth`,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} modalSize="compact">
          <AuthKitProvider config={farcasterConfig}>
            {children}
          </AuthKitProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
