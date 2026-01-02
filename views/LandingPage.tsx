import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import {
    ChefHat,
    ArrowUpRight,
    CheckCircle2,
    ArrowRight,
    LayoutGrid,
    Utensils,
    Box,
    BarChart3,
    Settings,
    Bell,
    TrendingDown,
    AlertCircle,
    Users,
    Triangle,
    Coffee,
    UtensilsCrossed,
    Soup,
    BrainCircuit,
    Clock,
    Users2,
    ShieldCheck,
    Receipt,
    RefreshCw,
    CalendarClock,
    Sparkles,
    Brain,
    Settings2,
    ArrowLeft,
    MonitorCheck,
    Truck,
    Calculator,
    Check,
    Lock,
    Plus,
    HelpCircle,
    MessageSquare,
    Zap,
    MessageCircle,
    Linkedin,
    Twitter,
    Instagram,
    Mail,
    Menu,
    Globe,
    Smartphone,
    Monitor,
    WifiOff,
    CloudOff,
    Wallet,
    PieChart,
    ScatterChart,
    Package,
    ClipboardList,
    TrendingUp,
} from 'lucide-react';

const pricingData = {
    PH: [
        {
            name: "Micro",
            target: "Carinderia, stalls",
            monthly: "₱0.00",
            annual: "₱0.00",
            highlight: false,
            btnText: "Start Free",
            features: [true, true, true]
        },
        {
            name: "Starter",
            target: "Small restaurants",
            monthly: "₱0.00",
            annual: "₱0.00",
            highlight: false,
            btnText: "Start Free",
            features: [true, true, true]
        },
        {
            name: "Professional",
            target: "Medium restaurants",
            monthly: "₱0.00",
            annual: "₱0.00",
            highlight: true,
            btnText: "Start Free Trial",
            features: [true, true, true]
        },
        {
            name: "Business",
            target: "Multi-branch, catering",
            monthly: "₱0.00",
            annual: "₱0.00",
            highlight: false,
            btnText: "Contact Sales",
            features: [true, true, true]
        }
    ],
    EU: [
        {
            name: "Professional",
            target: "Restaurants",
            monthly: "€0.00",
            annual: "€0.00",
            highlight: true,
            btnText: "Start Free Trial",
            features: [true, true, true]
        },
        {
            name: "Business",
            target: "Multi-branch",
            monthly: "€0.00",
            annual: "€0.00",
            highlight: false,
            btnText: "Contact Sales",
            features: [true, true, true]
        }
    ]
};

interface LandingPageProps {
    onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { theme, setTheme } = useApp();
    const [isVisible, setIsVisible] = useState(true);

    const [region, setRegion] = useState<'PH' | 'EU'>('PH');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    const handleEnter = () => {
        setIsVisible(false);
        setTimeout(onEnterApp, 700);
    };

    // Scroll Reveal Effect
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-10');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('section > div').forEach((el) => {
            el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
            observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div id="marketing-site" className={`w-full block bg-[#F3EFE0] text-[#111111] antialiased selection:bg-[#FFD646] selection:text-black font-sans transition-opacity duration-700 ease-in-out overflow-y-auto h-screen ${!isVisible ? 'opacity-0' : 'opacity-100'}`}>
            {/* Navbar placeholder */}
            <nav className="fixed top-0 w-full z-50 bg-[#F3EFE0]/90 backdrop-blur-md border-b border-[#E6E2D6]">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center text-white">
                            <ChefHat className="w-5 h-5" />
                        </div>
                        <span className="text-xl font-semibold tracking-tight text-[#111111]">
                            KostKitchen
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#666666]">
                        <a href="#" className="hover:text-black transition-colors">Features</a>
                        <a href="#" className="hover:text-black transition-colors">How It Works</a>
                        <a href="#" className="hover:text-black transition-colors">Pricing</a>
                        <a href="#" className="hover:text-black transition-colors">Resources</a>
                    </div>

