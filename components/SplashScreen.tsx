import React, { useEffect, useState } from 'react';

export const SplashScreen = () => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger entry animation
        setAnimate(true);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-[#E3E5E6] dark:bg-[#1F1C15] flex flex-col items-center justify-center transition-opacity duration-500">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#FCD34D] rounded-full mix-blend-multiply filter blur-[200px] opacity-10 animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-white rounded-full mix-blend-overlay filter blur-[150px] opacity-20"></div>
            </div>

            <div className={`flex flex-col items-center transition-all duration-1000 transform ${animate ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
                {/* Logo Container */}
                <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-8 relative overflow-hidden dark:bg-[#303030]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#FCD34D]/20 to-transparent"></div>
                    <iconify-icon icon="lucide:chef-hat" width="48" className="text-[#303030] dark:text-[#E7E5E4] relative z-10"></iconify-icon>
                </div>

                {/* Text */}
                <h1 className="text-2xl font-bold tracking-tight text-[#303030] dark:text-[#E7E5E4] mb-2">KostKitchen</h1>

                {/* Loading Bar */}
                <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mt-4 dark:bg-gray-800">
                    <div className="h-full bg-[#FCD34D] animate-loading-bar rounded-full"></div>
                </div>

                <p className="text-xs font-medium text-gray-400 mt-4 animate-pulse">Initializing data...</p>
            </div>

            <style>{`
                @keyframes loading-bar {
                    0% { width: 0%; margin-left: 0; }
                    50% { width: 100%; margin-left: 0; }
                    100% { width: 0%; margin-left: 100%; }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s infinite ease-in-out;
                }
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
};
