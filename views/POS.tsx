import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { getCurrencySymbol } from '../lib/format-utils';
import { LiquidTabs } from '../components/LiquidTabs';

export const POS = () => {
    const { data, getCurrencySymbol: appSymbol } = useApp();
    const [kitchenLive, setKitchenLive] = useState(true);
    const [activeTab, setActiveTab] = useState('All Items');
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const [currentPage, setCurrentPage] = useState(1);
    const gridContainerRef = useRef<HTMLDivElement>(null);

    // Using hardcoded symbol for now if app context doesn't provide it directly in same way or just use fallback
    const currencySymbol = '₱';

    const categories = ['All Items', 'Main Course', 'Appetizers', 'Beverages', 'Desserts'];

    // Extended Mock Data for Active Orders to demonstrate slider
    const activeOrders = [
        { id: 1, name: 'Vinicius Bayu', table: 'Table 3', orderId: '#12532', status: 'Cooking', color: 'red' },
        { id: 2, name: 'Cheryl Arema', table: 'Table 3', orderId: '#12532', status: 'Ready', color: 'green' },
        { id: 3, name: 'Kylian Rex', table: 'Table 4', orderId: '#12531', status: 'Completed', color: 'blue' },
        { id: 4, name: 'Marco Polo', table: 'Table 1', orderId: '#12535', status: 'Cooking', color: 'red' },
        { id: 5, name: 'Sarah Chen', table: 'Table 2', orderId: '#12536', status: 'Ready', color: 'green' },
        { id: 6, name: 'Mike Ross', table: 'Table 5', orderId: '#12537', status: 'Cooking', color: 'red' },
    ];

    // Extended Mock Data for Menu Items
    const allMenuItems = [
        { id: 1, name: 'Garlic Chicken Rice Meal', category: 'Main Course', price: 221, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 2, name: 'Spicy Curry Chicken', category: 'Main Course', price: 250, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 3, name: 'Honey Glazed Pork', category: 'Main Course', price: 221, image: 'https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg' },
        { id: 4, name: 'Healthy Green Bowl', category: 'Main Course', price: 195, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 5, name: 'Seafood Pasta', category: 'Main Course', price: 280, image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 6, name: 'Ramen Special', category: 'Main Course', price: 245, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 7, name: 'Beef Burger', category: 'Main Course', price: 185, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 8, name: 'Caesar Salad', category: 'Appetizers', price: 150, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 10, name: 'Chocolate Cake', category: 'Desserts', price: 160, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 11, name: 'Fish and Chips', category: 'Main Course', price: 230, image: 'https://images.unsplash.com/photo-1599488615731-7e512530eb05?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 12, name: 'Mango Smoothie', category: 'Beverages', price: 140, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
    ];

    // Filter items based on active tab
    const filteredItems = activeTab === 'All Items'
        ? allMenuItems
        : allMenuItems.filter(item => item.category === activeTab);

    // Reset pagination when tab changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Dynamic Pagination Calculation
    useEffect(() => {
        const calculateItemsPerPage = () => {
            if (gridContainerRef.current) {
                const containerHeight = gridContainerRef.current.clientHeight;
                const containerWidth = gridContainerRef.current.clientWidth;

                // Estimate item dimensions based on CSS (p-3 + h-20 image + gap)
                // Item height approx: 12px (pad-top) + 80px (img) + 12px (pad-bottom) + 16px (gap) = ~120px
                // Adding a safety margin for text and borders -> ~140px seems safe
                const estimatedItemHeight = 140;

                // Determine columns based on breakpoints (md: 768px -> 2 cols, xl: 1280px -> 3 cols)
                let columns = 1;
                if (window.innerWidth >= 1280) columns = 3;
                else if (window.innerWidth >= 768) columns = 2;

                const rows = Math.max(1, Math.floor(containerHeight / estimatedItemHeight));

                const optimalCount = columns * rows;
                if (optimalCount !== itemsPerPage && optimalCount > 0) {
                    setItemsPerPage(optimalCount);
                }
            }
        };

        calculateItemsPerPage();
        window.addEventListener('resize', calculateItemsPerPage);
        return () => window.removeEventListener('resize', calculateItemsPerPage);
    }, [itemsPerPage]);

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden">

            {/* LEFT AREA: Order List + Menu */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">

                {/* Order List Tiles - Restored BG and Slider */}
                <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[24px] p-5 shadow-sm border border-white/50 dark:border-white/5 shrink-0">
                    <h2 className="text-lg font-medium text-[#202020] dark:text-white mb-3">Active Orders</h2>
                    <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2">
                        {activeOrders.map(order => (
                            <div key={order.id} className="min-w-[240px] bg-white dark:bg-[#2A2A2A] p-3 rounded-[20px] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col gap-2 transition-all hover:shadow-md cursor-pointer">
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-semibold text-[#202020] dark:text-white text-sm">{order.name}</p>
                                        <p className="text-[11px] text-gray-500 font-medium">{order.table} • {order.orderId}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${order.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' :
                                        order.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30' :
                                            'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Menu Section */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Tabs */}
                    <div className="mb-4 shrink-0">
                        <LiquidTabs
                            tabs={categories.map(cat => ({ id: cat, label: cat }))}
                            activeId={activeTab}
                            onChange={(id) => id && setActiveTab(id)}
                            className="w-full bg-gray-100 dark:bg-[#303030]/50"
                            rightAccessory={
                                <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#404040] text-gray-400 hover:text-[#202020] hover:shadow-sm transition-all">
                                    <iconify-icon icon="lucide:plus" width="18"></iconify-icon>
                                </button>
                            }
                        />
                    </div>

                    {/* Menu Grid - Scrollable Container with Pagination at bottom */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div ref={gridContainerRef} className="flex-1 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-0">
                                {filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(item => (
                                    <div key={item.id} className="bg-white dark:bg-[#2A2A2A] p-3 rounded-[20px] shadow-sm hover:shadow-md transition-all group cursor-pointer border border-transparent hover:border-[#FCD34D] flex items-center gap-3 h-full max-h-[120px]">
                                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shadow-sm bg-gray-100" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-[#202020] dark:text-white leading-tight truncate">{item.name}</h3>
                                            <p className="text-[10px] tracking-wider text-gray-400 font-medium uppercase mt-0.5">{item.category}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-base font-semibold text-[#202020] dark:text-white">{currencySymbol}{item.price}</span>
                                                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FCD34D] text-[#202020] shadow-sm hover:brightness-95 active:scale-95 transition-all">
                                                    <iconify-icon icon="lucide:plus" width="16"></iconify-icon>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Pagination Logic Re-inserted for render scope */}
                    {(() => {
                        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
                        const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                        // Re-render items logic here? No, we need to map them above.
                        // Actually, I removed the 'currentItems' definition in previous chunk.
                        // I must restore it before the return or move it.
                        // Wait, I can't put logic inside JSX like that cleanly for the map.
                        // Correction: I should have kept the logic before return.
                        // I will use a separate replacement for the grid content validation.
                        return null;
                    })()}

                    {/* Pagination Area */}
                    {Math.ceil(filteredItems.length / itemsPerPage) > 1 && (
                        <div className="flex justify-center items-center gap-4 py-4 shrink-0 border-t border-gray-100 dark:border-white/5 mt-auto">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'bg-white dark:bg-[#303030] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#404040] shadow-sm'}`}
                            >
                                <iconify-icon icon="lucide:chevron-left" width="20"></iconify-icon>
                            </button>

                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}
                            </span>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredItems.length / itemsPerPage), prev + 1))}
                                disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${currentPage === Math.ceil(filteredItems.length / itemsPerPage) ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'bg-white dark:bg-[#303030] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#404040] shadow-sm'}`}
                            >
                                <iconify-icon icon="lucide:chevron-right" width="20"></iconify-icon>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDEBAR: Transaction Panel */}
            <div className="lg:w-[380px] xl:w-[420px] shrink-0 h-full flex flex-col">
                <div className="bg-white dark:bg-[#202020] rounded-[32px] p-6 h-full flex flex-col shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5">

                    {/* Customer Info Input */}
                    <div className="mb-6 shrink-0">
                        <h2 className="text-lg font-medium text-[#202020] dark:text-white mb-4">Customer Info</h2>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Customer Name"
                                className="w-full bg-gray-50 dark:bg-[#2A2A2A] border-none rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FCD34D]/50 transition-all outline-none"
                            />
                            <div className="relative">
                                <select className="w-full bg-gray-50 dark:bg-[#2A2A2A] border-none rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-[#FCD34D]/50 transition-all outline-none cursor-pointer">
                                    <option>Select Table / Order Type</option>
                                    <option>Table 1</option>
                                    <option>Table 2</option>
                                    <option>Takeout</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <iconify-icon icon="lucide:chevron-down" width="16"></iconify-icon>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items List */}
                    <div className="flex-1 flex flex-col min-h-0 mb-4">
                        <h2 className="text-lg font-medium text-[#202020] dark:text-white mb-3">Order Details</h2>
                        <div className="overflow-y-auto no-scrollbar flex-1 space-y-4 pr-1">
                            {/* Item 1 */}
                            <div className="flex items-center gap-3">
                                <img src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" className="w-14 h-14 rounded-lg object-cover bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-[#202020] dark:text-white truncate">Garlic Chicken Rice Meal</h4>
                                    <p className="text-sm font-medium text-gray-500 mt-0.5">{currencySymbol}202.00</p>
                                </div>
                                <div className="flex items-center bg-gray-50 dark:bg-[#303030] rounded-lg p-1">
                                    <button className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-[#404040] transition-colors">
                                        <iconify-icon icon="lucide:minus" width="12"></iconify-icon>
                                    </button>
                                    <span className="w-6 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">2</span>
                                    <button className="w-6 h-6 flex items-center justify-center rounded bg-[#FCD34D] text-[#202020] shadow-sm hover:brightness-95 transition-colors">
                                        <iconify-icon icon="lucide:plus" width="12"></iconify-icon>
                                    </button>
                                </div>
                            </div>

                            {/* Item 2 */}
                            <div className="flex items-center gap-3">
                                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80" className="w-14 h-14 rounded-lg object-cover bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-[#202020] dark:text-white truncate">Green Bowl</h4>
                                    <p className="text-sm font-medium text-gray-500 mt-0.5">{currencySymbol}75.00</p>
                                </div>
                                <div className="flex items-center bg-gray-50 dark:bg-[#303030] rounded-lg p-1">
                                    <button className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-[#404040] transition-colors">
                                        <iconify-icon icon="lucide:minus" width="12"></iconify-icon>
                                    </button>
                                    <span className="w-6 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">1</span>
                                    <button className="w-6 h-6 flex items-center justify-center rounded bg-[#FCD34D] text-[#202020] shadow-sm hover:brightness-95 transition-colors">
                                        <iconify-icon icon="lucide:plus" width="12"></iconify-icon>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Footer */}
                    <div className="pt-4 border-t border-dashed border-gray-200 dark:border-white/10 shrink-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm">Subtotal</span>
                            <span className="text-base font-semibold text-[#202020] dark:text-white">{currencySymbol}382.00</span>
                        </div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-500 text-sm">Tax (10%)</span>
                            <span className="text-base font-semibold text-[#202020] dark:text-white">{currencySymbol}38.20</span>
                        </div>

                        <button className="w-full bg-[#202020] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black text-sm font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex justify-between items-center px-6 group">
                            <span>Charge {currencySymbol}420.20</span>
                            <iconify-icon icon="lucide:arrow-right" width="18" className="group-hover:translate-x-1 transition-transform"></iconify-icon>
                        </button>
                    </div>

                </div>
            </div>
        </div >
    );
};
