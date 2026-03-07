/**
 * EPWORLD Farcaster SDK - Secure Exports
 * =======================================
 * All secure frame SDK exports in one place
 */

// Secured Frame SDK
export {
  // Core security functions
  verifyFrameSignature,
  verifyFarcasterIdentity,
  checkValidatorEligibility,
  checkFrameRateLimit,
  validateFrameAction,
  sanitizeFrameInput,
  performFrameSecurityCheck,
  generateMessageHash,
  generateFrameActionSignature,
  SECURITY_CONFIG,
  
  // Types
  type FrameContext,
  type FrameUser,
  type FrameActionPayload,
  type FrameSignatureVerification,
  type ValidatorEligibility,
  type FarcasterIdentity,
  type FrameSecurityCheck,
} from './frame-sdk-secured';

// Middleware
export {
  // Individual middleware
  frameRateLimitMiddleware,
  frameSignatureMiddleware,
  farcasterIdentityMiddleware,
  validatorStakingMiddleware,
  frameActionValidationMiddleware,
  
  // Composite middleware
  applyFrameSecurityMiddleware,
  
  // Response helpers
  createFrameActionResponse,
  createFrameImageResponse,
  
  // Utilities
  parseFramePayload,
  createErrorResponse,
  createSuccessResponse,
  
  // Types
  type FrameMiddlewareOptions,
} from '../epworld/epworld/apps/web/src/lib/middleware/frame-validation';

// Legacy SDK (deprecated)
export { default as legacyFrameSDK } from './frame-sdk';
