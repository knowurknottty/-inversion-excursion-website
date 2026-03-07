/**
 * ⚠️ DEPRECATED - USE frame-sdk-secured.ts INSTEAD
 * =================================================
 * This SDK lacks critical security features:
 * - No signature verification
 * - No validator staking checks
 * - No Farcaster identity verification
 * - No rate limiting
 *
 * For secure frame interactions, use:
 * import { performFrameSecurityCheck } from './frame-sdk-secured';
 *
 * @deprecated Use frame-sdk-secured.ts for all frame interactions
 */

import { sdk } from '@farcaster/miniapp-sdk';

// Types for Frame context
interface FrameContext {
  fid: number;
  username: string;
  displayName?: string;
  pfp?: string;
  custody?: string;
  client: {
    fid: number;
    username: string;
    displayName?: string;
    pfp?: string;
  };
}

interface FrameUser {
  fid: number;
  username: string;
  displayName?: string;
  pfp?: string;
  custody?: string;
}

// Global state
let frameContext: FrameContext | null = null;
let isFrameReady = false;

/**
 * Initialize the Frame SDK
 * Call this when your app mounts
 */
export async function initFrame(): Promise<FrameContext | null> {
  try {
    // Initialize the SDK
    await sdk.actions.ready({
      disableNativeGestures: false,
    });

    // Get user context
    const context = await sdk.context;
    
    if (context) {
      frameContext = {
        fid: context.user.fid,
        username: context.user.username,
        displayName: context.user.displayName,
        pfp: context.user.pfpUrl,
        custody: context.user.custody,
        client: {
          fid: context.client.fid,
          username: context.client.username,
          displayName: context.client.displayName,
          pfp: context.client.pfpUrl,
        }
      };
    }

    isFrameReady = true;
    console.log('[Frame] Initialized:', frameContext);
    
    return frameContext;
  } catch (error) {
    console.error('[Frame] Failed to initialize:', error);
    return null;
  }
}

/**
 * Check if running inside Warpcast/Frame
 */
export function isInFrame(): boolean {
  return typeof window !== 'undefined' && 
    (window as any).parent !== window &&
    !!frameContext;
}

/**
 * Get current Frame user context
 */
export function getFrameUser(): FrameUser | null {
  if (!frameContext) return null;
  return {
    fid: frameContext.fid,
    username: frameContext.username,
    displayName: frameContext.displayName,
    pfp: frameContext.pfp,
    custody: frameContext.custody,
  };
}

/**
 * Get full Frame context
 */
export function getFrameContext(): FrameContext | null {
  return frameContext;
}

/**
 * Open an external URL
 */
export async function openUrl(url: string): Promise<void> {
  if (!isFrameReady) {
    window.open(url, '_blank');
    return;
  }
  
  try {
    await sdk.actions.openUrl(url);
  } catch (error) {
    console.error('[Frame] Failed to open URL:', error);
    window.open(url, '_blank');
  }
}

/**
 * View a user's Farcaster profile
 */
export async function viewProfile(fid: number): Promise<void> {
  if (!isFrameReady) {
    openUrl(`https://warpcast.com/~/profiles/${fid}`);
    return;
  }
  
  try {
    await sdk.actions.viewProfile({ fid });
  } catch (error) {
    console.error('[Frame] Failed to view profile:', error);
    openUrl(`https://warpcast.com/~/profiles/${fid}`);
  }
}

/**
 * Close the frame (returns to feed)
 */
export async function closeFrame(): Promise<void> {
  if (!isFrameReady) return;
  
  try {
    await sdk.actions.close();
  } catch (error) {
    console.error('[Frame] Failed to close:', error);
  }
}

/**
 * Request wallet connection (for transactions)
 */
export async function requestWallet(): Promise<string | null> {
  if (!isFrameReady) return null;
  
  try {
    const result = await sdk.actions.requestWallet();
    return result || null;
  } catch (error) {
    console.error('[Frame] Failed to request wallet:', error);
    return null;
  }
}

/**
 * Sign a message
 */
export async function signMessage(message: string): Promise<string | null> {
  if (!isFrameReady) return null;
  
  try {
    const signature = await sdk.actions.signMessage({ message });
    return signature || null;
  } catch (error) {
    console.error('[Frame] Failed to sign message:', error);
    return null;
  }
}

/**
 * React hook for Frame integration
 */
export function useFrame() {
  return {
    isReady: isFrameReady,
    isInFrame: isInFrame(),
    user: getFrameUser(),
    context: getFrameContext(),
    init: initFrame,
    openUrl,
    viewProfile,
    closeFrame,
    requestWallet,
    signMessage,
  };
}

export default sdk;
