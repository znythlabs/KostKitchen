import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Order {
    id: string;
    name: string;
    table: string;
    orderId: string;
    status: 'Cooking' | 'Ready' | 'Completed';
}

const ActiveOrdersMockup = () => {
    const [orders, setOrders] = useState<Order[]>([
        { id: '1', name: 'Vinicius Bayu', table: 'Table 3', orderId: '#12532', status: 'Cooking' },
        { id: '2', name: 'Cheryl Arema', table: 'Table 3', orderId: '#12532', status: 'Ready' },
        { id: '3', name: 'Kylian Rex', table: 'Table 4', orderId: '#12531', status: 'Completed' },
        { id: '4', name: 'Marco Polo', table: 'Table 1', orderId: '#12535', status: 'Cooking' },
        { id: '5', name: 'Sarah Chen', table: 'Table 2', orderId: '#12536', status: 'Ready' },
        { id: '6', name: 'Mike Ross', table: 'Table 5', orderId: '#12537', status: 'Cooking' },
    ]);
    const constraintsRef = useRef(null);

    return (
        <div className="w-full overflow-hidden" ref={constraintsRef}>
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-lg text-[#303030]">Active Orders</h3>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-100"></div>
                    <div className="w-2 h-2 rounded-full bg-green-100"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-100"></div>
                </div>
            </div>

            <motion.div
                className="flex gap-4 cursor-grab active:cursor-grabbing pb-4 pl-2"
                drag="x"
                dragConstraints={constraintsRef}
                dragElastic={0.2}
            >
                {orders.map((order) => (
                    <motion.div
                        key={order.id}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 min-w-[200px] flex flex-col justify-between shrink-0 hover:shadow-md transition-shadow select-none"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div>
                            <h4 className="font-bold text-zinc-900 text-sm">{order.name}</h4>
                            <p className="text-[10px] text-zinc-500 mt-1">{order.table} • {order.orderId}</p>
                        </div>
                        <div className="mt-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${order.status === 'Cooking' ? 'bg-red-50 text-red-500' :
                                order.status === 'Ready' ? 'bg-green-50 text-green-500' :
                                    'bg-blue-50 text-blue-500'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

interface LandingPageProps {
    onEnterApp: () => void;
}

export const LandingPage = ({ onEnterApp }: LandingPageProps) => {
    const [currency, setCurrency] = useState<'PHP' | 'EUR'>('PHP');
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, -50]);

    return (
        <div className="font-sans antialiased text-[#303030] scroll-smooth w-full min-h-screen relative overflow-x-hidden">
            {/* Inline styles for custom animations */}
            <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .blob-float { animation: float 6s ease-in-out infinite; }
        .blob-float-delay { animation: float 6s ease-in-out 3s infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 9999px; }
        .landing-bg {
            background-image: linear-gradient(150deg, #E3E5E6 0%, #E3E5E6 30%, #FAEEB9 75%, #FCEBB6 100%);
            background-attachment: fixed;
        }

        /* Testimonial Fan Styles */
        .testimonial-cards-fan {
          perspective: 2000px;
        }
        .testimonial-card {
          position: absolute;
          left: 50%;
          top: 50%;
          transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
          will-change: transform, opacity, box-shadow;
          transform-origin: center center;
        }
        .card-1 {
          z-index: 60;
          transform: translate(-50%, -50%) scale(1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          filter: brightness(1.1);
        }
        .card-2 {
          z-index: 50;
          transform: translate(-50%, -50%) translate(-160px, 10px) rotate(-8deg) scale(0.95);
          opacity: 0.9;
        }
        .card-3 {
          z-index: 50;
          transform: translate(-50%, -50%) translate(160px, 10px) rotate(8deg) scale(0.95);
          opacity: 0.9;
        }
        .card-4 {
          z-index: 40;
          transform: translate(-50%, -50%) translate(-300px, 40px) rotate(-16deg) scale(0.9);
          opacity: 0.8;
        }
        .card-5 {
          z-index: 40;
          transform: translate(-50%, -50%) translate(300px, 40px) rotate(16deg) scale(0.9);
          opacity: 0.8;
        }
        .card-6 {
          z-index: 30;
          transform: translate(-50%, -50%) translateY(-20px) scale(0.88);
          opacity: 0.6;
          filter: brightness(0.7);
        }
        .group:hover .testimonial-card {
          z-index: 50;
          opacity: 1;
          filter: brightness(1);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .group:hover .card-2 { transform: translate(-50%, -50%) translate(-105%, -55%) rotate(0deg) scale(1); }
        .group:hover .card-1 { transform: translate(-50%, -50%) translate(0%, -55%) rotate(0deg) scale(1); }
        .group:hover .card-3 { transform: translate(-50%, -50%) translate(105%, -55%) rotate(0deg) scale(1); }
        .group:hover .card-4 { transform: translate(-50%, -50%) translate(-105%, 55%) rotate(0deg) scale(1); }
        .group:hover .card-6 { transform: translate(-50%, -50%) translate(0%, 55%) rotate(0deg) scale(1); }
        .group:hover .card-5 { transform: translate(-50%, -50%) translate(105%, 55%) rotate(0deg) scale(1); }

        @media (max-width: 1024px) {
          .testimonial-cards-fan {
            height: auto !important;
            display: flex;
            flex-direction: column;
            padding: 4rem 1rem;
            gap: 1.5rem;
          }
          .testimonial-card {
            position: relative !important;
            left: auto !important;
            top: auto !important;
            transform: none !important;
            width: 100% !important;
            max-width: 28rem !important;
            opacity: 1 !important;
          }
          .group:hover .testimonial-card { transform: none !important; }
        }
      `}</style>
            <div className="landing-bg fixed inset-0 -z-10"></div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-white/40 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#303030] rounded-lg flex items-center justify-center text-white">
                            <iconify-icon icon="lucide:chef-hat" width="18"></iconify-icon>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-[#303030]">
                            KOST
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
                        <a href="#" className="hover:text-[#303030] transition-colors">Home</a>
                        <a href="#features" className="hover:text-[#303030] transition-colors">
                            Features
                        </a>
                        <a href="#how-it-works" className="hover:text-[#303030] transition-colors">
                            How it Works
                        </a>
                        <a href="#pricing" className="hover:text-[#303030] transition-colors">
                            Pricing
                        </a>
                    </div>

                    <div>
                        <button onClick={onEnterApp} className="bg-[#FCD34D] hover:bg-yellow-400 text-[#303030] text-sm font-semibold py-3 px-6 rounded-lg transition-all shadow-sm">
                            Try for Free
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-0 px-6 relative">
                {/* Floating Icons/Blobs */}
                <div className="absolute top-32 left-10 md:left-32 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center blob-float hidden md:flex">
                    <span className="text-2xl">🍔</span>
                </div>
                <div className="absolute top-40 right-10 md:right-32 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center blob-float-delay hidden md:flex">
                    <span className="text-xl">🥗</span>
                </div>
                <div className="absolute top-80 left-20 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center blob-float-delay hidden md:flex">
                    <span className="text-lg">☕</span>
                </div>

                <div className="max-w-4xl mx-auto text-center mb-16 relative z-10">
                    <h1 className="text-6xl md:text-7xl tracking-tight text-zinc-900 mb-8 leading-[1.1] font-medium">
                        Kost Kitchen For All Your
                        <br />
                        Restaurant Needs
                    </h1>
                    <p className="text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Say goodbye to manual order taking and complicated billing processes
                        with our user-friendly POS system.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={onEnterApp} className="bg-[#FCD34D] hover:bg-yellow-400 text-[#303030] font-semibold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto">
                            Get Started
                        </button>
                        <button className="bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 font-semibold py-4 px-10 rounded-full transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md w-full sm:w-auto hover:-translate-y-1">
                            <iconify-icon icon="lucide:play-circle" width="20"></iconify-icon>
                            Watch Video
                        </button>
                    </div>
                </div>

                {/* Dashboard Mockup */}
                <motion.div
                    className="max-w-6xl mx-auto relative z-20 px-2 md:px-0 mt-10 -mb-32"
                    style={{ y }}
                >
                    <div className="rounded-[2.5rem] p-3 bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl shadow-stone-200/50 relative z-20">
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
                                        <iconify-icon icon="lucide:layout-grid" width="16"></iconify-icon>
                                        Dashboard
                                    </div>
                                    <div className="h-10 w-full hover:bg-black/5 text-[#666666] rounded-xl flex items-center px-4 gap-3 text-sm font-medium transition-colors">
                                        <iconify-icon icon="lucide:utensils" width="16"></iconify-icon>
                                        Menu Costs
                                    </div>
                                    <div className="h-10 w-full hover:bg-black/5 text-[#666666] rounded-xl flex items-center px-4 gap-3 text-sm font-medium transition-colors">
                                        <iconify-icon icon="lucide:box" width="16"></iconify-icon>
                                        Inventory
                                    </div>
                                    <div className="h-10 w-full hover:bg-black/5 text-[#666666] rounded-xl flex items-center px-4 gap-3 text-sm font-medium transition-colors">
                                        <iconify-icon icon="lucide:bar-chart-3" width="16"></iconify-icon>
                                        Analytics
                                    </div>
                                    <div className="h-10 w-full hover:bg-black/5 text-[#666666] rounded-xl flex items-center px-4 gap-3 text-sm font-medium transition-colors mt-8">
                                        <iconify-icon icon="lucide:settings" width="16"></iconify-icon>
                                        Settings
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-3xl font-light text-[#111111] tracking-tight">
                                        Welcome in,
                                        <span className="font-medium"> Chef Marco</span>
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <span className="text-xs font-medium">Kitchen Live</span>
                                        </div>
                                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                                            <iconify-icon icon="lucide:bell" width="16" className="text-gray-500"></iconify-icon>
                                        </button>
                                        <img src="https://i.pravatar.cc/150?img=12" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Profile" />
                                    </div>
                                </div>

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
                                                <iconify-icon icon="lucide:trending-down" width="16" className="text-gray-400"></iconify-icon>
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
                                                <iconify-icon icon="lucide:alert-circle" width="16" className="text-gray-400"></iconify-icon>
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
                                                Labor Est.
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                <iconify-icon icon="lucide:users" width="16" className="text-gray-400"></iconify-icon>
                                            </div>
                                        </div>
                                        <div className="text-2xl font-semibold text-[#111111] mb-2">
                                            18%
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium">
                                            <span className="text-gray-400">Of revenue today</span>
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
                                            <iconify-icon icon="lucide:arrow-up-right" width="16" className="text-gray-300"></iconify-icon>
                                        </div>
                                        <div className="h-48 flex items-end justify-between gap-2 px-2">
                                            <div className="w-full bg-[#FFD646] rounded-t-lg h-[40%] group hover:bg-[#FFD646] transition-colors relative">
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                                                    Mon
                                                </div>
                                            </div>
                                            <div className="w-full bg-[#FFD646] rounded-t-lg h-[55%] group hover:bg-[#FFD646] transition-colors relative">
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                                                    Tue
                                                </div>
                                            </div>
                                            <div className="w-full bg-[#FFD646] rounded-t-lg h-[45%] group hover:bg-[#FFD646] transition-colors relative">
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                                                    Wed
                                                </div>
                                            </div>
                                            <div className="w-full bg-[#FFD646] rounded-t-lg h-[70%] group hover:bg-[#FFD646] transition-colors relative">
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                                                    Thu
                                                </div>
                                            </div>
                                            {/* Highlighted Bar */}
                                            <div className="w-full bg-[#303030] border-2 border-[#E6E2D6] rounded-t-lg h-[85%] relative shadow-lg -mt-2 z-10">
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#111111] text-white text-[10px] px-2 py-1 rounded">
                                                    ₱24k
                                                </div>
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#111111] font-bold">
                                                    Fri
                                                </div>
                                            </div>
                                            <div className="w-full bg-[#FFD646] rounded-t-lg h-[60%] group hover:bg-[#FFD646] transition-colors relative">
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                                                    Sat
                                                </div>
                                            </div>
                                            <div className="w-full bg-[#FFD646] rounded-t-lg h-[75%] group hover:bg-[#FFD646] transition-colors relative">
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                                                    Sun
                                                </div>
                                            </div>
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
                                    {/* Action Required (Black Card) - UPDATED CONTENT */}
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
                                                    <td className="py-3 text-right font-medium">₱2,800</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Stats Bar */}
            <section className="bg-[#303030] pt-48 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
                        <div className="text-center md:text-left">
                            <h3 className="text-3xl font-bold mb-1">20K+</h3>
                            <p className="text-sm opacity-80">Restaurants already use Kost</p>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-3xl font-bold mb-1">12</h3>
                            <p className="text-sm opacity-80">Industry Awards</p>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-3xl font-bold mb-1">32K+</h3>
                            <p className="text-sm opacity-80">Active Users</p>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-3xl font-bold mb-1">4.8</h3>
                            <p className="text-sm opacity-80">Average Review Score</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Logos */}
            <section className="py-12 bg-zinc-50 border-b border-zinc-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-40 grayscale">
                    <div className="flex items-center gap-2 text-xl font-bold">
                        <iconify-icon icon="lucide:coffee"></iconify-icon>
                        KOPI
                    </div>
                    <div className="flex items-center gap-2 text-xl font-bold">
                        <iconify-icon icon="lucide:utensils"></iconify-icon>
                        HAUS!
                    </div>
                    <div className="flex items-center gap-2 text-xl font-bold">
                        <iconify-icon icon="lucide:croissant"></iconify-icon>
                        BAKERY
                    </div>
                    <div className="flex items-center gap-2 text-xl font-bold">
                        <iconify-icon icon="lucide:wine"></iconify-icon>
                        BISTRO
                    </div>
                    <div className="flex items-center gap-2 text-xl font-bold">
                        <iconify-icon icon="lucide:chef-hat"></iconify-icon>
                        KITCHEN
                    </div>
                </div>
            </section>

            {/* 3 Card Features */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl tracking-tight text-zinc-900 mb-4 font-semibold">
                            Manage restaurant easily with Kost
                        </h2>
                        <p className="text-zinc-500 max-w-2xl mx-auto">
                            With Kost you'll experience a seamless and hassle-free restaurant
                            management experience.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* ... content for cards remains same, implicit in next lines ... */}
                        {/* Card 1 */}
                        <div>
                            <div className="bg-[#FCD34D] rounded-[2.5rem] p-8 h-72 mb-6 relative overflow-hidden flex items-end justify-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border border-white/40">
                                <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-zinc-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="h-2 w-16 bg-zinc-100 rounded mb-2"></div>
                                    <div className="space-y-2">
                                        <div className="h-8 bg-zinc-50 rounded border border-zinc-100"></div>
                                        <div className="h-8 bg-zinc-50 rounded border border-zinc-100"></div>
                                        <div className="h-8 bg-[#FCD34D]/30 rounded border border-[#FCD34D]/50 flex items-center justify-center text-[10px] font-bold">
                                            Proceed Order -&gt;
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-2 text-center">
                                User-Friendly Interface
                            </h3>
                            <p className="text-sm text-zinc-500 text-center leading-relaxed px-4">
                                Ensuring restaurant staff can quickly navigate the application
                                without extensive training.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div>
                            <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white/40 shadow-sm p-8 h-72 mb-6 relative overflow-hidden flex items-center justify-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200"></div>
                                <div className="bg-white rounded-xl shadow-lg p-3 w-3/4 relative z-10 transition-transform duration-300 group-hover:scale-105">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-50">
                                        <div className="w-6 h-6 bg-[#303030] rounded text-white text-[10px] flex items-center justify-center">
                                            A4
                                        </div>
                                        <div>
                                            <div className="h-1.5 w-12 bg-zinc-200 rounded mb-0.5"></div>
                                            <div className="h-1 w-8 bg-zinc-100 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="h-1.5 w-full bg-zinc-100 rounded"></div>
                                        <div className="h-1.5 w-full bg-zinc-100 rounded"></div>
                                        <div className="h-1.5 w-2/3 bg-zinc-100 rounded"></div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-2 text-center">
                                Intuitive Order Management
                            </h3>
                            <p className="text-sm text-zinc-500 text-center leading-relaxed px-4">
                                Helps restaurant staff take and process customer orders
                                efficiently and improving CS.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div>
                            <div className="bg-[#FCD34D] rounded-3xl p-6 h-64 mb-6 relative overflow-hidden flex items-center justify-center group">
                                <div className="bg-[#303030] rounded-xl shadow-lg p-4 w-3/4 text-white relative transition-transform duration-300 group-hover:rotate-3">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="text-xs opacity-80">New Orders</div>
                                        <iconify-icon icon="lucide:bell" width="14"></iconify-icon>
                                    </div>
                                    <div className="text-4xl font-bold mb-2">86</div>
                                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#FCD34D] w-2/3"></div>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-2 text-center">
                                Real-time Analytics &amp; Reporting
                            </h3>
                            <p className="text-sm text-zinc-500 text-center leading-relaxed px-4">
                                Empower management to identify areas for improvement and optimize
                                operations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Split: Track Order */}
            <section className="py-24 overflow-hidden bg-[#FFFBF0]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            {/* Background Shape */}
                            <div className="absolute -inset-4 bg-zinc-100 rounded-[3rem] -z-10 transform rotate-[-3deg]"></div>

                            {/* Mockup Container */}
                            <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white/40 shadow-sm p-6 relative max-w-sm mx-auto md:mr-auto">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 bg-[#303030] rounded-lg flex items-center justify-center text-white font-bold">
                                            A4
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-900">Ariel Hikmat</h4>
                                            <p className="text-xs text-zinc-500">Order #325 • Dine In</p>
                                        </div>
                                    </div>
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded">
                                        Ready
                                    </span>
                                </div>

                                <div className="space-y-4 border-t border-b border-zinc-100 py-4 mb-4">
                                    <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white/40 shadow-sm p-6">
                                        <span className="text-zinc-600 block">Scrambled Eggs</span>
                                        <span className="font-semibold text-zinc-900">$16.99</span>
                                    </div>
                                    <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white/40 shadow-sm p-6">
                                        <span className="text-zinc-600 block">Smoked Salmon</span>
                                        <span className="font-semibold text-zinc-900">$18.99</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600">Belgian Waffles</span>
                                        <span className="font-semibold text-zinc-900">$38.98</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <span className="font-bold text-zinc-900">Total</span>
                                    <span className="font-bold text-xl text-zinc-900">$74.96</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600">
                                        See Details
                                    </button>
                                    <button className="py-2 rounded-lg bg-[#FCD34D] text-xs font-semibold text-[#303030]">
                                        Pay Bills
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 mb-6">
                                Easily track order
                                <br />
                                status with Kost
                            </h2>
                            <div className="space-y-8">
                                <div className="flex gap-5 group">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <iconify-icon icon="lucide:clock" width="24" className="text-[#303030]"></iconify-icon>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-zinc-900 mb-1">
                                            Real-time Updates
                                        </h5>
                                        <p className="text-sm text-zinc-600 leading-relaxed">
                                            Stay informed about every stage of the order fulfillment
                                            process instantly.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-5 group">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <iconify-icon icon="lucide:list-checks" width="24" className="text-[#303030]"></iconify-icon>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-zinc-900 mb-1">Smart Queue</h5>
                                        <p className="text-sm text-zinc-600 leading-relaxed">
                                            Organizes orders into a clear queue showing in-progress and
                                            ready items.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-5 group">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <iconify-icon icon="lucide:monitor-smartphone" width="24" className="text-[#303030]"></iconify-icon>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-zinc-900 mb-1">
                                            KDS Integration
                                        </h5>
                                        <p className="text-sm text-zinc-600 leading-relaxed">
                                            Streamlines communication between waiters and kitchen staff
                                            seamlessly.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button className="mt-8 bg-[#FCD34D] hover:bg-yellow-400 text-[#303030] font-semibold py-3 px-6 rounded-lg transition-all shadow-sm flex items-center gap-2">
                                Learn More
                                <iconify-icon icon="lucide:arrow-right" width="16"></iconify-icon>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Split: Process Orders (Tabs) */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-start">

                        <div className="order-2 md:order-1">
                            <div className="mb-10">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 mb-4">
                                    Make process orders
                                    <br />
                                    easily with Kost
                                </h2>
                                <p className="text-zinc-500 text-sm">
                                    Discover the power of our advanced POS Application, Kost POS
                                    Application Making order processing easily and efficient for
                                    your restaurant.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="group bg-[#303030] text-white p-6 rounded-2xl cursor-pointer shadow-lg transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white/10 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm">
                                            01
                                        </div>
                                        <span className="font-bold text-lg">Digital Menu Boards</span>
                                    </div>
                                    <p className="text-sm opacity-80 mt-2 ml-14">
                                        The dynamic menus allowing the restaurant to make changes as
                                        needed without printing new menus.
                                    </p>
                                </div>

                                <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white/40 shadow-sm overflow-hidden relative z-10 max-h-[600px] overflow-y-auto custom-scrollbar p-6 flex items-center gap-4 group hover:bg-zinc-50 cursor-pointer transition-all">
                                    <div className="bg-zinc-100 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-[#303030]/50 group-hover:text-[#303030] transition-colors">
                                        02
                                    </div>
                                    <span className="font-bold text-zinc-900">
                                        Table Management System
                                    </span>
                                </div>

                                <div className="group bg-white hover:bg-zinc-50 p-6 rounded-2xl cursor-pointer border border-zinc-100 transition-all flex items-center gap-4">
                                    <div className="bg-zinc-100 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-[#303030]/50 group-hover:text-[#303030] transition-colors">
                                        03
                                    </div>
                                    <span className="font-bold text-zinc-900">
                                        Inventory Management
                                    </span>
                                </div>

                                <div className="group bg-white hover:bg-zinc-50 p-6 rounded-2xl cursor-pointer border border-zinc-100 transition-all flex items-center gap-4">
                                    <div className="bg-zinc-100 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-[#303030]/50 group-hover:text-[#303030] transition-colors">
                                        04
                                    </div>
                                    <span className="font-bold text-zinc-900">
                                        Kitchen Display System Integration
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 md:order-2 relative">
                            <div className="bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden relative z-10 max-h-[600px] overflow-y-auto custom-scrollbar">
                                <div className="sticky top-0 bg-white p-4 border-b border-zinc-100 flex items-center justify-between z-20">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 hover:bg-zinc-100 rounded-lg">
                                            <iconify-icon icon="lucide:arrow-left"></iconify-icon>
                                        </button>
                                        <span className="font-bold text-zinc-900">Choose Menu</span>
                                    </div>
                                    <div className="bg-zinc-100 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm text-zinc-500 w-48">
                                        <iconify-icon icon="lucide:search" width="14"></iconify-icon>
                                        Search a dish
                                    </div>
                                </div>
                                <div className="flex h-[550px]">
                                    {/* Menu Categories */}
                                    <div className="w-32 bg-zinc-50 border-r border-zinc-100 p-3 space-y-2 flex-shrink-0">
                                        <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase">
                                            All Menu
                                        </div>
                                        <div className="bg-[#FCD34D] text-[#303030] font-semibold text-sm p-3 rounded-xl">
                                            Breakfast
                                        </div>
                                        <div className="text-zinc-500 font-medium text-sm p-3 rounded-xl hover:bg-zinc-100">
                                            Fastfood
                                        </div>
                                        <div className="text-zinc-500 font-medium text-sm p-3 rounded-xl hover:bg-zinc-100">
                                            Pasta
                                        </div>
                                        <div className="text-zinc-500 font-medium text-sm p-3 rounded-xl hover:bg-zinc-100">
                                            Soups
                                        </div>
                                    </div>
                                    {/* Grid */}
                                    <div className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-y-auto">
                                        {/* Item 1 */}
                                        <div className="border border-zinc-100 rounded-xl p-3 hover:shadow-lg transition-shadow">
                                            <div className="h-24 bg-zinc-100 rounded-lg mb-3 overflow-hidden relative">
                                                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop" className="w-full h-full object-cover" />
                                                <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                    Popular
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-sm text-zinc-900 mb-1">
                                                Scrambled Eggs
                                            </h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-zinc-900">$16.99</span>
                                                <button className="w-6 h-6 bg-[#303030] text-white rounded-full flex items-center justify-center">
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        {/* Item 2 */}
                                        <div className="border border-zinc-100 rounded-xl p-3 hover:shadow-lg transition-shadow">
                                            <div className="h-24 bg-zinc-100 rounded-lg mb-3 overflow-hidden">
                                                <img src="https://images.unsplash.com/photo-1551248429-40975aa4de74?w=300&h=200&fit=crop" className="w-full h-full object-cover" />
                                            </div>
                                            <h4 className="font-bold text-sm text-zinc-900 mb-1">
                                                Greek Yogurt
                                            </h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-zinc-900">$21.49</span>
                                                <div className="flex items-center gap-2">
                                                    <button className="w-6 h-6 bg-zinc-200 rounded-full flex items-center justify-center">
                                                        -
                                                    </button>
                                                    <span className="text-xs font-bold">1</span>
                                                    <button className="w-6 h-6 bg-[#303030] text-white rounded-full flex items-center justify-center">
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Item 3 */}
                                        <div className="border border-zinc-100 rounded-xl p-3 hover:shadow-lg transition-shadow">
                                            <div className="h-24 bg-zinc-100 rounded-lg mb-3 overflow-hidden">
                                                <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop" className="w-full h-full object-cover" />
                                            </div>
                                            <h4 className="font-bold text-sm text-zinc-900 mb-1">
                                                Veggie Omelette
                                            </h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-zinc-900">$17.09</span>
                                                <button className="w-6 h-6 bg-[#303030] text-white rounded-full flex items-center justify-center">
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        {/* Item 4 */}
                                        <div className="border border-zinc-100 rounded-xl p-3 hover:shadow-lg transition-shadow">
                                            <div className="h-24 bg-zinc-100 rounded-lg mb-3 overflow-hidden relative">
                                                <img src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&h=200&fit=crop" className="w-full h-full object-cover" />
                                                <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                    Hot
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-sm text-zinc-900 mb-1">
                                                Smoked Salmon
                                            </h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="font-bold text-zinc-900">$19.38</span>
                                                <button className="w-6 h-6 bg-[#303030] text-white rounded-full flex items-center justify-center">
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Bar */}
                                <div className="absolute bottom-4 left-4 right-4 bg-[#FCD34D] rounded-xl p-3 flex justify-between items-center shadow-lg cursor-pointer hover:bg-yellow-400 transition-colors">
                                    <span className="font-bold text-[#303030]">$57.86</span>
                                    <div className="flex items-center gap-1 font-bold text-[#303030] text-sm">
                                        Proceed Order
                                        <iconify-icon icon="lucide:arrow-right" width="16"></iconify-icon>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements behind */}
                            <div className="absolute -right-10 top-20 w-32 h-32 bg-[#FCD34D] rounded-full blur-3xl opacity-30 -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-semibold tracking-tight text-[#303030]">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-gray-500 mt-4 mb-8">
                        Choose the plan that fits your kitchen's size.
                    </p>
                    <div className="flex justify-center items-center gap-4">
                        <span className={`text-sm font-bold transition-colors ${currency === 'PHP' ? 'text-[#303030]' : 'text-gray-400'}`}>
                            Philippines (PHP)
                        </span>
                        <label className="relative inline-block w-14 h-8 cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={currency === 'EUR'}
                                onChange={() => setCurrency(prev => prev === 'PHP' ? 'EUR' : 'PHP')}
                            />
                            <span className="block bg-gray-300 w-14 h-8 rounded-full transition-colors duration-200 peer-checked:bg-[#303030]"></span>
                            <span className="absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-all duration-200 shadow-sm peer-checked:translate-x-6"></span>
                        </label>
                        <span className={`text-sm font-bold transition-colors ${currency === 'EUR' ? 'text-[#303030]' : 'text-gray-400'}`}>
                            Europe (EUR)
                        </span>
                    </div>
                </div>

                <div
                    className="group relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 rounded-3xl border border-white/40 bg-white/40 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden isolate"
                    onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        e.currentTarget.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
                        e.currentTarget.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
                    }}
                    style={{ '--mouse-x': '0px', '--mouse-y': '0px' } as React.CSSProperties}
                >
                    {/* Spotlight Overlay */}
                    <div
                        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                        style={{ background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(252, 211, 77, 0.15), transparent 40%)', zIndex: 0 }}
                    ></div>

                    {/* Micro */}
                    <div className="relative z-10 flex flex-col p-8 border-b border-gray-200/50 md:border-r lg:border-b-0">
                        <h3 className="text-lg font-semibold text-gray-600">Micro</h3>
                        <p className="text-xs text-gray-400 mt-1">Carinderia & Stalls</p>
                        <div className="my-6">
                            <span className="text-3xl font-semibold text-[#303030]">
                                {currency === 'PHP' ? '₱199' : '€5'}
                            </span>
                            <span className="text-sm text-gray-500">/mo</span>
                        </div>
                        <ul className="mb-8 space-y-3 flex-1 text-sm text-gray-600">
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-[#FCD34D]"></iconify-icon>
                                20 Recipes
                            </li>
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-[#FCD34D]"></iconify-icon>
                                Basic Costing
                            </li>
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-[#FCD34D]"></iconify-icon>
                                1 User
                            </li>
                        </ul>
                        <button className="w-full rounded-xl border border-gray-300 bg-white/50 py-2.5 text-sm font-medium text-[#303030] transition hover:border-[#FCD34D] hover:bg-white">
                            Start Free Trial
                        </button>
                    </div>

                    {/* Starter */}
                    <div className="relative z-10 flex flex-col p-8 border-b border-gray-200/50 lg:border-b-0 lg:border-r">
                        <h3 className="text-lg font-semibold text-gray-600">Starter</h3>
                        <p className="text-xs text-gray-400 mt-1">Small Restaurants</p>
                        <div className="my-6">
                            <span className="text-3xl font-semibold text-[#303030]">
                                {currency === 'PHP' ? '₱399' : '€9'}
                            </span>
                            <span className="text-sm text-gray-500">/mo</span>
                        </div>
                        <ul className="mb-8 space-y-3 flex-1 text-sm text-gray-600">
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-[#FCD34D]"></iconify-icon>
                                50 Recipes
                            </li>
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-[#FCD34D]"></iconify-icon>
                                Inventory Mgmt
                            </li>
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-[#FCD34D]"></iconify-icon>
                                2 Users
                            </li>
                        </ul>
                        <button className="w-full rounded-xl border border-gray-300 bg-white/50 py-2.5 text-sm font-medium text-[#303030] transition hover:border-[#FCD34D] hover:bg-white">
                            Start Free Trial
                        </button>
                    </div>

                    {/* Professional */}
                    <div className="relative z-10 flex flex-col p-8 border-b border-gray-200/50 md:border-r md:border-b-0 bg-[#FCD34D]/5">
                        <div className="absolute top-0 right-0 px-3 py-1 bg-[#FCD34D] text-[#303030] text-[10px] font-bold uppercase rounded-bl-xl">
                            Popular
                        </div>
                        <h3 className="text-lg font-bold text-[#303030]">Professional</h3>
                        <p className="text-xs text-gray-500 mt-1">Medium Restaurants</p>
                        <div className="my-6">
                            <span className="text-4xl font-semibold text-[#303030]">
                                {currency === 'PHP' ? '₱699' : '€19'}
                            </span>
                            <span className="text-sm text-gray-500">/mo</span>
                        </div>
                        <ul className="mb-8 space-y-3 flex-1 text-sm font-medium text-[#303030]">
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-green-600"></iconify-icon>
                                Unlimited Recipes
                            </li>
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-green-600"></iconify-icon>
                                Full Inventory
                            </li>
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-green-600"></iconify-icon>
                                VAT & PWD Support
                            </li>
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-green-600"></iconify-icon>
                                5 Users
                            </li>
                        </ul>
                        <button className="w-full rounded-xl bg-[#303030] py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-black hover:shadow-xl">
                            Start Free Trial
                        </button>
                    </div>

                    {/* Business */}
                    <div className="relative z-10 flex flex-col p-8">
                        <h3 className="text-lg font-semibold text-gray-600">Business</h3>
                        <p class="text-xs text-gray-400 mt-1">Multi-branch</p>
                        <div className="my-6">
                            <span className="text-3xl font-semibold text-[#303030]">
                                {currency === 'PHP' ? '₱1,499' : '€39'}
                            </span>
                            <span className="text-sm text-gray-500">/mo</span>
                        </div>
                        <ul className="mb-8 space-y-3 flex-1 text-sm text-gray-600">
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-[#FCD34D]"></iconify-icon>
                                Everything in Pro
                            </li>
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-[#FCD34D]"></iconify-icon>
                                Commissary Support
                            </li>
                            <li className="flex gap-2">
                                <iconify-icon icon="lucide:check" width="16" className="text-[#FCD34D]"></iconify-icon>
                                API Access
                            </li>
                        </ul>
                        <button className="w-full rounded-xl border border-gray-300 bg-white/50 py-2.5 text-sm font-medium text-[#303030] transition hover:border-[#FCD34D] hover:bg-white">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonials - Fan Layout */}
            <section className="bg-black py-24 border-y border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(252,211,77,0.1),transparent_50%)]"></div>

                <div className="group sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
                    <div className="mb-6 flex justify-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                            <span className="h-2 w-2 rounded-full bg-[#FCD34D]"></span>
                            <span className="text-xs font-medium tracking-wide uppercase text-gray-300">Loved by restaurants worldwide</span>
                        </div>
                    </div>
                    <h2 className="md:text-5xl text-3xl font-medium text-white tracking-tight text-center mb-6">
                        <span className="text-[#FCD34D] font-medium">KostKitchen</span>
                    </h2>
                    <p className="mb-10 text-lg max-w-2xl mx-auto text-center text-gray-400">
                        Chefs, restaurant owners, and operations managers use KostKitchen to streamline workflow, track inventory, and boost profitability in days instead of months.
                    </p>

                    <div className="testimonial-cards-fan group flex w-full h-[42rem] max-w-7xl mt-0 mb-0 relative gap-x-y-0 gap-y-0 items-center justify-center">

                        {/* Card 1 */}
                        <article className="testimonial-card card-1 group/card w-full max-w-sm rounded-2xl bg-[#202020] border border-white/5 px-6 py-5 text-left relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="mb-3 text-3xl leading-none text-white font-medium">"</div>
                                <p className="mb-4 text-base text-gray-300">
                                    After switching to Kost, we've seen a significant improvement in order accuracy and kitchen communication. It's truly a game changer.
                                </p>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-zinc-700 rounded-full overflow-hidden">
                                        <img src="https://i.pravatar.cc/150?img=11" alt="Wouter Visser" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Wouter Visser</div>
                                        <div className="text-xs text-gray-500">Owner, Mixue Ice Cream</div>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Card 2 */}
                        <article className="testimonial-card card-2 group/card w-full max-w-sm rounded-2xl bg-[#202020] border border-white/5 px-6 py-5 text-left relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="mb-3 text-3xl leading-none text-white font-medium">"</div>
                                <p className="mb-4 text-base text-gray-300">
                                    It has simplified our day-to-day operations! Kost has become an essential tool for our success and growth.
                                </p>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-zinc-700 rounded-full overflow-hidden">
                                        <img src="https://i.pravatar.cc/150?img=5" alt="Emma Diaz" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Emma Diaz</div>
                                        <div className="text-xs text-gray-500">Owner, HAUS!</div>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Card 3 */}
                        <article className="testimonial-card card-3 group/card w-full max-w-sm rounded-2xl bg-[#202020] border border-white/5 px-6 py-5 text-left relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="mb-3 text-3xl leading-none text-white font-medium">"</div>
                                <p className="mb-4 text-base text-gray-300">
                                    Since implementing Kost POS, our restaurant's operations have been smoother than ever before. Staff training is now effortless.
                                </p>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-zinc-700 rounded-full overflow-hidden">
                                        <img src="https://i.pravatar.cc/150?img=13" alt="Howard Lopez" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Howard Lopez</div>
                                        <div className="text-xs text-gray-500">Owner, Decision Restaurant</div>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Card 4 */}
                        <article className="testimonial-card card-4 group/card w-full max-w-sm rounded-2xl bg-[#202020] border border-white/5 px-6 py-5 text-left relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="mb-3 text-3xl leading-none text-white font-medium">"</div>
                                <p className="mb-4 text-base text-gray-300">
                                    The offline mode is a lifesaver. We never have to worry about internet outages stopping our service. Highly reliable!
                                </p>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-zinc-700 rounded-full overflow-hidden">
                                        <img src="https://i.pravatar.cc/150?img=32" alt="Sarah Chen" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Sarah Chen</div>
                                        <div className="text-xs text-gray-500">Manager, DimSum House</div>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Card 5 */}
                        <article className="testimonial-card card-5 group/card w-full max-w-sm rounded-2xl bg-[#202020] border border-white/5 px-6 py-5 text-left relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="mb-3 text-3xl leading-none text-white font-medium">"</div>
                                <p className="mb-4 text-base text-gray-300">
                                    Inventory management used to be a nightmare across our 3 branches. Now with KostKitchen, it's synchronized and accurate.
                                </p>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-zinc-700 rounded-full overflow-hidden">
                                        <img src="https://i.pravatar.cc/150?img=60" alt="Michael Reyes" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Michael Reyes</div>
                                        <div className="text-xs text-gray-500">Ops Director, Parallel</div>
                                    </div>
                                </div>
                            </div>
                        </article>

                        {/* Card 6 */}
                        <article className="testimonial-card card-6 group/card w-full max-w-sm rounded-2xl bg-[#202020] border border-white/5 px-6 py-5 text-left relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="mb-3 text-3xl leading-none text-white font-medium">"</div>
                                <p className="mb-4 text-base text-gray-300">
                                    The real-time analytics have given me clarity on food costs I never had before. We've reduced waste by 15% in two months.
                                </p>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="w-9 h-9 bg-zinc-700 rounded-full overflow-hidden">
                                        <img src="https://i.pravatar.cc/150?img=68" alt="Mark Johnson" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-white">Mark Johnson</div>
                                        <div className="text-xs text-gray-500">Head Chef, Helio</div>
                                    </div>
                                </div>
                            </div>
                        </article>

                    </div>
                </div>
            </section>

            {/* Bottom CTA (FAQ + Footer CTA) */}
            <section className="py-24 bg-white border-b border-[#E6E2D6]">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Main Card Container */}
                    <div className="md:p-10 rounded-[2.5rem] pt-6 pr-6 pb-6 pl-6">
                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#E6E2D6] bg-white text-[#111111]">
                                    <iconify-icon icon="lucide:chef-hat" width="24" className="w-6 h-6"></iconify-icon>
                                </span>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111111]">
                                        KostKitchen — Help & FAQs
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
                                        <iconify-icon icon="lucide:plus" width="16" className="w-4 h-4 text-[#111111] transition-transform duration-200"></iconify-icon>
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
                                        <iconify-icon icon="lucide:plus" width="16" className="w-4 h-4 text-[#111111] transition-transform duration-200"></iconify-icon>
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
                                        <iconify-icon icon="lucide:plus" width="16" className="w-4 h-4 text-[#111111] transition-transform duration-200"></iconify-icon>
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
                                        <iconify-icon icon="lucide:plus" width="16" className="w-4 h-4 text-[#111111] transition-transform duration-200"></iconify-icon>
                                    </span>
                                </summary>
                                <div className="mt-3 text-sm leading-6 text-[#666666]">
                                    No, all our plans are month-to-month. You can upgrade,
                                    downgrade, or cancel your subscription at any time with no
                                    penalties.
                                </div>
                            </details>
                        </div>

                        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E6E2D6] bg-white p-4 sm:flex-row">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E2D6] bg-[#F8F6F1]">
                                    <iconify-icon icon="lucide:help-circle" width="20" className="w-5 h-5 text-[#111111]"></iconify-icon>
                                </span>
                                <p className="text-sm text-[#666666]">
                                    Still have a question? We're here to help.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="inline-flex items-center gap-2 rounded-full border border-[#E6E2D6] bg-white px-4 py-2 text-sm font-medium text-[#111111] hover:bg-[#F8F6F1] transition-colors">
                                    <iconify-icon icon="lucide:message-square" width="16" className="w-4 h-4"></iconify-icon>
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

            {/* Bottom CTA Mockup */}
            <section className="pt-24 pb-0 bg-[#FCD34D] px-6 overflow-hidden">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#303030] mb-4">
                        Get started with Kost today!
                    </h2>
                    <p className="text-[#303030]/80 mb-8 max-w-xl mx-auto">
                        Say goodbye to manual order taking and complicated billing processes
                        with Kost POS application system.
                    </p>
                    <button className="bg-[#303030] hover:bg-[#303030]/90 text-white font-semibold py-4 px-10 rounded-full transition-all shadow-xl shadow-[#303030]/20 mb-12 hover:-translate-y-1">
                        Request a Demo
                    </button>

                    {/* Partial Mockup overlapping bottom */}
                    <div className="relative mx-auto max-w-3xl translate-y-10">
                        <div className="bg-white rounded-t-3xl shadow-2xl p-2 md:p-4 pb-0">
                            <div className="bg-zinc-50 rounded-t-2xl p-4 min-h-[300px] border-x border-t border-zinc-200">
                                {/* Active Orders Interactive Mockup */}
                                <ActiveOrdersMockup />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#303030] text-white pt-24 pb-12 mt-0">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[#FCD34D]">
                                    <iconify-icon icon="lucide:chef-hat" width="24"></iconify-icon>
                                </div>
                                <span className="text-2xl font-bold tracking-tight">KOST</span>
                            </div>
                            <p className="text-sm text-white/70 max-w-xs leading-relaxed mb-6">
                                Passionate about helping restaurants to grow with one goal in mind
                                - to simplify and streamline restaurant's operations.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6">Menu</h4>
                            <ul className="space-y-4 text-sm text-white/70">
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">Home</a></li>
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">How it's Work</a></li>
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">Pricing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6">About Us</h4>
                            <ul className="space-y-4 text-sm text-white/70">
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">Our Story</a></li>
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">Career</a></li>
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">News &amp; Blog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6">Social</h4>
                            <ul className="space-y-4 text-sm text-white/70">
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">Instagram</a></li>
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">Facebook</a></li>
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">Tiktok</a></li>
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">LinkedIn</a></li>
                                <li><a href="#" className="hover:text-[#FCD34D] transition-colors">Twitter</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 text-center">
                        <p className="text-xs text-white/50">
                            Copyright © 2023. Kost Kitchen Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
