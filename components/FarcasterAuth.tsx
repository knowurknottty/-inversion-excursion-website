'use client';

import { useCallback } from 'react';
import { SignInButton, useProfile } from '@farcaster/auth-kit';
import { useAuthStore } from '@/lib/store';
import { useAccount, useSignMessage } from 'wagmi';
import { Wallet } from 'lucide-react';

export function FarcasterAuth() {
  const { isAuthenticated: isFarcasterAuth, profile } = useProfile();
  const { login, logout, isAuthenticated } = useAuthStore();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const handleSuccess = useCallback(async (fid: number, username: string) => {
    login({
      fid,
      username,
      displayName: profile?.displayName || username,
      pfpUrl: profile?.pfpUrl
    });
  }, [login, profile]);

  // Already authenticated
  if (isAuthenticated) {
    return (
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3">
          {profile?.pfpUrl ? (
            <img 
              src={profile.pfpUrl} 
              alt={profile.username}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <span className="text-xl">@{profile?.username?.[0]}</span>
            </div>
          )}
          
          <div className="flex-1">
            <div className="font-semibold">{profile?.displayName || profile?.username}</div>
            <div className="text-sm text-slate-400">@{profile?.username}</div>
          </div>
          
          <button
            onClick={logout}
            className="px-3 py-1 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
        
        {address && (
          <div className="mt-3 pt-3 border-t border-slate-700 flex items-center gap-2 text-sm text-slate-400">
            <Wallet className="w-4 h-4" />
            <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <h3 className="font-semibold mb-4">Sign in with Farcaster</h3>
        
        <SignInButton
          onSuccess={({ fid, username }) => handleSuccess(fid, username)}
          onError={(error) => console.error('Auth error:', error)}
        >
          {({ open }) => (
            <button
              onClick={open}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              Sign in with Farcaster
            </button>
          )}
        </SignInButton>
      </div>
      
      <p className="text-center text-sm text-slate-500">
        Or connect wallet directly
      </p>
    </div>
  );
}
