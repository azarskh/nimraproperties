
-- Roles
create type public.app_role as enum ('admin','staff');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','staff'))
$$;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- Auto-grant admin to the business email account
create or replace function public.grant_owner_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'nimra.properties09@gmail.com' then
    insert into public.user_roles(user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created_owner after insert on auth.users for each row execute function public.grant_owner_admin();

-- Reference code helper
create table public.ref_counters (prefix text primary key, last_value int not null default 0);
grant all on public.ref_counters to service_role;
alter table public.ref_counters enable row level security;
create or replace function public.next_ref(_prefix text)
returns text language plpgsql security definer set search_path = public as $$
declare v int;
begin
  insert into public.ref_counters(prefix,last_value) values (_prefix,1)
  on conflict (prefix) do update set last_value = ref_counters.last_value + 1
  returning last_value into v;
  return _prefix || '-' || to_char(now(),'YYYY') || '-' || lpad(v::text, 4, '0');
end $$;
create or replace function public.set_ref_code()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.ref_code is null or new.ref_code = '' then
    new.ref_code := public.next_ref(TG_ARGV[0]);
  end if;
  return new;
end $$;
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;

-- Business settings
create table public.business_settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'Nimra Properties',
  call_phone text not null default '+91 9881666837',
  whatsapp_phone text not null default '+91 9763344377',
  email text not null default 'nimra.properties09@gmail.com',
  address text default 'Pune, Maharashtra',
  photo_shoot_charge numeric not null default 0,
  about_text text,
  updated_at timestamptz not null default now()
);
grant select on public.business_settings to anon, authenticated;
grant update on public.business_settings to authenticated;
grant all on public.business_settings to service_role;
alter table public.business_settings enable row level security;
create policy "settings public read" on public.business_settings for select to anon, authenticated using (true);
create policy "settings admin update" on public.business_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
insert into public.business_settings(id) values (1);

-- Listing packages
create table public.listing_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric not null default 0,
  duration_days int not null default 30,
  features text[] not null default '{}',
  includes_photo_shoot boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.listing_packages to anon;
grant select, insert, update, delete on public.listing_packages to authenticated;
grant all on public.listing_packages to service_role;
alter table public.listing_packages enable row level security;
create policy "packages public read active" on public.listing_packages for select to anon, authenticated using (is_active or public.is_admin());
create policy "packages admin write" on public.listing_packages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger pk_touch before update on public.listing_packages for each row execute function public.touch_updated_at();
insert into public.listing_packages(name, description, price, duration_days, features, includes_photo_shoot, sort_order) values
 ('Basic','Standard listing on the Nimra Properties website',0,30,array['Listing on website','Enquiry handling'],false,1),
 ('Standard','Listing with professional photography',0,60,array['Listing on website','Professional photo shoot','Enquiry handling'],true,2),
 ('Premium','Featured listing with end-to-end support',0,90,array['Featured placement','Professional photo shoot','Documentation support','Site visit coordination'],true,3);

