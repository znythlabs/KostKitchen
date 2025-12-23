import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../AppContext';

export const Finance = () => {
  const { getProjection, data, setData, theme } = useApp();
  const [financePeriod, setFinancePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const f = getProjection(financePeriod);

  const [newExp, setNewExp] = useState({ category: '', amount: '' });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVolumeExpanded, setIsVolumeExpanded] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  // Detect when the sticky header becomes "stuck"
  useEffect(() => {
    const handleScroll = () => {
      const mainScroll = document.getElementById('main-scroll');
      if (mainScroll) {
        setIsScrolled(mainScroll.scrollTop > 10);
      }
    };

    const mainScroll = document.getElementById('main-scroll');
    mainScroll?.addEventListener('scroll', handleScroll);
    return () => mainScroll?.removeEventListener('scroll', handleScroll);
  }, []);

  const updateSetting = (field: string, val: any) => {
    setData(prev => ({ ...prev, settings: { ...prev.settings, [field]: val } }));
  };

  const updateRecipeVolume = (id: number, val: number) => {
    setData(prev => ({
      ...prev,
      recipes: prev.recipes.map(r => r.id === id ? { ...r, dailyVolume: val } : r)
    }));
  };

  const addExpense = () => {
    if (!newExp.category || !newExp.amount) return;
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        expenses: [...prev.settings.expenses, { id: Date.now(), category: newExp.category, amount: parseFloat(newExp.amount) }]
      }
    }));
    setNewExp({ category: '', amount: '' });
  };

  const removeExpense = (id: number) => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        expenses: prev.settings.expenses.filter(e => e.id !== id)
      }
    }));
  };

  const sliderColor = (val: number, min: number, max: number, color: string, track: string) => {
    const pct = ((val - min) / (max - min)) * 100;
    return `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, ${track} ${pct}%, ${track} 100%)`;
  };

  const trackColor = theme === 'light' ? "#E5E5EA" : "#38383A";
  const totalMonthlyEx = data.settings.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="view-section fade-enter space-y-6">
      {/* STICKY FINANCIAL OVERVIEW HEADER */}
      <div
        ref={stickyRef}
        className={`sticky top-[58px] md:top-16 z-20 -mx-4 md:-mx-8 px-4 md:px-8 py-4 bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-xl transition-shadow duration-700 ${isScrolled ? 'shadow-lg shadow-black/10 dark:shadow-black/30' : ''}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financial Overview</h2>
          <div className="w-full md:w-auto bg-gray-200/60 dark:bg-white/10 p-1 rounded-xl flex items-center h-12 relative self-start md:self-auto">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFinancePeriod(p)}
                className={`flex-1 md:flex-none md:w-24 h-full rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${financePeriod === p ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <div className="glass-regular bg-[#1C1C1E] dark:bg-[#1C1C1E] p-3 md:p-6 rounded-xl md:rounded-2xl">
            <p className="text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 md:mb-2 truncate">Gross Profit</p>
            <p className="text-lg md:text-3xl font-bold text-[#34C759] dark:text-[#34C759]">₱{Math.floor(f.grossProfit).toLocaleString()}</p>
            <p className="text-[9px] md:text-xs text-gray-400 mt-1 hidden md:block">Net Revenue minus Total Cost</p>
          </div>
          <div className="glass-regular p-3 md:p-6 rounded-xl md:rounded-2xl text-gray-900 dark:text-white relative overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            <div className="relative z-10">
              <p className="text-[10px] md:text-xs font-medium opacity-70 uppercase tracking-wider mb-1 md:mb-2 truncate">Net Revenue</p>
              <p className="text-lg md:text-2xl font-semibold">₱{Math.floor(f.netRevenue).toLocaleString()}</p>
              <p className="text-[9px] md:text-xs text-gray-400 mt-1 hidden md:block">After VAT & Discounts</p>
            </div>
          </div>
          <div className="glass-regular p-3 md:p-6 rounded-xl md:rounded-2xl">
            <p className="text-[10px] md:text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 md:mb-2 truncate">Total Cost</p>
            <p className="text-lg md:text-2xl font-semibold text-red-600 dark:text-red-400">₱{Math.floor(f.cogs).toLocaleString()}</p>
            <p className="text-[9px] md:text-xs text-gray-400 mt-1 hidden md:block">Total Cost of Goods Sold</p>
          </div>
        </div>
      </div>

      {/* EXPANDABLE VOLUME SIMULATOR */}
      <div className="glass-thin rounded-2xl overflow-hidden">
        <button
          onClick={() => setIsVolumeExpanded(!isVolumeExpanded)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 dark:bg-[#007AFF]/20 flex items-center justify-center text-[#007AFF]">
              <iconify-icon icon="lucide:sliders-horizontal" width="20"></iconify-icon>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Volume Simulator</h3>
              <p className="text-xs text-gray-500">Adjust daily order counts per recipe</p>
            </div>
          </div>
          <iconify-icon
            icon={isVolumeExpanded ? "lucide:chevron-up" : "lucide:chevron-down"}
            width="20"
            class="text-gray-400"
          ></iconify-icon>
        </button>

        {isVolumeExpanded && (
          <div className="relative p-6 pt-2 border-t border-black/5 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.recipes.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent border-gray-200 dark:border-white/10 transition-colors">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate flex-1">{r.name}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => updateRecipeVolume(r.id, Math.max(0, (r.dailyVolume || 0) - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 shadow-sm border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-500 hover:text-red-500 active:scale-95 transition-all"
                  >
                    <iconify-icon icon="lucide:minus" width="16"></iconify-icon>
                  </button>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={r.dailyVolume || 0}
                      onChange={e => updateRecipeVolume(r.id, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-16 text-center font-bold bg-transparent text-gray-900 dark:text-white outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-gray-400 whitespace-nowrap">orders/day</span>
                  </div>
                  <button
                    onClick={() => updateRecipeVolume(r.id, (r.dailyVolume || 0) + 1)}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 shadow-sm border border-gray-200 dark:border-transparent flex items-center justify-center text-gray-500 hover:text-green-500 active:scale-95 transition-all"
                  >
                    <iconify-icon icon="lucide:plus" width="16"></iconify-icon>
                  </button>
                </div>
              </div>
            ))}
            {data.recipes.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-sm">
                No recipes found. Create some in the Menu tab first.
              </div>
            )}
          </div>
        )}
      </div>

      {/* TWO-COLUMN LAYOUT: Tax (Left), OPEX (Right) */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Tax & Deductions */}
        <div className="glass-thin rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Tax & Deductions</h3>
            <p className="text-xs text-gray-500 mt-1">Global settings applied to all projections.</p>
          </div>

          <div className="space-y-6">
            {/* TOGGLES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* VAT TOGGLE */}
              <div
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 group relative overflow-hidden ${data.settings.isVatRegistered ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : 'bg-gray-50 dark:bg-white/5 border-transparent hover:bg-gray-100 dark:hover:bg-white/10'}`}
                onClick={() => updateSetting('isVatRegistered', !data.settings.isVatRegistered)}
              >
                <div className={`w-10 h-10 rounded-lg flex shrink-0 items-center justify-center transition-colors ${data.settings.isVatRegistered ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                  <iconify-icon icon="lucide:building-2" width="20"></iconify-icon>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${data.settings.isVatRegistered ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>VAT Registered</p>
                  <p className="text-[10px] text-gray-400 truncate">Fixed 12% Rate</p>
                </div>
                {/* Custom Checkbox */}
                <div className={`w-5 h-5 rounded-full border-2 flex shrink-0 items-center justify-center transition-all ${data.settings.isVatRegistered ? 'border-red-500 bg-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {data.settings.isVatRegistered && <iconify-icon icon="lucide:check" width="12" class="text-white"></iconify-icon>}
                </div>
              </div>

              {/* PWD TOGGLE */}
              <div
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 group relative overflow-hidden ${data.settings.isPwdSeniorActive ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30' : 'bg-gray-50 dark:bg-white/5 border-transparent hover:bg-gray-100 dark:hover:bg-white/10'}`}
                onClick={() => updateSetting('isPwdSeniorActive', !data.settings.isPwdSeniorActive)}
              >
                <div className={`w-10 h-10 rounded-lg flex shrink-0 items-center justify-center transition-colors ${data.settings.isPwdSeniorActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                  <iconify-icon icon="lucide:accessibility" width="20"></iconify-icon>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${data.settings.isPwdSeniorActive ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>PWD / Senior</p>
                  <p className="text-[10px] text-gray-400 truncate">Fixed 20% Off</p>
                </div>
                {/* Custom Checkbox */}
                <div className={`w-5 h-5 rounded-full border-2 flex shrink-0 items-center justify-center transition-all ${data.settings.isPwdSeniorActive ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                  {data.settings.isPwdSeniorActive && <iconify-icon icon="lucide:check" width="12" class="text-white"></iconify-icon>}
                </div>
              </div>
            </div>

            {/* OTHER DISCOUNTS SLIDER */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1"><iconify-icon icon="lucide:tag" width="14"></iconify-icon> Other Discounts</span>
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 rounded text-xs font-bold text-orange-600 dark:text-orange-400">{data.settings.otherDiscountRate}%</span>
              </div>
              <input
                type="range" min="0" max="50" step="1" value={data.settings.otherDiscountRate}
                onChange={e => updateSetting('otherDiscountRate', parseInt(e.target.value))}
                className="w-full h-1"
                style={{ background: sliderColor(data.settings.otherDiscountRate, 0, 50, '#F97316', trackColor) }}
              />
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/10 text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-900 dark:text-white font-semibold">Gross Sales</span>
                <span className="text-gray-900 dark:text-white font-semibold">₱{Math.floor(f.grossSales).toLocaleString()}</span>
              </div>

              <div className="space-y-1 mb-3 pt-2 border-t border-black/5 dark:border-white/5">
                {data.settings.isVatRegistered && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Less: VAT (12%)</span>
                    <span className="text-red-600 font-medium">-₱{Math.floor(f.vat).toLocaleString()}</span>
                  </div>
                )}
                {data.settings.isPwdSeniorActive && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Less: PWD/Senior</span>
                    <span className="text-blue-500 font-medium">-₱{Math.floor(f.pwdDiscount).toLocaleString()}</span>
                  </div>
                )}
                {data.settings.otherDiscountRate > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Less: Other Discounts</span>
                    <span className="text-orange-500 font-medium">-₱{Math.floor(f.otherDiscount).toLocaleString()}</span>
                  </div>
                )}
                {!data.settings.isVatRegistered && !data.settings.isPwdSeniorActive && data.settings.otherDiscountRate === 0 && (
                  <div className="text-center text-xs text-gray-400 italic py-1">No deductions active</div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-black/5 dark:border-white/10">
                <span className="text-gray-900 dark:text-white font-bold">Net Revenue</span>
                <span className="text-[#007AFF] font-bold">₱{Math.floor(f.netRevenue).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: OPEX & Fixed Costs */}
        <div className="glass-thin rounded-2xl p-6 flex flex-col">
          {/* OPEX Analysis */}
          <div className="bg-black/5 dark:bg-white/5 p-5 rounded-xl mb-6 border border-black/5 dark:border-white/10 pb-2">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">OPEX Analysis</h3>
              <p className="text-xs text-gray-500 mt-0.5">Impact on {financePeriod} profitability.</p>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-2 text-gray-500">Gross Profit (Before OPEX)</td>
                  <td className="py-2 text-right font-semibold text-gray-900 dark:text-white">₱{Math.floor(f.grossProfit).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Less: OPEX
                  </td>
                  <td className="py-2 text-right font-semibold text-blue-500">-₱{Math.floor(f.opex).toLocaleString()}</td>
                </tr>
                <tr className="border-t border-black/5 dark:border-white/5">
                  <td className="py-3 text-gray-900 dark:text-white font-bold">Operating Profit (After OPEX)</td>
                  <td className="py-3 text-right font-bold text-[#34C759]">₱{Math.floor(f.netProfit).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Monthly Fixed Costs</h3>
            <p className="text-xs text-gray-500 mt-0.5">Categorize your recurring operational expenses.</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] mb-4 pr-1">
            {data.settings.expenses.map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl group transition-all">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{e.category}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Monthly Billing</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">₱{e.amount.toLocaleString()}</span>
                  <button onClick={() => removeExpense(e.id)} className="text-red-500 p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon>
                  </button>
                </div>
              </div>
            ))}
            {data.settings.expenses.length === 0 && (
              <div className="py-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-400 text-xs">
                No monthly expenses listed.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Category"
                className="ios-input glass-input flex-1 min-w-[120px] px-3 py-2.5 text-sm"
                value={newExp.category}
                onChange={e => setNewExp({ ...newExp, category: e.target.value })}
              />
              <input
                type="number"
                placeholder="Amount"
                className="ios-input glass-input w-28 px-3 py-2.5 text-sm"
                value={newExp.amount}
                onChange={e => setNewExp({ ...newExp, amount: e.target.value })}
              />
              <button id="finance-add-btn" onClick={addExpense} className="w-10 h-10 shrink-0 bg-[#007AFF] text-white rounded-xl flex items-center justify-center active-scale">
                <iconify-icon icon="lucide:plus" width="18"></iconify-icon>
              </button>
            </div>
            <div className="pt-3 border-t border-black/5 dark:border-white/10 flex justify-between items-center">
              <span className="text-xs font-medium text-gray-400">Total Monthly OPEX</span>
              <span className="text-base font-bold text-gray-900 dark:text-white">₱{totalMonthlyEx.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};