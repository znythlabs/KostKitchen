import React, { useMemo, useState } from 'react';
import { useApp } from '../AppContext';

type MatrixCategory = 'Star' | 'Plowhorse' | 'Puzzle' | 'Dog';

interface MatrixItem {
    id: number;
    name: string;
    contribution: number;
    volume: number;
    price: number;
    cost: number;
    category: MatrixCategory;
}

const CATEGORY_CONFIG: Record<MatrixCategory, { 
    color: string; 
    bg: string; 
    lightBg: string;
    desc: string; 
    strategy: string;
    icon: string;
}> = {
    'Star': { 
        color: 'text-green-500', 
        bg: 'bg-green-500', 
        lightBg: 'bg-green-50 dark:bg-green-900/10',
        desc: 'High Profit, High Volume',
        strategy: 'Maintain quality and consistency. Do not alter significantly. Promote visibility.',
        icon: 'lucide:star'
    },
    'Plowhorse': { 
        color: 'text-orange-500', 
        bg: 'bg-orange-500', 
        lightBg: 'bg-orange-50 dark:bg-orange-900/10',
        desc: 'Low Profit, High Volume',
        strategy: 'Increase price slightly or reduce food cost. Create combo meals with high-margin items.',
        icon: 'lucide:activity'
    },
    'Puzzle': { 
        color: 'text-blue-500', 
        bg: 'bg-blue-500', 
        lightBg: 'bg-blue-50 dark:bg-blue-900/10',
        desc: 'High Profit, Low Volume',
        strategy: 'Invest in marketing. Rename or rewrite description. Move to high-visibility menu area.',
        icon: 'lucide:help-circle'
    },
    'Dog': { 
        color: 'text-red-500', 
        bg: 'bg-red-500', 
        lightBg: 'bg-red-50 dark:bg-red-900/10',
        desc: 'Low Profit, Low Volume',
        strategy: 'Remove from menu or completely re-engineer. Stop promoting immediately.',
        icon: 'lucide:alert-circle'
    }
};

