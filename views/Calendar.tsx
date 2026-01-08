import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../AppContext';
import { DailySnapshot } from '../types';
import { getCurrencySymbol } from '../lib/format-utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Calendar = () => {
    const { data, getMonthlySummary, getProjection, getRecipeFinancials } = useApp();
    const currencySymbol = getCurrencySymbol(data.settings.currency || 'PHP');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<DailySnapshot | null>(null);
    const [selectedWeek, setSelectedWeek] = useState<{ start: Date; end: Date; snapshots: DailySnapshot[] } | null>(null);
    const [isHeatmapEnabled, setIsHeatmapEnabled] = useState(false);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthSummary = getMonthlySummary(monthStr);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // ------------------------------------------------------------------
    // 1. DATA PROCESSING & LOGIC
    // ------------------------------------------------------------------

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    // Live Snapshot for Today
    const liveSnapshot = useMemo((): DailySnapshot => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const projection = getProjection('daily');
        const totalOrders = data.recipes.reduce((sum, r) => sum + r.dailyVolume, 0);

        const recipesSold = data.recipes.map(r => {
            const f = getRecipeFinancials(r);
            return {
                recipeId: r.id,
                recipeName: r.name,
                quantity: r.dailyVolume,
                revenue: f.grossSales
            };
        });

        const stockAlerts = data.ingredients
            .filter(i => i.stockQty <= i.minStock)
            .map(i => ({ ingredientId: i.id, ingredientName: i.name, stockQty: i.stockQty }));

        return {
            date: dateStr,
            grossSales: projection.grossSales,
            netRevenue: projection.netRevenue,
            cogs: projection.cogs,
            grossProfit: projection.grossProfit,
            opex: projection.opex,
            netProfit: projection.netProfit,
            vat: projection.vat,
            discounts: projection.discounts,
            totalOrders,
            recipesSold,
            stockAlerts: stockAlerts.length > 0 ? stockAlerts : undefined
        };
    }, [data, getProjection, getRecipeFinancials]);

    const getSnapshotForDate = (day: number): DailySnapshot | undefined => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const stored = data.dailySnapshots.find(s => s.date === dateStr);
        const today = new Date();
        if (!stored && year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            return liveSnapshot;
        }
        return stored;
    };

    const isTodayInCurrentMonth = () => {
        const today = new Date();
        return year === today.getFullYear() && month === today.getMonth();
    };

    // Calculate Max Profit for Heatmap Scaling
    const maxProfit = useMemo(() => {
        const profits = data.dailySnapshots
            .filter(s => s.date.startsWith(monthStr))
            .map(s => s.netProfit);
        if (isTodayInCurrentMonth()) profits.push(liveSnapshot.netProfit);
        return Math.max(...profits, 1); // Avoid division by zero
    }, [data.dailySnapshots, monthStr, liveSnapshot, year, month]);

    // ------------------------------------------------------------------
    // 2. EXPORT FUNCTIONS (PDF)
    // ------------------------------------------------------------------

    const generatePDF = (title: string, summary: any, tableData: any[], type: 'daily' | 'weekly' | 'monthly') => {
        const doc = new jsPDF();

        // Brand Header
        doc.setFontSize(20);
        doc.text("KostKitchen", 14, 20);
        doc.setFontSize(10);
        doc.text("Premium Financial Report", 14, 26);

        // Report Title
        doc.setFontSize(16);
        doc.text(title, 14, 40);

        // Summary Box
        doc.setFillColor(245, 245, 247);
        doc.roundedRect(14, 45, 180, 25, 3, 3, 'F');

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("NET PROFIT", 20, 55);
        doc.text("REVENUE", 80, 55);
        doc.text("COSTS", 140, 55);

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(`${currencySymbol} ${summary.netProfit.toLocaleString()}`, 20, 65);
        doc.text(`${currencySymbol} ${summary.revenue.toLocaleString()}`, 80, 65);
        doc.text(`${currencySymbol} ${summary.costs.toLocaleString()}`, 140, 65);

        // Table
        autoTable(doc, {
            startY: 80,
            head: [['Date / Item', 'Revenue', 'Cost', 'Profit']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
            styles: { fontSize: 10, cellPadding: 5 },
        });

        doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    };

    const exportMonthlyReport = () => {
        const snapshots = data.dailySnapshots.filter(s => s.date.startsWith(monthStr));
        if (isTodayInCurrentMonth()) {
            const exists = snapshots.find(s => s.date === liveSnapshot.date);
            if (!exists) snapshots.push(liveSnapshot);
        }

        const sortedSnapshots = snapshots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const summary = {
            netProfit: sortedSnapshots.reduce((sum, s) => sum + s.netProfit, 0),
            revenue: sortedSnapshots.reduce((sum, s) => sum + s.netRevenue, 0),
            costs: sortedSnapshots.reduce((sum, s) => sum + s.cogs, 0)
        };

        const rows = sortedSnapshots.map(s => [
            s.date,
            `${currencySymbol} ${Math.floor(s.netRevenue).toLocaleString()}`,
            `${currencySymbol} ${Math.floor(s.cogs).toLocaleString()}`,
            `${currencySymbol} ${Math.floor(s.netProfit).toLocaleString()}`
        ]);

        generatePDF(`Monthly Report - ${monthNames[month]} ${year}`, summary, rows, 'monthly');
    };

    const exportWeeklyReport = () => {
        if (!selectedWeek) return;

        const summary = {
            netProfit: selectedWeek.snapshots.reduce((sum, s) => sum + s.netProfit, 0),
            revenue: selectedWeek.snapshots.reduce((sum, s) => sum + s.netRevenue, 0),
            costs: selectedWeek.snapshots.reduce((sum, s) => sum + s.cogs, 0)
        };

        const rows = selectedWeek.snapshots.map(s => [
            s.date,
            `PHP ${Math.floor(s.netRevenue).toLocaleString()}`,
            `PHP ${Math.floor(s.cogs).toLocaleString()}`,
            `PHP ${Math.floor(s.netProfit).toLocaleString()}`
        ]);

        const startStr = selectedWeek.start.toLocaleDateString();
        const endStr = selectedWeek.end.toLocaleDateString();
        generatePDF(`Weekly Report (${startStr} - ${endStr})`, summary, rows, 'weekly');
    };

    const exportDailyReport = () => {
        if (!selectedDay) return;

        const summary = {
            netProfit: selectedDay.netProfit,
            revenue: selectedDay.netRevenue,
            costs: selectedDay.cogs
        };

        const rows = selectedDay.recipesSold
            .sort((a, b) => b.revenue - a.revenue)
            .map(r => [
                r.recipeName,
                `PHP ${Math.floor(r.revenue).toLocaleString()}`,
                '-', // Cost per recipe not readily available in this view without lookup
                '-'
            ]);

        generatePDF(`Daily Report - ${selectedDay.date}`, summary, rows, 'daily');
    };

    // ------------------------------------------------------------------
    // 3. CALENDAR GRID CONSTRUCTION
    // ------------------------------------------------------------------

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Generate weeks array
    const weeks = [];
    let currentWeek = [];

    // Fill initial empty days
    for (let i = 0; i < startingDayOfWeek; i++) {
        currentWeek.push(null);
    }

    // Fill days
    for (let day = 1; day <= daysInMonth; day++) {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // Fill remaining empty days
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    const handleWeekClick = (weekDays: (number | null)[]) => {
        const validDays = weekDays.filter((d): d is number => d !== null);
        if (validDays.length === 0) return;

        const startDay = validDays[0];
        const endDay = validDays[validDays.length - 1];

        const snapshots = validDays.map(day => getSnapshotForDate(day)).filter((s): s is DailySnapshot => !!s);

        setSelectedWeek({
            start: new Date(year, month, startDay),
            end: new Date(year, month, endDay),
            snapshots
        });
    };

    // ------------------------------------------------------------------
    // 4. UI COMPONENTS
    // ------------------------------------------------------------------

    return (
        <div id="view-reports" className="view-section fade-enter space-y-4 md:space-y-6 pb-safe-b md:pb-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 bg-gray-50/95 dark:bg-[#121212]/95 backdrop-blur-sm py-2 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:py-0">
                <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-white dark:bg-[#1A1A1A] rounded-full p-1.5 shadow-sm border border-gray-100 dark:border-white/5">
                        <button
                            onClick={prevMonth}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-all active:scale-90 touch-manipulation"
                            aria-label="Previous Month"
                        >
                            <iconify-icon icon="lucide:chevron-left" width="20"></iconify-icon>
                        </button>
                        <span className="text-base font-bold text-gray-900 dark:text-white px-3 min-w-[120px] text-center select-none">
                            {monthNames[month]} {year}
                        </span>
                        <button
                            onClick={nextMonth}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white transition-all active:scale-90 touch-manipulation"
                            aria-label="Next Month"
                        >
                            <iconify-icon icon="lucide:chevron-right" width="20"></iconify-icon>
                        </button>
                    </div>

                    {/* Mobile Export & Heatmap Toggles */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsHeatmapEnabled(!isHeatmapEnabled)}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 touch-manipulation shadow-sm border ${isHeatmapEnabled ? 'bg-[#FCD34D] text-[#303030] border-[#FCD34D]' : 'bg-white dark:bg-[#1A1A1A] text-gray-500 border-gray-100 dark:border-white/5'}`}
                            aria-label="Toggle Heatmap"
                        >
                            <iconify-icon icon="lucide:flame" width="20"></iconify-icon>
                        </button>
                        <button
                            onClick={exportMonthlyReport}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg active:scale-95 touch-manipulation"
                            aria-label="Export Report"
                        >
                            <iconify-icon icon="lucide:download" width="20"></iconify-icon>
                        </button>
                    </div>
                </div>

                {/* Monthly Summary */}
                <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 flex justify-between items-center gap-6 shadow-sm border border-gray-100 dark:border-white/5">
                    <div>
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Net Profit</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {currencySymbol}{Math.floor(monthSummary.totalNetProfit + (isTodayInCurrentMonth() && !data.dailySnapshots.find(s => s.date === liveSnapshot.date) ? liveSnapshot.netProfit : 0)).toLocaleString()}
                        </div>
                    </div>
                    <div className="text-right pl-6 border-l border-gray-100 dark:border-white/10">
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Margin</div>
                        <div className="text-xl font-bold text-[#FCD34D]">{monthSummary.avgMargin.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl p-3 md:p-6 shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                {/* Week Headers */}
                <div className="grid grid-cols-[3rem_repeat(7,1fr)] mb-3 text-center">
                    <div className="text-[11px] font-bold text-gray-400 dark:text-gray-600 self-center uppercase tracking-wider">Week</div>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{day}</div>
                    ))}
                </div>

                {/* Weeks Rows */}
                <div className="space-y-1.5">
                    {weeks.map((week, wIndex) => {
                        // Check if current week (contains today)
                        const isCurrentWeek = week.some(d => {
                            if (!d) return false;
                            const today = new Date();
                            return year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
                        });

                        return (
                            <div key={wIndex} className="grid grid-cols-[3rem_repeat(7,1fr)] gap-1.5 md:gap-3">
                                {/* Week Handle */}
                                <button
                                    onClick={() => handleWeekClick(week)}
                                    className={`
                                        flex flex-col items-center justify-center rounded-xl transition-all duration-200 group relative
                                        ${isCurrentWeek
                                            ? 'bg-[#FCD34D]/10 text-[#FCD34D]'
                                            : 'bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                                        }
                                    `}
                                >
                                    <span className="text-[10px] font-bold uppercase tracking-wider">W{wIndex + 1}</span>
                                    <iconify-icon icon="lucide:chevron-right" width="14" className={`mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isCurrentWeek ? 'opacity-50' : ''}`}></iconify-icon>
                                </button>

                                {/* Days */}
                                {week.map((day, dIndex) => {
                                    if (!day) return <div key={`empty-${dIndex}`} className="aspect-[4/5] md:aspect-square rounded-xl bg-gray-50/50 dark:bg-white/5"></div>;

                                    const snapshot = getSnapshotForDate(day);
                                    const hasData = !!snapshot;
                                    const profit = snapshot?.netProfit || 0;
                                    const revenue = snapshot?.netRevenue || 0;

                                    const isToday = year === new Date().getFullYear() &&
                                        month === new Date().getMonth() &&
                                        day === new Date().getDate();

                                    // Heatmap Style
                                    let heatmapStyle = {};
                                    let dynamicTextColor = '';
                                    let dynamicSubTextColor = '';

                                    if (isHeatmapEnabled && hasData && maxProfit > 0) {
                                        const ratio = profit / maxProfit;
                                        // Smoother intensity curve: sqrt to boost visibility of lower values
                                        const intensity = Math.max(0.1, Math.min(1, Math.sqrt(Math.abs(ratio))));
                                        const isNegative = profit < 0;

                                        // iOS System Colors
                                        // Green: #34C759 (52, 199, 89)
                                        // Red: #FF3B30 (255, 59, 48)
                                        const colorBase = isNegative ? '255, 59, 48' : '52, 199, 89';

                                        heatmapStyle = {
                                            backgroundColor: `rgba(${colorBase}, ${intensity})`,
                                            borderColor: 'transparent',
                                            boxShadow: intensity > 0.5 ? 'none' : undefined
                                        };

                                        // Dynamic Text Contrast - Force white for heatmap
                                        dynamicTextColor = 'text-white';
                                        dynamicSubTextColor = 'text-white/90';
                                    }

                                    return (
                                        <div
                                            key={day}
                                            onClick={() => snapshot && setSelectedDay(snapshot)}
                                            style={heatmapStyle}
                                            className={`
                                                aspect-[4/5] md:aspect-square rounded-xl md:rounded-2xl p-1.5 md:p-3 flex flex-col justify-between relative overflow-hidden group
                                                transition-all duration-300 ease-out touch-manipulation
                                                ${hasData
                                                    ? isHeatmapEnabled
                                                        ? 'cursor-pointer ring-0 shadow-none'
                                                        : 'cursor-pointer bg-gray-50 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 hover:bg-white hover:shadow-lg hover:ring-black/10 hover:-translate-y-1 dark:hover:bg-[#2C2C2E]'
                                                    : 'bg-transparent opacity-30 cursor-default'
                                                }
                                                ${isToday ? 'ring-2 ring-[#FCD34D] ring-offset-2 ring-offset-white dark:ring-offset-[#121212] z-10 shadow-md' : ''}
                                            `}
                                        >
                                            {!isHeatmapEnabled && hasData && (
                                                <div
                                                    className={`absolute inset-0 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${profit >= 0 ? 'bg-gradient-to-br from-green-500/10 via-transparent to-transparent' : 'bg-gradient-to-br from-red-500/10 via-transparent to-transparent'}`}
                                                ></div>
                                            )}

                                            <div className="flex justify-between items-start relative z-10">
                                                <span
                                                    className={`text-xs md:text-sm font-bold leading-none ${isToday
                                                        ? isHeatmapEnabled ? 'text-white' : 'text-[#FCD34D]'
                                                        : dynamicTextColor || (hasData
                                                            ? 'text-gray-900 dark:text-white'
                                                            : 'text-gray-400')
                                                        }`}
                                                >
                                                    {day}
                                                </span>
                                                {hasData && (
                                                    isToday && !isHeatmapEnabled ? (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#FCD34D] animate-pulse shadow-[0_0_8px_rgba(252,211,77,0.5)]"></div>
                                                    ) : isHeatmapEnabled ? (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                                                    ) : (
                                                        <div className={`w-1.5 h-1.5 rounded-full ${profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    )
                                                )}
                                            </div>

                                            {hasData && (
                                                <div className="flex flex-col items-end gap-0.5 relative z-10">
                                                    <span
                                                        className={`text-[10px] md:text-base font-bold leading-none tracking-tight ${dynamicTextColor || (profit >= 0
                                                            ? 'text-green-700 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400')
                                                            }`}
                                                    >
                                                        {/* Mobile: Compact View */}
                                                        <span className="md:hidden">
                                                            {profit >= 1000 ? `${(profit / 1000).toFixed(1)}k` : Math.floor(profit)}
                                                        </span>
                                                        {/* Desktop: Full View */}
                                                        <span className="hidden md:inline">
                                                            {currencySymbol}{Math.floor(profit).toLocaleString()}
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Day Detail Modal - rendered via portal to escape relative parent */}
            {selectedDay && createPortal(
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setSelectedDay(null)}
                    ></div>

                    {/* Content */}
                    <div className="relative w-full md:w-[600px] h-[calc(85dvh-env(safe-area-inset-top))] md:h-[670px] md:max-h-[85vh] bg-white dark:bg-[#1A1A1A] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                        {/* Mobile Drag Handle */}
                        <div className="md:hidden w-full h-6 flex items-center justify-center shrink-0 bg-white dark:bg-[#1A1A1A] pt-2" onClick={() => setSelectedDay(null)}>
                            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-4 pt-0 md:pt-6 md:px-6 md:pb-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl sticky top-0 z-10 shrink-0">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    {new Date(selectedDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </h3>
                                <p className="text-sm font-medium text-gray-500">{selectedDay.totalOrders} orders</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={exportDailyReport}
                                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95"
                                    title="Export Report"
                                >
                                    <iconify-icon icon="lucide:download" width="20"></iconify-icon>
                                </button>
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95"
                                    title="Close"
                                >
                                    <iconify-icon icon="lucide:x" width="20"></iconify-icon>
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6 pb-0 pb-safe-b">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-6 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-3xl flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Net Profit</p>
                                        <p className="text-4xl font-bold text-green-700 dark:text-green-400 mt-2 tracking-tight">{currencySymbol}{Math.floor(selectedDay.netProfit).toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shadow-inner">
                                        <iconify-icon icon="lucide:trending-up" width="24"></iconify-icon>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-3xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Revenue</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{currencySymbol}{Math.floor(selectedDay.netRevenue).toLocaleString()}</p>
                                    </div>
                                    <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-3xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Costs</p>
                                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{currencySymbol}{Math.floor(selectedDay.cogs).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Top Recipes */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                                    <iconify-icon icon="lucide:chef-hat" width="16" className="text-gray-400"></iconify-icon> Top Performers
                                </h4>
                                <div className="space-y-3">
                                    {selectedDay.recipesSold.sort((a, b) => b.revenue - a.revenue).slice(0, 5).map(r => (
                                        <div key={r.recipeId} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.recipeName}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{r.quantity} orders</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{currencySymbol}{Math.floor(r.revenue).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Weekly Summary Modal - rendered via portal to escape relative parent */}
            {selectedWeek && createPortal(
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
                    <div
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setSelectedWeek(null)}
                    ></div>
                    <div className="relative w-full md:w-[500px] h-[calc(60dvh-env(safe-area-inset-top))] md:h-auto md:max-h-[85vh] bg-white dark:bg-[#1A1A1A] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                        {/* Mobile Drag Handle */}
                        <div className="md:hidden w-full h-6 flex items-center justify-center shrink-0 bg-white dark:bg-[#1A1A1A] pt-2" onClick={() => setSelectedWeek(null)}>
                            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                        </div>

                        <div className="px-6 pb-4 pt-0 md:pt-6 md:px-6 md:pb-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl sticky top-0 z-10 shrink-0">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Weekly Summary</h3>
                                <p className="text-sm font-medium text-gray-500">
                                    {selectedWeek.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {selectedWeek.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={exportWeeklyReport}
                                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95"
                                    title="Export Report"
                                >
                                    <iconify-icon icon="lucide:download" width="20"></iconify-icon>
                                </button>
                                <button
                                    onClick={() => setSelectedWeek(null)}
                                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-95"
                                    title="Close"
                                >
                                    <iconify-icon icon="lucide:x" width="20"></iconify-icon>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6 pb-10">
                            {selectedWeek.snapshots.length > 0 ? (
                                <>
                                    <div className="text-center py-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Weekly Profit</p>
                                        <p className="text-4xl font-bold text-gray-900 dark:text-white">
                                            {currencySymbol}{selectedWeek.snapshots.reduce((sum, s) => sum + s.netProfit, 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Revenue</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                {currencySymbol}{selectedWeek.snapshots.reduce((sum, s) => sum + s.netRevenue, 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-center">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Avg Daily Profit</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {currencySymbol}{Math.floor(selectedWeek.snapshots.reduce((sum, s) => sum + s.netProfit, 0) / selectedWeek.snapshots.length).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-gray-400">
                                    No data recorded for this week yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
