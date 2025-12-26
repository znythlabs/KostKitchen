import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../AppContext';
import { useSound } from '../SoundContext';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { Recipe } from '../types';

// --- HISTORY HOOK FOR UNDO/REDO ---
function useHistory<T>(initialPresent: T) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialPresent);
  const [future, setFuture] = useState<T[]>([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const update = (newPresent: T) => {
    setPast(prev => [...prev, present]);
    setPresent(newPresent);
    setFuture([]);
  };

  const undo = () => {
    if (!canUndo) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture(prev => [present, ...prev]);
    setPresent(previous);
    setPast(newPast);
  };

  const redo = () => {
    if (!canRedo) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast(prev => [...prev, present]);
    setPresent(next);
    setFuture(newFuture);
  };

  return { present, setPresent: update, undo, redo, canUndo, canRedo, historyPast: past };
}

export const Recipes = () => {
  const {
    data, builder, setBuilder, loadRecipeToBuilder,
    calculateRecipeCost, getIngredient, getRecipeFinancials,
    openModal, saveCurrentRecipe, deleteRecipe, duplicateRecipe, askConfirmation, darkMode, resetBuilder,
    selectedRecipeId, setSelectedRecipeId, openCookModal, newlyAddedId
  } = useApp();

  const { playClick, playSuccess, playDelete, playHover } = useSound();

  const mode = builder.showBuilder ? 'builder' : 'list';
  const [activeTab, setActiveTab] = useState<'items' | 'overview' | 'modifiers'>('items');
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for recipes to support Order/Undo/Redo before syncing or mock-syncing
  // In a real DB sort scenario, we'd update the sort_order column. 
  // Here we assume the list order in `present` is the truth for the UI.
  const { present: localRecipes, setPresent: setLocalRecipes, undo, redo, canUndo, canRedo } = useHistory(data.recipes);

  // Sync local state when external data changes (e.g. initial load or add/delete from context)
  // We only want to do this if the data length changes or distinct IDs change to avoid fighting the local sort
  const prevDataRef = useRef(data.recipes);
  useEffect(() => {
    if (prevDataRef.current !== data.recipes) {
      // Simple check: if length differs or IDs differ, sync. 
      // Real implementation would be more complex to preserve sort.
      // For now, we accept data updates as the "truth" to ensure added items appear.
      setLocalRecipes(data.recipes);
      prevDataRef.current = data.recipes;
    }
  }, [data.recipes, setLocalRecipes]);


  const [showDiscountDetails, setShowDiscountDetails] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // --- DERIVED STATE ---
  const recipeFinancialsMap = useMemo(() => {
    const map = new Map();
    localRecipes.forEach(r => map.set(r.id, getRecipeFinancials(r)));
    return map;
  }, [localRecipes, getRecipeFinancials]);

  const categorizedRecipes = useMemo((): Record<string, Recipe[]> => {
    const groups: Record<string, Recipe[]> = {};
    const filtered = localRecipes.filter((r: Recipe) => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    filtered.forEach((r: Recipe) => {
      const cat = r.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    });
    return groups;
  }, [localRecipes, searchQuery]);

  // Init sections expanded
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    Object.keys(categorizedRecipes).forEach(cat => {
      initialExpanded[cat] = expandedCategories[cat] !== undefined ? expandedCategories[cat] : true;
    });
    setExpandedCategories(prev => ({ ...initialExpanded, ...prev }));
  }, [categorizedRecipes]);

  // --- HANDLERS ---
  const handleSwitchToList = () => { playClick(); resetBuilder(); setSelectedIds([]); };
  const handleSwitchToBuilder = () => { playClick(); resetBuilder(); setBuilder(prev => ({ ...prev, showBuilder: true })); setSelectedIds([]); };

  const handleEditRecipe = (id: number) => { playClick(); loadRecipeToBuilder(id); };

  const toggleSelection = (id: number) => {
    playClick();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleCategory = (cat: string) => {
    playClick();
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleDuplicate = async (id: number) => {
    if (isDuplicating) return;
    setIsDuplicating(true);
    playClick();
    await duplicateRecipe(id);
    setTimeout(() => setIsDuplicating(false), 2000);
  };

  const handleDelete = (id: number, name: string) => {
    playClick();
    // For Undo capability, we might ideally effectively "soft delete" locally first
    // But since `deleteRecipe` hits the API immediately, implementing true Undo requires API reversal or 
    // delaying the API call. For this specific "Undo/Redo" request, visual undo of sorting/filtering is safest.
    // Making "Delete" undoable implies not calling API yet. 
    // Optimization: We will call API directly for Delete to be safe, Undo will mainly handle reordering or bulk changes if we had them purely local.
    // However, the user asked for Undo. Let's try to support it by *not* calling API immediately? 
    // No, that risks data loss. We will keep API Delete for safety and clarify Undo is for UI state in this version, 
    // OR we just use the API. Let's stick to API for delete for data integrity. 

    askConfirmation({
      title: 'Delete Recipe?',
      message: `Are you sure you want to delete "${name}"?`,
      isDestructive: true,
      onConfirm: () => { playDelete(); deleteRecipe(id); setSelectedIds(prev => prev.filter(i => i !== id)); }
    });
  };

  const handleSave = async () => {
    playClick();
    await saveCurrentRecipe();
    playSuccess();
  };

  const handleAddCategory = () => {
    playClick();
    // In this schema, categories are just tags. "Adding" one essentially means preparing to create an item in it
    // or adding an empty placeholder. Let's open builder with a prompt or just a focus.
    // We'll simulate it by opening builder with a "New Category" placeholder.
    resetBuilder();
    setBuilder(prev => ({ ...prev, showBuilder: true, category: 'New Category' }));
  };

  // --- RENDER HELPERS ---
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
    <div className="view-section fade-enter pb-0 h-full flex flex-col">

      {/* --- TOP HEADER / TABS (Matches Screenshot) --- */}
      <div className="sticky top-[58px] md:top-16 z-30 bg-white dark:bg-black border-b border-gray-100 dark:border-white/10 pt-4 px-4 md:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-0">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('items')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'items' ? 'text-gray-900 dark:text-white border-gray-900 dark:border-white' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
              >
                Items
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'overview' ? 'text-gray-900 dark:text-white border-gray-900 dark:border-white' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('modifiers')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'modifiers' ? 'text-gray-900 dark:text-white border-gray-900 dark:border-white' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
              >
                Modifiers
              </button>
            </div>

            {/* Main View Actions - Only visible in Item mode */}
            <div className="flex items-center gap-2 pb-2">
              <div className="hidden md:flex items-center bg-gray-100 dark:bg-white/10 rounded-lg px-2 h-8">
                <iconify-icon icon="lucide:search" width="14" class="text-gray-400"></iconify-icon>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-medium ml-2 w-32 placeholder-gray-400 text-gray-900 dark:text-white"
                />
              </div>

              <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>

              <button
                onClick={() => console.log('Filter')} // Mock logic
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
                title="Filters"
              >
                <iconify-icon icon="lucide:filter" width="16"></iconify-icon>
              </button>
              <button
                disabled={!canUndo}
                onClick={() => { playClick(); undo(); }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${canUndo ? 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500' : 'text-gray-300 dark:text-white/20'}`}
                title="Undo"
              >
                <iconify-icon icon="lucide:undo-2" width="16"></iconify-icon>
              </button>
              <button
                disabled={!canRedo}
                onClick={() => { playClick(); redo(); }}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${canRedo ? 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500' : 'text-gray-300 dark:text-white/20'}`}
                title="Redo"
              >
                <iconify-icon icon="lucide:redo-2" width="16"></iconify-icon>
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1"></div>

              <button
                onClick={handleAddCategory}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-xs font-bold text-gray-700 dark:text-gray-200"
              >
                <iconify-icon icon="lucide:plus" width="14"></iconify-icon>
                Add Category
              </button>

              <button
                onClick={handleSwitchToBuilder} // Using as general 'Add Item'
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-all text-xs font-bold shadow-sm"
              >
                <iconify-icon icon="lucide:plus" width="14"></iconify-icon>
                New Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {mode === 'list' ? (
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-black">
          <div className="max-w-6xl mx-auto py-6 px-4 md:px-8 space-y-6">

            {/* Category Stats Header */}
            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium px-1">
              <span>Showing {localRecipes.length} Items</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>{Object.keys(categorizedRecipes).length} Categories</span>
            </div>

            {(Object.entries(categorizedRecipes) as [string, Recipe[]][]).map(([category, recipes]) => {
              const isExpanded = expandedCategories[category];
              const sortedRecipes = [...recipes]; // We assume they are sorted by default or mapped order

              return (
                <div key={category} className="bg-white dark:bg-[#1C1C1E] rounded-xl border border-gray-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">

                  {/* Modern Category Header */}
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400 transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                        <iconify-icon icon="lucide:chevron-down" width="18"></iconify-icon>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{category}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-white/10 text-gray-500">{recipes.length} Items</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <button className="p-1.5 hover:text-[#007AFF] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Add Item to Category">
                        <iconify-icon icon="lucide:plus" width="16"></iconify-icon>
                      </button>
                      <button className="p-1.5 hover:text-gray-600 dark:hover:text-white rounded transition-colors">
                        <iconify-icon icon="lucide:copy" width="16"></iconify-icon>
                      </button>
                      <button className="p-1.5 hover:text-gray-600 dark:hover:text-white rounded transition-colors">
                        <iconify-icon icon="lucide:more-vertical" width="16"></iconify-icon>
                      </button>
                    </div>
                  </div>

                  {/* Recipes List */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {sortedRecipes.map((r, index) => {
                          const ingredientsList = r.ingredients.map(ri => getIngredient(ri.id)?.name).filter(Boolean).slice(0, 5).join(', ');
                          const isPopular = (r.dailyVolume || 0) > 15; // Mock popular logic

                          return (
                            <div
                              key={r.id}
                              className="group relative flex items-center px-6 py-4 hover:bg-blue-50/30 dark:hover:bg-white/5 transition-colors border-b last:border-0 border-gray-50 dark:border-white/5"
                            >
                              {/* Drag Handle */}
                              <div className="mr-4 text-gray-300 dark:text-gray-600 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                                <iconify-icon icon="lucide:grip-vertical" width="16"></iconify-icon>
                              </div>

                              {/* Selection Checkbox */}
                              <div className="mr-4">
                                <div
                                  onClick={() => toggleSelection(r.id)}
                                  className={`w-5 h-5 rounded border cursor-pointer transition-colors flex items-center justify-center ${selectedIds.includes(r.id) ? 'bg-[#007AFF] border-[#007AFF] text-white' : 'border-gray-300 dark:border-gray-600 hover:border-[#007AFF]'}`}
                                >
                                  <iconify-icon icon="lucide:check" width="12" class={selectedIds.includes(r.id) ? 'block' : 'hidden'}></iconify-icon>
                                </div>
                              </div>

                              {/* Image */}
                              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/10 overflow-hidden relative border border-gray-200 dark:border-white/10 mr-4">
                                {r.image ? (
                                  <img src={r.image} className="w-full h-full object-cover" alt={r.name} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <iconify-icon icon="lucide:image" width="16"></iconify-icon>
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pr-4">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{r.name}</h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{ingredientsList || 'No ingredients listed'}</p>
                              </div>

                              {/* Tags */}
                              <div className="flex items-center gap-2 mr-6">
                                {isPopular && (
                                  <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold border border-orange-100 dark:border-orange-900/30">
                                    Most Popular
                                  </span>
                                )}
                                {/* Example 'Perk' or other tag */}
                                {(r.margin > 50) && (
                                  <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold border border-green-100 dark:border-green-900/30">
                                    High Margin
                                  </span>
                                )}
                              </div>

                              {/* Price */}
                              <div className="w-24 text-right mr-6">
                                <span className="font-bold text-gray-900 dark:text-white text-sm">₱{r.price.toFixed(2)}</span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDuplicate(r.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors" title="Copy">
                                  <iconify-icon icon="lucide:copy" width="16"></iconify-icon>
                                </button>
                                <button onClick={() => openCookModal(r.id, r.name)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors" title="Cook / History">
                                  <iconify-icon icon="lucide:history" width="16"></iconify-icon>
                                </button>
                                <button onClick={() => handleEditRecipe(r.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-500 transition-colors" title="Edit / More">
                                  <iconify-icon icon="lucide:more-vertical" width="16"></iconify-icon>
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // BUILDER MODE - Matching Original Screenshot
        <div className="flex-1">
          {/* Mode Toggle Tabs */}
          <div className="sticky top-[58px] md:top-16 z-10 bg-[#F2F2F7] dark:bg-black px-4 md:px-8 pt-6 pb-4">
            <div className="max-w-6xl mx-auto">
              <div className="inline-flex bg-gray-100 dark:bg-white/10 rounded-full p-1">
                <button
                  onClick={handleSwitchToList}
                  className="px-6 py-2 text-sm font-medium rounded-full transition-all text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Menu List
                </button>
                <button
                  className="px-6 py-2 text-sm font-medium rounded-full transition-all bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm"
                >
                  Recipe Builder
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-start pb-8 max-w-6xl mx-auto px-4 md:px-8">
            {/* Left Column - Recipe Info & Ingredients */}
            <div className="lg:col-span-7 space-y-5">
              {/* Main Info Card */}
              <div className="surface-opaque rounded-2xl p-5 space-y-4">
                <div className="flex flex-row gap-4">
                  <div className="shrink-0">
                    <input type="file" id="builder-image-input" className="hidden" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const r = new FileReader();
                        r.onload = (x) => setBuilder(prev => ({ ...prev, image: x.target?.result as string }));
                        r.readAsDataURL(f);
                      }
                    }} />
                    <label htmlFor="builder-image-input" className="w-28 h-28 rounded-xl bg-gray-100 dark:bg-white/10 border border-dashed border-gray-300 dark:border-white/20 flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-white/15 transition-colors overflow-hidden">
                      {builder.image ? (
                        <img src={builder.image} className="w-full h-full object-cover" alt="Recipe" />
                      ) : (
                        <iconify-icon icon="lucide:camera" width="24" class="text-gray-400"></iconify-icon>
                      )}
                    </label>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Recipe Name</label>
                      <input type="text" value={builder.name} onChange={e => setBuilder({ ...builder, name: e.target.value })} className="ios-input glass-input w-full mt-1 py-2 px-3 text-sm font-semibold text-gray-900 dark:text-white" placeholder="Garlic Chicken Rice Meal" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Daily Orders (Est.)</label>
                      <input type="number" value={builder.dailyVolume} onChange={e => setBuilder({ ...builder, dailyVolume: parseInt(e.target.value) || 0 })} className="ios-input glass-input w-full mt-1 py-2 px-3 text-sm text-gray-900 dark:text-white" placeholder="15" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Category</label>
                    <select value={builder.category} onChange={e => setBuilder({ ...builder, category: e.target.value })} className="ios-input glass-input w-full mt-1 py-2.5 px-3 text-sm text-gray-900 dark:text-white">
                      <option value="">Select...</option>
                      <option value="Main Course">Main Course</option>
                      <option value="Appetizers">Appetizers</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Soup & Salad">Soup & Salad</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Yield (Servings)</label>
                    <div className="ios-input glass-input mt-1 px-1 py-1 flex items-center justify-between h-[40px]">
                      <button type="button" onClick={() => setBuilder(prev => ({ ...prev, batchSize: Math.max(1, prev.batchSize - 1) }))} className="w-8 h-full rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"><iconify-icon icon="lucide:minus" width="14"></iconify-icon></button>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{builder.batchSize}</span>
                      <button type="button" onClick={() => setBuilder(prev => ({ ...prev, batchSize: prev.batchSize + 1 }))} className="w-8 h-full rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500"><iconify-icon icon="lucide:plus" width="14"></iconify-icon></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* INGREDIENTS (FOOD) Section */}
              <div className="surface-opaque rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/10">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ingredients (Food)</span>
                  <button onClick={() => openModal('picker', undefined, 'ingredient')} className="text-xs font-bold text-[#007AFF] flex items-center gap-1">
                    <iconify-icon icon="lucide:plus" width="14"></iconify-icon>Add
                  </button>
                </div>
                {/* Table Header */}
                <div className="grid grid-cols-12 px-5 py-2 border-b border-gray-50 dark:border-white/5 text-[10px] font-medium text-gray-400 uppercase">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-4 text-center">Qty. Needed</div>
                  <div className="col-span-3 text-right">Cost</div>
                </div>
                {/* Ingredients List */}
                {builder.ingredients.filter(ri => {
                  const ing = getIngredient(ri.id);
                  return ing && ing.type !== 'other';
                }).length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">No food ingredients added</div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {builder.ingredients.map((ri) => {
                      const ing = getIngredient(ri.id);
                      if (!ing || ing.type === 'other') return null;
                      const lineCost = (ing.cost || 0) * ri.qty;
                      return (
                        <div key={ri.id} className="grid grid-cols-12 items-center px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-white/5 group">
                          <div className="col-span-5">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{ing.name}</p>
                            <p className="text-[11px] text-gray-400">₱{(ing.cost || 0).toFixed(3)} / {ing.unit}</p>
                          </div>
                          <div className="col-span-4 flex items-center justify-center gap-1">
                            <input type="number" value={ri.qty} onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setBuilder(prev => ({ ...prev, ingredients: prev.ingredients.map(i => i.id === ri.id ? { ...i, qty: val } : i) }));
                            }} className="w-16 text-center text-sm font-semibold bg-gray-100 dark:bg-white/10 rounded-lg py-1.5 text-gray-900 dark:text-white" step="1" />
                            <span className="text-xs text-gray-400">{ing.unit}</span>
                          </div>
                          <div className="col-span-3 flex items-center justify-end gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">₱{lineCost.toFixed(2)}</span>
                            <button onClick={() => setBuilder(prev => ({ ...prev, ingredients: prev.ingredients.filter(i => i.id !== ri.id) }))} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                              <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PACKAGING & OTHER Section */}
              <div className="surface-opaque rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/10">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Packaging & Other</span>
                  <button onClick={() => openModal('picker', undefined, 'other')} className="text-xs font-bold text-[#007AFF] flex items-center gap-1">
                    <iconify-icon icon="lucide:plus" width="14"></iconify-icon>Add
                  </button>
                </div>
                {/* Other Items List */}
                {builder.ingredients.filter(ri => {
                  const ing = getIngredient(ri.id);
                  return ing && ing.type === 'other';
                }).length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">No packaging items added</div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-white/5">
                    {builder.ingredients.map((ri) => {
                      const ing = getIngredient(ri.id);
                      if (!ing || ing.type !== 'other') return null;
                      const lineCost = (ing.cost || 0) * ri.qty;
                      return (
                        <div key={ri.id} className="grid grid-cols-12 items-center px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-white/5 group">
                          <div className="col-span-5">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{ing.name}</p>
                            <p className="text-[11px] text-gray-400">₱{(ing.cost || 0).toFixed(2)} / {ing.unit}</p>
                          </div>
                          <div className="col-span-4 flex items-center justify-center gap-1">
                            <input type="number" value={ri.qty} onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setBuilder(prev => ({ ...prev, ingredients: prev.ingredients.map(i => i.id === ri.id ? { ...i, qty: val } : i) }));
                            }} className="w-16 text-center text-sm font-semibold bg-gray-100 dark:bg-white/10 rounded-lg py-1.5 text-gray-900 dark:text-white" step="1" />
                            <span className="text-xs text-gray-400">{ing.unit}</span>
                          </div>
                          <div className="col-span-3 flex items-center justify-end gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">₱{lineCost.toFixed(2)}</span>
                            <button onClick={() => setBuilder(prev => ({ ...prev, ingredients: prev.ingredients.filter(i => i.id !== ri.id) }))} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500">
                              <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Cost Breakdown & Pricing */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20 lg:self-start">
              {/* Cost Breakdown (Per Serving) */}
              <div className="surface-opaque rounded-2xl p-5">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-4">Cost Breakdown (Per Serving)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ingredients</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₱{(builder.ingredients.filter(ri => getIngredient(ri.id)?.type !== 'other').reduce((sum, ri) => sum + (getIngredient(ri.id)?.cost || 0) * ri.qty, 0) / (builder.batchSize || 1)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Packaging & Other</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₱{(builder.ingredients.filter(ri => getIngredient(ri.id)?.type === 'other').reduce((sum, ri) => sum + (getIngredient(ri.id)?.cost || 0) * ri.qty, 0) / (builder.batchSize || 1)).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-white/10 my-2"></div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Total Unit Cost</span>
                    <span className="font-bold text-gray-900 dark:text-white text-base">₱{(calculateRecipeCost(builder.ingredients) / (builder.batchSize || 1)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Strategy */}
              {(() => {
                // Calculate prices based on user's spreadsheet formula: =ROUNDUP(cost / (1-margin), 0)
                const unitCost = calculateRecipeCost(builder.ingredients) / (builder.batchSize || 1);
                const priceBeforeVAT = Math.ceil(unitCost / (1 - builder.margin / 100)); // ROUNDUP to whole number
                const vatRate = data.settings.isVatRegistered ? 0.12 : 0;
                const vatAmount = priceBeforeVAT * vatRate;
                const regularSellingPrice = priceBeforeVAT + vatAmount; // Price with VAT
                const profitPerOrder = priceBeforeVAT - unitCost;

                return (
                  <div className="surface-opaque rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pricing Strategy</h3>
                      <span className="text-sm font-bold text-[#007AFF]">{builder.margin}% Margin</span>
                    </div>

                    {/* Margin Slider */}
                    <input
                      type="range" min="10" max="80" step="1" value={builder.margin}
                      onChange={e => setBuilder({ ...builder, margin: parseInt(e.target.value) })}
                      style={{
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        width: '100%',
                        height: '8px',
                        borderRadius: '9999px',
                        background: `linear-gradient(to right, #007AFF 0%, #007AFF ${((builder.margin - 10) / 70) * 100}%, #e5e5e5 ${((builder.margin - 10) / 70) * 100}%, #e5e5e5 100%)`,
                        cursor: 'pointer',
                        marginBottom: '16px'
                      }}
                      className="slider-styled"
                    />

                    {/* Per Order Calculations */}
                    <div className="space-y-2 mb-4 mt-5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price before VAT</span>
                        <span className="font-medium text-gray-900 dark:text-white">₱{priceBeforeVAT.toFixed(2)}</span>
                      </div>
                      {data.settings.isVatRegistered && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">VAT (12%)</span>
                          <span className="font-medium text-gray-900 dark:text-white">₱{vatAmount.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Regular Selling Price */}
                    <div className="text-center mb-4 py-3 bg-[#007AFF]/10 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Regular Selling Price</p>
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">₱{regularSellingPrice.toFixed(2)}</p>
                      {data.settings.isVatRegistered && (
                        <p className="text-[10px] text-gray-400 mt-1">VAT Inclusive</p>
                      )}
                    </div>

                    {/* Profit Per Serving */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-green-600 uppercase tracking-wide">Profit Per Order</p>
                        <p className="text-2xl font-bold text-green-600">₱{profitPerOrder.toFixed(2)}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <iconify-icon icon="lucide:trending-up" width="20" class="text-green-600"></iconify-icon>
                      </div>
                    </div>

                    {/* Note about rounding */}
                    <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
                      <span className="font-semibold text-gray-500">Note:</span> The selling price is automatically rounded up for easier pricing. The actual margin may be slightly higher than your target.
                    </p>
                  </div>
                );
              })()}

              {/* Discount Impact Accordion */}
              <div className="surface-opaque rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowDiscountDetails(!showDiscountDetails)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-gray-500">VAT & Discount Breakdown</span>
                  <iconify-icon icon={showDiscountDetails ? "lucide:chevron-up" : "lucide:chevron-down"} width="16" class="text-gray-400"></iconify-icon>
                </button>
                {showDiscountDetails && (() => {
                  const unitCost = calculateRecipeCost(builder.ingredients) / (builder.batchSize || 1);
                  const priceBeforeVAT = Math.ceil(unitCost / (1 - builder.margin / 100)); // ROUNDUP to whole number
                  const vatRate = data.settings.isVatRegistered ? 0.12 : 0;
                  const vatAmount = priceBeforeVAT * vatRate;
                  const regularSellingPrice = priceBeforeVAT + vatAmount;
                  const pwdDiscountRate = 0.20; // 20% discount for PWD/Senior
                  const pwdDiscountAmount = priceBeforeVAT * pwdDiscountRate;
                  const pwdFinalPrice = priceBeforeVAT - pwdDiscountAmount;
                  const profitAfterDiscount = pwdFinalPrice - unitCost;
                  const profitDifference = priceBeforeVAT - pwdFinalPrice;

                  return (
                    <div className="px-5 pb-4 space-y-3 text-sm">
                      {/* VAT Breakdown */}
                      {data.settings.isVatRegistered && (
                        <div className="pb-3 border-b border-gray-100 dark:border-white/10">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">VAT Breakdown</p>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500">Price before VAT:</span>
                            <span className="text-gray-900 dark:text-white">₱{priceBeforeVAT.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-500">VAT (12%):</span>
                            <span className="text-gray-900 dark:text-white">₱{vatAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-gray-600 dark:text-gray-300">Regular selling price:</span>
                            <span className="text-gray-900 dark:text-white">₱{regularSellingPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      )}

                      {/* PWD/Senior Discount */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">With Discount (PWD/Senior - 20%)</p>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-500">VAT-Exempt Price:</span>
                          <span className="text-gray-900 dark:text-white">₱{priceBeforeVAT.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-500">Discount (20%):</span>
                          <span className="text-red-500">-₱{pwdDiscountAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-600 dark:text-gray-300">Discounted price:</span>
                          <span className="text-green-600">₱{pwdFinalPrice.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-gray-100 dark:bg-white/10 my-2"></div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-500">Profit (after discount):</span>
                          <span className="text-green-600">₱{profitAfterDiscount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Profit difference (vs regular):</span>
                          <span className="text-orange-500">₱{profitDifference.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { resetBuilder(); setSelectedIds([]); }} className="w-full py-3.5 text-sm font-semibold text-gray-500 bg-gray-100 dark:bg-white/10 rounded-xl hover:bg-gray-200 dark:hover:bg-white/15 active-scale">
                  Cancel
                </button>
                <button onClick={handleSave} className="w-full bg-[#007AFF] text-white py-3.5 rounded-xl text-sm font-semibold active-scale shadow-lg shadow-blue-200 dark:shadow-none">
                  Save Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};