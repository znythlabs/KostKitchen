import React, { useState } from 'react';

interface LandingPageProps {
    onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
    const [revenue, setRevenue] = useState(500000);
    const [foodCost, setFoodCost] = useState(35);
    const [pricingRegion, setPricingRegion] = useState<'ph' | 'eu'>('ph');

    // ROI Calculation
    const currentFoodCostAmount = revenue * (foodCost / 100);
    const savingsAmount = currentFoodCostAmount * 0.16;
    const yearlySavings = savingsAmount * 12;

    return (
        <div id="landing-page" className="w-full h-full overflow-y-auto bg-[#FDFBF7] text-[#2C2C2C] font-sans antialiased selection:bg-[#FFD54F] selection:text-[#2C2C2C] relative z-50">
            <style>{`
        /* Custom Claymorphism Utilities */
        .clay-card {
            background-color: #FFFFFF;
            box-shadow: 20px 20px 60px #d9d7d4, -20px -20px 60px #ffffff;
            border-radius: 2rem;
        }
        .clay-card-sm {
            background-color: #FFFFFF;
            box-shadow: 8px 8px 16px #e6e4df, -8px -8px 16px #ffffff;
            border-radius: 1.5rem;
        }
        .clay-button {
            box-shadow: 6px 6px 12px #b0b0b0, -6px -6px 12px #ffffff;
            transition: all 0.2s ease;
        }
        .clay-button:active {
            box-shadow: inset 4px 4px 8px #b0b0b0, inset -4px -4px 8px #ffffff;
        }
        .clay-input {
            background: #FDFBF7;
            box-shadow: inset 5px 5px 10px #e6e4df, inset -5px -5px 10px #ffffff;
            border-radius: 1rem;
        }
        /* Custom Range Slider Scoped */
        #landing-page input[type=range] {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
        }
        #landing-page input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #2C2C2C;
            cursor: pointer;
            margin-top: -10px;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
        }
        #landing-page input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: #FFD54F;
            border-radius: 2px;
        }
        .animate-enter {
            animation: enterLink 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
            transform: translateY(20px);
        }
        @keyframes enterLink {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
      `}</style>

            {/* Navigation */}
            <nav className="w-full pt-6 pb-2 flex justify-center sticky top-0 z-50 px-4">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-2 rounded-full flex items-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] gap-1 max-w-xl w-full justify-between pr-2">
                    <div className="flex items-center gap-3 pl-4">
                        <div className="w-8 h-8 bg-[#FCD34D] rounded-full flex items-center justify-center shadow-sm">
                            <iconify-icon icon="lucide:chef-hat" width="16" className="text-[#1C1C1C]"></iconify-icon>
                        </div>
                        <span className="text-sm font-semibold tracking-tight">KostKitchen</span>
                    </div>
                    <div className="hidden md:flex gap-1">
                        <a href="#" className="px-4 py-2 rounded-full text-xs font-medium text-gray-500 hover:text-[#1C1C1C] hover:bg-white/50 transition">Features</a>
                        <a href="#" className="px-4 py-2 rounded-full text-xs font-medium text-gray-500 hover:text-[#1C1C1C] hover:bg-white/50 transition">Pricing</a>
                    </div>
                    <button
                        onClick={onEnterApp}
                        className="bg-[#1C1C1C] text-white px-5 py-2.5 rounded-full text-xs font-medium hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-gray-200"
                    >
                        Log in
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <header className="w-full mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 text-xs font-medium text-gray-500 mb-8 animate-enter">
                    <span className="w-2 h-2 rounded-full bg-[#FCD34D]"></span> v2.0 Now Available
                </div>
                <h1 className="text-6xl md:text-8xl font-light tracking-tighter leading-[0.9] text-[#1C1C1C] mb-8 animate-enter" style={{ animationDelay: '0.1s' }}>
                    Kitchen finance<br />
                    <span className="italic font-normal text-gray-400">simplified.</span>
                </h1>
                <p className="text-xl text-gray-500 font-light max-w-lg leading-relaxed mb-10 animate-enter" style={{ animationDelay: '0.2s' }}>
                    Real-time food costing and inventory management designed for the modern restaurateur.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 animate-enter" style={{ animationDelay: '0.3s' }}>
                    <button
                        onClick={onEnterApp}
                        className="bg-[#1C1C1C] text-white text-lg px-10 py-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-black transition shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        Start Dashboard
                    </button>
                    <button className="px-10 py-4 rounded-full text-lg font-medium text-gray-600 bg-white/50 border border-white hover:bg-white flex items-center gap-2 transition shadow-sm hover:shadow-md">
                        Watch Demo
                    </button>
                </div>
            </header>

