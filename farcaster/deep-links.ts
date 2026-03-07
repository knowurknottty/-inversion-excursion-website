/**
 * Deep Link Handler for Cell Game
 * Manages invite codes, referral tracking, and friend invites via casts
 */

import { useEffect, useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface DeepLinkParams {
  invite?: string;
  inviter?: string;
  ref?: 'victory' | 'defeat' | 'highscore' | 'challenge';
  score?: string;
  floor?: string;
  rank?: string;
}

interface InviteData {
  code: string;
  inviterName?: string;
  inviterFid?: number;
  timestamp: number;
}

// ============================================================================
// URL PARSING
// ============================================================================

/**
 * Parse deep link parameters from current URL
 */
export function parseDeepLink(url?: string): DeepLinkParams {
  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const params = new URLSearchParams(new URL(targetUrl).search);
  
  return {
    invite: params.get('invite') || undefined,
    inviter: params.get('inviter') || undefined,
    ref: (params.get('ref') as DeepLinkParams['ref']) || undefined,
    score: params.get('score') || undefined,
    floor: params.get('floor') || undefined,
    rank: params.get('rank') || undefined,
  };
}

/**
 * Generate invite URL for sharing
 */
export function generateInviteUrl(inviteCode: string, inviterName?: string): string {
  const baseUrl = 'https://cell-game.xyz';
  const params = new URLSearchParams({ invite: inviteCode });
  if (inviterName) params.set('inviter', inviterName);
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate deep link for specific game result
 */
export function generateResultUrl(
  type: 'victory' | 'defeat' | 'highscore',
  data: { score: number; floor?: number; rank?: number }
): string {
  const baseUrl = 'https://cell-game.xyz';
  const params = new URLSearchParams({ ref: type, score: data.score.toString() });
  if (data.floor) params.set('floor', data.floor.toString());
  if (data.rank) params.set('rank', data.rank.toString());
  return `${baseUrl}?${params.toString()}`;
}

// ============================================================================
// INVITE MANAGEMENT
// ============================================================================

const INVITE_STORAGE_KEY = 'cell_invite_data';
const INVITE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Store invite data locally
 */
export function storeInvite(data: InviteData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Get stored invite data
 */
export function getStoredInvite(): InviteData | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(INVITE_STORAGE_KEY);
  if (!stored) return null;
  
  try {
    const data: InviteData = JSON.parse(stored);
    // Check expiry
    if (Date.now() - data.timestamp > INVITE_EXPIRY_MS) {
      localStorage.removeItem(INVITE_STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Clear stored invite
 */
export function clearStoredInvite(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(INVITE_STORAGE_KEY);
}

/**
 * Generate unique invite code
 */
export function generateInviteCode(fid?: number): string {
  const prefix = fid ? fid.toString(36).toUpperCase() : 'CELL';
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString(36).substring(-4).toUpperCase();
  return `${prefix}-${random}-${timestamp}`;
}

// ============================================================================
// REFERRAL TRACKING
// ============================================================================

interface ReferralStats {
  totalInvites: number;
  successfulReferrals: number;
  rewardsEarned: number;
}

const REFERRAL_STATS_KEY = 'cell_referral_stats';

/**
 * Get referral statistics
 */
export function getReferralStats(): ReferralStats {
  if (typeof window === 'undefined') return { totalInvites: 0, successfulReferrals: 0, rewardsEarned: 0 };
  
  const stored = localStorage.getItem(REFERRAL_STATS_KEY);
  if (!stored) return { totalInvites: 0, successfulReferrals: 0, rewardsEarned: 0 };
  
  try {
    return JSON.parse(stored);
  } catch {
    return { totalInvites: 0, successfulReferrals: 0, rewardsEarned: 0 };
  }
}

/**
 * Track invite sent
 */
export function trackInviteSent(): void {
  const stats = getReferralStats();
  stats.totalInvites++;
  localStorage.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));
}

/**
 * Track successful referral (when invitee joins)
 */
export function trackReferralSuccess(reward?: number): void {
  const stats = getReferralStats();
  stats.successfulReferrals++;
  if (reward) stats.rewardsEarned += reward;
  localStorage.setItem(REFERRAL_STATS_KEY, JSON.stringify(stats));
}

// ============================================================================
// REACT HOOK
// ============================================================================

interface UseDeepLinkResult {
  params: DeepLinkParams;
  inviteData: InviteData | null;
  isInviteValid: boolean;
  acceptInvite: () => void;
  dismissInvite: () => void;
}

/**
 * React hook for deep link handling
 */
export function useDeepLink(): UseDeepLinkResult {
  const [params, setParams] = useState<DeepLinkParams>({});
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [accepted, setAccepted] = useState(false);
  
  useEffect(() => {
    const parsed = parseDeepLink();
    setParams(parsed);
    
    // If URL has invite, create invite data
    if (parsed.invite) {
      const data: InviteData = {
        code: parsed.invite,
        inviterName: parsed.inviter,
        timestamp: Date.now(),
      };
      setInviteData(data);
      storeInvite(data);
    } else {
      // Check for stored invite
      const stored = getStoredInvite();
      if (stored) {
        setInviteData(stored);
      }
    }
  }, []);
  
  const acceptInvite = () => {
    if (inviteData) {
      setAccepted(true);
      trackReferralSuccess();
      // Clear from URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('invite');
      url.searchParams.delete('inviter');
      window.history.replaceState({}, '', url.toString());
    }
  };
  
  const dismissInvite = () => {
    clearStoredInvite();
    setInviteData(null);
    setAccepted(false);
  };
  
  return {
    params,
    inviteData,
    isInviteValid: !!inviteData && !accepted,
    acceptInvite,
    dismissInvite,
  };
}

// ============================================================================
// INVITE UI COMPONENT
// ============================================================================

interface InviteBannerProps {
  inviterName?: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export const InviteBanner: React.FC<InviteBannerProps> = ({
  inviterName,
  onAccept,
  onDismiss,
}) => (
  <div className="invite-banner">
    <div className="invite-content">
      <span className="invite-icon">🧬</span>
      <div className="invite-text">
        <strong>{inviterName || 'Someone'} invited you to the Cell</strong>
        <span>Accept to start together</span>
      </div>
    </div>
    <div className="invite-actions">
      <button className="btn-accept" onClick={onAccept}>Enter</button>
      <button className="btn-dismiss" onClick={onDismiss}>×</button>
    </div>
    
    <style>{`
      .invite-banner {
        background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        animation: slideIn 0.3s ease;
      }
      @keyframes slideIn {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .invite-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .invite-icon {
        font-size: 24px;
      }
      .invite-text {
        display: flex;
        flex-direction: column;
      }
      .invite-text strong {
        font-size: 14px;
      }
      .invite-text span {
        font-size: 12px;
        opacity: 0.8;
      }
      .invite-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .btn-accept {
        background: white;
        color: #8b5cf6;
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }
      .btn-dismiss {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
      }
    `}</style>
  </div>
);

// ============================================================================
// WARPCAST SPECIFIC
// ============================================================================

/**
 * Open Warpcast with invite intent
 */
export function openWarpcastInvite(inviteCode: string, message?: string): void {
  const text = message || 'Join me in the Cell';
  const url = generateInviteUrl(inviteCode);
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
  window.open(warpcastUrl, '_blank');
}

/**
 * Generate Frame action for inviting
 */
export function generateFrameInviteAction(inviteCode: string) {
  return {
    type: 'link',
    url: generateInviteUrl(inviteCode),
    name: 'Invite to Cell',
  };
}

export default {
  parseDeepLink,
  generateInviteUrl,
  generateResultUrl,
  generateInviteCode,
  storeInvite,
  getStoredInvite,
  clearStoredInvite,
  getReferralStats,
  trackInviteSent,
  trackReferralSuccess,
  useDeepLink,
  openWarpcastInvite,
  generateFrameInviteAction,
};
