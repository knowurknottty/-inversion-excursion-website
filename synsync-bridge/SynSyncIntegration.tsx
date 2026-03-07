/**
 * SynSync Bridge - Integration Example
 * Complete usage example for Farcaster mini app
 */

import React, { useState, useEffect } from 'react';
import { getSynSyncEngine, EntrainmentProof, FREQUENCY_PRESETS } from './SynSyncEngine';
import { EntrainmentControls } from './SynSyncUI';
import { calculateResonance, CardData, getResonanceLabel } from './ResonanceCalculator';
import { verifyEntrainmentProof, fullServerVerification } from './SynSyncSecurity';

// Example card data
const EXAMPLE_HAND: CardData[] = [
  { id: 'focus_boost', name: 'Focus Boost', type: 'focus', baseEffect: 100 },
  { id: 'meditation', name: 'Deep Calm', type: 'calm', baseEffect: 80 },
  { id: 'dream_walk', name: 'Dream Walk', type: 'dream', baseEffect: 120 },
];

const CURRENT_CARD: CardData = { 
  id: 'focus_boost', 
  name: 'Focus Boost', 
  type: 'focus', 
  baseEffect: 100 
};

/**
 * Example: Mini App Integration
 */
export const SynSyncMiniApp: React.FC = () => {
  const engine = getSynSyncEngine();
  const [lastProof, setLastProof] = useState<EntrainmentProof | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('');

  const handleProofGenerated = (proof: EntrainmentProof) => {
    setLastProof(proof);
    
    // In production, send to your backend
    // const response = await fetch('/api/verify-entrainment', {
    //   method: 'POST',
    //   body: JSON.stringify({ proof, userId, cardId: CURRENT_CARD.id })
    // });
    
    // Client-side preview (not for production verification)
    const result = verifyEntrainmentProof(proof, getCardTargetFrequency(CURRENT_CARD.id));
    setVerificationStatus(result.isValid ? '✓ Verified' : '✗ Failed');
  };

  const handleResonanceChange = (resonance: any) => {
    // Update game UI with resonance info
    console.log('Resonance updated:', resonance);
  };

  return (
    <div style={{ padding: '20px', background: '#000', minHeight: '100vh', color: '#fff' }}>
      <h1>🧠 SynSync Bridge</h1>
      
      <EntrainmentControls
        engine={engine}
        currentCard={CURRENT_CARD}
        hand={EXAMPLE_HAND}
        onResonanceChange={handleResonanceChange}
        onProofGenerated={handleProofGenerated}
      />
      
      {lastProof && (
        <div style={{ marginTop: '20px', padding: '16px', background: '#1a1a1a', borderRadius: '12px' }}>
          <h3>Last Session</h3>
          <p>Status: {verificationStatus}</p>
          <p>Duration: {lastProof.duration.toFixed(1)}s</p>
          <p>Entropy: {lastProof.entropy.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
};

// Helper to get target frequency
function getCardTargetFrequency(cardId: string): number {
  const map: Record<string, number> = {
    'focus_boost': 40,
    'meditation': 10,
    'dream_walk': 6,
  };
  return map[cardId] || 10;
}

/**
 * Example: Server API Route (Next.js/Express)
 */
export async function handleEntrainmentVerification(
  req: { body: { proof: EntrainmentProof; userId: string; cardId: string } }
): Promise<{ success: boolean; multiplier: number; message: string }> {
  const { proof, userId, cardId } = req.body;
  
  // Get expected frequency for card
  const expectedFreq = getCardTargetFrequency(cardId);
  
  // Full server verification
  const result = fullServerVerification(proof, userId, expectedFreq);
  
  if (result.approved) {
    return {
      success: true,
      multiplier: result.multiplier,
      message: `Entrainment verified! ${getResonanceLabel(result.multiplier)}`
    };
  } else {
    return {
      success: false,
      multiplier: 0,
      message: `Verification failed: ${result.reasons.join(', ')}`
    };
  }
}

/**
 * Example: Deep Link Handler
 */
export function handleDeepLink(): void {
  const params = new URLSearchParams(window.location.search);
  const source = params.get('source');
  const preset = params.get('preset') as keyof typeof FREQUENCY_PRESETS;
  
  if (source === 'farcaster' && preset && FREQUENCY_PRESETS[preset]) {
    // Pre-select the preset from Farcaster context
    console.log(`Opening SynSync with ${FREQUENCY_PRESETS[preset].name}`);
    
    // In your SynSync PWA:
    // setSelectedPreset(preset);
    // showNotification('Synced from Farcaster mini app');
  }
}

/**
 * Example: Frame Integration
 * For Farcaster Frame v2
 */
export const frameMetadata = {
  version: 'next',
  imageUrl: 'https://your-domain.com/synsync-frame.png',
  button: {
    title: 'Enter SynSync',
    action: {
      type: 'launch_frame',
      name: 'SynSync Bridge',
      url: 'https://your-domain.com/mini-app',
      splashImageUrl: 'https://your-domain.com/synsync-splash.png',
      splashBackgroundColor: '#000000'
    }
  }
};

/**
 * Build instructions for integration
 */
export const BUILD_INSTRUCTIONS = `
# SynSync Bridge Integration

## 1. Copy files to your project
- SynSyncEngine.ts - Core audio engine
- ResonanceCalculator.ts - Game mechanics
- SynSyncUI.tsx - React components
- SynSyncSecurity.ts - Verification (server)

## 2. Install dependencies
None! Pure TypeScript/React. Web Audio API is native.

## 3. Usage
\`\`\`tsx
import { getSynSyncEngine } from './SynSyncBridge/SynSyncEngine';
import { EntrainmentControls } from './SynSyncBridge/SynSyncUI';

const engine = getSynSyncEngine();

function App() {
  return (
    <EntrainmentControls
      engine={engine}
      currentCard={activeCard}
      hand={playerHand}
      onResonanceChange={(r) => updateCardEffect(r.multiplier)}
      onProofGenerated={(proof) => submitToServer(proof)}
    />
  );
}
\`\`\`

## 4. Server Verification
\`\`\`ts
import { fullServerVerification } from './SynSyncBridge/SynSyncSecurity';

app.post('/verify', (req, res) => {
  const result = fullServerVerification(
    req.body.proof,
    req.body.userId,
    getCardFrequency(req.body.cardId)
  );
  
  res.json({
    approved: result.approved,
    multiplier: result.multiplier
  });
});
\`\`\`

## 5. CORS Notes
All audio is generated client-side via Web Audio API.
No external audio files = no CORS issues.
`;

export default SynSyncMiniApp;
