-- WashFlow Supabase Setup SQL
-- Paste this entire file into the Supabase SQL Editor and run once.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role_enum') then
    create type public.user_role_enum as enum ('customer', 'business', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'service_category_enum') then
    create type public.service_category_enum as enum ('wash', 'dry_clean', 'iron', 'wash_iron');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status_enum') then
    create type public.order_status_enum as enum (
      'requested',
      'accepted',
      'picked_up',
      'cleaning',
      'out_for_delivery',
      'delivered',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status_enum') then
    create type public.payment_status_enum as enum ('pending', 'paid', 'refunded');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_plan_enum') then
    create type public.subscription_plan_enum as enum ('silver', 'gold', 'platinum');
  end if;

  if not exists (select 1 from pg_type where typname = 'discount_type_enum') then
    create type public.discount_type_enum as enum ('percentage', 'flat');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type_enum') then
    create type public.notification_type_enum as enum ('order', 'promo', 'system');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null unique,
  password_hash text not null,
  role public.user_role_enum not null,
  profile_image text,
  address text,
  city text,
  pincode text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  business_name text not null,
  logo text,
  address text not null,
  city text not null,
  pincode text not null,
  gst_number text,
  is_approved boolean not null default false,
  is_active boolean not null default true,
  commission_rate numeric(5,2) not null default 15.00,
  rating numeric(3,2) not null default 0,
  total_orders integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  category public.service_category_enum not null,
  price_per_unit numeric(10,2) not null check (price_per_unit >= 0),
  unit text not null check (unit in ('piece', 'kg')),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.riders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  vehicle_type text not null,
  vehicle_number text not null,
  license_number text not null,
  profile_image text,
  is_available boolean not null default true,
  is_active boolean not null default true,
  total_deliveries integer not null default 0,
  rating numeric(3,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.users(id) on delete restrict,
  business_id uuid not null references public.businesses(id) on delete restrict,
  rider_id uuid references public.riders(id) on delete set null,
  status public.order_status_enum not null default 'requested',
  pickup_slot text not null check (pickup_slot in ('Morning (8AM-11AM)', 'Afternoon (12PM-3PM)', 'Evening (4PM-7PM)')),
  delivery_slot text not null check (delivery_slot in ('Morning (8AM-11AM)', 'Afternoon (12PM-3PM)', 'Evening (4PM-7PM)')),
  pickup_date date not null,
  delivery_date date not null,
  subtotal numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  coupon_code text,
  tax_amount numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  payment_status public.payment_status_enum not null default 'pending',
  payment_method text,
  payment_id text,
  special_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_delivery_after_pickup check (delivery_date >= pickup_date),
  constraint chk_slot_not_same_day_same_slot check (
    not (pickup_date = delivery_date and pickup_slot = delivery_slot)
  )
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  item_name text not null,
  category public.service_category_enum not null,
  quantity integer not null check (quantity > 0),
  price_per_unit numeric(10,2) not null check (price_per_unit >= 0),
  total_price numeric(10,2) not null check (total_price >= 0)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  plan_name public.subscription_plan_enum not null,
  price_per_month numeric(10,2) not null,
  items_limit integer,
  discount_percentage numeric(5,2) not null,
  start_date date not null,
  end_date date not null,
  is_active boolean not null default true,
  auto_renew boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_subscription_dates check (end_date >= start_date)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  code text not null unique,
  discount_type public.discount_type_enum not null,
  discount_value numeric(10,2) not null check (discount_value >= 0),
  min_order_value numeric(10,2) not null default 0,
  max_discount numeric(10,2),
  usage_limit integer,
  used_count integer not null default 0,
  valid_from timestamptz not null,
  valid_till timestamptz not null,
  is_active boolean not null default true,
  constraint chk_coupon_dates check (valid_till >= valid_from)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  customer_id uuid not null references public.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  order_amount numeric(10,2) not null,
  commission_rate numeric(5,2) not null,
  commission_amount numeric(10,2) not null,
  platform_earning numeric(10,2) not null,
  settled boolean not null default false,
  settlement_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  message text not null,
  type public.notification_type_enum not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.otp_verifications (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  otp text not null,
  expires_at timestamptz not null,
  is_used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_businesses_city on public.businesses(city);
create index if not exists idx_businesses_is_approved on public.businesses(is_approved);
create index if not exists idx_services_business_id on public.services(business_id);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_business_id on public.orders(business_id);
create index if not exists idx_orders_rider_id on public.orders(rider_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_pickup_date on public.orders(pickup_date);
create index if not exists idx_subscriptions_customer_id on public.subscriptions(customer_id);
create index if not exists idx_coupons_code on public.coupons(code);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_otp_recipient on public.otp_verifications(recipient);

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists trg_businesses_updated_at on public.businesses;
create trigger trg_businesses_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists trg_services_updated_at on public.services;
create trigger trg_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists trg_riders_updated_at on public.riders;
create trigger trg_riders_updated_at
before update on public.riders
for each row execute function public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create or replace function public.apply_subscription_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.plan_name = 'silver' then
    new.price_per_month := coalesce(new.price_per_month, 799);
    new.items_limit := coalesce(new.items_limit, 30);
    new.discount_percentage := coalesce(new.discount_percentage, 20);
  elsif new.plan_name = 'gold' then
    new.price_per_month := coalesce(new.price_per_month, 1499);
    new.items_limit := coalesce(new.items_limit, 60);
    new.discount_percentage := coalesce(new.discount_percentage, 30);
  elsif new.plan_name = 'platinum' then
    new.price_per_month := coalesce(new.price_per_month, 2499);
    new.items_limit := null;
    new.discount_percentage := coalesce(new.discount_percentage, 40);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_apply_subscription_defaults on public.subscriptions;
create trigger trg_apply_subscription_defaults
before insert on public.subscriptions
for each row execute function public.apply_subscription_defaults();

create or replace function public.update_business_rating()
returns trigger
language plpgsql
as $$
declare
  target_business_id uuid;
begin
  target_business_id := coalesce(new.business_id, old.business_id);

  update public.businesses
  set rating = coalesce(
    (
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where business_id = target_business_id
    ),
    0
  )
  where id = target_business_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_update_business_rating_insert on public.reviews;
create trigger trg_update_business_rating_insert
after insert on public.reviews
for each row execute function public.update_business_rating();

drop trigger if exists trg_update_business_rating_update on public.reviews;
create trigger trg_update_business_rating_update
after update on public.reviews
for each row execute function public.update_business_rating();

drop trigger if exists trg_update_business_rating_delete on public.reviews;
create trigger trg_update_business_rating_delete
after delete on public.reviews
for each row execute function public.update_business_rating();

create or replace function public.create_commission_on_delivery()
returns trigger
language plpgsql
as $$
declare
  v_commission_rate numeric(5,2);
  v_commission_amount numeric(10,2);
begin
  if new.status = 'delivered' and coalesce(old.status, 'requested') <> 'delivered' then
    select commission_rate into v_commission_rate
    from public.businesses
    where id = new.business_id;

    v_commission_amount := round((new.total_amount * coalesce(v_commission_rate, 0)) / 100.0, 2);

    insert into public.commissions (
      order_id,
      business_id,
      order_amount,
      commission_rate,
      commission_amount,
      platform_earning,
      settled,
      created_at
    )
    values (
      new.id,
      new.business_id,
      new.total_amount,
      coalesce(v_commission_rate, 0),
      v_commission_amount,
      v_commission_amount,
      false,
      now()
    )
    on conflict (order_id)
    do update set
      business_id = excluded.business_id,
      order_amount = excluded.order_amount,
      commission_rate = excluded.commission_rate,
      commission_amount = excluded.commission_amount,
      platform_earning = excluded.platform_earning;

    update public.businesses
    set total_orders = (
      select count(*)
      from public.orders
      where business_id = new.business_id and status = 'delivered'
    )
    where id = new.business_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_create_commission_on_delivery on public.orders;
create trigger trg_create_commission_on_delivery
after update on public.orders
for each row execute function public.create_commission_on_delivery();

create or replace function public.validate_coupon(
  p_code text,
  p_order_amount numeric
)
returns table (
  code text,
  valid boolean,
  discount_amount numeric,
  message text
)
language plpgsql
as $$
declare
  v_coupon public.coupons%rowtype;
  v_discount numeric(10,2);
begin
  select * into v_coupon
  from public.coupons
  where upper(code) = upper(p_code)
  limit 1;

  if v_coupon.id is null then
    return query select p_code, false, 0::numeric, 'Coupon not found';
    return;
  end if;

  if not v_coupon.is_active then
    return query select v_coupon.code, false, 0::numeric, 'Coupon is inactive';
    return;
  end if;

  if now() < v_coupon.valid_from or now() > v_coupon.valid_till then
    return query select v_coupon.code, false, 0::numeric, 'Coupon expired or not active yet';
    return;
  end if;

  if v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit then
    return query select v_coupon.code, false, 0::numeric, 'Coupon usage limit exceeded';
    return;
  end if;

  if p_order_amount < v_coupon.min_order_value then
    return query select v_coupon.code, false, 0::numeric, 'Minimum order value not met';
    return;
  end if;

  if v_coupon.discount_type = 'flat' then
    v_discount := v_coupon.discount_value;
  else
    v_discount := round((p_order_amount * v_coupon.discount_value) / 100.0, 2);
  end if;

  if v_coupon.max_discount is not null then
    v_discount := least(v_discount, v_coupon.max_discount);
  end if;

  return query select v_coupon.code, true, v_discount, 'Coupon applied successfully';
end;
$$;

create or replace view public.business_dashboard_summary as
select
  b.id as business_id,
  b.business_name,
  count(o.id) filter (where o.created_at::date = current_date) as orders_today,
  coalesce(sum(o.total_amount) filter (where o.created_at::date = current_date and o.status = 'delivered'), 0) as revenue_today,
  count(o.id) filter (where o.status in ('requested', 'accepted')) as pending_pickups,
  b.total_orders,
  b.rating
from public.businesses b
left join public.orders o on o.business_id = b.id
group by b.id, b.business_name, b.total_orders, b.rating;

create or replace view public.admin_dashboard_summary as
select
  (select count(*) from public.users where role = 'customer') as total_customers,
  (select count(*) from public.users where role = 'business') as total_business_users,
  (select count(*) from public.businesses where is_approved = true) as approved_businesses,
  (select coalesce(sum(total_amount), 0) from public.orders where status = 'delivered') as platform_gmv,
  (select coalesce(sum(platform_earning), 0) from public.commissions) as total_commissions;

-- No seed rows are inserted here.
-- Add users, businesses, services, coupons, and orders only through real application flows
-- or through your own admin/import scripts.