            {/* Graphic */}
            <section className="max-w-5xl mx-auto px-6 -mt-10 mb-32">
                <div className="p-2 relative transform rotate-1 hover:rotate-0 transition duration-700">
                    <div className="bg-gray-50 rounded-[1.8rem] overflow-hidden aspect-[16/9] relative border border-gray-100 shadow-2xl shadow-gray-200">
                        {/* UI Mockup Inside Hero */}
                        <div className="absolute inset-0 flex">
                            <div className="w-64 border-r border-gray-200 bg-white/50 p-6 flex flex-col gap-4 hidden md:flex">
                                <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
                                <div className="h-4 w-24 bg-gray-200 rounded-full"></div>
                                <div className="h-4 w-32 bg-gray-100 rounded-full"></div>
                                <div className="h-4 w-20 bg-gray-100 rounded-full"></div>
                            </div>
                            <div className="flex-1 p-8 bg-white/30">
                                <div className="flex justify-between items-end mb-8">
                                    <div className="space-y-2">
                                        <div className="h-8 w-48 bg-[#1C1C1C] rounded-lg"></div>
                                        <div className="h-4 w-32 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <div className="h-12 w-12 bg-[#FCD34D] rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="h-32 bg-white rounded-3xl shadow-sm border border-gray-100"></div>
                                    <div className="h-32 bg-white rounded-3xl shadow-sm border border-gray-100"></div>
                                    <div className="h-32 bg-white rounded-3xl shadow-sm border border-gray-100"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Pain Points (Before & After) */}
            <section className="w-full grid lg:grid-cols-2 min-h-[600px]">
                {/* The Old Way */}
                <div className="bg-gray-100 p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-wrap gap-8 p-8 transform -rotate-12 scale-110 group-hover:scale-105 transition-transform duration-1000">
                        {/* Messy spreadsheet visuals */}
                        <div className="w-64 h-40 bg-white border border-gray-300 shadow-sm"></div>
                        <div className="w-64 h-64 bg-white border border-gray-300 shadow-sm"></div>
                        <div className="w-56 h-56 bg-white border border-gray-300 shadow-sm"></div>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-semibold mb-4 text-gray-500">The Old Way</h3>
                        <h2 className="text-4xl lg:text-5xl font-semibold mb-6 tracking-tight">Manual Calculation <br />& Hidden Costs.</h2>
                        <p className="text-xl text-gray-500">Spreadsheets break. Receipts get lost. You don't know you're losing money until the end of the month.</p>
                    </div>
                </div>

