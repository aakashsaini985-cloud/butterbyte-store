
-- ENUMS
create type public.app_role as enum ('admin', 'customer');
create type public.gender_t as enum ('men', 'women', 'unisex');
create type public.order_status as enum ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

-- USER ROLES (must come before tables that reference has_role)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "users view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + assign first-user as admin, others as customer
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "users view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "admins view all profiles" on public.profiles for select to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  user_count int;
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  select count(*) into user_count from public.user_roles where role = 'admin';
  if user_count = 0 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'customer');
  end if;
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- CATEGORIES
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  gender gender_t not null default 'unisex',
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
create policy "admins manage categories" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null default 'BUTTERBYTE STORE',
  sku text unique,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  mrp numeric(10,2) not null default 0,
  selling_price numeric(10,2) not null default 0,
  discount_pct int not null default 0,
  stock_qty int not null default 0,
  availability text not null default 'In Stock',
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  is_trending boolean not null default false,
  rating_avg numeric(2,1) not null default 4.3,
  rating_count int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.products(category_id);
create index on public.products(is_new);
create index on public.products(is_bestseller);
create index on public.products(is_trending);
grant select on public.products to anon, authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read" on public.products for select to anon, authenticated using (true);
create policy "admins manage products" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PRODUCT IMAGES
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);
create index on public.product_images(product_id);
grant select on public.product_images to anon, authenticated;
grant all on public.product_images to service_role;
alter table public.product_images enable row level security;
create policy "images public read" on public.product_images for select to anon, authenticated using (true);
create policy "admins manage images" on public.product_images for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PRODUCT VARIANTS
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  color text,
  stock_qty int not null default 0
);
create index on public.product_variants(product_id);
grant select on public.product_variants to anon, authenticated;
grant all on public.product_variants to service_role;
alter table public.product_variants enable row level security;
create policy "variants public read" on public.product_variants for select to anon, authenticated using (true);
create policy "admins manage variants" on public.product_variants for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ADDRESSES
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.addresses(user_id);
grant select, insert, update, delete on public.addresses to authenticated;
grant all on public.addresses to service_role;
alter table public.addresses enable row level security;
create policy "users manage own addresses" on public.addresses for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- WISHLIST
create table public.wishlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
grant select, insert, delete on public.wishlist to authenticated;
grant all on public.wishlist to service_role;
alter table public.wishlist enable row level security;
create policy "users manage own wishlist" on public.wishlist for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- CART
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  qty int not null default 1,
  created_at timestamptz not null default now(),
  unique(user_id, product_id, variant_id)
);
create index on public.cart_items(user_id);
grant select, insert, update, delete on public.cart_items to authenticated;
grant all on public.cart_items to service_role;
alter table public.cart_items enable row level security;
create policy "users manage own cart" on public.cart_items for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- COUPONS
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null default 'pct',  -- 'pct' or 'flat'
  value numeric(10,2) not null,
  min_order numeric(10,2) not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.coupons to anon, authenticated;
grant all on public.coupons to service_role;
alter table public.coupons enable row level security;
create policy "active coupons public read" on public.coupons for select to anon, authenticated using (active);
create policy "admins manage coupons" on public.coupons for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_no text not null unique,
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status order_status not null default 'pending',
  payment_method text not null default 'cod_stub',
  address_snapshot jsonb not null,
  created_at timestamptz not null default now()
);
create index on public.orders(user_id);
create index on public.orders(order_no);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "users view own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "users insert own orders" on public.orders for insert to authenticated with check (auth.uid() = user_id);
create policy "admins view all orders" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  sku text,
  price numeric(10,2) not null,
  qty int not null,
  image_url text
);
create index on public.order_items(order_id);
grant select, insert on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "users view own order items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "users insert own order items" on public.order_items for insert to authenticated with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "admins view all order items" on public.order_items for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  created_at timestamptz not null default now()
);
create index on public.reviews(product_id);
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews public read" on public.reviews for select to anon, authenticated using (true);
create policy "users insert own reviews" on public.reviews for insert to authenticated with check (auth.uid() = user_id);

