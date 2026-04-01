/**
 * Unified App Entry Point
 * Detects platform and renders appropriate version
 */

import { usePlatform } from './hooks/usePlatform';
import DesktopApp from './App.desktop';
import MobileApp from './App.mobile';

function App() {
  const platform = usePlatform();
  
  // For now, treat tablet as mobile experience
  // You can customize this behavior as needed
  if (platform === 'desktop') {
    return <DesktopApp />;
  }
  
  return <MobileApp />;
}

export default App;
