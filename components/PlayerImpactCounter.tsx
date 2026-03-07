import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import { Heart, TrendingUp, Award, Clock, Users, Target, Shield, Zap } from 'lucide-react';

/**
 * PlayerImpactCounter
 * 
 * Lifetime player impact counter showing total contributions to Polaris Project.
 * Displays: "Your mints have sent X ETH to survivor support"
 * 
 * Reference: Behavioral economics - visible impact drives continued engagement
 * Style: Achievement/badge style with progress visualization
 */

const POLARIS_MINTER_ABI = [
  {
    inputs: [{ name: "player", type: "address" }],
    name: "getPlayerImpact",
    outputs: [
      { name: "totalContribution", type: "uint256" },
      { name: "mintCount", type: "uint256" },
      { name: "impactLevel", type: "string" },
      { name: "impactStatement", type: "string" },
      { name: "tokensOwned", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "player", type: "address" }],
    name: "getFormattedImpact",
    outputs: [
      { name: "ethContributed", type: "string" },
      { name: "usdEstimate", type: "string" },
      { name: "survivorImpact", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGlobalCharityStats",
    outputs: [
      { name: "_totalDonatedWei", type: "uint256" },
      { name: "_totalCharityMints", type: "uint256" },
      { name: "_totalSurvivorSupport", type: "uint256" },
      { name: "_currentMintPrice", type: "uint256" },
      { name: "_milestoneCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

interface ImpactTier {
  name: string;
  minEth: number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  badge: string;
}

interface PlayerImpactCounterProps {
  contractAddress: `0x${string}`;
  className?: string;
}

const IMPACT_TIERS: ImpactTier[] = [
  {
    name: "New Supporter",
    minEth: 0,
    icon: <Heart size={24} />,
    color: "#9ca3af",
    gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
    badge: "🌱",
  },
  {
    name: "Rising Advocate",
    minEth: 0.1,
    icon: <Zap size={24} />,
    color: "#22c55e",
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    badge: "⚡",
  },
  {
    name: "Active Ally",
    minEth: 1,
    icon: <Shield size={24} />,
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    badge: "🛡️",
  },
  {
    name: "Guardian Supporter",
    minEth: 5,
    icon: <Target size={24} />,
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    badge: "🎯",
  },
  {
    name: "Champion Advocate",
    minEth: 10,
    icon: <Award size={24} />,
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    badge: "👑",
  },
];

export const PlayerImpactCounter: React.FC<PlayerImpactCounterProps> = ({
  contractAddress,
  className = "",
}) => {
  const { address, isConnected } = useAccount();
  const [animatedEth, setAnimatedEth] = useState(0);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);

  // Read player impact data
  const { data: playerImpact } = useReadContract({
    address: contractAddress,
    abi: POLARIS_MINTER_ABI,
    functionName: 'getPlayerImpact',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read formatted impact
  const { data: formattedImpact } = useReadContract({
    address: contractAddress,
    abi: POLARIS_MINTER_ABI,
    functionName: 'getFormattedImpact',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read global stats
  const { data: globalStats } = useReadContract({
    address: contractAddress,
    abi: POLARIS_MINTER_ABI,
    functionName: 'getGlobalCharityStats',
  });

  // Parse data
  const totalContribution = playerImpact ? playerImpact[0] : BigInt(0);
  const mintCount = playerImpact ? Number(playerImpact[1]) : 0;
  const impactLevel = playerImpact ? playerImpact[2] : "New Supporter";
  const impactStatement = playerImpact ? playerImpact[3] : "";

  const totalEth = Number(formatEther(totalContribution));
  const ethContributed = formattedImpact ? formattedImpact[0] : `${totalEth.toFixed(3)} ETH`;
  const usdEstimate = formattedImpact ? formattedImpact[1] : "-";
  const survivorImpact = formattedImpact ? formattedImpact[2] : "";

  // Find current tier
  const currentTier = IMPACT_TIERS.slice().reverse().find(tier => totalEth >= tier.minEth) || IMPACT_TIERS[0];
  
  // Find next tier
  const nextTierIndex = IMPACT_TIERS.findIndex(t => t.minEth > totalEth);
  const nextTier = nextTierIndex !== -1 ? IMPACT_TIERS[nextTierIndex] : null;
  
  // Calculate progress to next tier
  const progressToNext = nextTier
    ? Math.min(100, ((totalEth - currentTier.minEth) / (nextTier.minEth - currentTier.minEth)) * 100)
    : 100;

  // Global stats
  const globalTotalEth = globalStats ? formatEther(globalStats[0]) : "0";
  const globalMints = globalStats ? globalStats[1].toString() : "0";

  // Animate ETH counter
  useEffect(() => {
    const targetValue = totalEth;
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    const stepValue = targetValue / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= targetValue) {
        setAnimatedEth(targetValue);
        clearInterval(timer);
      } else {
        setAnimatedEth(current);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [totalEth]);

  // Check for milestone celebration
  useEffect(() => {
    if (mintCount > 0 && mintCount % 10 === 0) {
      setShowMilestoneCelebration(true);
      const timer = setTimeout(() => setShowMilestoneCelebration(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [mintCount]);

  if (!isConnected) {
    return (
      <div className={`player-impact-counter ${className}`}>
        <div className="impact-card connect-prompt">
          <Heart className="connect-icon" size={48} />
          <h3>Connect to See Your Impact</h3>
          <p>Link your wallet to track your contributions to survivor support</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`player-impact-counter ${className}`}>
      {/* Milestone Celebration Overlay */}
      {showMilestoneCelebration && (
        <div className="milestone-celebration">
          <div className="celebration-content">
            <div className="celebration-icon">🎉</div>
            <h2>Milestone Reached!</h2>
            <p>{mintCount} mints completed</p>
            <div className="celebration-amount">
              {ethContributed} donated
            </div>
          </div>
        </div>
      )}

      {/* Main Impact Card */}
      <div 
        className="impact-card"
        style={{ borderColor: currentTier.color }}
      >
        {/* Tier Badge */}
        <div className="tier-badge" style={{ background: currentTier.gradient }}>
          <span className="tier-icon">{currentTier.badge}</span>
          <span className="tier-name">{impactLevel}</span>
        </div>

        {/* Main Counter Display */}
        <div className="counter-section">
          <div className="counter-label">
            <Heart size={16} className="counter-heart" />
            Your Contribution to Survivor Support
          </div>
          
          <div className="counter-value">
            <span className="eth-amount">
              {animatedEth.toFixed(animatedEth < 0.1 ? 4 : 3)}
            </span>
            <span className="eth-symbol">ETH</span>
          </div>
          
          <div className="counter-usd">
            {usdEstimate}
          </div>

          {/* THE KEY MESSAGE */}
          <div className="impact-message">
            Your {mintCount} {mintCount === 1 ? 'mint' : 'mints'} have sent{' '}
            <strong>{ethContributed}</strong> to survivor support
          </div>        </div>

        {/* Survivor Impact Metric */}
        {survivorImpact && (
          <div className="survivor-impact">
            <Users size={16} />
            <span>{survivorImpact}</span>
          </div>
        )}

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="tier-progress">
            <div className="progress-header">
              <span>Progress to {nextTier.name}</span>
              <span>{progressToNext.toFixed(0)}%</span>
            </div>            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${progressToNext}%`,
                  background: currentTier.gradient 
                }}
              />
            </div>
            <div className="progress-remaining">
              {(nextTier.minEth - totalEth).toFixed(3)} ETH to next tier
            </div>
          </div>
        )}

        {/* Impact Statement */}
        <div className="impact-statement">
          <blockquote>{impactStatement}</blockquote>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-box">
            <TrendingUp size={20} />
            <span className="stat-number">{mintCount}</span>
            <span className="stat-label">Mints</span>
          </div>
          
          <div className="stat-box">
            <Users size={20} />
            <span className="stat-number">{globalMints}</span>
            <span className="stat-label">Global Mints</span>
          </div>
          
          <div className="stat-box">
            <Target size={20} />
            <span className="stat-number">{parseFloat(globalTotalEth).toFixed(2)}</span>
            <span className="stat-label">Global ETH</span>
          </div>
        </div>

        {/* Community Context */}
        <div className="community-context">
          <div className="context-icon">{currentTier.icon}</div>          <div className="context-text">
            <strong>You are a {impactLevel}</strong>
            <p>
              Part of a community that has raised {parseFloat(globalTotalEth).toFixed(2)} ETH 
              for Polaris Project's National Trafficking Hotline
            </p>
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="tier-benefits">
          <h4>Your Impact Tier Benefits</h4>
          <ul>
            {currentTier.minEth >= 0.1 && (
              <li>✓ Exclusive Rising Advocate badge on profile</li>
            )}
            {currentTier.minEth >= 1 && (
              <>
                <li>✓ Priority access to new dungeon releases</li>
                <li>✓ Special "Active Ally" card frame</li>
              </>
            )}
            {currentTier.minEth >= 5 && (
              <>
                <li>✓ Guardian Supporter Discord role</li>
                <li>✓ Early beta access to new features</li>
              </>
            )}
            {currentTier.minEth >= 10 && (
              <>
                <li>✓ Champion Advocate recognition in credits</li>
                <li>✓ 1-on-1 call with development team</li>
                <li>✓ Custom champion card design consultation</li>
              </>
            )}
          </ul>        </div>

        {/* Polaris Link */}
        <a 
          href="https://polarisproject.org"
          target="_blank"
          rel="noopener noreferrer"
          className="polaris-link"
        >
          <Heart size={14} fill="#ef4444" />
          Learn more about Polaris Project
        </a>
      </div>

      {/* Styles */}
      <style jsx>{`
        .player-impact-counter {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 480px;
          margin: 0 auto;
        }

        /* Milestone Celebration */
        .milestone-celebration {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .celebration-content {
          text-align: center;
          animation: scaleIn 0.5s ease;
        }

        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .celebration-icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: bounce 1s ease infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .celebration-content h2 {
          color: #f59e0b;
          font-size: 32px;
          margin: 0 0 12px 0;
        }

        .celebration-content p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 18px;
          margin: 0 0 20px 0;
        }

        .celebration-amount {
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          padding: 16px 32px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 12px;
          display: inline-block;
        }

        /* Main Card */
        .impact-card {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 20px;
          padding: 28px;
          border: 2px solid;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        .connect-prompt {
          text-align: center;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .connect-icon {
          color: #6366f1;
          margin-bottom: 16px;
        }

        .connect-prompt h3 {
          color: #fff;
          margin: 0 0 8px 0;
        }

        .connect-prompt p {
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        /* Tier Badge */
        .tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          margin-bottom: 20px;
        }

        .tier-icon {
          font-size: 18px;
        }

        .tier-name {
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Counter Section */
        .counter-section {
          text-align: center;
          margin-bottom: 24px;
        }

        .counter-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }

        .counter-heart {
          color: #ef4444;
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .counter-value {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .eth-amount {
          color: #fff;
          font-size: 56px;
          font-weight: 800;
          line-height: 1;
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .eth-symbol {
          color: rgba(255, 255, 255, 0.5);
          font-size: 24px;
          font-weight: 600;
        }

        .counter-usd {
          color: rgba(255, 255, 255, 0.5);
          font-size: 16px;
          margin-bottom: 16px;
        }

        /* THE KEY MESSAGE */
        .impact-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          padding: 16px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 15px;
          line-height: 1.5;
        }

        .impact-message strong {
          color: #ef4444;
          font-weight: 700;
        }

        /* Survivor Impact */
        .survivor-impact {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #22c55e;
          font-size: 14px;
          margin-bottom: 20px;
        }

        /* Tier Progress */
        .tier-progress {
          margin-bottom: 24px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          margin-bottom: 8px;
        }

        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s ease;
        }

        .progress-remaining {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          margin-top: 8px;
        }

        /* Impact Statement */
        .impact-statement {
          margin-bottom: 24px;
        }

        .impact-statement blockquote {
          color: rgba(255, 255, 255, 0.8);
          font-style: italic;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
          padding: 16px 20px;
          border-left: 3px solid currentTier.color;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 0 8px 8px 0;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        .stat-box {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 16px 8px;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
        }

        .stat-box svg {
          margin-bottom: 8px;
        }

        .stat-number {
          display: block;
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Community Context */
        .community-context {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .context-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: currentTier.gradient;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }

        .context-text strong {
          color: #fff;
          display: block;
          margin-bottom: 4px;
        }

        .context-text p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          margin: 0;
          line-height: 1.5;
        }

        /* Tier Benefits */
        .tier-benefits {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .tier-benefits h4 {
          color: #fff;
          font-size: 14px;
          margin: 0 0 12px 0;
        }

        .tier-benefits ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .tier-benefits li {
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tier-benefits li:last-child {
          border-bottom: none;
        }

        /* Polaris Link */
        .polaris-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #ef4444;
          font-size: 13px;
          text-decoration: none;
          padding: 12px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .polaris-link:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.5);
        }
      `}</style>
    </div>
  );
};

export default PlayerImpactCounter;
