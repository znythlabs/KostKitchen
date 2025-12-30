import { useApp } from '../AppContext';

export const Settings = () => {
    const { logout } = useApp();
    return (
        <div id="view-settings" className="flex-1 overflow-y-auto no-scrollbar pb-12 animate-fade-in text-[#303030] p-6 lg:p-8 space-y-8">

            <div>
                <h2 className="text-2xl font-light text-[#303030]">Settings</h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-64 shrink-0">
                    <div className="soft-card p-4 min-h-[400px]">
                        <nav className="space-y-1">
                            <button className="w-full text-left px-4 py-3 bg-[#303030] text-white rounded-xl text-sm font-bold shadow-md">Account</button>
                            <button className="w-full text-left px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-medium transition">Preferences</button>
                            <button className="w-full text-left px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-medium transition">Team</button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6">

                    {/* User Profile Card */}
                    <div className="soft-card p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-[#FCD34D]/20 p-1">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marco" className="w-full h-full rounded-full" alt="Profile" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#303030]">Chef Marco</h3>
                                <p className="text-sm text-gray-500">marco@kitchen.com</p>
                                <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#303030]/60 bg-[#303030]/5 px-2 py-1 rounded-md inline-block">Admin Access</div>
                            </div>
                        </div>
                        <button onClick={logout} className="border border-red-200 text-red-500 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-red-50 transition flex items-center gap-2">
                            <iconify-icon icon="lucide:log-out" width="16"></iconify-icon> Log Out
                        </button>
                    </div>

                    {/* Application Preferences */}
                    <div className="soft-card p-8">
                        <h3 className="text-lg font-medium text-[#303030] mb-8">Application Preferences</h3>

                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-[#FCD34D]/10 pb-8 border-dashed">
                                <div>
                                    <h4 className="font-bold text-[#303030]">Measurement Units</h4>
                                    <p className="text-xs text-gray-400 mt-1">Set default units for recipes</p>
                                </div>
                                <div className="relative w-48">
                                    <select className="soft-input appearance-none shadow-sm cursor-pointer">
                                        <option>Metric</option>
                                        <option>Imperial</option>
                                    </select>
                                    <iconify-icon icon="lucide:chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16"></iconify-icon>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <h4 className="font-bold text-[#303030]">Currency</h4>
                                    <p className="text-xs text-gray-400 mt-1">Display currency for costs</p>
                                </div>
                                <div className="relative w-48">
                                    <select className="soft-input appearance-none shadow-sm cursor-pointer">
                                        <option>PHP (₱)</option>
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                    </select>
                                    <iconify-icon icon="lucide:chevron-down" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16"></iconify-icon>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
