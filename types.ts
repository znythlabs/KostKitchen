import React from 'react';

// Augment global JSX namespace for custom elements like iconify-icon
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon?: string;
        width?: string | number;
        class?: string;
        [key: string]: any;
      };
      // Fallback for standard elements (div, span, button, etc.) if augmentation overwrites them
      [elemName: string]: any;
    }
    // Restore key support for components if global JSX namespace is overwritten
    interface IntrinsicAttributes {
      key?: React.Key | null;
    }
  }
}

export type View = 'dashboard' | 'recipes' | 'inventory' | 'finance' | 'calendar' | 'profile' | 'engineering' | 'analytics' | 'settings';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  view?: View;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'resetBuilder' | 'openBuilder' | 'selectFirstRecipe' | 'clearSelection' | 'none';
  skipIfNoData?: boolean; // Skip this step if no recipes exist (for new users)
  skipIfHasData?: boolean; // Skip this step if recipes DO exist (for existing users)
}


export type Theme = 'light' | 'dark' | 'midnight' | 'oled';

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  cost: number; // Unit Cost
  stockQty: number;
  minStock: number;
  supplier: string;
  // Detailed pricing info
  packageCost?: number;
  packageQty?: number;
  shippingFee?: number;
  priceBuffer?: number; // Percentage buffer (e.g. 10 for 10%)
  // Category type
  type?: 'ingredient' | 'other';
  category?: string;
}

export interface RecipeIngredient {
  id: number;
  qty: number;
}

export interface Recipe {
  id: number;
  name: string;
  category: string;
  ingredients: RecipeIngredient[];
  margin: number;
  price: number;
  dailyVolume: number;
  image: string | null;
  batchSize: number;
  prepTime?: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
}

export interface DailySnapshot {
  date: string; // ISO date string (YYYY-MM-DD)
  grossSales: number;
  netRevenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  netProfit: number;
  vat: number;
  discounts: number;
  totalOrders: number;
  recipesSold: { recipeId: number; recipeName: string; quantity: number; revenue: number }[];
  stockAlerts?: { ingredientId: number; ingredientName: string; stockQty: number }[];
}

export interface WeeklySummary {
  weekStart: string; // ISO date
  weekEnd: string;
  totalRevenue: number;
  totalNetProfit: number;
  avgDailyProfit: number;
  bestDay: { date: string; profit: number };
  worstDay: { date: string; profit: number };
  daysCount: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalRevenue: number;
  totalGrossProfit: number;
  totalNetProfit: number;
  avgMargin: number;
  totalDiscounts: number;
  totalVAT: number;
  daysCount: number;
}

export interface AppData {
  settings: {
    expenses: Expense[];
    isVatRegistered: boolean;
    isPwdSeniorActive: boolean;
    otherDiscountRate: number;
    dailySalesTarget?: number;
    contingencyRate?: number; // Default 5%
  };
  ingredients: Ingredient[];
  recipes: Recipe[];
  dailySnapshots: DailySnapshot[];
}

export interface BuilderState {
  id: number | null;
  name: string;
  category: string;
  ingredients: RecipeIngredient[];
  batchSize: number;
  margin: number;
  image: string | null;
  dailyVolume: number;
  showBuilder: boolean;
  prepTime?: string;
}

export interface AppContextType {
  view: View;
  setView: (v: View) => void;
  isLoggedIn: boolean;
  isLoading: boolean; // True when fetching data
  authChecked: boolean; // True after initial auth check completes
  login: () => void;
  logout: () => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;

  // Logic helpers
  getIngredient: (id: number) => Ingredient | undefined;
  calculateRecipeCost: (ingredients: { id: number, qty: number }[]) => number;
  getRecipeFinancials: (r: Recipe) => { unitCost: number; unitPrice: number; grossSales: number; netRevenue: number; cogs: number; grossProfit: number; dailyVolume: number; vat: number; discounts: number; };
  getProjection: (period?: 'daily' | 'weekly' | 'monthly') => any;
  getStockStatus: (item: Ingredient) => { label: string, colorClass: string, textClass: string, width: number, bgClass: string };

  // Calendar functions
  captureDailySnapshot: () => void;
  getWeeklySummary: (weekStart: Date) => WeeklySummary;
  getMonthlySummary: (month: string) => MonthlySummary;

  // Builder Logic
  builder: BuilderState;
  setBuilder: React.Dispatch<React.SetStateAction<BuilderState>>;
  loadRecipeToBuilder: (id: number) => void;
  saveCurrentRecipe: () => void;
  deleteRecipe: (id: number) => void;
  duplicateRecipe: (id: number) => void;
  resetBuilder: () => void;
  saveRecipeDirectly: (recipe: any) => Promise<boolean>;

  selectedRecipeId: number | null;
  setSelectedRecipeId: (id: number | null) => void;
  newlyAddedId: number | null;
  selectFirstRecipe: () => void;

  // Inventory
  inventoryEditMode: boolean;
  toggleInventoryEdit: () => void;
  updateStockItem: (id: number, field: string, value: any) => void;
  addStockItem: (item: Ingredient) => void;
  deleteStockItem: (id: number) => void;

  // Modals
  activeModal: 'picker' | 'stock' | null;
  setActiveModal: React.Dispatch<React.SetStateAction<'picker' | 'stock' | null>>;
  pickerFilter: 'ingredient' | 'other' | null;
  setPickerFilter: React.Dispatch<React.SetStateAction<'ingredient' | 'other' | null>>;
  openModal: (m: 'picker' | 'stock', itemToEdit?: Ingredient, filter?: 'ingredient' | 'other') => void;
  closeModal: () => void;
  editingStockItem: Ingredient | null;

  // Confirmation
  confirmModal: { title: string; message: string; onConfirm: () => void; isDestructive?: boolean; isOpen: boolean };
  askConfirmation: (options: { title: string; message: string; onConfirm: () => void; isDestructive?: boolean; }) => void;
  closeConfirmation: () => void;

  // Cook Mode
  cookModal: { isOpen: boolean; recipeId: number | null; recipeName: string };
  openCookModal: (recipeId: number, recipeName: string) => void;
  closeCookModal: () => void;
  cookRecipe: (recipeId: number, portions: number) => Promise<void>;
  // Tour
  isTourActive: boolean;
  currentStepIndex: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;

  // User
  user: { email?: string } | null;

  updateDailyTarget: (amount: number) => void;
  // Categories
  inventoryCategories: string[];
  addInventoryCategory: (cat: string) => void;
  recipeCategories: string[];
  addRecipeCategory: (cat: string) => void;
  // Extra Actions
  duplicateStockItem: (id: number) => void;
  updateStockItemFull: (id: number, updates: Partial<Ingredient>) => void;
  // Prompts
  setConfirmModal: React.Dispatch<React.SetStateAction<any>>;
  openConfirm: (title: string, message: string, onConfirm: () => void, isDestructive?: boolean) => void;
  promptModal: { isOpen: boolean; title: string; message: string; onConfirm: (val: string) => void; };
  openPrompt: (title: string, message: string, onConfirm: (val: string) => void) => void;
  closePrompt: () => void;
  registerTourElement: (id: string, element: HTMLElement | null) => void;
  getTourElement: (id: string) => HTMLElement | null;
}