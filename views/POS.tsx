import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { getCurrencySymbol } from '../lib/format-utils';
import { LiquidTabs } from '../components/LiquidTabs';
import { OrderItem, Order } from '../types';

export const POS = () => {
    const { data, createOrder, showToast } = useApp();
    const { recipes, orders } = data;

    const [activeTab, setActiveTab] = useState('All Items');
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const [currentPage, setCurrentPage] = useState(1);
    const gridContainerRef = useRef<HTMLDivElement>(null);

    // Cart State
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [table, setTable] = useState('Takeout');

    const currencySymbol = getCurrencySymbol(data.settings.currency || 'PHP');

    const categories = ['All Items', ...Array.from(new Set(recipes.map(r => r.category))).filter(Boolean)] as string[];

    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Filter items based on active tab
    const filteredItems = activeTab === 'All Items'
        ? recipes
        : recipes.filter(item => item.category === activeTab);

    // Reset pagination when tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Dynamic Pagination
    useEffect(() => {
        const calculateItemsPerPage = () => {
            if (gridContainerRef.current) {
                const containerHeight = gridContainerRef.current.clientHeight;
                const estimatedItemHeight = 140; // Approximate height of a card
                let columns = 1;
                // Tailwind breakpoints: md: 768px, xl: 1280px
                if (window.innerWidth >= 1280) columns = 3;
                else if (window.innerWidth >= 768) columns = 2;

                const rows = Math.max(1, Math.floor(containerHeight / estimatedItemHeight));
                const optimalCount = columns * rows;

                if (optimalCount !== itemsPerPage && optimalCount > 0) {
                    setItemsPerPage(optimalCount);
                }
            }
        };

        // Initial calc
        calculateItemsPerPage();

        // Recalc on resize
        window.addEventListener('resize', calculateItemsPerPage);
        return () => window.removeEventListener('resize', calculateItemsPerPage);
    }, [itemsPerPage]);

    // Active Orders Slider Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        if (scrollRef.current) {
            setStartX(e.pageX - scrollRef.current.offsetLeft);
            setScrollLeft(scrollRef.current.scrollLeft);
        }
    };
    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        if (scrollRef.current) {
            const x = e.pageX - scrollRef.current.offsetLeft;
            const walk = (x - startX) * 2; // Scroll-fast
            scrollRef.current.scrollLeft = scrollLeft - walk;
        }
    };

    // Cart Actions
    const addToCart = (recipe: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.recipeId === recipe.id);
            if (existing) {
                return prev.map(i => i.recipeId === recipe.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, {
                recipeId: recipe.id,
                name: recipe.name,
                qty: 1,
                price: recipe.price, // Using selling price
                cost: recipe.totalCost || 0
            }];
        });
    };

    const updateQty = (recipeId: number, delta: number) => {
        setCart(prev => {
            return prev.map(i => {
                if (i.recipeId === recipeId) {
                    const newQty = Math.max(0, i.qty + delta);
                    return { ...i, qty: newQty };
                }
                return i;
            }).filter(i => i.qty > 0);
        });
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = cartTotal * 0.10; // 10% Tax example
    const grandTotal = cartTotal + tax;

    const handleCharge = () => {
        if (cart.length === 0) return;

        const newOrder: Order = {
            id: crypto.randomUUID(),
            customerName: customerName || 'Walk-in',
            table: table,
            status: 'New',
            items: cart,
            total: grandTotal,
            timestamp: Date.now(),
            color: 'blue' // Default
        };

        createOrder(newOrder);
        setCart([]);
        setCustomerName('');
        showToast("Order Placed Successfully!", "success");
    };

    // Sort active orders by newness
    const sortedActiveOrders = [...orders]
        .filter(o => o.status !== 'Completed')
        .sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden">

            {/* LEFT AREA: Order List + Menu */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">

                {/* Active Orders Slider */}
                <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[24px] p-5 shadow-sm border border-white/50 dark:border-white/5 shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-medium text-[#202020] dark:text-white">Active Orders</h2>
                        <div className="flex gap-2">
                            <button onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })} className="w-8 h-8 rounded-full bg-white dark:bg-[#303030] flex items-center justify-center text-gray-500 hover:text-[#202020] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#404040] shadow-sm transition-all">
                                <iconify-icon icon="lucide:chevron-left" width="18"></iconify-icon>
                            </button>
                            <button onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })} className="w-8 h-8 rounded-full bg-white dark:bg-[#303030] flex items-center justify-center text-gray-500 hover:text-[#202020] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#404040] shadow-sm transition-all">
                                <iconify-icon icon="lucide:chevron-right" width="18"></iconify-icon>
                            </button>
                        </div>
                    </div>
                    {sortedActiveOrders.length === 0 ? (
                        <div className="flex items-center justify-center h-24 text-gray-400 text-sm italic">
                            No active orders
                        </div>
                    ) : (
                        <div
                            ref={scrollRef}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            className={`flex overflow-x-auto no-scrollbar gap-3 pb-2 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                        >
                            {sortedActiveOrders.map(order => (
                                <div key={order.id} className="min-w-[240px] bg-white dark:bg-[#2A2A2A] p-3 rounded-[20px] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col gap-2 transition-all hover:shadow-md select-none">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-[#202020] dark:text-white text-sm">{order.customerName}</p>
                                            <p className="text-[11px] text-gray-500 font-medium">{order.table} • #{order.id.slice(0, 4)}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${order.status === 'New' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' :
                                                order.status === 'Cooking' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/30' :
                                                    'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-medium">{order.items.reduce((s, i) => s + i.qty, 0)} items</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Menu Section */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="mb-4 shrink-0">
                        <LiquidTabs
                            tabs={categories.map(cat => ({ id: cat, label: cat }))}
                            activeId={activeTab}
                            onChange={(id) => id && setActiveTab(id)}
                            className="w-full bg-[#F2F2F0] dark:bg-[#1A1A1A]"
                            layoutId="pos-category-tabs"
                            fill={true}
                        />
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <div ref={gridContainerRef} className="flex-1 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-0">
                                {filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(item => (
                                    <div key={item.id} onClick={() => addToCart(item)} className="bg-white dark:bg-[#2A2A2A] p-3 rounded-[20px] shadow-sm hover:shadow-md transition-all group cursor-pointer border border-transparent hover:border-[#FCD34D] flex items-center gap-3 h-full max-h-[120px]">
                                        <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-20 h-20 rounded-xl object-cover shadow-sm bg-gray-100" />
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

                    {/* Pagination */}
                    {Math.ceil(filteredItems.length / itemsPerPage) > 1 && (
                        <div className="flex justify-center items-center gap-4 py-4 shrink-0 border-t border-gray-100 dark:border-white/5 mt-auto">
                            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#303030] shadow-sm hover:bg-gray-100 disabled:opacity-50">
                                <iconify-icon icon="lucide:chevron-left" width="20"></iconify-icon>
                            </button>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Page {currentPage} of {Math.ceil(filteredItems.length / itemsPerPage)}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredItems.length / itemsPerPage), prev + 1))} disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)} className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#303030] shadow-sm hover:bg-gray-100 disabled:opacity-50">
                                <iconify-icon icon="lucide:chevron-right" width="20"></iconify-icon>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT SIDEBAR: Transaction Panel */}
            <div className="lg:w-[380px] xl:w-[420px] shrink-0 h-full flex flex-col">
                <div className="bg-white dark:bg-[#202020] rounded-[32px] p-6 h-full flex flex-col shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5">

                    <div className="mb-6 shrink-0">
                        <h2 className="text-lg font-medium text-[#202020] dark:text-white mb-4">Customer Info</h2>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Customer Name"
                                className="w-full bg-gray-50 dark:bg-[#2A2A2A] border-none rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FCD34D]/50 transition-all outline-none"
                            />
                            <div className="relative">
                                <select value={table} onChange={(e) => setTable(e.target.value)} className="w-full bg-gray-50 dark:bg-[#2A2A2A] border-none rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-[#FCD34D]/50 transition-all outline-none cursor-pointer">
                                    <option value="Takeout">Takeout</option>
                                    <option value="Table 1">Table 1</option>
                                    <option value="Table 2">Table 2</option>
                                    <option value="Table 3">Table 3</option>
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
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 gap-2">
                                <iconify-icon icon="lucide:shopping-cart" width="32" class="opacity-50"></iconify-icon>
                                <p className="text-sm">Cart is empty</p>
                            </div>
                        ) : (
                            <div className="overflow-y-auto no-scrollbar flex-1 space-y-4 pr-1">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center overflow-hidden">
                                            <img src={recipes.find(r => r.id === item.recipeId)?.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-[#202020] dark:text-white truncate">{item.name}</h4>
                                            <p className="text-sm font-medium text-gray-500 mt-0.5">{currencySymbol}{item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center bg-gray-50 dark:bg-[#303030] rounded-lg p-1">
                                            <button onClick={() => updateQty(item.recipeId, -1)} className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-[#404040] transition-colors">
                                                <iconify-icon icon="lucide:minus" width="12"></iconify-icon>
                                            </button>
                                            <span className="w-6 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">{item.qty}</span>
                                            <button onClick={() => updateQty(item.recipeId, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-[#FCD34D] text-[#202020] shadow-sm hover:brightness-95 transition-colors">
                                                <iconify-icon icon="lucide:plus" width="12"></iconify-icon>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-dashed border-gray-200 dark:border-white/10 shrink-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 text-sm">Subtotal</span>
                            <span className="text-base font-semibold text-[#202020] dark:text-white">{currencySymbol}{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-500 text-sm">Tax (10%)</span>
                            <span className="text-base font-semibold text-[#202020] dark:text-white">{currencySymbol}{tax.toFixed(2)}</span>
                        </div>

                        <button onClick={handleCharge} disabled={cart.length === 0} className="w-full bg-[#202020] dark:bg-white hover:bg-black dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-black text-sm font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex justify-between items-center px-6 group">
                            <span>Charge {currencySymbol}{grandTotal.toFixed(2)}</span>
                            <iconify-icon icon="lucide:arrow-right" width="18" className="group-hover:translate-x-1 transition-transform"></iconify-icon>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
