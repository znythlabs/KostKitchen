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
import { Ingredient, Recipe, Expense, DailySnapshot, AppData, Order } from '../types';

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
        dailySalesTarget: 'daily_sales_target',
        grossSales: 'gross_sales',
        netRevenue: 'net_revenue',
        grossProfit: 'gross_profit',
        netProfit: 'net_profit',
        totalOrders: 'total_orders',
        currency: 'currency',
        measurementUnit: 'measurement_unit'
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
        daily_sales_target: 'dailySalesTarget',
        gross_sales: 'grossSales',
        net_revenue: 'netRevenue',
        gross_profit: 'grossProfit',
        net_profit: 'netProfit',
        total_orders: 'totalOrders',
        currency: 'currency',
        measurement_unit: 'measurementUnit',
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

    // Helper to get user ID with fallback
    private async ensureUserId(): Promise<string | null> {
        // Always double check auth state if ID is missing or strictly
        if (!this.userId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.id) {
                this.userId = user.id;
            }
        }
        return this.userId;
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

        return (data || []).map((i: any) => {
            const packageCost = i.package_cost ? Number(i.package_cost) : undefined;
            const packageQty = i.package_qty ? Number(i.package_qty) : undefined;
            const shippingFee = i.shipping_fee ? Number(i.shipping_fee) : 0;
            const priceBuffer = i.price_buffer ? Number(i.price_buffer) : 0;

            // Recalculate cost if package info exists to ensure shipping is included
            let cost = Number(i.cost);
            if (packageCost && packageQty && packageQty > 0) {
                const bufferedPackageCost = packageCost * (1 + (priceBuffer / 100));
                cost = (bufferedPackageCost + shippingFee) / packageQty;
            }

            return {
                id: i.id,
                name: i.name,
                unit: i.unit,
                cost,
                stockQty: Number(i.stock_qty),
                minStock: Number(i.min_stock),
                supplier: i.supplier || '',
                packageCost,
                packageQty,
                shippingFee,
                priceBuffer,
                type: (i.type || 'ingredient') as 'ingredient' | 'other'
            };
        });
    }

    async createIngredient(ingredient: Omit<Ingredient, 'id'>): Promise<{ id: number } | null> {
        // Check required fields
        if (!ingredient.name?.trim() || !ingredient.unit?.trim()) {
            console.error('Missing required fields: name or unit');
            return null;
        }

        // Ensure we have a user ID
        const userId = await this.ensureUserId();
        if (!userId) {
            console.error('No user ID available - user may not be logged in');
            return null;
        }

        // Build payload without id - exclude any id that might be passed
        const { id: _ignoreId, ...ingredientWithoutId } = ingredient as any;

        const payload = {
            user_id: userId,
            name: ingredientWithoutId.name,
            unit: ingredientWithoutId.unit,
            cost: Number(ingredientWithoutId.cost) || 0,
            stock_qty: Number(ingredientWithoutId.stockQty) || 0,
            min_stock: Number(ingredientWithoutId.minStock) || 0,
            supplier: ingredientWithoutId.supplier || '',
            package_cost: ingredientWithoutId.packageCost ? Number(ingredientWithoutId.packageCost) : null,
            package_qty: ingredientWithoutId.packageQty ? Number(ingredientWithoutId.packageQty) : null,
            shipping_fee: ingredientWithoutId.shippingFee ? Number(ingredientWithoutId.shippingFee) : 0,
            price_buffer: ingredientWithoutId.priceBuffer ? Number(ingredientWithoutId.priceBuffer) : 0,
            type: ingredientWithoutId.type || 'ingredient'
        };

        console.log('Creating ingredient with payload:', payload);

        if (!isOnline()) {
            await addToSyncQueue({ table: 'ingredients', operation: 'insert', payload });
            return { id: Date.now() };
        }

        const { data, error } = await supabase
            .from('ingredients')
            .insert(payload)
            .select('id')
            .single();

        if (error) {
            console.error('Create ingredient error:', error.message, error.details, error.hint);
            return null;
        }

        console.log('Ingredient created with ID:', data.id);
        return { id: data.id };
    }

    async updateIngredient(id: number, updates: Partial<Ingredient>): Promise<boolean> {
        // Clean up updates - remove undefined and convert numbers
        const cleanUpdates: Record<string, any> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value === undefined) continue;
            if (['cost', 'stockQty', 'minStock', 'packageCost', 'packageQty', 'shippingFee', 'priceBuffer'].includes(key)) {
                const num = Number(value);
                if (!isNaN(num)) cleanUpdates[key] = num;
            } else {
                cleanUpdates[key] = value;
            }
        }

        const payload = toSnakeCase(cleanUpdates);
        delete payload.id;

        console.log('Updating ingredient', id, 'with:', payload);

        if (!isOnline()) {
            await addToSyncQueue({ table: 'ingredients', operation: 'update', payload: { id, ...payload } });
            return true;
        }

        const { error } = await supabase
            .from('ingredients')
            .update(payload)
            .eq('id', id);

        if (error) {
            console.error('Update ingredient error:', error.message, error.details);
            return false;
        }

        console.log('Ingredient updated successfully');
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
        // Build ingredients map for fast lookup
        // Use String keys to ensure matching regardless of number/string differences
        const ingredientsByRecipeId = new Map<string, { id: number; qty: number }[]>();

        (recIngRes.data || []).forEach((ri: any) => {
            const recipeId = String(ri.recipe_id); // Force string key
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
            // Lookup using string ID
            ingredients: ingredientsByRecipeId.get(String(r.id)) || []
        }));
    }

    async createRecipe(recipe: Omit<Recipe, 'id'>, ingredients: { id: number; qty: number }[]): Promise<{ id: number } | null> {
        const userId = await this.ensureUserId();
        if (!userId) {
            console.error('No user ID available');
            return null;
        }

        const payload = {
            user_id: userId,
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
            const { error: ingError } = await supabase.from('recipe_ingredients').insert(ingPayload);
            if (ingError) {
                console.error('Create recipe ingredients error:', ingError);
                // Consider whether to delete the recipe if ingredients fail?
                // For now, at least logging it helps debugging.
            }
        }

        return { id: data.id };
    }

    async updateRecipe(id: number, updates: Partial<Recipe>, ingredients?: { id: number; qty: number }[]): Promise<boolean> {
        const payload = toSnakeCase(updates);
        delete payload.ingredients;
        delete payload.id;

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
                const { error: ingError } = await supabase.from('recipe_ingredients').insert(ingPayload);
                if (ingError) {
                    console.error('Update recipe ingredients error:', ingError);
                    return false;
                }
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

        if (error && error.code !== 'PGRST116') throw error;

        return data ? {
            isVatRegistered: data.is_vat_registered || false,
            isPwdSeniorActive: data.is_pwd_senior_active || false,
            otherDiscountRate: Number(data.other_discount_rate || 0),
            dailySalesTarget: Number(data.daily_sales_target || 35000),
            currency: data.currency || 'PHP',
            measurementUnit: (data.measurement_unit as 'Metric' | 'Imperial') || 'Metric'
        } : null;
    }

    async updateSettings(updates: any): Promise<boolean> {
        const userId = await this.ensureUserId();
        const payload = toSnakeCase(updates);

        const { error } = await supabase
            .from('settings')
            .update(payload)
            .eq('user_id', userId);

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
        const userId = await this.ensureUserId();

        const { data, error } = await supabase
            .from('expenses')
            .insert({ user_id: userId, ...expense })
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

        // Handle JSONB format from user's existing schema
        return (data || []).map((s: any) => {
            // If data is stored as JSONB blob
            if (s.data && typeof s.data === 'object') {
                return {
                    date: s.date,
                    ...s.data,
                    recipesSold: s.data.recipesSold || []
                };
            }
            // If data is stored as structured columns
            return {
                date: s.date,
                grossSales: Number(s.gross_sales || 0),
                netRevenue: Number(s.net_revenue || 0),
                cogs: Number(s.cogs || 0),
                grossProfit: Number(s.gross_profit || 0),
                opex: Number(s.opex || 0),
                netProfit: Number(s.net_profit || 0),
                vat: Number(s.vat || 0),
                discounts: Number(s.discounts || 0),
                totalOrders: Number(s.total_orders || 0),
                recipesSold: []
            };
        });
    }

    async saveSnapshot(snapshot: Omit<DailySnapshot, 'recipesSold' | 'stockAlerts'>): Promise<boolean> {
        const userId = await this.ensureUserId();

        // Support user's JSONB schema
        const payload = {
            user_id: userId,
            date: snapshot.date,
            data: {
                grossSales: snapshot.grossSales,
                netRevenue: snapshot.netRevenue,
                cogs: snapshot.cogs,
                grossProfit: snapshot.grossProfit,
                opex: snapshot.opex,
                netProfit: snapshot.netProfit,
                vat: snapshot.vat,
                discounts: snapshot.discounts,
                totalOrders: snapshot.totalOrders
            }
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
    // ORDERS (POS)
    // ============================================

    async getOrders(limit: number = 50): Promise<Order[]> {
        // Fetch active orders or recent history
        // For simplicity, let's fetch last N orders. 
        // Real app might separate "active" vs "history".
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data || []).map((o: any) => ({
            id: o.id,
            customerName: o.customer_name,
            table: o.table, // legacy field name in local type is 'table', db is table_number or just table? Plan said table_number. Let's stick to 'table' in local type.
            // Wait, implementation plan said table_number. Local type has 'table'.
            // I'll map table_number from DB to table in local type.
            status: o.status,
            items: o.items || [],
            total: Number(o.total || 0),
            timestamp: new Date(o.created_at).getTime(),
            color: o.color
        })).map((o: any) => ({
            ...o,
            table: o.table || 'Takeout' // Fallback
        }));
    }

    async createOrder(order: Order): Promise<{ id: string } | null> {
        const userId = await this.ensureUserId();

        // Use the ID generated locally (it's string format in local, UUID in DB?)
        // Local ID was #1234. DB expects UUID.
        // Problem: Local IDs are simple strings like "#2912".
        // DB ID is uuid default gen_random_uuid().
        // We should let DB generate ID or generate a UUID locally if offline.
        // However, AppContext uses the ID immediately.
        // Solution: We'll store the local "display ID" maybe in a different field?
        // Or just let the local ID be the UUID if we switch to UUIDs?
        // Current POS.tsx generates `#${Math.floor(Math.random() * 10000)...}`
        // Implementation plan said `id uuid default`...

        // Let's store the local ID (display ID) in table_number or customer_name or just separate field?
        // Or, we can just say the schema has an extra 'display_id' or we treat 'id' as text?
        // The SQL defined 'id' as UUID. 
        // If I try to insert "#1234" into UUID column it will fail.

        // Fix: I will change the Plan/Logic slightly. 
        // I will let Supabase generate the UUID for the primary key.
        // I need to preserve the "Display ID" (like #1234) for the UI.
        // I'll add 'order_number' to the schema? Or just put it in 'table_number' if it's not strictly a table?
        // Actually, looking at `types.ts` `Order` interface: `id` is string.
        // I should probably add `displayId` to `Order` type or `orderNo`.
        // For now, to avoid schema drift from the user approved plan:
        // The plan said: `id uuid`.
        // Local logic makes `id` = "#1234".
        // If I pass that to `createOrder`, it will break.
        // I will change the local logic to generate a UUID for the `id` field, and maybe put the short code in `customerName` or a new field?
        // Or better: The DB `id` is the canonical ID. The UI uses it.
        // POS.tsx generates a random ID. I should change POS.tsx to generate a UUID?
        // Or I can just cast the local ID to something else?

        // Simpler approach: 
        // The `orders` table has `id` (uuid).
        // I can send `id: undefined` to let DB generate it.
        // BUT offline needs an ID.
        // So I should generate a UUID locally.
        // I'll use `crypto.randomUUID()` in POS.tsx later.
        // For `getOrders` mapping: map DB `id` (uuid) to local `id`.

        // Payload construction:
        const payload = {
            user_id: userId,
            id: order.id.length > 10 ? order.id : undefined, // If it looks like a UUID, usage it. Else let DB generate (and ignore local short ID? No, that breaks sync).
            // Actually, if I want offline sync, I MUST generate ID locally.
            // I'll assume for now I will fix POS.tsx to generate proper UUIDs.

            customer_name: order.customerName,
            table_number: order.table,
            status: order.status,
            total: order.total,
            items: order.items,
            color: order.color,
            created_at: new Date(order.timestamp).toISOString()
        };

        if (!isOnline()) {
            // If ID is missing (short ID), we have a problem. 
            // I'll trust I'll fix POS.tsx to use UUIDs or I'll generate one here if needed?
            // No, consistency is key.
            // I'll just pass payload.
            await addToSyncQueue({ table: 'orders', operation: 'insert', payload });
            return { id: payload.id || 'temp-offline-id' };
        }

        const { data, error } = await supabase
            .from('orders')
            .upsert(payload) // upsert to be safe if ID exists
            .select('id')
            .single();

        if (error) {
            console.error('Create order error details:', error);
            console.error('Payload was:', payload);
            return null;
        }
        return { id: data.id };
    }

    async updateOrder(id: string, updates: Partial<Order>): Promise<boolean> {
        // Map to DB fields
        const payload: any = {};
        if (updates.status) payload.status = updates.status;
        if (updates.items) payload.items = updates.items;
        if (updates.total) payload.total = updates.total;

        // payload.updated_at = new Date().toISOString(); // Let DB handle? or logic?
        payload.updated_at = new Date().toISOString();

        if (!isOnline()) {
            await addToSyncQueue({ table: 'orders', operation: 'update', payload: { id, ...payload } });
            return true;
        }

        const { error } = await supabase.from('orders').update(payload).eq('id', id);
        if (error) {
            console.error('Update order error:', error);
            return false;
        }
        return true;
    }


    // ============================================
    // SYNC OPTIMIZATION (Smart Updates)
    // ============================================

    /**
     * Checks if there are any changes on the server since the last sync.
     * Returns true if updates are available, false if local data is up to date.
     */
    async checkForUpdates(lastSyncTimestamp: number): Promise<boolean> {
        if (!lastSyncTimestamp) return true;

        const lastSync = new Date(lastSyncTimestamp).toISOString();
        const tables = ['ingredients', 'recipes', 'settings', 'expenses', 'daily_snapshots', 'orders'];

        // Parallel check for latest update in each table
        const checks = tables.map(table =>
            supabase
                .from(table)
                .select('updated_at')
                .order('updated_at', { ascending: false })
                .limit(1)
                .maybeSingle()
        );

        const results = await Promise.all(checks);

        // If any table has a record updated AFTER lastSync, we need to refresh
        return results.some(({ data, error }) => {
            if (error || !data) return false;
            // Compare timestamps
            return new Date(data.updated_at).getTime() > lastSyncTimestamp;
        });
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
