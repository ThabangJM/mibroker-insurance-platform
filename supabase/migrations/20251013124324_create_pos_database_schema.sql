/*
  # POS SaaS Database Schema

  ## Overview
  This migration creates the complete database schema for a multi-tenant Point of Sale SaaS platform.
  It includes stores, products, inventory, sales transactions, customers, and user management.

  ## Tables Created

  ### 1. stores
  Multi-tenant store management
  - `id` (uuid, primary key)
  - `name` (text) - Store/business name
  - `subscription_tier` (text) - Free, Starter, Pro, Enterprise
  - `subscription_status` (text) - Trial, Active, Cancelled, Expired
  - `trial_ends_at` (timestamptz) - Trial expiration date
  - `owner_id` (uuid) - References auth.users
  - `settings` (jsonb) - Store settings (tax rates, currency, etc.)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. store_users
  Junction table for multi-user access to stores
  - `id` (uuid, primary key)
  - `store_id` (uuid) - References stores
  - `user_id` (uuid) - References auth.users
  - `role` (text) - Admin, Manager, Cashier
  - `created_at` (timestamptz)

  ### 3. categories
  Product categories per store
  - `id` (uuid, primary key)
  - `store_id` (uuid) - References stores
  - `name` (text)
  - `description` (text)
  - `created_at` (timestamptz)

  ### 4. products
  Store products and SKU management
  - `id` (uuid, primary key)
  - `store_id` (uuid) - References stores
  - `category_id` (uuid) - References categories
  - `sku` (text) - Stock keeping unit
  - `barcode` (text)
  - `name` (text)
  - `description` (text)
  - `price` (decimal)
  - `cost` (decimal) - Cost price for profit calculation
  - `image_url` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. inventory
  Real-time stock levels per product
  - `id` (uuid, primary key)
  - `product_id` (uuid) - References products
  - `store_id` (uuid) - References stores
  - `quantity` (integer)
  - `low_stock_threshold` (integer)
  - `updated_at` (timestamptz)

  ### 6. customers
  Customer relationship management
  - `id` (uuid, primary key)
  - `store_id` (uuid) - References stores
  - `name` (text)
  - `email` (text)
  - `phone` (text)
  - `loyalty_points` (integer)
  - `total_purchases` (decimal)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. transactions
  Sales transactions
  - `id` (uuid, primary key)
  - `store_id` (uuid) - References stores
  - `customer_id` (uuid) - References customers (nullable)
  - `cashier_id` (uuid) - References auth.users
  - `transaction_number` (text) - Human-readable transaction ID
  - `subtotal` (decimal)
  - `tax_amount` (decimal)
  - `discount_amount` (decimal)
  - `total_amount` (decimal)
  - `payment_method` (text) - Cash, Card, Mobile
  - `payment_status` (text) - Completed, Refunded, Partial
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 8. transaction_items
  Line items for each transaction
  - `id` (uuid, primary key)
  - `transaction_id` (uuid) - References transactions
  - `product_id` (uuid) - References products
  - `quantity` (integer)
  - `unit_price` (decimal)
  - `discount` (decimal)
  - `total` (decimal)

  ### 9. refunds
  Transaction refunds
  - `id` (uuid, primary key)
  - `transaction_id` (uuid) - References transactions
  - `store_id` (uuid) - References stores
  - `refund_amount` (decimal)
  - `reason` (text)
  - `processed_by` (uuid) - References auth.users
  - `created_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access data from stores they belong to
  - Role-based policies for Admin, Manager, and Cashier access levels
  - Store owners have full access to their store data

  ## Indexes
  - Optimized indexes on foreign keys
  - Search indexes on product names and SKUs
  - Transaction date indexes for reporting

  ## Important Notes
  1. All monetary values use DECIMAL(10,2) for precision
  2. Timestamps are stored with timezone support
  3. Multi-tenancy enforced through store_id filtering
  4. Cascading deletes configured for data integrity
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subscription_tier text NOT NULL DEFAULT 'Free',
  subscription_status text NOT NULL DEFAULT 'Trial',
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  settings jsonb DEFAULT '{"currency": "ZAR", "tax_rate": 15, "receipt_footer": ""}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Create store_users table
CREATE TABLE IF NOT EXISTS store_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('Admin', 'Manager', 'Cashier')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, user_id)
);

ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sku text NOT NULL,
  barcode text,
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  cost decimal(10,2) DEFAULT 0 CHECK (cost >= 0),
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, sku)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold integer DEFAULT 10,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, store_id)
);

ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  loyalty_points integer DEFAULT 0,
  total_purchases decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email != '';

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  cashier_id uuid REFERENCES auth.users(id) NOT NULL,
  transaction_number text NOT NULL,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'Mobile')),
  payment_status text NOT NULL DEFAULT 'Completed' CHECK (payment_status IN ('Completed', 'Refunded', 'Partial')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, transaction_number)
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id) WHERE customer_id IS NOT NULL;

-- Create transaction_items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL,
  discount decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL
);

ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  refund_amount decimal(10,2) NOT NULL CHECK (refund_amount > 0),
  reason text DEFAULT '',
  processed_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Store owners can view their stores"
  ON stores FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Users can view stores they belong to"
  ON stores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = stores.id
      AND store_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Store owners can update their stores"
  ON stores FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for store_users
CREATE POLICY "Users can view store memberships for their stores"
  ON store_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_users.store_id
      AND stores.owner_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Store owners can manage store users"
  ON store_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_users.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can update store users"
  ON store_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_users.store_id
      AND stores.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_users.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can delete store users"
  ON store_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = store_users.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- RLS Policies for categories
CREATE POLICY "Store members can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = categories.store_id
      AND store_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Store admins and managers can manage categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = categories.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  );

CREATE POLICY "Store admins and managers can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = categories.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = categories.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  );

CREATE POLICY "Store admins and managers can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = categories.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  );

-- RLS Policies for products
CREATE POLICY "Store members can view products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = products.store_id
      AND store_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Store admins and managers can manage products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = products.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  );

CREATE POLICY "Store admins and managers can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = products.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = products.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  );

CREATE POLICY "Store admins and managers can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = products.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  );

-- RLS Policies for inventory
CREATE POLICY "Store members can view inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = inventory.store_id
      AND store_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Store admins and managers can manage inventory"
  ON inventory FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = inventory.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  );

CREATE POLICY "Store admins and managers can update inventory"
  ON inventory FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = inventory.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = inventory.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  );

-- RLS Policies for customers
CREATE POLICY "Store members can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = customers.store_id
      AND store_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Store members can manage customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = customers.store_id
      AND store_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Store members can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = customers.store_id
      AND store_users.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = customers.store_id
      AND store_users.user_id = auth.uid()
    )
  );

-- RLS Policies for transactions
CREATE POLICY "Store members can view transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = transactions.store_id
      AND store_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Store members can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = transactions.store_id
      AND store_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Store admins and managers can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = transactions.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = transactions.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  );

-- RLS Policies for transaction_items
CREATE POLICY "Store members can view transaction items"
  ON transaction_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions
      JOIN store_users ON store_users.store_id = transactions.store_id
      WHERE transactions.id = transaction_items.transaction_id
      AND store_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Store members can create transaction items"
  ON transaction_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      JOIN store_users ON store_users.store_id = transactions.store_id
      WHERE transactions.id = transaction_items.transaction_id
      AND store_users.user_id = auth.uid()
    )
  );

-- RLS Policies for refunds
CREATE POLICY "Store members can view refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = refunds.store_id
      AND store_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Store managers and admins can create refunds"
  ON refunds FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM store_users
      WHERE store_users.store_id = refunds.store_id
      AND store_users.user_id = auth.uid()
      AND store_users.role IN ('Admin', 'Manager')
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();