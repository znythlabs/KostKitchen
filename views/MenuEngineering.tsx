import React, { useMemo, useState } from 'react';
import { useApp } from '../AppContext';

type MatrixCategory = 'Winner' | 'Staple' | 'Opportunity' | 'Underperformer';

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
    label: string;
    alias?: string;
    color: string;
    bg: string;
    lightBg: string; // Used for badges
    zoneBg: string; // Used for chart quadrants
    desc: string;
    strategy: string;
    icon: string;
}> = {
    'Winner': {
        label: 'Winners',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500',
        lightBg: 'bg-emerald-50 dark:bg-emerald-500/20',
        zoneBg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
        desc: 'High Profit, High Volume',
        strategy: 'Promote significantly. Ensure consistent quality.',
        icon: 'lucide:trophy'
    },
    'Staple': {
        label: 'Staples',
        color: 'text-yellow-500',
        bg: 'bg-yellow-500',
        lightBg: 'bg-yellow-50 dark:bg-yellow-500/20',
        zoneBg: 'bg-yellow-500/10 dark:bg-yellow-500/10',
        desc: 'Low Profit, High Volume',
        strategy: 'Reprice carefully or lower costs.',
        icon: 'lucide:anchor'
    },
    'Opportunity': {
        label: 'Opportunities',
        color: 'text-blue-500',
        bg: 'bg-blue-500',
        lightBg: 'bg-blue-50 dark:bg-blue-500/20',
        zoneBg: 'bg-blue-500/10 dark:bg-blue-500/10',
        desc: 'High Profit, Low Volume',
        strategy: 'Market aggressively. Increase visibility.',
        icon: 'lucide:sparkles'
    },
    'Underperformer': {
        label: 'Needs Attention',
        alias: 'Problem',
        color: 'text-red-500',
        bg: 'bg-red-500',
        lightBg: 'bg-red-50 dark:bg-red-500/20',
        zoneBg: 'bg-red-500/10 dark:bg-red-500/10',
        desc: 'Low Profit, Low Volume',
        strategy: 'Reinvent or remove from menu.',
        icon: 'lucide:alert-octagon'
    }
};

