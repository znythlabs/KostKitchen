-- OPTIMIZATION: Add missing indexes for Foreign Keys to improve join performance and suppress warnings
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

-- 1. daily_snapshots (user_id)
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_user_id ON daily_snapshots(user_id);

-- 2. expenses (user_id)
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);

-- 3. ingredients (user_id)
CREATE INDEX IF NOT EXISTS idx_ingredients_user_id ON ingredients(user_id);

-- 4. orders (user_id)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 5. recipe_ingredients (ingredient_id)
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);

-- 6. recipe_ingredients (recipe_id)
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);

-- 7. recipes (user_id)
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

-- 8. settings (user_id)
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings(user_id);
