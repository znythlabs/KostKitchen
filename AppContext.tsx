import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { AppData, View, BuilderState, Ingredient, Recipe, Expense, AppContextType, DailySnapshot, WeeklySummary, MonthlySummary } from './types';
import { INITIAL_DATA, INITIAL_BUILDER } from './constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<View>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [data, setData] = useState<AppData>(INITIAL_DATA);
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

  useEffect(() => {
    const savedTheme = localStorage.getItem("ck_theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.add("light");
    }
    const savedUser = localStorage.getItem("ck_user");
    if (savedUser) setIsLoggedIn(true);
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

  // Reset recipe selection when view changes
  useEffect(() => {
    if (view !== 'recipes') setSelectedRecipeId(null);
  }, [view]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const login = () => { localStorage.setItem("ck_user", "admin@costkitchen.com"); setIsLoggedIn(true); };
  const logout = () => { localStorage.removeItem("ck_user"); setIsLoggedIn(false); window.location.reload(); };
  const getIngredient = (id: number) => data.ingredients.find(i => i.id === id);

  const calculateRecipeCost = (ingredients: { id: number, qty: number }[]) => {
    return ingredients.reduce((s, i) => {
      const it = getIngredient(i.id);
      return s + (it ? it.cost * i.qty : 0);
    }, 0);
  };

  const getRecipeFinancials = (r: Recipe) => {
    // REVERSE ENGINEERING FROM STORED MENU PRICE
    // Formula: MenuPrice = NetPrice * (1 + VAT)
    // NetPrice = MenuPrice / (1 + VAT)
    // COGS = Cost per serving

    const batchCost = calculateRecipeCost(r.ingredients);
    const unitCost = batchCost / (r.batchSize || 1);

    // Revenue calculations
    const grossSales = r.price * r.dailyVolume; // Total Sales (VAT Inc)



    const vatRate = data.settings.isVatRegistered ? 0.12 : 0;
    const pwdRate = data.settings.isPwdSeniorActive ? 0.20 : 0;
    const otherRate = data.settings.otherDiscountRate / 100;

    // Calculate components
    // 1. VAT is calculated on the Price (assuming Price is VAT-inclusive)
    const netRevenuePerUnitBeforeDiscount = r.price / (1 + vatRate);
    const vatPerUnit = r.price - netRevenuePerUnitBeforeDiscount;
    const totalVat = vatPerUnit * r.dailyVolume;

    // 2. Discounts
    const totalPwdDiscount = grossSales * pwdRate;
    const totalOtherDiscount = grossSales * otherRate;
    const totalDiscounts = totalPwdDiscount + totalOtherDiscount;

    // 3. Net Revenue = Gross Sales - VAT - Discounts
    const netRevenue = grossSales - totalVat - totalDiscounts;

    // Cost of Goods Sold
    const cogs = unitCost * r.dailyVolume;

    // Gross Profit (Before OPEX)
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

    // Aggregate recipe data (Daily Base)
    data.recipes.forEach((r) => {
      const f = getRecipeFinancials(r);
      totals.grossSales += f.grossSales;
      totals.netRevenue += f.netRevenue;
      totals.cogs += f.cogs;
      totals.grossProfit += f.grossProfit;
      totals.vat += f.vat;
      totals.discounts += f.discounts;
      // @ts-ignore - implicitly added to return type
      totals.pwdDiscount += f.pwdDiscount;
      // @ts-ignore
      totals.otherDiscount += f.otherDiscount;
    });

    let multiplier = 1;
    if (period === 'weekly') multiplier = 7;
    if (period === 'monthly') multiplier = 30;

    // Scale totals
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
    // Daily OPEX base
    const dailyOpEx = totalMonthlyEx / 30;
    const scaledOpEx = dailyOpEx * multiplier;

    // Operating Profit (Net Profit) = Gross Profit - OPEX
    const operatingProfit = scaled.grossProfit - scaledOpEx;

    // Return values adhering to the strict flow
    return {
      ...scaled,
      opex: scaledOpEx,
      netProfit: operatingProfit // This is strictly Operating Profit (After OPEX)
    };
  };

  const captureDailySnapshot = () => {
    const today = new Date().toISOString().split('T')[0];
    const projection = getProjection('daily');

    // Calculate total orders
    const totalOrders = data.recipes.reduce((sum, r) => sum + r.dailyVolume, 0);

    // Build recipe sales data
    const recipesSold = data.recipes.map(r => {
      const f = getRecipeFinancials(r);
      return {
        recipeId: r.id,
        recipeName: r.name,
        quantity: r.dailyVolume,
        revenue: f.grossSales
      };
    });

    // Stock alerts
    const stockAlerts = data.ingredients
      .filter(i => i.stockQty <= i.minStock)
      .map(i => ({ ingredientId: i.id, ingredientName: i.name, stockQty: i.stockQty }));

    const snapshot: DailySnapshot = {
      date: today,
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

    setData(prev => ({
      ...prev,
      dailySnapshots: [...prev.dailySnapshots.filter(s => s.date !== today), snapshot]
    }));
  };

  const getWeeklySummary = (weekStart: Date): WeeklySummary => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const weekSnapshots = data.dailySnapshots.filter(s => s.date >= weekStartStr && s.date <= weekEndStr);

    if (weekSnapshots.length === 0) {
      return {
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        totalRevenue: 0,
        totalNetProfit: 0,
        avgDailyProfit: 0,
        bestDay: { date: weekStartStr, profit: 0 },
        worstDay: { date: weekStartStr, profit: 0 },
        daysCount: 0
      };
    }

    const totalRevenue = weekSnapshots.reduce((sum, s) => sum + s.netRevenue, 0);
    const totalNetProfit = weekSnapshots.reduce((sum, s) => sum + s.netProfit, 0);
    const avgDailyProfit = totalNetProfit / weekSnapshots.length;

    const sortedByProfit = [...weekSnapshots].sort((a, b) => b.netProfit - a.netProfit);
    const bestDay = { date: sortedByProfit[0].date, profit: sortedByProfit[0].netProfit };
    const worstDay = { date: sortedByProfit[sortedByProfit.length - 1].date, profit: sortedByProfit[sortedByProfit.length - 1].netProfit };

    return {
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      totalRevenue,
      totalNetProfit,
      avgDailyProfit,
      bestDay,
      worstDay,
      daysCount: weekSnapshots.length
    };
  };

  const getMonthlySummary = (month: string): MonthlySummary => {
    const monthSnapshots = data.dailySnapshots.filter(s => s.date.startsWith(month));

    if (monthSnapshots.length === 0) {
      return {
        month,
        totalRevenue: 0,
        totalGrossProfit: 0,
        totalNetProfit: 0,
        avgMargin: 0,
        totalDiscounts: 0,
        totalVAT: 0,
        daysCount: 0
      };
    }

    const totalRevenue = monthSnapshots.reduce((sum, s) => sum + s.netRevenue, 0);
    const totalGrossProfit = monthSnapshots.reduce((sum, s) => sum + s.grossProfit, 0);
    const totalNetProfit = monthSnapshots.reduce((sum, s) => sum + s.netProfit, 0);
    const totalDiscounts = monthSnapshots.reduce((sum, s) => sum + s.discounts, 0);
    const totalVAT = monthSnapshots.reduce((sum, s) => sum + s.vat, 0);
    const avgMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

    return {
      month,
      totalRevenue,
      totalGrossProfit,
      totalNetProfit,
      avgMargin,
      totalDiscounts,
      totalVAT,
      daysCount: monthSnapshots.length
    };
  };

  const getStockStatus = (item: Ingredient) => {
    const pct = (item.stockQty / (item.minStock * 3)) * 100;
    let label = "GOOD", colorClass = "bg-[#34c759]", bgClass = "bg-green-100 dark:bg-green-900/40", textClass = "text-[#34c759] dark:text-[#4ade80]";
    if (item.stockQty <= item.minStock) {
      label = "LOW"; colorClass = "bg-[#ff3b30]"; bgClass = "bg-red-100 dark:bg-red-900/40"; textClass = "text-[#ff3b30] dark:text-[#ff6b60]";
    } else if (item.stockQty <= item.minStock * 2) {
      label = "MEDIUM"; colorClass = "bg-[#ffcc00]"; bgClass = "bg-yellow-100 dark:bg-yellow-900/40"; textClass = "text-[#e6b800] dark:text-[#fcc419]";
    }
    return { label, colorClass, textClass, bgClass, width: Math.min(pct, 100) };
  };

  const loadRecipeToBuilder = (id: number) => {
    const r = data.recipes.find(i => i.id === id);
    if (r) { setBuilder({ ...r, showBuilder: true }); setView('recipes'); }
  };

  const resetBuilder = () => setBuilder(INITIAL_BUILDER);

  const saveCurrentRecipe = () => {
    // CORE PRICING LOGIC
    const totalCost = calculateRecipeCost(builder.ingredients);
    const costPerServing = totalCost / (builder.batchSize || 1);

    // Pricing: Cost / (1 - Margin) = Net Price. Net Price * (1 + VAT) = Menu Price.
    const netPrice = costPerServing / (1 - (builder.margin / 100));
    const vatRate = data.settings.isVatRegistered ? 0.12 : 0;
    const vatMultiplier = 1 + vatRate;
    const menuPrice = Math.ceil(netPrice * vatMultiplier);

    const r: Recipe = { ...builder, price: menuPrice, id: builder.id || Date.now() };
    setData(prev => {
      const idx = prev.recipes.findIndex(x => x.id === r.id);
      const newRecipes = [...prev.recipes];
      if (idx !== -1) newRecipes[idx] = r; else newRecipes.push(r);
      return { ...prev, recipes: newRecipes };
    });
  };

  const duplicateRecipe = (id: number) => {
    const r = data.recipes.find(x => x.id === id);
    if (!r) return;
    const copy: Recipe = { ...r, id: Date.now(), name: `${r.name} (Copy)` };
    setData(prev => ({ ...prev, recipes: [...prev.recipes, copy] }));
  };

  const deleteRecipe = (id: number) => {
    setData(prev => ({ ...prev, recipes: prev.recipes.filter(r => r.id !== id) }));
  };

  const updateStockItem = (id: number, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(i => {
        if (i.id !== id) return i;

        // Create updated object first
        const updated = { ...i, [field]: value };

        // Auto-recalculate unit cost if pricing fields change
        if (['packageCost', 'packageQty', 'shippingFee', 'priceBuffer'].includes(field)) {
          const pc = field === 'packageCost' ? Number(value) : (updated.packageCost || 0);
          const pq = field === 'packageQty' ? Number(value) : (updated.packageQty || 0);
          const sf = field === 'shippingFee' ? Number(value) : (updated.shippingFee || 0);
          const bf = field === 'priceBuffer' ? Number(value) : (updated.priceBuffer || 0);

          if (pq > 0) {
            const bufferedPackageCost = pc * (1 + (bf / 100));
            updated.cost = (bufferedPackageCost + sf) / pq;
          }
        }

        return updated;
      })
    }));
  };

  const addStockItem = (item: Ingredient) => {
    setData(prev => {
      const exists = prev.ingredients.findIndex(i => i.id === item.id);
      if (exists !== -1) {
        const newIng = [...prev.ingredients];
        newIng[exists] = item;
        return { ...prev, ingredients: newIng };
      }
      return { ...prev, ingredients: [...prev.ingredients, item] };
    });
  };

  const deleteStockItem = (id: number) => { setData(prev => ({ ...prev, ingredients: prev.ingredients.filter(i => i.id !== id) })); };
  const toggleInventoryEdit = () => setInventoryEditMode(!inventoryEditMode);

  const openModal = (m: 'picker' | 'stock', itemToEdit?: Ingredient, filter?: 'ingredient' | 'other') => {
    if (itemToEdit) setEditingStockItem(itemToEdit);
    else setEditingStockItem(null);
    if (filter) setPickerFilter(filter);
    else setPickerFilter(null);
    setActiveModal(m);
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingStockItem(null);
    setPickerFilter(null);
  };

  const askConfirmation = (options: { title: string; message: string; onConfirm: () => void; isDestructive?: boolean; }) => { setConfirmModal({ ...options, isOpen: true }); };
  const closeConfirmation = () => { setConfirmModal(prev => ({ ...prev, isOpen: false })); };

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