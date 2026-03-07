import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { AlertTriangle, Heart, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

/**
 * PolarisCharityMintCard
 * 
 * Real-time mint UI component showing charity donation information.
 * Displays the exact amount that will be donated to Polaris Project
 * before the user confirms their mint.
 * 
 * Reference: RFC-7231 (Transparency in UI design)
 * Style: Clean, minimal with prominent charity callout
 */

const POLARIS_MINTER_ABI = [
  {
    inputs: [],
    name: "mintPrice",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CHARITY_BASIS_POINTS",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentDonationAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "POLARIS_PROJECT_ADDRESS",
    outputs: [{ name: "", type: "address" }],
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
  {
    inputs: [
      { name: "uri", type: "string" },
      {
        components: [
          { name: "power", type: "uint256" },
          { name: "rarity", type: "uint256" },
          { name: "chapter", type: "uint256" },
          { name: "dungeon", type: "string" },
          { name: "extractedQuote", type: "string" },
          { name: "mintTimestamp", type: "uint256" },
          { name: "minter", type: "address" },
        ],
        name: "attributes",
        type: "tuple",
      },
    ],
    name: "mintWithCharity",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
];

interface CardAttributes {
  power: bigint;
  rarity: bigint;
  chapter: bigint;
  dungeon: string;
  extractedQuote: string;
  mintTimestamp: bigint;
  minter: string;
}

interface PolarisCharityMintCardProps {
  contractAddress: `0x${string}`;
  metadataUri: string;
  attributes: CardAttributes;
  onMintSuccess?: (tokenId: string) => void;
  onMintError?: (error: Error) => void;
}

export const PolarisCharityMintCard: React.FC<PolarisCharityMintCardProps> = ({
  contractAddress,
  metadataUri,
  attributes,
  onMintSuccess,
  onMintError,
}) => {
  const { address, isConnected } = useAccount();
  const [isHovering, setIsHovering] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Read contract data
  const { data: mintPrice } = useReadContract({
    address: contractAddress,
    abi: POLARIS_MINTER_ABI,
    functionName: 'mintPrice',
  });

  const { data: charityAmount } = useReadContract({
    address: contractAddress,
    abi: POLARIS_MINTER_ABI,
    functionName: 'getCurrentDonationAmount',
  });

  const { data: polarisAddress } = useReadContract({
    address: contractAddress,
    abi: POLARIS_MINTER_ABI,
    functionName: 'POLARIS_PROJECT_ADDRESS',
  });

  const { data: globalStats } = useReadContract({
    address: contractAddress,
    abi: POLARIS_MINTER_ABI,
    functionName: 'getGlobalCharityStats',
  });

  // Write contract
  const { 
    writeContract, 
    data: hash,
    isPending: isMinting,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculate amounts
  const mintPriceEth = mintPrice ? formatEther(mintPrice) : '0.01';
  const charityAmountEth = charityAmount ? formatEther(charityAmount) : '0.001';
  const totalRaised = globalStats ? formatEther(globalStats[0]) : '0';
  const totalMints = globalStats ? globalStats[1].toString() : '0';

  const handleMint = () => {
    if (!isConnected || !mintPrice) return;

    writeContract({
      address: contractAddress,
      abi: POLARIS_MINTER_ABI,
      functionName: 'mintWithCharity',
      args: [metadataUri, attributes],
      value: mintPrice,
    });
  };

  useEffect(() => {
    if (isSuccess && hash) {
      onMintSuccess?.(hash);
    }
  }, [isSuccess, hash, onMintSuccess]);

  useEffect(() => {
    if (writeError) {
      onMintError?.(writeError);
    }
  }, [writeError, onMintError]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="polaris-mint-card">
      {/* Main Card Container */}
      <div 
        className="mint-card-container"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Header */}
        <div className="mint-card-header">
          <h2 className="mint-title">Mint Your Scroll Card</h2>
          <div className="charity-badge">
            <Heart className="heart-icon" size={16} />
            <span>10% to Survivor Support</span>
          </div>
        </div>

        {/* Price Display */}
        <div className="price-section">
          <div className="price-row">
            <span className="price-label">Mint Price</span>
            <span className="price-value">{mintPriceEth} ETH</span>
          </div>
        </div>

        {/* Donation Callout - THE KEY FEATURE */}
        <div className="donation-callout">
          <div className="donation-header">
            <Heart className="donation-heart" size={20} fill="#ef4444" stroke="#ef4444" />
            <span className="donation-label">This Mint Will Send</span>
          </div>
          
          <div className="donation-amount">
            <span className="donation-eth">{charityAmountEth} ETH</span>
            <span className="donation-percent">(10%)</span>
          </div>
          
          <div className="donation-recipient">
            <span>to</span>
            <strong>Polaris Project</strong>
            <span className="recipient-subtitle">National Trafficking Hotline</span>
          </div>

          {/* Recipient Address */}
          {polarisAddress && (
            <a 
              href={`https://etherscan.io/address/${polarisAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="recipient-address"
            >
              <span>{formatAddress(polarisAddress)}</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Impact Preview */}
        <div className="impact-preview">
          <Info size={14} className="impact-icon" />
          <span className="impact-text">
            Your contribution helps operate the 24/7 National Human Trafficking Hotline
          </span>
        </div>

        {/* Global Stats */}
        <div className="global-stats">
          <div className="stat-item">
            <span className="stat-value">{totalRaised}</span>
            <span className="stat-label">ETH Raised</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{totalMints}</span>
            <span className="stat-label">Charity Mints</span>
          </div>
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={!isConnected || isMinting || isConfirming}
          className={`mint-button ${isMinting || isConfirming ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
        >
          {!isConnected ? (
            'Connect Wallet'
          ) : isConfirming ? (
            <>
              <span className="spinner" />
              Confirming...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={18} />
              Minted Successfully!
            </>
          ) : (
            `Mint for ${mintPriceEth} ETH`
          )}
        </button>

        {/* Transaction Hash */}
        {hash && (
          <a 
            href={`https://etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
          >
            View Transaction
            <ExternalLink size={12} />
          </a>
        )}

        {/* Learn More Toggle */}
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="details-toggle"
        >
          {showDetails ? 'Hide Details' : 'Learn More About Polaris Project'}
        </button>

        {/* Expanded Details */}
        {showDetails && (
          <div className="details-panel">
            <h4>About Polaris Project</h4>
            <p>
              Polaris is a nonprofit organization that operates the U.S. National Human 
              Trafficking Hotline. Since 2007, they have connected thousands of victims 
              and survivors to critical support and resources.
            </p>
            <div className="details-links">
              <a 
                href="https://polarisproject.org" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Visit Polaris Project
                <ExternalLink size={12} />
              </a>
              <a 
                href="https://epworld.io/transparency" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View Transparency Dashboard
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .polaris-mint-card {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 400px;
          margin: 0 auto;
        }

        .mint-card-container {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .mint-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .mint-title {
          color: #fff;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        .charity-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .heart-icon {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .price-section {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .price-value {
          color: #fff;
          font-size: 18px;
          font-weight: 700;
        }

        /* THE KEY DONATION CALLOUT */
        .donation-callout {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .donation-callout::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .donation-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }

        .donation-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .donation-amount {
          position: relative;
          z-index: 1;
          margin-bottom: 8px;
        }

        .donation-eth {
          color: #fff;
          font-size: 28px;
          font-weight: 800;
          display: block;
        }

        .donation-percent {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
        }

        .donation-recipient {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .donation-recipient span:first-child {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
        }

        .donation-recipient strong {
          color: #fff;
          font-size: 16px;
          font-weight: 700;
        }

        .recipient-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
        }

        .recipient-address {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 11px;
          font-family: monospace;
          text-decoration: none;
          margin-top: 8px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
          transition: all 0.2s;
          position: relative;
          z-index: 1;
        }

        .recipient-address:hover {
          color: #fff;
          background: rgba(0, 0, 0, 0.4);
        }

        .impact-preview {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .impact-icon {
          color: #3b82f6;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .impact-text {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          line-height: 1.5;
        }

        .global-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }

        .stat-value {
          display: block;
          color: #22c55e;
          font-size: 18px;
          font-weight: 700;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .mint-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .mint-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
        }

        .mint-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mint-button.loading {
          background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
        }

        .mint-button.success {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .tx-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #6366f1;
          font-size: 13px;
          text-decoration: none;
          margin-top: 12px;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .tx-link:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        .details-toggle {
          width: 100%;
          margin-top: 16px;
          padding: 12px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .details-toggle:hover {
          border-color: rgba(255, 255, 255, 0.3);
          color: rgba(255, 255, 255, 0.9);
        }

        .details-panel {
          margin-top: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
        }

        .details-panel h4 {
          color: #fff;
          font-size: 14px;
          margin: 0 0 12px 0;
        }

        .details-panel p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .details-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .details-links a {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6366f1;
          font-size: 13px;
          text-decoration: none;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .details-links a:hover {
          background: rgba(99, 102, 241, 0.1);
        }
      `}</style>
    </div>
  );
};

export default PolarisCharityMintCard;
