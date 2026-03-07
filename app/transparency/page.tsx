import React from 'react';
import { PolarisTransparencyDashboard } from '@/components/PolarisTransparencyDashboard';
import { PlayerImpactCounter } from '@/components/PlayerImpactCounter';
import { PolarisCharityMintCard } from '@/components/PolarisCharityMintCard';
import { useAccount } from 'wagmi';

/**
 * Transparency Page
 * 
 * Public page showcasing Polaris Project partnership transparency.
 * URL: /transparency
 * 
 * Features:
 * - Real-time donation statistics
 * - Complete transaction history
 * - Partnership verification
 * - User impact tracking
 */

// Configuration - Update with deployed contract address
const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_POLARIS_MINTER_ADDRESS as `0x${string}` || 
           '0x0000000000000000000000000000000000000000' as `0x${string}`,
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 8453, // Base mainnet
  blockExplorerUrl: process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://basescan.org',
};

export default function TransparencyPage() {
  const { address } = useAccount();

  return (
    <div className="transparency-page">      {/* Hero Section */}
      <section className="hero-section">        <div className="hero-content">          <div className="hero-badge">            <span className="badge-icon">🤝</span>            <span>Official Partnership</span>          </div>          
          <h1>Transparency in Action</h1>          <p className="hero-subtitle">            Every mint automatically donates 10% to{' '}
            <strong>Polaris Project</strong>'s National Trafficking Hotline.
            No middlemen. No delays. Fully verifiable on-chain.
          </p>          
          <div className="hero-stats">            <div className="hero-stat">              <span className="stat-number">10%</span>              <span className="stat-label">of every mint</span>            </div>            
            <div className="hero-stat">              <span className="stat-number">100%</span>              <span className="stat-label">on-chain verifiable</span>            </div>            
            <div className="hero-stat">              <span className="stat-number">∞</span>              <span className="stat-label">permanent commitment</span>            </div>          </div>        </div>      </section>

      {/* User Impact Section */}
      {address && (
        <section className="impact-section">          <div className="section-container">            <h2>Your Impact</h2>            
            <PlayerImpactCounter 
              contractAddress={CONTRACT_CONFIG.address}
            />          </div>        </section>      )}

      {/* Transparency Dashboard */}
      <section className="dashboard-section">        <PolarisTransparencyDashboard 
          contractAddress={CONTRACT_CONFIG.address}
          chainId={CONTRACT_CONFIG.chainId}
          blockExplorerUrl={CONTRACT_CONFIG.blockExplorerUrl}
        />      </section>

      {/* How It Works */}
      <section className="how-it-works">        <div className="section-container">          <h2>How It Works</h2>          
          <div className="steps-grid">            <div className="step-card">              <div className="step-number">1</div>              <h3>You Mint</h3>              <p>Purchase an EPWorld NFT at the current mint price</p>            </div>            
            <div className="step-card">              <div className="step-number">2</div>              <h3>Auto-Donation</h3>              <p>10% is automatically sent to Polaris Project in the same transaction</p>            </div>            
            <div className="step-card">              <div className="step-number">3</div>              <h3>Verify</h3>              <p>Check your donation on the blockchain using any block explorer</p>            </div>            
            <div className="step-card">              <div className="step-number">4</div>              <h3>Impact</h3>              <p>Track your lifetime contribution to survivor support</p>            </div>          </div>        </div>      </section>

      {/* FAQ */}
      <section className="faq-section">        <div className="section-container">          <h2>Frequently Asked Questions</h2>          
          <div className="faq-grid">            <div className="faq-item">              <h4>How do I know the donation actually happens?</h4>              <p>                Every donation is recorded on the blockchain in the same transaction as your mint. 
                You can verify this by checking the transaction on{' '}
                <a href={CONTRACT_CONFIG.blockExplorerUrl} target="_blank" rel="noopener noreferrer">                  {CONTRACT_CONFIG.blockExplorerUrl.replace('https://', '')}
                </a>. 
                Look for internal transactions showing ETH being sent to the Polaris Project address.
              </p>            </div>            
            <div className="faq-item">              <h4>Can the donation percentage be changed?</h4>              <p>                No. The 10% donation rate is hardcoded in the smart contract as an immutable constant. 
                Neither the EPWorld team nor anyone else can modify it. This is a feature, not a bug—it 
                ensures the commitment can never be broken.
              </p>            </div>            
            <div className="faq-item">              <h4>Who is Polaris Project?</h4>              <p>                <a href="https://polarisproject.org" target="_blank" rel="noopener noreferrer">                  Polaris Project
                </a>{' '}
                is a nonprofit organization that operates the U.S. National Human Trafficking Hotline. 
                They provide 24/7 support to victims and survivors, and work to prevent human trafficking 
                through data analysis and policy advocacy.
              </p>            </div>            
            <div className="faq-item">              <h4>Is my donation tax-deductible?</h4>              <p>                Polaris Project is a 501(c)(3) nonprofit organization. While donations are automatically 
                executed through the smart contract, you should consult with a tax professional regarding 
                the deductibility of your specific contributions. The blockchain provides a permanent record 
                of all donations for your records.
              </p>            </div>          </div>        </div>      </section>

      {/* Styles */}
      <style jsx>{`
        .transparency-page {
          background: #0a0a0f;
          min-height: 100vh;
          color: #fff;
        }

        .hero-section {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
          padding: 80px 32px;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
          padding: 10px 20px;
          border-radius: 30px;
          font-weight: 600;
          margin-bottom: 32px;
        }

        .badge-icon {
          font-size: 18px;
        }

        .hero-content h1 {
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 20px 0;
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0 0 40px 0;
        }

        .hero-subtitle strong {
          color: #ef4444;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 60px;
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-size: 36px;
          font-weight: 800;
          color: #fff;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .section-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 32px;
        }

        .impact-section {
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .impact-section h2 {
          text-align: center;
          font-size: 32px;
          margin: 0 0 40px 0;
        }

        .how-it-works h2,
        .faq-section h2 {
          text-align: center;
          font-size: 32px;
          margin: 0 0 48px 0;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
        }

        .step-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 32px;
          text-align: center;
        }

        .step-number {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
          margin: 0 auto 20px;
        }

        .step-card h3 {
          font-size: 18px;
          margin: 0 0 12px 0;
        }

        .step-card p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        .faq-section {
          background: rgba(255, 255, 255, 0.02);
        }

        .faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 32px;
        }

        .faq-item h4 {
          font-size: 16px;
          margin: 0 0 12px 0;
          color: #fff;
        }

        .faq-item p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          line-height: 1.7;
          margin: 0;
        }

        .faq-item a {
          color: #6366f1;
          text-decoration: none;
        }

        .faq-item a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 32px;
          }

          .hero-stats {
            flex-direction: column;
            gap: 24px;
          }

          .faq-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>    </div>  );
}
