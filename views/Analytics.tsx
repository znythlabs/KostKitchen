import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { LiquidTabs } from '../components/LiquidTabs';
import { getCurrencySymbol } from '../lib/format-utils';


export const Analytics = () => {
    const { data } = useApp();
    const currencySymbol = getCurrencySymbol(data.settings.currency || 'PHP');
    const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

    // --- HELPER: Filter Snapshots based on Period ---
    const getFilteredSnapshots = (targetPeriod: 'day' | 'week' | 'month', offset: number = 0) => {
        const now = new Date();
        // Apply offset (e.g., -1 for previous period)
        if (offset !== 0) {
            if (targetPeriod === 'day') now.setDate(now.getDate() + offset * 7);
            else if (targetPeriod === 'week') now.setDate(now.getDate() + offset * 7);
            else if (targetPeriod === 'month') now.setMonth(now.getMonth() + offset);
        }

        const snapshots = [...data.dailySnapshots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (targetPeriod === 'day') {
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 7);
            return snapshots.filter(s => new Date(s.date) >= sevenDaysAgo && new Date(s.date) <= now);
        } else if (targetPeriod === 'week') {
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay() || 7;
            if (day !== 1) startOfWeek.setHours(-24 * (day - 1));
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return snapshots.filter(s => {
                const d = new Date(s.date);
                return d >= startOfWeek && d <= endOfWeek;
            });
        } else {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            return snapshots.filter(s => {
                const d = new Date(s.date);
                return d >= startOfMonth && d <= endOfMonth;
            });
        }
    };

    const snapshots = getFilteredSnapshots(period, 0);
    const prevSnapshots = getFilteredSnapshots(period, -1); // Previous period for trend comparison

    // --- KPI CALCULATIONS ---
    const calculateKpis = (snapshotList: typeof snapshots) => {
        if (period === 'day' && snapshotList.length > 0) {
            // For 'day', use latest or sum of last 7
            const latestSnap = snapshotList[snapshotList.length - 1];
            return {
                revenue: latestSnap ? latestSnap.grossSales : 0,
                foodCost: latestSnap ? latestSnap.cogs : 0,
                laborCost: latestSnap ? latestSnap.opex : 0,
                netProfit: latestSnap ? latestSnap.netProfit : 0
            };
        }
        return snapshotList.reduce((acc, curr) => ({
            revenue: acc.revenue + curr.grossSales,
            foodCost: acc.foodCost + curr.cogs,
            laborCost: acc.laborCost + curr.opex,
            netProfit: acc.netProfit + curr.netProfit
        }), { revenue: 0, foodCost: 0, laborCost: 0, netProfit: 0 });
    };

    const kpiData = calculateKpis(snapshots);
    const prevKpiData = calculateKpis(prevSnapshots);

    // Trend calculation helper
    const calcTrend = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const revenueTrend = calcTrend(kpiData.revenue, prevKpiData.revenue);
    const profitTrend = calcTrend(kpiData.netProfit, prevKpiData.netProfit);

    const margin = kpiData.revenue > 0 ? ((kpiData.netProfit / kpiData.revenue) * 100).toFixed(1) : "0.0";
    const foodCostPct = kpiData.revenue > 0 ? ((kpiData.foodCost / kpiData.revenue) * 100).toFixed(1) : "0.0";
    const laborCostPct = kpiData.revenue > 0 ? ((kpiData.laborCost / kpiData.revenue) * 100).toFixed(1) : "0.0";


    // --- CHART DATA PREP ---
    const breakdownData = snapshots.map(s => {
        const date = new Date(s.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(); // MON, TUE... or Date for month
        const rev = s.grossSales;
        const total = s.grossSales + s.cogs; // Just a relative scale helper if needed, but stacked bar usually total = 100% or absolute? 
        // The previous design was percentage based height bars.
        // Let's normalize height to the Max Revenue in the set to make it look like a bar chart.
        return {
            label: period === 'month' ? date.getDate().toString() : dayName,
            sales: s.grossSales,
            cost: s.cogs
        };
    });

    // Find max value for scaling graph heights
    const maxVal = Math.max(...breakdownData.map(d => d.sales + d.cost), 1); // Avoid div/0

    // --- CALENDAR DATA PREP ---
    // (Visual Calendar for current month)
    const renderCalendarDays = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayDow = new Date(year, month, 1).getDay(); // 0=Sun

        const days = [];
        // Pad empty slots (if Sunday is 0, we can shift to make Mon first, but standard cal is Sun first)
        for (let i = 0; i < firstDayDow; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);

        return days.map((day, i) => {
            if (day === null) return <div key={`pad-${i}`}></div>;

            // Check data for this day
            // Construct ISO date YYYY-MM-DD
            // Note: month is 0-indexed in JS, but 1-based in ISO
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const snap = data.dailySnapshots.find(s => s.date === dateStr);
            const isToday = day === now.getDate();

            let statusColor = 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5';
            let bgClass = '';

            if (snap) {
                // Determine Low/High based on margin? Or absolute profit?
                // Simple threshold: > 40% margin = High, < 20% = Low
                const m = snap.grossSales > 0 ? (snap.netProfit / snap.grossSales) : 0;
                if (m >= 0.4) {
                    bgClass = 'bg-[#D1FAE5] text-[#065F46]'; // High
                } else if (m < 0.2) {
                    bgClass = 'bg-[#FEE2E2] text-[#B91C1C]'; // Low
                } else {
                    statusColor = 'text-[#303030] dark:text-white font-bold'; // Has data but neutral
                }
            }

            return (
                <div key={i} className="flex items-center justify-center p-1">
                    <div className={`
                        w-8 h-8 shrink-0 aspect-square rounded-full flex items-center justify-center text-xs font-medium transition-all cursor-pointer
                        ${isToday ? 'bg-[#303030] text-white dark:bg-white dark:text-black shadow-lg scale-110' : bgClass || statusColor}
                     `}>
                        {day}
                    </div>
                </div>
            );
        });
    };


    // --- CATEGORY PERFORMANCE ---
    // Aggregate all recipe sales from the filtered snapshots
    const buildCategoryStats = (snapshotList: typeof snapshots) => {
        const stats: Record<string, { volume: number, sales: number, cost: number }> = {};
        snapshotList.forEach(s => {
            s.recipesSold.forEach(r => {
                const recipeDef = data.recipes.find(rec => rec.id === r.recipeId);
                const catName = recipeDef ? recipeDef.category : 'Other';

                if (!stats[catName]) stats[catName] = { volume: 0, sales: 0, cost: 0 };

                stats[catName].volume += r.quantity;
                stats[catName].sales += r.revenue;

                if (recipeDef) {
                    let unitCost = 0;
                    recipeDef.ingredients.forEach(ri => {
                        const ing = data.ingredients.find(i => i.id === ri.id);
                        if (ing) unitCost += ing.cost * ri.qty;
                    });
                    stats[catName].cost += unitCost * r.quantity;
                }
            });
        });
        return stats;
    };

    const categoryStats = buildCategoryStats(snapshots);
    const prevCategoryStats = buildCategoryStats(prevSnapshots);

    const categories = Object.keys(categoryStats).map(name => {
        const st = categoryStats[name];
        const prevSt = prevCategoryStats[name];
        const profit = st.sales - st.cost;

        // Calculate real trend based on previous period sales
        let trend = 0;
        if (prevSt && prevSt.sales > 0) {
            trend = ((st.sales - prevSt.sales) / prevSt.sales) * 100;
        } else if (st.sales > 0) {
            trend = 100; // New category, consider 100% growth
        }

        const costPct = st.sales > 0 ? ((st.cost / st.sales) * 100) : 0;

        return {
            name,
            volume: `${st.volume} items`,
            sales: `{currencySymbol}${st.sales.toLocaleString()}`,
            costPct: costPct.toFixed(0),
            profit: `{currencySymbol}${profit.toLocaleString()}`,
            trend: trend.toFixed(1)
        };
    }).sort((a, b) => parseFloat(b.sales.replace(/[^0-9.-]+/g, "")) - parseFloat(a.sales.replace(/[^0-9.-]+/g, ""))); // Sort by sales desc


    return (
        <div id="view-analytics" className="flex-1 overflow-y-auto no-scrollbar pb-12 space-y-8 animate-fade-in text-[#303030] dark:text-[#E7E5E4]">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-light tracking-tight text-[#303030] dark:text-white">Business Intelligence</h2>
                    <p className="text-sm text-gray-400 mt-1">Financial performance and operational metrics</p>
                </div>


                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <LiquidTabs
                            tabs={['Day', 'Week', 'Month'].map(p => ({ id: p.toLowerCase(), label: p }))}
                            activeId={period}
                            onChange={(id) => id && setPeriod(id as any)}
                            className="bg-[#F2F2F0] dark:bg-[#1A1A1A]"
                        />
                    </div>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Gross Revenue */}
                <div className="soft-card p-6 flex flex-col h-40 justify-between">

                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">GROSS REVENUE</p>
                        <h3 className="text-4xl font-semibold tracking-tight text-[#303030] dark:text-white">
                            {currencySymbol}{(kpiData.revenue / 1000).toFixed(1)}k
                        </h3>
                    </div>
                    <div className={`flex items-center gap-2 ${revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <iconify-icon icon={revenueTrend >= 0 ? "lucide:arrow-up-right" : "lucide:arrow-down-right"} width="16"></iconify-icon>
                        <span className="text-xs font-bold">{revenueTrend >= 0 ? '+' : ''}{revenueTrend.toFixed(1)}%</span>
                    </div>
                </div>

                {/* Food Cost */}
                <div className="soft-card p-6 flex flex-col h-40 justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">FOOD COST</p>
                        <h3 className="text-4xl font-semibold tracking-tight text-[#303030] dark:text-white">
                            {currencySymbol}{(kpiData.foodCost / 1000).toFixed(1)}k
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">{foodCostPct}% of Rev</span>
                    </div>
                </div>

                {/* Labor Cost */}
                <div className="soft-card p-6 flex flex-col h-40 justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">OPEX / LABOR</p>
                        <h3 className="text-4xl font-semibold tracking-tight text-[#303030] dark:text-white">
                            {currencySymbol}{(kpiData.laborCost / 1000).toFixed(1)}k
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 text-red-500">
                        <span className="text-xs font-bold">{laborCostPct}%</span>
                    </div>
                </div>

                {/* Net Profit */}
                <div className="soft-card p-6 flex flex-col h-40 justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">NET PROFIT</p>
                        <h3 className="text-4xl font-semibold tracking-tight text-[#303030] dark:text-white">
                            {currencySymbol}{(kpiData.netProfit / 1000).toFixed(1)}k
                        </h3>
                    </div>
                    <div className={`flex items-center gap-2 ${profitTrend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        <iconify-icon icon={profitTrend >= 0 ? "lucide:trending-up" : "lucide:trending-down"} width="16"></iconify-icon>
                        <span className="text-xs font-bold">{margin}% Margin {prevKpiData.netProfit > 0 ? `(${profitTrend >= 0 ? '+' : ''}${profitTrend.toFixed(1)}%)` : ''}</span>
                    </div>
                </div>
            </div>

            {/* Middle Section: Chart and Calendar */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Revenue Breakdown Chart */}
                <div className="xl:col-span-2 soft-card p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-light tracking-tight text-[#303030] dark:text-white">Revenue Breakdown</h3>
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#303030] dark:bg-white"></span> Sales
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#FCD34D]"></span> Cost
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 h-[280px]">
                        {breakdownData.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No data for this period</div>
                        ) : (
                            breakdownData.map((d, i) => {
                                // Scale Calculation
                                const salesH = (d.sales / maxVal) * 100;
                                const costH = (d.cost / maxVal) * 100; // Relative to same max? Or stacked?
                                // If stacked, sales + cost = height. 
                                // Actually, visual shows side-by-side or stacked? 
                                // The original code had separate div heights but they were "stacked" visually in a flex-col.
                                // Let's simplify: Scale sales and cost proportional to Total Revenue potential or just pure pixel height.
                                // We will rely on percentage of the container height.

                                return (
                                    <div key={i} className="flex-1 flex flex-col justify-end gap-1 group h-full relative cursor-pointer hover:bg-gray-50/50 rounded-xl transition p-1">
                                        {/* Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-[#303030] text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                                            {currencySymbol}{d.sales.toLocaleString()} Sales
                                        </div>

                                        {/* Stacked Bar Container */}
                                        <div className="w-full flex flex-col gap-1 justify-end rounded-t-2xl overflow-hidden" style={{ height: `${((d.sales + d.cost) / maxVal) * 80}%` }}>
                                            {/* Sales Part (Dark) */}
                                            <div
                                                className="w-full bg-[#303030] dark:bg-white rounded-sm relative transition-all flex-1"
                                                style={{ flexGrow: d.sales }}
                                            ></div>
                                            {/* Cost Part (Yellow) */}
                                            <div
                                                className="w-full bg-[#FCD34D] rounded-sm relative transition-all"
                                                style={{ flexGrow: d.cost }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 text-center uppercase mt-2">{d.label}</span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Profit Calendar */}
                <div className="soft-card p-8 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-light tracking-tight text-[#303030] dark:text-white">Profit Calendar</h3>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-[#303030] dark:text-white uppercase">
                                {new Date().toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="grid grid-cols-7 mb-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className="text-center text-[10px] font-bold text-gray-400">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                            {renderCalendarDays()}
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-[#FCD34D]/20">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#303030] dark:bg-white"></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Today</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Low</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Performance Table */}
            <div className="soft-card p-8">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-light tracking-tight text-[#303030] dark:text-white">Category Performance</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-[#FCD34D]/20">
                                <th className="pb-4 pl-4">Category</th>
                                <th className="pb-4">Sales Volume</th>
                                <th className="pb-4">Total Sales</th>
                                <th className="pb-4 w-1/4">Avg Cost %</th>
                                <th className="pb-4">Net Profit</th>
                                <th className="pb-4 text-right pr-4">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {categories.length === 0 ? (
                                <tr><td colSpan={6} className="py-6 text-center text-gray-400">No category data available</td></tr>
                            ) : (
                                categories.map((cat, i) => (
                                    <tr key={i} className="group hover:bg-white/40 dark:hover:bg-white/5 transition-colors border-b border-dashed border-[#FCD34D]/20 last:border-0">
                                        <td className="py-6 pl-4 font-bold text-[#303030] dark:text-gray-200">{cat.name}</td>
                                        <td className="py-6 text-gray-500 dark:text-gray-400">{cat.volume}</td>
                                        <td className="py-6 font-bold text-[#303030] dark:text-white">{cat.sales}</td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-8">{cat.costPct}%</span>
                                                <div className="h-1.5 flex-1 bg-gray-200/40 dark:bg-gray-700/40 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 rounded-full overflow-hidden transition-colors">
                                                    <div
                                                        className={`h-full rounded-full ${parseInt(cat.costPct) > 35 ? 'bg-[#FCD34D]' : 'bg-[#10B981]'}`}
                                                        style={{ width: `${cat.costPct}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 font-bold text-[#303030] dark:text-white">{cat.profit}</td>
                                        <td className={`py-6 text-right pr-4 font-bold ${parseFloat(cat.trend) > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                            {parseFloat(cat.trend) > 0 ? '+' : ''}{cat.trend}%
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};
