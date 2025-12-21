import React, { useMemo } from 'react';
import { useApp } from '../AppContext';

export const MenuEngineering = () => {
    const { data } = useApp();

    const matrixData = useMemo(() => {
        const recipes = data.recipes;
        if (recipes.length === 0) return { items: [], avgPop: 0, avgProf: 0 };

        const items = recipes.map(r => {
            // Profit (Contribution) = Price * (Margin / 100)
            const contribution = r.price * (r.margin / 100);
            const volume = r.dailyVolume || 0;
            return { ...r, contribution, volume };
        });

        const totalVolume = items.reduce((sum, i) => sum + i.volume, 0);
        const avgPop = totalVolume / (items.length || 1);
        
        const totalProfit = items.reduce((sum, i) => sum + i.contribution, 0);
        const avgProf = totalProfit / (items.length || 1);

        return { items, avgPop, avgProf };
    }, [data.recipes]);

    // Scales
    // Use 1.2x max as the ceiling to add padding
    const maxPop = Math.max(...matrixData.items.map(i => i.volume), matrixData.avgPop * 1.5, 10);
    const maxProf = Math.max(...matrixData.items.map(i => i.contribution), matrixData.avgProf * 1.5, 10);

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Menu Engineering</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Profitability vs. Popularity Matrix</p>
                </div>
            </div>

            {/* Matrix Chart */}
            <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden">
                <div className="aspect-[4/3] md:aspect-[2/1] w-full relative bg-gray-50/30 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5">
                    
                    {/* Quadrant Backgrounds (Conceptual) */}
                    {/* We don't use colored backgrounds to keep it clean, but we label them */}
                    <div className="absolute top-2 right-2 text-[10px] font-bold text-green-500 uppercase tracking-widest opacity-50">Star (Keep)</div>
                    <div className="absolute top-2 left-2 text-[10px] font-bold text-orange-400 uppercase tracking-widest opacity-50">Plowhorse (Reprice)</div>
                    <div className="absolute bottom-2 right-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest opacity-50">Puzzle (Promote)</div>
                    <div className="absolute bottom-2 left-2 text-[10px] font-bold text-red-400 uppercase tracking-widest opacity-50">Dog (Remove)</div>

                    {/* Average Lines (Crosshair) */}
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-white/20 border-l border-dashed z-0"
                        style={{ left: `${(matrixData.avgProf / maxProf) * 100}%` }}
                    >
                        <div className="absolute top-0 -translate-y-full left-1/2 -translate-x-1/2 text-[9px] font-bold text-gray-400 whitespace-nowrap">Avg Profit</div>
                    </div>
                    <div 
                        className="absolute left-0 right-0 h-0.5 bg-gray-300 dark:bg-white/20 border-t border-dashed z-0"
                        style={{ top: `${100 - (matrixData.avgPop / maxPop) * 100}%` }}
                    >
                        <div className="absolute left-full translate-x-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 whitespace-nowrap">Avg Vol</div>
                    </div>

                    {/* Bubbles */}
                    {matrixData.items.map(item => {
                         const x = (item.contribution / maxProf) * 100;
                         const y = 100 - (item.volume / maxPop) * 100;
                         
                         const isHighPop = item.volume >= matrixData.avgPop;
                         const isHighProf = item.contribution >= matrixData.avgProf;
                         
                         let colorClass = "bg-gray-400";
                         let shadowClass = "shadow-gray-400/50";
                         
                         if (isHighPop && isHighProf) { colorClass = "bg-green-500"; shadowClass = "shadow-green-500/50"; } // Star
                         else if (isHighPop && !isHighProf) { colorClass = "bg-orange-500"; shadowClass = "shadow-orange-500/50"; } // Plowhorse
                         else if (!isHighPop && isHighProf) { colorClass = "bg-blue-500"; shadowClass = "shadow-blue-500/50"; } // Puzzle
                         else { colorClass = "bg-red-500"; shadowClass = "shadow-red-500/50"; } // Dog

                         return (
                            <div 
                                key={item.id}
                                className={`absolute w-4 h-4 rounded-full ${colorClass} shadow-lg ${shadowClass} border-2 border-white dark:border-[#1C1C1E] transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-all cursor-pointer group z-10`}
                                style={{ left: `${Math.min(Math.max(x, 2), 98)}%`, top: `${Math.min(Math.max(y, 2), 98)}%` }}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-gray-900 text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 origin-bottom shadow-xl z-50">
                                    <div className="font-bold">{item.name}</div>
                                    <div className="text-[10px] opacity-80">Vol: {item.volume} | Profit: ₱{item.contribution.toFixed(2)}</div>
                                </div>
                            </div>
                         );
                    })}
                </div>
                
                {/* Axis Labels */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-gray-400 uppercase tracking-wider origin-left pointer-events-none">Popularity</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-wider pointer-events-none">Profitability</div>
            </div>
            
            {/* Legend / Stats */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { id: 'Star', color: 'text-green-500', bg: 'bg-green-500', desc: 'High Profit, High Volume' },
                    { id: 'Plowhorse', color: 'text-orange-500', bg: 'bg-orange-500', desc: 'Low Profit, High Volume' },
                    { id: 'Puzzle', color: 'text-blue-500', bg: 'bg-blue-500', desc: 'High Profit, Low Volume' },
                    { id: 'Dog', color: 'text-red-500', bg: 'bg-red-500', desc: 'Low Profit, Low Volume' }
                ].map(cat => {
                    const count = matrixData.items.filter(i => {
                        const isHighPop = i.volume >= matrixData.avgPop;
                        const isHighProf = i.contribution >= matrixData.avgProf;
                        if (cat.id === 'Star') return isHighPop && isHighProf;
                        if (cat.id === 'Plowhorse') return isHighPop && !isHighProf;
                        if (cat.id === 'Puzzle') return !isHighPop && isHighProf;
                        return !isHighPop && !isHighProf;
                    }).length;
                    
                    return (
                        <div key={cat.id} className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${cat.bg}`}></div>
                                <div className={`text-xs font-bold uppercase tracking-wider ${cat.color}`}>{cat.id}</div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{count}</div>
                            <div className="text-[10px] text-gray-400">{cat.desc}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
