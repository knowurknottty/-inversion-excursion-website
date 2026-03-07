'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Waves, LayoutGrid, Users, Swords, LogIn } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Waves },
  { href: '/deck', label: 'Deck', icon: LayoutGrid },
  { href: '/cell', label: 'Cell', icon: Users },
  { href: '/battle', label: 'Battle', icon: Swords },
];

export function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, displayName } = useAuthStore();

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Waves className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-bold text-lg hidden sm:block">SynSync</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-indigo-500/20 text-indigo-300' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 hidden md:block">
                  {displayName}
                </span>
                <ConnectButton 
                  showBalance={false}
                  accountStatus="avatar"
                  chainStatus="icon"
                />
              </div>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
