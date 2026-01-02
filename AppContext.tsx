import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { supabase, isAuthenticated, getCurrentUserId } from './lib/supabase';
import { dataService } from './lib/data-service';
import { updateSessionActivity, isSessionActive, clearSession } from './lib/auth-utils';
import { saveDataCache, loadDataCache, isOnline } from './lib/offline-storage';
import { AppData, View, BuilderState, Ingredient, Recipe, Expense, AppContextType, DailySnapshot, WeeklySummary, MonthlySummary, Theme } from './types';
import { INITIAL_DATA, INITIAL_BUILDER, TOUR_STEPS } from './constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [theme, setThemeState] = useState<Theme>(() => {
    // Load theme from localStorage on init
    const savedTheme = localStorage.getItem('kostkitchen_theme') as Theme | null;
    return savedTheme || 'light';
  });
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false); // Track if initial auth check is done

  // Custom setTheme that also persists to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('kostkitchen_theme', newTheme);
  };

  // Theme Effect - apply theme classes to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'midnight', 'oled');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'midnight') {
      root.classList.add('dark', 'midnight');
    } else if (theme === 'oled') {
      root.classList.add('dark', 'oled');
    }
  }, [theme]);

  // Session Activity Tracker
  useEffect(() => {
    const trackActivity = () => {
      if (isLoggedIn) updateSessionActivity();
    };

    window.addEventListener('click', trackActivity);
    window.addEventListener('keydown', trackActivity);
    window.addEventListener('touchstart', trackActivity);

    return () => {
      window.removeEventListener('click', trackActivity);
      window.removeEventListener('keydown', trackActivity);
      window.removeEventListener('touchstart', trackActivity);
    };
  }, [isLoggedIn]);

  // Session Timeout Check
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkSession = setInterval(async () => {
      if (!isSessionActive()) {
        console.warn("Session timeout - logging out");
        await logout();
        alert("Session expired due to inactivity. Please log in again.");
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkSession);
  }, [isLoggedIn]);

  // Data State
  const [data, setData] = useState<AppData>({
    settings: INITIAL_DATA.settings,
    ingredients: [],
    recipes: [],
    dailySnapshots: []
  });

  const [builder, setBuilder] = useState<BuilderState>(INITIAL_BUILDER);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<number | null>(null);

  useEffect(() => {
    if (newlyAddedId) {
      const t = setTimeout(() => setNewlyAddedId(null), 3000); // 3s flash
      return () => clearTimeout(t);
    }
  }, [newlyAddedId]);

  const selectFirstRecipe = () => {
    if (data.recipes.length > 0) setSelectedRecipeId(data.recipes[0].id);
  };

  const [inventoryEditMode, setInventoryEditMode] = useState(false);
  const [activeModal, setActiveModal] = useState<'picker' | 'stock' | null>(null);
  const [pickerFilter, setPickerFilter] = useState<'ingredient' | 'other' | null>(null);
  const [editingStockItem, setEditingStockItem] = useState<Ingredient | null>(null);

  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void; isDestructive?: boolean; isOpen: boolean }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    isDestructive: false
  });

  const [cookModal, setCookModal] = useState<{ isOpen: boolean; recipeId: number | null; recipeName: string }>({ isOpen: false, recipeId: null, recipeName: '' });

  // Inventory Categories
  const [inventoryCategories, setInventoryCategories] = useState<string[]>(['All Items', 'Proteins', 'Produce', 'Dairy', 'Dry Goods', 'Packaging']);
  const addInventoryCategory = (cat: string) => {
    if (cat && !inventoryCategories.includes(cat)) setInventoryCategories([...inventoryCategories, cat]);
  };

  const [recipeCategories, setRecipeCategories] = useState<string[]>(['Main Course', 'Appetizers', 'Beverages', 'Desserts']);
  const addRecipeCategory = (cat: string) => {
    if (cat && !recipeCategories.includes(cat)) setRecipeCategories([...recipeCategories, cat]);
  };


  // Custom Prompt Modal State
  const [promptModal, setPromptModal] = useState<{ isOpen: boolean; title: string; defaultValue: string; onConfirm: (val: string) => void }>({
    isOpen: false,
    title: '',
    defaultValue: '',
    onConfirm: () => { }
  });

  const openPrompt = (title: string, defaultValue: string = '', onConfirm: (val: string) => void) => {
    setPromptModal({ isOpen: true, title, defaultValue, onConfirm });
  };

  const closePrompt = () => {
    setPromptModal(prev => ({ ...prev, isOpen: false }));
  };

  const openConfirm = (title: string, message: string, onConfirm: () => void, isDestructive = false) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, isDestructive });
  };


  // Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Tour Element Registry
  const [tourElements, setTourElements] = useState<Record<string, HTMLElement | null>>({});

  const registerTourElement = React.useCallback((id: string, element: HTMLElement | null) => {
    setTourElements(prev => ({ ...prev, [id]: element }));
  }, []);

  const getTourElement = React.useCallback((id: string): HTMLElement | null => {
    return tourElements[id] || document.getElementById(id);
  }, [tourElements]);

  const startTour = () => {
    setIsTourActive(true);
    setCurrentStepIndex(0);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const endTour = () => {
    setIsTourActive(false);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    let nextIndex = currentStepIndex + 1;
    // Skip steps based on data availability (Branching Logic)
    while (nextIndex < TOUR_STEPS.length) {
      const step = TOUR_STEPS[nextIndex];
      if (step.skipIfNoData && data.recipes.length === 0) {
        nextIndex++;
        continue;
      }
      if (step.skipIfHasData && data.recipes.length > 0) {
        nextIndex++;
        continue;
      }
      break;
    }
    if (nextIndex < TOUR_STEPS.length) {
      setCurrentStepIndex(nextIndex);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    let prevIndex = currentStepIndex - 1;
    while (prevIndex >= 0) {
      const step = TOUR_STEPS[prevIndex];
      if (step.skipIfNoData && data.recipes.length === 0) {
        prevIndex--;
        continue;
      }
      if (step.skipIfHasData && data.recipes.length > 0) {
        prevIndex--;
        continue;
      }
      break;
    }
    if (prevIndex >= 0) {
      setCurrentStepIndex(prevIndex);
    }
  };

  const openCookModal = (recipeId: number, recipeName: string) => setCookModal({ isOpen: true, recipeId, recipeName });
  const closeCookModal = () => setCookModal({ isOpen: false, recipeId: null, recipeName: '' });

  const cookRecipe = async (recipeId: number, portions: number) => {
    const recipe = data.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const batchSize = recipe.batchSize || 1;
    const ratio = portions / batchSize;
    const updates: { id: number, stockQty: number }[] = [];

    for (const ri of recipe.ingredients) {
      const ingredient = data.ingredients.find(i => i.id === ri.id);
      if (ingredient) {
        const amountNeeded = ri.qty * ratio;
        const newStock = Math.max(0, ingredient.stockQty - amountNeeded);
        updates.push({ id: ingredient.id, stockQty: newStock });
      }
    }

    // Optimistic Update
    const newIngredients = data.ingredients.map(i => {
      const update = updates.find(u => u.id === i.id);
      return update ? { ...i, stockQty: update.stockQty } : i;
    });
    setData(prev => ({ ...prev, ingredients: newIngredients }));

    // Database Update via DataService
    for (const u of updates) {
      const success = await dataService.updateIngredient(u.id, { stockQty: u.stockQty });
      if (!success) {
        console.error("Failed to sync stock update for", u.id);
        // In a real app we might revert or queue depending on error
      }
    }
  };

  // --- DATA FETCHING (Offline-First with Cache) ---
  const refreshData = async (silent = false) => {
    if (!silent) setLoading(true);

    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        if (!silent) {
          setIsLoggedIn(false);
          setUser(null);
          setData({ settings: INITIAL_DATA.settings, ingredients: [], recipes: [], dailySnapshots: [] });
          setLoading(false);
          clearSession();
        }
        return;
      }

      // STEP 1: Load from cache immediately (instant load)
      const cachedData = await loadDataCache();
      if (cachedData && cachedData.ingredients) {
        console.log('[Cache] Loading cached data instantly...');
        setIsLoggedIn(true);
        setData({
          ingredients: cachedData.ingredients || [],
          recipes: cachedData.recipes || [],
          dailySnapshots: cachedData.dailySnapshots || [],
          settings: {
            expenses: cachedData.expenses || [],
            isVatRegistered: cachedData.settings?.isVatRegistered || false,
            isPwdSeniorActive: cachedData.settings?.isPwdSeniorActive || false,
            otherDiscountRate: cachedData.settings?.otherDiscountRate || 0
          }
        });
        // Hide loading since we have cached data
        if (!silent) setLoading(false);
      }

      // STEP 2: Fetch fresh data from Supabase (background refresh)
      if (isOnline()) {
        console.log('[Network] Fetching fresh data from Supabase...');

        // Initialize Data Service with User ID
        await dataService.init(currentUserId);
        setIsLoggedIn(true);

        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Parallel Fetch via Data Service
        const [ingredients, recipes, settings, expenses, dailySnapshots] = await Promise.all([
          dataService.getIngredients(),
          dataService.getRecipes(),
          dataService.getSettings(),
          dataService.getExpenses(),
          dataService.getSnapshots()
        ]);

        const freshData = {
          ingredients,
          recipes,
          dailySnapshots,
          settings: {
            expenses: expenses,
            isVatRegistered: settings?.isVatRegistered || false,
            isPwdSeniorActive: settings?.isPwdSeniorActive || false,
            otherDiscountRate: settings?.otherDiscountRate || 0
          }
        };

        setData(freshData);

        // STEP 3: Save fresh data to cache for next time
        console.log('[Cache] Saving fresh data to cache...');
        await saveDataCache({
          ingredients,
          recipes,
          settings: {
            isVatRegistered: settings?.isVatRegistered || false,
            isPwdSeniorActive: settings?.isPwdSeniorActive || false,
            otherDiscountRate: settings?.otherDiscountRate || 0
          },
          expenses,
          dailySnapshots,
          lastSync: Date.now()
        });

        updateSessionActivity();
      } else {
        console.log('[Offline] Using cached data only');
        // Already loaded from cache above, just mark as logged in
        setIsLoggedIn(true);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      // If network fails, we still have cached data loaded (if available)
    } finally {
      setLoading(false);
    }
  };

  // Track if we've already loaded data this session
  const dataLoadedRef = React.useRef(false);
  const lastRefreshRef = React.useRef(0);

  useEffect(() => {
    // Check initial auth
    isAuthenticated().then(isAuth => {
      if (isAuth && !dataLoadedRef.current) {
        // IMPORTANT: Set isLoggedIn IMMEDIATELY to prevent login flash
        setIsLoggedIn(true);
        dataLoadedRef.current = true;
        refreshData();
      } else {
        setLoading(false);
      }
      setAuthChecked(true); // Mark auth check as complete AFTER setting isLoggedIn
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      // Only refresh on actual sign-in, not token refresh
      if (event === 'SIGNED_IN' && !dataLoadedRef.current) {
        dataLoadedRef.current = true;
        refreshData(false);
      }

      // TOKEN_REFRESHED event - don't reload data, just update activity
      if (event === 'TOKEN_REFRESHED') {
        updateSessionActivity();
        return;
      }

      if (event === 'SIGNED_OUT') {
        dataLoadedRef.current = false;
        setIsLoggedIn(false);
        setLoading(false);
        setData({ settings: INITIAL_DATA.settings, ingredients: [], recipes: [], dailySnapshots: [] });
        clearSession();
        dataService.cleanup();
      }
    });

    return () => {
      subscription.unsubscribe();
      dataService.cleanup();
    };
  }, []);

  const login = () => {
    const hasSeen = localStorage.getItem('hasSeenTour');
    if (!hasSeen) {
      setTimeout(() => startTour(), 2000);
    }
    updateSessionActivity();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    clearSession();
    dataService.cleanup();
    window.location.reload();
  };

  const getIngredient = (id: number) => data.ingredients.find(i => i.id === id);

  const calculateRecipeCost = (ingredients: { id: number, qty: number }[]) => {
    return ingredients.reduce((s, i) => {
      const it = getIngredient(i.id);
      return s + (it ? it.cost * i.qty : 0);
    }, 0);
  };

  const getRecipeFinancials = (r: Recipe) => {
    const batchCost = calculateRecipeCost(r.ingredients);
    const unitCost = batchCost / (r.batchSize || 1);
    const grossSales = r.price * r.dailyVolume;

    const vatRate = data.settings.isVatRegistered ? 0.12 : 0;
    const pwdRate = data.settings.isPwdSeniorActive ? 0.20 : 0;
    const otherRate = data.settings.otherDiscountRate / 100;

    const netRevenuePerUnitBeforeDiscount = r.price / (1 + vatRate);
    const vatPerUnit = r.price - netRevenuePerUnitBeforeDiscount;
    const totalVat = vatPerUnit * r.dailyVolume;

    const totalPwdDiscount = grossSales * pwdRate;
    const totalOtherDiscount = grossSales * otherRate;
    const totalDiscounts = totalPwdDiscount + totalOtherDiscount;

    const netRevenue = grossSales - totalVat - totalDiscounts;
    const cogs = unitCost * r.dailyVolume;
    const grossProfit = netRevenue - cogs;

    return {
      unitCost, unitPrice: r.price, dailyVolume: r.dailyVolume,
      grossSales, netRevenue, cogs, grossProfit,
      vat: totalVat, discounts: totalDiscounts,
      pwdDiscount: totalPwdDiscount, otherDiscount: totalOtherDiscount
    };
  };

  const getProjection = (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    let totals = { grossSales: 0, netRevenue: 0, cogs: 0, grossProfit: 0, discounts: 0, vat: 0, pwdDiscount: 0, otherDiscount: 0 };

    data.recipes.forEach((r) => {
      const f = getRecipeFinancials(r);
      totals.grossSales += f.grossSales;
      totals.netRevenue += f.netRevenue;
      totals.cogs += f.cogs;
      totals.grossProfit += f.grossProfit;
      totals.vat += f.vat;
      totals.discounts += f.discounts;
      // @ts-ignore
      totals.pwdDiscount += f.pwdDiscount;
      // @ts-ignore
      totals.otherDiscount += f.otherDiscount;
    });

    let multiplier = 1;
    if (period === 'weekly') multiplier = 7;
    if (period === 'monthly') multiplier = 30;

    const scaled = {
      grossSales: totals.grossSales * multiplier,
      netRevenue: totals.netRevenue * multiplier,
      cogs: totals.cogs * multiplier,
      grossProfit: totals.grossProfit * multiplier,
      discounts: totals.discounts * multiplier,
      vat: totals.vat * multiplier,
      pwdDiscount: totals.pwdDiscount * multiplier,
      otherDiscount: totals.otherDiscount * multiplier
    };

    const totalMonthlyEx = (data.settings.expenses || []).reduce((sum, e) => sum + e.amount, 0);
    const dailyOpEx = totalMonthlyEx / 30;
    const scaledOpEx = dailyOpEx * multiplier;
    const operatingProfit = scaled.grossProfit - scaledOpEx;

    return {
      ...scaled,
      opex: scaledOpEx,
      netProfit: operatingProfit
    };
  };

  // --- ACTIONS (Now using DataService) ---

  const addStockItem = async (item: Ingredient) => {
    const optimisticId = !item.id || item.id >= 100000 ? Date.now() : item.id;

    // Optimistic Update
    setData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...item, id: optimisticId }]
    }));

    // Data Service
    const result = await dataService.createIngredient(item);

    if (!result) {
      alert("Failed to add ingredient - please check input");
      refreshData(); // Revert
    } else {
      // If we got a real ID, swap the optimistic one immediately
      if (result.id !== optimisticId) {
        setData(prev => ({
          ...prev,
          ingredients: prev.ingredients.map(i => i.id === optimisticId ? { ...i, id: result.id } : i)
        }));
      }
    }
  };

  const updateStockItem = async (id: number, field: string, value: any) => {
    // Improved Optimistic Update Logic
    setData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(i => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };

        // Auto-calc logic needed here locally for immediate feedback
        if (['packageCost', 'packageQty', 'shippingFee', 'priceBuffer'].includes(field)) {
          const pc = Number(field === 'packageCost' ? value : (updated.packageCost || 0));
          const pq = Number(field === 'packageQty' ? value : (updated.packageQty || 0));
          const sf = Number(field === 'shippingFee' ? value : (updated.shippingFee || 0));
          const bf = Number(field === 'priceBuffer' ? value : (updated.priceBuffer || 0));

          if (pq > 0) {
            const bufferedPackageCost = pc * (1 + (bf / 100));
            const shipping = Number(sf);
            updated.cost = (bufferedPackageCost + shipping) / pq;
          }
        }
        return updated;
      })
    }));

    // Construct partial update
    const updates: Partial<Ingredient> = { [field]: value };
    // If we updated pricing fields, we should technically recalculate cost for the DB update too
    // But dataService handles plain updates. 
    // Ideally, the UI logic for 'cost' calculation should be shared.
    // For now, we trust the user sees the optimistic update and we send the field update.

    // NOTE: For 'cost' to be updated in DB seamlessly when package vars change, 
    // we should really send the calculated cost too.
    const currentItem = data.ingredients.find(i => i.id === id);
    if (currentItem && ['packageCost', 'packageQty', 'shippingFee', 'priceBuffer'].includes(field)) {
      // Re-calculate cost based on new value
      const sim = { ...currentItem, [field]: value };
      const pc = sim.packageCost || 0;
      const pq = sim.packageQty || 0;
      const sf = sim.shippingFee || 0;
      const bf = sim.priceBuffer || 0;
      if (pq > 0) {
        const bufferedPackageCost = pc * (1 + (bf / 100));
        const cost = (bufferedPackageCost + sf) / pq;
        // @ts-ignore
        updates.cost = cost;
      }
    }

    const success = await dataService.updateIngredient(id, updates);
    if (!success) {
      console.error("Update failed");
      refreshData(); // Revert
    }
  };

  const updateStockItemFull = async (id: number, updates: Partial<Ingredient>) => {
    // Optimistic Update
    setData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(i => i.id === id ? { ...i, ...updates } : i)
    }));

    const success = await dataService.updateIngredient(id, updates);
    if (!success) {
      alert("Failed to update item");
      refreshData();
    }
  };

  const duplicateStockItem = async (id: number) => {
    const item = data.ingredients.find(i => i.id === id);
    if (!item) return;

    const newItem = { ...item, id: Date.now(), name: `${item.name} (Copy)` };
    // Optimistic
    setData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newItem]
    }));

    const result = await dataService.createIngredient(newItem);
    if (result) {
      // Update ID
      setData(prev => ({
        ...prev,
        ingredients: prev.ingredients.map(i => i.id === newItem.id ? { ...i, id: result.id } : i)
      }));
    } else {
      refreshData();
    }
  };

  const deleteStockItem = async (id: number) => {
    setData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(i => i.id !== id)
    }));

    const success = await dataService.deleteIngredient(id);
    if (!success) {
      alert("Failed to delete");
      refreshData();
    }
  };

  const saveCurrentRecipe = async () => {
    // Pricing Logic
    const totalCost = calculateRecipeCost(builder.ingredients);
    const costPerServing = totalCost / (builder.batchSize || 1);
    const netPrice = costPerServing / (1 - (builder.margin / 100));
    const vatRate = data.settings.isVatRegistered ? 0.12 : 0;
    const menuPrice = Math.ceil(netPrice * (1 + vatRate));

    const recipeData: Omit<Recipe, 'id'> = {
      name: builder.name,
      category: builder.category,
      margin: builder.margin,
      price: menuPrice,
      dailyVolume: builder.dailyVolume,
      image: builder.image,
      batchSize: builder.batchSize,
      ingredients: builder.ingredients.map(ri => ({ ...ri })) // Satisfy type requirement
    };

    if (builder.id) {
      // Update
      const success = await dataService.updateRecipe(builder.id, recipeData, builder.ingredients);
      if (!success) alert("Error saving recipe");
    } else {
      // Insert
      const result = await dataService.createRecipe(recipeData, builder.ingredients);
      if (!result) alert("Error creating recipe");
      else setNewlyAddedId(result.id);
    }

    // Background refresh
    refreshData(true);
    setBuilder({ ...INITIAL_BUILDER, showBuilder: false });
    setView('recipes');
  };

  const saveRecipeDirectly = async (recipe: any) => {
    // Determine Menu Price (Price Inclusive of VAT)
    const price = recipe.price || 0;

    // Construct DB-ready object
    const recipeData: Omit<Recipe, 'id'> = {
      name: recipe.name,
      category: recipe.category,
      margin: recipe.margin || 0,
      price: price,
      dailyVolume: recipe.dailyVolume || 0,
      image: recipe.image,
      batchSize: recipe.batchSize || 1,
      ingredients: recipe.ingredients.map((ri: any) => ({ id: ri.id, qty: ri.qty })),
      prepTime: recipe.prepTime
    };

    if (recipe.id && recipe.id > 0) {
      // --- OPTIMISTIC UPDATE (Instant) ---
      setData(prev => ({
        ...prev,
        recipes: prev.recipes.map(r => r.id === recipe.id ? { ...recipe, ...recipeData, id: recipe.id } : r)
      }));

      // Background Sync
      dataService.updateRecipe(recipe.id, recipeData, recipe.ingredients).then(success => {
        if (!success) {
          console.error("Background save failed for recipe", recipe.id);
          // Optionally notify user or revert
        }
      });

    } else {
      // --- OPTIMISTIC INSERT (Instant) ---
      const tempId = Date.now(); // Temporary ID for UI
      const newRecipeObj = { ...recipe, ...recipeData, id: tempId };

      setData(prev => ({
        ...prev,
        recipes: [newRecipeObj, ...prev.recipes]
      }));
      setNewlyAddedId(tempId);

      // Background Create
      dataService.createRecipe(recipeData, recipe.ingredients).then(result => {
        if (result && result.id) {
          // Swap tempID for Real ID
          setData((prev) => ({
            ...prev,
            recipes: prev.recipes.map(r => r.id === tempId ? { ...r, id: result.id } : r)
          }));
          setNewlyAddedId(result.id);
        } else {
          console.error("Background creation failed");
          // Remove the optimistic item if it failed permanently
          setData(prev => ({ ...prev, recipes: prev.recipes.filter(r => r.id !== tempId) }));
          alert("Failed to save new recipe to server.");
        }
      });
    }

    return true; // Return immediately to unblock UI
  };

  const deleteRecipe = async (id: number) => {
    setData(prev => ({
      ...prev,
      recipes: prev.recipes.filter(r => r.id !== id)
    }));

    const success = await dataService.deleteRecipe(id);
    if (!success) {
      alert("Error deleting");
      refreshData();
    }
  };

  const duplicateRecipe = async (id: number) => {
    const r = data.recipes.find(x => x.id === id);
    if (!r) return;

    const newName = `${r.name} (Copy)`;
    const tempId = -Date.now();

    // Optimistic
    const optimisticRecipe: Recipe = {
      ...r,
      id: tempId,
      name: newName,
      ingredients: r.ingredients.map(ri => ({ ...ri }))
    };

    setData(prev => ({
      ...prev,
      recipes: [optimisticRecipe, ...prev.recipes]
    }));
    setNewlyAddedId(tempId);

    // Actual creation
    const result = await dataService.createRecipe(
      { ...r, name: newName }, // Copy properties
      r.ingredients // Copy ingredients
    );

    if (result) {
      // Replace temp with real
      setData(prev => ({
        ...prev,
        recipes: prev.recipes.map(x => x.id === tempId ? { ...x, id: result.id } : x)
      }));
      setNewlyAddedId(result.id);
    } else {
      refreshData();
    }
  };

  const updateDailyTarget = async (amount: number) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, dailySalesTarget: amount }
    }));
    await dataService.updateSettings({ daily_sales_target: amount });
  };

  const captureDailySnapshot = async () => {
    const today = new Date().toISOString().split('T')[0];
    const projection = getProjection('daily');
    const totalOrders = data.recipes.reduce((sum, r) => sum + r.dailyVolume, 0);

    const snapshotData = {
      date: today,
      grossSales: projection.grossSales,
      netRevenue: projection.netRevenue,
      cogs: projection.cogs,
      grossProfit: projection.grossProfit,
      opex: projection.opex,
      netProfit: projection.netProfit,
      vat: projection.vat,
      discounts: projection.discounts,
      totalOrders: totalOrders
    };

    const success = await dataService.saveSnapshot(snapshotData);
    if (success) {
      alert("Daily Snapshot Saved!");
      refreshData();
    } else {
      alert("Failed to save snapshot");
    }
  };

  const getWeeklySummary = (weekStart: Date): WeeklySummary => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    const weekSnapshots = data.dailySnapshots.filter(s => s.date >= weekStartStr && s.date <= weekEndStr);

    if (weekSnapshots.length === 0) return { weekStart: weekStartStr, weekEnd: weekEndStr, totalRevenue: 0, totalNetProfit: 0, avgDailyProfit: 0, bestDay: { date: weekStartStr, profit: 0 }, worstDay: { date: weekStartStr, profit: 0 }, daysCount: 0 };

    const totalRevenue = weekSnapshots.reduce((sum, s) => sum + s.netRevenue, 0);
    const totalNetProfit = weekSnapshots.reduce((sum, s) => sum + s.netProfit, 0);
    const sorted = [...weekSnapshots].sort((a, b) => b.netProfit - a.netProfit);

    return {
      weekStart: weekStartStr, weekEnd: weekEndStr,
      totalRevenue, totalNetProfit,
      avgDailyProfit: totalNetProfit / weekSnapshots.length,
      bestDay: { date: sorted[0].date, profit: sorted[0].netProfit },
      worstDay: { date: sorted[sorted.length - 1].date, profit: sorted[sorted.length - 1].netProfit },
      daysCount: weekSnapshots.length
    };
  };

  const getMonthlySummary = (month: string): MonthlySummary => {
    const monthSnapshots = data.dailySnapshots.filter(s => s.date.startsWith(month));
    if (monthSnapshots.length === 0) return { month, totalRevenue: 0, totalGrossProfit: 0, totalNetProfit: 0, avgMargin: 0, totalDiscounts: 0, totalVAT: 0, daysCount: 0 };

    const totalRevenue = monthSnapshots.reduce((sum, s) => sum + s.netRevenue, 0);
    const totalGrossProfit = monthSnapshots.reduce((sum, s) => sum + s.grossProfit, 0);
    const totalNetProfit = monthSnapshots.reduce((sum, s) => sum + s.netProfit, 0);

    return {
      month, totalRevenue, totalGrossProfit, totalNetProfit,
      totalDiscounts: monthSnapshots.reduce((sum, s) => sum + s.discounts, 0),
      totalVAT: monthSnapshots.reduce((sum, s) => sum + s.vat, 0),
      avgMargin: totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0,
      daysCount: monthSnapshots.length
    };
  };

  const getStockStatus = (item: Ingredient) => {
    // 1. Critical: Out of Stock or 0
    if (item.stockQty <= 0) {
      return { label: "CRITICAL", colorClass: "bg-red-500", textClass: "text-red-500", bgClass: "bg-red-500", width: 100 };
    }

    // If minStock is not set, treat as Good unless 0 (handled above)
    if (!item.minStock || item.minStock <= 0) {
      return { label: "GOOD", colorClass: "bg-[#34c759]", textClass: "text-[#34c759]", bgClass: "bg-[#34c759]", width: 100 };
    }

    // 2. Low: <= Min Stock
    if (item.stockQty <= item.minStock) {
      const pct = (item.stockQty / item.minStock) * 100;
      return { label: "LOW STOCK", colorClass: "bg-orange-500", textClass: "text-orange-500", bgClass: "bg-orange-500", width: Math.max(pct, 10) };
    }

    // 3. Reorder: <= 1.2 * Min Stock (Warning Zone)
    if (item.stockQty <= item.minStock * 1.2) {
      // Scale width between min and 1.2*min
      const pct = ((item.stockQty / (item.minStock * 1.2)) * 100);
      return { label: "REORDER", colorClass: "bg-yellow-400", textClass: "text-yellow-500", bgClass: "bg-yellow-400", width: pct };
    }

    // 4. Good
    return { label: "GOOD", colorClass: "bg-[#34c759]", textClass: "text-[#34c759]", bgClass: "bg-[#34c759]", width: 100 };
  };

  const loadRecipeToBuilder = (id: number) => {
    const r = data.recipes.find(i => i.id === id);
    if (r) { setBuilder({ ...r, showBuilder: true }); setView('recipes'); }
  };
  const resetBuilder = () => setBuilder(INITIAL_BUILDER);
  const toggleInventoryEdit = () => setInventoryEditMode(!inventoryEditMode);

  const openModal = (m: 'picker' | 'stock', itemToEdit?: Ingredient, filter?: 'ingredient' | 'other') => {
    setEditingStockItem(itemToEdit || null);
    setPickerFilter(filter || null);
    setActiveModal(m);
  };
  const closeModal = () => { setActiveModal(null); setEditingStockItem(null); setPickerFilter(null); };
  const askConfirmation = (opts: any) => setConfirmModal({ ...opts, isOpen: true });
  const closeConfirmation = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  return (
    <AppContext.Provider value={{
      view, setView, isLoggedIn, isLoading: loading, authChecked, login, logout, theme, setTheme, user,
      data, setData, getIngredient, calculateRecipeCost, getRecipeFinancials, getProjection, getStockStatus,
      captureDailySnapshot, getWeeklySummary, getMonthlySummary,
      builder, setBuilder, loadRecipeToBuilder,
      selectedRecipeId, setSelectedRecipeId,
      inventoryEditMode, toggleInventoryEdit,
      activeModal, setActiveModal, pickerFilter, setPickerFilter, editingStockItem,
      confirmModal, cookModal, cookRecipe,
      // Modals
      setConfirmModal, openConfirm,
      promptModal, openPrompt, closePrompt,
      // Tour Export
      isTourActive, currentStepIndex, startTour, endTour, nextStep, prevStep,
      registerTourElement, getTourElement,
      openModal, closeModal,
      // Actions
      saveCurrentRecipe,
      saveRecipeDirectly,
      deleteRecipe,
      duplicateRecipe,
      addStockItem,
      updateStockItem,
      updateStockItemFull,
      deleteStockItem,
      duplicateStockItem,
      resetBuilder,
      newlyAddedId, selectFirstRecipe, // New features
      // Confirmation
      askConfirmation,
      closeConfirmation: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
      openCookModal,
      closeCookModal,
      updateDailyTarget,
      inventoryCategories, addInventoryCategory,
      recipeCategories, addRecipeCategory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
