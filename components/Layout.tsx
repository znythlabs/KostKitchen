import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { View } from '../types';
import { TourGuide } from './TourGuide';
import { SyncStatusBadge } from '../lib/useSync';

const NavItemDesktop = ({ target, label, icon }: { target: View, label: string, icon: string }) => {
  const { view, setView } = useApp();
  const isActive = view === target;
  return (
    <button
      type="button"
      onClick={() => setView(target)}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all group ${isActive ? 'bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
    >
      <iconify-icon icon={icon} width="18" className={`${isActive ? 'text-[#FCD34D]' : 'text-gray-400 dark:text-gray-500'} group-hover:text-gray-900 dark:group-hover:text-white`}></iconify-icon>
      <span>{label}</span>
    </button>
  );
};

const NavItemMobile = ({ target, label, icon }: { target: View, label: string, icon: string }) => {
  const { view, setView } = useApp();
  const isActive = view === target;
  return (
    <button type="button" onClick={() => setView(target)} className={`flex flex-col items-center justify-center pt-1 active-scale ${isActive ? 'active' : ''}`}>
      <iconify-icon icon={icon} width="22" className={`transition-colors ${isActive ? 'text-[#FCD34D]' : 'text-gray-400 dark:text-gray-500'}`}></iconify-icon>
      <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-[#FCD34D]' : 'text-gray-500 dark:text-gray-500'}`}>{label}</span>
    </button>
  );
};

export const DesktopSidebar = () => {
  const { setView } = useApp();
  return (
    <aside className="hidden lg:flex w-[250px] glass-regular border-l-0 border-y-0 flex-col h-full z-20 relative">
      <div className="h-16 flex items-center px-5">
        <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md mr-3">
          <iconify-icon icon="lucide:chef-hat" width="18"></iconify-icon>
        </div>
        <span className="font-semibold text-lg tracking-tight text-gray-900 dark:text-white">KostKitchen</span>
      </div>
      <div className="flex-1 px-3 py-4 space-y-0.5" id="nav-container">
        <div id="nav-dashboard"><NavItemDesktop target="dashboard" label="Overview" icon="lucide:layout-grid" /></div>
        <div id="nav-recipes"><NavItemDesktop target="recipes" label="Menu" icon="lucide:utensils" /></div>
        <div id="nav-engineering"><NavItemDesktop target="engineering" label="Matrix" icon="lucide:scatter-chart" /></div>
        <div id="nav-inventory"><NavItemDesktop target="inventory" label="Inventory" icon="lucide:package" /></div>
        <div id="nav-finance"><NavItemDesktop target="finance" label="Financials" icon="lucide:pie-chart" /></div>
        <div id="nav-calendar"><NavItemDesktop target="calendar" label="Reports" icon="lucide:calendar" /></div>
      </div>
      <div className="p-3 border-t border-black/5 dark:border-white/10">
        <button type="button" onClick={() => setView('profile')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors group text-gray-500 dark:text-gray-400">
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" className="w-full h-full object-cover" alt="Profile" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Settings</p>
          </div>
        </button>
      </div>
    </aside>
  );
};

export const MobileNav = () => {
  const { view, setView } = useApp();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass-regular border-x-0 border-b-0 z-40 pb-safe-b">
      <div className="grid grid-cols-6 h-[52px]">
        <NavItemMobile target="dashboard" label="Overview" icon="lucide:layout-grid" />
        <NavItemMobile target="recipes" label="Menu" icon="lucide:chef-hat" />
        <NavItemMobile target="engineering" label="Matrix" icon="lucide:scatter-chart" />
        <NavItemMobile target="inventory" label="Inv" icon="lucide:package-open" />
        <NavItemMobile target="finance" label="Finance" icon="lucide:banknote" />
        <NavItemMobile target="calendar" label="Reports" icon="lucide:calendar" />
      </div>
    </nav>
  );
};

export const Header = () => {
  const { view, setView, data, theme, setTheme, startTour } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const lowStockCount = data.ingredients.filter(i => i.stockQty <= i.minStock).length;
  const titleMap: Record<string, string> = {
    dashboard: 'Overview',
    recipes: 'Menu',
    engineering: 'Menu Engineering',
    inventory: 'Inventory',
    finance: 'Financials',
    calendar: 'Reports',
    profile: 'Profile'
  };

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'midnight' | 'oled')[] = ['light', 'dark', 'midnight', 'oled'];
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const themeIcon = {
    light: 'lucide:sun',
    dark: 'lucide:moon',
    midnight: 'lucide:sparkles',
    oled: 'lucide:eye'
  };

  return (
    <header className="sticky top-0 z-30 glass-regular border-x-0 border-t-0 px-4 md:px-8 h-[58px] md:h-16 flex items-center justify-between shrink-0 mb-0">

      {/* LEFT / CENTER: Title */}
      <div className="flex items-center gap-4 md:gap-6 flex-1 overflow-hidden">
        {/* Mobile Profile Avatar (Left aligned or integrated) - User requested move to header */}
        <button
          type="button"
          onClick={() => setView('profile')}
          className="md:hidden w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-transparent active:border-[#FCD34D] transition-colors"
        >
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" className="w-full h-full object-cover" alt="Profile" />
        </button>
        <h1 className="text-[17px] md:text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{titleMap[view] || 'App'}</h1>
      </div>

      {/* RIGHT: Global Actions */}
      <div className="flex items-center gap-3 shrink-0 ml-4 relative">
        <SyncStatusBadge />
        <button
          type="button"
          onClick={startTour}
          className="w-9 h-9 rounded-full bg-[#FCD34D]/10 dark:bg-[#FCD34D]/20 flex items-center justify-center text-[#FCD34D] dark:text-[#FCD34D] active-scale transition-colors"
          title="Start Tour"
        >
          <iconify-icon icon="lucide:help-circle" width="20"></iconify-icon>
        </button>
        <button
          type="button"
          id="header-theme"
          onClick={cycleTheme}
          className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 active-scale transition-colors"
        >
          <iconify-icon icon={themeIcon[theme]} width="18"></iconify-icon>
        </button>
        <button
          type="button"
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 active-scale ${showNotifications ? 'bg-black/10 dark:bg-white/20' : ''}`}
        >
          {lowStockCount > 0 && <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#FF3B30] rounded-full"></div>}
          <iconify-icon icon="lucide:bell" width="18"></iconify-icon>
        </button>

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-[#1C1C1E] rounded-xl shadow-2xl border border-gray-100 dark:border-[#38383A] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
            <div className="p-3 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notifications</span>
              {lowStockCount > 0 && <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-bold">{lowStockCount} New</span>}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {lowStockCount > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {data.ingredients.filter(i => i.stockQty <= i.minStock).slice(0, 5).map(i => (
                    <div key={i.id} className="p-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { setView('inventory'); setShowNotifications(false); }}>
                      <div className="flex items-start gap-2">
                        <iconify-icon icon="lucide:alert-triangle" className="text-red-500 mt-0.5" width="14"></iconify-icon>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{i.name}</p>
                          <p className="text-xs text-red-500 mt-0.5">Low stock: {i.stockQty} {i.unit}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {lowStockCount > 5 && <div className="p-2 text-center text-xs text-gray-400">And {lowStockCount - 5} more...</div>}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <iconify-icon icon="lucide:check-circle" className="text-green-500 mx-auto mb-2" width="24"></iconify-icon>
                  <p className="text-sm text-gray-500">All caught up!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};