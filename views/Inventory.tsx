import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../AppContext';
import { Ingredient } from '../types';

type SortKey = 'name' | 'supplier' | 'packageCost' | 'packageQty' | 'shippingFee' | 'unit' | 'cost' | 'stockQty' | 'minStock';
type TabType = 'ingredient' | 'other';

export const Inventory = () => {
  const { 
    data, getStockStatus, inventoryEditMode, toggleInventoryEdit, 
    openModal, updateStockItem, deleteStockItem 
  } = useApp();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>('ingredient');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id?: number, name?: string, count?: number, type: 'single' | 'bulk' } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Optimized Grid Layout (Matches editstock.html) with Selection Column
  // Reduced widths to prevent horizontal scrolling while maintaining readability
  const gridTemplate = selectionMode 
    ? "40px minmax(160px, 2fr) 85px 75px 75px 90px 75px minmax(130px, 1.2fr)"
    : "minmax(160px, 2fr) 85px 75px 75px 90px 75px minmax(130px, 1.2fr)";

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
    setDeleteConfirm({ id, name, type: 'single' });
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;
    setDeleteConfirm({ count: selectedItems.size, type: 'bulk' });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'single' && deleteConfirm.id) {
        deleteStockItem(deleteConfirm.id);
    } else if (deleteConfirm.type === 'bulk') {
        selectedItems.forEach(id => deleteStockItem(id));
        setSelectedItems(new Set());
    }
    setDeleteConfirm(null);
  };

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
        newSelected.delete(id);
    } else {
        newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
        setSelectedItems(new Set());
    } else {
        setSelectedItems(new Set(filteredItems.map(i => i.id)));
    }
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
        setSelectionMode(false);
        setSelectedItems(new Set());
    } else {
        setSelectionMode(true);
    }
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
            {selectionMode && selectedItems.size > 0 && (
                <button onClick={handleBulkDelete} className="whitespace-nowrap px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full shadow-sm active-scale flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                  <iconify-icon icon="lucide:trash-2" width="16"></iconify-icon> Delete ({selectedItems.size})
                </button>
            )}
            
            {!inventoryEditMode && (
                <button 
                  onClick={toggleSelectionMode} 
                  className={`whitespace-nowrap px-5 py-2.5 text-sm font-bold rounded-full shadow-sm active-scale transition-all flex items-center gap-2 border ${selectionMode ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black dark:border-white' : 'bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-white border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  {selectionMode ? 'Cancel' : 'Select'}
                </button>
            )}

            <button onClick={() => openModal('stock')} className="whitespace-nowrap px-4 py-2.5 bg-[#007AFF] text-white text-sm font-semibold rounded-full shadow-sm active-scale flex items-center gap-2">
              <iconify-icon icon="lucide:plus" width="16"></iconify-icon> Add
            </button>
            <button 
              onClick={toggleInventoryEdit} 
              className={`hidden md:block whitespace-nowrap px-5 py-2.5 text-sm font-bold rounded-full shadow-sm active-scale transition-all border ${inventoryEditMode ? 'bg-[#007AFF] text-white border-[#007AFF]' : 'bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-white border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              {inventoryEditMode ? 'Done' : 'Edit Stock'}
            </button>
          </div>
        </div>
      </div>

      {/* Table Container - OPAQUE SURFACE (Readability Priority) */}
      <div className="surface-opaque rounded-[24px] overflow-hidden overflow-x-auto shadow-glass-sm border border-gray-200/50 dark:border-white/10 flex-1 flex flex-col">
        <div className="w-full min-w-fit md:min-w-0 flex flex-col h-full">
          {/* Desktop Header */}
          <div 
            className="hidden md:grid gap-3 items-center px-4 py-3.5 bg-gray-50/80 dark:bg-white/5 border-b border-gray-200 dark:border-white/5 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none shrink-0"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {selectionMode && (
                <div className="flex items-center justify-center animate-in fade-in duration-200">
                    <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF] w-4 h-4 cursor-pointer"
                        checked={filteredItems.length > 0 && selectedItems.size === filteredItems.length}
                        onChange={toggleSelectAll}
                    />
                </div>
            )}
            <SortHeader label="Item & Supplier" sortKey="name" />
            <SortHeader label="Pkg. Price" sortKey="packageCost" align="right" />
            <SortHeader label="Qty/Pack" sortKey="packageQty" align="center" />
            <SortHeader label="Shipping" sortKey="shippingFee" align="center" />
            <SortHeader label="Unit Cost" sortKey="cost" align="right" />
            <SortHeader label="Min. Stock" sortKey="minStock" align="center" />
            <div>Stock Level</div>
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
                <div key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0">
                  {/* Desktop Layout */}
                  <div 
                    className="hidden md:grid gap-3 items-center px-4 py-3 text-sm transition-colors"
                    style={{ gridTemplateColumns: gridTemplate }}
                  >
                    {selectionMode && (
                        <div className="flex items-center justify-center animate-in fade-in duration-200">
                            <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF] w-4 h-4 cursor-pointer"
                                checked={selectedItems.has(item.id)}
                                onChange={() => toggleSelect(item.id)}
                            />
                        </div>
                    )}
                    {inventoryEditMode ? (
                      <>
                         {/* Item & Supplier */}
                         <div className="flex flex-col gap-2">
                            <input className="inv-field font-semibold text-sm text-gray-900 dark:text-white placeholder-gray-400 w-full" value={item.name} onChange={(e) => updateStockItem(item.id, 'name', e.target.value)} placeholder="Item Name" />
                            <input className="inv-field text-[11px] text-gray-500 uppercase tracking-wide w-full" value={item.supplier || ''} onChange={(e) => updateStockItem(item.id, 'supplier', e.target.value)} placeholder="SUPPLIER" />
                         </div>
                         
                         {/* Pkg Price & Buffer */}
                         <div className="space-y-1">
                            <div className="relative w-full">
                                <span className="absolute left-2.5 top-1.5 text-xs text-gray-400 font-medium">₱</span>
                                <input type="number" step="0.01" className="inv-field text-right w-full text-sm font-bold text-gray-900 dark:text-white pl-5 py-1" value={item.packageCost} onChange={(e) => updateStockItem(item.id, 'packageCost', e.target.value)} />
                            </div>
                            <div className="relative w-full flex items-center justify-end">
                               <span className="text-[10px] text-blue-500 font-bold mr-1">+</span>
                               <input type="number" className="inv-field text-center w-12 text-[10px] font-bold text-blue-500 py-0.5 px-1 h-6" value={item.priceBuffer} onChange={(e) => updateStockItem(item.id, 'priceBuffer', e.target.value)} placeholder="0" />
                               <span className="text-[10px] text-blue-500 font-bold ml-0.5">%</span>
                            </div>
                         </div>

                         {/* Qty/Pack */}
                         <div>
                            <input type="number" step="0.01" className="inv-field text-center w-full text-sm text-gray-500 dark:text-gray-400" value={item.packageQty} onChange={(e) => updateStockItem(item.id, 'packageQty', e.target.value)} />
                         </div>

                         {/* Shipping */}
                         <div>
                            <input type="number" step="0.01" className="inv-field text-center w-full text-sm text-gray-500 dark:text-gray-400" value={item.shippingFee} onChange={(e) => updateStockItem(item.id, 'shippingFee', e.target.value)} placeholder="0" />
                         </div>

                         {/* Unit Cost (Read Only) */}
                         <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white text-[15px]">₱{safeNumber(item.cost).toFixed(2)} / {item.unit}</p>
                         </div>

                         {/* Min Stock */}
                         <div>
                            <input type="number" step="0.01" className="inv-field text-center w-full text-sm text-gray-500 dark:text-gray-400" value={item.minStock} onChange={(e) => updateStockItem(item.id, 'minStock', e.target.value)} />
                         </div>

                         {/* Stock Level & Delete */}
                         <div className="flex flex-col gap-2">
                            <div className="flex items-center inv-field p-0 overflow-hidden bg-white dark:bg-white/5 border-gray-200 dark:border-white/10">
                                <input type="number" step="0.01" className="bg-transparent border-none outline-none text-right w-full py-1.5 pl-2 text-sm font-bold text-gray-900 dark:text-white focus:ring-0" value={item.stockQty} onChange={(e) => updateStockItem(item.id, 'stockQty', e.target.value)} />
                                <span className="text-[10px] font-semibold text-gray-400 px-2 bg-gray-50 dark:bg-white/10 h-8 flex items-center justify-center border-l border-gray-100 dark:border-white/5">{item.unit}</span>
                            </div>
                         </div>
                      </>
                    ) : (
                      <>
                        {/* Item & Supplier */}
                        <div className="flex flex-col">
                           <span className="text-[15px] font-bold text-gray-900 dark:text-white truncate">{item.name}</span>
                           <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate mt-0.5">{item.supplier || 'No Supplier'}</span>
                        </div>
                        
                        {/* Pkg Price */}
                        <div className="text-right flex flex-col items-end">
                           <span className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">₱{parseFloat(item.packageCost || '0').toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</span>
                           {hasBuffer && <div className="text-[10px] font-bold text-[#007AFF] mt-0.5">+{buffer}%</div>}
                        </div>
                        
                        {/* Qty/Pack */}
                        <div className="text-center">
                           <span className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">{item.packageQty ? safeNumber(item.packageQty).toLocaleString() : '-'}</span>
                        </div>

                        {/* Shipping */}
                        <div className="text-center">
                           <span className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">{formatShipping(item.shippingFee)}</span>
                        </div>

                        {/* Unit Cost */}
                        <div className="text-right">
                           <span className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight">₱{safeNumber(item.cost).toFixed(2)}</span>
                           <span className="text-[11px] text-gray-400 font-medium ml-0.5">/ {item.unit}</span>
                        </div>

                        {/* Min Stock */}
                        <div className="text-center">
                           <span className="text-[14px] text-gray-500 dark:text-gray-400 font-bold">{item.minStock ? safeNumber(item.minStock).toLocaleString() : '-'}</span>
                        </div>

                        {/* Stock Level */}
                        <div className="flex flex-col gap-1.5 w-full pl-2">
                           <div className="flex justify-between items-end">
                              <span className={`text-[10px] font-bold ${status.textClass} uppercase tracking-wider`}>{status.label}</span>
                              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{safeNumber(item.stockQty).toLocaleString()} {item.unit}</span>
                           </div>
                           <div className="h-1.5 w-full bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${status.colorClass}`} style={{ width: `${status.width}%` }}></div>
                           </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Mobile Layout */}
                  <div className={`flex flex-col md:hidden px-4 py-4 space-y-3 active:bg-gray-50 dark:active:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0 ${selectedItems.has(item.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`} onClick={() => {
                    if (selectionMode) {
                        toggleSelect(item.id);
                    } else if (!inventoryEditMode) {
                        toggleExpand(item.id);
                    }
                  }}>
                    <div className="flex justify-between items-start gap-3">
                      {selectionMode && (
                        <div className="flex items-center pt-1 animate-in slide-in-from-left-2 duration-200">
                             <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-[#007AFF] focus:ring-[#007AFF] w-5 h-5 cursor-pointer"
                                checked={selectedItems.has(item.id)}
                                onChange={() => toggleSelect(item.id)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                      )}
                      <div className="flex-1 pr-2">
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
                            <input className="inv-field w-full text-xs font-medium mt-1" value={item.name} onChange={(e) => updateStockItem(item.id, 'name', e.target.value)} />
                          </div>
                           <div className="col-span-1">
                            <label className="text-[10px] uppercase text-gray-400 font-bold">Supplier</label>
                            <input className="inv-field w-full text-xs mt-1" value={item.supplier} onChange={(e) => updateStockItem(item.id, 'supplier', e.target.value)} />
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                           <div className="col-span-1">
                              <label className="text-[10px] uppercase text-gray-400 font-bold">Price</label>
                              <input type="number" className="inv-field w-full text-xs text-right mt-1" value={item.packageCost} onChange={(e) => updateStockItem(item.id, 'packageCost', e.target.value)} />
                           </div>
                           <div className="col-span-1">
                              <label className="text-[10px] uppercase text-blue-500 font-bold">Buff%</label>
                              <input type="number" className="inv-field w-full text-xs text-right mt-1 text-blue-500" value={item.priceBuffer} onChange={(e) => updateStockItem(item.id, 'priceBuffer', e.target.value)} placeholder="0" />
                           </div>
                           <div className="col-span-1">
                              <label className="text-[10px] uppercase text-gray-400 font-bold">Qty</label>
                              <input type="number" className="inv-field w-full text-xs text-right mt-1" value={item.packageQty} onChange={(e) => updateStockItem(item.id, 'packageQty', e.target.value)} />
                           </div>
                           <div className="col-span-1">
                              <label className="text-[10px] uppercase text-gray-400 font-bold">Ship</label>
                              <input type="number" className="inv-field w-full text-xs text-right mt-1" value={item.shippingFee} onChange={(e) => updateStockItem(item.id, 'shippingFee', e.target.value)} />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase text-gray-400 font-bold">Stock Qty</label>
                            <input type="number" className="inv-field w-full text-xs mt-1" value={item.stockQty} onChange={(e) => updateStockItem(item.id, 'stockQty', e.target.value)} />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase text-gray-400 font-bold">Unit Cost</label>
                            <input type="number" className="inv-field w-full text-xs mt-1" value={item.cost} onChange={(e) => updateStockItem(item.id, 'cost', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mobile Edit Mode: Delete Button */}
                    {inventoryEditMode && (
                        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-white/5 mt-2">
                             <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.name); }} className="text-red-500 font-semibold text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon> Delete Item
                             </button>
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
      {deleteConfirm && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteConfirm(null)}></div>
          <div className="relative z-10 min-h-full flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 pb-6 pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                  <iconify-icon icon="lucide:alert-triangle" width="24"></iconify-icon>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Item?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {deleteConfirm.type === 'bulk'
                    ? `Are you sure you want to delete ${deleteConfirm.count} selected items? This action cannot be undone.`
                    : <>Are you sure you want to delete <span className="font-bold text-gray-900 dark:text-white">"{deleteConfirm.name}"</span>? This action cannot be undone.</>
                  }
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmDelete} className="px-4 py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
