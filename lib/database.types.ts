/**
 * SUPABASE DATABASE TYPES
 * Generated based on the new schema for type safety
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            daily_snapshots: {
                Row: {
                    id: number
                    user_id: string
                    date: string
                    gross_sales: number
                    net_revenue: number
                    cogs: number
                    gross_profit: number
                    opex: number
                    net_profit: number
                    vat: number
                    discounts: number
                    total_orders: number
                    created_at: string
                }
                Insert: {
                    id?: number // generated
                    user_id: string
                    date: string
                    gross_sales?: number
                    net_revenue?: number
                    cogs?: number
                    gross_profit?: number
                    opex?: number
                    net_profit?: number
                    vat?: number
                    discounts?: number
                    total_orders?: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    date?: string
                    gross_sales?: number
                    net_revenue?: number
                    cogs?: number
                    gross_profit?: number
                    opex?: number
                    net_profit?: number
                    vat?: number
                    discounts?: number
                    total_orders?: number
                    created_at?: string
                }
            }
            expenses: {
                Row: {
                    id: number
                    user_id: string
                    category: string
                    amount: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number // generated
                    user_id: string
                    category: string
                    amount?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    category?: string
                    amount?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            ingredients: {
                Row: {
                    id: number
                    user_id: string
                    name: string
                    unit: string
                    cost: number
                    stock_qty: number
                    min_stock: number
                    supplier: string | null
                    package_cost: number | null
                    package_qty: number | null
                    shipping_fee: number | null
                    price_buffer: number | null
                    type: 'ingredient' | 'other'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number // generated
                    user_id: string
                    name: string
                    unit: string
                    cost?: number
                    stock_qty?: number
                    min_stock?: number
                    supplier?: string | null
                    package_cost?: number | null
                    package_qty?: number | null
                    shipping_fee?: number | null
                    price_buffer?: number | null
                    type?: 'ingredient' | 'other'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    name?: string
                    unit?: string
                    cost?: number
                    stock_qty?: number
                    min_stock?: number
                    supplier?: string | null
                    package_cost?: number | null
                    package_qty?: number | null
                    shipping_fee?: number | null
                    price_buffer?: number | null
                    type?: 'ingredient' | 'other'
                    created_at?: string
                    updated_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    display_name: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email?: string | null
                    display_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string | null
                    display_name?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            recipe_ingredients: {
                Row: {
                    id: number
                    recipe_id: number
                    ingredient_id: number
                    qty: number
                }
                Insert: {
                    id?: number // generated
                    recipe_id: number
                    ingredient_id: number
                    qty?: number
                }
                Update: {
                    id?: number
                    recipe_id?: number
                    ingredient_id?: number
                    qty?: number
                }
            }
            recipes: {
                Row: {
                    id: number
                    user_id: string
                    name: string
                    category: string | null
                    margin: number
                    price: number
                    daily_volume: number
                    image: string | null
                    batch_size: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number // generated
                    user_id: string
                    name: string
                    category?: string | null
                    margin?: number
                    price?: number
                    daily_volume?: number
                    image?: string | null
                    batch_size?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    name?: string
                    category?: string | null
                    margin?: number
                    price?: number
                    daily_volume?: number
                    image?: string | null
                    batch_size?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            settings: {
                Row: {
                    id: number
                    user_id: string
                    is_vat_registered: boolean
                    is_pwd_senior_active: boolean
                    other_discount_rate: number
                    contingency_rate: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number // generated
                    user_id: string
                    is_vat_registered?: boolean
                    is_pwd_senior_active?: boolean
                    other_discount_rate?: number
                    contingency_rate?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    is_vat_registered?: boolean
                    is_pwd_senior_active?: boolean
                    other_discount_rate?: number
                    contingency_rate?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            snapshot_recipes: {
                Row: {
                    id: number
                    snapshot_id: number
                    recipe_id: number | null
                    recipe_name: string
                    quantity: number
                    revenue: number
                }
                Insert: {
                    id?: number // generated
                    snapshot_id: number
                    recipe_id?: number | null
                    recipe_name: string
                    quantity?: number
                    revenue?: number
                }
                Update: {
                    id?: number
                    snapshot_id?: number
                    recipe_id?: number | null
                    recipe_name?: string
                    quantity?: number
                    revenue?: number
                }
            }
        }
        Views: {
            [_: string]: {
                Row: {
                    [key: string]: Json | undefined
                }
            }
        }
        Functions: {
            cleanup_old_snapshots: {
                Args: Record<PropertyKey, never>
                Returns: number
            }
        }
        Enums: {
            [_: string]: never
        }
        CompositeTypes: {
            [_: string]: never
        }
    }
}
