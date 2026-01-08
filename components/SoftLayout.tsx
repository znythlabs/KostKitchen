import React, { ReactNode } from 'react';
import { useApp } from '../AppContext';
import { View } from '../types';

interface SoftLayoutProps {
    children: ReactNode;
    headerAction?: ReactNode;
    disableScroll?: boolean;
}

export const SoftLayout = ({ children, headerAction, disableScroll = false }: SoftLayoutProps) => {
    const { view, setView, theme, setTheme } = useApp();

    // Mapping internal view names to display titles/subtitles
    const titles: Record<string, string> = {
        dashboard: 'Overview',
        recipes: 'Menu Engineering',
        inventory: 'Inventory',
        analytics: 'Performance',
        settings: 'Settings & Tools',
    };

    const subtitles: Record<string, string> = {
        dashboard: "Here's what's happening in your kitchen today.",
        recipes: 'Optimize your dish pricing and margins.',
        inventory: 'Real-time stock levels and supplier tracking.',
        analytics: 'Deep dive into your financial metrics.',
        settings: 'Configure your kitchen parameters.',
    };

    const NavItem = ({ target, label, icon }: { target: View, label: string, icon: string }) => {
        const isActive = view === target;
        return (
            <button
                type="button"
                onClick={() => setView(target)}
                className={`nav-item ${isActive ? 'active' : ''} group`}
            >
                <iconify-icon icon={icon} width="20"></iconify-icon>
                <span className="font-medium text-sm">{label}</span>
            </button>
        );
    };

    return (
        <div className="flex h-full w-full text-[#303030] dark:text-[#E7E5E4] overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col gap-4 h-full w-[280px] p-4 pr-0">
                {/* Brand Card */}
                <div className="soft-card p-6 flex items-center gap-4 shrink-0 dark:bg-white/5 dark:border-white/10">
                    <div className="w-12 h-12 bg-[#303030] text-white rounded-[1rem] flex items-center justify-center shadow-lg shadow-gray-300 dark:shadow-none dark:bg-[#FCD34D] dark:text-[#1F1C15]">
                        <span className="font-bold text-xl">K</span>
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm text-[#303030] dark:text-[#E7E5E4]">KostKitchen</h2>
                    </div>
                </div>

                {/* POS Button - Sidebar Location */}
                <button
                    onClick={() => setView('pos')}
                    className="w-full bg-gradient-to-br from-[#FCD34D] to-[#FBBF24] hover:to-[#F59E0B] p-4 rounded-[1.25rem] shadow-lg shadow-yellow-500/20 flex flex-col items-center justify-center gap-2 transition-all group active:scale-[0.98] relative overflow-hidden"
                >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>

                    <div className="flex items-center gap-2 relative z-10">
                        <div className="w-8 h-8 rounded-full bg-[#202020] text-[#FCD34D] flex items-center justify-center">
                            <iconify-icon icon="lucide:store" width="16"></iconify-icon></div>
                            <span className="text-lg font-black text-[#202020] tracking-tight">OPEN POS</span>
                            <iconify-icon icon="lucide:arrow-right" class="group-hover:translate-x-1 transition-transform text-[#202020]"></iconify-icon>
                        
                    </div>
                </button>

                {/* Navigation Card */}
                <nav className="flex-1 soft-card p-4 space-y-2 overflow-y-auto no-scrollbar dark:bg-white/5 dark:border-white/10">
                    <NavItem target="dashboard" label="Dashboard" icon="lucide:layout-grid" />
                    <NavItem target="recipes" label="Menu Costs" icon="lucide:utensils" />
                    <NavItem target="inventory" label="Inventory" icon="lucide:package" />
                    <NavItem target="analytics" label="Analytics" icon="lucide:bar-chart-2" />

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/10">
                        <p className="px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System</p>
                        <NavItem target="settings" label="Settings" icon="lucide:settings" />
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative p-4 lg:p-6 pb-0">

                {/* Header */}
                <header className="flex justify-between items-center py-2 px-2 shrink-0 mb-4">
                    <div>
                        <h1 className="text-4xl font-light tracking-tight text-[#303030] dark:text-[#E7E5E4]">Welcome in, <span className="font-normal">Marco</span></h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                        >
                            <iconify-icon icon={theme === 'dark' ? "lucide:sun" : "lucide:moon"} width="20" className="text-gray-500 dark:text-gray-300"></iconify-icon>
                        </button>
                        <button className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10">
                            <iconify-icon icon="lucide:bell" width="20" className="text-gray-500 dark:text-gray-300"></iconify-icon>
                        </button>
                        <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden dark:border-white/10">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marco" className="w-full h-full object-cover" alt="User" />
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className={`flex-1 relative ${disableScroll ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar pb-10'}`}>
                    {children}
                </div>

                {/* Mobile Nav (Bottom Default) - kept for smaller screens if sidebar is hidden */}
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 z-50 pb-safe-b dark:bg-[#1F1C15]/90 dark:border-white/10">
                    <div className="grid grid-cols-5 h-[60px] items-center">
                        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center justify-center ${view === 'dashboard' ? 'text-[#303030] dark:text-[#E7E5E4]' : 'text-gray-400'}`}>
                            <iconify-icon icon="lucide:layout-grid" width="24"></iconify-icon>
                        </button>
                        <button onClick={() => setView('recipes')} className={`flex flex-col items-center justify-center ${view === 'recipes' ? 'text-[#303030] dark:text-[#E7E5E4]' : 'text-gray-400'}`}>
                            <iconify-icon icon="lucide:utensils" width="24"></iconify-icon>
                        </button>
                        <button onClick={() => setView('inventory')} className={`flex flex-col items-center justify-center ${view === 'inventory' ? 'text-[#303030] dark:text-[#E7E5E4]' : 'text-gray-400'}`}>
                            <iconify-icon icon="lucide:package" width="24"></iconify-icon>
                        </button>
                        <button onClick={() => setView('analytics')} className={`flex flex-col items-center justify-center ${view === 'analytics' ? 'text-[#303030] dark:text-[#E7E5E4]' : 'text-gray-400'}`}>
                            <iconify-icon icon="lucide:bar-chart-2" width="24"></iconify-icon>
                        </button>

                        <button onClick={() => setView('settings')} className={`flex flex-col items-center justify-center ${view === 'settings' ? 'text-[#303030] dark:text-[#E7E5E4]' : 'text-gray-400'}`}>
                            <iconify-icon icon="lucide:settings" width="24"></iconify-icon>
                        </button>
                    </div>
                </nav>

            </main>
        </div>
    );
};
