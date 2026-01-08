import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';
import { getCurrencySymbol } from '../lib/format-utils';

export const POS = () => {
    const { data, getCurrencySymbol: appSymbol } = useApp();
    const [kitchenLive, setKitchenLive] = useState(true);
    const [activeTab, setActiveTab] = useState('All Items');
    const [currentPage, setCurrentPage] = useState(1);

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
        // Main Courses
        { id: 1, name: 'Garlic Chicken Rice', category: 'Main Course', price: 221, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 2, name: 'Spicy Curry Chicken', category: 'Main Course', price: 250, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 3, name: 'Honey Glazed Pork', category: 'Main Course', price: 221, image: 'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 4, name: 'Healthy Green Bowl', category: 'Main Course', price: 195, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 5, name: 'Seafood Pasta', category: 'Main Course', price: 280, image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 6, name: 'Ramen Special', category: 'Main Course', price: 245, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 7, name: 'Beef Burger', category: 'Main Course', price: 185, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 11, name: 'Fish and Chips', category: 'Main Course', price: 230, image: 'https://images.unsplash.com/photo-1599488615731-7e512530eb05?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 13, name: 'Steak & Fries', category: 'Main Course', price: 450, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 14, name: 'BBQ Ribs', category: 'Main Course', price: 380, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 15, name: 'Grilled Salmon', category: 'Main Course', price: 320, image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4974?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 16, name: 'Pork Belly', category: 'Main Course', price: 260, image: 'https://images.unsplash.com/photo-1536780962377-5264b971a070?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 17, name: 'Roast Duck', category: 'Main Course', price: 340, image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 18, name: 'Tofu Stir Fry', category: 'Main Course', price: 180, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 19, name: 'Shrimp Curry', category: 'Main Course', price: 290, image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },

        // Appetizers
        { id: 8, name: 'Caesar Salad', category: 'Appetizers', price: 150, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 20, name: 'Spring Rolls', category: 'Appetizers', price: 120, image: 'https://images.unsplash.com/photo-1544439063-441d4c22955f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 21, name: 'Buffalo Wings', category: 'Appetizers', price: 180, image: 'https://images.unsplash.com/photo-1614769065608-25e229c670a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 22, name: 'Nachos', category: 'Appetizers', price: 160, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 23, name: 'Onion Rings', category: 'Appetizers', price: 110, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 24, name: 'Calamari', category: 'Appetizers', price: 190, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 25, name: 'Garlic Bread', category: 'Appetizers', price: 90, image: 'https://images.unsplash.com/photo-1573140247632-f846aeeb6c21?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 26, name: 'Mushroom Soup', category: 'Appetizers', price: 130, image: 'https://images.unsplash.com/photo-1547592166-23acbe3a624b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },

        // Beverages
        { id: 12, name: 'Mango Smoothie', category: 'Beverages', price: 140, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 27, name: 'Iced Latte', category: 'Beverages', price: 120, image: 'https://images.unsplash.com/photo-1517701604599-bb29b5c7dd90?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 28, name: 'Fresh Orange Juice', category: 'Beverages', price: 110, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 29, name: 'Lemonade', category: 'Beverages', price: 100, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 30, name: 'Iced Tea', category: 'Beverages', price: 90, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 31, name: 'Soda', category: 'Beverages', price: 60, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 32, name: 'Water Bottle', category: 'Beverages', price: 40, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 33, name: 'Hot Coffee', category: 'Beverages', price: 80, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },

        // Desserts
        { id: 10, name: 'Chocolate Cake', category: 'Desserts', price: 160, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 34, name: 'Cheesecake', category: 'Desserts', price: 170, image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 35, name: 'Ice Cream Scoop', category: 'Desserts', price: 90, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 36, name: 'Brownie', category: 'Desserts', price: 110, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 37, name: 'Fruit Salad', category: 'Desserts', price: 130, image: 'https://images.unsplash.com/photo-1519996521185-3e0715e8c16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 38, name: 'Tiramisu', category: 'Desserts', price: 180, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 39, name: 'Pancakes', category: 'Desserts', price: 140, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 40, name: 'Waffle', category: 'Desserts', price: 150, image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
        { id: 41, name: 'Donut', category: 'Desserts', price: 70, image: 'https://images.unsplash.com/photo-1551024601-5629436bb5c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
    ];

    // Filter items based on active tab
    const filteredItems = activeTab === 'All Items'
        ? allMenuItems
        : allMenuItems.filter(item => item.category === activeTab);

    // Pagination Logic
    // Pagination Logic
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const gridContainerRef = useRef<HTMLDivElement>(null);

    // Dynamic Calculation of Items Per Page
    useEffect(() => {
        const calculateItems = () => {
            if (gridContainerRef.current) {
                const containerHeight = gridContainerRef.current.clientHeight;
                const containerWidth = gridContainerRef.current.clientWidth;

                // Constants based on design
                const cardHeight = 125; // Approx height of card including gap contribution (106px + gap)
                // Actually gap is space between.
                // grid-cols-1 (mobile), 2 (md), 3 (xl)
                let columns = 1;
                if (containerWidth >= 1280) columns = 3;
                else if (containerWidth >= 768) columns = 2;

                const gap = 16; // gap-4 = 16px

                // Available height for rows
                // We want to fit N rows. Height = N * cardH + (N-1) * gap
                // cardH is actual card height
                const actualCardHeight = 106; // measured estimate

                // Solve for N:
                // N * actualCardHeight + (N-1) * gap <= containerHeight
                // N * (actualCardHeight + gap) - gap <= containerHeight
                // N <= (containerHeight + gap) / (actualCardHeight + gap)

                const rows = Math.floor((containerHeight + gap) / (actualCardHeight + gap));
                const safeRows = Math.max(1, rows);

                setItemsPerPage(safeRows * columns);
            }
        };

        // Initial calc
        calculateItems();

        // Observer
        const observer = new ResizeObserver(() => {
            calculateItems();
        });

        if (gridContainerRef.current) {
            observer.observe(gridContainerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset pagination when tab changes
    // Reset pagination when tab changes or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, itemsPerPage]);

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
                    <div className="flex items-center justify-between bg-gray-100 dark:bg-[#303030]/50 p-1.5 rounded-full mb-4 shrink-0">
                        <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`flex-1 px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeTab === cat
                                        ? 'bg-[#202020] text-white shadow-md dark:bg-white dark:text-black'
                                        : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="pr-1 pl-4 border-l border-gray-200 dark:border-white/10 ml-2">
                            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-[#404040] text-gray-400 hover:text-[#202020] hover:shadow-sm transition-all">
                                <iconify-icon icon="lucide:plus" width="18"></iconify-icon>
                            </button>
                        </div>
                    </div>

                    {/* Menu Grid - Scrollable Container with Pagination at bottom */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex-1 overflow-hidden" ref={gridContainerRef}>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                                {currentItems.map(item => (
                                    <div key={item.id} className="bg-white dark:bg-[#2A2A2A] p-3 rounded-[20px] shadow-sm hover:shadow-md transition-all group cursor-pointer border border-transparent hover:border-[#FCD34D] flex items-center gap-3">
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

                        {/* Pagination Area */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 py-4 shrink-0 border-t border-gray-100 dark:border-white/5 mt-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'bg-white dark:bg-[#303030] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#404040] shadow-sm'}`}
                                >
                                    <iconify-icon icon="lucide:chevron-left" width="20"></iconify-icon>
                                </button>

                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'bg-white dark:bg-[#303030] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#404040] shadow-sm'}`}
                                >
                                    <iconify-icon icon="lucide:chevron-right" width="20"></iconify-icon>
                                </button>
                            </div>
                        )}
                    </div>
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
        </div>
    );
};
