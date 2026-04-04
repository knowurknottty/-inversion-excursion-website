import { useEffect, useState } from 'react';
import './ChapterCompletionOverlay.css';

interface Props {
  visible: boolean;
  onDone: () => void;
}

export function ChapterCompletionOverlay({ visible, onDone }: Props) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (visible) {
      setActive(true);
      const timer = setTimeout(() => {
        setActive(false);
        onDone();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onDone]);

  if (!active) return null;

  return (
    <div className="completion-overlay">
      <div className="completion-symbol">◈</div>
    </div>
  );
}
