import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { useSound } from '../SoundContext';
import { AnimatePresence, motion } from 'framer-motion';

export const Recipes = () => {
  const {
    data, builder, setBuilder, loadRecipeToBuilder,
    calculateRecipeCost, getIngredient, getRecipeFinancials,
    openModal, saveCurrentRecipe, deleteRecipe, duplicateRecipe, askConfirmation, darkMode, resetBuilder,
    selectedRecipeId, setSelectedRecipeId, openCookModal
  } = useApp();

  const { playClick, playSuccess, playDelete, playHover } = useSound();

  const mode = builder.showBuilder ? 'builder' : 'list';
  const [showDiscountDetails, setShowDiscountDetails] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup happens in global state reset if needed
    };
  }, []);

  const handleSwitchToList = () => { playClick(); resetBuilder(); setSelectedRecipeId(null); };
  const handleSwitchToBuilder = () => { playClick(); resetBuilder(); setBuilder(prev => ({ ...prev, showBuilder: true })); setSelectedRecipeId(null); };

  const handleEditSelected = () => { playClick(); if (selectedRecipeId) loadRecipeToBuilder(selectedRecipeId); };
  const handleDuplicateSelected = () => { playClick(); if (selectedRecipeId) duplicateRecipe(selectedRecipeId); };
  const handleDeleteSelected = () => {
    playClick();
    const r = data.recipes.find(i => i.id === selectedRecipeId);
    if (r) {
      askConfirmation({
        title: 'Delete Recipe?',
        message: `Are you sure you want to delete "${r.name}"? This action cannot be undone.`,
        isDestructive: true,
        onConfirm: () => { playDelete(); deleteRecipe(r.id); setSelectedRecipeId(null); }
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = (x) => setBuilder(prev => ({ ...prev, image: x.target?.result as string }));
      r.readAsDataURL(f);
    }
  };

  const updateBuilderIngredientQty = (originalIndex: number, val: number) => {
    const newIngredients = [...builder.ingredients];
    newIngredients[originalIndex].qty = val;
    setBuilder(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const removeBuilderIngredient = (originalIndex: number) => {
    const item = getIngredient(builder.ingredients[originalIndex].id);
    askConfirmation({
      title: 'Remove Item?',
      message: `Are you sure you want to remove ${item?.name || 'this item'}?`,
      isDestructive: true,
      onConfirm: () => {
        const newIngredients = [...builder.ingredients];
        newIngredients.splice(originalIndex, 1);
        setBuilder(prev => ({ ...prev, ingredients: newIngredients }));
      }
    });
  };

  const adjustBatch = (d: number) => {
    setBuilder(prev => ({ ...prev, batchSize: Math.max(1, prev.batchSize + d) }));
  };

  const handleSave = () => { playSuccess(); saveCurrentRecipe(); resetBuilder(); };

  // --- CALCULATION ENGINE ---
  const ingredientsList = builder.ingredients.map(i => ({ ...i, details: getIngredient(i.id) }));
  const foodItems = ingredientsList.filter(i => (i.details?.type || 'ingredient') === 'ingredient');
  const otherItems = ingredientsList.filter(i => i.details?.type === 'other');

  const batchFoodCost = foodItems.reduce((acc, curr) => acc + (curr.qty * (curr.details?.cost || 0)), 0);
  const batchOtherCost = otherItems.reduce((acc, curr) => acc + (curr.qty * (curr.details?.cost || 0)), 0);
  const totalBatchCost = batchFoodCost + batchOtherCost;

  const yieldCount = builder.batchSize || 1;
  const foodCostPerOrder = batchFoodCost / yieldCount;
  const otherCostPerOrder = batchOtherCost / yieldCount;
  const totalCostPerOrder = totalBatchCost / yieldCount;

  const targetMarginDecimal = builder.margin / 100;
  const netSellingPrice = totalCostPerOrder / (1 - targetMarginDecimal);

  const vatRate = data.settings.isVatRegistered ? 12 : 0;
  const vatAmount = netSellingPrice * (vatRate / 100);
  const suggestedMenuPrice = netSellingPrice + vatAmount;
  const profitPerOrder = netSellingPrice - totalCostPerOrder;

  const discountRate = 0.20;
  const discountAmount = suggestedMenuPrice * discountRate;
  const discountedPrice = suggestedMenuPrice - discountAmount;
  const profitDiscounted = discountedPrice - totalCostPerOrder;
  const profitDifference = profitPerOrder - profitDiscounted;

  const sliderColor = "#007AFF";
  const sliderTrack = darkMode ? "#38383A" : "#E5E5EA";
  const sliderPct = ((builder.margin - 1) / (90 - 1)) * 100;

  const mappedIngredients = builder.ingredients.map((ing, idx) => {
    const details = getIngredient(ing.id);
    return { ...ing, originalIndex: idx, details, type: details?.type || 'ingredient' };
  });

  const foodIngredientsUI = mappedIngredients.filter(i => i.type === 'ingredient');
  const otherIngredientsUI = mappedIngredients.filter(i => i.type === 'other');

  const ListHeader = () => (
    <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-[9px] font-medium text-gray-400 uppercase tracking-wider">
      <div className="col-span-5">Item</div>
      <div className="col-span-3 text-center">QTY. Needed</div>
      <div className="col-span-3 text-right">Cost</div>
      <div className="col-span-1"></div>
    </div>
  );

  const IngredientRow = ({ item }: { item: any }) => {
    const rowTotal = item.qty * (item.details?.cost || 0);
    const [inputValue, setInputValue] = useState(item.qty.toString());
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
      if (!isEditing) setInputValue(item.qty.toString());
    }, [item.qty, isEditing]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };

    const commitChange = () => {
      const val = parseFloat(inputValue);
      if (!isNaN(val) && val >= 0) {
        updateBuilderIngredientQty(item.originalIndex, val);
      } else {
        setInputValue(item.qty.toString());
      }
      setIsEditing(false);
    };

    return (
      <div className="group relative bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 hover:border-[#007AFF]/50 dark:hover:border-[#007AFF]/50 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 mb-3">
        {/* Drag Handle (Visual) */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
          <iconify-icon icon="lucide:grip-vertical" width="16"></iconify-icon>
        </div>

        <div className="flex items-center gap-4 pl-6">
          {/* Icon/Type Indicator */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.details?.type === 'other' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
             <iconify-icon icon={item.details?.type === 'other' ? "lucide:package" : "lucide:leaf"} width="20"></iconify-icon>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 dark:text-white truncate text-base">{item.details?.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>₱{item.details?.cost?.toFixed(2)}/{item.details?.unit}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="uppercase tracking-wide">{item.details?.supplier || 'No Supplier'}</span>
            </div>
          </div>

          {/* Qty Input */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg p-1 border border-transparent group-hover:border-gray-200 dark:group-hover:border-white/10 transition-colors">
              <input
                type="text"
                inputMode="decimal"
                className="w-16 bg-transparent text-right font-bold text-gray-900 dark:text-white outline-none"
                value={inputValue}
                onFocus={() => { setIsEditing(true); playClick(); }}
                onBlur={commitChange}
                onChange={handleInputChange}
                onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              />
              <span className="text-xs font-bold text-gray-400 pr-2">{item.details?.unit}</span>
            </div>
          </div>

          {/* Total & Remove */}
          <div className="text-right min-w-[80px]">
            <div className="font-bold text-gray-900 dark:text-white text-base">
              ₱{rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <button 
              onClick={() => { playDelete(); removeBuilderIngredient(item.originalIndex); }}
              className="text-[10px] font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:underline mt-1"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SummaryValue = ({ label, value, type = 'neutral' }: { label: string, value: number, type?: 'neutral' | 'accent' | 'success' | 'danger' }) => {
    let colorClass = "text-gray-900 dark:text-white";
    if (type === 'accent') colorClass = "text-[#007AFF]";
    if (type === 'success') colorClass = "text-green-500";
    if (type === 'danger') colorClass = "text-red-500";

    return (
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`font-semibold ${colorClass}`}>₱{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    );
  };

  return (
    <div className="view-section fade-enter pb-0">

      {/* STICKY CONTROL HEADER */}
      {/* Sticks below main app header (approx 58px-64px) */}
      <div className="sticky top-[58px] md:top-16 z-20 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-[#F2F2F7]/85 dark:bg-black/85 backdrop-blur-xl border-b border-black/5 dark:border-white/10 mb-6 transition-all shadow-sm">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* BIGGER Segmented Control Tabs */}
          <div className="w-full bg-gray-200/60 dark:bg-white/10 p-1 rounded-xl flex items-center h-12 relative">
            <button
              onClick={handleSwitchToList}
              className={`flex-1 h-full rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'list' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              Menu List
            </button>
            <button
              onClick={handleSwitchToBuilder}
              className={`flex-1 h-full rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'builder' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              Recipe Builder
            </button>
          </div>

          {/* Sticky Tools Actions (Contextual) */}
          {mode === 'list' && selectedRecipeId && (
            <div className="grid grid-cols-3 gap-3 animate-in slide-in-from-top-1 fade-in duration-200">
              <button onClick={handleEditSelected} className="bg-gray-900 dark:bg-white text-white dark:text-black py-2.5 rounded-xl text-xs font-bold shadow-sm active-scale flex items-center justify-center gap-2 transition-colors">
                <iconify-icon icon="lucide:pencil" width="14"></iconify-icon> Edit
              </button>
              <button onClick={handleDuplicateSelected} className="bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white py-2.5 rounded-xl text-xs font-bold shadow-sm active-scale flex items-center justify-center gap-2 transition-colors">
                <iconify-icon icon="lucide:copy" width="14"></iconify-icon> Copy
              </button>
              <button onClick={handleDeleteSelected} className="bg-red-50 dark:bg-red-900/20 text-red-500 py-2.5 rounded-xl text-xs font-bold shadow-sm active-scale flex items-center justify-center gap-2 transition-colors">
                <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {mode === 'list' && (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <AnimatePresence>
          {data.recipes.map(r => {
            const f = getRecipeFinancials(r);
            const isSelected = selectedRecipeId === r.id;
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={r.id}
                onClick={() => setSelectedRecipeId(isSelected ? null : r.id)}
                className={`glass-thin rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-[#007AFF] border-transparent transform scale-[1.02] shadow-lg z-10' : 'hover:bg-white/40 dark:hover:bg-white/10'}`}
              >
                <div className="h-48 bg-gray-100 dark:bg-white/5 relative bg-cover bg-center transition-all" style={{ backgroundImage: r.image ? `url('${r.image}')` : 'none' }}>
                  {!r.image && (
                    <div className="absolute inset-0 bg-slate-200/50 dark:bg-white/5 flex flex-col items-center justify-center text-slate-400 dark:text-gray-500">
                      <iconify-icon icon="lucide:image" width="40" class="opacity-80 mb-1"></iconify-icon>
                      <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 glass-ultra-thin px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-200">{r.category}</div>
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#007AFF]/20 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#007AFF] rounded-full flex items-center justify-center text-white shadow-lg animate-in fade-in zoom-in duration-200">
                        <iconify-icon icon="lucide:check" width="16"></iconify-icon>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">{r.name}</h3>
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Cost</p>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">₱{f.unitCost.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Price</p>
                      <p className="text-base font-bold text-[#007AFF]">₱{r.price}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); openCookModal(r.id, r.name); }}
                      className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] group"
                    >
                      <iconify-icon icon="lucide:flame" width="14" class="transition-colors group-hover:text-white dark:group-hover:text-white"></iconify-icon>
                      Cook
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}

      {mode === 'builder' && (
        <div className="grid lg:grid-cols-12 gap-6 items-start pb-0">
          <div className="lg:col-span-7 space-y-5">
            {/* Main Info - Glass Thin */}
            <div className="glass-thin rounded-2xl p-5 space-y-4">
              <div className="flex flex-row gap-4">
                <div className="shrink-0">
                  <input type="file" id="builder-image-input" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <label htmlFor="builder-image-input" className="w-32 h-32 mt-4 rounded-xl bg-black/5 dark:bg-white/5 border border-dashed border-black/10 dark:border-white/20 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors overflow-hidden relative group">
                    {builder.image ? (
                      <img src={builder.image} className="w-full h-full object-cover" alt="Builder" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 group-hover:text-[#007AFF]">
                        <iconify-icon icon="lucide:camera" width="28"></iconify-icon>
                      </div>
                    )}
                  </label>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Recipe Name</label>
                    <input type="text" value={builder.name} onChange={e => setBuilder({ ...builder, name: e.target.value })} className="ios-input glass-input w-full mt-1 py-2 px-3 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400" placeholder="e.g. Sisig Rice Bowl" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Daily Orders (Est.)</label>
                    <input type="number" value={builder.dailyVolume} onChange={e => setBuilder({ ...builder, dailyVolume: parseInt(e.target.value) || 0 })} className="ios-input glass-input w-full mt-1 py-2 px-3 text-sm text-gray-900 dark:text-white" placeholder="10" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Category</label>
                  <div className="relative mt-1">
                    <select value={builder.category} onChange={e => setBuilder({ ...builder, category: e.target.value })} className="ios-input glass-input w-full py-2.5 px-3 text-sm appearance-none dark:text-white">
                      <option className="dark:bg-gray-800">Main Course</option>
                      <option className="dark:bg-gray-800">Appetizers</option>
                      <option className="dark:bg-gray-800">Beverages</option>
                      <option className="dark:bg-gray-800">Dessert</option>
                    </select>
                    <iconify-icon icon="lucide:chevron-down" class="absolute right-3 top-3 text-gray-400 pointer-events-none" width="14"></iconify-icon>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Yield (Servings)</label>
                  <div className="ios-input glass-input mt-1 px-1 py-1 flex items-center justify-between h-[40px]">
                    <button type="button" onClick={() => adjustBatch(-1)} className="w-8 h-full rounded-[8px] bg-white/50 dark:bg-white/10 shadow-sm flex items-center justify-center text-gray-500 active:scale-90 transition-transform"><iconify-icon icon="lucide:minus" width="14"></iconify-icon></button>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{builder.batchSize}</span>
                    <button type="button" onClick={() => adjustBatch(1)} className="w-8 h-full rounded-[8px] bg-white/50 dark:bg-white/10 shadow-sm flex items-center justify-center text-gray-500 active:scale-90 transition-transform"><iconify-icon icon="lucide:plus" width="14"></iconify-icon></button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients Card */}
            < div className="surface-opaque rounded-2xl overflow-hidden" >
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingredients (Food)</h3>
                <button onClick={() => openModal('picker', undefined, 'ingredient')} className="text-xs font-semibold text-[#007AFF] flex items-center gap-1 active:opacity-60">
                  <iconify-icon icon="lucide:plus" width="14"></iconify-icon> Add
                </button>
              </div>
              <ListHeader />
              <div className="divide-y divide-gray-100 dark:divide-white/10">
                {foodIngredientsUI.length === 0 && <div className="p-4 text-center text-xs text-gray-400">No ingredients added.</div>}
                {foodIngredientsUI.map((item) => <IngredientRow key={item.originalIndex} item={item} />)}
              </div>
            </div >

            {/* Other Items Card */}
            < div className="surface-opaque rounded-2xl overflow-hidden" >
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Other Items (Packaging)</h3>
                <button onClick={() => openModal('picker', undefined, 'other')} className="text-xs font-semibold text-[#007AFF] flex items-center gap-1 active:opacity-60">
                  <iconify-icon icon="lucide:plus" width="14"></iconify-icon> Add
                </button>
              </div>
              <ListHeader />
              <div className="divide-y divide-gray-100 dark:divide-white/10">
                {otherIngredientsUI.length === 0 && <div className="p-4 text-center text-xs text-gray-400">No other items added.</div>}
                {otherIngredientsUI.map((item) => <IngredientRow key={item.originalIndex} item={item} />)}
              </div>
            </div >
          </div >

          {/* RIGHT PANEL - COSTING SUMMARY - GLASS REGULAR */}
          <div className="lg:col-span-5 lg:sticky lg:top-[160px] space-y-4 self-start">

            {/* LAYER 1: COST FOUNDATION */}
            < div className="glass-thin rounded-2xl p-5 space-y-3" >
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Cost Breakdown (Per Serving)</h4>
              <div className="space-y-1">
                <SummaryValue label="Ingredients" value={foodCostPerOrder} />
                <SummaryValue label="Packaging & Other" value={otherCostPerOrder} />
              </div>
              <div className="border-t border-black/5 dark:border-white/10 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Total Unit Cost</span>
                  <span className="text-base font-bold text-gray-900 dark:text-white">₱{totalCostPerOrder.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div >

            {/* LAYER 2: PRICING & PROFIT */}
            < div className="glass-regular rounded-2xl border border-white/20 dark:border-white/10 overflow-hidden relative" >
              <div className="p-6 space-y-6 relative z-10">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pricing Strategy</span>
                    <span className="text-xs font-bold text-[#007AFF] bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">{builder.margin}% Margin</span>
                  </div>
                  {/* SYSTEM SLIDER */}
                  <input
                    type="range" min="1" max="90" step="1" value={builder.margin}
                    onChange={e => setBuilder({ ...builder, margin: parseInt(e.target.value) })}
                    className="w-full h-1"
                    style={{
                      background: `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${sliderPct}%, ${sliderTrack} ${sliderPct}%, ${sliderTrack} 100%)`
                    }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-500">Suggested Selling Price</span>
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    ₱{suggestedMenuPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/10 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Profit Per Serving</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-300 mt-0.5">₱{profitPerOrder.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 dark:text-green-400">
                    <iconify-icon icon="lucide:trending-up" width="18"></iconify-icon>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 flex flex-col gap-0.5 pt-2 border-t border-black/5 dark:border-white/10">
                  <div className="flex justify-between">
                    <span>Price before VAT:</span>
                    <span>₱{netSellingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT ({vatRate}%):</span>
                    <span>₱{vatAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div >

            {/* LAYER 3: DISCOUNT IMPACT */}
            < div className="glass-thin rounded-2xl overflow-hidden" >
              <button
                onClick={() => setShowDiscountDetails(!showDiscountDetails)}
                className="w-full px-5 py-3 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                  <iconify-icon icon="lucide:percent" width="14"></iconify-icon>
                  Discount Impact (PWD/Senior)
                </span>
                <iconify-icon icon={showDiscountDetails ? "lucide:chevron-up" : "lucide:chevron-down"} width="16" class="text-gray-400"></iconify-icon>
              </button>

              {
                showDiscountDetails && (
                  <div className="px-5 pb-5 pt-1 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl space-y-2">
                      <SummaryValue label="Discounted Price" value={discountedPrice} />
                      <SummaryValue label="Profit (After Discount)" value={profitDiscounted} type="accent" />
                      <div className="pt-2 mt-2 border-t border-black/5 dark:border-white/10">
                        <SummaryValue label="Profit Reduction" value={profitDifference} type="danger" />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      *Simulates a standard 20% discount on the gross selling price. Actual tax exemptions may vary.
                    </p>
                  </div>
                )
              }
            </div >

            {/* ACTIONS */}
            < div className="grid grid-cols-2 gap-3 pt-2" >
              <button onClick={() => { resetBuilder(); setSelectedRecipeId(null); }} className="w-full py-3.5 text-sm font-semibold text-gray-500 glass-thin rounded-xl hover:bg-white/50 active-scale">
                Cancel
              </button>
              <button onClick={handleSave} className="w-full bg-[#007AFF] text-white py-3.5 rounded-xl text-sm font-semibold active-scale shadow-lg shadow-blue-200 dark:shadow-none">
                Save Recipe
              </button>
            </div >
          </div >
        </div >
      )}
    </div >
  );
};