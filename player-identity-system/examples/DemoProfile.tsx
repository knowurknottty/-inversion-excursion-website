import React, { useState, useEffect } from 'react';
import { PlayerIdentityCard, PlayerIdentityData } from '../components/PlayerIdentityCard';
import { LearningTrajectoryChart, TrajectoryPoint, TrajectoryMilestone, MethodologyBalance } from '../components/LearningTrajectory';
import { CorrectionCelebration, CorrectionEvent, Badge, CorrectionChronicle, EpistemicStrengthCard } from '../components/CorrectionCelebration';
import { getPlayerIdentityTracker, DocumentType } from '../tracking/PlayerIdentityTracker';
import { subDays } from 'date-fns';

// Demo data generator
function generateDemoData(): {
  player: PlayerIdentityData;
  trajectory: TrajectoryPoint[];
  milestones: TrajectoryMilestone[];
  methodologyBalance: MethodologyBalance[];
  corrections: CorrectionEvent[];
} {
  const tracker = getPlayerIdentityTracker();
  const playerId = 'demo_player_001';
  
  // Simulate player activity
  const documentTypes: DocumentType[] = [
    'FOIA_documents',
    'FOIA_documents',
    'FOIA_documents',
    'financial_records',
    'financial_records',
    'legal_filings',
    'corporate_registries',
    'FOIA_documents',
    'FOIA_documents',
    'financial_records',
    'FOIA_documents',
    'FOIA_documents',
    'financial_records',
    'FOIA_documents',
    'cryptocurrency_transactions'
  ];
  
  // Record documents
  documentTypes.forEach((type, i) => {
    setTimeout(() => {
      tracker.recordDocument(playerId, type);
    }, i * 10);
  });
  
  // Record submissions (mix of correct and incorrect)
  const submissions = [true, true, false, true, true, true, false, true, true, true, true, false, true, true, true, true, true, false, true, true];
  submissions.forEach((correct, i) => {
    setTimeout(() => {
      tracker.recordSubmission(playerId, correct);
    }, i * 10);
  });
  
  // Record corrections
  const corrections: CorrectionEvent[] = [
    {
      id: 'corr_1',
      playerId,
      originalClaim: {
        text: "Company founded in 2015 by John Smith",
        confidence: 75,
        submittedAt: subDays(new Date(), 45)
      },
      correctedClaim: { text: "Company founded in 2013 by Jane Smith" },
      timeToCorrection: 36,
      selfInitiated: true,
      createdAt: subDays(new Date(), 43)
    },
    {
      id: 'corr_2',
      playerId,
      originalClaim: {
        text: "Subsidiary operates in 5 countries",
        confidence: 80,
        submittedAt: subDays(new Date(), 38)
      },
      correctedClaim: { text: "Subsidiary operates in 8 countries" },
      timeToCorrection: 12,
      selfInitiated: false,
      createdAt: subDays(new Date(), 37)
    },
    {
      id: 'corr_3',
      playerId,
      originalClaim: {
        text: "Revenue of $50M in 2023",
        confidence: 70,
        submittedAt: subDays(new Date(), 25)
      },
      correctedClaim: { text: "Revenue of $65M in 2023" },
      timeToCorrection: 8,
      selfInitiated: true,
      createdAt: subDays(new Date(), 24)
    },
    {
      id: 'corr_4',
      playerId,
      originalClaim: {
        text: "CEO holds 30% stake",
        confidence: 85,
        submittedAt: subDays(new Date(), 15)
      },
      correctedClaim: { text: "CEO holds 22% stake through holding company" },
      timeToCorrection: 48,
      selfInitiated: true,
      createdAt: subDays(new Date(), 13)
    },
    {
      id: 'corr_5',
      playerId,
      originalClaim: {
        text: "Primary operations in Delaware",
        confidence: 90,
        submittedAt: subDays(new Date(), 5)
      },
      correctedClaim: { text: "Primary operations in Wyoming, registered in Delaware" },
      timeToCorrection: 4,
      selfInitiated: true,
      createdAt: subDays(new Date(), 5)
    }
  ];
  
  corrections.forEach(c => {
    tracker.recordCorrection(
      playerId,
      c.originalClaim,
      c.correctedClaim,
      c.selfInitiated
    );
  });
  
  // Get final identity
  const identity = tracker.getIdentity(playerId);
  const badges = tracker.getBadges(playerId);
  
  // Create player data
  const player: PlayerIdentityData = {
    id: identity.playerId,
    playerId: identity.playerId,
    displayName: "FOIA_Warrior_42",
    primarySpecialization: identity.primarySpecialization,
    secondarySpecializations: identity.secondarySpecializations,
    contributions: identity.contributions,
    epistemicStats: {
      ...identity.epistemicStats,
      timesChangedMind: 5,
      timesEvidenceDemandedChange: 6
    },
    badges,
    joinedAt: subDays(new Date(), 90)
  };
  
  // Generate trajectory data
  const trajectory: TrajectoryPoint[] = Array.from({ length: 30 }, (_, i) => {
    const day = subDays(new Date(), 29 - i);
    const progress = i / 29;
    return {
      date: day,
      expertiseScore: Math.round(200 + (progress * 400) + (Math.random() * 50)),
      accuracyRate: Math.min(95, 70 + (progress * 20) + (Math.random() * 5)),
      documentsContributed: Math.round(progress * 16),
      correctionRate: 0.6 + (progress * 0.25),
      methodologyDiversity: Math.round(2 + (progress * 3)),
      confidenceCalibration: Math.min(95, 60 + (progress * 30))
    };
  });
  
  // Milestones
  const milestones: TrajectoryMilestone[] = [
    {
      date: subDays(new Date(), 28),
      type: 'specialization_unlocked',
      description: 'First FOIA document discovered',
      value: 1
    },
    {
      date: subDays(new Date(), 20),
      type: 'badge_earned',
      description: 'Earned FOIA Seeker badge',
      value: 1
    },
    {
      date: subDays(new Date(), 15),
      type: 'correction_made',
      description: 'First self-initiated correction',
      value: 1
    },
    {
      date: subDays(new Date(), 10),
      type: 'accuracy_threshold',
      description: 'Reached 90% accuracy',
      value: 90
    },
    {
      date: subDays(new Date(), 5),
      type: 'badge_earned',
      description: 'Earned Course Corrector badge',
      value: 1
    }
  ];
  
  // Methodology balance
  const methodologyBalance: MethodologyBalance[] = [
    { methodology: 'pattern_recognition', currentScore: 75, previousScore: 60 },
    { methodology: 'network_analysis', currentScore: 45, previousScore: 30 },
    { methodology: 'financial_forensics', currentScore: 80, previousScore: 50 },
    { methodology: 'cross_reference_validation', currentScore: 65, previousScore: 55 },
    { methodology: 'document_authentication', currentScore: 55, previousScore: 40 },
    { methodology: 'source_triangulation', currentScore: 40, previousScore: 25 }
  ];
  
  return {
    player,
    trajectory,
    milestones,
    methodologyBalance,
    corrections
  };
}

