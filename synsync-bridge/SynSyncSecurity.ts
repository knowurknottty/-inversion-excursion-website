/**
 * SynSync Bridge - Security & Verification
 * Anti-cheat and proof validation systems
 */

import { EntrainmentProof } from './SynSyncEngine';

export interface VerificationResult {
  isValid: boolean;
  confidence: number;  // 0.0 - 1.0
  reasons: string[];
  score: number;       // Composite trust score
}

export interface AntiCheatMetrics {
  entropyScore: number;
  timingVariance: number;
  audioFingerprintMatch: boolean;
  humanLikelihood: number;
}

// Minimum entropy threshold (bits)
const MIN_ENTROPY = 0.5;

// Minimum session duration (seconds)
const MIN_DURATION = 45;

// Maximum acceptable frequency deviation
const MAX_FREQ_DEVIATION = 5; // Hz

/**
 * Verify entrainment proof server-side
 * Call this from your backend to validate client-submitted proofs
 */
export function verifyEntrainmentProof(
  proof: EntrainmentProof,
  expectedFrequency: number
): VerificationResult {
  const reasons: string[] = [];
  let score = 0;

  // Check 1: Session duration
  if (proof.duration < MIN_DURATION) {
    reasons.push(`Session too short: ${proof.duration.toFixed(1)}s (min: ${MIN_DURATION}s)`);
  } else {
    score += 0.2;
    reasons.push(`Session duration OK: ${proof.duration.toFixed(1)}s`);
  }

  // Check 2: Frequency entropy (anti-bot)
  if (proof.entropy < MIN_ENTROPY) {
    reasons.push(`Suspicious frequency pattern (entropy: ${proof.entropy.toFixed(2)})`);
  } else {
    score += 0.25;
    reasons.push(`Frequency entropy OK: ${proof.entropy.toFixed(2)} bits`);
  }

  // Check 3: Target frequency match
  const freqDeviation = Math.abs(proof.targetFrequency - expectedFrequency);
  if (freqDeviation > MAX_FREQ_DEVIATION) {
    reasons.push(`Frequency mismatch: ${freqDeviation.toFixed(1)}Hz off target`);
  } else {
    score += 0.2;
    reasons.push(`Frequency match OK: ${freqDeviation.toFixed(1)}Hz deviation`);
  }

  // Check 4: Signature validation
  const signatureValid = validateSignature(proof);
  if (!signatureValid) {
    reasons.push('Invalid signature');
  } else {
    score += 0.2;
    reasons.push('Signature valid');
  }

  // Check 5: Timestamp freshness
  const age = (Date.now() - proof.timestamp) / 1000;
  if (age > 300) { // 5 minutes
    reasons.push(`Stale proof: ${age.toFixed(0)}s old`);
  } else {
    score += 0.15;
    reasons.push('Timestamp fresh');
  }

  // Determine validity
  const isValid = score >= 0.7 && proof.entropy >= MIN_ENTROPY;
  const confidence = Math.min(score * 1.2, 1.0); // Scale up slightly

  return {
    isValid,
    confidence,
    reasons,
    score
  };
}

/**
 * Validate proof signature (client-side check)
 * Note: This is obfuscation, not true security. Server validation is required.
 */
function validateSignature(proof: EntrainmentProof): boolean {
  // Parse signature version
  if (!proof.signature.startsWith('v1_')) {
    return false;
  }

  const parts = proof.signature.split('_');
  if (parts.length !== 3) return false;

  const [, hashHex, fingerprintB64] = parts;
  
  // Basic format validation
  if (!/^[0-9a-f]+$/.test(hashHex)) return false;
  if (!/^[A-Za-z0-9+/=]+$/.test(fingerprintB64)) return false;

  // Hash should be non-zero
  if (hashHex === '0') return false;

  return true;
}

/**
 * Calculate anti-cheat metrics from proof data
 */
export function analyzeAntiCheat(proof: EntrainmentProof): AntiCheatMetrics {
  // Analyze frequency sample variance
  const samples = proof.actualFrequencies;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / samples.length;
  const stdDev = Math.sqrt(variance);

  // Timing analysis (samples should be roughly 1 second apart)
  // In a real implementation, we'd track actual timestamps
  const expectedSampleCount = Math.floor(proof.duration);
  const timingVariance = Math.abs(samples.length - expectedSampleCount) / expectedSampleCount;

  // Audio fingerprint validation
  // Check if fingerprint looks reasonable (not all zeros, not suspiciously uniform)
  const fingerprintParts = proof.signature.split('_')[2];
  const audioFingerprintMatch = fingerprintParts && fingerprintParts.length > 8;

  // Calculate human likelihood score
  // Humans produce more variable patterns than bots
  let humanLikelihood = 0.5;
  
  if (proof.entropy > 1.0) humanLikelihood += 0.2;
  if (proof.entropy < 0.3) humanLikelihood -= 0.3;
  if (stdDev > 50) humanLikelihood += 0.1; // Natural variation
  if (stdDev < 5) humanLikelihood -= 0.2;  // Suspiciously stable
  if (samples.length >= expectedSampleCount * 0.8) humanLikelihood += 0.1;
  if (proof.duration >= 55) humanLikelihood += 0.1;

  return {
    entropyScore: proof.entropy,
    timingVariance,
    audioFingerprintMatch,
    humanLikelihood: Math.max(0, Math.min(1, humanLikelihood))
  };
}

