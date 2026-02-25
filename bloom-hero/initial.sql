CREATE TYPE user_role AS ENUM ('admin', 'vendor', 'customer');
CREATE TYPE vendor_type AS ENUM ('market', 'pop-up', 'handcrafted');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS users(
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT NOT NULL, 
    contact_number TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    shipping_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    vendor_type vendor_type NOT NULL,
    average_rating NUMERIC(3,2) DEFAULT 0.00 CHECK (average_rating BETWEEN 0 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT unique_vendor_owner UNIQUE (owner_id)
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    description TEXT,
    price NUMERIC (10, 2) NOT NULL CHECK (price >=0),
    stocks INTEGER NOT NULL DEFAULT 0 CHECK (stocks >=0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(user_id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status order_status NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0)
);

CREATE TABLE IF NOT EXISTS order_items(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
)

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(user_id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    review_date TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE popup_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL
);

CREATE TABLE popup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(user_id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    requested_location TEXT NOT NULL,
    requested_date DATE NOT NULL,
    status TEXT DEFAULT 'pending'
);

