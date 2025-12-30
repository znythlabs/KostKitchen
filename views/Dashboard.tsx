import React from 'react';
import { useApp } from '../AppContext';

export const Dashboard = () => {
  const { data, getProjection, getWeeklySummary, updateDailyTarget, getStockStatus, openPrompt, isLoading } = useApp();

  // Helper to calculate financials for a recipe
  const getRecipeFinancials = (recipe: any) => {
    let unitCost = 0;
    if (recipe.ingredients) {
      recipe.ingredients.forEach((ri: any) => {
        const ing = data.ingredients.find(i => i.id === ri.id);
        if (ing) {
          unitCost += (ing.cost || 0) * (ri.qty || 0);
        }
      });
    }
    return { unitCost, unitPrice: recipe.price || 0 };
  };

  // Real Data
  const dailyProj = getProjection('daily');
  const weeklySummary = getWeeklySummary(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)); // Last 7 days? Or just current week.

  // --- Comparison Logic (Total Sales) ---
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdaySnapshot = data.dailySnapshots.find(s => s.date === yesterdayStr);

  const totalSales = dailyProj.grossSales;
  const yesteraySales = yesterdaySnapshot ? yesterdaySnapshot.grossSales : 0;

  let salesChangePct = 0;
  let isPositive = true;

  if (yesterdaySnapshot && yesteraySales > 0) {
    salesChangePct = ((totalSales - yesteraySales) / yesteraySales) * 100;
    isPositive = salesChangePct >= 0;
  }

  // Alerts logic
  const alerts = data.ingredients
    .map(i => ({ ...i, status: getStockStatus(i) }))
    .filter(i => i.status.label !== "GOOD")
    .sort((a, b) => {
      // Sort Critical first, then Low, then Reorder
      const priority = { "CRITICAL": 0, "LOW STOCK": 1, "REORDER": 2 };
      // @ts-ignore
      return (priority[a.status.label] || 3) - (priority[b.status.label] || 3);
    });

  const lowStockCount = alerts.length;
  // cogs / sales = food cost %
  const foodCost = totalSales > 0 ? ((dailyProj.cogs / totalSales) * 100).toFixed(1) : "0";
  const profitMargin = totalSales > 0 ? ((dailyProj.grossProfit / totalSales) * 100).toFixed(1) : "0";

  // Top Movers based on daily volume * price (Revenue) or just Volume
  const topMovers = [...data.recipes]
    .sort((a, b) => (b.dailyVolume * b.price) - (a.dailyVolume * a.price))
    .slice(0, 5);

  // --- Chart Data (Last 7 Days) ---
  const chartData = data.dailySnapshots
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  // Pad if empty just for visual placeholder or show "No Data"
  // If chartData is empty, we might want to keep the mock visual but grayed out? 
  // User said "fix data never loads up", so implies they want real data.
  // If no snapshots, show empty state or single bar for "Today (Proj)"
  const chartItems = chartData.length > 0 ? chartData : [];
  // Normalize for chart height
  const maxChartVal = Math.max(...chartItems.map(d => d.netProfit), dailyProj.netProfit, 100);

  // If loading...
  if (isLoading && !data.recipes.length) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-4 border-[#FCD34D] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div id="view-dashboard" className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-6 animate-fade-in relative z-0">

      {/* KPI Row */}
      <div className="grid grid-cols-1 pt-5 md:grid-cols-4 gap-6">
        {/* TOTAL SALES - GOLD */}
        <div className="yellow-card rounded-[2rem] soft-card-gold p-6 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold text-[#303030]/80">Total Sales (Daily)</span>
            <div className="bg-[#ffffff]/50 w-10 h-10 flex items-center justify-center rounded-full">
              <iconify-icon icon="lucide:dollar-sign" width="20" className="text-[#303030]"></iconify-icon>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-medium tracking-tight text-[#303030]">₱{totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <div className="flex items-center gap-2 mt-2">
              {yesterdaySnapshot ? (
                <span className={`${isPositive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} text-[10px] uppercase font-bold px-2 py-0.5 rounded-md`}>
                  {isPositive ? '+' : ''}{salesChangePct.toFixed(1)}%
                </span>
              ) : (
                <span className="bg-[#FFFF] text-[#303030] text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">PROJ.</span>
              )}
              <span className="text-xs text-[#303030]/70 font-medium">
                {yesterdaySnapshot ? "from yesterday" : "based on volume"}
              </span>
            </div>
          </div>
        </div>

        {/* FOOD COST */}
        <div className="soft-card p-6 flex flex-col justify-between h-40 dark:bg-[#2D2A26] dark:bg-hover:[#2D2A26] dark:border-white/10">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-400">Food Cost</span>
            <div className="bg-[#ffffff] w-10 h-10 flex items-center justify-center rounded-full dark:bg-white/10">
              <iconify-icon icon="lucide:trending-down" width="20" className="text-gray-600 dark:text-gray-300"></iconify-icon>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-light tracking-tight text-[#303030] dark:text-[#E7E5E4]">{foodCost}%</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">Target: 30%</span>
            </div>
          </div>
        </div>

        {/* LOW STOCK */}
        <div className="soft-card p-6 flex flex-col justify-between h-40 dark:bg-[#2D2A26] dark:border-white/10">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-400">Low Stock Items</span>
            <div className="bg-[#ffffff] w-10 h-10 flex items-center justify-center rounded-full dark:bg-white/10">
              <iconify-icon icon="lucide:alert-circle" width="20" className="text-gray-600 dark:text-gray-300"></iconify-icon>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-light tracking-tight text-[#303030] dark:text-[#E7E5E4]">{lowStockCount}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">{lowStockCount > 0 ? "Requires attention" : "Everything good"}</span>
            </div>
          </div>
        </div>

        {/* GROSS PROFIT */}
        <div className="soft-card p-6 flex flex-col justify-between h-40 dark:bg-[#2D2A26] dark:border-white/10">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-400">Gross Profit</span>
            <div className="bg-[#ffffff] w-10 h-10 flex items-center justify-center rounded-full dark:bg-white/10">
              <iconify-icon icon="lucide:wallet" width="20" className="text-gray-600 dark:text-gray-300"></iconify-icon>
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-light tracking-tight text-[#303030] dark:text-[#E7E5E4]">₱{dailyProj.grossProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-400">{profitMargin}% margin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">

        {/* Chart Card */}
        <div className="lg:col-span-2 soft-card p-8 flex flex-col relative overflow-hidden dark:bg-[#2D2A26] dark:border-white/10 min-h-[350px]">
          {/* Chart Header */}
          <div className="flex justify-between items-center mb-8 z-10">
            <div>
              <h3 className="text-2xl font-light tracking-tight mb-1 text-[#303030] dark:text-[#E7E5E4]">Profitability Trend</h3>
              <p className="text-sm text-gray-400">Net profit history</p>
            </div>
          </div>
          {/* Chart Visual - REAL DATA */}
          <div className="flex-1 flex items-end justify-between gap-4 z-10 px-4 h-48">
            {chartItems.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No historical data yet. Capture daily snapshots to see trends.
              </div>
            ) : (
              chartItems.map((snap, i) => {
                const h = (snap.netProfit / maxChartVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                      ₱{snap.netProfit.toLocaleString()}
                    </div>
                    <div style={{ height: `${Math.max(h, 5)}%` }} className={`w-full rounded-xl transition-all duration-300 bg-[#FCD34D] hover:bg-[#303030] dark:hover:bg-[#E7E5E4]`}></div>
                  </div>
                );
              })
            )}
          </div>
          {chartItems.length > 0 && (
            <div className="flex justify-between mt-4 px-4 text-xs font-semibold text-gray-400 z-10">
              {chartItems.map((snap, i) => {
                const date = new Date(snap.date);
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return <span key={i} className="flex-1 text-center">{days[date.getDay()]}</span>;
              })}
            </div>
          )}
        </div>

        {/* Circular Progress Card */}
        <div className="soft-card p-8 flex flex-col items-center justify-center relative dark:bg-[#2D2A26] dark:border-white/0">
          <div className="absolute top-6 left-6">
            <h3 className="text-lg font-medium text-[#303030] dark:text-[#E7E5E4]">Daily Goal</h3>
          </div>

          {/* Goal Calc */}
          {(() => {
            const target = data.settings.dailySalesTarget || 35000;
            const current = dailyProj.netRevenue;
            const pct = Math.min(100, Math.round((current / target) * 100));
            const deg = (pct / 100) * 360;

            return (
              <>
                <div className="relative w-48 h-48 rounded-full flex items-center justify-center mb-6 mt-6"
                  style={{ background: `conic-gradient(#FCD34D 0deg ${deg}deg, #F3F4F6 ${deg}deg 360deg)` }}>
                  <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner dark:bg-[#2D2A26] dark:shadow-none">
                    <span className="text-4xl font-light tracking-tight text-[#303030] dark:text-[#E7E5E4]">{pct}%</span>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-1">Achieved</span>
                  </div>
                </div>
                <div className="flex gap-8 text-center">
                  <div className="group cursor-pointer" onClick={() => {
                    openPrompt("Set Daily Sales Target", target.toString(), (val) => {
                      if (val && !isNaN(parseFloat(val))) updateDailyTarget(parseFloat(val));
                    });
                  }}>
                    <p className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1 justify-center">Target <iconify-icon icon="lucide:edit-2" width="10" class="opacity-0 group-hover:opacity-100 transition-opacity"></iconify-icon></p>
                    <p className="text-lg font-medium text-[#303030] dark:text-[#E7E5E4]">₱{target.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Current</p>
                    <p className="text-lg font-medium text-[#303030] dark:text-[#E7E5E4]">₱{current.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      </div>

      {/* Bottom Section: Dark List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dark List: Tasks/Alerts */}
        <div className="lg:col-span-1 black-card text-white rounded-[2.5rem] p-8 flex flex-col shadow-[0_10px_5px_-5px_rgba(0,0,0,0.1)] dark:bg-[#303030] dark:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.5)] max-h-[400px]">
          <div className="flex justify-between items-center mb-6 sticky top-0 z-10">
            <h3 className="text-xl font-light">Action Required</h3>
            <span className="text-sm text-gray-400">System</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                No active alerts
              </div>
            ) : (
              alerts.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="font-medium text-sm text-[#E7E5E4]">{item.name}</p>
                    <p className="text-[10px] text-gray-400">{item.stockQty} {item.unit} (Min: {item.minStock})</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${item.status.textClass} bg-white/10`}>
                    {item.status.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menu Engineering Table - REAL DATA */}
        <div className="lg:col-span-2 soft-card p-8 dark:bg-[#2D2A26] dark:border-white/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-light tracking-tight text-[#303030] dark:text-[#E7E5E4]">Top Movers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-white/10">
                  <th className="pb-3 font-medium">Item Name</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Vol/Day</th>
                  <th className="pb-3 font-medium">Cost %</th>
                  <th className="pb-3 font-medium text-right">Profit/Unit</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topMovers.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">No recipes found. Add some to see data!</td></tr>
                ) : (
                  topMovers.map(r => {
                    const fin = getRecipeFinancials(r);
                    const costPct = (fin.unitCost / fin.unitPrice) * 100;
                    return (
                      <tr key={r.id} className="group hover:bg-gray-50 transition-colors dark:hover:bg-white/5">
                        <td className="py-4 font-medium text-gray-800 pl-2 rounded-l-xl dark:text-[#E7E5E4]">{r.name}</td>
                        <td className="py-4"><span className="px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-xs font-semibold dark:bg-orange-500/20 dark:text-orange-400">{r.category}</span></td>
                        <td className="py-4 text-gray-500 dark:text-gray-400">{r.dailyVolume}</td>
                        <td className="py-4 font-semibold text-gray-600 dark:text-gray-400">{costPct.toFixed(0)}%</td>
                        <td className="py-4 text-right pr-2 rounded-r-xl font-medium text-[#303030] dark:text-[#E7E5E4]">₱{(fin.unitPrice - fin.unitCost).toFixed(2)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
