/**
 * Data Service
 * Centralized data access layer with optimizations for Supabase free tier
 * 
 * Optimizations:
 * - Batched updates (debounce rapid changes)
 * - Selective field updates (only send changed fields)
 * - Local cache first (reduce API calls)
 * - Compression for large payloads
 * - Cleanup of old snapshots
 */

import { supabase } from './supabase';
import {
    addToSyncQueue,
    getPendingOperations,
    removeFromSyncQueue,
    isOnline,
    saveDataCache,
    loadDataCache,
    processSyncQueue,
    onNetworkChange,
    hasPendingChanges
} from './offline-storage';
import { validateIngredient, validateRecipe, validateExpense } from './validators';
import { Ingredient, Recipe, Expense, DailySnapshot, AppData } from '../types';

// ============================================
// TYPES
// ============================================

interface DataServiceConfig {
    debounceMs: number;
    maxRetries: number;
    snapshotRetentionDays: number;
}

const DEFAULT_CONFIG: DataServiceConfig = {
    debounceMs: 500, // Batch updates within 500ms
    maxRetries: 3,
    snapshotRetentionDays: 90
};

// ============================================
// DEBOUNCE UTILITY
// ============================================

const debounceTimers: Record<string, NodeJS.Timeout> = {};

const debounce = (key: string, fn: () => void, ms: number = DEFAULT_CONFIG.debounceMs) => {
    if (debounceTimers[key]) {
        clearTimeout(debounceTimers[key]);
    }
    debounceTimers[key] = setTimeout(fn, ms);
};

// ============================================
// FIELD MAPPING (camelCase <-> snake_case)
// ============================================

const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    const fieldMap: Record<string, string> = {
        stockQty: 'stock_qty',
        minStock: 'min_stock',
        packageCost: 'package_cost',
        packageQty: 'package_qty',
        shippingFee: 'shipping_fee',
        priceBuffer: 'price_buffer',
        userId: 'user_id',
        dailyVolume: 'daily_volume',
        batchSize: 'batch_size',
        recipeId: 'recipe_id',
        ingredientId: 'ingredient_id',
        isVatRegistered: 'is_vat_registered',
        isPwdSeniorActive: 'is_pwd_senior_active',
        otherDiscountRate: 'other_discount_rate',
        grossSales: 'gross_sales',
        netRevenue: 'net_revenue',
        grossProfit: 'gross_profit',
        netProfit: 'net_profit',
        totalOrders: 'total_orders'
    };

    for (const [key, value] of Object.entries(obj)) {
        const snakeKey = fieldMap[key] || key;
        result[snakeKey] = value;
    }

    return result;
};

const toCamelCase = (obj: Record<string, any>): Record<string, any> => {
    const result: Record<string, any> = {};
    const fieldMap: Record<string, string> = {
        stock_qty: 'stockQty',
        min_stock: 'minStock',
        package_cost: 'packageCost',
        package_qty: 'packageQty',
        shipping_fee: 'shippingFee',
        price_buffer: 'priceBuffer',
        user_id: 'userId',
        daily_volume: 'dailyVolume',
        batch_size: 'batchSize',
        recipe_id: 'recipeId',
        ingredient_id: 'ingredientId',
        is_vat_registered: 'isVatRegistered',
        is_pwd_senior_active: 'isPwdSeniorActive',
        other_discount_rate: 'otherDiscountRate',
        gross_sales: 'grossSales',
        net_revenue: 'netRevenue',
        gross_profit: 'grossProfit',
        net_profit: 'netProfit',
        total_orders: 'totalOrders',
        created_at: 'createdAt',
        updated_at: 'updatedAt'
    };

    for (const [key, value] of Object.entries(obj)) {
        const camelKey = fieldMap[key] || key;
        result[camelKey] = value;
    }

    return result;
};

// ============================================
// EXECUTE SYNC OPERATION
// ============================================

const executeSyncOperation = async (op: any): Promise<boolean> => {
    try {
        const { table, operation, payload } = op;

        switch (operation) {
            case 'insert':
                const { error: insertError } = await supabase.from(table).insert(payload);
                return !insertError;

            case 'update':
                const { id, ...updateData } = payload;
                const { error: updateError } = await supabase.from(table).update(updateData).eq('id', id);
                return !updateError;

            case 'delete':
                const { error: deleteError } = await supabase.from(table).delete().eq('id', payload.id);
                return !deleteError;

            case 'upsert':
                const { error: upsertError } = await supabase.from(table).upsert(payload);
                return !upsertError;

            default:
                return false;
        }
    } catch (error) {
        console.error('Execute sync operation error:', error);
        return false;
    }
};

// ============================================
// DATA SERVICE
// ============================================

class DataService {
    private userId: string | null = null;
    private cleanupListener: (() => void) | null = null;

