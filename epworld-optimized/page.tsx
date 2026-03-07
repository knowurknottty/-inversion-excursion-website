/**
 * EPWORLD Optimized Home Page
 * Performance-optimized with code splitting and lazy loading
 */

'use client';

import React, { useEffect, Suspense, lazy, useCallback } from 'react';
import { useFarcasterSDK } from '@/farcaster/hooks';

// Lazy load non-critical components
const ViralDashboard = lazy(() => import('@/farcaster/components/ViralDashboard'));
const GuildPanel = lazy(() => import('@/farcaster/components/GuildPanel'));
const ShareButton = lazy(() => import('@/farcaster/components/ShareButton'));
const NotificationBell = lazy(() => import('@/farcaster/components/NotificationHandler'));

// Import critical components directly
import { QuickActionButton, ActivityItem } from './components';
import { OptimizedImage } from '../image-optimization';
import { LazyLoad } from '../lazy-load';

// Skeleton loaders for lazy components
const DashboardSkeleton = () => (
  <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 animate-pulse">
    <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-20 bg-slate-800 rounded"></div>
      <div className="h-20 bg-slate-800 rounded"></div>
      <div className="h-20 bg-slate-800 rounded"></div>
    </div>
  </div>
);

const GuildSkeleton = () => (
  <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 animate-pulse">
    <div className="h-6 bg-slate-800 rounded w-1/4 mb-4"></div>
    <div className="h-32 bg-slate-800 rounded"></div>
  </div>
);

/**
 * Optimized Home Page
 * 
 * Performance optimizations:
 * - Critical content loaded immediately
 * - Non-critical sections lazy loaded with intersection observer
 * - Images optimized with blur placeholders
 * - Components code-split by route
 */
export default function HomePage() {
  const {
    isReady,
    isAuthenticated,
    user,
    signIn,
    addFrame,
    isFrameAdded,
    notificationsEnabled,
    requestNotifications,
  } = useFarcasterSDK();

  // Request notifications on auth
  useEffect(() => {
    if (isAuthenticated && !notificationsEnabled) {
      requestNotifications();
    }
  }, [isAuthenticated, notificationsEnabled, requestNotifications]);

  // Loading state
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header - Critical, always loaded */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          
          <div className="flex items-center gap-4">
            {/* Notification bell - lazy loaded */}
            <Suspense fallback={null}>
              <NotificationBell />
            </Suspense>
            
            <UserMenu 
              isAuthenticated={isAuthenticated}
              user={user}
              isFrameAdded={isFrameAdded}
              onSignIn={signIn}
              onAddFrame={addFrame}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!isAuthenticated ? (
          <AuthPrompt onSignIn={signIn} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Game Actions (Critical) */}
            <div className="lg:col-span-2 space-y-8">
              <HeroSection user={user} />
              <QuickActions />
              <RecentActivity />
            </div>

            {/* Right Column - Social Features (Lazy Loaded) */}
            <div className="space-y-8">
              {/* Viral Dashboard - below fold, lazy loaded */}
              <LazyLoad 
                fallback={<DashboardSkeleton />}
                rootMargin="100px"
              >
                <Suspense fallback={<DashboardSkeleton />}>
                  <ViralDashboard />
                </Suspense>
              </LazyLoad>

              {/* Guild Panel - below fold, lazy loaded */}
              <LazyLoad 
                fallback={<GuildSkeleton />}
                rootMargin="100px"
              >
                <Suspense fallback={<GuildSkeleton />}>
                  <GuildPanel />
                </Suspense>
              </LazyLoad>

              {/* Share CTA - below fold, lazy loaded */}
              <LazyLoad 
                fallback={<div className="h-32 bg-slate-900 rounded-xl animate-pulse" />}
                rootMargin="50px"
              >
                <Suspense fallback={null}>
                  <ShareCTA />
                </Suspense>
              </LazyLoad>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-700 border-t-indigo-500"></div>
      <p className="text-slate-500 text-sm">Loading EPWORLD...</p>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-xl">E</span>
      </div>
      <h1 className="text-2xl font-bold text-white">EPWORLD</h1>
    </div>
  );
}

