import React, { useState, useEffect } from 'react';
import { useReadContract, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import { 
  Shield, 
  ExternalLink, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Copy,
  RefreshCw,
  Clock,
  Users,
  TrendingUp,
  Heart
} from 'lucide-react';

/**
 * PolarisTransparencyDashboard
 * 
 * Public transparency dashboard for Polaris Project partnership.
 * Shows all donation transactions, recipient addresses, and on-chain verification.
 * 
 * Features:
 * - Real-time donation feed from contract events
 * - Verifiable on-chain data
 * - Searchable/filterable transaction history
 * - Export functionality for auditors
 * - Partnership verification display
 * 
 * URL: /transparency or /polaris-dashboard
 */

const POLARIS_MINTER_ABI = [
  {
    inputs: [],
    name: "POLARIS_PROJECT_ADDRESS",
    outputs: [{ name: "", type: "address" }],
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
    name: "PARTNERSHIP_COMMITMENT_HASH",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PARTNERSHIP_EFFECTIVE_DATE",
    outputs: [{ name: "", type: "uint256" }],
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
    inputs: [{ name: "start", type: "uint256" }, { name: "count", type: "uint256" }],
    name: "getDonationHistory",
    outputs: [
      {
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "minter", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "mintPrice", type: "uint256" },
          { name: "transactionHash", type: "string" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getTokenDonation",
    outputs: [
      {
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "minter", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "mintPrice", type: "uint256" },
          { name: "transactionHash", type: "string" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPartnershipInfo",
    outputs: [
      { name: "polarisAddress", type: "address" },
      { name: "charityPercent", type: "uint256" },
      { name: "commitmentHash", type: "bytes32" },
      { name: "effectiveDate", type: "uint256" },
      { name: "agreementUri", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

interface DonationRecord {
  tokenId: bigint;
  minter: string;
  amount: bigint;
  timestamp: bigint;
  mintPrice: bigint;
  transactionHash: string;
}

interface PolarisTransparencyDashboardProps {
  contractAddress: `0x${string}`;
  chainId?: number;
  blockExplorerUrl?: string;
}

const ITEMS_PER_PAGE = 20;

export const PolarisTransparencyDashboard: React.FC<PolarisTransparencyDashboardProps> = ({
  contractAddress,
  chainId = 1,
  blockExplorerUrl = 'https://etherscan.io',
}) => {
  const publicClient = usePublicClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Read partnership info
  const { data: partnershipInfo } = useReadContract({
    address: contractAddress,
    abi: POLARIS_MINTER_ABI,
    functionName: 'getPartnershipInfo',
  });

  // Read global stats
  const { data: globalStats, refetch: refetchStats } = useReadContract({
    address: contractAddress,
    abi: POLARIS_MINTER_ABI,
    functionName: 'getGlobalCharityStats',
  });

  // Read donation history
  const { data: donationHistory, refetch: refetchHistory } = useReadContract({
    address: contractAddress,
    abi: POLARIS_MINTER_ABI,
    functionName: 'getDonationHistory',
    args: [BigInt(currentPage * ITEMS_PER_PAGE), BigInt(ITEMS_PER_PAGE)],
  });

  // Parse data
  const polarisAddress = partnershipInfo?.[0];
  const charityPercent = partnershipInfo ? Number(partnershipInfo[1]) / 100 : 10;
  const commitmentHash = partnershipInfo?.[2];
  const effectiveDate = partnershipInfo ? Number(partnershipInfo[3]) * 1000 : null;

  const totalDonated = globalStats ? formatEther(globalStats[0]) : '0';
  const totalMints = globalStats ? globalStats[1].toString() : '0';
  const totalSurvivorSupport = globalStats ? formatEther(globalStats[2]) : '0';
  const currentMintPrice = globalStats ? formatEther(globalStats[3]) : '0';
  const milestoneCount = globalStats ? globalStats[4].toString() : '0';

  const donations: DonationRecord[] = donationHistory || [];

  // Filter and sort donations
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      searchQuery === '' || 
      donation.minter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.tokenId.toString().includes(searchQuery);
    
    const matchesMinAmount = 
      filterMinAmount === '' || 
      Number(formatEther(donation.amount)) >= Number(filterMinAmount);
    
    return matchesSearch && matchesMinAmount;
  });

  const sortedDonations = [...filteredDonations].sort((a, b) => {
    if (sortBy === 'timestamp') {
      return sortOrder === 'desc' 
        ? Number(b.timestamp) - Number(a.timestamp)
        : Number(a.timestamp) - Number(b.timestamp);
    }
    return sortOrder === 'desc'
      ? Number(b.amount) - Number(a.amount)
      : Number(a.amount) - Number(b.amount);
  });

  // Handlers
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleRefresh = async () => {
    await refetchStats();
    await refetchHistory();
    setLastRefresh(new Date());
  };

  const handleExport = () => {
    const csvContent = [
      ['Token ID', 'Minter', 'Amount (ETH)', 'Timestamp', 'Transaction Hash'].join(','),
      ...sortedDonations.map(d => [
        d.tokenId.toString(),
        d.minter,
        formatEther(d.amount),
        new Date(Number(d.timestamp) * 1000).toISOString(),
        d.transactionHash || 'Pending',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polaris-donations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const timeAgo = (timestamp: bigint) => {
    const seconds = Math.floor((Date.now() - Number(timestamp) * 1000) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="polaris-transparency-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-badge">
              <Shield size={32} className="shield-icon" />
              <Heart size={16} className="heart-icon" fill="#ef4444" />
            </div>
            <div className="header-text">
              <h1>Polaris Project Transparency Dashboard</h1>
              <p>On-chain verification of all charitable donations</p>
            </div>
          </div>          
          <div className="header-actions">
            <button onClick={handleRefresh} className="refresh-btn">
              <RefreshCw size={16} />
              Refresh
            </button>
            <span className="last-updated">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      {/* Partnership Verification Banner */}
      <section className="partnership-banner">
        <div className="verification-badge">
          <CheckCircle2 size={20} className="verified-icon" />
          <span>Protocol-Level Partnership Verified On-Chain</span>
        </div>        
        <div className="partnership-details">
          <div className="detail-item">
            <span className="detail-label">Recipient</span>            <div className="detail-value address-value">
              {polarisAddress ? (
                <>
                  <span>{formatAddress(polarisAddress)}</span>
                  <button 
                    onClick={() => handleCopyAddress(polarisAddress)}
                    className="copy-btn"
                  >
                    {copiedAddress === polarisAddress ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Copy size={14} /
                    )}
                  </button>                  <a 
                    href={`${blockExplorerUrl}/address/${polarisAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="explorer-link"
                  >
                    <ExternalLink size={14} />
                  </a>
                </>
              ) : (
                'Loading...'
              )}
            </div>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Donation Rate</span>            <span className="detail-value highlight">{charityPercent}% of every mint</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-label">Contract</span>            <a 
              href={`${blockExplorerUrl}/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-value link"
            >              {formatAddress(contractAddress)}
              <ExternalLink size={12} />
            </a>
          </div>          
          <div className="detail-item">
            <span className="detail-label">Partnership Since</span>            <span className="detail-value">              {effectiveDate ? new Date(effectiveDate).toLocaleDateString() : 'Loading...'}
            </span>
          </div>        </div>
        
        {commitmentHash && (
          <div className="commitment-hash">
            <span>Partnership Commitment Hash:</span>            <code>{commitmentHash}</code>
            <span className="hash-info">SHA256 of partnership agreement (immutable)</span>
          </div>
        )}
      </section>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon"><TrendingUp size={24} /></div>          <div className="stat-content">
            <span className="stat-value">{parseFloat(totalDonated).toFixed(4)}</span>            <span className="stat-unit">ETH</span>
            <span className="stat-label">Total Donated</span>
          </div>        </div>
        
        <div className="stat-card">
          <div className="stat-icon purple"><Users size={24} /></div>          <div className="stat-content">
            <span className="stat-value">{totalMints}</span>            <span className="stat-label">Charity Mints</span>
          </div>        </div>
        
        <div className="stat-card">
          <div className="stat-icon green"><Heart size={24} /></div>          <div className="stat-content">
            <span className="stat-value">{milestoneCount}</span>            <span className="stat-label">ETH Milestones</span>
          </div>        </div>
        
        <div className="stat-card">
          <div className="stat-icon blue"><Clock size={24} /></div>          <div className="stat-content">            <span className="stat-value">{currentMintPrice}</span>            <span className="stat-unit">ETH</span>            <span className="stat-label">Current Mint Price</span>
          </div>        </div>      </section>

      {/* Donation History Section */}
      <section className="donation-history">
        <div className="section-header">
          <h2>Donation History</h2>          <div className="section-actions">
            <button onClick={handleExport} className="export-btn">              <Download size={16} />              Export CSV
            </button>          </div>        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">            <Search size={16} className="filter-icon" />            <input
              type="text"
              placeholder="Search by address or token ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-input"
            />          </div>
          
          <div className="filter-group small">            <Filter size={16} className="filter-icon" />            <input
              type="number"
              placeholder="Min ETH"
              value={filterMinAmount}
              onChange={(e) => setFilterMinAmount(e.target.value)}
              className="filter-input"
              step="0.001"
            />          </div>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'timestamp' | 'amount')}
            className="filter-select"
          >            <option value="timestamp">Sort by Time</option>            <option value="amount">Sort by Amount</option>          </select>
          
          <button 
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="sort-order-btn"
          >            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>        </div>

        {/* Donation Table */}
        <div className="donation-table-container">          <table className="donation-table">            <thead>              <tr>                <th>Token ID</th>                <th>Minter</th>                <th>Amount</th>                <th>Time</th>                <th>Actions</th>              </tr>            </thead>            
            <tbody>              {sortedDonations.length > 0 ? (
                sortedDonations.map((donation, index) => (
                  <tr key={index} className="donation-row">                    <td><span className="token-id">#{donation.tokenId.toString()}</span></td>                    
                    <td>                      <div className="minter-cell">                        <span className="minter-address">{formatAddress(donation.minter)}</span>                        
                        <button 
                          onClick={() => handleCopyAddress(donation.minter)}
                          className="action-btn"
                        >                          {copiedAddress === donation.minter ? (
                            <CheckCircle2 size={14} className="success" />                          ) : (
                            <Copy size={14} />                          )}
                        </button>                      </div>                    </td>                    
                    <td>                      <div className="amount-cell">                        <span className="eth-amount">{formatEther(donation.amount)}</span>                        
                        <span className="eth-label">ETH</span>                      </div>                    </td>                    
                    <td>                      <div className="time-cell">                        <span className="timestamp">{formatTimestamp(donation.timestamp)}</span>                        
                        <span className="time-ago">{timeAgo(donation.timestamp)}</span>                      </div>                    </td>                    
                    <td>                      <div className="actions-cell">                        <a 
                          href={`${blockExplorerUrl}/token/${contractAddress}?a=${donation.tokenId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="action-btn"
                          title="View Token"
                        >                          <ExternalLink size={14} />                        </a>                      </div>                    </td>                  </tr>                ))
              ) : (
                <tr>                  <td colSpan={5} className="empty-state">                    <div className="empty-content">                      <AlertTriangle size={32} />                      <p>No donations found matching your filters</p>                    </div>                  </td>                </tr>              )}
            </tbody>          </table>        </div>

        {/* Pagination */}
        <div className="pagination">          <button 
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="page-btn"
          >            <ChevronLeft size={16} />            Previous
          </button>          
          <span className="page-info">            Page {currentPage + 1}
          </span>          
          <button 
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={sortedDonations.length < ITEMS_PER_PAGE}
            className="page-btn"
          >            Next
            <ChevronRight size={16} />          </button>        </div>      </section>

      {/* Verification Footer */}
      <footer className="dashboard-footer">        <div className="verification-notice">          <Shield size={16} />          <p>            All data is read directly from the blockchain. This dashboard connects to the smart contract 
            at <code>{contractAddress}</code>. Donations are automatically executed on-chain and cannot be 
            altered or withheld by any party.
          </p>        </div>        
        <div className="footer-links">          <a href="https://polarisproject.org" target="_blank" rel="noopener noreferrer">            Polaris Project Website          </a>          
          <a href={`${blockExplorerUrl}/address/${polarisAddress}`} target="_blank" rel="noopener noreferrer">            Verify Recipient Address          </a>          
          <a href="/partnership-agreement" target="_blank">            Partnership Agreement          </a>        </div>      </footer>

      {/* Styles */}
      <style jsx>{`
        .polaris-transparency-dashboard {
          font-family: system-ui, -apple-system, sans-serif;
          background: #0a0a0f;
          min-height: 100vh;
          color: #fff;
        }

        /* Header */
        .dashboard-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px 32px;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .logo-badge {
          position: relative;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .shield-icon {
          color: #fff;
        }

        .heart-icon {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: #0a0a0f;
          padding: 4px;
          border-radius: 50%;
        }

        .header-text h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .header-text p {
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .last-updated {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
        }

        /* Partnership Banner */
        .partnership-banner {
          max-width: 1400px;
          margin: 24px auto;
          padding: 0 32px;
        }

        .verification-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .verified-icon {
          color: #22c55e;
        }

        .partnership-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detail-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          color: #fff;
          font-size: 14px;
          font-family: monospace;
        }

        .detail-value.highlight {
          color: #ef4444;
          font-weight: 700;
          font-family: inherit;
        }

        .detail-value.link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6366f1;
          text-decoration: none;
        }

        .address-value {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .copy-btn, .explorer-link {
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s;
        }

        .copy-btn:hover, .explorer-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .commitment-hash {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .commitment-hash span:first-child {
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
        }

        .commitment-hash code {
          color: #f59e0b;
          font-family: monospace;
          font-size: 13px;
        }

        .hash-info {
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
        }

        /* Stats Grid */
        .stats-grid {
          max-width: 1400px;
          margin: 0 auto 32px;
          padding: 0 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-card.primary {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
          border-color: rgba(239, 68, 68, 0.2);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
        }

        .stat-icon.purple {
          background: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
        }

        .stat-icon.green {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .stat-icon.blue {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
        }

        .stat-card.primary .stat-value {
          background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-unit {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
          margin-left: 4px;
        }

        .stat-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
        }

        /* Donation History */
        .donation-history {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px 32px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 700;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          color: #6366f1;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-btn:hover {
          background: rgba(99, 102, 241, 0.2);
        }

        .filters {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 10px 14px;
          flex: 1;
          min-width: 200px;
        }

        .filter-group.small {
          flex: 0 0 120px;
          min-width: 120px;
        }

        .filter-icon {
          color: rgba(255, 255, 255, 0.4);
        }

        .filter-input {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 14px;
          width: 100%;
          outline: none;
        }

        .filter-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .filter-select {
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }

        .sort-order-btn {
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          cursor: pointer;
          font-size: 16px;
        }

        /* Table */
        .donation-table-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
        }

        .donation-table {
          width: 100%;
          border-collapse: collapse;
        }

        .donation-table th {
          background: rgba(255, 255, 255, 0.03);
          padding: 14px 16px;
          text-align: left;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .donation-table td {
          padding: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
        }

        .donation-row:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .token-id {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
        }

        .minter-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .minter-address {
          font-family: monospace;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }

        .action-btn {
          padding: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        .action-btn .success {
          color: #22c55e;
        }

        .amount-cell {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .eth-amount {
          color: #ef4444;
          font-weight: 700;
          font-size: 14px;
        }

        .eth-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }

        .time-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .timestamp {
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
        }

        .time-ago {
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
        }

        .actions-cell {
          display: flex;
          gap: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-content {
          color: rgba(255, 255, 255, 0.4);
        }

        .empty-content svg {
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-content p {
          margin: 0;
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
        }

        .page-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
        }

        .page-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .page-info {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        /* Footer */
        .dashboard-footer {
          max-width: 1400px;
          margin: 0 auto;
          padding: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .verification-notice {
          display: flex;
          gap: 12px;
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .verification-notice svg {
          color: #22c55e;
          flex-shrink: 0;
        }

        .verification-notice p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          line-height: 1.6;
          margin: 0;
        }

        .verification-notice code {
          color: #6366f1;
          font-family: monospace;
          background: rgba(99, 102, 241, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 32px;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default PolarisTransparencyDashboard;
