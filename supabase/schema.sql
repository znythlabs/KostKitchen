-- ============================================
-- COSTKITCHEN IMPROVED SCHEMA v2.0
-- Optimized for performance, security, and Supabase free tier
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. PROFILES (Extends Auth)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. INGREDIENTS
-- ============================================
CREATE TABLE ingredients (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  unit TEXT NOT NULL CHECK (char_length(unit) <= 20),
  cost NUMERIC NOT NULL DEFAULT 0 CHECK (cost >= 0),
  stock_qty NUMERIC NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  min_stock NUMERIC NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  supplier TEXT CHECK (supplier IS NULL OR char_length(supplier) <= 100),
  package_cost NUMERIC CHECK (package_cost IS NULL OR package_cost >= 0),
  package_qty NUMERIC CHECK (package_qty IS NULL OR package_qty > 0),
  shipping_fee NUMERIC CHECK (shipping_fee IS NULL OR shipping_fee >= 0),
  price_buffer NUMERIC CHECK (price_buffer IS NULL OR (price_buffer >= 0 AND price_buffer <= 100)),
  type TEXT DEFAULT 'ingredient' CHECK (type IN ('ingredient', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ingredients_user ON ingredients(user_id);
CREATE INDEX idx_ingredients_type ON ingredients(user_id, type);
CREATE INDEX idx_ingredients_name ON ingredients(user_id, name);

CREATE TRIGGER ingredients_updated_at
  BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. RECIPES
-- ============================================
CREATE TABLE recipes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  category TEXT CHECK (category IS NULL OR char_length(category) <= 50),
  margin NUMERIC DEFAULT 0 CHECK (margin >= 0 AND margin <= 100),
  price NUMERIC DEFAULT 0 CHECK (price >= 0),
  daily_volume NUMERIC DEFAULT 0 CHECK (daily_volume >= 0),
  image TEXT, -- URL or base64 thumbnail
  batch_size NUMERIC DEFAULT 1 CHECK (batch_size >= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_recipes_user ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(user_id, category);

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 4. RECIPE INGREDIENTS (Junction Table)
-- ============================================
CREATE TABLE recipe_ingredients (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id BIGINT REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_id BIGINT REFERENCES ingredients(id) ON DELETE RESTRICT NOT NULL,
  qty NUMERIC NOT NULL DEFAULT 0 CHECK (qty >= 0),
  UNIQUE(recipe_id, ingredient_id) -- Prevent duplicate entries
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);

-- ============================================
-- 5. SETTINGS (One per user)
-- ============================================
CREATE TABLE settings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  is_vat_registered BOOLEAN DEFAULT FALSE,
  is_pwd_senior_active BOOLEAN DEFAULT FALSE,
  other_discount_rate NUMERIC DEFAULT 0 CHECK (other_discount_rate >= 0 AND other_discount_rate <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. EXPENSES (Monthly Operating Expenses)
-- ============================================
CREATE TABLE expenses (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (char_length(category) <= 50),
  amount NUMERIC NOT NULL DEFAULT 0 CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_user ON expenses(user_id);

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 7. DAILY SNAPSHOTS (Structured - not JSONB blob)
-- Optimized for queries and aggregation
-- ============================================
CREATE TABLE daily_snapshots (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  gross_sales NUMERIC DEFAULT 0,
  net_revenue NUMERIC DEFAULT 0,
  cogs NUMERIC DEFAULT 0,
  gross_profit NUMERIC DEFAULT 0,
  opex NUMERIC DEFAULT 0,
  net_profit NUMERIC DEFAULT 0,
  vat NUMERIC DEFAULT 0,
  discounts NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date) -- One snapshot per user per day
);

-- Critical index for date-range queries
CREATE INDEX idx_snapshots_user_date ON daily_snapshots(user_id, date DESC);

-- ============================================
-- 8. SNAPSHOT RECIPES (Sales breakdown per snapshot)
-- Normalized for better querying
-- ============================================
CREATE TABLE snapshot_recipes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  snapshot_id BIGINT REFERENCES daily_snapshots(id) ON DELETE CASCADE NOT NULL,
  recipe_id BIGINT, -- May be null if recipe was deleted
  recipe_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0
);

CREATE INDEX idx_snapshot_recipes_snapshot ON snapshot_recipes(snapshot_id);

-- ============================================
-- ROW LEVEL SECURITY (HARDENED)
-- Separate policies per operation for audit trail
-- ============================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- INGREDIENTS
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ingredients_select" ON ingredients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ingredients_insert" ON ingredients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ingredients_update" ON ingredients FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ingredients_delete" ON ingredients FOR DELETE USING (auth.uid() = user_id);

-- RECIPES
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipes_select" ON recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "recipes_insert" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipes_update" ON recipes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "recipes_delete" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- RECIPE INGREDIENTS (Access via recipe ownership)
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recipe_ingredients_select" ON recipe_ingredients FOR SELECT 
  USING (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));
CREATE POLICY "recipe_ingredients_insert" ON recipe_ingredients FOR INSERT 
  WITH CHECK (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));
CREATE POLICY "recipe_ingredients_update" ON recipe_ingredients FOR UPDATE 
  USING (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));
CREATE POLICY "recipe_ingredients_delete" ON recipe_ingredients FOR DELETE 
  USING (recipe_id IN (SELECT id FROM recipes WHERE user_id = auth.uid()));

-- SETTINGS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_select" ON settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert" ON settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update" ON settings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- EXPENSES
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expenses_select" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "expenses_insert" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "expenses_update" ON expenses FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "expenses_delete" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- DAILY SNAPSHOTS
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snapshots_select" ON daily_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "snapshots_insert" ON daily_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "snapshots_update" ON daily_snapshots FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "snapshots_delete" ON daily_snapshots FOR DELETE USING (auth.uid() = user_id);

-- SNAPSHOT RECIPES (Access via snapshot ownership)
ALTER TABLE snapshot_recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "snapshot_recipes_select" ON snapshot_recipes FOR SELECT 
  USING (snapshot_id IN (SELECT id FROM daily_snapshots WHERE user_id = auth.uid()));
CREATE POLICY "snapshot_recipes_insert" ON snapshot_recipes FOR INSERT 
  WITH CHECK (snapshot_id IN (SELECT id FROM daily_snapshots WHERE user_id = auth.uid()));
CREATE POLICY "snapshot_recipes_delete" ON snapshot_recipes FOR DELETE 
  USING (snapshot_id IN (SELECT id FROM daily_snapshots WHERE user_id = auth.uid()));

-- ============================================
-- TRIGGERS (Auto-create profile and settings on signup)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- OPTIMIZATION: Function to clean old snapshots (keep last 90 days)
-- Run periodically via Supabase scheduled function or client
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_snapshots()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM daily_snapshots 
  WHERE date < CURRENT_DATE - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