interface UserMenuProps {
  isAuthenticated: boolean;
  user: any;
  isFrameAdded: boolean;
  onSignIn: () => void;
  onAddFrame: () => void;
}

function UserMenu({ isAuthenticated, user, isFrameAdded, onSignIn, onAddFrame }: UserMenuProps) {
  if (!isAuthenticated) {
    return (
      <button
        onClick={onSignIn}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {!isFrameAdded && (
        <button
          onClick={onAddFrame}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Add to Home
        </button>
      )}
      
      {user?.pfpUrl ? (
        <OptimizedImage
          src={user.pfpUrl}
          alt={user.displayName || user.username}
          width={40}
          height={40}
          className="rounded-full"
          lazy={false}
        />
      ) : (
        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
          <span className="text-white font-medium">
            {(user?.displayName || user?.username || '?')[0].toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

function AuthPrompt({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="text-center py-20">
      <h2 className="text-4xl font-bold text-white mb-4">
        Welcome to EPWORLD
      </h2>
      <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
        Battle, discover, and transform in the ultimate file-powered fighting game. 
        Sign in with Farcaster to begin your journey.
      </p>
      <button
        onClick={onSignIn}
        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-semibold transition-colors"
      >
        Sign In with Farcaster
      </button>
    </div>
  );
}

function HeroSection({ user }: { user: any }) {
  return (
    <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8">
      <h2 className="text-3xl font-bold text-white mb-4">
        Hello, {user?.displayName || user?.username}!
      </h2>
      <p className="text-indigo-200 mb-6">
        Ready for your next battle? Your characters are waiting.
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-white text-indigo-900 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
          Quick Battle
        </button>
        <button className="px-6 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors">
          View Characters
        </button>
      </div>
    </div>
  );
}

function QuickActions() {
  const actions = [
    { icon: '⚔️', label: 'Battle', href: '/battle' },
    { icon: '👤', label: 'Characters', href: '/characters' },
    { icon: '📁', label: 'Files', href: '/files' },
    { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {actions.map(action => (
        <QuickActionButton
          key={action.label}
          icon={action.icon}
          label={action.label}
          href={action.href}
        />
      ))}
    </div>
  );
}

function RecentActivity() {
  const activities = [
    { icon: '🏆', title: 'Battle Victory', description: 'Defeated @opponent with Super Saiyan Goku', time: '2 min ago' },
    { icon: '📁', title: 'New Discovery', description: 'Found Classified_Doc_001.pdf', time: '1 hour ago' },
    { icon: '🚀', title: 'Transformation', description: 'Goku ascended to SS-Tier!', time: '3 hours ago' },
  ];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <ActivityItem key={i} {...activity} />
        ))}
      </div>
    </div>
  );
}

function ShareCTA() {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-3">Share Your Journey</h3>
      <p className="text-slate-400 text-sm mb-4">
        Share your battles and discoveries to earn rewards!
      </p>
      <ShareButton
        shareData={{
          type: 'battle',
          data: {
            characterName: 'Super Saiyan Goku',
            characterImage: '',
            opponentName: 'Vegeta',
            opponentImage: '',
            powerLevel: 9000,
            opponentPowerLevel: 8500,
            fileUsed: 'Classified_Doc_001.pdf',
            fileRarity: 'legendary',
            battleId: 'battle-123',
            isVictory: true,
            battleDuration: 45000,
            comboCount: 15,
            criticalHits: 3,
          },
        }}
        variant="default"
      />
    </div>
  );
}

// ============================================
// COMPONENT EXPORTS (for lazy loading)
// ============================================

export { QuickActionButton, ActivityItem };
