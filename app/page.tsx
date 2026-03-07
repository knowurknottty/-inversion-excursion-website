'use client';

import { useAuthStore } from '@/lib/store';
import { FarcasterAuth } from '@/components/FarcasterAuth';
import { Navigation } from '@/components/Navigation';
import { FrequencyVisualizer } from '@/components/FrequencyVisualizer';
import Link from 'next/link';
import { Sparkles, Users, Swords, Waves } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, displayName } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center py-20">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-500/10 rounded-full">
              <Waves className="w-16 h-16 text-indigo-400" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SynSync Dungeon
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            Resonance-based card battles on Base. <br />
            Frequency-aligned NFTs powered by brainwave entrainment.
          </p>
          
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto">
              <FarcasterAuth />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-indigo-300">Welcome back, {displayName}! ✨</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/deck"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Build Deck
                </Link>
                
                <Link
                  href="/cell"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-semibold transition-colors"
                >
                  <Users className="w-5 h-5" />
                  Join Cell
                </Link>
                
                <Link
                  href="/battle"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition-colors"
                >
                  <Swords className="w-5 h-5" />
                  Enter Battle
                </Link>
              </div>
            </div>
          )}
        </section>
        
        {/* Frequency Visualizer */}
        {isAuthenticated && (
          <section className="py-12">
            <FrequencyVisualizer />
          </section>
        )}
        
        {/* Features */}
        <section className="grid md:grid-cols-3 gap-8 py-16">
          <FeatureCard
            icon={<Waves className="w-8 h-8 text-cyan-400" />}
            title="SynSync Engine"
            description="Brainwave entrainment audio that syncs with your cards. Each card resonates at a specific frequency for strategic bonuses."
          />
          
          <FeatureCard
            icon={<Sparkles className="w-8 h-8 text-purple-400" />}
            title="Frequency Cards"
            description="Mint NFT cards tied to specific Hz frequencies. Fire at 528Hz, Water at 432Hz—each element has its resonance."
          />
          
          <FeatureCard
            icon={<Users className="w-8 h-8 text-pink-400" />}
            title="Cell Formations"
            description="Join up to 8 players in resonant cells. Your combined frequencies create powerful formation bonuses in battle."
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition-colors">
      <div className="p-3 bg-slate-800/50 rounded-lg w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
