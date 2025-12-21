import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { supabase } from './lib/supabase';
import { AppData, View, BuilderState, Ingredient, Recipe, Expense, AppContextType, DailySnapshot, WeeklySummary, MonthlySummary } from './types';
import { INITIAL_DATA, INITIAL_BUILDER } from './constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [data, setData] = useState<AppData>({
    settings: INITIAL_DATA.settings,
    ingredients: [],
    recipes: [],
    dailySnapshots: []
  });
  
  const [builder, setBuilder] = useState<BuilderState>(INITIAL_BUILDER);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

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

  // --- SUPABASE DATA FETCHING ---
  const refreshData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    try {
      // Parallel Fetch
      const [ingRes, recRes, recIngRes, settingsRes, expRes, snapRes] = await Promise.all([
        supabase.from('ingredients').select('*').order('name'),
        supabase.from('recipes').select('*').order('name'),
        supabase.from('recipe_ingredients').select('*'),
        supabase.from('settings').select('*').single(),
        supabase.from('expenses').select('*'),
        supabase.from('daily_snapshots').select('*').order('date', { ascending: false })
      ]);

      // Map Ingredients
      const ingredients: Ingredient[] = (ingRes.data || []).map((i: any) => ({
        id: i.id,
        name: i.name,
        unit: i.unit,
        cost: Number(i.cost),
        stockQty: Number(i.stock_qty),
        minStock: Number(i.min_stock),
        supplier: i.supplier || '',
        packageCost: i.package_cost ? Number(i.package_cost) : undefined,
        packageQty: i.package_qty ? Number(i.package_qty) : undefined,
        shippingFee: i.shipping_fee ? Number(i.shipping_fee) : undefined,
        priceBuffer: i.price_buffer ? Number(i.price_buffer) : undefined,
        type: (i.type || 'ingredient') as 'ingredient' | 'other'
      }));

      // Map Recipes
      const recipes: Recipe[] = (recRes.data || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category || '',
        margin: Number(r.margin),
        price: Number(r.price),
        dailyVolume: Number(r.daily_volume),
        image: r.image,
        batchSize: Number(r.batch_size),
        ingredients: (recIngRes.data || [])
          .filter((ri: any) => ri.recipe_id === r.id)
          .map((ri: any) => ({ id: ri.ingredient_id, qty: Number(ri.qty) }))
      }));

      // Map Settings
      const settings = {
        isVatRegistered: settingsRes.data?.is_vat_registered || false,
        isPwdSeniorActive: settingsRes.data?.is_pwd_senior_active || false,
        otherDiscountRate: Number(settingsRes.data?.other_discount_rate || 0),
        expenses: (expRes.data || []).map((e: any) => ({
          id: e.id,
          category: e.category,
          amount: Number(e.amount)
        }))
      };

      // Map Snapshots
      const dailySnapshots: DailySnapshot[] = (snapRes.data || []).map((s: any) => ({
        ...s.data,
        date: s.date
      }));

      setData({ ingredients, recipes, settings, dailySnapshots });

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) refreshData();
      else setLoading(false);
    });

    // Realtime Subscription
    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ingredients' }, (payload) => {
         console.log('Realtime Event received:', payload);
         refreshData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => refreshData())
      .subscribe((status) => {
        console.log("Realtime Connection Status:", status);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') refreshData();
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setData({ settings: INITIAL_DATA.settings, ingredients: [], recipes: [], dailySnapshots: [] });
      }
    });

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  // Theme Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem("ck_theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("ck_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("ck_theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const login = () => { refreshData(); }; // Handled by AuthLayer + Subscription
  const logout = async () => { 
    await supabase.auth.signOut();
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

    const totalMonthlyEx = data.settings.expenses.reduce((sum, e) => sum + e.amount, 0);
    const dailyOpEx = totalMonthlyEx / 30;
    const scaledOpEx = dailyOpEx * multiplier;
    const operatingProfit = scaled.grossProfit - scaledOpEx;

    return {
      ...scaled,
      opex: scaledOpEx,
      netProfit: operatingProfit
    };
  };

  // --- ACTIONS ---

  const addStockItem = async (item: Ingredient) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      name: item.name,
      unit: item.unit,
      cost: item.cost,
      stock_qty: item.stockQty,
      min_stock: item.minStock,
      supplier: item.supplier,
      package_cost: item.packageCost,
      package_qty: item.packageQty,
      shipping_fee: item.shippingFee,
      price_buffer: item.priceBuffer,
      type: item.type
    };

    if (item.id && item.id > 100000) { // Assume > 100k is temp ID from frontend
       // Insert
       const { error } = await supabase.from('ingredients').insert(payload);
       if (error) alert("Failed to add: " + error.message);
    } else {
       // It might be an update if ID exists, but addStockItem usually implies new
       const { error } = await supabase.from('ingredients').insert(payload);
       if (error) alert("Failed to add: " + error.message);
    }
    refreshData();
  };

  const updateStockItem = async (id: number, field: string, value: any) => {
    // Optimistic Update
    let calculatedCost: number | undefined = undefined;

    setData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(i => {
        if (i.id !== id) return i;
        const updated = { ...i, [field]: value };
        // Logic for auto-calc
        if (['packageCost', 'packageQty', 'shippingFee', 'priceBuffer'].includes(field)) {
          const pc = field === 'packageCost' ? Number(value) : (updated.packageCost || 0);
          const pq = field === 'packageQty' ? Number(value) : (updated.packageQty || 0);
          const sf = field === 'shippingFee' ? Number(value) : (updated.shippingFee || 0);
          const bf = field === 'priceBuffer' ? Number(value) : (updated.priceBuffer || 0);
          if (pq > 0) {
            const bufferedPackageCost = pc * (1 + (bf / 100));
            updated.cost = (bufferedPackageCost + sf) / pq;
            calculatedCost = updated.cost;
          }
        }
        return updated;
      })
    }));

    // DB Update
    const mapField: any = {
      stockQty: 'stock_qty', minStock: 'min_stock', packageCost: 'package_cost',
      packageQty: 'package_qty', shippingFee: 'shipping_fee', priceBuffer: 'price_buffer'
    };
    
    const dbField = mapField[field] || field;
    const payload: any = { [dbField]: value };

    // If updating pricing, we also need to update cost
    if (calculatedCost !== undefined) {
      payload.cost = calculatedCost;
    }
    
    const { error } = await supabase.from('ingredients').update(payload).eq('id', id);
    if (error) {
      console.error("Update failed", error);
      refreshData(); // Revert/Sync on error
    }
  };

  const deleteStockItem = async (id: number) => {
    const { error } = await supabase.from('ingredients').delete().eq('id', id);
    if (error) alert("Failed to delete: " + error.message);
    else refreshData();
  };

  const saveCurrentRecipe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Pricing Logic
    const totalCost = calculateRecipeCost(builder.ingredients);
    const costPerServing = totalCost / (builder.batchSize || 1);
    const netPrice = costPerServing / (1 - (builder.margin / 100));
    const vatRate = data.settings.isVatRegistered ? 0.12 : 0;
    const menuPrice = Math.ceil(netPrice * (1 + vatRate));

    const recipePayload = {
      user_id: user.id,
      name: builder.name,
      category: builder.category,
      margin: builder.margin,
      price: menuPrice,
      daily_volume: builder.dailyVolume,
      image: builder.image,
      batch_size: builder.batchSize
    };

    if (builder.id) {
      // Update
      const { error } = await supabase.from('recipes').update(recipePayload).eq('id', builder.id);
      if (error) { alert("Error saving recipe"); return; }
      
      // Update Ingredients (Delete all, re-insert)
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', builder.id);
      
      const ingPayload = builder.ingredients.map(ri => ({
        recipe_id: builder.id,
        ingredient_id: ri.id,
        qty: ri.qty
      }));
      if (ingPayload.length > 0) {
        await supabase.from('recipe_ingredients').insert(ingPayload);
      }
    } else {
      // Insert
      const { data: newRecipe, error } = await supabase.from('recipes').insert(recipePayload).select().single();
      if (error || !newRecipe) { alert("Error creating recipe"); return; }
      
      const ingPayload = builder.ingredients.map(ri => ({
        recipe_id: newRecipe.id,
        ingredient_id: ri.id,
        qty: ri.qty
      }));
      if (ingPayload.length > 0) {
        await supabase.from('recipe_ingredients').insert(ingPayload);
      }
    }
    
    refreshData();
    setBuilder({ ...INITIAL_BUILDER, showBuilder: false });
    setView('recipes');
  };

  const deleteRecipe = async (id: number) => {
    if (window.confirm("Are you sure?")) {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) alert("Error deleting");
      else refreshData();
    }
  };

  const duplicateRecipe = async (id: number) => {
    const r = data.recipes.find(x => x.id === id);
    if (!r) return;
    setBuilder({ ...r, id: null, name: `${r.name} (Copy)`, showBuilder: true });
    setView('recipes');
  };

  const captureDailySnapshot = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const projection = getProjection('daily');
    const totalOrders = data.recipes.reduce((sum, r) => sum + r.dailyVolume, 0);
    const recipesSold = data.recipes.map(r => ({
      recipeId: r.id,
      recipeName: r.name,
      quantity: r.dailyVolume,
      revenue: getRecipeFinancials(r).grossSales
    }));
    const stockAlerts = data.ingredients
      .filter(i => i.stockQty <= i.minStock)
      .map(i => ({ ingredientId: i.id, ingredientName: i.name, stockQty: i.stockQty }));

    const snapshotData = {
      grossSales: projection.grossSales,
      netRevenue: projection.netRevenue,
      cogs: projection.cogs,
      grossProfit: projection.grossProfit,
      opex: projection.opex,
      netProfit: projection.netProfit,
      vat: projection.vat,
      discounts: projection.discounts,
      totalOrders,
      recipesSold,
      stockAlerts: stockAlerts.length > 0 ? stockAlerts : undefined
    };

    const payload = {
      user_id: user.id,
      date: today,
      data: snapshotData
    };

    const { error } = await supabase.from('daily_snapshots').insert(payload);
    if (error) alert("Failed to save snapshot: " + error.message);
    else {
      alert("Daily Snapshot Saved!");
      refreshData();
    }
  };

  // Helper functions for Summary (Client-side aggregation of fetched snapshots)
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
      worstDay: { date: sorted[sorted.length-1].date, profit: sorted[sorted.length-1].netProfit },
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
    // If minStock is not set (0), treat as untracked/good unless 0 stock
    if (!item.minStock || item.minStock <= 0) {
        if (item.stockQty <= 0) return { label: "OUT OF STOCK", colorClass: "bg-gray-400", textClass: "text-gray-400", bgClass: "bg-gray-100", width: 0 };
        return { label: "IN STOCK", colorClass: "bg-[#34c759]", textClass: "text-[#34c759]", bgClass: "bg-green-100", width: 100 };
    }

    const pct = (item.stockQty / (item.minStock * 2)) * 100;
    
    if (item.stockQty <= 0) {
        return { label: "OUT OF STOCK", colorClass: "bg-gray-900 dark:bg-gray-600", textClass: "text-gray-900 dark:text-gray-400", bgClass: "bg-gray-200", width: 0 };
    }
    if (item.stockQty <= item.minStock) {
        return { label: "LOW STOCK", colorClass: "bg-[#ff3b30]", textClass: "text-[#ff3b30]", bgClass: "bg-red-100", width: Math.max(pct, 10) };
    }
    if (item.stockQty <= item.minStock * 1.5) {
        return { label: "REORDER SOON", colorClass: "bg-[#ffcc00]", textClass: "text-[#ffcc00]", bgClass: "bg-yellow-100", width: Math.min(pct, 100) };
    }
    
    return { label: "GOOD", colorClass: "bg-[#34c759]", textClass: "text-[#34c759]", bgClass: "bg-green-100", width: 100 };
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
      view, setView, isLoggedIn, login, logout, darkMode, toggleDarkMode,
      data, setData, getIngredient, calculateRecipeCost, getRecipeFinancials, getProjection, getStockStatus,
      captureDailySnapshot, getWeeklySummary, getMonthlySummary,
      builder, setBuilder, loadRecipeToBuilder, saveCurrentRecipe, deleteRecipe, duplicateRecipe, resetBuilder,
      selectedRecipeId, setSelectedRecipeId,
      inventoryEditMode, toggleInventoryEdit, updateStockItem, addStockItem, deleteStockItem,
      activeModal, pickerFilter, openModal, closeModal, editingStockItem,
      confirmModal, askConfirmation, closeConfirmation
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
