import React, { useState, useCallback } from 'react';
import { 
  generateVictoryCast, 
  generateDefeatCast, 
  generateInviteCast,
  generateHighScoreCast,
  shareToCast,
  getCastPreview,
  type CastTemplate 
} from './cast-templates';
import { useFrame, getFrameUser } from './frame-sdk';

// ============================================================================
// SHARE FLOW COMPONENTS
// ============================================================================

interface ShareFlowProps {
  gameResult: 'victory' | 'defeat' | 'highscore' | 'challenge';
  score: number;
  metadata?: {
    floor?: number;
    cause?: 'timeout' | 'trap' | 'enemy' | 'wall';
    previousBest?: number;
    rank?: number;
    challengeName?: string;
  };
  onClose?: () => void;
}

/**
 * Main Share Flow Component
 * Handles the full UX for sharing to Farcaster
 */
export const ShareFlow: React.FC<ShareFlowProps> = ({
  gameResult,
  score,
  metadata = {},
  onClose,
}) => {
  const { isInFrame, openUrl } = useFrame();
  const [step, setStep] = useState<'preview' | 'customize' | 'success'>('preview');
  const [customText, setCustomText] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  
  const user = getFrameUser();
  const playerName = user?.username || user?.displayName || 'Anonymous';
  
  // Generate the appropriate cast template
  const getTemplate = useCallback((): CastTemplate => {
    switch (gameResult) {
      case 'victory':
        return generateVictoryCast(playerName, score, metadata.rank);
      case 'defeat':
        return generateDefeatCast(
          playerName, 
          score, 
          metadata.cause || 'trap', 
          metadata.floor || 1
        );
      case 'highscore':
        return generateHighScoreCast(
          playerName,
          score,
          metadata.previousBest || 0,
          metadata.rank || 999
        );
      case 'challenge':
        return generateDailyChallengeCast(
          playerName,
          metadata.challengeName || "Today's Trial",
          true,
          score
        );
      default:
        return generateVictoryCast(playerName, score);
    }
  }, [gameResult, score, metadata, playerName]);
  
  const template = getTemplate();
  const preview = getCastPreview({
    ...template,
    text: customText || template.text,
  });
  
  const handleShare = async () => {
    setIsSharing(true);
    
    const finalTemplate: CastTemplate = {
      ...template,
      text: customText || template.text,
    };
    
    try {
      await shareToCast(finalTemplate);
      setStep('success');
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to manual URL
      const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(finalTemplate.text)}&embeds[]=${encodeURIComponent(finalTemplate.embeds?.[0] || '')}`;
      await openUrl(shareUrl);
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleCopy = async () => {
    const textToCopy = customText || template.text;
    await navigator.clipboard.writeText(textToCopy);
    // Show toast or feedback
  };

  // Render different steps
  if (step === 'preview') {
    return (
      <SharePreview
        preview={preview}
        gameResult={gameResult}
        score={score}
        onCustomize={() => setStep('customize')}
        onShare={handleShare}
        onClose={onClose}
        isInFrame={isInFrame}
      />
    );
  }
  
  if (step === 'customize') {
    return (
      <ShareCustomize
        template={template}
        customText={customText}
        onTextChange={setCustomText}
        onBack={() => setStep('preview')}
        onShare={handleShare}
        isSharing={isSharing}
        preview={preview}
      />
    );
  }
  
  return (
    <ShareSuccess
      onClose={onClose}
      onPlayAgain={() => {
        // Reset and close
        onClose?.();
      }}
    />
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface SharePreviewProps {
  preview: ReturnType<typeof getCastPreview>;
  gameResult: string;
  score: number;
  onCustomize: () => void;
  onShare: () => void;
  onClose?: () => void;
  isInFrame: boolean;
}

const SharePreview: React.FC<SharePreviewProps> = ({
  preview,
  gameResult,
  score,
  onCustomize,
  onShare,
  onClose,
  isInFrame,
}) => {
  const resultEmoji = {
    victory: '🏆',
    defeat: '💀',
    highscore: '🎯',
    challenge: '⚔️',
  }[gameResult] || '🎮';
  
  return (
    <div className="share-flow-container">
      <div className="share-header">
        <span className="result-emoji">{resultEmoji}</span>
        <h2>{gameResult === 'victory' ? 'Victory!' : gameResult === 'defeat' ? 'Game Over' : 'Share Result'}</h2>
        <p className="score-display">Score: {score.toLocaleString()}</p>
      </div>
      
      <div className="cast-preview">
        <div className="cast-frame">
          <div className="cast-text">{preview.text}</div>
          {preview.embedUrl && (
            <div className="cast-embed">
              <div className="embed-card">
                <img 
                  src={preview.previewImage} 
                  alt="Cell Game" 
                  className="embed-image"
                />
                <div className="embed-info">
                  <span className="embed-title">Enter the Cell</span>
                  <span className="embed-url">cell-game.xyz</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="character-count">
          {preview.characterCount}/320 characters
          {!preview.isValid && <span className="error">Too long!</span>}
        </div>
      </div>
      
      <div className="share-actions">
        <button className="btn-secondary" onClick={onCustomize}>
          ✏️ Customize
        </button>
        <button 
          className="btn-primary" 
          onClick={onShare}
          disabled={!preview.isValid}
        >
          {isInFrame ? '📤 Share to Warpcast' : '📋 Copy to Clipboard'}
        </button>
        {onClose && (
          <button className="btn-ghost" onClick={onClose}>
            Skip
          </button>
        )}
      </div>
      
      <style>{`
        .share-flow-container {
          background: #0a0a0f;
          border: 1px solid #1a1a2e;
          border-radius: 16px;
          padding: 24px;
          max-width: 400px;
          margin: 0 auto;
          color: #fff;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .share-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .result-emoji {
          font-size: 48px;
          display: block;
          margin-bottom: 8px;
        }
        .share-header h2 {
          margin: 0 0 8px;
          font-size: 24px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .score-display {
          color: #00ff88;
          font-size: 18px;
          font-weight: bold;
          margin: 0;
        }
        .cast-preview {
          background: #111118;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 20px;
        }
        .cast-frame {
          border: 1px solid #2a2a3e;
          border-radius: 8px;
          padding: 12px;
        }
        .cast-text {
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 12px;
          white-space: pre-wrap;
        }
        .embed-card {
          border: 1px solid #333;
          border-radius: 8px;
          overflow: hidden;
        }
        .embed-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
          background: #1a1a2e;
        }
        .embed-info {
          padding: 8px 12px;
          background: #16161d;
        }
        .embed-title {
          display: block;
          font-weight: 600;
          font-size: 13px;
        }
        .embed-url {
          display: block;
          font-size: 12px;
          color: #666;
        }
        .character-count {
          text-align: right;
          font-size: 12px;
          color: #666;
          margin-top: 8px;
        }
        .character-count .error {
          color: #ff4444;
          margin-left: 8px;
        }
        .share-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .btn-primary, .btn-secondary, .btn-ghost {
          padding: 14px 20px;
          border-radius: 10px;
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #8b5cf6;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background: #7c3aed;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: #1a1a2e;
          color: #fff;
          border: 1px solid #333;
        }
        .btn-secondary:hover {
          background: #252538;
        }
        .btn-ghost {
          background: transparent;
          color: #666;
        }
        .btn-ghost:hover {
          color: #999;
        }
      `}</style>
    </div>
  );
};

interface ShareCustomizeProps {
  template: CastTemplate;
  customText: string;
  onTextChange: (text: string) => void;
  onBack: () => void;
  onShare: () => void;
  isSharing: boolean;
  preview: ReturnType<typeof getCastPreview>;
}

const ShareCustomize: React.FC<ShareCustomizeProps> = ({
  template,
  customText,
  onTextChange,
  onBack,
  onShare,
  isSharing,
  preview,
}) => {
  const quickReactions = ['🔥', '💀', '🎯', '🏆', '🧠', '⚡', '🎮', '💪'];
  
  return (
    <div className="share-flow-container">
      <div className="customize-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2>Customize Cast</h2>
      </div>
      
      <textarea
        className="cast-textarea"
        value={customText || template.text}
        onChange={(e) => onTextChange(e.target.value)}
        maxLength={320}
        rows={6}
        placeholder="Write your victory message..."
      />
      
      <div className="quick-reactions">
        {quickReactions.map(emoji => (
          <button 
            key={emoji} 
            className="reaction-btn"
            onClick={() => onTextChange((customText || template.text) + emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
      
      <div className="character-count">
        {preview.characterCount}/320
      </div>
      
      <button 
        className="btn-primary" 
        onClick={onShare}
        disabled={isSharing || !preview.isValid}
      >
        {isSharing ? 'Opening Warpcast...' : 'Share Cast'}
      </button>
      
      <style>{`
        .customize-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .back-btn {
          background: none;
          border: none;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
        }
        .customize-header h2 {
          margin: 0;
          font-size: 18px;
        }
        .cast-textarea {
          width: 100%;
          background: #111118;
          border: 1px solid #2a2a3e;
          border-radius: 10px;
          padding: 12px;
          color: #fff;
          font-size: 14px;
          resize: vertical;
          margin-bottom: 12px;
          box-sizing: border-box;
        }
        .cast-textarea:focus {
          outline: none;
          border-color: #8b5cf6;
        }
        .quick-reactions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .reaction-btn {
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .reaction-btn:hover {
          background: #252538;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

interface ShareSuccessProps {
  onClose?: () => void;
  onPlayAgain: () => void;
}

const ShareSuccess: React.FC<ShareSuccessProps> = ({ onClose, onPlayAgain }) => (
  <div className="share-flow-container">
    <div className="success-state">
      <span className="success-emoji">✅</span>
      <h2>Shared!</h2>
      <p>Your result is now on Warpcast</p>
      <div className="success-actions">
        <button className="btn-primary" onClick={onPlayAgain}>
          Play Again
        </button>
        {onClose && (
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        )}
      </div>
    </div>
    
    <style>{`
      .success-state {
        text-align: center;
        padding: 20px 0;
      }
      .success-emoji {
        font-size: 56px;
        display: block;
        margin-bottom: 16px;
      }
      .success-state h2 {
        margin: 0 0 8px;
        color: #00ff88;
      }
      .success-state p {
        color: #666;
        margin: 0 0 24px;
      }
      .success-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    `}</style>
  </div>
);

// ============================================================================
// INVITE FLOW
// ============================================================================

interface InviteFlowProps {
  inviteCode: string;
  onClose?: () => void;
}

export const InviteFlow: React.FC<InviteFlowProps> = ({ inviteCode, onClose }) => {
  const { isInFrame } = useFrame();
  const [message, setMessage] = useState('');
  const user = getFrameUser();
  const playerName = user?.username || user?.displayName || 'Anonymous';
  
  const handleShare = async () => {
    const template = generateInviteCast(playerName, inviteCode, message);
    await shareToCast(template);
  };
  
  return (
    <div className="share-flow-container">
      <div className="invite-header">
        <span className="invite-emoji">🧬</span>
        <h2>Invite to Cell</h2>
        <p>Call others to join you</p>
      </div>
      
      <div className="invite-code-display">
        <code>{inviteCode}</code>
        <button 
          className="copy-code-btn"
          onClick={() => navigator.clipboard.writeText(inviteCode)}
        >
          Copy
        </button>
      </div>
      
      <textarea
        className="invite-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add a personal message (optional)..."
        maxLength={100}
        rows={2}
      />
      
      <button className="btn-primary" onClick={handleShare}>
        {isInFrame ? '📤 Share Invite' : '📋 Copy Invite'}
      </button>
      
      {onClose && (
        <button className="btn-ghost" onClick={onClose}>
          Maybe Later
        </button>
      )}
      
      <style>{`
        .invite-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .invite-emoji {
          font-size: 40px;
          display: block;
          margin-bottom: 8px;
        }
        .invite-header h2 {
          margin: 0 0 4px;
        }
        .invite-header p {
          color: #666;
          margin: 0;
        }
        .invite-code-display {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }
        .invite-code-display code {
          flex: 1;
          background: #111118;
          padding: 12px 16px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 18px;
          letter-spacing: 2px;
          text-align: center;
          border: 1px solid #2a2a3e;
        }
        .copy-code-btn {
          background: #1a1a2e;
          border: 1px solid #333;
          color: #fff;
          padding: 0 16px;
          border-radius: 8px;
          cursor: pointer;
        }
        .invite-message {
          width: 100%;
          background: #111118;
          border: 1px solid #2a2a3e;
          border-radius: 10px;
          padding: 12px;
          color: #fff;
          font-size: 14px;
          resize: none;
          margin-bottom: 16px;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default ShareFlow;
