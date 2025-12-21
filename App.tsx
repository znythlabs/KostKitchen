import React from 'react';
import { AppProvider, useApp } from './AppContext';
import { AuthLayer } from './components/AuthLayer';
import { MobileNav, DesktopSidebar, Header } from './components/Layout';
import { Modals } from './components/Modals';

// Views
import { Dashboard } from './views/Dashboard';
import { Inventory } from './views/Inventory';
import { Recipes } from './views/Recipes';
import { Finance } from './views/Finance';
import { Calendar } from './views/Calendar';
import { Profile } from './views/Profile';
import { MenuEngineering } from './views/MenuEngineering';

const MainContent = () => {
  const { isLoggedIn, view } = useApp();

  if (!isLoggedIn) {
    return <AuthLayer />;
  }

  return (
    <div id="app-wrapper" className="flex w-full h-full opacity-100 transition-opacity duration-500">
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
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