                {/* The Kost Kitchen Way */}
                <div className="bg-[#FFFAE6] p-12 lg:p-20 flex flex-col justify-center relative">
                    {/* Center VS Badge */}
                    <div className="absolute top-0 lg:top-1/2 left-1/2 lg:left-0 transform -translate-x-1/2 -translate-y-1/2 bg-[#2C2C2C] text-[#FFD54F] font-bold text-xl w-16 h-16 rounded-full flex items-center justify-center border-4 border-white z-20 shadow-lg">
                        VS
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-3xl font-semibold mb-4 text-[#C79A00]">Kost Kitchen Way</h3>
                        <h2 className="text-4xl lg:text-5xl font-semibold mb-6 tracking-tight">Automated Costing <br />& Real-Time Profit.</h2>
                        <p className="text-xl text-gray-700 mb-8">Live connection to market prices. Automatic waste calculation. Know your profit per plate, instantly.</p>
                        <div className="clay-card-sm p-6 inline-flex items-center gap-4 w-auto">
                            <div className="w-12 h-12 rounded-full bg-[#FFD54F] flex items-center justify-center">
                                <iconify-icon icon="lucide:trending-up" width="24" className="text-[#2C2C2C]"></iconify-icon>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Margin Improvement</p>
                                <p className="text-2xl font-semibold">+18% Avg.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Features (Bento Grid) */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-auto lg:h-[500px]">
                    {/* Card 1: Offline */}
                    <div className="lg:col-span-2 clay-card p-10 relative overflow-hidden group">
                        <div className="relative z-10 max-w-md">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                                <iconify-icon icon="lucide:wifi-off" width="32" className="text-gray-400"></iconify-icon>
                            </div>
                            <h3 className="text-3xl font-semibold mb-4 tracking-tight">Works Offline.</h3>
                            <p className="text-xl text-gray-500">Internet down? No problem. KostKitchen stores your data locally and syncs automatically when you reconnect.</p>
                        </div>
                        <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-green-100 rounded-[3rem] transform rotate-12 transition-transform group-hover:rotate-6 flex items-center justify-center">
                            <iconify-icon icon="lucide:check-circle" width="128" className="text-green-500"></iconify-icon>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Card 2: Platforms */}
                        <div className="clay-card p-8 flex-1 flex flex-col justify-center">
                            <h3 className="text-2xl font-semibold mb-2 tracking-tight">Available Everywhere</h3>
                            <div className="flex gap-4 mt-4 mb-6">
                                <iconify-icon icon="lucide:monitor" width="32" className="text-gray-400"></iconify-icon>
                                <iconify-icon icon="lucide:smartphone" width="32" className="text-gray-400"></iconify-icon>
                                <iconify-icon icon="lucide:tablet" width="32" className="text-gray-400"></iconify-icon>
                            </div>
                            <a href="#" className="text-sm font-semibold text-[#2C2C2C] underline decoration-[#FFD54F] decoration-2 underline-offset-4">Install Desktop PWA</a>
                        </div>

