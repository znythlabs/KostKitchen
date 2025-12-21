import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { Ingredient } from '../types';

type SortKey = 'name' | 'supplier' | 'packageCost' | 'packageQty' | 'shippingFee' | 'unit' | 'cost' | 'stockQty';
type TabType = 'ingredient' | 'other';

export const Inventory = () => {
  const { 
    data, getStockStatus, inventoryEditMode, toggleInventoryEdit, 
    openModal, updateStockItem, deleteStockItem, askConfirmation 
  } = useApp();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>('ingredient');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filteredItems = useMemo(() => {
    let items = data.ingredients.filter(i => {
      const itemType = i.type || 'ingredient';
      const matchesSearch = 
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.supplier.toLowerCase().includes(search.toLowerCase()) ||
        i.unit.toLowerCase().includes(search.toLowerCase());
      
      return itemType === activeTab && matchesSearch;
    });

    return items.sort((a, b) => {
      // @ts-ignore
      const aVal = a[sortConfig.key] || 0;
      // @ts-ignore
      const bVal = b[sortConfig.key] || 0;
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        comparison = sortConfig.direction === 'asc' ? (Number(aVal) - Number(bVal)) : (Number(bVal) - Number(aVal));
      }

      // Tie-breaker: Stable sort using ID if values are equal
      if (comparison === 0) {
        return a.id - b.id;
      }
      return comparison;
    });
  }, [data.ingredients, search, activeTab, sortConfig]);

  const toggleSort = (key: SortKey) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const handleDelete = (id: number, name: string) => {
    askConfirmation({
      title: 'Delete Item?',
      message: `Are you sure you want to remove "${name}" from inventory?`,
      isDestructive: true,
      onConfirm: () => deleteStockItem(id)
    });
  };

  const formatShipping = (val?: number) => {
    if (val === undefined || val === null || isNaN(Number(val))) return '-';
    if (Number(val) === 0) return '0';
    return `₱${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

  const safeNumber = (val: any) => Number(val) || 0;
  const toggleExpand = (id: number) => setExpandedId(prev => prev === id ? null : id);

  const SortHeader = ({ label, sortKey, className = "", align = 'left' }: { label: string, sortKey: SortKey, className?: string, align?: 'left' | 'right' | 'center' }) => (
    <div 
      className={`${className} flex items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors group ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}
      onClick={() => toggleSort(sortKey)}
    >
      {align === 'right' && (
        <iconify-icon icon={sortConfig.direction === 'asc' ? "lucide:chevron-up" : "lucide:chevron-down"} width="10" class={`text-gray-400 ${sortConfig.key === sortKey ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></iconify-icon>
      )}
      <span className="truncate">{label}</span>
      {align !== 'right' && (
        <iconify-icon icon={sortConfig.direction === 'asc' ? "lucide:chevron-up" : "lucide:chevron-down"} width="10" class={`text-gray-400 ${sortConfig.key === sortKey ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></iconify-icon>
      )}
    </div>
  );

  return (
    <div className="view-section fade-enter space-y-4 flex flex-col h-[calc(100vh-140px)]">
      {/* Controls Container - Dense */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 shrink-0 p-1">
        <div className="flex items-center gap-2">
           {/* Enlarged Tabs - Updated to Segmented Control Standard */}
           <div className="bg-gray-200/60 dark:bg-white/10 p-1 rounded-xl flex items-center h-12 relative">
             <button 
                onClick={() => setActiveTab('ingredient')} 
                className={`px-6 h-full rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'ingredient' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
             >
                Ingredients
             </button>
             <button 
                onClick={() => setActiveTab('other')} 
                className={`px-6 h-full rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'other' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
             >
                Other Items
             </button>
           </div>
        </div>

        <div className="flex items-center gap-2 flex-1 md:justify-end overflow-hidden">
          <div className="relative flex-1 md:max-w-[240px]">
            <iconify-icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16"></iconify-icon>
            <input 
              type="text" 
              placeholder={`Search ${activeTab === 'ingredient' ? 'ingredients' : 'items'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ios-input glass-input w-full pl-9 py-2.5 text-sm text-gray-900 dark:text-white" 
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <button onClick={() => openModal('stock')} className="whitespace-nowrap px-4 py-2.5 bg-[#007AFF] text-white text-sm font-semibold rounded-full shadow-sm active-scale flex items-center gap-2">
              <iconify-icon icon="lucide:plus" width="16"></iconify-icon> Add
            </button>
            <button 
              onClick={toggleInventoryEdit} 
              className={`hidden md:block whitespace-nowrap px-5 py-2.5 text-sm font-semibold rounded-full border shadow-sm active-scale ${inventoryEditMode ? 'bg-[#007AFF] text-white border-transparent' : 'glass-thin text-gray-900 dark:text-white'}`}
            >
              {inventoryEditMode ? 'Done' : 'Edit Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Table Container - OPAQUE SURFACE (Readability Priority) */}
      <div className="surface-opaque rounded-2xl flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center px-6 py-3 bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none shrink-0">
          <SortHeader label="Item & Supplier" sortKey="name" className="w-[22%]" />
          <SortHeader label="Pkg. Price" sortKey="packageCost" className="w-[10%]" align="right" />
          <SortHeader label="Qty/Pack" sortKey="packageQty" className="w-[8%]" align="right" />
          <SortHeader label="Shipping" sortKey="shippingFee" className="w-[8%]" align="right" />
          <SortHeader label="Unit Cost" sortKey="cost" className="w-[12%]" align="right" />
          <SortHeader label="Min. Stock" sortKey="minStock" className="w-[10%]" align="center" />
          <div className="w-[30%] pl-6">Stock Level</div>
        </div>

        {/* Table Body */}
        <div className="overflow-y-auto flex-1 p-0 overscroll-contain touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="divide-y divide-gray-100 dark:divide-white/10">
            {filteredItems.map(item => {
              const status = getStockStatus(item);
              const original = safeNumber(item.packageCost);
              const buffer = safeNumber(item.priceBuffer);
              const bufferedPrice = original * (1 + buffer / 100);
              const hasBuffer = buffer > 0;
              
              return (
                <div key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center px-6 py-3 text-sm">
                    {inventoryEditMode ? (
                      <>
                         <div className="w-[22%] pr-4 space-y-1">
                            <input className="ios-input glass-input w-full px-2 py-1 text-xs font-medium" value={item.name} onChange={(e) => updateStockItem(item.id, 'name', e.target.value)} placeholder="Item Name" />
                            <input className="ios-input glass-input w-full px-2 py-1 text-xs text-gray-500" value={item.supplier} onChange={(e) => updateStockItem(item.id, 'supplier', e.target.value)} placeholder="Supplier" />
                         </div>
                         <div className="w-[10%] pl-2 space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-gray-400 w-4 text-right shrink-0">P</span>
                              <input type="number" className="ios-input glass-input w-full px-1 py-1 text-xs text-right" value={item.packageCost} onChange={(e) => updateStockItem(item.id, 'packageCost', e.target.value)} />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-gray-400 w-4 text-right shrink-0">B%</span>
                              <input type="number" className="ios-input glass-input w-full px-1 py-1 text-xs text-right text-blue-500" value={item.priceBuffer} onChange={(e) => updateStockItem(item.id, 'priceBuffer', e.target.value)} placeholder="0" />
                            </div>
                         </div>
                         <div className="w-[8%] pl-2"><input type="number" className="ios-input glass-input w-full px-1 py-1 text-xs text-right" value={item.packageQty} onChange={(e) => updateStockItem(item.id, 'packageQty', e.target.value)} /></div>
                         <div className="w-[8%] pl-2"><input type="number" className="ios-input glass-input w-full px-1 py-1 text-xs text-right" value={item.shippingFee} onChange={(e) => updateStockItem(item.id, 'shippingFee', e.target.value)} /></div>
                         <div className="w-[12%] pl-4 flex items-center gap-1">
                            <input type="number" className="ios-input glass-input w-full px-2 py-1 text-xs text-right" value={item.cost} disabled title="Calculated automatically" />
                            <span className="text-gray-400 text-xs whitespace-nowrap">/ {item.unit}</span>
                         </div>
                         <div className="w-[10%] px-4">
                            <input type="number" className="ios-input glass-input w-full px-2 py-1 text-xs text-center" value={item.minStock} onChange={(e) => updateStockItem(item.id, 'minStock', e.target.value)} placeholder="Min" />
                         </div>
                         <div className="w-[30%] pl-6 flex items-center gap-2">
                            <input type="number" className="ios-input glass-input w-24 px-2 py-1 text-xs text-right font-bold" value={item.stockQty} onChange={(e) => updateStockItem(item.id, 'stockQty', e.target.value)} />
                            <span className="text-xs text-gray-500">{item.unit}</span>
                            <button onClick={() => handleDelete(item.id, item.name)} className="ml-auto text-red-500 hover:bg-red-100 p-1.5 rounded-lg transition-colors"><iconify-icon icon="lucide:trash-2" width="14"></iconify-icon></button>
                         </div>
                      </>
                    ) : (
                      <>
                        <div className="w-[22%] pr-2 flex items-center justify-between group/edit">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white truncate" title={item.name}>{item.name}</div>
                            <div className="text-xs text-gray-400 truncate mt-0.5">{item.supplier}</div>
                          </div>
                        </div>
                        <div className="w-[10%] text-right">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {item.packageCost ? `₱${bufferedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '-'}
                          </div>
                          {hasBuffer && <div className="text-[9px] text-[#007AFF] font-bold">+{buffer}%</div>}
                        </div>
                        <div className="w-[8%] text-right text-gray-500 text-xs">{item.packageQty ? safeNumber(item.packageQty).toLocaleString() : '-'}</div>
                        <div className="w-[8%] text-right text-gray-500 text-xs">{formatShipping(item.shippingFee)}</div>
                        <div className="w-[12%] text-right">
                          <span className="font-semibold text-gray-900 dark:text-white">₱{safeNumber(item.cost).toFixed(2)}</span>
                          <span className="text-gray-400 ml-1 font-normal text-xs">/ {item.unit}</span>
                        </div>
                        <div className="w-[10%] text-center text-xs font-medium text-gray-400">
                            {item.minStock ? item.minStock.toLocaleString() : '-'}
                        </div>
                        <div className="w-[30%] pl-6">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${status.bgClass} ${status.textClass}`}>{status.label}</span>
                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{safeNumber(item.stockQty).toLocaleString()} {item.unit}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                             {/* Optional: Marker for Min Stock if we want to be fancy, but simple bar is cleaner */}
                            <div className={`h-full rounded-full transition-all duration-500 relative ${status.colorClass}`} style={{ width: `${status.width}%` }}>
                                <div className="absolute inset-0 bg-white/20"></div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile Layout */}
                  <div className="flex flex-col md:hidden px-4 py-4 space-y-3 active:bg-gray-50 dark:active:bg-white/5 transition-colors" onClick={() => !inventoryEditMode && toggleExpand(item.id)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                           <div className="font-semibold text-gray-900 dark:text-white text-base">{item.name}</div>
                           {!inventoryEditMode && <button onClick={(e) => { e.stopPropagation(); openModal('stock', item); }} className="text-gray-400 p-1"><iconify-icon icon="lucide:pencil" width="14"></iconify-icon></button>}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.supplier || "No Supplier"}</div>
                      </div>
                      <div className="text-right shrink-0">
                         <div className="font-semibold text-gray-900 dark:text-white">₱{safeNumber(item.cost).toFixed(3)} <span className="text-gray-400 font-normal">/ {item.unit}</span></div>
                      </div>
                    </div>
                    
                    {/* Expanded Content for Mobile */}
                    {!inventoryEditMode && expandedId === item.id && (
                      <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100 dark:border-white/10 animate-in slide-in-from-top-2 fade-in duration-200">
                          <div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Package</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                              {item.packageCost ? `₱${bufferedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                            </div>
                            {hasBuffer && <div className="text-[10px] text-[#007AFF] font-medium">+ {buffer}% Buffer</div>}
                          </div>
                          <div>
                             <div className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Qty / Pack</div>
                             <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                               {item.packageQty ? safeNumber(item.packageQty).toLocaleString() : '-'}
                             </div>
                          </div>
                          <div>
                             <div className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Stock Status</div>
                             <div className={`text-sm font-bold mt-1 ${status.textClass}`}>{status.label}</div>
                             <div className="text-[10px] text-gray-500">{safeNumber(item.stockQty).toLocaleString()} {item.unit} remaining</div>
                          </div>
                          <div>
                             <div className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">Shipping</div>
                             <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                               {formatShipping(item.shippingFee)}
                             </div>
                          </div>
                      </div>
                    )}

                    {!inventoryEditMode && (
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex-1">
                          <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${status.colorClass}`} style={{ width: `${status.width}%` }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {inventoryEditMode && (
                      <div className="space-y-3 py-2 bg-gray-50 dark:bg-white/5 -mx-2 px-2 rounded-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-1">
                            <label className="text-[10px] uppercase text-gray-400 font-bold">Item Name</label>
                            <input className="ios-input glass-input w-full px-2 py-1.5 text-xs font-medium mt-1" value={item.name} onChange={(e) => updateStockItem(item.id, 'name', e.target.value)} />
                          </div>
                           <div className="col-span-1">
                            <label className="text-[10px] uppercase text-gray-400 font-bold">Supplier</label>
                            <input className="ios-input glass-input w-full px-2 py-1.5 text-xs mt-1" value={item.supplier} onChange={(e) => updateStockItem(item.id, 'supplier', e.target.value)} />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                           <div className="col-span-1">
                              <label className="text-[10px] uppercase text-gray-400 font-bold">Price</label>
                              <input type="number" className="ios-input glass-input w-full px-2 py-1.5 text-xs text-right mt-1" value={item.packageCost} onChange={(e) => updateStockItem(item.id, 'packageCost', e.target.value)} />
                           </div>
                           <div className="col-span-1">
                              <label className="text-[10px] uppercase text-blue-500 font-bold">Buff%</label>
                              <input type="number" className="ios-input glass-input w-full px-2 py-1.5 text-xs text-right mt-1 text-blue-500" value={item.priceBuffer} onChange={(e) => updateStockItem(item.id, 'priceBuffer', e.target.value)} placeholder="0" />
                           </div>
                           <div className="col-span-1">
                              <label className="text-[10px] uppercase text-gray-400 font-bold">Qty</label>
                              <input type="number" className="ios-input glass-input w-full px-2 py-1.5 text-xs text-right mt-1" value={item.packageQty} onChange={(e) => updateStockItem(item.id, 'packageQty', e.target.value)} />
                           </div>
                           <div className="col-span-1">
                              <label className="text-[10px] uppercase text-gray-400 font-bold">Ship</label>
                              <input type="number" className="ios-input glass-input w-full px-2 py-1.5 text-xs text-right mt-1" value={item.shippingFee} onChange={(e) => updateStockItem(item.id, 'shippingFee', e.target.value)} />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase text-gray-400 font-bold">Stock Qty</label>
                            <input type="number" className="ios-input glass-input w-full px-2 py-1.5 text-xs mt-1" value={item.stockQty} onChange={(e) => updateStockItem(item.id, 'stockQty', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-gray-400 font-bold">Unit Cost</label>
                            <input type="number" className="ios-input glass-input w-full px-2 py-1.5 text-xs mt-1" value={item.cost} onChange={(e) => updateStockItem(item.id, 'cost', e.target.value)} />
                          </div>
                        </div>
                        <button onClick={() => handleDelete(item.id, item.name)} className="w-full py-2 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg text-xs font-bold mt-1">Delete Item</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                   <iconify-icon icon="lucide:package-search" width="24" class="text-gray-400"></iconify-icon>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No {activeTab === 'ingredient' ? 'ingredients' : 'items'} found</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">Try adjusting your search or add a new {activeTab === 'ingredient' ? 'ingredient' : 'item'}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};