-- Seller applications
create table public.seller_applications (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique,
  title text not null,
  category text not null,
  purpose text not null,
  property_type text not null,
  locality text,
  city text default 'Pune',
  expected_price numeric,
  details jsonb not null default '{}',
  photo_paths text[] not null default '{}',
  owner_name text not null,
  owner_phone text not null,
  owner_email text,
  owner_whatsapp text,
  package_id uuid references public.listing_packages(id),
  package_snapshot jsonb,
  photo_shoot_requested boolean not null default false,
  status text not null default 'pending_review' check (status in ('pending_review','under_verification','changes_requested','awaiting_payment','ready_to_publish','converted','rejected')),
  admin_notes text,
  property_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.seller_applications to anon;
grant select, insert, update, delete on public.seller_applications to authenticated;
grant all on public.seller_applications to service_role;
alter table public.seller_applications enable row level security;
create policy "apps public insert" on public.seller_applications for insert to anon, authenticated with check (status = 'pending_review' and property_id is null);
create policy "apps admin all" on public.seller_applications for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger app_ref before insert on public.seller_applications for each row execute function public.set_ref_code('NP');
create trigger app_touch before update on public.seller_applications for each row execute function public.touch_updated_at();

-- Package snapshot captured from package at insert time (server-side, tamper-proof)
create or replace function public.snapshot_package()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.package_id is not null and (TG_OP = 'INSERT' or new.package_id is distinct from old.package_id) then
    select to_jsonb(p) - 'created_at' - 'updated_at' into new.package_snapshot from public.listing_packages p where p.id = new.package_id;
  end if;
  return new;
end $$;
create trigger app_snapshot before insert or update on public.seller_applications for each row execute function public.snapshot_package();

-- Properties
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique,
  slug text unique not null,
  title text not null,
  category text not null default 'residential' check (category in ('residential','commercial','plot')),
  purpose text not null default 'sell' check (purpose in ('sell','rent','lease')),
  property_type text not null,
  bhk text,
  project_name text,
  description text,
  city text not null default 'Pune',
  locality text not null default '',
  address text,
  latitude double precision,
  longitude double precision,
  carpet_area numeric,
  builtup_area numeric,
  total_floors int,
  floor_number int,
  property_age text,
  parking text,
  facing text,
  possession_status text,
  furnishing text,
  price numeric not null default 0,
  price_negotiable boolean not null default false,
  maintenance numeric,
  deposit numeric,
  amenities text[] not null default '{}',
  landmarks jsonb not null default '[]',
  photos text[] not null default '{}',
  video_url text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','sold','rented','archived')),
  source_type text not null default 'manual_entry' check (source_type in ('manual_entry','seller_application')),
  application_id uuid unique references public.seller_applications(id),
  owner_name text,
  owner_phone text,
  owner_email text,
  interest_count int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.seller_applications add constraint app_property_fk foreign key (property_id) references public.properties(id) on delete set null;
grant select on public.properties to anon;
grant select, insert, update, delete on public.properties to authenticated;
grant all on public.properties to service_role;
alter table public.properties enable row level security;
create policy "properties public read published" on public.properties for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "properties admin write" on public.properties for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger prop_ref before insert on public.properties for each row execute function public.set_ref_code('PR');
create trigger prop_touch before update on public.properties for each row execute function public.touch_updated_at();
create or replace function public.prop_source()
returns trigger language plpgsql as $$
begin
  new.source_type := case when new.application_id is null then 'manual_entry' else 'seller_application' end;
  if new.status = 'published' and new.published_at is null then new.published_at := now(); end if;
  return new;
end $$;
create trigger prop_source_trg before insert or update on public.properties for each row execute function public.prop_source();
-- hide owner contact from public via column privileges
revoke select on public.properties from anon;
grant select (id, ref_code, slug, title, category, purpose, property_type, bhk, project_name, description, city, locality, address, latitude, longitude, carpet_area, builtup_area, total_floors, floor_number, property_age, parking, facing, possession_status, furnishing, price, price_negotiable, maintenance, deposit, amenities, landmarks, photos, video_url, featured, status, interest_count, published_at, created_at) on public.properties to anon;

-- Enquiries & interests
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique,
  kind text not null default 'enquiry' check (kind in ('enquiry','interest')),
  property_id uuid references public.properties(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text,
  source text default 'website',
  status text not null default 'new' check (status in ('new','contacted','qualified','closed','spam')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.enquiries to anon;
grant select, insert, update, delete on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "enq public insert" on public.enquiries for insert to anon, authenticated with check (status = 'new' and notes is null);
create policy "enq admin all" on public.enquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger enq_ref before insert on public.enquiries for each row execute function public.set_ref_code('EN');
create trigger enq_touch before update on public.enquiries for each row execute function public.touch_updated_at();

-- Duplicate protection + interest counter
create or replace function public.enquiry_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if length(regexp_replace(new.phone,'\D','','g')) < 10 then raise exception 'Invalid phone number'; end if;
  if exists (select 1 from public.enquiries e where e.phone = new.phone and e.kind = new.kind
             and e.property_id is not distinct from new.property_id and e.created_at > now() - interval '10 minutes') then
    raise exception 'duplicate_submission';
  end if;
  return new;
end $$;
create trigger enq_guard before insert on public.enquiries for each row execute function public.enquiry_guard();
create or replace function public.bump_interest()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'interest' and new.property_id is not null then
    update public.properties set interest_count = interest_count + 1 where id = new.property_id;
  end if;
  return new;
end $$;
create trigger enq_bump after insert on public.enquiries for each row execute function public.bump_interest();

-- Site visits
create table public.site_visits (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique,
  property_id uuid references public.properties(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  requested_date date not null,
  requested_time text,
  confirmed_date date,
  confirmed_time text,
  status text not null default 'requested' check (status in ('requested','confirmed','rescheduled','completed','cancelled')),
  message text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant insert on public.site_visits to anon;
grant select, insert, update, delete on public.site_visits to authenticated;
grant all on public.site_visits to service_role;
alter table public.site_visits enable row level security;
create policy "sv public insert" on public.site_visits for insert to anon, authenticated with check (status = 'requested' and confirmed_date is null and notes is null);
create policy "sv admin all" on public.site_visits for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger sv_ref before insert on public.site_visits for each row execute function public.set_ref_code('SV');
create trigger sv_touch before update on public.site_visits for each row execute function public.touch_updated_at();

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique,
  purpose text not null default 'listing_package' check (purpose in ('listing_package','photo_shoot','other')),
  application_id uuid references public.seller_applications(id) on delete set null,
  photo_shoot_id uuid,
  payer_name text,
  amount numeric not null check (amount >= 0),
  method text not null default 'upi',
  reference_no text,
  paid_on date,
  status text not null default 'pending' check (status in ('pending','verified','rejected')),
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "pay admin all" on public.payments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger pay_ref before insert on public.payments for each row execute function public.set_ref_code('PM');
create trigger pay_touch before update on public.payments for each row execute function public.touch_updated_at();
create or replace function public.pay_verified_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'verified' and new.verified_at is null then new.verified_at := now(); end if;
  if new.status <> 'verified' then new.verified_at := null; end if;
  return new;
end $$;
create trigger pay_verify before insert or update on public.payments for each row execute function public.pay_verified_at();

-- Photo shoots
create table public.photo_shoots (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique,
  application_id uuid references public.seller_applications(id) on delete set null,
  property_id uuid references public.properties(id) on delete set null,
  contact_name text not null,
  contact_phone text not null,
  address text,
  charge numeric not null default 0,
  scheduled_date date,
  scheduled_time text,
  status text not null default 'requested' check (status in ('requested','scheduled','completed','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','waived')),
  payment_id uuid references public.payments(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.payments add constraint pay_shoot_fk foreign key (photo_shoot_id) references public.photo_shoots(id) on delete set null;
grant select, insert, update, delete on public.photo_shoots to authenticated;
grant all on public.photo_shoots to service_role;
alter table public.photo_shoots enable row level security;
create policy "ps admin all" on public.photo_shoots for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger ps_ref before insert on public.photo_shoots for each row execute function public.set_ref_code('PS');
create trigger ps_touch before update on public.photo_shoots for each row execute function public.touch_updated_at();
create or replace function public.ps_paid_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.payment_status = 'paid' then
    if new.payment_id is null or not exists (select 1 from public.payments p where p.id = new.payment_id and p.status = 'verified') then
      raise exception 'A photo shoot can only be marked paid with a verified payment record';
    end if;
  end if;
  return new;
end $$;
create trigger ps_paid before insert or update on public.photo_shoots for each row execute function public.ps_paid_guard();

-- Auto-create photo shoot request when a seller application asks for one
create or replace function public.app_create_shoot()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.photo_shoot_requested then
    insert into public.photo_shoots(application_id, contact_name, contact_phone, address, charge)
    values (new.id, new.owner_name, new.owner_phone, coalesce(new.details->>'address', new.locality),
            (select photo_shoot_charge from public.business_settings where id = 1));
  end if;
  return new;
end $$;
create trigger app_shoot after insert on public.seller_applications for each row execute function public.app_create_shoot();

-- Activity logs
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  entity_type text not null,
  entity_id uuid,
  entity_ref text,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);
grant select on public.activity_logs to authenticated;
grant all on public.activity_logs to service_role;
alter table public.activity_logs enable row level security;
create policy "logs admin read" on public.activity_logs for select to authenticated using (public.is_admin());
create or replace function public.log_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare r record; act text; chg jsonb;
begin
  if TG_OP = 'DELETE' then r := old; act := 'deleted';
  elsif TG_OP = 'INSERT' then r := new; act := 'created';
  else r := new; act := 'updated';
    if to_jsonb(old)->>'status' is distinct from to_jsonb(new)->>'status' then
      act := 'status_changed';
      chg := jsonb_build_object('from', to_jsonb(old)->>'status', 'to', to_jsonb(new)->>'status');
    end if;
  end if;
  insert into public.activity_logs(actor_id, actor_email, entity_type, entity_id, entity_ref, action, details)
  values (auth.uid(), auth.jwt()->>'email', TG_TABLE_NAME, (to_jsonb(r)->>'id')::uuid, to_jsonb(r)->>'ref_code', act, chg);
  return null;
end $$;
create trigger log_props after insert or update or delete on public.properties for each row execute function public.log_activity();
create trigger log_apps after insert or update or delete on public.seller_applications for each row execute function public.log_activity();
create trigger log_enq after insert or update or delete on public.enquiries for each row execute function public.log_activity();
create trigger log_sv after insert or update or delete on public.site_visits for each row execute function public.log_activity();
create trigger log_ps after insert or update or delete on public.photo_shoots for each row execute function public.log_activity();
create trigger log_pay after insert or update or delete on public.payments for each row execute function public.log_activity();
create trigger log_pk after insert or update or delete on public.listing_packages for each row execute function public.log_activity();

-- Storage policies (buckets created separately)
create policy "property photos public read" on storage.objects for select to anon, authenticated using (bucket_id = 'property-photos');
create policy "property photos admin write" on storage.objects for insert to authenticated with check (bucket_id = 'property-photos' and public.is_admin());
create policy "property photos admin update" on storage.objects for update to authenticated using (bucket_id = 'property-photos' and public.is_admin());
create policy "property photos admin delete" on storage.objects for delete to authenticated using (bucket_id = 'property-photos' and public.is_admin());
create policy "application uploads public insert" on storage.objects for insert to anon, authenticated with check (bucket_id = 'application-uploads' and (storage.foldername(name))[1] = 'applications');
create policy "application uploads admin read" on storage.objects for select to authenticated using (bucket_id = 'application-uploads' and public.is_admin());
create policy "application uploads admin delete" on storage.objects for delete to authenticated using (bucket_id = 'application-uploads' and public.is_admin());
