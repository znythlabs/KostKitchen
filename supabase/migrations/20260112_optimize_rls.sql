-- OPTIMIZATION: Fix RLS performance by wrapping auth.uid() in (select ...) to prevent per-row evaluation
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan

-- 1. PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT USING ( id = (select auth.uid()) );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING ( id = (select auth.uid()) );

-- 2. INGREDIENTS
DROP POLICY IF EXISTS "Users can all ingredients" ON ingredients;
CREATE POLICY "Users can all ingredients" ON ingredients 
FOR ALL USING ( user_id = (select auth.uid()) );

-- 3. RECIPES
DROP POLICY IF EXISTS "Users can all recipes" ON recipes;
CREATE POLICY "Users can all recipes" ON recipes 
FOR ALL USING ( user_id = (select auth.uid()) );

-- 4. RECIPE INGREDIENTS
-- Note: Optimizing the subquery as well
DROP POLICY IF EXISTS "Users can all recipe ingredients" ON recipe_ingredients;
CREATE POLICY "Users can all recipe ingredients" ON recipe_ingredients 
FOR ALL USING ( 
  recipe_id IN (
    SELECT id FROM recipes WHERE user_id = (select auth.uid())
  ) 
);

-- 5. SETTINGS
DROP POLICY IF EXISTS "Users can all settings" ON settings;
CREATE POLICY "Users can all settings" ON settings 
FOR ALL USING ( user_id = (select auth.uid()) );

-- 6. EXPENSES
DROP POLICY IF EXISTS "Users can all expenses" ON expenses;
CREATE POLICY "Users can all expenses" ON expenses 
FOR ALL USING ( user_id = (select auth.uid()) );

-- 7. DAILY SNAPSHOTS
DROP POLICY IF EXISTS "Users can all snapshots" ON daily_snapshots;
CREATE POLICY "Users can all snapshots" ON daily_snapshots 
FOR ALL USING ( user_id = (select auth.uid()) );

-- 8. ORDERS
DROP POLICY IF EXISTS "Users can manage their own orders" ON orders;
CREATE POLICY "Users can manage their own orders" ON orders 
FOR ALL USING ( user_id = (select auth.uid()) );