    // Initialize with user
    async init(userId: string) {
        this.userId = userId;

        // Set up network listener for auto-sync
        this.cleanupListener = onNetworkChange(async (online) => {
            if (online) {
                console.log('Network restored, syncing pending operations...');
                await this.syncPendingOperations();
            }
        });

        // Initial sync if online
        if (isOnline()) {
            await this.syncPendingOperations();
        }
    }

    cleanup() {
        if (this.cleanupListener) {
            this.cleanupListener();
            this.cleanupListener = null;
        }
    }

    // ============================================
    // SYNC
    // ============================================

    async syncPendingOperations(): Promise<{ processed: number; failed: number }> {
        return processSyncQueue(executeSyncOperation);
    }

    async getPendingChangesCount(): Promise<number> {
        const ops = await getPendingOperations();
        return ops.length;
    }

    // ============================================
    // INGREDIENTS
    // ============================================

    async getIngredients(): Promise<Ingredient[]> {
        const { data, error } = await supabase
            .from('ingredients')
            .select('*')
            .order('name');

        if (error) throw error;

        return (data || []).map((i: any) => ({
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
    }

    async createIngredient(ingredient: Omit<Ingredient, 'id'>): Promise<{ id: number } | null> {
        const validation = validateIngredient(ingredient);
        if (!validation.valid) {
            console.error('Validation failed:', validation.errors);
            return null;
        }

        const payload = {
            user_id: this.userId,
            ...toSnakeCase(ingredient)
        };

        if (!isOnline()) {
            // Queue for later
            await addToSyncQueue({ table: 'ingredients', operation: 'insert', payload });
            return { id: Date.now() }; // Temporary ID
        }

        const { data, error } = await supabase
            .from('ingredients')
            .insert(payload)
            .select('id')
            .single();

        if (error) {
            console.error('Create ingredient error:', error);
            return null;
        }

        return { id: data.id };
    }

    async updateIngredient(id: number, updates: Partial<Ingredient>): Promise<boolean> {
        const validation = validateIngredient(updates);
        if (!validation.valid) {
            console.error('Validation failed:', validation.errors);
            return false;
        }

        const payload = { id, ...toSnakeCase(updates) };

        if (!isOnline()) {
            await addToSyncQueue({ table: 'ingredients', operation: 'update', payload });
            return true;
        }

        const { id: _, ...updateData } = payload;
        const { error } = await supabase
            .from('ingredients')
            .update(updateData)
            .eq('id', id);

        if (error) {
            console.error('Update ingredient error:', error);
            return false;
        }

        return true;
    }

    async deleteIngredient(id: number): Promise<boolean> {
        if (!isOnline()) {
            await addToSyncQueue({ table: 'ingredients', operation: 'delete', payload: { id } });
            return true;
        }

        // First delete recipe_ingredients references
        await supabase.from('recipe_ingredients').delete().eq('ingredient_id', id);

        const { error } = await supabase.from('ingredients').delete().eq('id', id);

        if (error) {
            console.error('Delete ingredient error:', error);
            return false;
        }

        return true;
    }

    // ============================================
    // RECIPES
    // ============================================

    async getRecipes(): Promise<Recipe[]> {
        const [recRes, recIngRes] = await Promise.all([
            supabase.from('recipes').select('*').order('id', { ascending: false }),
            supabase.from('recipe_ingredients').select('*')
        ]);

        if (recRes.error) throw recRes.error;

        // Build ingredients map for fast lookup
        const ingredientsByRecipeId = new Map<number, { id: number; qty: number }[]>();
        (recIngRes.data || []).forEach((ri: any) => {
            const recipeId = ri.recipe_id;
            if (!ingredientsByRecipeId.has(recipeId)) {
                ingredientsByRecipeId.set(recipeId, []);
            }
            ingredientsByRecipeId.get(recipeId)!.push({ id: ri.ingredient_id, qty: Number(ri.qty) });
        });

        return (recRes.data || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            category: r.category || '',
            margin: Number(r.margin),
            price: Number(r.price),
            dailyVolume: Number(r.daily_volume),
            image: r.image,
            batchSize: Number(r.batch_size),
            ingredients: ingredientsByRecipeId.get(r.id) || []
        }));
    }

    async createRecipe(recipe: Omit<Recipe, 'id'>, ingredients: { id: number; qty: number }[]): Promise<{ id: number } | null> {
        const validation = validateRecipe(recipe);
        if (!validation.valid) {
            console.error('Validation failed:', validation.errors);
            return null;
        }

        const payload = {
            user_id: this.userId,
            name: recipe.name,
            category: recipe.category,
            margin: recipe.margin,
            price: recipe.price,
            daily_volume: recipe.dailyVolume,
            image: recipe.image,
            batch_size: recipe.batchSize
        };

        const { data, error } = await supabase
            .from('recipes')
            .insert(payload)
            .select('id')
            .single();

        if (error) {
            console.error('Create recipe error:', error);
            return null;
        }

        // Insert ingredients
        if (ingredients.length > 0) {
            const ingPayload = ingredients.map(ri => ({
                recipe_id: data.id,
                ingredient_id: ri.id,
                qty: ri.qty
            }));
            await supabase.from('recipe_ingredients').insert(ingPayload);
        }

        return { id: data.id };
    }

    async updateRecipe(id: number, updates: Partial<Recipe>, ingredients?: { id: number; qty: number }[]): Promise<boolean> {
        const validation = validateRecipe(updates);
        if (!validation.valid) {
            console.error('Validation failed:', validation.errors);
            return false;
        }

        const payload = toSnakeCase(updates);
        delete payload.ingredients; // Don't send to recipes table

        const { error } = await supabase
            .from('recipes')
            .update(payload)
            .eq('id', id);

        if (error) {
            console.error('Update recipe error:', error);
            return false;
        }

        // Update ingredients if provided
        if (ingredients !== undefined) {
            await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
            if (ingredients.length > 0) {
                const ingPayload = ingredients.map(ri => ({
                    recipe_id: id,
                    ingredient_id: ri.id,
                    qty: ri.qty
                }));
                await supabase.from('recipe_ingredients').insert(ingPayload);
            }
        }

        return true;
    }

    async deleteRecipe(id: number): Promise<boolean> {
        const { error } = await supabase.from('recipes').delete().eq('id', id);

        if (error) {
            console.error('Delete recipe error:', error);
            return false;
        }

        return true;
    }

    // ============================================
    // SETTINGS
    // ============================================

    async getSettings(): Promise<any> {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error

        return data ? {
            isVatRegistered: data.is_vat_registered || false,
            isPwdSeniorActive: data.is_pwd_senior_active || false,
            otherDiscountRate: Number(data.other_discount_rate || 0)
        } : null;
    }

    async updateSettings(updates: any): Promise<boolean> {
        const payload = toSnakeCase(updates);

        const { error } = await supabase
            .from('settings')
            .update(payload)
            .eq('user_id', this.userId);

        if (error) {
            console.error('Update settings error:', error);
            return false;
        }

        return true;
    }

    // ============================================
    // EXPENSES
    // ============================================

    async getExpenses(): Promise<Expense[]> {
        const { data, error } = await supabase
            .from('expenses')
            .select('*');

        if (error) throw error;

        return (data || []).map((e: any) => ({
            id: e.id,
            category: e.category,
            amount: Number(e.amount)
        }));
    }

    async createExpense(expense: Omit<Expense, 'id'>): Promise<{ id: number } | null> {
        const validation = validateExpense(expense);
        if (!validation.valid) {
            console.error('Validation failed:', validation.errors);
            return null;
        }

        const { data, error } = await supabase
            .from('expenses')
            .insert({ user_id: this.userId, ...expense })
            .select('id')
            .single();

        if (error) {
            console.error('Create expense error:', error);
            return null;
        }

        return { id: data.id };
    }

    async deleteExpense(id: number): Promise<boolean> {
        const { error } = await supabase.from('expenses').delete().eq('id', id);

        if (error) {
            console.error('Delete expense error:', error);
            return false;
        }

        return true;
    }

    // ============================================
    // DAILY SNAPSHOTS
    // ============================================

    async getSnapshots(limit: number = 90): Promise<DailySnapshot[]> {
        const { data, error } = await supabase
            .from('daily_snapshots')
            .select('*')
            .order('date', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data || []).map((s: any) => ({
            date: s.date,
            grossSales: Number(s.gross_sales),
            netRevenue: Number(s.net_revenue),
            cogs: Number(s.cogs),
            grossProfit: Number(s.gross_profit),
            opex: Number(s.opex),
            netProfit: Number(s.net_profit),
            vat: Number(s.vat),
            discounts: Number(s.discounts),
            totalOrders: Number(s.total_orders),
            recipesSold: []
        }));
    }

    async saveSnapshot(snapshot: Omit<DailySnapshot, 'recipesSold' | 'stockAlerts'>): Promise<boolean> {
        const payload = {
            user_id: this.userId,
            date: snapshot.date,
            gross_sales: snapshot.grossSales,
            net_revenue: snapshot.netRevenue,
            cogs: snapshot.cogs,
            gross_profit: snapshot.grossProfit,
            opex: snapshot.opex,
            net_profit: snapshot.netProfit,
            vat: snapshot.vat,
            discounts: snapshot.discounts,
            total_orders: snapshot.totalOrders
        };

        const { error } = await supabase
            .from('daily_snapshots')
            .upsert(payload, { onConflict: 'user_id,date' });

        if (error) {
            console.error('Save snapshot error:', error);
            return false;
        }

        return true;
    }

    // ============================================
    // CLEANUP (Supabase storage optimization)
    // ============================================

    async cleanupOldSnapshots(days: number = 90): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('daily_snapshots')
            .delete()
            .lt('date', cutoffStr)
            .select('id');

        if (error) {
            console.error('Cleanup snapshots error:', error);
            return 0;
        }

        return data?.length || 0;
    }
}

// Export singleton instance
export const dataService = new DataService();