                    <button onClick={handleEnter} className="bg-[#111111] hover:bg-black/80 text-white px-6 py-2.5 rounded-2xl text-sm font-medium transition-all shadow-lg shadow-gray-300/50 flex items-center gap-2 group">
                        Get Started
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-36 pb-20 overflow-hidden">
                {/* Background Gradients (Warm) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-200/40 via-[#F3EFE0] to-transparent -z-10"></div>

                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-semibold text-[#111111] tracking-tight leading-[1.1] mb-6">
                        The Operating System
                        <br />
                        for
                        <span className="relative inline-block ml-2">
                            <span className="relative z-10">Modern Kitchens</span>
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-[#666666] max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
                        Control food costs, manage inventory, and track real-time
                        profitability with an interface designed for business owners, not accountants.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 text-sm">
                        <div className="flex items-center gap-2 text-[#444444]">
                            <CheckCircle2 className="w-4 h-4 text-[#FFD646] fill-black" />
                            No credit card Required
                        </div>
                        <div className="flex items-center gap-2 text-[#444444]">
                            <CheckCircle2 className="w-4 h-4 text-[#FFD646] fill-black" />
                            Cancel Anytime
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button onClick={handleEnter} className="bg-[#FFD646] hover:bg-[#FFC920] text-[#111111] px-8 py-3.5 rounded-2xl text-base font-medium transition-all shadow-xl shadow-yellow-200/50 flex items-center gap-2">
                            Start Free Trial
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button className="bg-white hover:bg-gray-50 text-[#111111] border border-[#E6E2D6] px-8 py-3.5 rounded-2xl text-base font-medium transition-all shadow-sm flex items-center gap-2">
                            Request a Demo
                        </button>
                    </div>

                    {/* Dashboard Mockup */}
                    <div className="relative max-w-6xl mx-auto rounded-[2.5rem] p-3 bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl shadow-stone-200/50">
                        <div className="rounded-[2rem] bg-[#E3E5E6] bg-[linear-gradient(150deg,#E3E5E6_0%,#E3E5E6_24.65%,#FFF4D2_58.78%,#F3E8C9_100%)] bg-fixed bg-cover overflow-hidden relative min-h-[700px] text-left flex">
                            {/* Sidebar */}
                            <div className="hidden md:flex w-64 flex-col p-6 border-r border-[#E6E2D6]/30">
                                <div className="flex items-center gap-3 mb-10">
                                    <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-white text-xs font-bold">
                                        K
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-[#111111]">
                                            KostKitchen
                                        </div>
                                        <div className="text-[10px] text-[#888888]">Pro Plan</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-10 w-full bg-[#111111] text-white rounded-xl flex items-center px-4 gap-3 text-sm font-medium shadow-lg shadow-black/10">
                                        <LayoutGrid className="w-4 h-4" />
                                        Overview
                                    </div>
                                    <div className="h-10 w-full hover:bg-black/5 text-[#666666] rounded-xl flex items-center px-4 gap-3 text-sm font-medium transition-colors">
                                        <Utensils className="w-4 h-4" />
                                        Menu
                                    </div>
                                    <div className="h-10 w-full hover:bg-black/5 text-[#666666] rounded-xl flex items-center px-4 gap-3 text-sm font-medium transition-colors">
                                        <ScatterChart className="w-4 h-4" />
                                        Matrix
                                    </div>
                                    <div className="h-10 w-full hover:bg-black/5 text-[#666666] rounded-xl flex items-center px-4 gap-3 text-sm font-medium transition-colors">
                                        <Package className="w-4 h-4" />
                                        Inventory
                                    </div>
                                    <div className="h-10 w-full hover:bg-black/5 text-[#666666] rounded-xl flex items-center px-4 gap-3 text-sm font-medium transition-colors">
                                        <PieChart className="w-4 h-4" />
                                        Financials
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-3xl font-light text-[#111111] tracking-tight">
                                        Welcome in,
                                        <span className="font-medium ml-2">Marco</span>
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs font-medium">Kitchen Live</span>
                                        </div>
                                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                                            <Bell className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <img src="https://i.pravatar.cc/150?img=12" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Profile" />
                                    </div>
                                </div>

                                {/* Stats Grid, Charts, Bottom Section */}
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    {/* Card 1 (Yellow Accent) */}
                                    <div className="bg-[#FFD646] p-5 rounded-[1.5rem] relative overflow-hidden group hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-medium text-[#111111]/80">
                                                Total Sales
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                                                <span className="font-serif italic text-sm">$</span>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-semibold text-[#111111] mb-2">
                                            ₱24,500
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium">
                                            <span className="bg-white/40 px-1.5 py-0.5 rounded-md">
                                                +12%
                                            </span>
                                            <span className="text-[#111111]/70">vs yesterday</span>
                                        </div>
                                    </div>
                                    {/* Card 2 */}
                                    <div className="bg-white/60 p-5 rounded-[1.5rem] border border-[#E6E2D6]/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-medium text-gray-500">
                                                Food Cost
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                <TrendingDown className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-semibold text-[#111111] mb-2">
                                            28.5%
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium">
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded-md text-gray-600">
                                                -2.1%
                                            </span>
                                            <span className="text-gray-400">Optimization</span>
                                        </div>
                                    </div>
                                    {/* Card 3 */}
                                    <div className="bg-white/60 p-5 rounded-[1.5rem] border border-[#E6E2D6]/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-medium text-gray-500">
                                                Low Stock Items
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                <AlertCircle className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-semibold text-[#111111] mb-2">
                                            3
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium">
                                            <span className="text-gray-400">Requires attention</span>
                                        </div>
                                    </div>
                                    {/* Card 4 */}
                                    <div className="bg-white/60 p-5 rounded-[1.5rem] border border-[#E6E2D6]/50">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-medium text-gray-500">
                                                Gross Profit
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                <Wallet className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-semibold text-[#111111] mb-2">
                                            ₱17,522
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium">
                                            <span className="text-gray-400">71.5% margin</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts Section */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    {/* Bar Chart */}
                                    <div className="md:col-span-2 bg-white/60 p-6 rounded-[2rem] border border-[#E6E2D6]/50">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h4 className="text-lg font-medium text-[#111111]">
                                                    Profitability Trend
                                                </h4>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Net profit margin over last 7 days
                                                </p>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-gray-300" />
                                        </div>
                                        <div className="h-48 flex items-end justify-between gap-2 px-2">
                                            {/* Bars */}
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                                const heights = ['40%', '55%', '45%', '70%', '85%', '60%', '75%'];
                                                const isFri = day === 'Fri';
                                                return (
                                                    <div key={day} className={`w-full ${isFri ? 'bg-[#303030] border-2 border-[#E6E2D6] -mt-2 z-10 shadow-lg' : 'bg-[#FFD646] group hover:bg-[#FFD646]'} rounded-t-lg relative transition-colors`} style={{ height: heights[i] }}>
                                                        {isFri && (
                                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111111] text-white text-[10px] px-2 py-1 rounded">
                                                                ₱24k
                                                            </div>
                                                        )}
                                                        <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] ${isFri ? 'text-[#111111] font-bold' : 'text-gray-400'}`}>
                                                            {day}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Donut Chart */}
                                    <div className="bg-white/60 p-6 rounded-[2rem] border border-[#E6E2D6]/50 flex flex-col items-center justify-center relative">
                                        <h4 className="absolute top-6 left-6 text-sm font-medium text-[#111111]">
                                            Daily Goal
                                        </h4>
                                        <div className="relative w-40 h-40 flex items-center justify-center mt-4">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="80" cy="80" r="70" stroke="#F3EFE0" strokeWidth="12" fill="none"></circle>
                                                <circle cx="80" cy="80" r="70" stroke="#FFD646" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset="110" strokeLinecap="round"></circle>
                                            </svg>
                                            <div className="absolute text-center">
                                                <div className="text-3xl font-semibold text-[#111111]">
                                                    70%
                                                </div>
                                                <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                                                    Achieved
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between w-full mt-6 px-2 text-center">
                                            <div>
                                                <div className="text-[10px] text-gray-400 uppercase">
                                                    Target
                                                </div>
                                                <div className="text-sm font-semibold">₱35k</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-gray-400 uppercase">
                                                    Current
                                                </div>
                                                <div className="text-sm font-semibold">₱24.5k</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Section */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Action Required (Black Card) */}
                                    <div className="bg-[#1F1F1F] p-6 rounded-[2rem] text-white border border-[#333]">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-lg font-medium tracking-tight">
                                                Action Required
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                                <span className="text-xs text-gray-400">3 Pending</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {/* Item 1 */}
                                            <div className="flex items-center justify-between p-4 bg-[#2A2A2A] rounded-2xl border border-white/5 group hover:bg-[#333] transition-all cursor-pointer shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">
                                                        Chicken Breast
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium mt-1">
                                                        2000 g (Min: 5000)
                                                    </span>
                                                </div>
                                                <button className="bg-[#3A2D28] hover:bg-[#4A3830] border border-orange-500/20 text-orange-400 text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-wider uppercase transition-colors">
                                                    Low Stock
                                                </button>
                                            </div>

                                            {/* Item 2 */}
                                            <div className="flex items-center justify-between p-4 bg-[#2A2A2A] rounded-2xl border border-white/5 group hover:bg-[#333] transition-all cursor-pointer shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">
                                                        Heavy Cream
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium mt-1">
                                                        2 L (Min: 8 L)
                                                    </span>
                                                </div>
                                                <button className="bg-[#3A2D28] hover:bg-[#4A3830] border border-orange-500/20 text-orange-400 text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-wider uppercase transition-colors">
                                                    Low Stock
                                                </button>
                                            </div>

                                            {/* Item 3 */}
                                            <div className="flex items-center justify-between p-4 bg-[#2A2A2A] rounded-2xl border border-white/5 group hover:bg-[#333] transition-all cursor-pointer shadow-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">
                                                        Truffle Oil
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium mt-1">
                                                        1 Bottle (Min: 3)
                                                    </span>
                                                </div>
                                                <button className="bg-[#3A2D28] hover:bg-[#4A3830] border border-orange-500/20 text-orange-400 text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-wider uppercase transition-colors">
                                                    Low Stock
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Movers Table (White Card) */}
                                    <div className="bg-white/60 p-6 rounded-[2rem] border border-[#E6E2D6]/50">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-lg font-medium text-[#111111]">
                                                Top Movers
                                            </h4>
                                            <span className="text-xs text-gray-400 hover:text-black cursor-pointer">
                                                View Full Menu
                                            </span>
                                        </div>
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                                    <th className="pb-3 font-medium">Item Name</th>
                                                    <th className="pb-3 font-medium">Category</th>
                                                    <th className="pb-3 font-medium">Vol</th>
                                                    <th className="pb-3 font-medium">Cost %</th>
                                                    <th className="pb-3 font-medium text-right">Profit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                <tr>
                                                    <td className="py-3 font-medium text-[#111111]">
                                                        Wagyu Burger
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                                            Mains
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-gray-500">42</td>
                                                    <td className="py-3 text-gray-500">32%</td>
                                                    <td className="py-3 text-right font-medium">₱8,400</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-3 font-medium text-[#111111]">
                                                        Truffle Pasta
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                                            Mains
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-gray-500">28</td>
                                                    <td className="py-3 text-gray-500">25%</td>
                                                    <td className="py-3 text-right font-medium">₱6,125</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-3 font-medium text-[#111111]">
                                                        Iced Tea Pitcher
                                                    </td>
                                                    <td className="py-3">
                                                        <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                            Bev
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-gray-500">140</td>
                                                    <td className="py-3 text-gray-500">12%</td>
                                                    <td className="py-3 text-right font-medium">₱2,800</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements decoration */}
                        <div className="absolute -left-12 top-1/4 bg-white p-3 rounded-2xl shadow-xl shadow-gray-200/50 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="w-10 h-10 rounded-full bg-[#FFD646] flex items-center justify-center text-black">
                                <ChefHat className="w-5 h-5" />
                            </div>
                            <div className="text-xs pr-2">
                                <div className="font-semibold text-[#111111]">Store Owner</div>
                                <div className="text-gray-400">Just Now</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trusted By */}
                <div className="max-w-6xl mx-auto px-6 mt-20 text-center">
                    <p className="text-sm font-medium text-gray-400 mb-8 uppercase tracking-wide">
                        Trusted by Top Kitchens
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity duration-500 grayscale">
                        <div className="text-xl font-bold text-[#111111] flex items-center gap-2">
                            <Triangle className="fill-current w-5 h-5" />
                            BISTRO
                        </div>
                        <div className="text-xl font-bold text-[#111111] flex items-center gap-2">
                            <Coffee className="w-5 h-5" />
                            Roast&Co
                        </div>
                        <div className="text-xl font-bold text-[#111111] flex items-center gap-2">
                            <UtensilsCrossed className="w-5 h-5" />
                            FINE.DINE
                        </div>
                        <div className="text-xl font-bold text-[#111111] flex items-center gap-2">
                            <Soup className="w-5 h-5" />
                            bowl.
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-[#F8F6F1]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-semibold text-[#111111] tracking-tight mb-4">
                            Ingredients for
                            <br />
                            <span className="text-[#888888]">Success</span>
                        </h2>
                        <p className="text-lg text-[#666666] max-w-2xl mx-auto">
                            Discover the features that will optimize your kitchen's workflow.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Feature 1 */}
                        <div className="bg-white rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                            <div className="max-w-md relative z-10">
                                <div className="w-12 h-12 bg-[#FFD646] rounded-2xl flex items-center justify-center mb-6">
                                    <ClipboardList className="w-6 h-6 text-[#111111]" />
                                </div>
                                <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">
                                    Smart Purchase Orders
                                </h3>
                                <p className="text-[#666666] leading-relaxed mb-8">
                                    Generate PDF purchase orders instantly based on low stock items.
                                </p>
                            </div>
                            {/* Visual */}
                            <div className="bg-[#F8F6F1] rounded-2xl p-4 w-[200px] max-w-[350px] absolute -right-10 translate-y-[-130px] translate-x-[-100px] bottom-10 transform group-hover:-translate-y-[120px] transition-transform duration-500">
                                <div className="flex items-center gap-1 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="font-medium text-xs">Onions (Diced)</span>
                                    <span className="ml-auto font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                        2.5kg
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-[#FFD646]"></div>
                                    <span className="font-medium text-xs">Carrots (Julienne)</span>
                                    <span className="ml-auto font-mono text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                        1.2kg
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                            <div className="max-w-md relative z-10">
                                <div className="w-12 h-12 bg-[#111111] rounded-2xl flex items-center justify-center mb-6">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">
                                    Real-Time Costing
                                </h3>
                                <p className="text-[#666666] leading-relaxed mb-8">
                                    Know your exact plate cost as market prices fluctuate. Never
                                    serve at a loss.
                                </p>
                            </div>
                            <div className="absolute bottom-10 right-10 flex gap-2">
                                <div className="bg-[#111111] text-white px-4 py-3 rounded-xl shadow-lg">
                                    <div className="text-[10px] text-gray-400 uppercase">Margin</div>
                                    <div className="text-xl font-bold">68%</div>
                                </div>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                            <div className="max-w-md relative z-10">
                                <div className="w-12 h-12 bg-[#F3EFE0] rounded-2xl flex items-center justify-center mb-6">
                                    <BarChart3 className="w-6 h-6 text-[#111111]" />
                                </div>
                                <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">
                                    Financial Reporting
                                </h3>
                                <p className="text-[#666666] leading-relaxed mb-8">
                                    Export detailed daily, weekly, and monthly profit & loss reports.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden group hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                            <div className="max-w-md relative z-10">
                                <div className="w-12 h-12 bg-[#FFD646] rounded-2xl flex items-center justify-center mb-6">
                                    <ShieldCheck className="w-6 h-6 text-[#111111]" />
                                </div>
                                <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">
                                    Inventory Protection
                                </h3>
                                <p className="text-[#666666] leading-relaxed mb-8">
                                    Alerts for low stock, expiry dates, and unusual usage patterns.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 px-6">
                <div className="max-w-7xl mx-auto bg-white border border-[#E6E2D6] rounded-[3rem] p-8 md:p-12 shadow-xl shadow-[#E6E2D6]/20 relative overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 mb-10 relative z-10">
                        <h2 className="text-5xl md:text-7xl font-semibold text-[#111111] tracking-tighter leading-[0.9]">
                            How it works.
                        </h2>
                        <div className="hidden md:block w-px h-12 bg-[#E6E2D6]"></div>
                        <p className="text-[#666666] font-medium text-sm md:text-base max-w-sm">
                            Three simple steps to automate your inventory and cost control.
                        </p>
                    </div>

                    <div className="h-px w-full bg-[#E6E2D6] mb-12"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="group relative flex flex-col h-full bg-white border border-[#E6E2D6] rounded-[2rem] p-8 hover:shadow-lg hover:shadow-[#F3EFE0] transition-all duration-300">
                            <div className="absolute -top-3.5 left-8 bg-white border border-[#E6E2D6] px-4 py-1.5 rounded-full text-[10px] font-bold text-[#111111] uppercase tracking-widest z-10">
                                Step 1
                            </div>

                            <div className="bg-[#F8F6F1] rounded-2xl h-56 mb-8 relative overflow-hidden flex items-center justify-center group-hover:bg-[#F3EFE0] transition-colors">
                                {/* Illustration: Invoice Scan */}
                                <div className="relative w-32 h-40 bg-white rounded-lg border border-[#E6E2D6] shadow-sm transform -rotate-3 transition-transform group-hover:rotate-0 duration-500 flex flex-col p-3 gap-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-6 h-6 rounded-full bg-[#F3EFE0] flex items-center justify-center">
                                            <Receipt className="w-3 h-3 text-[#111111]" />
                                        </div>
                                        <div className="h-1.5 w-12 bg-[#F3EFE0] rounded-full"></div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="h-1 w-full bg-[#F3EFE0] rounded-full"></div>
                                        <div className="h-1 w-full bg-[#F3EFE0] rounded-full"></div>
                                        <div className="h-1 w-3/4 bg-[#F3EFE0] rounded-full"></div>
                                    </div>
                                    <div className="mt-auto pt-2 border-t border-[#F3EFE0] flex justify-between items-center">
                                        <div className="h-1.5 w-8 bg-[#F3EFE0] rounded-full"></div>
                                        <div className="h-1.5 w-8 bg-[#111111] rounded-full"></div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFD646]/5 to-transparent animate-pulse pointer-events-none"></div>
                            </div>

                            <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">Centralized Pricing</h3>
                            <p className="text-[#666666] text-sm leading-relaxed">
                                Update an ingredient's price once, and it automatically recalculates costs for every recipe on your menu.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="group relative flex flex-col h-full bg-white border border-[#E6E2D6] rounded-[2rem] p-8 hover:shadow-lg hover:shadow-[#F3EFE0] transition-all duration-300">
                            <div className="absolute -top-3.5 left-8 bg-white border border-[#E6E2D6] px-4 py-1.5 rounded-full text-[10px] font-bold text-[#111111] uppercase tracking-widest z-10">
                                Step 2
                            </div>

                            <div className="bg-[#F8F6F1] rounded-2xl h-56 mb-8 relative overflow-hidden flex items-center justify-center group-hover:bg-[#F3EFE0] transition-colors">
                                {/* Illustration: Processing/Recipe Costing */}
                                <div className="grid grid-cols-1 gap-3 w-40">
                                    <div className="bg-white p-3 rounded-xl border border-[#E6E2D6] shadow-sm flex items-center justify-between transform translate-x-4 group-hover:translate-x-0 transition-transform duration-500 delay-75">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                            <div className="h-1.5 w-12 bg-[#F3EFE0] rounded-full"></div>
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-400">...</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-[#E6E2D6] shadow-sm flex items-center justify-between z-10 scale-110">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#FFD646]"></div>
                                            <div className="text-xs font-semibold text-[#111111]">Costing</div>
                                        </div>
                                        <RefreshCw className="w-3 h-3 text-[#111111] animate-spin-slow" />
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-[#E6E2D6] shadow-sm flex items-center justify-between transform -translate-x-4 group-hover:translate-x-0 transition-transform duration-500 delay-75">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                            <div className="h-1.5 w-12 bg-[#F3EFE0] rounded-full"></div>
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-400">...</div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">Auto-Update Costs</h3>
                            <p className="text-[#666666] text-sm leading-relaxed">
                                Recipes are automatically re-calculated when ingredient prices change. Know your margins in real-time.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="group relative flex flex-col h-full bg-white border border-[#E6E2D6] rounded-[2rem] p-8 hover:shadow-lg hover:shadow-[#F3EFE0] transition-all duration-300">
                            <div className="absolute -top-3.5 left-8 bg-white border border-[#E6E2D6] px-4 py-1.5 rounded-full text-[10px] font-bold text-[#111111] uppercase tracking-widest z-10">
                                Step 3
                            </div>

                            <div className="bg-[#F8F6F1] rounded-2xl h-56 mb-8 relative overflow-hidden flex items-center justify-center group-hover:bg-[#F3EFE0] transition-colors">
                                {/* Illustration: Insights */}
                                <div className="w-48 bg-white rounded-xl border border-[#E6E2D6] shadow-sm p-4 flex flex-col gap-3 group-hover:scale-105 transition-transform duration-500">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-xs font-semibold text-[#111111]">Profitability</div>
                                        <div className="bg-[#F3EFE0] text-[10px] px-1.5 py-0.5 rounded text-[#111111]">Week</div>
                                    </div>
                                    <div className="flex items-end gap-1 h-16 justify-between px-1">
                                        <div className="w-6 bg-[#F3EFE0] rounded-t-sm h-[40%] group-hover:h-[45%] transition-all duration-700"></div>
                                        <div className="w-6 bg-[#F3EFE0] rounded-t-sm h-[60%] group-hover:h-[55%] transition-all duration-700 delay-100"></div>
                                        <div className="w-6 bg-[#FFD646] rounded-t-sm h-[75%] group-hover:h-[85%] transition-all duration-700 delay-200 relative shadow-sm"></div>
                                        <div className="w-6 bg-[#F3EFE0] rounded-t-sm h-[50%] group-hover:h-[60%] transition-all duration-700 delay-300"></div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] text-gray-500">Optimized</span>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-semibold text-[#111111] mb-3 tracking-tight">Maximize Profit</h3>
                            <p className="text-[#666666] text-sm leading-relaxed">
                                Identify low-margin dishes and wastage trends instantly. Make data-driven decisions to boost your bottom line.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Diagram Section */}
            <section className="py-28 bg-white relative overflow-hidden rounded-t-[3rem]">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-100/30 via-white to-transparent opacity-60 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-semibold text-[#111111] tracking-tight mb-4">
                        Makes
                        <span className="text-[#FFD646] ml-2">Kitchen Management Seamless</span>
                    </h2>
                    <p className="text-lg text-[#666666] max-w-2xl mx-auto mb-16">
                        Our robust platform works perfectly offline and online, ensuring you
                        never lose a beat. It adapts to your unique business needs.
                    </p>

                    {/* Diagram Container */}
                    <div className="relative w-full max-w-[1000px] mx-auto h-[550px] mt-12">
                        {/* SVG Connections & Arcs */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Inner Connecting Lines (Solid) */}
                            <path d="M 500 120 Q 250 150 150 400" stroke="#E6E2D6" strokeWidth="2" strokeDasharray="4 4" className="opacity-50"></path>
                            <path d="M 500 120 Q 350 150 300 250" stroke="#E6E2D6" strokeWidth="2"></path>
                            <path d="M 500 120 Q 650 150 700 250" stroke="#E6E2D6" strokeWidth="2"></path>
                            <path d="M 500 120 Q 750 150 850 400" stroke="#E6E2D6" strokeWidth="2" strokeDasharray="4 4" className="opacity-50"></path>

                            {/* Outer Arcs (Decorative) */}
                            <path d="M 50 600 Q 500 -80 950 600" stroke="#F3EFE0" strokeWidth="2"></path>
                            <path d="M 150 600 Q 500 50 850 600" stroke="#E6E2D6" strokeWidth="2"></path>
                            <path d="M 250 600 Q 500 150 750 600" stroke="#F3EFE0" strokeWidth="2"></path>
                        </svg>

                        {/* Central Node */}
                        <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-30">
                            <div className="w-24 h-24 bg-[#111111] rounded-[2rem] shadow-[0_0_60px_rgba(255,214,70,0.6)] flex items-center justify-center p-1 border border-[#333] ring-4 ring-[#FFD646]/20 relative">
                                <BrainCircuit className="w-10 h-10 text-white" />
                                {/* Glow Pulse */}
                                <div className="absolute inset-0 bg-[#FFD646] rounded-[2rem] -z-10 animate-pulse opacity-20 blur-xl"></div>
                            </div>
                        </div>

                        {/* Left Far Node */}
                        <div className="absolute top-[380px] left-[15%] -translate-x-1/2 z-20">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-[#E6E2D6] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <CalendarClock className="w-6 h-6 text-red-500" />
                                </div>
                            </div>
                        </div>

                        {/* Left Near Node */}
                        <div className="absolute top-[230px] left-[30%] -translate-x-1/2 z-20">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-[#E6E2D6] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <Users className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Right Near Node (Tooltip) */}
                        <div className="absolute top-[230px] left-[70%] -translate-x-1/2 z-20 group">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-[#E6E2D6] flex items-center justify-center hover:scale-110 transition-transform duration-300 relative z-20">
                                <div className="p-3 bg-orange-50 rounded-xl">
                                    <Sparkles className="w-6 h-6 text-orange-500" />
                                </div>
                            </div>

                            {/* Tooltip Card */}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 w-64 bg-white border border-[#E6E2D6] p-4 rounded-xl shadow-xl z-10 hidden md:block mr-4">
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                        <Zap className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <p className="text-xs leading-relaxed text-[#666666] text-left">
                                        <span className="font-semibold text-[#111111]">Always On:</span>
                                        Works offline so you can manage your business anywhere.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Far Node */}
                        <div className="absolute top-[380px] left-[85%] -translate-x-1/2 z-20">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-[#E6E2D6] flex items-center justify-center hover:scale-110 transition-transform duration-300">
                                <div className="p-3 bg-purple-50 rounded-xl">
                                    <Settings2 className="w-6 h-6 text-purple-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonials Section */}
                    <div className="mt-24 relative">
                        {/* Soft Glow Background Behind */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-50/80 via-transparent to-transparent opacity-80 pointer-events-none -z-10"></div>

                        <div className="relative z-10 text-left md:text-center max-w-3xl mx-auto mb-16 px-4">
                            <h3 className="text-3xl md:text-5xl font-semibold text-[#111111] tracking-tight leading-[1.15]">
                                Join the Hundreds of Kitchens
                                <br />
                                Already
                                <span className="text-[#FFD646] ml-2">Improving Profitability</span>
                            </h3>
                        </div>

                        {/* Carousel Cards Container - Visible Overflow to fix Clipping */}
                        <div className="relative z-10 w-full overflow-visible">
                            <div className="flex gap-6 overflow-x-auto pb-16 px-6 md:justify-center no-scrollbar snap-x snap-mandatory pt-4">
                                {/* Card 1 (Active/Highlighted Style) */}
                                <div className="snap-center shrink-0 w-[340px] md:w-[420px] bg-white p-1 rounded-[2.5rem] bg-gradient-to-b from-[#FFD646] to-[#F3EFE0] shadow-[0_20px_60px_-15px_rgba(255,214,70,0.3)] transition-transform duration-300 hover:scale-[1.01]">
                                    <div className="bg-white rounded-[2.3rem] p-8 h-full flex flex-col">
                                        <div className="flex items-center gap-4 mb-6">
                                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" alt="Chef" />
                                            <div className="text-left">
                                                <h4 className="font-semibold text-[#111111] text-lg">
                                                    Emily Martinez
                                                </h4>
                                                <p className="text-xs text-[#888888] font-medium tracking-wide">
                                                    EXECUTIVE CHEF • NEW YORK, USA
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-[#F8F6F1] rounded-3xl p-6 flex-1 border border-[#E6E2D6]/50">
                                            <p className="text-[15px] text-[#444444] leading-relaxed font-normal">
                                                "I couldn't have asked for a better experience. From
                                                tracking real-time food costs to optimizing our daily prep
                                                lists, KostKitchen has been with us every step of the
                                                way."
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 2 */}
                                <div className="snap-center shrink-0 w-[340px] md:w-[420px] bg-white p-1 rounded-[2.5rem] border border-[#E6E2D6] opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-100">
                                    <div className="bg-white rounded-[2.3rem] p-8 h-full flex flex-col">
                                        <div className="flex items-center gap-4 mb-6">
                                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" className="w-14 h-14 rounded-full object-cover grayscale border-2 border-white shadow-sm" alt="Chef" />
                                            <div className="text-left">
                                                <h4 className="font-semibold text-[#111111] text-lg">
                                                    David Chen
                                                </h4>
                                                <p className="text-xs text-[#888888] font-medium tracking-wide">
                                                    OWNER • SAN FRANCISCO, USA
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-[#F8F6F1] rounded-3xl p-6 flex-1 border border-[#E6E2D6]/50">
                                            <p className="text-[15px] text-[#444444] leading-relaxed font-normal">
                                                "The inventory protection alerts alone saved us over $2k
                                                in the first month. It's like having a dedicated
                                                accountant who also knows how to cook perfectly."
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card 3 */}
                                <div className="snap-center shrink-0 w-[340px] md:w-[420px] bg-white p-1 rounded-[2.5rem] border border-[#E6E2D6] opacity-60 hover:opacity-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-100">
                                    <div className="bg-white rounded-[2.3rem] p-8 h-full flex flex-col">
                                        <div className="flex items-center gap-4 mb-6">
                                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" className="w-14 h-14 rounded-full object-cover grayscale border-2 border-white shadow-sm" alt="Chef" />
                                            <div className="text-left">
                                                <h4 className="font-semibold text-[#111111] text-lg">
                                                    Sarah Jenkins
                                                </h4>
                                                <p className="text-xs text-[#888888] font-medium tracking-wide">
                                                    SOUS CHEF • LONDON, UK
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-[#F8F6F1] rounded-3xl p-6 flex-1 border border-[#E6E2D6]/50">
                                            <p className="text-[15px] text-[#444444] leading-relaxed font-normal">
                                                "Finally, a system that understands the chaos of a real
                                                kitchen. The shift scheduling feature reduced our labor
                                                costs by 15% immediately."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-8 mt-4">
                            <button className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-xl shadow-gray-400/20 hover:bg-[#333] transition-all hover:scale-110">
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-2.5 rounded-full bg-[#111111]"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                            </div>

                            <button className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-xl shadow-gray-400/20 hover:bg-[#333] transition-all hover:scale-110">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3.1 Platform Section */}
            <section id="platform" className="py-24 px-6 max-w-7xl mx-auto border-b border-[#E6E2D6]">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#111111] mb-6">
                        Available everywhere you work
                    </h2>
                    <p className="text-[#666666] text-lg max-w-2xl mx-auto">
                        Seamlessly sync across all your devices.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 px-4">
                    <div className="bg-white border border-[#E6E2D6] rounded-[2rem] p-8 flex flex-col items-center text-center hover:shadow-xl hover:shadow-[#F3EFE0] transition-all duration-300 group">
                        <div className="w-14 h-14 bg-[#F8F6F1] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Globe className="w-7 h-7 text-[#111111]" />
                        </div>
                        <h3 className="font-semibold text-[#111111] text-lg">Web App</h3>
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full mt-3 uppercase tracking-wide">
                            Available
                        </span>
                    </div>
                    <div className="bg-white border border-[#E6E2D6] rounded-[2rem] p-8 flex flex-col items-center text-center hover:shadow-xl hover:shadow-[#F3EFE0] transition-all duration-300 group">
                        <div className="w-14 h-14 bg-[#F8F6F1] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Smartphone className="w-7 h-7 text-[#111111]" />
                        </div>
                        <h3 className="font-semibold text-[#111111] text-lg">Android</h3>
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full mt-3 uppercase tracking-wide">
                            Available
                        </span>
                    </div>
                    <div className="bg-white border border-[#E6E2D6] rounded-[2rem] p-8 flex flex-col items-center text-center hover:shadow-xl hover:shadow-[#F3EFE0] transition-all duration-300 group">
                        <div className="w-14 h-14 bg-[#F8F6F1] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#111111]">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.68-.83 1.14-1.99.94-3.14-1.02.04-2.26.68-3 1.54-.66.77-1.24 2.02-.96 3.12 1.13.09 2.33-.64 3.02-1.52z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-[#111111] text-lg">iOS</h3>
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full mt-3 uppercase tracking-wide">
                            Available
                        </span>
                    </div>
                    <div className="bg-white border border-[#E6E2D6] rounded-[2rem] p-8 flex flex-col items-center text-center hover:shadow-xl hover:shadow-[#F3EFE0] transition-all duration-300 group">
                        <div className="w-14 h-14 bg-[#F8F6F1] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Monitor className="w-7 h-7 text-[#111111]" />
                        </div>
                        <h3 className="font-semibold text-[#111111] text-lg">Desktop</h3>
                        <span className="text-[10px] font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full mt-3 uppercase tracking-wide">
                            Available
                        </span>
                    </div>
                </div>

                <div className="soft-card-dark bg-[#303030] text-white rounded-2xl p-8 md:p-12 relative overflow-hidden dark:bg-[#1C1917]">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-xl">
                            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                                <WifiOff className="w-4 h-4 text-[#FCD34D]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
                                    Offline Mode
                                </span>
                            </div>
                            <h3 className="text-3xl font-medium tracking-tight">
                                No internet? No problem.
                            </h3>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                KostKitchen works even without internet! Continue managing
                                recipes and inventory offline. Your data syncs automatically
                                to the cloud the moment you're back online.
                            </p>
                        </div>
                        <div className="flex-shrink-0 bg-white/10 p-6 rounded-full">
                            <CloudOff className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -right-20 -bottom-40 w-80 h-80 bg-[#FCD34D] rounded-full mix-blend-overlay filter blur-[64px] opacity-20"></div>
                </div>
            </section>

            {/* Pricing Section */}
            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-[#F3EFE0]">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="flex flex-col text-center mb-12 items-center">
                        <div className="inline-flex gap-2 bg-[#111111]/5 border-[#111111]/10 border rounded-full mb-6 pt-1 pr-3 pb-1 pl-3 items-center">
                            <span className="h-2 w-2 rounded-full bg-[#FFD646] animate-pulse"></span>
                            <span className="text-xs font-medium text-[#111111] tracking-wide uppercase">
                                Plans &amp; Pricing
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-semibold text-[#111111] tracking-tight mb-6">
                            Pricing Plans
                        </h2>

                        {/* Region Toggle */}
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <button
                                onClick={() => setRegion('PH')}
                                className={`text-sm font-medium transition-colors ${region === 'PH' ? 'text-[#111111] border-b-2 border-[#FFD646]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                🇵🇭 Philippines
                            </button>
                            <button
                                onClick={() => setRegion('EU')}
                                className={`text-sm font-medium transition-colors ${region === 'EU' ? 'text-[#111111] border-b-2 border-[#FFD646]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                🇪🇺 Europe
                            </button>
                        </div>

                        <p className="text-lg mb-8 max-w-2xl mx-auto text-[#666666]">
                            Start with a 14-day free trial. Cancel anytime. No credit card required.
                        </p>

                        <div className="flex items-center justify-center mb-10 rounded-full p-1 border border-[#E6E2D6] bg-white shadow-sm">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-[#111111] text-white shadow-md' : 'text-gray-500 hover:text-[#111111]'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${billingCycle === 'annual' ? 'bg-[#111111] text-white shadow-md' : 'text-gray-500 hover:text-[#111111]'}`}
                            >
                                Annual
                                <span className="absolute -top-3 -right-6 bg-[#FFD646] text-[9px] text-black px-1.5 py-0.5 rounded-md font-bold">
                                    Save 16%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div
                        className="group relative overflow-hidden overflow-x-auto rounded-[2rem] bg-[#111111] border border-white/10 shadow-2xl"
                    >
                        <div className={`min-w-[1000px] grid grid-cols-${region === 'PH' ? '5' : '3'} divide-x divide-white/5 relative z-10 text-sm text-gray-400`}>
                            {/* Labels Column */}
                            <div className="flex flex-col bg-white/5 sticky left-0 z-20 backdrop-blur-md">
                                <div className="h-10 border-b border-white/5"></div>
                                <div className="p-6 h-40 flex flex-col justify-end pb-4 border-b border-white/5">
                                    <h3 className="text-xl font-semibold text-white tracking-tight">
                                        Compare Plans
                                    </h3>
                                    <p className="text-xs mt-2 text-gray-500">
                                        All plans include core features.
                                    </p>
                                </div>
                                <div className="px-6 py-4 h-16 flex items-center border-b border-white/5 font-medium text-white">
                                    Target Kitchen
                                </div>
                                <div className="px-6 py-4 h-16 flex items-center border-b border-white/5 font-medium">
                                    Platform Access
                                </div>
                                <div className="px-6 py-4 h-16 flex items-center border-b border-white/5 font-medium">
                                    Offline Mode
                                </div>
                                <div className="px-6 py-4 h-16 flex items-center border-b border-white/5 font-medium">
                                    Security
                                </div>
                                <div className="px-6 py-4 h-24 flex items-center border-b border-white/5"></div>
                            </div>

                            {/* Plan Columns */}
                            {pricingData[region].map((plan, i) => (
                                <div key={i} className={`flex flex-col relative ${plan.highlight ? 'bg-white/5' : ''}`}>
                                    {plan.highlight && (
                                        <div className="absolute inset-0 border-x border-t border-[#FFD646]/20 pointer-events-none"></div>
                                    )}
                                    <div className={`h-10 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest border-b border-white/5 ${plan.highlight ? 'bg-[#FFD646]/10 text-[#FFD646]' : 'bg-white/5 text-gray-400'}`}>
                                        {plan.name}
                                    </div>
                                    <div className={`h-40 p-6 flex flex-col items-center justify-center border-b border-white/5 relative`}>
                                        <div className="text-3xl font-bold text-white">
                                            {billingCycle === 'monthly' ? plan.monthly : plan.annual}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">/{billingCycle === 'monthly' ? 'month' : 'year'}</div>
                                    </div>
                                    <div className="h-16 px-4 flex items-center justify-center text-center text-xs text-white font-medium border-b border-white/5">
                                        {plan.target}
                                    </div>
                                    <div className="h-16 flex items-center justify-center border-b border-white/5">
                                        <Check className={`w-4 h-4 ${plan.highlight ? 'text-[#FFD646]' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="h-16 flex items-center justify-center border-b border-white/5">
                                        <Check className={`w-4 h-4 ${plan.highlight ? 'text-[#FFD646]' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="h-16 flex items-center justify-center border-b border-white/5">
                                        <Lock className={`w-3 h-3 ${plan.highlight ? 'text-[#FFD646]' : 'text-gray-500'}`} />
                                    </div>
                                    <div className="h-24 p-4 flex items-center justify-center border-b border-white/5 relative z-10">
                                        <button onClick={handleEnter} className={`w-full py-2.5 rounded-full text-xs font-bold transition-colors ${plan.highlight ? 'bg-[#FFD646] text-black hover:bg-[#FFC920] shadow-lg shadow-yellow-500/20' : 'border border-white/20 text-white hover:bg-white/10'}`}>
                                            {plan.btnText}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-[#666666]">
                        <p className="mb-2">
                            <span className="font-semibold">Payment Methods:</span>
                            GCash, Maya, BDO, BPI, UnionBank, Visa, Mastercard, PayPal
                        </p>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section id="faq" className="py-24 bg-white border-b border-[#E6E2D6]">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Main Card Container */}
                    <div className="md:p-10 rounded-[2.5rem] pt-6 pr-6 pb-6 pl-6">
                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#E6E2D6] bg-white text-[#111111]">
                                    <ChefHat className="w-6 h-6" />
                                </span>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111111]">
                                        KostKitchen — Help &amp; FAQs
                                    </h2>
                                    <p className="mt-1 text-sm text-[#666666]">
                                        Everything you need to know about getting started.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Grid */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                            {/* Item 1 */}
                            <details className="group rounded-2xl border border-[#E6E2D6] bg-white p-4 md:p-5 [&_svg]:open:rotate-45 transition-all hover:border-[#FFD646]" open>
                                <summary className="flex w-full items-center justify-between gap-4 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                    <span className="text-base md:text-lg font-semibold leading-6 tracking-tight text-[#111111]">
                                        How long does setup take?
                                    </span>
                                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6E2D6] bg-[#F8F6F1] group-hover:bg-[#FFD646] transition-colors">
                                        <Plus className="w-4 h-4 text-[#111111] transition-transform duration-200" />
                                    </span>
                                </summary>
                                <div className="mt-3 text-sm leading-6 text-[#666666]">
                                    Most kitchens are fully operational within 48 hours. Our
                                    onboarding team handles your menu digitization and supplier
                                    connection for you.
                                </div>
                            </details>

                            {/* Item 2 */}
                            <details className="group rounded-2xl border border-[#E6E2D6] bg-white p-4 md:p-5 [&_svg]:open:rotate-45 transition-all hover:border-[#FFD646]">
                                <summary className="flex w-full items-center justify-between gap-4 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                    <span className="text-base md:text-lg font-semibold leading-6 tracking-tight text-[#111111]">
                                        Do I need specific hardware?
                                    </span>
                                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6E2D6] bg-[#F8F6F1] group-hover:bg-[#FFD646] transition-colors">
                                        <Plus className="w-4 h-4 text-[#111111] transition-transform duration-200" />
                                    </span>
                                </summary>
                                <div className="mt-3 text-sm leading-6 text-[#666666]">
                                    KostKitchen works on any tablet, laptop, or smartphone. No
                                    proprietary hardware is required, though we recommend
                                    kitchen-grade rugged cases.
                                </div>
                            </details>

                            {/* Item 3 */}
                            <details className="group rounded-2xl border border-[#E6E2D6] bg-white p-4 md:p-5 [&_svg]:open:rotate-45 transition-all hover:border-[#FFD646]">
                                <summary className="flex w-full items-center justify-between gap-4 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                    <span className="text-base md:text-lg font-semibold leading-6 tracking-tight text-[#111111]">
                                        Can I manage multiple locations?
                                    </span>
                                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6E2D6] bg-[#F8F6F1] group-hover:bg-[#FFD646] transition-colors">
                                        <Plus className="w-4 h-4 text-[#111111] transition-transform duration-200" />
                                    </span>
                                </summary>
                                <div className="mt-3 text-sm leading-6 text-[#666666]">
                                    Yes, our Enterprise plan allows for centralized management of
                                    unlimited locations, with aggregate reporting and transfer
                                    management.
                                </div>
                            </details>

                            {/* Item 4 */}
                            <details className="group rounded-2xl border border-[#E6E2D6] bg-white p-4 md:p-5 [&_svg]:open:rotate-45 transition-all hover:border-[#FFD646]">
                                <summary className="flex w-full items-center justify-between gap-4 text-left cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                    <span className="text-base md:text-lg font-semibold leading-6 tracking-tight text-[#111111]">
                                        Is there a contract?
                                    </span>
                                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6E2D6] bg-[#F8F6F1] group-hover:bg-[#FFD646] transition-colors">
                                        <Plus className="w-4 h-4 text-[#111111] transition-transform duration-200" />
                                    </span>
                                </summary>
                                <div className="mt-3 text-sm leading-6 text-[#666666]">
                                    No, all our plans are month-to-month. You can upgrade,
                                    downgrade, or cancel your subscription at any time with no
                                    penalties.
                                </div>
                            </details>
                        </div>

                        {/* Footer CTA */}
                        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E6E2D6] bg-white p-4 sm:flex-row">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E2D6] bg-[#F8F6F1]">
                                    <HelpCircle className="w-5 h-5 text-[#111111]" />
                                </span>
                                <p className="text-sm text-[#666666]">
                                    Still have a question? We're here to help.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="inline-flex items-center gap-2 rounded-full border border-[#E6E2D6] bg-white px-4 py-2 text-sm font-medium text-[#111111] hover:bg-[#F8F6F1] transition-colors">
                                    <MessageSquare className="w-4 h-4" />
                                    Contact Support
                                </button>
                                <a href="#" className="inline-flex items-center rounded-full bg-[#FFD646] px-4 py-2 text-sm font-medium text-[#111111] hover:bg-[#FFC920] shadow-sm transition-colors">
                                    Ask a Question
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* READY TO RUN A SMARTER KITCHEN (UPDATED DESIGN) */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto relative overflow-hidden ring-1 ring-white/10 bg-[#111111] rounded-[3rem]">
                    {/* Background */}
                    <div className="relative">
                        <div className="absolute inset-0 z-0">
                            <img src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80" alt="Kitchen Background" className="h-full w-full object-cover opacity-30 mix-blend-overlay" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#111111] via-[#111111]/80 to-transparent"></div>
                            {/* Decorative Glows */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FFD646]/10 rounded-full blur-3xl"></div>
                        </div>

                        {/* Content */}
                        <div className="relative z-10 sm:p-12 md:p-20 p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                                {/* Form Card (Col 5) */}
                                <div className="lg:col-span-5 order-last lg:order-first">
                                    <div className="rounded-3xl bg-[#F3EFE0] ring-1 ring-white/10 shadow-2xl p-6 sm:p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <p className="text-[11px] text-[#666666] font-medium uppercase tracking-wide">Sales &amp; Support</p>
                                                <h3 className="mt-1 text-2xl font-semibold tracking-tight text-[#111111]">
                                                    Get Started
                                                </h3>
                                            </div>
                                            <div className="h-10 w-10 rounded-xl bg-[#111111] text-white flex items-center justify-center">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <form action="#" method="POST" className="space-y-4">
                                            <div>
                                                <label htmlFor="ct-name" className="block text-xs font-medium text-[#666666] mb-1">Your Name<span className="text-red-500"> *</span></label>
                                                <input id="ct-name" name="name" type="text" required placeholder="Marco" className="w-full px-4 py-3 text-sm rounded-xl ring-1 ring-black/5 focus:ring-2 focus:ring-[#111111] outline-none bg-white placeholder:text-gray-400" />
                                            </div>
                                            <div>
                                                <label htmlFor="ct-email" className="block text-xs font-medium text-[#666666] mb-1">Email Address<span className="text-red-500"> *</span></label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input id="ct-email" name="email" type="email" required placeholder="owner@business.com" className="w-full pl-10 pr-4 py-3 text-sm rounded-xl ring-1 ring-black/5 focus:ring-2 focus:ring-[#111111] outline-none bg-white placeholder:text-gray-400" />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="ct-msg" className="block text-xs font-medium text-[#666666] mb-1">How can we help?</label>
                                                <textarea id="ct-msg" name="message" rows={3} placeholder="Tell us about your kitchen..." className="w-full px-4 py-3 text-sm rounded-xl ring-1 ring-black/5 focus:ring-2 focus:ring-[#111111] outline-none bg-white placeholder:text-gray-400 resize-none"></textarea>
                                            </div>
                                            <button type="submit" className="w-full flex items-center justify-center rounded-xl bg-[#111111] text-white px-6 py-3.5 text-sm font-medium hover:bg-black/80 transition-all shadow-lg shadow-gray-400/20 group">
                                                Send Request
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            <p className="text-[10px] text-center text-[#888888] mt-2">By submitting, you agree to our Terms &amp; Privacy Policy.</p>
                                        </form>
                                    </div>
                                </div>

                                {/* Text Content (Col 7) */}
                                <div className="lg:col-span-7 pt-4">
                                    <h2 className="text-4xl md:text-6xl font-semibold text-white tracking-tight leading-[1.05] mb-6">
                                        Ready to Run a <br />
                                        <span className="text-[#FFD646]">Smarter Kitchen?</span>
                                    </h2>
                                    <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
                                        Join 500+ business owners who have taken control of their food costs. Whether you need a demo or have specific questions about bulk pricing, we're here.
                                    </p>

                                    {/* Highlights */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-[#FFD646] shrink-0">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm mb-1">Profit Analytics</p>
                                                <p className="text-gray-500 text-xs leading-relaxed">Track your daily gross profit and net margins in real-time.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-[#FFD646] shrink-0">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm mb-1">Cancel Anytime</p>
                                                <p className="text-gray-500 text-xs leading-relaxed">No long-term contracts. We earn your business every month.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Direct Contact Card */}
                                    <div className="inline-flex items-center gap-4 rounded-2xl bg-white/5 backdrop-blur ring-1 ring-white/10 p-3 pr-5 hover:bg-white/10 transition-colors">
                                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" alt="Support Lead" className="h-12 w-12 rounded-xl object-cover border border-white/10" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">Success Lead</p>
                                            <p className="text-white font-medium text-sm truncate">Ava Kim</p>
                                        </div>
                                        <a href="#" className="ml-2 inline-flex items-center gap-2 rounded-xl bg-white text-[#111111] px-3 py-2 text-xs font-bold hover:bg-gray-100 transition-colors">
                                            Chat Now
                                            <MessageCircle className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-[#E6E2D6] pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-white">
                                    <ChefHat className="w-4 h-4" />
                                </div>
                                <span className="font-semibold tracking-tight text-[#111111]">
                                    KostKitchen
                                </span>
                            </div>
                            <p className="text-sm text-[#666666] leading-relaxed mb-6">
                                The operating system for modern, data-driven commercial kitchens.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-[#F8F6F1] flex items-center justify-center hover:bg-[#F3EFE0] transition-colors">
                                    <Twitter className="w-4 h-4 text-[#111111]" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-[#F8F6F1] flex items-center justify-center hover:bg-[#F3EFE0] transition-colors">
                                    <Instagram className="w-4 h-4 text-[#111111]" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-[#F8F6F1] flex items-center justify-center hover:bg-[#F3EFE0] transition-colors">
                                    <Linkedin className="w-4 h-4 text-[#111111]" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[#111111] mb-6">Product</h4>
                            <ul className="space-y-4 text-sm text-[#666666]">
                                <li><a href="#features" className="hover:text-[#111111] transition-colors">Features</a></li>
                                <li><a href="#how-it-works" className="hover:text-[#111111] transition-colors">How It Works</a></li>
                                <li><a href="#platform" className="hover:text-[#111111] transition-colors">Platform</a></li>
                                <li><a href="#pricing" className="hover:text-[#111111] transition-colors">Pricing</a></li>
                                <li><a href="#faq" className="hover:text-[#111111] transition-colors">FAQs</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[#111111] mb-6">Company</h4>
                            <ul className="space-y-4 text-sm text-[#666666]">
                                <li><a href="#" className="hover:text-[#111111] transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-[#111111] transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-[#111111] transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-[#111111] transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-[#111111] mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm text-[#666666]">
                                <li><a href="#" className="hover:text-[#111111] transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-[#111111] transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-[#111111] transition-colors">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-[#E6E2D6] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-[#888888]">
                            &copy; 2025 KostKitchen By ZNYTH LABS
                        </div>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-medium text-green-700">All systems operational</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
