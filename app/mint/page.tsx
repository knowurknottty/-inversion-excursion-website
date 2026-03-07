import React, { useState } from 'react';
import { PolarisCharityMintCard } from '@/components/PolarisCharityMintCard';
import { PlayerImpactCounter } from '@/components/PlayerImpactCounter';
import { useAccount } from 'wagmi';

/**
 * Mint Page with Polaris Charity Integration
 * 
 * Example implementation showing how to integrate the Polaris charity
 * minting flow into your application.
 * 
 * This page demonstrates:
 * - Real-time donation display in mint UI
 * - Player lifetime impact tracking
 * - Seamless wallet connection
 */

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_POLARIS_MINTER_ADDRESS as `0x${string}` || 
  '0x0000000000000000000000000000000000000000' as `0x${string}`;

// Example card attributes
const EXAMPLE_ATTRIBUTES = {
  power: BigInt(85),
  rarity: BigInt(3), // Rare
  chapter: BigInt(1),
  dungeon: 'The Crystal Caverns',
  extractedQuote: 'In the depths of shadow, light finds its way.',
  mintTimestamp: BigInt(0),
  minter: '0x0000000000000000000000000000000000000000',
};

export default function MintPage() {
  const { isConnected } = useAccount();
  const [lastMintedToken, setLastMintedToken] = useState<string | null>(null);

  const handleMintSuccess = (txHash: string) => {
    console.log('Mint successful!', txHash);
    setLastMintedToken(txHash);
    // Could trigger confetti, show success modal, etc.
  };

  const handleMintError = (error: Error) => {
    console.error('Mint failed:', error);
    // Could show error toast, etc.
  };

  return (
    <div className="mint-page">      <div className="mint-layout">        {/* Left: Impact Counter */}
        <div className="impact-panel">          <PlayerImpactCounter 
            contractAddress={CONTRACT_ADDRESS}
          />        </div>

        {/* Right: Mint Card */}
        <div className="mint-panel">          <PolarisCharityMintCard
            contractAddress={CONTRACT_ADDRESS}
            metadataUri="ipfs://example-metadata-uri"
            attributes={EXAMPLE_ATTRIBUTES}
            onMintSuccess={handleMintSuccess}
            onMintError={handleMintError}
          />          
          {lastMintedToken && (
            <div className="success-banner">              <span>🎉 Thank you for supporting survivor resources!</span>            </div>          )}
        </div>      </div>

      {/* Explainer Section */}
      <section className="explainer-section">        <h2>Why Polaris Project?</h2>        
        <div className="explainer-grid">          <div className="explainer-card">            <div className="explainer-icon">📞</div>            <h3>24/7 Hotline</h3>            <p>The National Trafficking Hotline operates around the clock, providing immediate support to victims and connecting them with local resources.</p>          </div>          
          <div className="explainer-card">            <div className="explainer-icon">🛡️</div>            <h3>Proven Impact</h3>            <p>Since 2007, Polaris has connected thousands of victims with critical support services and helped shape anti-trafficking policy.</p>          </div>          
          <div className="explainer-card">            <div className="explainer-icon">🔍</div>            <h3>Data-Driven</h3>            <p>Polaris analyzes trafficking patterns to disrupt networks and prevent exploitation before it happens.</p>          </div>          
          <div className="explainer-card">            <div className="explainer-icon">⚡</div>            <h3>Direct Support</h3>            <p>Your donations fund hotline operations, victim services, and the infrastructure needed to combat trafficking.</p>          </div>        </div>      </section>

      {/* Styles */}
      <style jsx>{`
        .mint-page {
          background: #0a0a0f;
          min-height: 100vh;
          color: #fff;
          padding: 40px 32px;
        }

        .mint-layout {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }

        .impact-panel,
        .mint-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .success-banner {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          color: #22c55e;
          font-weight: 600;
          animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .explainer-section {
          max-width: 1200px;
          margin: 80px auto 0;
          padding: 60px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .explainer-section h2 {
          text-align: center;
          font-size: 32px;
          margin: 0 0 48px 0;
        }

        .explainer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }

        .explainer-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
        }

        .explainer-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }

        .explainer-card h3 {
          font-size: 18px;
          margin: 0 0 12px 0;
        }

        .explainer-card p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 900px) {
          .mint-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>    </div>  );
}
