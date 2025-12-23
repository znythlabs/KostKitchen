import { AppData } from './types';

export const INITIAL_DATA: AppData = {
  settings: {
    expenses: [
      // Default placeholder expenses
      { id: 1, category: "Rent", amount: 0 },
      { id: 2, category: "Utilities", amount: 0 },
      { id: 3, category: "Staff", amount: 0 },
    ],
    isVatRegistered: true,
    isPwdSeniorActive: false,
    otherDiscountRate: 0
  },
  ingredients: [],
  recipes: [],
  dailySnapshots: []
};

export const INITIAL_BUILDER = {
  id: undefined,
  name: '',
  category: '',
  ingredients: [],
  margin: 70, // Default margin
  price: 0,
  dailyVolume: 10,
  image: null,
  batchSize: 1,
  showBuilder: false
};

import { TourStep } from './types';

export const TOUR_STEPS: TourStep[] = [
  {
    targetId: 'root',
    title: 'Welcome to CostKitchen!',
    content: "Let's take a detailed tour to master your restaurant management. We'll cover everything from simple inventory to advanced menu engineering.",
    position: 'center',
    action: 'resetBuilder'
  },
  // --- DASHBOARD ---
  {
    targetId: 'nav-dashboard',
    title: 'Dashboard Overview',
    content: 'Your command center. See real-time alerts, daily sales (if connected), and quick cost summaries.',
    view: 'dashboard',
    position: 'right'
  },
  // 3. RECIPES
  {
    targetId: 'nav-recipes',
    title: 'Recipe Management',
    content: 'Your digital cookbook. Manage all your dishes and costs here.',
    view: 'recipes',
    position: 'right',
    action: 'resetBuilder'
  },
  {
    targetId: 'recipe-create-btn',
    title: 'Create or Edit',
    content: 'Click here to capture a new dish or open the Builder.',
    view: 'recipes',
    position: 'bottom'
  },
  {
    targetId: 'recipe-card-0',
    title: 'Select a Recipe',
    content: 'Clicking a recipe card selects it, unlocking quick actions.',
    view: 'recipes',
    position: 'right'
  },
  {
    targetId: 'recipe-action-edit',
    title: 'Quick Edit',
    content: 'Once selected, easily Edit, Copy, or Delete recipes instantly.',
    view: 'recipes',
    position: 'bottom',
    action: 'selectFirstRecipe'
  },
  // 4. BUILDER MODE
  {
    targetId: 'tour-name-wrapper',
    title: 'Name Your Dish',
    content: 'Give your creation a name and set an estimated daily volume.',
    view: 'recipes',
    position: 'right',
    action: 'openBuilder'
  },
  {
    targetId: 'builder-category',
    title: 'Category Strategy',
    content: 'Categorize your dish (e.g., Main, Starter) for matrix analysis.',
    view: 'recipes',
    position: 'right'
  },
  {
    targetId: 'builder-ingredients',
    title: 'Costing Engine',
    content: 'Add ingredients from your inventory. Costs are calculated automatically. (Position: Top)',
    view: 'recipes',
    position: 'top'
  },
  {
    targetId: 'builder-pricing',
    title: 'Pricing & Margin',
    content: 'Set your selling price. We show your margin and recommended price in real-time. (Position: Top)',
    view: 'recipes',
    position: 'top'
  },
  {
    targetId: 'builder-save-btn',
    title: 'Save Recipe',
    content: 'Don\'t forget to save your profitable creation! (Position: Left)',
    view: 'recipes',
    position: 'left'
  },
  // 5. MENU ENGINEERING
  {
    targetId: 'nav-engineering',
    title: 'Menu Engineering',
    content: 'Analyze Profit vs. Popularity to optimize your menu mix.',
    view: 'engineering',
    position: 'right',
    action: 'resetBuilder'
  },
  // --- INVENTORY ---
  {
    targetId: 'nav-inventory',
    title: 'Smart Inventory',
    content: 'Manage your stock, suppliers, and costs in one place.',
    view: 'inventory',
    position: 'right'
  },
  {
    targetId: 'inventory-add-btn',
    title: 'Add Items',
    content: 'Quickly add ingredients or packaging to your database.',
    view: 'inventory',
    position: 'bottom'
  },
  {
    targetId: 'inventory-ai-btn',
    title: 'AI Stock Agent',
    content: 'Let AI analyze your stock levels and suggest reorders.',
    view: 'inventory',
    position: 'bottom'
  },
  // --- FINANCE ---
  {
    targetId: 'nav-finance',
    title: 'Financial Health',
    content: 'Your P&L at a glance. Track Gross Profit, OPEX, and Net Profit.',
    view: 'finance',
    position: 'right'
  },
  {
    targetId: 'finance-add-btn',
    title: 'Track Expenses',
    content: 'Add fixed costs like Rent, Salaries, and Utilities here to get a true Net Profit calculation.',
    view: 'finance',
    position: 'left'
  },
  {
    targetId: 'header-theme',
    title: 'You\'re All Set!',
    content: 'Explore the settings or customization options. Happy cooking!',
    position: 'bottom'
  }
];
