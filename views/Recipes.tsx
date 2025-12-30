import React, { useState, useMemo } from 'react';
import { useApp } from '../AppContext';
import { CustomSelect } from '../components/CustomSelect';

// Consistent category options used for both dropdown and filter buttons
// const CATEGORY_OPTIONS = ['Main Course', 'Mains', 'Appetizers', 'Beverages', 'Desserts']; // REMOVED

export const Recipes = () => {
  const { builder, setBuilder, selectedRecipeId, setSelectedRecipeId, data, saveRecipeDirectly, duplicateRecipe, deleteRecipe, openConfirm, recipeCategories, addRecipeCategory, openPrompt } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'builder'>(selectedRecipeId ? 'builder' : 'grid');
  const [isSaving, setIsSaving] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // --- FILTERING STATE ---
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null = All Items
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique categories from existing recipes + standard options
  const allCategories = useMemo(() => {
    const existingCategories = data.recipes.map(r => r.category).filter(Boolean);
    const combined = [...new Set([...recipeCategories, ...existingCategories])];
    return combined.filter(c => c && c !== 'Mains'); // Remove empty and 'Mains' specifically if present
  }, [data.recipes, recipeCategories]);

  // Filtered Recipes
  const filteredRecipes = useMemo(() => {
    return data.recipes.filter(recipe => {
      // Category filter
      if (selectedCategory && recipe.category !== selectedCategory) return false;
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!recipe.name.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [data.recipes, selectedCategory, searchQuery]);

  // Load recipe into builder when entering builder mode
  React.useEffect(() => {
    if (viewMode === 'builder') {
      if (selectedRecipeId) {
        // In a real app we might fetch here, but we just rely on 'localRecipe' init logic below
      } else {
        // New Recipe defaults
      }
    }
  }, [viewMode, selectedRecipeId]);

  // Local Builder State Handling
  const [localRecipe, setLocalRecipe] = useState<any>({
    name: '', category: 'Main Course', price: 0, image: '', ingredients: [], description: '', batchSize: 1
  });

  // Builder View States
  const [activeTab, setActiveTab] = useState<'ingredient' | 'other'>('ingredient');
  const [ingPage, setIngPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [targetMargin, setTargetMargin] = useState(70);

  React.useEffect(() => {
    if (selectedRecipeId && viewMode === 'builder') {
      const r = data.recipes.find(curr => curr.id === selectedRecipeId);
      if (r) setLocalRecipe(JSON.parse(JSON.stringify(r))); // Deep copy
    } else if (viewMode === 'builder') {
      setLocalRecipe({ name: 'New Recipe', category: 'Main Course', price: 0, image: '', ingredients: [], description: '', batchSize: 1 });
    }
  }, [selectedRecipeId, viewMode, data.recipes]);

  // Filtered Ingredients for Builder List (uses different name to avoid conflict)
  const builderFilteredIngredients = useMemo(() => {
    return (localRecipe.ingredients || []).filter((ri: any) => {
      const def = data.ingredients.find(i => i.id === ri.id);
      if (!def) return activeTab === 'ingredient'; // Default to ingredient if not found
      return (def.type || 'ingredient') === activeTab;
    });
  }, [localRecipe.ingredients, activeTab, data.ingredients]);

  const paginatedIngredients = builderFilteredIngredients.slice((ingPage - 1) * ITEMS_PER_PAGE, ingPage * ITEMS_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(builderFilteredIngredients.length / ITEMS_PER_PAGE));

  // Reset page on tab change
  React.useEffect(() => {
    setIngPage(1);
  }, [activeTab]);

  const toggleBuilder = () => {
    if (viewMode === 'grid') {
      setViewMode('builder');
      setSelectedRecipeId(0); // 0 for new
    } else {
      setViewMode('grid');
      setSelectedRecipeId(null);
    }
  };

  const handleSave = () => {
    if (!localRecipe.name) {
      alert("Please enter a recipe name.");
      return;
    }
    setIsSaving(true);

    // Optimistic: Assume success immediately
    saveRecipeDirectly(localRecipe).catch(err => {
      console.error("Save error:", err);
    });

    // Instant transition
    setTimeout(() => {
      setIsSaving(false);
      setViewMode('grid');
      setSelectedRecipeId(null);
    }, 50);
  };

  // Helper for Costing (Grid View)
  const getRecipeStats = (recipe: any) => {
    let cost = 0;
    if (recipe.ingredients) {
      recipe.ingredients.forEach((ri: any) => {
        const ing = data.ingredients.find(i => i.id === ri.id);
        if (ing) {
          cost += (ing.cost || 0) * (ri.qty || 0);
        }
      });
    }
    const price = recipe.price || 0;
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

    let status = 'Medium';
    if (margin >= 70) status = 'Excellent';
    else if (margin >= 60) status = 'Good';
    else if (margin < 30) status = 'Low Margin';

    return { cost, margin, status };
  };

  if (viewMode === 'builder') {
    // Cost Analysis Calculations for Builder
    const ingredientsCost = (localRecipe.ingredients || []).reduce((acc: number, ri: any) => {
      const def = data.ingredients.find(i => i.id === ri.id);
      if (def && (def.type || 'ingredient') === 'ingredient') {
        return acc + (def.cost * ri.qty);
      }
      return acc;
    }, 0);

    const packagingCost = (localRecipe.ingredients || []).reduce((acc: number, ri: any) => {
      const def = data.ingredients.find(i => i.id === ri.id);
      if (def && def.type === 'other') {
        return acc + (def.cost * ri.qty);
      }
      return acc;
    }, 0);

    const totalUnitCost = ingredientsCost + packagingCost;

    // Derived Values
    const actualPrice = localRecipe.price || 0;
    const priceBeforeVAT = actualPrice / 1.12;
    const vatAmount = actualPrice - priceBeforeVAT;
    const simpleProfit = actualPrice - totalUnitCost; // Gross Profit
    const currentMargin = actualPrice > 0 ? (simpleProfit / actualPrice) * 100 : 0;

    // VAT & Discount Calculations
    const vatExemptPrice = priceBeforeVAT;
    const pwdDiscount = vatExemptPrice * 0.20;
    const discountedPrice = vatExemptPrice - pwdDiscount;
    const profitDiscounted = discountedPrice - totalUnitCost;

    // Sync Handlers
    const handleMarginChange = (filesMargin: number) => {
      setTargetMargin(filesMargin);
      if (totalUnitCost > 0) {
        // Formula: Price = Cost / (1 - Margin%)
        const newPrice = totalUnitCost / (1 - (filesMargin / 100));
        setLocalRecipe({ ...localRecipe, price: Math.ceil(newPrice) }); // Round up
      }
    };

    const handlePriceChange = (newPrice: number) => {
      setLocalRecipe({ ...localRecipe, price: newPrice });
      if (newPrice > 0 && totalUnitCost > 0) {
        // Margin = (Price - Cost) / Price
        const newMargin = ((newPrice - totalUnitCost) / newPrice) * 100;
        setTargetMargin(Math.min(90, Math.max(0, Math.round(newMargin))));
      }
    };

    return (
      // Corrected Wrapper: Removed fixed positioning to respect Layout widths
      <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in text-[#303030]">

        {/* Builder Header - Compact */}
        <div className="flex-none px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button onClick={toggleBuilder} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-gray-500 transition shadow-sm">
              <iconify-icon icon="lucide:arrow-left" width="18"></iconify-icon>
            </button>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">EDITING</p>
              <h2 className="text-xl font-bold text-[#303030] leading-none">{localRecipe.name || 'New Recipe'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleBuilder} disabled={isSaving} className="px-5 py-2 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">Discard</button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-full bg-[#303030] text-white text-xs font-bold hover:shadow-lg flex items-center gap-2 transition hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <iconify-icon icon="lucide:loader-2" width="14" class="animate-spin"></iconify-icon> Saving...
                </>
              ) : (
                <>
                  <iconify-icon icon="lucide:save" width="14"></iconify-icon> Save Recipe
                </>
              )}
            </button>
          </div>
        </div>

        {/* Builder Content Grid */}
        <div className="flex-1 overflow-hidden px-6 pb-6 pt-6 w-full max-w-[1920px] mx-auto">
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* LEFT COLUMN: Inputs & Ingredients (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-0 overflow-hidden">
              {/* Basic Info */}
              <div className="flex-none soft-card p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left: Image Upload - Larger */}
                  <div className="flex-shrink-0">
                    <div className="relative w-full md:w-56 h-56 rounded-[2rem] bg-gray-50 border border-gray-200 overflow-hidden group shadow-inner">
                      {localRecipe.image ? (
                        <img src={localRecipe.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                          <iconify-icon icon="lucide:image" width="48"></iconify-icon>
                          <span className="text-xs font-medium">Upload Photo</span>
                        </div>
                      )}

                      {/* Upload Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm">
                        <iconify-icon icon="lucide:upload" class="text-white mb-2" width="32"></iconify-icon>
                        <span className="text-white text-xs font-bold">Change Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setLocalRecipe({ ...localRecipe, image: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Form Fields */}
                  <div className="flex-1 flex flex-col gap-5 justify-center">

                    {/* Row 1: Name */}
                    <div className="w-full">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Recipe Name</label>
                      <input
                        type="text"
                        value={localRecipe.name}
                        onChange={(e) => setLocalRecipe({ ...localRecipe, name: e.target.value })}
                        className="soft-input w-full font-bold text-lg py-3"
                        placeholder="e.g. Garlic Chicken Rice Meal"
                      />
                    </div>

                    {/* Row 2: Description */}
                    <div className="w-full">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Description / Note</label>
                      <input
                        type="text"
                        value={localRecipe.description || ''}
                        onChange={(e) => setLocalRecipe({ ...localRecipe, description: e.target.value })}
                        className="soft-input w-full font-medium text-sm py-3"
                        placeholder="Brief description or notes..."
                      />
                    </div>

                    {/* Row 3: Category & Yield */}
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Category</label>
                        <CustomSelect
                          value={localRecipe.category}
                          onChange={(val) => setLocalRecipe({ ...localRecipe, category: val })}
                          options={allCategories}
                          className="soft-input w-full font-medium text-sm py-3"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Yield (Servings)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={localRecipe.batchSize || 1}
                            onChange={(e) => setLocalRecipe({ ...localRecipe, batchSize: parseFloat(e.target.value) })}
                            className="soft-input w-full font-bold text-sm py-3"
                            placeholder="1"
                          />
                          <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-400 pointer-events-none">srv</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="flex-1 soft-card p-0 flex flex-col overflow-hidden shadow-sm relative">
                <div className="flex-none p-5 pb-2 flex justify-between items-center">
                  <div className="flex gap-2 bg-gray-100 p-1 rounded-full">
                    <button
                      onClick={() => setActiveTab('ingredient')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'ingredient' ? 'bg-white shadow-sm text-[#303030]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Ingredients
                    </button>
                    <button
                      onClick={() => setActiveTab('other')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'other' ? 'bg-white shadow-sm text-[#303030]' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Packaging
                    </button>
                  </div>

                  <button className="text-xs font-bold bg-[#303030] text-white px-4 py-2 rounded-full flex items-center gap-1 hover:shadow-lg transition transform active:scale-95">
                    <iconify-icon icon="lucide:plus" width="14"></iconify-icon> Add Item
                  </button>
                </div>

                <div className="px-5 py-2 grid grid-cols-[1fr_8rem_8rem] gap-4 bg-[#F9F9F7]/50 border-b border-gray-100 mt-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">DETAILS</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right pr-6">QUANTITY</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right pr-8">COST</span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                  {paginatedIngredients.length > 0 ? (
                    paginatedIngredients.map((ri: any, idx: number) => {
                      const ingDef = data.ingredients.find(i => i.id === ri.id);
                      return (
                        <div key={idx} className="grid grid-cols-[1fr_8rem_8rem] gap-4 items-center bg-white hover:bg-gray-50 p-2 rounded-lg border border-gray-100 group transition">

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#303030] truncate">{ingDef?.name || 'Unknown Item'}</p>
                          </div>

                          <div className="flex items-center justify-end pr-2">
                            <div className="flex items-center bg-white border border-gray-200 rounded px-2 py-0.5 focus-within:border-[#FCD34D] transition w-24">
                              <input
                                type="number"
                                className="w-full outline-none text-right text-xs font-bold text-[#303030] bg-transparent"
                                value={ri.qty}
                                onChange={(e) => {
                                  const realIdx = localRecipe.ingredients.findIndex((x: any) => x.id === ri.id);
                                  if (realIdx > -1) {
                                    const newIngs = [...localRecipe.ingredients];
                                    newIngs[realIdx].qty = parseFloat(e.target.value);
                                    setLocalRecipe({ ...localRecipe, ingredients: newIngs });
                                  }
                                }}
                              />
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider ml-1 flex-shrink-0">{ingDef?.unit || 'u'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-3">
                            <span className="text-xs font-bold text-gray-600">
                              ₱{((ingDef?.cost || 0) * (ri.qty || 0)).toFixed(2)}
                            </span>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50" onClick={() => {
                              const newIngs = localRecipe.ingredients.filter((x: any) => x.id !== ri.id);
                              setLocalRecipe({ ...localRecipe, ingredients: newIngs });
                            }}>
                              <iconify-icon icon="lucide:x" width="12"></iconify-icon>
                            </button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                      <iconify-icon icon="lucide:shopping-basket" width="20" class="opacity-20"></iconify-icon>
                      <p className="text-[10px] font-medium">No ingredients added.</p>
                    </div>
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="p-3 border-t border-gray-100 bg-white flex justify-center items-center rounded-b-xl">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setIngPage(p => Math.max(1, p - 1))} disabled={ingPage === 1} className="text-gray-400 hover:text-[#303030] disabled:opacity-30"><iconify-icon icon="lucide:chevron-left" width="14"></iconify-icon></button>
                      <span className="text-[10px] font-bold text-gray-400">Page {ingPage} / {totalPages}</span>
                      <button onClick={() => setIngPage(p => Math.min(totalPages, p + 1))} disabled={ingPage === totalPages} className="text-gray-400 hover:text-[#303030] disabled:opacity-30"><iconify-icon icon="lucide:chevron-right" width="14"></iconify-icon></button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Cost Analysis Receipt (4 cols) - Added min-h-0 for scroll fix */}
            <div className="lg:col-span-4 h-full min-h-0 flex flex-col pt-0 pb-0">
              {/* The Dark Receipt - COMPACT */}
              <div className="bg-[#1C1917] rounded-sm shadow-2xl overflow-hidden flex flex-col h-full border border-[#333] font-mono text-gray-200 relative">

                {/* Header */}
                <div className="text-center pt-6 pb-4 flex-none">
                  <div className="flex justify-center items-center gap-2 mb-1 opacity-50">
                  </div>
                  <h2 className="text-xl font-bold text-white mb-0.5">Cost Analysis</h2>
                </div>

                <div className="border-b border-dashed border-gray-800 mb-4 mx-4 flex-none"></div>

                {/* Scrollable Body - with minimal padding */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar">

                  {/* Costs */}
                  <div className="space-y-2 text-sm font-medium mb-5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ingredients Cost</span>
                      <span className="font-bold">₱{ingredientsCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Packaging & Other</span>
                      <span className="font-bold">₱{packagingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-white mt-1 pt-2 border-t border-gray-800">
                      <span className="font-bold">Total Unit Cost</span>
                      <span className="font-bold text-base">₱{totalUnitCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-gray-800 w-full mb-5"></div>

                  {/* Slider Section */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Margin</span>
                      <span className="text-sm font-bold text-[#FCD34D]">{targetMargin}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={targetMargin}
                      onChange={(e) => handleMarginChange(parseInt(e.target.value))}
                      className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-gray-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FCD34D] [&::-webkit-slider-thumb]:mt-[-6px]"
                      style={{
                        background: `linear-gradient(to right, #FCD34D 0%, #FCD34D ${(targetMargin / 90) * 100}%, #374151 ${(targetMargin / 90) * 100}%, #374151 100%)`
                      }}
                    />
                  </div>

                  <div className="border-b border-dashed border-gray-800 w-full mb-5"></div>

                  {/* VAT info */}
                  <div className="space-y-2 text-sm font-medium mb-5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price before VAT</span>
                      <span className="text-gray-400">₱{priceBeforeVAT.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">VAT (12%)</span>
                      <span className="text-gray-400">₱{vatAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Selling Price - Big */}
                  <div className="border-t border-gray-800 py-4 mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">REGULAR SELLING PRICE</span>
                    </div>
                    <div className="flex flex-col items-start group">
                      <div className="flex items-center text-4xl font-bold text-white tracking-tighter">
                        <span className="mr-1 text-2xl text-gray-600">₱</span>
                        <input
                          type="number"
                          value={localRecipe.price}
                          onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
                          className="bg-transparent text-gray-400 text-left w-36 outline-none border-b border-transparent group-hover:border-gray-700 focus:border-white transition-colors"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">VAT INCLUSIVE</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-gray-800 w-full mb-5"></div>

                  {/* Profit Card */}
                  <div className="bg-[#1C1C1E] border border-gray-800 rounded-lg p-3 flex justify-between items-center mb-5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">PROFIT PER ORDER</span>
                    <div className="flex items-center gap-2 text-[#10B981]">
                      <iconify-icon icon="lucide:trending-up" width="14"></iconify-icon>
                      <span className="text-xl font-bold text-[#10B981]">₱{simpleProfit.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-600 italic text-center mb-5 px-2 leading-relaxed">
                    The selling price is automatically rounded. Actual margin: {currentMargin.toFixed(1)}%
                  </p>

                  <div className="border-b border-dashed border-gray-800 w-full mb-3"></div>

                  {/* Breakdown Collapsible */}
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-300 transition list-none mb-3">
                      <span>VAT & Discount Breakdown</span>
                      <iconify-icon icon="lucide:chevron-down" class="group-open:rotate-180 transition-transform"></iconify-icon>
                    </summary>
                    <div className="space-y-2 text-xs font-medium animate-fade-in pl-2 border-l border-gray-800 text-gray-400">
                      <div className="flex justify-between">
                        <span>VAT-Exempt Price</span>
                        <span>₱{vatExemptPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PWD/Senior Disc. (20%)</span>
                        <span>-₱{pwdDiscount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white font-bold mt-1">
                        <span>Discounted Price</span>
                        <span>₱{discountedPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[#10B981] font-bold">
                        <span>Profit (Discounted)</span>
                        <span>₱{profitDiscounted.toFixed(2)}</span>
                      </div>
                    </div>
                  </details>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    );
  }

  // LIST Grid View
  return (
    <div id="view-recipes" className="flex-1 overflow-y-auto no-scrollbar pb-12 animate-fade-in text-[#303030] p-6 lg:p-8 space-y-8">

      {/* Header + Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-[#F2F2F0] p-1 rounded-full border border-gray-200/50 overflow-x-auto max-w-full no-scrollbar">
          {/* "All Items" Button */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2 rounded-full text-xs font-bold flex-shrink-0 transition ${selectedCategory === null ? 'bg-[#303030] text-white' : 'text-gray-500 hover:bg-white/50'
              }`}
          >
            All Items
          </button>
          {/* Dynamic Category Buttons */}
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold flex-shrink-0 transition ${selectedCategory === cat ? 'bg-[#303030] text-white' : 'text-gray-500 hover:bg-white/50'
                }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => openPrompt("Add Category", "New category name:", (val) => addRecipeCategory(val))}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white ml-2 flex-shrink-0 text-gray-400 hover:text-[#303030] transition hover:shadow-sm"
            title="Add Category"
          >
            <iconify-icon icon="lucide:plus" width="14"></iconify-icon>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <iconify-icon icon="lucide:search" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" width="16"></iconify-icon>
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="soft-input rounded-full pl-6 pr-10 py-2.5"
            />
          </div>
          <button onClick={toggleBuilder} className="bg-[#303030] text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:shadow-lg transition">
            <iconify-icon icon="lucide:plus" width="16"></iconify-icon> New Recipe
          </button>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredRecipes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">
            {data.recipes.length === 0
              ? "No recipes found. Create one to get started!"
              : `No recipes match "${selectedCategory || 'none'}${searchQuery ? ` or "${searchQuery}"` : ''}". Try a different filter.`
            }
          </div>
        ) : (
          filteredRecipes.map(recipe => {
            const { cost, margin, status } = getRecipeStats(recipe);
            const isMenuOpen = activeMenuId === recipe.id;

            return (
              <div key={recipe.id} className="soft-card p-6 hover:shadow-lg transition-all group cursor-default">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-start gap-4 w-full">
                    {/* Updated Image Container Size */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl border border-[#FCD34D]/10 overflow-hidden relative">
                      {recipe.image ? <img src={recipe.image} className="w-full h-full object-cover" /> : '🍽️'}
                      {/* Overlay Gradient for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg leading-tight text-[#303030] group-hover:text-orange-500 transition line-clamp-2">{recipe.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 inline-block bg-gray-100 text-gray-500`}>
                        {recipe.category}
                      </span>
                    </div>
                  </div>

                  {/* Action Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : recipe.id);
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isMenuOpen ? 'bg-gray-200 text-[#303030]' : 'text-gray-300 hover:text-[#303030] hover:bg-gray-100'}`}
                    >
                      <iconify-icon icon="lucide:more-horizontal" width="20"></iconify-icon>
                    </button>

                    {isMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                        <div className="absolute right-0 top-8 z-20 w-32 bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-200 flex flex-col text-left overflow-hidden">
                          <button
                            onClick={() => { setActiveMenuId(null); setSelectedRecipeId(recipe.id); setViewMode('builder'); }}
                            className="px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors w-full text-left"
                          >
                            <iconify-icon icon="lucide:edit-2" width="14"></iconify-icon>
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              openConfirm("Duplicate Recipe", `Copy ${recipe.name}?`, () => duplicateRecipe(recipe.id));
                            }}
                            className="px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors w-full text-left"
                          >
                            <iconify-icon icon="lucide:copy" width="14"></iconify-icon>
                            Clone
                          </button>
                          <div className="h-px bg-gray-50 my-1"></div>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              openConfirm("Delete Recipe", `Delete ${recipe.name}?`, () => deleteRecipe(recipe.id), true);
                            }}
                            className="px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors w-full text-left"
                          >
                            <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon>
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mb-8">
                  <div className="flex-1 bg-white/60 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Selling Price</p>
                    <p className="font-bold text-[#303030] text-lg">₱{(recipe.price || 0).toFixed(0)}</p>
                  </div>
                  <div className="flex-1 bg-white/60 rounded-xl p-3 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Plate Cost</p>
                    <p className="font-bold text-[#303030] text-lg">₱{cost.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#FCD34D]/10 pt-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status === 'Excellent' ? 'bg-[#10B981]'
                      : status === 'Good' ? 'bg-[#FCD34D]' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-medium text-gray-500">{status}</span>
                  </div>
                  <span className="text-xl font-bold text-[#303030] opacity-80">{margin.toFixed(0)}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-between items-center bg-[#F9F9F7] p-4 rounded-xl text-xs text-gray-400">
        <p>Showing <strong>{filteredRecipes.length}</strong> of {data.recipes.length} recipes</p>
      </div>

    </div>
  );
};
