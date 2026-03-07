/**
 * SynSync Server-Side Verification Module
 * Express.js middleware and endpoints for entrainment verification
 */

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Configuration
const CONFIG = {
  SERVER_SECRET: process.env.SYNSYNC_SECRET || 'your-secret-key-here',
  MIN_SESSION_DURATION: 55000, // 55 seconds minimum
  MAX_SESSION_DURATION: 300000, // 5 minutes max
  ENTRAINMENT_DECAY_MINUTES: 30,
  BONUS_MULTIPLIERS: {
    honor: 0.2,       // +10% max (20% of 50%)
    biofeedback: 0.7,  // +35% max
    proof: 1.0,        // +50% max
    prime: 1.2         // +60% max (future)
  }
};

// In-memory nonce tracking (use Redis in production)
const usedNonces = new Set();
const entrainmentRecords = new Map();

/**
 * POST /api/entrainment/verify
 * Verify entrainment proof from client
 */
router.post('/verify', async (req, res) => {
  try {
    const { proof, sessionData } = req.body;
    
    // Validate request
    if (!proof || !sessionData) {
      return res.status(400).json({ error: 'Missing proof or session data' });
    }
    
    // Run all verification checks
    const verificationResult = await verifyEntrainment(proof, sessionData);
    
    if (!verificationResult.valid) {
      return res.status(403).json({
        verified: false,
        reason: verificationResult.reason,
        details: verificationResult.details
      });
    }
    
    // Calculate final entrainment level
    const entrainmentLevel = calculateEntrainmentLevel(proof, verificationResult);
    
    // Store record
    const record = {
      userId: req.user?.id || 'anonymous',
      protocol: proof.protocol,
      entrainmentLevel,
      verificationLevel: proof.verificationLevel,
      timestamp: Date.now(),
      expiresAt: Date.now() + (CONFIG.ENTRAINMENT_DECAY_MINUTES * 60 * 1000)
    };
    
    entrainmentRecords.set(proof.sessionId, record);
    
    // Cleanup old nonces periodically
    if (Math.random() < 0.01) cleanupOldNonces();
    
    res.json({
      verified: true,
      entrainmentLevel,
      protocol: proof.protocol,
      expiresAt: record.expiresAt,
      sessionId: proof.sessionId
    });
    
  } catch (error) {
    console.error('Entrainment verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * GET /api/entrainment/status/:sessionId
 * Check current entrainment status
 */
router.get('/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const record = entrainmentRecords.get(sessionId);
  
  if (!record) {
    return res.json({ active: false });
  }
  
  const now = Date.now();
  const age = now - record.timestamp;
  const maxAge = CONFIG.ENTRAINMENT_DECAY_MINUTES * 60 * 1000;
  
  if (age > maxAge) {
    entrainmentRecords.delete(sessionId);
    return res.json({ active: false, expired: true });
  }
  
  // Calculate current level with decay
  const decay = (age / (60 * 1000)) * 0.05; // 5% per minute
  const currentLevel = Math.max(0, record.entrainmentLevel - decay);
  
  res.json({
    active: currentLevel > 0.1,
    entrainmentLevel: currentLevel,
    protocol: record.protocol,
    expiresIn: Math.floor((record.expiresAt - now) / 1000),
    originalLevel: record.entrainmentLevel
  });
});

/**
 * Main verification logic
 */
async function verifyEntrainment(proof, sessionData) {
  const checks = [];
  
  // 1. Signature validation
  checks.push(verifySignature(proof));
  
  // 2. Replay protection
  checks.push(verifyNonce(proof.nonce));
  
  // 3. Session duration validation
  checks.push(verifyDuration(proof));
  
  // 4. Behavioral analysis
  checks.push(analyzeBehavior(sessionData));
  
  // 5. Biofeedback verification (if applicable)
  if (proof.verificationLevel === 'biofeedback') {
    checks.push(verifyBiofeedback(proof));
  }
  
  // Wait for all checks
  const results = await Promise.all(checks);
  
  // Aggregate results
  const failed = results.filter(r => !r.passed);
  
  if (failed.length > 0) {
    return {
      valid: false,
      reason: failed[0].reason,
      details: failed.map(f => ({ check: f.check, reason: f.reason }))
    };
  }
  
  return {
    valid: true,
    confidence: calculateConfidence(results),
    behavioralScore: results.find(r => r.check === 'behavior')?.score || 0
  };
}

/**
 * Verify HMAC signature
 */
function verifySignature(proof) {
  try {
    const payload = `${proof.sessionId}:${proof.startedAt}:${proof.completedAt}:${proof.protocol}`;
    const expectedSig = crypto
      .createHmac('sha256', CONFIG.SERVER_SECRET)
      .update(payload)
      .digest('hex');
    
    if (proof.signature !== expectedSig) {
      return { passed: false, check: 'signature', reason: 'Invalid signature' };
    }
    
    return { passed: true, check: 'signature' };
  } catch (error) {
    return { passed: false, check: 'signature', reason: 'Signature verification failed' };
  }
}

/**
 * Prevent replay attacks
 */
function verifyNonce(nonce) {
  if (!nonce || usedNonces.has(nonce)) {
    return { passed: false, check: 'nonce', reason: 'Invalid or reused nonce' };
  }
  
  usedNonces.add(nonce);
  return { passed: true, check: 'nonce' };
}

/**
 * Verify session duration is reasonable
 */
function verifyDuration(proof) {
  const duration = proof.completedAt - proof.startedAt;
  
  if (duration < CONFIG.MIN_SESSION_DURATION) {
    return { 
      passed: false, 
      check: 'duration', 
      reason: `Session too short: ${duration}ms (min: ${CONFIG.MIN_SESSION_DURATION}ms)` 
    };
  }
  
  if (duration > CONFIG.MAX_SESSION_DURATION) {
    return { 
      passed: false, 
      check: 'duration', 
      reason: 'Session unreasonably long' 
    };
  }
  
  return { passed: true, check: 'duration', duration };
}

/**
 * Analyze behavioral patterns for bot detection
 */
function analyzeBehavior(sessionData) {
  const issues = [];
  let score = 1.0;
  
  // Check interaction patterns
  if (sessionData.interactions) {
    const interactions = sessionData.interactions;
    
    // Too few interactions (AFK)
    if (interactions.length < 2) {
      issues.push('Too few interactions');
      score -= 0.3;
    }
    
    // Too many interactions (bot)
    if (interactions.length > 200) {
      issues.push('Suspicious interaction count');
      score -= 0.4;
    }
    
    // Check for robotic timing
    if (interactions.length > 5) {
      const intervals = [];
      for (let i = 1; i < interactions.length; i++) {
        intervals.push(interactions[i].timestamp - interactions[i-1].timestamp);
      }
      
      const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
      
      // Low variance suggests automation
      if (variance < 50) {
        issues.push('Robotic timing detected');
        score -= 0.5;
      }
      
      // Check for perfect intervals
      const perfectCount = intervals.filter(i => Math.abs(i - mean) < 5).length;
      if (perfectCount / intervals.length > 0.8) {
        issues.push('Perfect timing pattern');
        score -= 0.4;
      }
    }
  }
  
  // Check tab visibility
  if (sessionData.tabSwitches > 3) {
    issues.push('Excessive tab switching');
    score -= 0.2;
  }
  
  // Check audio playback
  if (!sessionData.audioPlayed) {
    issues.push('No audio playback detected');
    score -= 0.3;
  }
  
  return {
    passed: score > 0.5,
    check: 'behavior',
    score: Math.max(0, score),
    issues,
    confidence: score
  };
}

/**
 * Verify biofeedback data
 */
function verifyBiofeedback(proof) {
  if (!proof.bioSignature) {
    return { passed: false, check: 'biofeedback', reason: 'Missing biofeedback data' };
  }
  
  const { bioSignature } = proof;
  
  if (bioSignature.sampleCount < 10) {
    return { passed: false, check: 'biofeedback', reason: 'Insufficient samples' };
  }
  
  if (bioSignature.coherenceAverage < 0.3) {
    return { passed: false, check: 'biofeedback', reason: 'Low coherence score' };
  }
  
  // Check for suspicious consistency (too perfect = fake)
  if (bioSignature.varianceScore < 0.01) {
    return { passed: false, check: 'biofeedback', reason: 'Suspicious consistency' };
  }
  
  return { 
    passed: true, 
    check: 'biofeedback',
    coherence: bioSignature.coherenceAverage
  };
}

/**
 * Calculate final confidence score
 */
function calculateConfidence(results) {
  const weights = {
    signature: 0.3,
    nonce: 0.2,
    duration: 0.2,
    behavior: 0.2,
    biofeedback: 0.1
  };
  
  return results.reduce((acc, result) => {
    const weight = weights[result.check] || 0.1;
    return acc + (result.passed ? weight : 0);
  }, 0);
}

/**
 * Calculate final entrainment level
 */
function calculateEntrainmentLevel(proof, verificationResult) {
  let baseScore = proof.confidenceScore || 0.5;
  
  // Apply verification level multiplier
  const multiplier = CONFIG.BONUS_MULTIPLIERS[proof.verificationLevel] || 0.2;
  
  // Apply behavioral adjustment
  const behavioralBonus = (verificationResult.behavioralScore - 0.5) * 0.2;
  
  let finalScore = (baseScore * multiplier) + behavioralBonus;
  
  // Clamp to valid range
  return Math.max(0, Math.min(1, finalScore));
}

/**
 * Cleanup old nonces (prevent memory leak)
 */
function cleanupOldNonces() {
  // In production, use Redis with TTL
  // This is a simple in-memory cleanup
  if (usedNonces.size > 10000) {
    const toDelete = Array.from(usedNonces).slice(0, 5000);
    toDelete.forEach(nonce => usedNonces.delete(nonce));
  }
}

/**
 * Middleware to attach entrainment status to request
 */
function entrainmentMiddleware(req, res, next) {
  req.getEntrainmentStatus = (sessionId) => {
    const record = entrainmentRecords.get(sessionId);
    if (!record) return null;
    
    const age = Date.now() - record.timestamp;
    const decay = (age / (60 * 1000)) * 0.05;
    
    return {
      ...record,
      currentLevel: Math.max(0, record.entrainmentLevel - decay)
    };
  };
  
  next();
}

module.exports = { router, entrainmentMiddleware };