export const MenuEngineering = () => {
    const { data } = useApp();
    const [selectedCategory, setSelectedCategory] = useState<MatrixCategory | 'All'>('All');

    const matrixData = useMemo(() => {
        const recipes = data.recipes;
        if (recipes.length === 0) return { items: [], avgPop: 0, avgProf: 0 };

        // 1. Calculate Individual Metrics
        const tempItems = recipes.map(r => {
            // Profit (Contribution) = Price * (Margin / 100)
            const contribution = r.price * (r.margin / 100);
            const cost = r.price - contribution;
            const volume = r.dailyVolume || 0;
            return { ...r, contribution, volume, cost };
        });

        // 2. Calculate Averages
        const totalVolume = tempItems.reduce((sum, i) => sum + i.volume, 0);
        const avgPop = totalVolume / (tempItems.length || 1);
        
        const totalProfit = tempItems.reduce((sum, i) => sum + i.contribution, 0);
        const avgProf = totalProfit / (tempItems.length || 1);

        // 3. Categorize
        const items: MatrixItem[] = tempItems.map(i => {
            const isHighPop = i.volume >= avgPop;
            const isHighProf = i.contribution >= avgProf;
            
            let category: MatrixCategory = 'Dog';
            if (isHighPop && isHighProf) category = 'Star';
            else if (isHighPop && !isHighProf) category = 'Plowhorse';
            else if (!isHighPop && isHighProf) category = 'Puzzle';
            
            return {
                id: i.id,
                name: i.name,
                contribution: i.contribution,
                volume: i.volume,
                price: i.price,
                cost: i.cost,
                category
            };
        });

        return { items, avgPop, avgProf };
    }, [data.recipes]);

    // Scales for Chart
    // Use 1.2x max as the ceiling to add padding
    const maxPop = Math.max(...matrixData.items.map(i => i.volume), matrixData.avgPop * 1.5, 10);
    const maxProf = Math.max(...matrixData.items.map(i => i.contribution), matrixData.avgProf * 1.5, 10);

    const filteredItems = selectedCategory === 'All' 
        ? matrixData.items 
        : matrixData.items.filter(i => i.category === selectedCategory);

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Menu Engineering</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Optimize your menu profitability and popularity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: MATRIX CHART */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        
                        {/* Header within Chart Card */}
                        <div className="flex justify-between items-center mb-6 px-2">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <iconify-icon icon="lucide:scatter-chart" width="20" class="text-[#007AFF]"></iconify-icon>
                                Performance Matrix
                            </h3>
                            <div className="flex gap-4 text-[10px] font-medium text-gray-400">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-0.5 bg-gray-300 dark:bg-gray-600 border-t border-dashed"></div>
                                    <span>Avg Volume ({matrixData.avgPop.toFixed(1)})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-0.5 h-2 bg-gray-300 dark:bg-gray-600 border-l border-dashed"></div>
                                    <span>Avg Profit (₱{matrixData.avgProf.toFixed(2)})</span>
                                </div>
                            </div>
                        </div>

                        {/* The Chart */}
                        <div className="aspect-[5/4] sm:aspect-[16/9] w-full relative bg-gray-50/50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-white/5 mx-auto">
                            
                            {/* Quadrant Labels */}
                            <div className="absolute top-4 right-4 text-right pointer-events-none opacity-60">
                                <div className="text-xs font-black text-green-500 uppercase tracking-widest">Star</div>
                                <div className="text-[10px] font-medium text-green-500/80">Keep & Promote</div>
                            </div>
                            <div className="absolute top-4 left-4 text-left pointer-events-none opacity-60">
                                <div className="text-xs font-black text-orange-400 uppercase tracking-widest">Plowhorse</div>
                                <div className="text-[10px] font-medium text-orange-400/80">Reprice</div>
                            </div>
                            <div className="absolute bottom-4 right-4 text-right pointer-events-none opacity-60">
                                <div className="text-xs font-black text-blue-400 uppercase tracking-widest">Puzzle</div>
                                <div className="text-[10px] font-medium text-blue-400/80">Market</div>
                            </div>
                            <div className="absolute bottom-4 left-4 text-left pointer-events-none opacity-60">
                                <div className="text-xs font-black text-red-400 uppercase tracking-widest">Dog</div>
                                <div className="text-[10px] font-medium text-red-400/80">Remove</div>
                            </div>

                            {/* Axis Lines */}
                            <div 
                                className="absolute top-0 bottom-0 w-px bg-gray-300 dark:bg-white/20 border-l border-dashed z-0"
                                style={{ left: `${(matrixData.avgProf / maxProf) * 100}%` }}
                            />
                            <div 
                                className="absolute left-0 right-0 h-px bg-gray-300 dark:bg-white/20 border-t border-dashed z-0"
                                style={{ top: `${100 - (matrixData.avgPop / maxPop) * 100}%` }}
                            />

                            {/* Bubbles */}
                            {matrixData.items.map(item => {
                                 const x = (item.contribution / maxProf) * 100;
                                 const y = 100 - (item.volume / maxPop) * 100;
                                 const config = CATEGORY_CONFIG[item.category];
                                 const isSelected = selectedCategory === 'All' || selectedCategory === item.category;

                                 return (
                                    <div 
                                        key={item.id}
                                        onClick={() => setSelectedCategory(item.category)}
                                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 cursor-pointer group z-10 ${isSelected ? 'opacity-100 scale-100 grayscale-0' : 'opacity-20 scale-75 grayscale'}`}
                                        style={{ left: `${Math.min(Math.max(x, 2), 98)}%`, top: `${Math.min(Math.max(y, 2), 98)}%` }}
                                    >
                                        <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${config.bg} shadow-lg shadow-black/10 border-2 border-white dark:border-[#1C1C1E] group-hover:scale-125 transition-transform`}></div>
                                        
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 origin-bottom shadow-xl border border-gray-100 dark:border-white/10 z-50 min-w-[140px]">
                                            <div className="font-bold text-sm mb-1">{item.name}</div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400">
                                                <span>Volume:</span> <span className="font-mono font-medium text-gray-900 dark:text-white text-right">{item.volume}</span>
                                                <span>Profit:</span> <span className="font-mono font-medium text-gray-900 dark:text-white text-right">₱{item.contribution.toFixed(2)}</span>
                                            </div>
                                            <div className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${config.color}`}>{item.category}</div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white dark:border-t-[#2C2C2E]"></div>
                                        </div>
                                    </div>
                                 );
                            })}
                        </div>
                        
                        {/* Axis Labels */}
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-bold text-gray-400 uppercase tracking-widest origin-left pointer-events-none flex items-center gap-2">
                            <span>Popularity (Volume)</span>
                            <iconify-icon icon="lucide:arrow-right" width="10"></iconify-icon>
                        </div>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none flex items-center gap-2">
                            <span>Profitability (Contribution)</span>
                            <iconify-icon icon="lucide:arrow-right" width="10"></iconify-icon>
                        </div>
                    </div>

                    {/* Category Filter Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {(Object.keys(CATEGORY_CONFIG) as MatrixCategory[]).map(cat => {
                            const config = CATEGORY_CONFIG[cat];
                            const count = matrixData.items.filter(i => i.category === cat).length;
                            const isActive = selectedCategory === cat;

                            return (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(isActive ? 'All' : cat)}
                                    className={`relative p-4 rounded-2xl border text-left transition-all duration-300 ${isActive ? `bg-white dark:bg-[#1C1C1E] border-${config.color.split('-')[1]}-500 ring-1 ring-${config.color.split('-')[1]}-500 shadow-md` : 'bg-white dark:bg-[#1C1C1E] border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 opacity-70 hover:opacity-100'}`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-8 h-8 rounded-full ${config.lightBg} flex items-center justify-center ${config.color}`}>
                                            <iconify-icon icon={config.icon} width="16"></iconify-icon>
                                        </div>
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{count}</span>
                                    </div>
                                    <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${config.color}`}>{cat}</div>
                                    <div className="text-[10px] text-gray-400 truncate">{config.desc}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT COLUMN: DETAILED ANALYSIS */}
                <div className="lg:col-span-5 flex flex-col h-full min-h-[500px]">
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-[32px] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col h-full overflow-hidden">
                        
                        {/* Panel Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 shrink-0">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Analysis & Strategy</h3>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500">
                                    {filteredItems.length} Items
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedCategory === 'All' ? 'Select a category to see strategic recommendations.' : CATEGORY_CONFIG[selectedCategory as MatrixCategory].strategy}
                            </p>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 p-0">
                            {filteredItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                                    <iconify-icon icon="lucide:search-x" width="48" class="mb-4 opacity-20"></iconify-icon>
                                    <p className="text-sm">No items found in this category.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filteredItems.map(item => {
                                        const config = CATEGORY_CONFIG[item.category];
                                        return (
                                            <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${config.lightBg} ${config.color}`}>
                                                                {item.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white">₱{item.contribution.toFixed(2)}</div>
                                                        <div className="text-[10px] text-gray-400">Profit / serving</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-white/5">
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Volume</div>
                                                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">{item.volume} / day</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Cost</div>
                                                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">₱{item.cost.toFixed(2)}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Price</div>
                                                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-0.5">₱{item.price.toFixed(2)}</div>
                                                    </div>
                                                </div>

                                                {/* Strategic Hint */}
                                                <div className="mt-3 text-[11px] text-gray-500 italic border-l-2 border-gray-200 dark:border-white/10 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Suggestion: {
                                                        item.category === 'Plowhorse' ? 'Raise price by ₱' + (item.price * 0.05).toFixed(0) + ' or reduce portion size.' :
                                                        item.category === 'Puzzle' ? 'Run a promo or place on table tent.' :
                                                        item.category === 'Dog' ? 'Remove from menu or re-invent.' :
                                                        'Keep consistent.'
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
