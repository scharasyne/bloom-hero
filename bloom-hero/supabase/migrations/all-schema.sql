create table public.activity_logs (
  id uuid not null default gen_random_uuid (),
  admin_user_id uuid not null,
  admin_name text not null,
  action_type text not null,
  action_title text not null,
  target_id uuid null,
  target_name text not null,
  details jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}'::text[],
  quick_links jsonb not null default '[]'::jsonb,
  rating jsonb null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  constraint activity_logs_pkey primary key (id),
  constraint activity_logs_admin_user_id_fkey foreign KEY (admin_user_id) references users (id) on delete CASCADE,
  constraint activity_logs_action_type_check check (
    (
      action_type = any (
        array[
          'approved'::text,
          'rejected'::text,
          'suspended'::text,
          'unsuspended'::text,
          'login'::text,
          'logout'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists activity_logs_admin_user_id_idx on public.activity_logs using btree (admin_user_id) TABLESPACE pg_default;

create index IF not exists activity_logs_action_type_idx on public.activity_logs using btree (action_type) TABLESPACE pg_default;

create index IF not exists activity_logs_created_at_idx on public.activity_logs using btree (created_at desc) TABLESPACE pg_default;


create table public.categories (
  id uuid not null default gen_random_uuid (),
  category_name text not null,
  constraint categories_pkey primary key (id),
  constraint categories_category_name_key unique (category_name)
) TABLESPACE pg_default;

create table public.customers (
  user_id uuid not null,
  shipping_address text null,
  created_at timestamp with time zone not null default now(),
  profile_photo_url text null,
  notification_preferences jsonb not null default '{"promotions": false, "order_updates": true}'::jsonb,
  updated_at timestamp with time zone not null default now(),
  constraint customers_pkey primary key (user_id),
  constraint customers_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger set_customer_updated_at BEFORE
update on customers for EACH row
execute FUNCTION set_customer_updated_at ();

create table public.messages (
  id uuid not null default gen_random_uuid (),
  sender_id uuid not null,
  receiver_id uuid not null,
  message_content text not null,
  created_at timestamp with time zone null default now(),
  constraint messages_pkey primary key (id),
  constraint messages_receiver_id_fkey foreign KEY (receiver_id) references users (id) on delete CASCADE,
  constraint messages_sender_id_fkey foreign KEY (sender_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.order_items (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  product_id uuid not null,
  quantity integer not null,
  subtotal numeric(12, 2) not null,
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_items_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint order_items_quantity_check check ((quantity > 0)),
  constraint order_items_subtotal_check check ((subtotal >= (0)::numeric))
) TABLESPACE pg_default;

create table public.orders (
  id uuid not null default gen_random_uuid (),
  customer_id uuid not null,
  vendor_id uuid not null,
  order_date timestamp with time zone not null default now(),
  status public.order_status not null default 'pending'::order_status,
  total_amount numeric(12, 2) not null,
  payment_method text null,
  receipt_proof_url text null,
  receipt_submitted_at timestamp with time zone null,
  payment_confirmed_at timestamp with time zone null,
  shipped_at timestamp with time zone null,
  received_at timestamp with time zone null,
  updated_at timestamp with time zone not null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_customer_id_fkey foreign KEY (customer_id) references customers (user_id) on delete CASCADE,
  constraint orders_vendor_id_fkey foreign KEY (vendor_id) references vendors (id) on delete CASCADE,
  constraint orders_payment_method_check check (
    (
      payment_method = any (array['online'::text, 'cod'::text])
    )
  ),
  constraint orders_total_amount_check check ((total_amount >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_orders_customer_status on public.orders using btree (customer_id, status) TABLESPACE pg_default;

create index IF not exists idx_orders_vendor_status on public.orders using btree (vendor_id, status) TABLESPACE pg_default;

create trigger set_order_updated_at BEFORE
update on orders for EACH row
execute FUNCTION set_order_updated_at ();

create table public.popup_gallery_photos (
  id uuid not null default gen_random_uuid (),
  vendor_id uuid not null,
  image_url text not null,
  caption text not null,
  location text null,
  event_name text null,
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  constraint popup_gallery_photos_pkey primary key (id),
  constraint popup_gallery_photos_vendor_id_fkey foreign KEY (vendor_id) references vendors (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists popup_gallery_photos_vendor_id_idx on public.popup_gallery_photos using btree (vendor_id) TABLESPACE pg_default;

create index IF not exists popup_gallery_photos_vendor_order_idx on public.popup_gallery_photos using btree (vendor_id, display_order, created_at) TABLESPACE pg_default;

create table public.popup_location_requests (
  id uuid not null default gen_random_uuid (),
  customer_id uuid not null,
  vendor_id uuid not null,
  requested_location text not null,
  requested_date date not null,
  status text null default 'pending'::text,
  constraint popup_requests_pkey primary key (id),
  constraint popup_requests_customer_id_fkey foreign KEY (customer_id) references customers (user_id) on delete CASCADE,
  constraint popup_requests_vendor_id_fkey foreign KEY (vendor_id) references vendors (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.popup_locations (
  id uuid not null default gen_random_uuid (),
  vendor_id uuid not null,
  location text not null,
  scheduled_date date not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  constraint popup_locations_pkey primary key (id),
  constraint popup_locations_vendor_id_fkey foreign KEY (vendor_id) references vendors (id) on delete CASCADE,
  constraint popup_locations_latitude_range_check check (
    (
      (latitude is null)
      or (
        (latitude >= ('-90'::integer)::numeric)
        and (latitude <= (90)::numeric)
      )
    )
  ),
  constraint popup_locations_longitude_range_check check (
    (
      (longitude is null)
      or (
        (longitude >= ('-180'::integer)::numeric)
        and (longitude <= (180)::numeric)
      )
    )
  )
) TABLESPACE pg_default;

create table public.product_categories (
  product_id uuid not null,
  category_id uuid not null,
  created_at timestamp with time zone not null default now(),
  constraint product_categories_pkey primary key (product_id, category_id),
  constraint product_categories_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE,
  constraint product_categories_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists product_categories_category_id_idx on public.product_categories using btree (category_id) TABLESPACE pg_default;

create trigger trigger_enforce_product_category_limit BEFORE INSERT
or
update on product_categories for EACH row
execute FUNCTION enforce_product_category_limit ();

create table public.product_images (
  id uuid not null default gen_random_uuid (),
  product_id uuid not null,
  image_url text not null,
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint product_images_pkey primary key (id),
  constraint product_images_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists product_images_product_id_idx on public.product_images using btree (product_id) TABLESPACE pg_default;

create index IF not exists product_images_display_order_idx on public.product_images using btree (product_id, display_order) TABLESPACE pg_default;

create table public.products (
  id uuid not null default gen_random_uuid (),
  vendor_id uuid not null,
  category_id uuid null,
  product_name text not null,
  description text null,
  price numeric(10, 2) not null,
  stocks integer not null default 0,
  created_at timestamp with time zone not null default now(),
  product_image_url text null,
  constraint products_pkey primary key (id),
  constraint products_category_id_fkey foreign KEY (category_id) references categories (id) on delete set null,
  constraint products_vendor_id_fkey foreign KEY (vendor_id) references vendors (id) on delete CASCADE,
  constraint products_price_check check ((price >= (0)::numeric)),
  constraint products_stocks_check check ((stocks >= 0))
) TABLESPACE pg_default;

create table public.reviews (
  id uuid not null default gen_random_uuid (),
  customer_id uuid not null,
  vendor_id uuid not null,
  rating integer not null,
  comment text null,
  review_date timestamp with time zone null default now(),
  product_id uuid null,
  order_id uuid null,
  status text not null default 'pending'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null,
  constraint reviews_pkey primary key (id),
  constraint reviews_order_id_fkey foreign KEY (order_id) references orders (id) on delete set null,
  constraint reviews_customer_id_fkey foreign KEY (customer_id) references customers (user_id) on delete CASCADE,
  constraint reviews_product_id_fkey foreign KEY (product_id) references products (id) on delete set null,
  constraint reviews_vendor_id_fkey foreign KEY (vendor_id) references vendors (id) on delete CASCADE,
  constraint reviews_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    )
  ),
  constraint reviews_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists reviews_product_id_idx on public.reviews using btree (product_id) TABLESPACE pg_default;

create index IF not exists reviews_order_id_idx on public.reviews using btree (order_id) TABLESPACE pg_default;

create index IF not exists reviews_status_idx on public.reviews using btree (status) TABLESPACE pg_default;

create table public.users (
  id uuid not null,
  name text null,
  email text not null,
  contact_number text null,
  role public.user_role null default 'customer'::user_role,
  created_at timestamp with time zone not null default now(),
  profile_photo_url text null,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.users (
  id uuid not null,
  name text null,
  email text not null,
  contact_number text null,
  role public.user_role null default 'customer'::user_role,
  created_at timestamp with time zone not null default now(),
  profile_photo_url text null,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.vendors (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null,
  shop_name text null,
  vendor_type public.vendor_type not null,
  average_rating numeric(3, 2) null default 0.00,
  created_at timestamp with time zone not null default now(),
  status public.vendor_status not null default 'pending'::vendor_status,
  suspended_at timestamp with time zone null,
  suspended_by_admin_id uuid null,
  suspension_reason text null,
  location_text text null,
  location_latitude double precision null,
  location_longitude double precision null,
  phone_number text null,
  opens_at time without time zone null,
  closes_at time without time zone null,
  about text null,
  constraint vendors_pkey primary key (id),
  constraint unique_vendor_owner unique (owner_id),
  constraint vendors_owner_id_fkey foreign KEY (owner_id) references users (id) on delete CASCADE,
  constraint vendors_suspended_by_admin_id_fkey foreign KEY (suspended_by_admin_id) references users (id) on delete set null,
  constraint vendors_average_rating_check check (
    (
      (average_rating >= (0)::numeric)
      and (average_rating <= (5)::numeric)
    )
  ),
  constraint vendors_phone_number_ph_check check (
    (
      (phone_number is null)
      or (phone_number ~ '^\+63\d{9}$'::text)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_vendors_location_text on public.vendors using gin (
  to_tsvector(
    'simple'::regconfig,
    COALESCE(location_text, ''::text)
  )
) TABLESPACE pg_default;

create index IF not exists idx_vendors_location_coords on public.vendors using btree (location_latitude, location_longitude) TABLESPACE pg_default;

create index IF not exists idx_vendors_status on public.vendors using btree (status) TABLESPACE pg_default;

create index IF not exists idx_vendors_owner_status on public.vendors using btree (owner_id, status) TABLESPACE pg_default;

-- storage bucket: shared user profile photos
-- path format: <auth.uid()>/<filename>
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Users can upload own profile photos" ON storage.objects;
CREATE POLICY "Users can upload own profile photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own profile photos" ON storage.objects;
CREATE POLICY "Users can update own profile photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own profile photos" ON storage.objects;
CREATE POLICY "Users can delete own profile photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  );

alter table public.popup_location_requests
add column if not exists created_at timestamp with time zone not null default now(),
add column if not exists requested_start_time time without time zone,
add column if not exists requested_end_time time without time zone,
add column if not exists latitude double precision,
add column if not exists longitude double precision;