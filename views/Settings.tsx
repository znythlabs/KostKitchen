import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { User, Settings as SettingsIcon, Users, ChevronRight, LogOut, Moon, Sun, Monitor, CreditCard, Box } from 'lucide-react';

export const Settings = () => {
    const { logout, data, updateSettings, user } = useApp();
    const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'team' | 'billing'>('account');

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateSettings({ currency: e.target.value });
    };

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // @ts-ignore
        updateSettings({ measurementUnit: e.target.value });
    };

    return (
        <div id="view-settings" className="flex-1 overflow-y-auto no-scrollbar pb-12 animate-fade-in text-[#111111] dark:text-white p-6 lg:p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-light tracking-tight text-[#111111] dark:text-white">Settings</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-72 shrink-0 space-y-6">
                    <div className="soft-card dark:bg-[#1A1A1A] p-2 min-h-[400px]">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('account')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'account' ? 'bg-[#111111] dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                                <User className="w-4 h-4" />
                                Account
                                {activeTab === 'account' && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('preferences')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'preferences' ? 'bg-[#111111] dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                                <SettingsIcon className="w-4 h-4" />
                                Preferences
                                {activeTab === 'preferences' && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('team')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'team' ? 'bg-[#111111] dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                                <Users className="w-4 h-4" />
                                Team
                                {activeTab === 'team' && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('billing')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'billing' ? 'bg-[#111111] dark:bg-white text-white dark:text-black shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                                <CreditCard className="w-4 h-4" />
                                Billing
                                {activeTab === 'billing' && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                            </button>
                        </nav>


                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 space-y-6">


                    {/* Account Tab Content */}
                    {activeTab === 'account' && (
                        <div className="soft-card dark:bg-[#1A1A1A] p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FFD646]/10 to-transparent rounded-bl-full pointer-events-none -mr-16 -mt-16"></div>

                            <div className="flex items-center gap-6 z-10">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD646] to-orange-400 p-[3px] shadow-lg shadow-orange-500/20">
                                        <div className="w-full h-full rounded-full bg-white dark:bg-[#1A1A1A] p-1">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Marco'}`}
                                                className="w-full h-full rounded-full bg-gray-50"
                                                alt="Profile"
                                            />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-[#1A1A1A] dark:bg-white p-1.5 rounded-full shadow-md border-2 border-white dark:border-[#1A1A1A]">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-[#111111] dark:text-white">
                                        {user?.email ? user.email.split('@')[0] : 'Chef User'}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{user?.email || 'user@example.com'}</p>
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#111111]/5 dark:bg-white/10 border border-[#111111]/10 dark:border-white/10">
                                        <Monitor className="w-3 h-3 text-[#111111] dark:text-white" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111] dark:text-white">
                                            Admin Access
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={logout}
                                className="bg-white dark:bg-white/5 border border-red-100 dark:border-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2 z-10"
                            >
                                <LogOut className="w-4 h-4" />
                                Log Out
                            </button>
                        </div>
                    )}

                    {/* Preferences Tab Content */}
                    {activeTab === 'preferences' && (
                        <div className="soft-card dark:bg-[#1A1A1A] p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-[#FFD646]/10 flex items-center justify-center text-[#FFD646]">
                                    <Box className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[#111111] dark:text-white">Regional Preferences</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Customize accurate costing for your location</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Measurement Units */}
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 border-b border-[#E6E2D6] dark:border-white/5 pb-8 border-dashed">
                                    <div className="max-w-md">
                                        <h4 className="font-semibold text-[#111111] dark:text-white">Measurement Units</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                            Choose your preferred system for weights and volumes (e.g., kg/L or lb/oz).
                                            This affects how recipes are calculated.
                                        </p>
                                    </div>
                                    <div className="relative w-48 shrink-0">
                                        <select
                                            value={data.settings.measurementUnit}
                                            onChange={handleUnitChange}
                                            className="w-full appearance-none bg-white dark:bg-white/5 border border-[#E6E2D6] dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFD646] transition-all cursor-pointer"
                                        >
                                            <option value="Metric">Metric (kg, g, L)</option>
                                            <option value="Imperial">Imperial (lb, oz, gal)</option>
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
                                    </div>
                                </div>

                                {/* Currency */}
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                    <div className="max-w-md">
                                        <h4 className="font-semibold text-[#111111] dark:text-white">Active Currency</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                                            Select the currency for all monitoring and reporting.
                                            Updates are applied instantly across the dashboard.
                                        </p>
                                    </div>
                                    <div className="relative w-48 shrink-0">
                                        <select
                                            value={data.settings.currency}
                                            onChange={handleCurrencyChange}
                                            className="w-full appearance-none bg-white dark:bg-white/5 border border-[#E6E2D6] dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FFD646] transition-all cursor-pointer"
                                        >
                                            <option value="PHP">PHP (₱)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="JPY">JPY (¥)</option>
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Team & Billing Placeholders */}
                    {(activeTab === 'team' || activeTab === 'billing') && (
                        <div className="soft-card dark:bg-[#1A1A1A] p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <iconify-icon icon="lucide:construction" width="32" class="text-gray-400"></iconify-icon>
                            </div>
                            <h3 className="text-xl font-bold text-[#111111] dark:text-white mb-2">Coming Soon</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                We are working hard to bring you {activeTab === 'team' ? 'Team Management' : 'Billing & Subscription'} features.
                                Stay tuned for updates!
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
