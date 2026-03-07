/**
 * Integration Tests: Farcaster SDK Initialization
 * Tests Frame SDK integration and context handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Frame SDK
const mockFrameSdk = {
  context: {
    user: {
      fid: 12345,
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.png',
    },
    client: {
      clientFid: 123,
      added: true,
      notificationDetails: {
        url: 'https://api.farcaster.com/notifications',
        token: 'test-token',
      },
    },
  },
  actions: {
    ready: jest.fn().mockResolvedValue(undefined),
    signIn: jest.fn().mockResolvedValue({
      message: 'Sign in to Inversion Excursion',
      signature: '0xsignature',
      address: '0x1234567890123456789012345678901234567890',
    }),
    addFrame: jest.fn().mockResolvedValue({ added: true }),
  },
  emit: jest.fn(),
  on: jest.fn(),
};

jest.mock('@farcaster/frame-sdk', () => ({
  __esModule: true,
  default: mockFrameSdk,
}));

// Mock viem for signature verification
jest.mock('viem', () => ({
  verifyMessage: jest.fn().mockResolvedValue(true),
  createPublicClient: jest.fn().mockReturnValue({
    verifyMessage: jest.fn().mockResolvedValue(true),
  }),
  http: jest.fn(),
}));

interface FrameContext {
  user: {
    fid: number;
    username: string;
    displayName: string;
    avatarUrl: string;
  };
  client: {
    clientFid: number;
    added: boolean;
    notificationDetails?: {
      url: string;
      token: string;
    };
  };
}

interface AuthResult {
  success: boolean;
  fid?: number;
  address?: string;
  error?: string;
}

class FrameAuthService {
  private context: FrameContext | null = null;
  private isReady = false;

  async initialize(): Promise<boolean> {
    try {
      await mockFrameSdk.actions.ready();
      this.context = mockFrameSdk.context;
      this.isReady = true;
      return true;
    } catch (error) {
      console.error('Frame SDK initialization failed:', error);
      return false;
    }
  }

  async authenticate(): Promise<AuthResult> {
    if (!this.isReady) {
      return { success: false, error: 'Frame SDK not initialized' };
    }

    try {
      const signInResult = await mockFrameSdk.actions.signIn();
      
      // Verify signature
      const isValid = await this.verifySignature(
        signInResult.message,
        signInResult.signature,
        signInResult.address
      );

      if (!isValid) {
        return { success: false, error: 'Invalid signature' };
      }

      return {
        success: true,
        fid: this.context?.user.fid,
        address: signInResult.address,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  private async verifySignature(
    message: string,
    signature: string,
    address: string
  ): Promise<boolean> {
    const { verifyMessage } = await import('viem');
    return verifyMessage({
      message,
      signature: signature as `0x${string}`,
      address: address as `0x${string}`,
    });
  }

  getContext(): FrameContext | null {
    return this.context;
  }

  isInFrame(): boolean {
    return this.context !== null;
  }

  async addToHome(): Promise<{ added: boolean }> {
    if (!this.isReady) {
      return { added: false };
    }
    return mockFrameSdk.actions.addFrame();
  }
}

describe('Farcaster SDK Initialization', () => {
  let authService: FrameAuthService;

  beforeEach(() => {
    authService = new FrameAuthService();
    jest.clearAllMocks();
  });

  describe('SDK Initialization', () => {
    it('should initialize Frame SDK successfully', async () => {
      const result = await authService.initialize();
      
      expect(result).toBe(true);
      expect(mockFrameSdk.actions.ready).toHaveBeenCalled();
    });

    it('should store context after initialization', async () => {
      await authService.initialize();
      
      const context = authService.getContext();
      expect(context).not.toBeNull();
      expect(context?.user.fid).toBe(12345);
    });

    it('should handle initialization failure', async () => {
      (mockFrameSdk.actions.ready as jest.Mock).mockRejectedValueOnce(new Error('SDK Error'));
      
      const result = await authService.initialize();
      
      expect(result).toBe(false);
    });
  });

  describe('Frame Context', () => {
    it('should detect if running in Frame', async () => {
      expect(authService.isInFrame()).toBe(false);
      
      await authService.initialize();
      expect(authService.isInFrame()).toBe(true);
    });

    it('should extract user FID from context', async () => {
      await authService.initialize();
      
      const context = authService.getContext();
      expect(context?.user.fid).toBe(12345);
    });

    it('should extract user details from context', async () => {
      await authService.initialize();
      
      const context = authService.getContext();
      expect(context?.user.username).toBe('testuser');
      expect(context?.user.displayName).toBe('Test User');
    });

    it('should check if frame was added', async () => {
      await authService.initialize();
      
      const context = authService.getContext();
      expect(context?.client.added).toBe(true);
    });

    it('should extract notification details', async () => {
      await authService.initialize();
      
      const context = authService.getContext();
      expect(context?.client.notificationDetails).toBeDefined();
      expect(context?.client.notificationDetails?.token).toBe('test-token');
    });
  });

  describe('Authentication', () => {
    it('should fail authentication if not initialized', async () => {
      const result = await authService.authenticate();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Frame SDK not initialized');
    });

    it('should authenticate successfully after initialization', async () => {
      await authService.initialize();
      const result = await authService.authenticate();
      
      expect(result.success).toBe(true);
      expect(result.fid).toBe(12345);
      expect(result.address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should call signIn during authentication', async () => {
      await authService.initialize();
      await authService.authenticate();
      
      expect(mockFrameSdk.actions.signIn).toHaveBeenCalled();
    });

    it('should verify signature during authentication', async () => {
      await authService.initialize();
      const result = await authService.authenticate();
      
      expect(result.success).toBe(true);
    });

    it('should handle authentication failure', async () => {
      await authService.initialize();
      (mockFrameSdk.actions.signIn as jest.Mock).mockRejectedValueOnce(new Error('Sign in failed'));
      
      const result = await authService.authenticate();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign in failed');
    });
  });

  describe('Frame Actions', () => {
    it('should add frame to home', async () => {
      await authService.initialize();
      const result = await authService.addToHome();
      
      expect(result.added).toBe(true);
      expect(mockFrameSdk.actions.addFrame).toHaveBeenCalled();
    });

    it('should fail to add frame if not initialized', async () => {
      const result = await authService.addToHome();
      
      expect(result.added).toBe(false);
    });

    it('should handle add frame failure', async () => {
      await authService.initialize();
      (mockFrameSdk.actions.addFrame as jest.Mock).mockResolvedValueOnce({ added: false });
      
      const result = await authService.addToHome();
      
      expect(result.added).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user context', async () => {
      const originalContext = mockFrameSdk.context;
      mockFrameSdk.context = null as any;
      
      const result = await authService.initialize();
      expect(result).toBe(true); // Initialization still succeeds
      
      mockFrameSdk.context = originalContext;
    });

    it('should handle partial context', async () => {
      const originalContext = mockFrameSdk.context;
      mockFrameSdk.context = {
        user: { fid: 999, username: 'partial', displayName: 'Partial', avatarUrl: '' },
        client: { clientFid: 1, added: false },
      };
      
      await authService.initialize();
      const context = authService.getContext();
      
      expect(context?.user.fid).toBe(999);
      expect(context?.client.added).toBe(false);
      expect(context?.client.notificationDetails).toBeUndefined();
      
      mockFrameSdk.context = originalContext;
    });

    it('should handle multiple initializations', async () => {
      await authService.initialize();
      await authService.initialize();
      
      // Should not crash
      expect(authService.isInFrame()).toBe(true);
    });
  });
});
