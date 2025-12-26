/**
 * Data Validation Utilities
 * Client-side validation before database operations
 */

import { Ingredient, Recipe, Expense } from '../types';

// ============================================
// INGREDIENT VALIDATORS
// ============================================

export const ingredientValidators = {
    name: (v: string): boolean => {
        const trimmed = v?.trim() || '';
        return trimmed.length > 0 && trimmed.length <= 100;
    },
    unit: (v: string): boolean => {
        const trimmed = v?.trim() || '';
        return trimmed.length > 0 && trimmed.length <= 20;
    },
    cost: (v: number): boolean => {
        return typeof v === 'number' && !isNaN(v) && v >= 0 && v <= 1000000;
    },
    stockQty: (v: number): boolean => {
        return typeof v === 'number' && !isNaN(v) && v >= 0;
    },
    minStock: (v: number): boolean => {
        return typeof v === 'number' && !isNaN(v) && v >= 0;
    },
    packageCost: (v: number | undefined): boolean => {
        if (v === undefined || v === null) return true;
        return typeof v === 'number' && !isNaN(v) && v >= 0;
    },
    packageQty: (v: number | undefined): boolean => {
        if (v === undefined || v === null) return true;
        return typeof v === 'number' && !isNaN(v) && v > 0;
    },
    priceBuffer: (v: number | undefined): boolean => {
        if (v === undefined || v === null) return true;
        return typeof v === 'number' && !isNaN(v) && v >= 0 && v <= 100;
    },
    supplier: (v: string | undefined): boolean => {
        if (!v) return true;
        return v.length <= 100;
    },
    type: (v: string | undefined): boolean => {
        // Allow undefined - will default to 'ingredient'
        if (v === undefined || v === null) return true;
        return v === 'ingredient' || v === 'other';
    }
};

// ============================================
// RECIPE VALIDATORS
// ============================================

export const recipeValidators = {
    name: (v: string): boolean => {
        const trimmed = v?.trim() || '';
        return trimmed.length > 0 && trimmed.length <= 100;
    },
    category: (v: string | undefined): boolean => {
        if (!v) return true;
        return v.length <= 50;
    },
    margin: (v: number): boolean => {
        return typeof v === 'number' && v >= 0 && v <= 100;
    },
    price: (v: number): boolean => {
        return typeof v === 'number' && v >= 0 && v <= 100000;
    },
    batchSize: (v: number): boolean => {
        return typeof v === 'number' && v >= 1 && v <= 1000;
    },
    dailyVolume: (v: number): boolean => {
        return typeof v === 'number' && v >= 0 && v <= 10000;
    }
};

// ============================================
// EXPENSE VALIDATORS
// ============================================

export const expenseValidators = {
    category: (v: string): boolean => {
        const trimmed = v?.trim() || '';
        return trimmed.length > 0 && trimmed.length <= 50;
    },
    amount: (v: number): boolean => {
        return typeof v === 'number' && v >= 0 && v <= 10000000;
    }
};

// ============================================
// FULL OBJECT VALIDATORS
// ============================================

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export const validateIngredient = (data: Partial<Ingredient>): ValidationResult => {
    const errors: string[] = [];

    if (data.name !== undefined && !ingredientValidators.name(data.name)) {
        errors.push("Name must be 1-100 characters");
    }
    if (data.unit !== undefined && !ingredientValidators.unit(data.unit)) {
        errors.push("Unit must be 1-20 characters");
    }
    if (data.cost !== undefined && !ingredientValidators.cost(data.cost)) {
        errors.push("Cost must be 0 or positive (max 1,000,000)");
    }
    if (data.stockQty !== undefined && !ingredientValidators.stockQty(data.stockQty)) {
        errors.push("Stock quantity cannot be negative");
    }
    if (data.minStock !== undefined && !ingredientValidators.minStock(data.minStock)) {
        errors.push("Minimum stock cannot be negative");
    }
    if (data.packageCost !== undefined && !ingredientValidators.packageCost(data.packageCost)) {
        errors.push("Package cost cannot be negative");
    }
    if (data.packageQty !== undefined && !ingredientValidators.packageQty(data.packageQty)) {
        errors.push("Package quantity must be positive");
    }
    if (data.priceBuffer !== undefined && !ingredientValidators.priceBuffer(data.priceBuffer)) {
        errors.push("Price buffer must be 0-100%");
    }
    if (data.type !== undefined && !ingredientValidators.type(data.type)) {
        errors.push("Type must be 'ingredient' or 'other'");
    }

    return { valid: errors.length === 0, errors };
};

export const validateRecipe = (data: Partial<Recipe>): ValidationResult => {
    const errors: string[] = [];

    if (data.name !== undefined && !recipeValidators.name(data.name)) {
        errors.push("Name must be 1-100 characters");
    }
    if (data.category !== undefined && !recipeValidators.category(data.category)) {
        errors.push("Category must be 50 characters or less");
    }
    if (data.margin !== undefined && !recipeValidators.margin(data.margin)) {
        errors.push("Margin must be 0-100%");
    }
    if (data.price !== undefined && !recipeValidators.price(data.price)) {
        errors.push("Price must be 0 or positive (max 100,000)");
    }
    if (data.batchSize !== undefined && !recipeValidators.batchSize(data.batchSize)) {
        errors.push("Batch size must be 1-1000");
    }
    if (data.dailyVolume !== undefined && !recipeValidators.dailyVolume(data.dailyVolume)) {
        errors.push("Daily volume must be 0-10000");
    }

    return { valid: errors.length === 0, errors };
};

export const validateExpense = (data: Partial<Expense>): ValidationResult => {
    const errors: string[] = [];

    if (data.category !== undefined && !expenseValidators.category(data.category)) {
        errors.push("Category must be 1-50 characters");
    }
    if (data.amount !== undefined && !expenseValidators.amount(data.amount)) {
        errors.push("Amount must be 0 or positive");
    }

    return { valid: errors.length === 0, errors };
};

// ============================================
// UTILITY: Sanitize numbers (handle string inputs)
// ============================================

export const toSafeNumber = (value: any, fallback: number = 0): number => {
    if (value === null || value === undefined || value === '') return fallback;
    const num = Number(value);
    return isNaN(num) ? fallback : num;
};

export const toPositiveNumber = (value: any, fallback: number = 0): number => {
    const num = toSafeNumber(value, fallback);
    return num < 0 ? fallback : num;
};
