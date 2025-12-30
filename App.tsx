import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { SoundProvider } from './SoundContext';
import { AuthLayer } from './components/AuthLayer';
import { SoftLayout } from './components/SoftLayout';
import { Modals } from './components/Modals';
import './styles/soft-ui.css'; // Import Soft UI styles
import { TourGuide } from './components/TourGuide';
import { LoadingToast } from './components/LoadingToast';
import { SplashScreen } from './components/SplashScreen';

// Views
import { Dashboard } from './views/Dashboard';
import { Inventory } from './views/Inventory';
import { Recipes } from './views/Recipes';
import { Analytics } from './views/Analytics';
import { Settings } from './views/Settings';
import { LandingPage } from './views/LandingPage';

const MainContent = () => {
  const { isLoggedIn, view, isLoading, authChecked } = useApp();
  const [showLanding, setShowLanding] = useState(true);
  const [minSplashWait, setMinSplashWait] = useState(true);

  useEffect(() => {
    if (isLoggedIn) {
      setMinSplashWait(true);
      const timer = setTimeout(() => setMinSplashWait(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  // Show loading while checking auth - prevents login screen flash
  // Only show login screen AFTER auth check completes and confirms user is not logged in
  if (!authChecked || (isLoading && !isLoggedIn)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F2F2F0]">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#303030] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (showLanding) {
      return <LandingPage onEnterApp={() => setShowLanding(false)} />;
    }
    return <AuthLayer />;
  }

  return (
    <SoftLayout disableScroll={view === 'inventory' || view === 'recipes'}>
      {/* Full-screen loading overlay when fetching data after login */}
      {(isLoading || minSplashWait) && <SplashScreen />}

      {/* View Content */}
      <div className={`animate-enter ${view === 'inventory' || view === 'recipes' ? 'h-full' : 'min-h-full'}`}>
        {view === 'dashboard' && <Dashboard />}
        {view === 'inventory' && <Inventory />}
        {view === 'recipes' && <Recipes />}
        {view === 'analytics' && <Analytics />}
        {view === 'settings' && <Settings />}
      </div>

      <Modals />
      <TourGuide />
    </SoftLayout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <SoundProvider>
        <MainContent />
        <LoadingToast />
      </SoundProvider>
    </AppProvider>
  );
};

export default App;

