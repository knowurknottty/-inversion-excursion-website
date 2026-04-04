/**
 * Unified App Entry Point
 * Detects platform and renders appropriate version
 */

import { usePlatform } from './hooks/usePlatform';
import DesktopApp from './App.desktop';
import MobileApp from './App.mobile';
import { AppErrorBoundary } from './components/AppErrorBoundary';

function App() {
  const platform = usePlatform();

  return (
    <AppErrorBoundary>
      {platform === 'desktop' ? <DesktopApp /> : <MobileApp />}
    </AppErrorBoundary>
  );
}

export default App;