-- BANNERS
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_label text,
  cta_href text,
  image_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.banners to anon, authenticated;
grant all on public.banners to service_role;
alter table public.banners enable row level security;
create policy "banners public read" on public.banners for select to anon, authenticated using (active);
create policy "admins manage banners" on public.banners for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- CMS PAGES
create table public.cms_pages (
  slug text primary key,
  title text not null,
  body text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.cms_pages to anon, authenticated;
grant all on public.cms_pages to service_role;
alter table public.cms_pages enable row level security;
create policy "cms public read" on public.cms_pages for select to anon, authenticated using (true);
create policy "admins manage cms" on public.cms_pages for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Seed categories
insert into public.categories (slug, name, gender, sort_order) values
  ('dress', 'Dress', 'women', 1),
  ('jeans', 'Jeans', 'women', 2),
  ('kurta-set', 'Kurta Set', 'women', 3),
  ('kurti', 'Kurti', 'women', 4),
  ('lehenga-choli-sets', 'Lehenga Choli Sets', 'women', 5),
  ('pyjamas-shorts', 'Pyjamas & Shorts', 'women', 6),
  ('saree', 'Saree', 'women', 7),
  ('tops', 'Tops', 'women', 8),
  ('boxers', 'Boxers', 'men', 1),
  ('ethnic-jackets', 'Ethnic Jackets', 'men', 2),
  ('mens-jeans', 'Jeans', 'men', 3),
  ('joggers-track-pants', 'Joggers & Track Pants', 'men', 4),
  ('kurtas', 'Kurtas', 'men', 5),
  ('sherwani', 'Sherwani', 'men', 6),
  ('shirt', 'Shirt', 'men', 7),
  ('mens-shorts', 'Shorts', 'men', 8),
  ('suit', 'Suit', 'men', 9);

-- Seed coupons
insert into public.coupons (code, type, value, min_order) values
  ('WELCOME10', 'pct', 10, 999),
  ('FESTIVE25', 'pct', 25, 2499);

-- Seed banners
insert into public.banners (title, subtitle, cta_label, cta_href, image_url, sort_order) values
  ('Women''s Festive Edit', 'Lehengas, sarees & kurta sets to turn heads', 'Shop Women', '/women', null, 1),
  ('Men''s Sherwani Season', 'Hand-crafted ethnic for every celebration', 'Shop Men', '/men', null, 2),
  ('New Arrivals', 'Fresh drops from BUTTERBYTE STORE', 'Explore Collection', '/shop?sort=new', null, 3),
  ('Trending Now', 'What the country is wearing this week', 'Shop Now', '/shop?filter=trending', null, 4),
  ('Seasonal Sale', 'Up to 60% off across categories', 'Shop Now', '/shop?filter=sale', null, 5),
  ('Best Sellers', 'Tried, loved, restocked', 'Shop Now', '/shop?filter=bestsellers', null, 6);

-- Seed CMS pages
insert into public.cms_pages (slug, title, body) values
  ('about', 'About BUTTERBYTE STORE', 'BUTTERBYTE STORE is a modern Indian fashion house by BUTTERBYTE PRIVATE LIMITED, crafting premium ethnic and contemporary wear for the new generation. Designed in India, built for the world.'),
  ('privacy', 'Privacy Policy', 'We respect your privacy. This policy describes how BUTTERBYTE PRIVATE LIMITED collects, uses, and protects information you provide while using butterbytestore.com.'),
  ('terms', 'Terms & Conditions', 'By using BUTTERBYTE STORE you agree to the following terms and conditions.'),
  ('shipping', 'Shipping Policy', 'We ship across India. Standard delivery 5-7 business days. Free shipping on prepaid orders above Rs. 999.'),
  ('refund', 'Refund & Cancellation Policy', '7-day easy returns on eligible items. Refunds processed within 5-7 business days of pickup.'),
  ('faq', 'FAQ', 'Have questions? Email communication@butterbytestore.com or call +91 8302628498.');
