import './SacredBackground.css';

interface SacredBackgroundProps {
  chapterId: number;
}

export function SacredBackground({ chapterId }: SacredBackgroundProps) {
  // CSS-based sacred geometry patterns as fallback
  const getGradient = (id: number) => {
    const gradients: Record<number, string> = {
      1: 'radial-gradient(ellipse at 30% 20%, rgba(212, 175, 55, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(107, 78, 113, 0.06) 0%, transparent 50%)',
      2: 'radial-gradient(ellipse at 50% 50%, rgba(192, 192, 192, 0.05) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(74, 85, 104, 0.06) 0%, transparent 40%)',
      3: 'radial-gradient(ellipse at 50% 50%, rgba(45, 27, 78, 0.2) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(0, 0, 0, 0.3) 0%, transparent 50%)',
      4: 'radial-gradient(ellipse at 40% 60%, rgba(43, 108, 176, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 60% 30%, rgba(99, 179, 237, 0.05) 0%, transparent 40%)',
      5: 'radial-gradient(ellipse at 50% 30%, rgba(246, 224, 94, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(214, 158, 46, 0.06) 0%, transparent 40%)',
      6: 'radial-gradient(ellipse at 50% 50%, rgba(72, 187, 120, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 30%, rgba(154, 230, 180, 0.05) 0%, transparent 40%)',
      7: 'radial-gradient(ellipse at 50% 50%, rgba(159, 122, 234, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(233, 216, 253, 0.06) 0%, transparent 40%)',
    };
    return gradients[id] || gradients[1];
  };

  return (
    <div 
      className="sacred-background"
      style={{ background: getGradient(chapterId) }}
      aria-hidden="true"
    >
      {/* Flower of Life pattern overlay */}
      <svg className="flower-of-life" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="flowerPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1"/>
            <circle cx="20" cy="5" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1"/>
            <circle cx="33" cy="12" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1"/>
            <circle cx="33" cy="28" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1"/>
            <circle cx="20" cy="35" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1"/>
            <circle cx="7" cy="28" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1"/>
            <circle cx="7" cy="12" r="15" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#flowerPattern)"/>
      </svg>
      
      {/* Animated gradient orbs */}
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />
      <div className="gradient-orb orb-3" />
    </div>
  );
}