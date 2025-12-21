
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. INGREDIENTS
create table ingredients (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  unit text not null,
  cost numeric not null default 0,
  stock_qty numeric not null default 0,
  min_stock numeric not null default 0,
  supplier text,
  package_cost numeric,
  package_qty numeric,
  shipping_fee numeric,
  price_buffer numeric,
  type text default 'ingredient', -- 'ingredient' or 'other'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. RECIPES
create table recipes (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text,
  margin numeric default 0,
  price numeric default 0,
  daily_volume numeric default 0,
  image text,
  batch_size numeric default 1,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. RECIPE INGREDIENTS (Junction)
create table recipe_ingredients (
  id bigint generated always as identity primary key,
  recipe_id bigint references recipes(id) on delete cascade not null,
  ingredient_id bigint references ingredients(id) on delete restrict not null,
  qty numeric not null default 0
);

-- 5. SETTINGS
create table settings (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  is_vat_registered boolean default false,
  is_pwd_senior_active boolean default false,
  other_discount_rate numeric default 0
);

-- 6. EXPENSES
create table expenses (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  amount numeric not null default 0
);

-- 7. DAILY SNAPSHOTS
create table daily_snapshots (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ROW LEVEL SECURITY (RLS) POLICIES
-- This ensures users only see their own data

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

alter table ingredients enable row level security;
create policy "Users can all ingredients" on ingredients for all using (auth.uid() = user_id);

alter table recipes enable row level security;
create policy "Users can all recipes" on recipes for all using (auth.uid() = user_id);

alter table recipe_ingredients enable row level security;
create policy "Users can all recipe ingredients" on recipe_ingredients for all using (
  recipe_id in (select id from recipes where user_id = auth.uid())
);

alter table settings enable row level security;
create policy "Users can all settings" on settings for all using (auth.uid() = user_id);

alter table expenses enable row level security;
create policy "Users can all expenses" on expenses for all using (auth.uid() = user_id);

alter table daily_snapshots enable row level security;
create policy "Users can all snapshots" on daily_snapshots for all using (auth.uid() = user_id);

-- TRIGGER to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  
  -- Insert default settings
  insert into public.settings (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
