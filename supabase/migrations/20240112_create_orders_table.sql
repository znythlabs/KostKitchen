-- Create Orders Table for POS Integration

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  customer_name text,
  table_number text,
  status text default 'New',
  total numeric default 0,
  items jsonb default '[]'::jsonb,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table orders enable row level security;

-- Create Policy
create policy "Users can manage their own orders" on orders
  for all using (auth.uid() = user_id);

-- Optional: Create index for faster queries
create index if not exists orders_user_id_idx on orders(user_id);
create index if not exists orders_created_at_idx on orders(created_at);
