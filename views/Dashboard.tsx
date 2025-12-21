import React, { useMemo, useState } from 'react';
import { useApp } from '../AppContext';
import { Ingredient } from '../types';

export const Dashboard = () => {
  const { getProjection, data, getRecipeFinancials, setView, resetBuilder, setBuilder, openModal } = useApp();
  const [forecastPeriod, setForecastPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [mobileToggleOpen, setMobileToggleOpen] = useState(false);

  const f = getProjection(forecastPeriod);
  const lows = data.ingredients.filter(i => i.stockQty <= i.minStock);
  const topPerformers = useMemo(() => {
    const daily = getProjection('daily');
    const base = data.recipes.map((r) => {
      const f = getRecipeFinancials(r);
      return { r, f };
    });

    const totalGrossProfit = base.reduce((sum, x) => sum + x.f.grossProfit, 0);
    const dailyOpex = daily.opex || 0;

    return base
      .map(({ r, f }) => {
        const opexShare = totalGrossProfit > 0 ? (dailyOpex * (f.grossProfit / totalGrossProfit)) : 0;
        return { r, f, operatingProfit: f.grossProfit - opexShare };
      })
      .sort((a, b) => b.operatingProfit - a.operatingProfit)
      .slice(0, 3);
  }, [data, getProjection, getRecipeFinancials]);

  const avgMargin = data.recipes.length
    ? Math.round(data.recipes.reduce((a, b) => a + getRecipeFinancials(b).grossProfit / (getRecipeFinancials(b).netRevenue || 1), 0) / data.recipes.length * 100)
    : 0;

  // --- LOGIC: TODAY'S BOTTLENECK ---
  // Identify the single most limiting ingredient for today's forecasted orders
  const bottleneck = useMemo(() => {
    let worstBottleneck: { item: Ingredient, limit: number, affectedRecipeName: string, ratio: number } | null = null;

    // We only care about ingredients used in active recipes
    const activeIngredients = new Set<number>();
    data.recipes.forEach(r => r.ingredients.forEach(i => activeIngredients.add(i.id)));

    data.ingredients.forEach(ing => {
      if (!activeIngredients.has(ing.id)) return;

      // Calculate total daily demand for this ingredient
      let dailyDemand = 0;
      let primaryRecipe = { name: '', usage: 0, volume: 0 };

      data.recipes.forEach(r => {
        const usage = r.ingredients.find(ri => ri.id === ing.id);
        if (usage) {
          const qtyNeeded = usage.qty * r.dailyVolume;
          dailyDemand += qtyNeeded;

          // Track highest volume recipe for the "Limit" text
          if (r.dailyVolume > primaryRecipe.volume) {
            primaryRecipe = { name: r.name, usage: usage.qty, volume: r.dailyVolume };
          }
        }
      });

      if (dailyDemand > 0) {
        // How many "days" (or orders relative to forecast) do we have?
        // Actually, let's just look at if we can meet TODAY's demand.
        // Ratio < 1 means we run out today.
        const ratio = ing.stockQty / dailyDemand;

        // Potential orders for the primary recipe given current stock
        // (Assuming *only* this recipe is made, simplifying for the card subtext)
        const limit = primaryRecipe.usage > 0 ? Math.floor(ing.stockQty / primaryRecipe.usage) : 0;

        // We prioritize the lowest ratio (most critical shortage)
        if (ratio < 1.2) { // Show if we have less than 120% of today's need, prioritizing severe shortages
          if (!worstBottleneck || ratio < worstBottleneck.ratio) {
            worstBottleneck = { item: ing, limit, affectedRecipeName: primaryRecipe.name, ratio };
          }
        }
      }
    });
    return worstBottleneck;
  }, [data]);

  // --- LOGIC: RESTOCK PRIORITY ---
  // Rank by Revenue Impact
  const restockPriority = useMemo(() => {
    let topPriority: { item: Ingredient, revenueRisk: number, affectedCount: number } | null = null;

    data.ingredients.forEach(ing => {
      // Only consider items that are low or near running out
      // Using a simpler heuristic: if stock lasts < 2 days of demand

      let dailyDemand = 0;
      let revenueRisk = 0;
      let affectedCount = 0;

      data.recipes.forEach(r => {
        const usage = r.ingredients.find(ri => ri.id === ing.id);
        if (usage) {
          dailyDemand += usage.qty * r.dailyVolume;

          // Calculate potential revenue loss if we can't make this recipe
          // Loss = (Forecasted - CanMake) * Price
          const canMake = Math.floor(ing.stockQty / usage.qty);
          if (canMake < r.dailyVolume) {
            revenueRisk += (r.dailyVolume - canMake) * r.price;
            affectedCount++;
          }
        }
      });

      // If stock is low (e.g. less than 2 days worth) OR we are already losing revenue
      const daysCovered = dailyDemand > 0 ? ing.stockQty / dailyDemand : 999;

      if (revenueRisk > 0 || daysCovered < 2) {
        // Weight revenue risk heavily
        // If no immediate revenue risk, use a small proxy based on demand to break ties
        const score = revenueRisk + (1000 / (daysCovered + 0.1));

        if (!topPriority || score > topPriority.revenueRisk) {
          topPriority = { item: ing, revenueRisk: score, affectedCount };
        }
      }
    });

    return topPriority;
  }, [data]);


  return (
    <div className="view-section fade-enter space-y-6">
      {/* Featured Insight - Primary Decision Surface */}
      <div className="sticky top-[58px] md:top-[72px] z-10 bg-[#1C1C1E] dark:bg-[#1C1C1E] backdrop-blur-xl rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Subtle background glow for depth - adjusted opacity for consistent look */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full filter blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-1.5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-80 mt-1">
              {forecastPeriod === 'daily' ? "Today's Forecast" : `${forecastPeriod === 'weekly' ? 'Weekly' : 'Monthly'} Forecast`}
            </h2>

            {/* Desktop Toggle */}
            <div className="hidden md:flex bg-white/10 p-1 rounded-xl items-center h-10 relative">
              {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setForecastPeriod(p)}
                  className={`px-4 h-full rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${forecastPeriod === p ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Mobile Toggle (Compact - Expanding Overlay) */}
            <div className="md:hidden relative">
              {/* Placeholder/Trigger */}
              <button
                className={`flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide text-white transition-colors ${mobileToggleOpen ? 'invisible' : ''}`}
                onClick={() => setMobileToggleOpen(true)}
              >
                {forecastPeriod} <iconify-icon icon="lucide:chevron-down" width="12"></iconify-icon>
              </button>

              {mobileToggleOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMobileToggleOpen(false)}></div>
                  <div className="absolute top-0 right-0 z-50 bg-white/10 rounded-lg shadow-xl border border-white/10 overflow-hidden min-w-[60px] animate-in fade-in zoom-in-95 duration-200">
                     {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => { setForecastPeriod(p); setMobileToggleOpen(false); }}
                          className={`w-full text-center px-1 py-2 text-[10px] font-bold uppercase tracking-wide border-b border-white/5 last:border-0 hover:bg-white/5 ${forecastPeriod === p ? 'text-white bg-white/5' : 'text-gray-400'}`}
                        >
                          {p}
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-[#34C759] opacity-60">₱</span>
                <span className="text-6xl font-bold tracking-tighter text-[#34C759] drop-shadow-sm">{Math.floor(f.netProfit).toLocaleString()}</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-sm font-bold text-[#34C759] opacity-60 uppercase tracking-widest leading-none mb-[px]">Net</span>
                <span className="text-xl font-bold text-[#34C759] opacity-100 uppercase tracking-tight leading-none">Profit</span>
              </div>
            </div>
            <div className="text-xs font-semibold text-gray-500 mt-2 ml-1 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              Operating Profit (After OPEX)
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 border-t border-white/10 pt-5">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Net Revenue</div>
              <div className="text-xl font-semibold text-white">₱{Math.floor(f.netRevenue).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Cost</div>
              <div className="text-xl font-semibold text-[#FF453A]">₱{Math.floor(f.cogs).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Daily OPEX</div>
              <div className="text-xl font-semibold text-orange-500">₱{Math.floor(f.opex).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        {/* NEW CARD 1: TODAY'S BOTTLENECK */}
        <div
          onClick={() => setView('inventory')}
          className={`glass-thin p-5 rounded-2xl active-scale cursor-pointer transition-colors group relative overflow-hidden ${bottleneck ? 'hover:bg-orange-50/50 dark:hover:bg-orange-900/10' : 'hover:bg-white/40 dark:hover:bg-white/10'}`}
        >
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              {/* Icon changes based on state */}
              <div className={`p-1.5 rounded-md transition-colors ${bottleneck ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'}`}>
                <iconify-icon icon={bottleneck ? "lucide:alert-circle" : "lucide:check-circle-2"} width="14"></iconify-icon>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide truncate">Today's Bottleneck</span>
            </div>

            {bottleneck ? (
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight block mb-1 line-clamp-2">
                  {bottleneck.item.name}
                </span>
                <div className="flex items-center gap-1.5 opacity-80">
                  {/* Progress bar visual for limits */}
                  <div className="h-1 w-8 bg-gray-200 dark:bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-1/2"></div>
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Limits sales</span>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight block mb-1">
                  All Clear
                </span>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">No bottlenecks today</span>
              </div>
            )}
          </div>
          {/* Subtle decoration for bottleneck state */}
          {bottleneck && <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>}
        </div>

        {/* NEW CARD 2: RESTOCK PRIORITY */}
        <div
          onClick={() => restockPriority && openModal('stock', restockPriority.item)}
          className="glass-thin p-5 rounded-2xl active-scale cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors group relative overflow-hidden"
        >
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 group-hover:bg-[#007AFF] group-hover:text-white transition-colors">
                <iconify-icon icon="lucide:trending-up" width="14"></iconify-icon>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide truncate">Restock Priority</span>
            </div>

            {restockPriority ? (
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight block mb-1 line-clamp-2">
                  {restockPriority.item.name}
                </span>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                  Affects {restockPriority.affectedCount > 0 ? restockPriority.affectedCount : 'key'} recipes
                </span>
              </div>
            ) : (
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight block mb-1">
                  Good Stock
                </span>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Inventory healthy</span>
              </div>
            )}
          </div>
        </div>

        <div onClick={() => setView('recipes')} className="glass-thin p-5 rounded-2xl active-scale cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors group">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <div className="p-1.5 rounded-md bg-gray-100 dark:bg-white/10 group-hover:bg-[#007AFF] group-hover:text-white transition-colors">
                <iconify-icon icon="lucide:book-open" width="14"></iconify-icon>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide">Recipes</span>
            </div>
            <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{data.recipes.length}</span>
          </div>
        </div>
        <div onClick={() => setView('finance')} className="glass-thin p-5 rounded-2xl active-scale cursor-pointer hover:bg-white/40 dark:hover:bg-white/10 transition-colors group">
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <div className="p-1.5 rounded-md bg-gray-100 dark:bg-white/10 group-hover:bg-[#007AFF] group-hover:text-white transition-colors">
                <iconify-icon icon="lucide:percent" width="14"></iconify-icon>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide">Avg Margin</span>
            </div>
            <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">{avgMargin}%</span>
          </div>
        </div>
      </div>

      <div className={lows.length > 0 ? "animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200" : "hidden"}>
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 pl-1">Needs Attention</h3>
        {/* Opaque Surface for Readability */}
        <div className="surface-opaque rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-white/10">
          {lows.slice(0, 3).map(i => (
            <div key={i.id} className="px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" onClick={() => setView('inventory')}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{i.name}</span>
              </div>
              <span className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">{i.stockQty} {i.unit} left</span>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 pl-1">Top Performers</h3>
        {/* Opaque Surface for Readability */}
        <div className="surface-opaque rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-white/10">
          {topPerformers.map(({ r, operatingProfit }, i) => {
            return (
              <div key={r.id} className="px-5 py-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="font-medium text-gray-400 dark:text-gray-600 text-xs w-4">{i + 1}</div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none mb-1">{r.name}</p>
                    <p className="text-[10px] text-gray-500">{r.dailyVolume} orders/day</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">₱{Math.floor(operatingProfit).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400">Profit</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
