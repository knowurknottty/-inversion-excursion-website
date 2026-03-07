'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Navigation } from '@/components/Navigation';
import { useCell, useCellInvite } from '@/hooks/useCell';
import { Users, Plus, Copy, Check } from 'lucide-react';

const FORMATIONS = [
  { id: 'triangle', name: 'Triad', bonus: 'Attack +20%', icon: '△' },
  { id: 'square', name: 'Fortress', bonus: 'Defense +20%', icon: '□' },
  { id: 'circle', name: 'Ring', bonus: 'Balanced +10%', icon: '○' },
  { id: 'diamond', name: 'Crystal', bonus: 'All +15%', icon: '◇' },
] as const;

export default function CellPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { 
    currentCell, 
    connectedCells, 
    createCell, 
    joinCell, 
    leaveCell,
    isLoading,
    error 
  } = useCell();
  
  const [showCreate, setShowCreate] = useState(false);
  const [cellName, setCellName] = useState('');
  const [selectedFormation, setSelectedFormation] = useState<typeof FORMATIONS[0]['id']>('triangle');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  const handleCreate = async () => {
    const cell = await createCell(cellName, selectedFormation);
    if (cell) setShowCreate(false);
  };

  const handleJoin = async () => {
    await joinCell('', inviteCode);
    setInviteCode('');
  };

  const copyInviteCode = async () => {
    if (currentCell) {
      await navigator.clipboard.writeText(`${window.location.origin}/cell/join?id=${currentCell.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cell Formation</h1>
          <p className="text-slate-400">Join up to 8 players in resonant formations.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {currentCell ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Current Cell */}
            <section className="lg:col-span-2">
              <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{currentCell.name}</h2>
                    <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
                      {currentCell.formation.charAt(0).toUpperCase() + currentCell.formation.slice(1)} Formation
                    </span>
                  </div>
                  
                  <button
                    onClick={() => leaveCell(currentCell.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Leave Cell
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-3">Members ({currentCell.members.length}/8)</h3>
                  <div className="flex flex-wrap gap-3">
                    {currentCell.members.map((member, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-indigo-500/30 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-indigo-400" />
                        </div>
                        <span className="text-sm">@{member}</span>
                      </div>
                    ))}
                    
                    {Array.from({ length: 8 - currentCell.members.length }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="px-3 py-2 border-2 border-dashed border-slate-700 rounded-lg text-slate-600 text-sm"
                      >
                        Empty Slot
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={copyInviteCode}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Invite Link'}
                  </button>
                </div>
              </div>
            </section>

            {/* Formation Stats */}
            <section>
              <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                <h3 className="font-semibold mb-4">Formation Power</h3>
                
                <div className="text-4xl font-bold text-indigo-400 mb-2">
                  {currentCell.power}
                </div>
                
                <p className="text-slate-400 text-sm mb-4">
                  +{currentCell.resonanceBonus}% Resonance Bonus
                </p>

                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-sm font-medium text-slate-400 mb-2">Active Bonuses</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      Formation synergy active
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full" />
                      {currentCell.members.length} resonant frequencies
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Create Cell */}
            <section className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg">
                  <Plus className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-xl font-semibold">Create Cell</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Cell Name</label>
                  <input
                    type="text"
                    value={cellName}
                    onChange={(e) => setCellName(e.target.value)}
                    placeholder="My Resonant Cell"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Formation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FORMATIONS.map((formation) => (
                      <button
                        key={formation.id}
                        onClick={() => setSelectedFormation(formation.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedFormation === formation.id
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-2xl mb-1">{formation.icon}</div>
                        <div className="font-medium text-sm">{formation.name}</div>
                        <div className="text-xs text-slate-500">{formation.bonus}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!cellName || isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create Cell'}
                </button>
              </div>
            </section>

            {/* Join Cell */}
            <section className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold">Join Cell</h2>
              </div>

              <div className="space-y-4">
                <p className="text-slate-400">Enter an invite code or link to join an existing cell.</p>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Invite Code</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="XXXX-XXXX"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleJoin}
                  disabled={!inviteCode || isLoading}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  {isLoading ? 'Joining...' : 'Join Cell'}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