                        {/* Card 3: Security */}
                        <div className="clay-card p-8 flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-3">
                                <iconify-icon icon="lucide:shield-check" width="24" className="text-[#FFD54F] fill-[#FFD54F]"></iconify-icon>
                                <h3 className="text-2xl font-semibold tracking-tight">Bank-Grade</h3>
                            </div>
                            <p className="text-lg text-gray-500">Encrypted data. Daily cloud backups.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 4: Process Flow */}
            <section className="max-w-7xl mx-auto px-6 py-20 text-center">
                <h2 className="text-4xl font-semibold mb-16 tracking-tight">From Receipt to Revenue</h2>
                <div className="relative flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto gap-12 md:gap-0">
                    {/* Dotted Line */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-1 border-t-4 border-dotted border-[#FFD54F] -z-10"></div>

                    {/* Step 1 */}
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 z-10">
                            <iconify-icon icon="lucide:shopping-basket" width="40" className="text-[#2C2C2C]"></iconify-icon>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Input Ingredients</h3>
                        <p className="text-gray-500">Scan receipts or import CSV</p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 z-10">
                            <iconify-icon icon="lucide:chef-hat" width="40" className="text-[#2C2C2C]"></iconify-icon>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Build Recipes</h3>
                        <p className="text-gray-500">Drag & drop with waste %</p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-[#FFD54F] rounded-3xl shadow-xl flex items-center justify-center mb-6 z-10">
                            <iconify-icon icon="lucide:coins" width="40" className="text-[#2C2C2C]"></iconify-icon>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">See Your Profit</h3>
                        <p className="text-gray-500">Real-time margin analysis</p>
                    </div>
                </div>
            </section>

            {/* Section 5: Interactive ROI Calculator */}
            <section className="max-w-4xl mx-auto px-6 py-20">
                <div className="clay-card p-10 lg:p-14 bg-white/50 backdrop-blur-lg border border-white/40">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-semibold mb-2">How much could you save?</h2>
                        <p className="text-gray-500 text-lg">Based on average KostKitchen user data (16% reduction in food cost).</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-4 flex justify-between">
                                    Monthly Revenue
                                    <span className="text-[#2C2C2C]">₱{revenue.toLocaleString()}</span>
                                </label>
                                <input
                                    type="range"
                                    min="100000"
                                    max="5000000"
                                    step="50000"
                                    value={revenue}
                                    onChange={(e) => setRevenue(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-4 flex justify-between">
                                    Current Food Cost %
                                    <span className="text-[#2C2C2C]">{foodCost}%</span>
                                </label>
                                <input
                                    type="range"
                                    min="20"
                                    max="60"
                                    step="1"
                                    value={foodCost}
                                    onChange={(e) => setFoodCost(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center bg-[#FDFBF7] rounded-3xl p-8 shadow-inner">
                            <p className="text-gray-500 font-medium mb-2">Potential Monthly Savings</p>
                            <p className="text-5xl font-semibold text-[#C79A00] tracking-tight">₱{Math.round(savingsAmount).toLocaleString()}</p>
                            <p className="text-sm text-gray-400 mt-4 text-center">That's ₱{Math.round(yearlySavings).toLocaleString()} per year back in your pocket.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 6: Pricing */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex justify-center mb-12">
                    <div className="clay-input p-1 flex rounded-full relative">
                        <button
                            onClick={() => setPricingRegion('ph')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all z-10 ${pricingRegion === 'ph' ? 'bg-[#2C2C2C] text-white shadow-md' : 'text-gray-500 hover:text-[#2C2C2C]'}`}
                        >
                            🇵🇭 Philippines
                        </button>
                        <button
                            onClick={() => setPricingRegion('eu')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all z-10 ${pricingRegion === 'eu' ? 'bg-[#2C2C2C] text-white shadow-md' : 'text-gray-500 hover:text-[#2C2C2C]'}`}
                        >
                            🇪🇺 Europe
                        </button>
                    </div>
                </div>

                {/* PH Plans */}
                {pricingRegion === 'ph' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-enter">
                        {/* Micro */}
                        <div className="clay-card-sm p-8 flex flex-col">
                            <h3 className="font-semibold text-xl mb-2">Micro</h3>
                            <p className="text-3xl font-bold mb-6">₱199<span className="text-sm font-medium text-gray-400">/mo</span></p>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="text-sm text-gray-600 flex gap-2"><iconify-icon icon="lucide:check" width="16" className="text-green-500"></iconify-icon> 1 User</li>
                                <li className="text-sm text-gray-600 flex gap-2"><iconify-icon icon="lucide:check" width="16" className="text-green-500"></iconify-icon> 50 Recipes</li>
                            </ul>
                            <button onClick={onEnterApp} className="w-full py-3 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50">Start Free</button>
                        </div>
                        {/* Starter */}
                        <div className="clay-card-sm p-8 flex flex-col">
                            <h3 className="font-semibold text-xl mb-2">Starter</h3>
                            <p className="text-3xl font-bold mb-6">₱399<span className="text-sm font-medium text-gray-400">/mo</span></p>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="text-sm text-gray-600 flex gap-2"><iconify-icon icon="lucide:check" width="16" className="text-green-500"></iconify-icon> 3 Users</li>
                                <li className="text-sm text-gray-600 flex gap-2"><iconify-icon icon="lucide:check" width="16" className="text-green-500"></iconify-icon> Unlimited Recipes</li>
                            </ul>
                            <button onClick={onEnterApp} className="w-full py-3 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50">Start Free</button>
                        </div>
                        {/* Professional (Highlighted) */}
                        <div className="clay-card p-8 flex flex-col relative border-2 border-[#FFD54F]">
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FFD54F] text-[#2C2C2C] text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">BEST FOR RESTAURANTS</div>
                            <h3 className="font-semibold text-xl mb-2">Professional</h3>
                            <p className="text-3xl font-bold mb-6">₱699<span className="text-sm font-medium text-gray-400">/mo</span></p>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="text-sm text-gray-600 flex gap-2"><iconify-icon icon="lucide:check" width="16" className="text-green-500"></iconify-icon> Unlimited Users</li>
                                <li className="text-sm text-gray-600 flex gap-2"><iconify-icon icon="lucide:check" width="16" className="text-green-500"></iconify-icon> Inventory Sync</li>
                                <li className="text-sm text-gray-600 flex gap-2"><iconify-icon icon="lucide:check" width="16" className="text-green-500"></iconify-icon> Menu Matrix</li>
                            </ul>
                            <button onClick={onEnterApp} className="w-full py-3 rounded-xl bg-[#2C2C2C] text-white font-semibold hover:bg-black shadow-lg">Start 14-Day Trial</button>
                        </div>
                        {/* Business */}
                        <div className="clay-card-sm p-8 flex flex-col">
                            <h3 className="font-semibold text-xl mb-2">Business</h3>
                            <p className="text-3xl font-bold mb-6">₱1,499<span className="text-sm font-medium text-gray-400">/mo</span></p>
                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="text-sm text-gray-600 flex gap-2"><iconify-icon icon="lucide:check" width="16" className="text-green-500"></iconify-icon> Multi-Branch</li>
                                <li className="text-sm text-gray-600 flex gap-2"><iconify-icon icon="lucide:check" width="16" className="text-green-500"></iconify-icon> API Access</li>
                            </ul>
                            <button className="w-full py-3 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50">Contact Sales</button>
                        </div>
                    </div>
                )}

                {/* EU Plans */}
                {pricingRegion === 'eu' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto animate-enter">
                        <div className="clay-card p-8 flex flex-col">
                            <h3 className="font-semibold text-xl mb-2">Professional EU</h3>
                            <p className="text-3xl font-bold mb-6">€19<span className="text-sm font-medium text-gray-400">/mo</span></p>
                            <button onClick={onEnterApp} className="w-full py-3 rounded-xl bg-[#2C2C2C] text-white font-semibold shadow-lg">Start Trial</button>
                        </div>
                        <div className="clay-card p-8 flex flex-col">
                            <h3 className="font-semibold text-xl mb-2">Business EU</h3>
                            <p className="text-3xl font-bold mb-6">€39<span className="text-sm font-medium text-gray-400">/mo</span></p>
                            <button className="w-full py-3 rounded-xl border border-gray-200 font-semibold">Contact Sales</button>
                        </div>
                    </div>
                )}
            </section>

            {/* Footer */}
            <footer className="bg-[#2C2C2C] text-white py-16 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                    <div className="col-span-1">
                        <span className="text-2xl font-semibold tracking-tight text-[#FFD54F]">KostKitchen</span>
                        <p className="mt-4 text-gray-400 text-sm">Empowering food businesses with intelligence and clarity.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><a href="#" className="hover:text-white">Costing</a></li>
                            <li><a href="#" className="hover:text-white">Inventory</a></li>
                            <li><a href="#" className="hover:text-white">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><a href="#" className="hover:text-white">Documentation</a></li>
                            <li>support@kostkitchen.com</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Social</h4>
                        <div className="flex gap-4">
                            <iconify-icon icon="lucide:facebook" width="20" className="text-gray-400 hover:text-[#FFD54F] cursor-pointer"></iconify-icon>
                            <iconify-icon icon="lucide:instagram" width="20" className="text-gray-400 hover:text-[#FFD54F] cursor-pointer"></iconify-icon>
                            <iconify-icon icon="lucide:linkedin" width="20" className="text-gray-400 hover:text-[#FFD54F] cursor-pointer"></iconify-icon>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