export const MenuEngineering = () => {
    const { data } = useApp();
    const [selectedCategory, setSelectedCategory] = useState<MatrixCategory | 'All'>('All');
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);

    const matrixData = useMemo(() => {
        const recipes = data.recipes;
        if (recipes.length === 0) return { items: [], avgPop: 0, avgProf: 0 };

        // 1. Calculate Individual Metrics
        const tempItems = recipes.map(r => {
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

            let category: MatrixCategory = 'Underperformer';
            if (isHighPop && isHighProf) category = 'Winner';
            else if (isHighPop && !isHighProf) category = 'Staple';
            else if (!isHighPop && isHighProf) category = 'Opportunity';

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

        // Sort: Best (Winner, Opportunity, Staple) to Poorest (Underperformer)
        const priority: Record<MatrixCategory, number> = { 'Winner': 4, 'Opportunity': 3, 'Staple': 2, 'Underperformer': 1 };

        const sortedItems = items.sort((a, b) => {
            if (priority[a.category] !== priority[b.category]) {
                return priority[b.category] - priority[a.category]; // Descending Rank
            }
            return b.contribution - a.contribution; // Descending Profit
        });

        return { items: sortedItems, avgPop, avgProf };
    }, [data.recipes]);

    // Scales for Chart
    const maxPop = Math.max(...matrixData.items.map(i => i.volume), matrixData.avgPop * 1.5, 10);
    const maxProf = Math.max(...matrixData.items.map(i => i.contribution), matrixData.avgProf * 1.5, 10);

    const filteredItems = selectedCategory === 'All'
        ? matrixData.items
        : matrixData.items.filter(i => i.category === selectedCategory);

    return (
        <div className="space-y-8 pb-20 fade-enter">
            {/* 1. HEADER & SUMMARY CARDS (Top Row) */}
            <div>
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        Menu Engineering
                        <span className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-semibold text-gray-500 uppercase tracking-wider">Matrix</span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analyze profitability vs. popularity to optimize your menu mix.
                    </p>
                </header>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {(Object.keys(CATEGORY_CONFIG) as MatrixCategory[]).map(cat => {
                        const config = CATEGORY_CONFIG[cat];
                        const count = matrixData.items.filter(i => i.category === cat).length;
                        const isActive = selectedCategory === cat;

                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(isActive ? 'All' : cat)}
                                className={`
                                    relative p-4 rounded-2xl border text-left transition-all duration-300
                                    ${isActive
                                        ? `bg-white dark:bg-[#1C1C1E] ring-2 ring-inset ring-${config.color.split('-')[1]}-500 border-transparent shadow-lg transform scale-[1.02] z-10`
                                        : 'bg-white dark:bg-[#1C1C1E] border-gray-200/50 dark:border-white/5 hover:border-gray-300 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-10 h-10 rounded-xl ${config.lightBg} flex items-center justify-center ${config.color}`}>
                                        <iconify-icon icon={config.icon} width="20"></iconify-icon>
                                    </div>
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tighter">{count}</span>
                                </div>
                                <div className={`text-sm font-bold uppercase tracking-wide ${config.color}`}>{config.label}</div>
                                <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 truncate">{config.desc}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. MAIN CONTENT (Split Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-auto lg:h-[600px]">

                {/* LEFT: THE MATRIX CHART */}
                <div className="lg:col-span-7 h-full flex flex-col">
                    <div className="soft-card-static p-1 h-full relative overflow-hidden flex flex-col">

                        {/* CHART CONTAINER */}
                        <div className="relative flex-1 w-full h-full min-h-[400px] rounded-[20px] overflow-hidden">

                            {/* COLORED ZONES (Background) */}
                            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                                {/* Top Left: Staples (High Vol, Low Profit) */}
                                <div id="eng-quad-staple" className={`${CATEGORY_CONFIG['Staple'].zoneBg} border-r border-b border-white/50 dark:border-white/5 relative group`}>
                                    <div className="absolute top-4 left-4 opacity-50 transition-opacity group-hover:opacity-100">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${CATEGORY_CONFIG['Staple'].color}`}>Staples</span>
                                    </div>
                                </div>
                                {/* Top Right: Winners (High Vol, High Profit) */}
                                <div id="eng-quad-winner" className={`${CATEGORY_CONFIG['Winner'].zoneBg} border-b border-white/50 dark:border-white/5 relative group`}>
                                    <div className="absolute top-4 right-4 text-right opacity-50 transition-opacity group-hover:opacity-100">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${CATEGORY_CONFIG['Winner'].color}`}>Winners</span>
                                    </div>
                                </div>
                                {/* Bottom Left: Needs Attention (Low Vol, Low Profit) */}
                                <div id="eng-quad-problem" className={`${CATEGORY_CONFIG['Underperformer'].zoneBg} border-r border-white/50 dark:border-white/5 relative group`}>
                                    <div className="absolute bottom-4 left-4 opacity-50 transition-opacity group-hover:opacity-100">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${CATEGORY_CONFIG['Underperformer'].color}`}>Needs Attention</span>
                                    </div>
                                </div>
                                {/* Bottom Right: Opportunities (Low Vol, High Profit) */}
                                <div id="eng-quad-opp" className={`${CATEGORY_CONFIG['Opportunity'].zoneBg} relative group`}>
                                    <div className="absolute bottom-4 right-4 text-right opacity-50 transition-opacity group-hover:opacity-100">
                                        <span className={`text-xs font-bold uppercase tracking-widest ${CATEGORY_CONFIG['Opportunity'].color}`}>Opportunities</span>
                                    </div>
                                </div>
                            </div>

                            {/* AVERAGE LINES */}
                            <div
                                className="absolute top-0 bottom-0 w-px bg-gray-400 dark:bg-white/30 z-0 transition-all duration-700 ease-out"
                                style={{ left: `${(matrixData.avgProf / maxProf) * 100}%` }}
                            >
                                <div className="absolute top-2 -translate-x-1/2 bg-white/80 dark:bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-gray-500 whitespace-nowrap backdrop-blur-sm border border-gray-200 dark:border-white/10">Avg Profit</div>
                            </div>
                            <div
                                className="absolute left-0 right-0 h-px bg-gray-400 dark:bg-white/30 z-0 transition-all duration-700 ease-out"
                                style={{ top: `${100 - (matrixData.avgPop / maxPop) * 100}%` }}
                            >
                                <div className="absolute right-2 -translate-y-1/2 bg-white/80 dark:bg-black/80 px-1 py-0.5 rounded text-[9px] font-mono text-gray-500 whitespace-nowrap backdrop-blur-sm border border-gray-200 dark:border-white/10">Avg Vol</div>
                            </div>

                            {/* BUBBLES */}
                            {matrixData.items.map(item => {
                                // Clamp values inside chart 
                                const xRaw = (item.contribution / maxProf) * 100;
                                const yRaw = 100 - (item.volume / maxPop) * 100;
                                const x = Math.min(Math.max(xRaw, 4), 96);
                                const y = Math.min(Math.max(yRaw, 4), 96);

                                const config = CATEGORY_CONFIG[item.category];
                                const isSelected = selectedCategory === 'All' || selectedCategory === item.category;
                                const isHovered = hoveredItem === item.id;
                                const isDimmed = (selectedCategory !== 'All' && selectedCategory !== item.category) || (hoveredItem !== null && hoveredItem !== item.id);

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedCategory(item.category === selectedCategory ? 'All' : item.category)}
                                        onMouseEnter={() => setHoveredItem(item.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 cursor-pointer z-10 
                                            ${isHovered ? 'z-[100] scale-110' : 'hover:z-50'}
                                            ${isDimmed ? 'opacity-30 blur-[1px] saturate-0' : 'opacity-100'}
                                        `}
                                        style={{ left: `${x}%`, top: `${y}%` }}
                                    >
                                        <div className={`
                                            w-5 h-5 md:w-8 md:h-8 rounded-full shadow-lg 
                                            ${config.bg} border-[3px] border-white dark:border-[#2C2C2E]
                                            transition-transform duration-300 hover:scale-110
                                            flex items-center justify-center
                                            text-white font-bold text-[10px] md:text-xs
                                        `}>
                                            {/* Optional: Show initial or compact volume number if space permits */}
                                        </div>

                                        {/* Dynamic Tooltip */}
                                        <div className={`
                                            absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 
                                            bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white rounded-xl 
                                            shadow-xl border border-gray-100 dark:border-white/10 
                                            min-w-[180px] z-50 pointer-events-none transition-all duration-200 origin-bottom
                                            ${isHovered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2'}
                                        `}>
                                            <div className="font-bold text-sm mb-1">{item.name}</div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 pt-2 mt-1">
                                                <span>Daily Volume</span> <span className="font-mono font-medium text-gray-900 dark:text-white text-right">{item.volume}</span>
                                                <span>Unit Profit</span> <span className="font-mono font-medium text-gray-900 dark:text-white text-right">₱{item.contribution.toFixed(0)}</span>
                                            </div>
                                            <div className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${config.color} flex items-center gap-1`}>
                                                <iconify-icon icon={config.icon} width="12"></iconify-icon>
                                                {config.label}
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-3 h-3 bg-white dark:bg-[#2C2C2E] rotate-45 border-r border-b border-gray-100 dark:border-white/10"></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* AXIS LABELS - OVERLAY */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none flex items-center gap-2 mix-blend-multiply dark:mix-blend-color-dodge">
                            <span>Popularity (Volume)</span>
                            <iconify-icon icon="lucide:arrow-right" width="12"></iconify-icon>
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none flex items-center gap-2 mix-blend-multiply dark:mix-blend-color-dodge">
                            <span>Profitability (Contribution)</span>
                            <iconify-icon icon="lucide:arrow-right" width="12"></iconify-icon>
                        </div>
                    </div>
                </div>

                {/* RIGHT: DETAILED LIST */}
                <div className="lg:col-span-5 h-full flex flex-col min-h-[500px]">
                    <div className="soft-card-static flex flex-col h-full overflow-hidden">

                        <div className="p-5 border-b border-gray-100 dark:border-white/5 shrink-0 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Analysis & Strategy</h3>
                                {selectedCategory !== 'All' && (
                                    <button
                                        onClick={() => setSelectedCategory('All')}
                                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-300 dark:hover:bg-white/20 transition-colors"
                                    >
                                        <iconify-icon icon="lucide:x" width="14"></iconify-icon>
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {selectedCategory === 'All'
                                    ? 'Select a category (Cards or Graph) to filter items and see recommendations.'
                                    : CATEGORY_CONFIG[selectedCategory as MatrixCategory].strategy}
                            </p>
                        </div>

                        <div className="overflow-y-auto flex-1 p-0 scrollbar-thin">
                            {filteredItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4 text-gray-400">
                                        <iconify-icon icon="lucide:search" width="32"></iconify-icon>
                                    </div>
                                    <p className="text-sm">No items found for this filter.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filteredItems.map(item => {
                                        const config = CATEGORY_CONFIG[item.category];
                                        return (
                                            <div
                                                key={item.id}
                                                onMouseEnter={() => setHoveredItem(item.id)}
                                                onMouseLeave={() => setHoveredItem(null)}
                                                className={`p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 group cursor-default border-l-4 border-transparent ${hoveredItem === item.id ? `border-${config.color.split('-')[1]}-500 bg-gray-50 dark:bg-white/5` : ''}`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="font-bold text-base text-gray-900 dark:text-white">{item.name}</div>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.lightBg} ${config.color} flex items-center gap-1`}>
                                                                <iconify-icon icon={config.icon} width="10"></iconify-icon>
                                                                {config.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-base font-mono font-bold text-gray-900 dark:text-white">₱{item.contribution.toFixed(0)}</div>
                                                        <div className="text-[10px] text-gray-400">Margin</div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                                                            <iconify-icon icon="lucide:shopping-bag" width="14"></iconify-icon>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Volume</div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.volume}/day</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                                                            <iconify-icon icon="lucide:coins" width="14"></iconify-icon>
                                                        </div>
                                                        <div>
                                                            <div className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Cost %</div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{((item.cost / item.price) * 100).toFixed(0)}%</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actionable Hint */}
                                                <div className={`mt-3 text-xs italic flex items-start gap-1.5 ${hoveredItem === item.id ? 'opacity-100' : 'opacity-70'}`}>
                                                    <iconify-icon icon="lucide:lightbulb" class="text-amber-500 shrink-0 mt-0.5" width="14"></iconify-icon>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {
                                                            item.category === 'Staple' ? 'High popularity but low margin. Try slightly increasing price.' :
                                                                item.category === 'Opportunity' ? 'Great margin but low sales. Improve visibility or photos.' :
                                                                    item.category === 'Underperformer' ? 'Low margin and sales. Consider removing.' :
                                                                        'Star performer! Maintain stock and quality.'
                                                        }
                                                    </span>
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