/**
 * Generate challenge for proof-of-work style verification
 * Makes it expensive to generate fake proofs at scale
 */
export function generateVerificationChallenge(): {
  challenge: string;
  difficulty: number;
  expiresAt: number;
} {
  const nonce = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now();
  const difficulty = 2; // Number of leading zeros required
  
  return {
    challenge: `synsync_${timestamp}_${nonce}`,
    difficulty,
    expiresAt: timestamp + 60000 // 1 minute expiry
  };
}

/**
 * Verify challenge response
 * Client must find a hash with N leading zeros
 */
export function verifyChallengeResponse(
  challenge: string,
  response: string,
  difficulty: number
): boolean {
  const combined = challenge + response;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hashHex = Math.abs(hash).toString(16).padStart(8, '0');
  const requiredZeros = '0'.repeat(difficulty);
  
  return hashHex.startsWith(requiredZeros);
}

/**
 * Rate limiting helper
 * Track proof submissions per user
 */
export class ProofRateLimiter {
  private submissions: Map<string, number[]> = new Map();
  private readonly windowMs = 60000; // 1 minute window
  private readonly maxPerWindow = 3;

  canSubmit(userId: string): boolean {
    const now = Date.now();
    const userSubmissions = this.submissions.get(userId) || [];
    
    // Clean old submissions
    const recent = userSubmissions.filter(t => now - t < this.windowMs);
    
    return recent.length < this.maxPerWindow;
  }

  recordSubmission(userId: string): void {
    const now = Date.now();
    const userSubmissions = this.submissions.get(userId) || [];
    userSubmissions.push(now);
    this.submissions.set(userId, userSubmissions);
  }

  getRemaining(userId: string): number {
    const now = Date.now();
    const userSubmissions = this.submissions.get(userId) || [];
    const recent = userSubmissions.filter(t => now - t < this.windowMs);
    return Math.max(0, this.maxPerWindow - recent.length);
  }
}

/**
 * Server-side proof storage and replay protection
 */
export class ProofStore {
  private usedSessionIds: Set<string> = new Set();
  private proofHistory: Map<string, EntrainmentProof[]> = new Map();

  isSessionUsed(sessionId: string): boolean {
    return this.usedSessionIds.has(sessionId);
  }

  markSessionUsed(sessionId: string): void {
    this.usedSessionIds.add(sessionId);
  }

  storeProof(userId: string, proof: EntrainmentProof): void {
    const userProofs = this.proofHistory.get(userId) || [];
    userProofs.push(proof);
    
    // Keep only last 100 proofs per user
    if (userProofs.length > 100) {
      userProofs.shift();
    }
    
    this.proofHistory.set(userId, userProofs);
  }

  getUserHistory(userId: string): EntrainmentProof[] {
    return this.proofHistory.get(userId) || [];
  }
}

// Singleton instances for server use
export const proofRateLimiter = new ProofRateLimiter();
export const proofStore = new ProofStore();

/**
 * Full server-side verification pipeline
 */
export function fullServerVerification(
  proof: EntrainmentProof,
  userId: string,
  expectedFrequency: number
): { approved: boolean; multiplier: number; reasons: string[] } {
  // Check rate limit
  if (!proofRateLimiter.canSubmit(userId)) {
    return {
      approved: false,
      multiplier: 0,
      reasons: ['Rate limit exceeded. Try again later.']
    };
  }

  // Check replay
  if (proofStore.isSessionUsed(proof.sessionId)) {
    return {
      approved: false,
      multiplier: 0,
      reasons: ['Session already used. Cannot replay proofs.']
    };
  }

  // Verify proof
  const verification = verifyEntrainmentProof(proof, expectedFrequency);
  
  if (!verification.isValid) {
    return {
      approved: false,
      multiplier: 0,
      reasons: verification.reasons
    };
  }

  // Analyze anti-cheat
  const antiCheat = analyzeAntiCheat(proof);
  
  if (antiCheat.humanLikelihood < 0.3) {
    return {
      approved: false,
      multiplier: 0,
      reasons: [...verification.reasons, 'Bot-like pattern detected. Human verification required.']
    };
  }

  // Approve and record
  proofRateLimiter.recordSubmission(userId);
  proofStore.markSessionUsed(proof.sessionId);
  proofStore.storeProof(userId, proof);

  // Calculate final multiplier based on confidence
  const baseMultiplier = 1.0;
  const confidenceBonus = (verification.confidence - 0.7) * 0.5; // Up to +15% for high confidence
  const finalMultiplier = baseMultiplier + confidenceBonus;

  return {
    approved: true,
    multiplier: Math.min(finalMultiplier, 1.5),
    reasons: [...verification.reasons, `Anti-cheat score: ${(antiCheat.humanLikelihood * 100).toFixed(0)}% human`]
  };
}