// Demo Profile Page
export const DemoProfilePage: React.FC = () => {
  const [data, setData] = useState<ReturnType<typeof generateDemoData> | null>(null);
  const [activeCelebration, setActiveCelebration] = useState<{
    event: CorrectionEvent;
    newBadges: Badge[];
    totalCorrections: number;
    rankPercentile: number;
  } | null>(null);
  
  useEffect(() => {
    // Generate demo data
    const demoData = generateDemoData();
    setData(demoData);
    
    // Listen for corrections
    const tracker = getPlayerIdentityTracker();
    tracker.on('correction:celebrated', (event) => {
      const stats = tracker.getCorrectionStats('demo_player_001');
      setActiveCelebration({
        event,
        newBadges: [], // Would be populated from badge check
        totalCorrections: stats.totalCorrections,
        rankPercentile: stats.percentile
      });
    });
    
    // Simulate a correction celebration after 2 seconds
    const timer = setTimeout(() => {
      setActiveCelebration({
        event: {
          id: 'demo_celebration',
          playerId: 'demo_player_001',
          originalClaim: {
            text: "Demo claim for celebration",
            confidence: 70,
            submittedAt: subDays(new Date(), 1)
          },
          correctedClaim: { text: "Corrected demo claim" },
          timeToCorrection: 6,
          selfInitiated: true,
          createdAt: new Date()
        },
        newBadges: [
          {
            id: 'humble_investigator',
            name: 'Humble Investigator',
            description: 'Changed your mind 5 times when evidence demanded it',
            tier: 'silver',
            icon: '⚖️',
            unlockedAt: new Date(),
            criteria: { type: 'corrections_celebrated', count: 5 },
            flavorText: 'The mark of a true seeker of truth.'
          }
        ],
        totalCorrections: 5,
        rankPercentile: 75
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!data) return <div>Loading...</div>;
  
  const tracker = getPlayerIdentityTracker();
  const correctionStats = tracker.getCorrectionStats('demo_player_001');
  
  return (
    <div className="demo-profile-page" style={{ 
      background: '#0a0a0f', 
      minHeight: '100vh', 
      padding: '40px',
      color: '#e8e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '32px', 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Player Identity System Demo
        </h1>
        
        {/* Hero Identity Card */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#8888a0' }}>Hero Variant</h2>
          <PlayerIdentityCard 
            player={data.player} 
            variant="hero"
            showBadges={true}
            showCorrections={true}
          />
        </section>
        
        {/* Compact Cards */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#8888a0' }}>Compact Variant (for lists)</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <PlayerIdentityCard player={data.player} variant="compact" />
            <PlayerIdentityCard 
              player={{
                ...data.player,
                displayName: "CryptoHunter",
                primarySpecialization: { type: 'cryptocurrency_transactions', level: 'specialist', percentageOfWork: 60 }
              }} 
              variant="compact" 
            />
          </div>
        </section>
        
        {/* Learning Trajectory */}
        <section style={{ marginBottom: '40px' }}>
          <LearningTrajectoryChart
            data={data.trajectory}
            milestones={data.milestones}
            methodologyBalance={data.methodologyBalance}
            playerName={data.player.displayName}
          />
        </section>
        
        {/* Epistemic Strength & Correction Chronicle */}
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '24px',
          marginBottom: '40px'
        }}
003e
          <EpistemicStrengthCard
            timesChangedMind={correctionStats.timesChangedMind || 5}
            timesEvidenceDemandedChange={correctionStats.timesEvidenceDemandedChange || 6}
            avgTimeToCorrection={correctionStats.avgTimeToCorrection || 12}
            selfInitiatedRate={correctionStats.selfInitiatedRate || 80}
          />
          
          <CorrectionChronicle
            corrections={data.corrections}
            framing="celebratory"
            maxItems={5}
          />
        </section>
        
        {/* Full Identity Card */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#8888a0' }}>Full Variant</h2>
          <PlayerIdentityCard player={data.player} variant="full" />
        </section>
        
        {/* Correction Celebration Modal */}
        {activeCelebration && (
          <CorrectionCelebration
            event={activeCelebration.event}
            newBadges={activeCelebration.newBadges}
            totalCorrections={activeCelebration.totalCorrections}
            rankPercentile={activeCelebration.rankPercentile}
            autoClose={false}
            onComplete={() => setActiveCelebration(null)}
          />
        )}
        
      </div>
    </div>
  );
};

// Export demo
export default DemoProfilePage;
