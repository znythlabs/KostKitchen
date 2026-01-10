import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { CustomSelect } from './CustomSelect';
import { getCurrencySymbol } from '../lib/format-utils';
import { LiquidTabs } from './LiquidTabs';

const ConfirmationModal = () => {
  const { confirmModal, closeConfirmation } = useApp();

  if (!confirmModal.isOpen) return null;

  const handleConfirm = () => {
    confirmModal.onConfirm();
    closeConfirmation();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity" onClick={closeConfirmation}></div>
      <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl rounded-[2rem] shadow-2xl max-w-sm w-full relative z-10 overflow-hidden fade-enter border border-white/20 dark:border-white/10 ring-1 ring-black/5">
        <div className="p-6 text-center">
          <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4 ${confirmModal.isDestructive ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-[#FCD34D]/20 text-[#FCD34D]'}`}>
            <iconify-icon icon="lucide:alert-triangle" width="24"></iconify-icon>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{confirmModal.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{confirmModal.message}</p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-[#38383A]">
          <button
            onClick={closeConfirmation}
            className="bg-white dark:bg-[#1C1C1E] p-4 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`bg-white dark:bg-[#1C1C1E] p-4 text-sm font-semibold transition-colors ${confirmModal.isDestructive ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-[#FCD34D] hover:bg-[#FCD34D]/10'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const CookModal = () => {
  const { cookModal, closeCookModal, cookRecipe } = useApp();
  const [portions, setPortions] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (cookModal.isOpen) {
      setPortions(1);
      setIsSuccess(false);
    }
  }, [cookModal.isOpen]);

  if (!cookModal.isOpen) return null;

  const handleCook = async () => {
    if (cookModal.recipeId && portions > 0) {
      await cookRecipe(cookModal.recipeId, portions);
      setIsSuccess(true);
      setTimeout(() => {
        closeCookModal();
      }, 1500);
    }
  };

  const increment = () => setPortions(p => p + 1);
  const decrement = () => setPortions(p => Math.max(1, p - 1));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity" onClick={closeCookModal}></div>
      <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl max-w-sm w-full relative z-10 overflow-hidden fade-enter border border-white/20 dark:border-white/10 ring-1 ring-black/5 p-8 flex flex-col items-center text-center transition-all duration-300">

        {isSuccess ? (
          <div className="py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center mb-6 mx-auto">
              <iconify-icon icon="lucide:check" width="40"></iconify-icon>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Bon Appétit!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Inventory updated successfully.</p>
          </div>
        ) : (
          <>
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center mb-6 shadow-sm">
              <iconify-icon icon="lucide:flame" width="32"></iconify-icon>
            </div>

            {/* Text Content */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cook: {cookModal.recipeName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-[240px]">Enter number of servings to deduct from inventory.</p>

            {/* Stepper Input */}
            <div className="flex items-center gap-6 mb-8">
              <button
                onClick={decrement}
                className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors active:scale-95"
              >
                <iconify-icon icon="lucide:minus" width="20"></iconify-icon>
              </button>
              <div className="text-4xl font-bold text-gray-900 dark:text-white w-16 text-center tabular-nums">
                {portions}
              </div>
              <button
                onClick={increment}
                className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-colors active:scale-95"
              >
                <iconify-icon icon="lucide:plus" width="20"></iconify-icon>
              </button>
            </div>

            {/* Actions */}
            <div className="w-full space-y-4">
              <button
                onClick={handleCook}
                className="w-full bg-[#FCD34D] hover:opacity-90 text-[#303030] font-bold py-4 rounded-xl shadow-lg shadow-[#FCD34D]/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <iconify-icon icon="lucide:check-circle" width="20"></iconify-icon>
                <span>Confirm & Deduct</span>
              </button>
              <button
                onClick={closeCookModal}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const PromptModal = () => {
  const { promptModal, closePrompt } = useApp();
  const [value, setValue] = useState('');

  // Reset value when modal opens
  useEffect(() => {
    if (promptModal.isOpen) {
      setValue(promptModal.defaultValue || '');
    }
  }, [promptModal.isOpen, promptModal.defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      promptModal.onConfirm(value);
      closePrompt();
    }
  };

  if (!promptModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity" onClick={closePrompt}></div>
      <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl rounded-[2rem] shadow-2xl max-w-sm w-full relative z-10 overflow-hidden fade-enter border border-white/20 dark:border-white/10 ring-1 ring-black/5">
        <form onSubmit={handleSubmit} className="p-8 text-center flex flex-col gap-6">
          <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center shadow-sm bg-[#FCD34D]/10 text-[#FCD34D] dark:bg-[#FCD34D]/20 dark:text-[#FCD34D]">
            <iconify-icon icon="lucide:edit-3" width="24"></iconify-icon>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#303030] dark:text-[#E7E5E4] mb-2">{promptModal.title}</h3>
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#FCD34D]/20 focus:border-[#FCD34D] outline-none transition-all text-center font-medium text-lg placeholder:text-gray-400"
            autoFocus
            placeholder="Type here..."
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={closePrompt}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 py-3 px-4 rounded-xl font-bold shadow-lg shadow-[#FCD34D]/20 text-[#303030] text-sm transition-transform active:scale-95 bg-[#FCD34D] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Modals = () => {
  const { activeModal, closeModal, data, builder, setBuilder, addStockItem, updateStockItemFull, deleteStockItem, editingStockItem, pickerFilter, inventoryCategories, addInventoryCategory } = useApp();
  const currencySymbol = getCurrencySymbol(data.settings.currency || 'PHP');
  const [pickerSearch, setPickerSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stockForm, setStockForm] = useState({
    name: '',
    category: '',
    cost: '',
    unit: 'g',
    qty: '',
    min: '',
    supplier: '',
    packageCost: '',
    packageQty: '',
    shippingFee: '',
    priceBuffer: '',
    type: 'ingredient' as 'ingredient' | 'other'
  });

  // Load editing item
  useEffect(() => {
    if (editingStockItem && activeModal === 'stock') {
      setShowDeleteConfirm(false);
      setStockForm({
        name: editingStockItem.name,
        cost: editingStockItem.cost.toString(),
        unit: editingStockItem.unit,
        qty: editingStockItem.stockQty.toString(),
        min: editingStockItem.minStock.toString(),
        supplier: editingStockItem.supplier,
        packageCost: editingStockItem.packageCost?.toString() || '',
        packageQty: editingStockItem.packageQty?.toString() || '',
        shippingFee: editingStockItem.shippingFee?.toString() || '',
        priceBuffer: editingStockItem.priceBuffer?.toString() || '',
        type: editingStockItem.type || 'ingredient',
        category: editingStockItem.category || ''
      });
    } else if (activeModal === 'stock') {
      // Reset
      setShowDeleteConfirm(false);
      setStockForm({ name: '', category: '', cost: '', unit: 'g', qty: '', min: '', supplier: '', packageCost: '', packageQty: '', shippingFee: '', priceBuffer: '', type: pickerFilter || 'ingredient' });
    }
  }, [activeModal, editingStockItem, pickerFilter]);

  const handleDelete = () => {
    if (editingStockItem) {
      deleteStockItem(editingStockItem.id);
      closeModal();
    }
  };

  // Auto-calculate Unit Cost when package details change
  useEffect(() => {
    const pc = parseFloat(stockForm.packageCost);
    const pq = parseFloat(stockForm.packageQty);
    const sf = parseFloat(stockForm.shippingFee) || 0;
    const bf = parseFloat(stockForm.priceBuffer) || 0;

    if (!isNaN(pc) && !isNaN(pq) && pq > 0) {
      // Effective Package Price = Original * (1 + Buffer%) + Shipping
      const bufferedPackageCost = pc * (1 + (bf / 100));
      const unitCost = (bufferedPackageCost + sf) / pq;
      setStockForm(prev => ({ ...prev, cost: unitCost.toFixed(3) }));
    }
  }, [stockForm.packageCost, stockForm.packageQty, stockForm.shippingFee, stockForm.priceBuffer]);

  const handlePickerToggle = (id: number) => {
    const exists = builder.ingredients.find(i => i.id === id);
    if (exists) {
      setBuilder(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter(i => i.id !== id)
      }));
    } else {
      setBuilder(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, { id, qty: 1 }]
      }));
    }
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      name: stockForm.name,
      cost: parseFloat(stockForm.cost),
      unit: stockForm.unit,
      stockQty: parseFloat(stockForm.qty),
      minStock: parseFloat(stockForm.min),
      supplier: stockForm.supplier,
      packageCost: parseFloat(stockForm.packageCost) || undefined,
      packageQty: parseFloat(stockForm.packageQty) || undefined,
      shippingFee: parseFloat(stockForm.shippingFee) || 0,
      priceBuffer: parseFloat(stockForm.priceBuffer) || 0,
      type: stockForm.type,
      category: stockForm.category || undefined
    };

    if (editingStockItem) {
      // Update existing
      updateStockItemFull(editingStockItem.id, payload);
    } else {
      // Add new
      addStockItem({
        id: Date.now(),
        ...payload
      });
    }

    // Add category to list if new
    if (stockForm.category) addInventoryCategory(stockForm.category);
    closeModal();
  };

  // Filter items based on active picker context
  const filteredItems = data.ingredients.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(pickerSearch.toLowerCase());
    const matchesType = pickerFilter ? (i.type || 'ingredient') === pickerFilter : true;
    return matchesSearch && matchesType;
  });

  return (
    <>
      {activeModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 transition-opacity duration-300"
          onClick={closeModal}
        ></div>
      )}

      {/* Picker Modal */}
      <div className={`fixed z-[100] bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl shadow-2xl flex flex-col w-full md:w-[440px] h-[calc(100dvh-env(safe-area-inset-top))] md:h-[600px] md:rounded-[2rem] rounded-t-[2rem] border border-white/20 dark:border-white/10 ring-1 ring-black/5 transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${activeModal === 'picker' ? 'modal-active bottom-0 left-0 md:top-1/2 md:left-1/2' : 'modal-enter bottom-0 left-0 md:top-1/2 md:left-1/2'}`} style={{ display: activeModal === 'picker' ? 'flex' : 'none' }}>
        <div className="md:hidden w-full h-6 flex items-center justify-center shrink-0" onClick={closeModal}>
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="px-6 pb-4 pt-2 md:p-6 flex justify-between items-center shrink-0">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            Add {pickerFilter === 'other' ? 'Other Items' : 'Ingredients'}
          </h3>
          <button onClick={closeModal} className="hidden md:flex w-8 h-8 bg-gray-100 dark:bg-[#2C2C2E] rounded-full items-center justify-center text-gray-500 hover:bg-gray-200">
            <iconify-icon icon="lucide:x" width="16"></iconify-icon>
          </button>
        </div>
        <div className="px-6 py-4 shrink-0">
          <div className="relative">
            <iconify-icon icon="lucide:search" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16"></iconify-icon>
            <input
              type="text"
              placeholder={`Search ${pickerFilter === 'other' ? 'items' : 'ingredients'}...`}
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              className="ios-input w-full bg-gray-50 dark:bg-[#2C2C2E] pl-10 py-3 text-sm font-medium shadow-none focus:bg-gray-100 dark:focus:bg-[#3A3A3C] text-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-safe-b">
          {filteredItems.map(i => {
            const isSelected = builder.ingredients.some(b => b.id === i.id);
            return (
              <div key={i.id} onClick={() => handlePickerToggle(i.id)} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-[#38383A] last:border-0 cursor-pointer hover:opacity-70 group">
                <div>
                  <p className={`text-sm font-medium ${isSelected ? 'text-[#FCD34D]' : 'text-gray-900 dark:text-white'}`}>{i.name}</p>
                  <p className="text-[10px] text-gray-400">{currencySymbol}{i.cost} / {i.unit}</p>
                </div>
                <iconify-icon
                  icon={isSelected ? "lucide:minus-circle" : "lucide:plus-circle"}
                  class={`transition-colors duration-200 ${isSelected ? 'text-red-500' : 'text-[#FCD34D]'}`}
                  width="20"
                ></iconify-icon>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="py-10 text-center text-gray-400 text-sm">No items found.</div>
          )}
        </div>
      </div>

      {/* Stock Modal */}
      <div className={`fixed z-[100] w-full md:w-[460px] h-[calc(100dvh-env(safe-area-inset-top))] md:h-[750px] bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 ring-1 ring-black/5 shadow-2xl md:rounded-[2rem] rounded-t-[2rem] transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col overflow-hidden ${activeModal === 'stock' ? 'modal-active bottom-0 left-0 md:top-1/2 md:left-1/2' : 'modal-enter bottom-0 left-0 md:top-1/2 md:left-1/2'}`} style={{ display: activeModal === 'stock' ? 'flex' : 'none' }}>
        <div className="md:hidden w-full h-6 flex items-center justify-center shrink-0" onClick={closeModal}>
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="px-6 pb-4 pt-2 md:p-6 flex justify-between items-center shrink-0">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{editingStockItem ? 'Edit Item' : 'Add Stock Item'}</h3>
          <button onClick={closeModal} className="hidden md:flex w-8 h-8 bg-gray-100 dark:bg-[#2C2C2E] rounded-full items-center justify-center text-gray-500 hover:bg-gray-200">
            <iconify-icon icon="lucide:x" width="16"></iconify-icon>
          </button>
        </div>

        <form className="flex flex-col flex-1 overflow-hidden" onSubmit={handleStockSubmit}>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

            <div className={`mb-4 ${editingStockItem ? 'opacity-50 pointer-events-none' : ''}`}>
              <LiquidTabs
                tabs={[
                  { id: 'ingredient', label: 'Ingredient' },
                  { id: 'other', label: 'Other Item' }
                ]}
                activeId={stockForm.type}
                onChange={(id) => id && setStockForm(s => ({ ...s, type: id as 'ingredient' | 'other' }))}
                className="bg-gray-100 dark:bg-[#2C2C2E] w-full"
                layoutId="modal-stock-type"
                fullWidth
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Item Name</label>
              <input value={stockForm.name} onChange={e => setStockForm({ ...stockForm, name: e.target.value })} className="ios-input w-full mt-1 p-3 text-sm font-semibold bg-gray-50 dark:bg-[#2C2C2E] text-gray-900 dark:text-white" placeholder={stockForm.type === 'ingredient' ? "e.g. Garlic Powder" : "e.g. Paper Bags"} required />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Category</label>
              <div className="relative mt-1">
                <CustomSelect
                  value={stockForm.category}
                  onChange={val => setStockForm({ ...stockForm, category: val })}
                  options={inventoryCategories.filter(c => c !== 'All Items')}
                  className="ios-input w-full h-[46px] px-3 text-sm bg-gray-50 dark:bg-[#2C2C2E] text-gray-900 dark:text-white flex items-center"
                  placeholder="Select or Type Category..."
                />
                <div className="absolute right-3 top-3.5 pointer-events-none">
                  <iconify-icon icon="lucide:chevrons-up-down" width="14" class="text-gray-400"></iconify-icon>
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Buying Information</p>
                {parseFloat(stockForm.priceBuffer) > 0 && (
                  <span className="text-[10px] font-bold text-[#FCD34D]">Buffered +{stockForm.priceBuffer}%</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Package Price</label>
                  <input type="number" step="0.01" value={stockForm.packageCost} onChange={e => setStockForm({ ...stockForm, packageCost: e.target.value })} className="ios-input w-full mt-1 p-2.5 text-sm bg-white dark:bg-[#3A3A3C] text-gray-900 dark:text-white" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Qty per Pack</label>
                  <input type="number" step="0.01" value={stockForm.packageQty} onChange={e => setStockForm({ ...stockForm, packageQty: e.target.value })} className="ios-input w-full mt-1 p-2.5 text-sm bg-white dark:bg-[#3A3A3C] text-gray-900 dark:text-white" placeholder="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Shipping Fee</label>
                  <input type="number" step="0.01" value={stockForm.shippingFee} onChange={e => setStockForm({ ...stockForm, shippingFee: e.target.value })} className="ios-input w-full mt-1 p-2.5 text-sm bg-white dark:bg-[#3A3A3C] text-gray-900 dark:text-white" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Buffer % (Optional)</label>
                  <input type="number" step="0.01" value={stockForm.priceBuffer} onChange={e => setStockForm({ ...stockForm, priceBuffer: e.target.value })} className="ios-input w-full mt-1 p-2.5 text-sm bg-white dark:bg-[#3A3A3C] text-gray-900 dark:text-white" placeholder="10-15%" />
                </div>
              </div>
              <div className="px-1">
                <p className="text-[10px] text-gray-400 leading-tight">Add a 10-15% buffer to account for price fluctuations.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Unit Cost (Calc)</label>
                <input type="number" step="0.001" value={stockForm.cost} onChange={e => setStockForm({ ...stockForm, cost: e.target.value })} className="ios-input w-full mt-1 p-3 text-sm font-semibold bg-gray-50 dark:bg-[#2C2C2E] text-[#FCD34D] dark:text-[#FCD34D]" placeholder="0" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Unit</label>
                <div className="relative mt-1">
                  <CustomSelect
                    value={stockForm.unit}
                    onChange={val => setStockForm({ ...stockForm, unit: val })}
                    options={['g', 'kg', 'oz', 'lbs', 'mg', 'mL', 'L', 'fl oz', 'tsp', 'tbsp', 'cup', 'pint', 'quart', 'gallon', 'unit', 'dozen', 'pack', 'bottle', 'can', 'box', 'jar', 'bag', 'piece', 'tray']}
                    className="ios-input w-full h-[46px] px-3 text-sm bg-gray-50 dark:bg-[#2C2C2E] text-gray-900 dark:text-white flex items-center"
                    placeholder="Select Unit"
                  />
                  <div className="absolute right-3 top-3.5 pointer-events-none">
                    <iconify-icon icon="lucide:chevrons-up-down" width="14" class="text-gray-400"></iconify-icon>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Current Stock</label>
                <input type="number" step="0.01" value={stockForm.qty} onChange={e => setStockForm({ ...stockForm, qty: e.target.value })} className="ios-input w-full mt-1 p-3 text-sm font-semibold bg-gray-50 dark:bg-[#2C2C2E] text-gray-900 dark:text-white" placeholder="0" required />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Min Stock</label>
                <input type="number" step="0.01" value={stockForm.min} onChange={e => setStockForm({ ...stockForm, min: e.target.value })} className="ios-input w-full mt-1 p-3 text-sm font-semibold bg-gray-50 dark:bg-[#2C2C2E] text-gray-900 dark:text-white" placeholder="0" required />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Supplier (Optional)</label>
              <input value={stockForm.supplier} onChange={e => setStockForm({ ...stockForm, supplier: e.target.value })} className="ios-input w-full mt-1 p-3 text-sm bg-gray-50 dark:bg-[#2C2C2E] text-gray-900 dark:text-white" placeholder="e.g. Wet Market" />
            </div>
          </div>

          <div className="shrink-0 p-6 pt-2 pb-safe-b bg-white dark:bg-[#1C1C1E] border-t border-gray-100 dark:border-[#38383A]">
            {showDeleteConfirm ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 text-center">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">Are you sure you want to delete this item?</p>
                  <p className="text-[10px] text-red-500/80 mt-1">This action cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white active-scale">Cancel</button>
                  <button type="button" onClick={handleDelete} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white active-scale shadow-sm shadow-red-200 dark:shadow-none">Confirm Delete</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                {editingStockItem && (
                  <button type="button" onClick={() => setShowDeleteConfirm(true)} className="px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-900/10 text-red-500 active-scale hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                    <iconify-icon icon="lucide:trash-2" width="18"></iconify-icon>
                  </button>
                )}
                <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white active-scale">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[#FCD34D] text-[#303030] active-scale shadow-sm shadow-[#FCD34D]/30 dark:shadow-none">{editingStockItem ? 'Update Item' : 'Add Item'}</button>
              </div>
            )}
          </div>
        </form>
      </div>

      <ConfirmationModal />
      <CookModal />
    </>
  );
};
