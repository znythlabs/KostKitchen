import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { SoundProvider } from './SoundContext';
import { AuthLayer } from './components/AuthLayer';
import { MobileNav, DesktopSidebar, Header } from './components/Layout';
import { Modals } from './components/Modals';
import { TourGuide } from './components/TourGuide';
import { LoadingToast } from './components/LoadingToast';

// Views
import { Dashboard } from './views/Dashboard';
import { Inventory } from './views/Inventory';
import { Recipes } from './views/Recipes';
import { Finance } from './views/Finance';
import { Calendar } from './views/Calendar';
import { Profile } from './views/Profile';
import { MenuEngineering } from './views/MenuEngineering';
import { LandingPage } from './views/LandingPage';

const MainContent = () => {
  const { isLoggedIn, view, isLoading, authChecked } = useApp();
  const [showLanding, setShowLanding] = useState(true);

  // Show loading while checking auth - prevents login screen flash
  // Only show login screen AFTER auth check completes and confirms user is not logged in
  if (!authChecked || (isLoading && !isLoggedIn)) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F2F2F7] dark:bg-black">
        <div className="w-8 h-8 border-3 border-gray-200 dark:border-white/20 border-t-[#007AFF] rounded-full animate-spin"></div>
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
    <div id="app-wrapper" className="flex w-full h-full relative">
      {/* Full-screen loading overlay when fetching data after login */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-gray-200 dark:border-white/20 border-t-[#007AFF] rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading your data...</p>
          <p className="text-xs text-gray-400 mt-1">This may take a moment on first load</p>
        </div>
      )}
      <MobileNav />
      <DesktopSidebar />
      <main className="flex-1 h-full overflow-y-auto relative bg-[#F2F2F7] dark:bg-black scroll-smooth transition-colors duration-300" id="main-scroll">
        <Header />
        <div className="pb-[100px] md:pb-10 pt-4 md:pt-6 px-4 md:px-8 max-w-5xl mx-auto min-h-full">
          {view === 'dashboard' && <Dashboard />}
          {view === 'inventory' && <Inventory />}
          {view === 'recipes' && <Recipes />}
          {view === 'finance' && <Finance />}
          {view === 'calendar' && <Calendar />}
          {view === 'engineering' && <MenuEngineering />}
          {view === 'profile' && <Profile />}
        </div>
      </main>
      <Modals />
      <TourGuide />
    </div>
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

