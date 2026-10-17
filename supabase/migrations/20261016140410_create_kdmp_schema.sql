/*
# KDMP (Koperasi Desa/Kelurahan Merah Putih) - Database Schema

## Overview
Creates the complete schema for a village cooperative management system including
product catalog, suppliers, members, services, and financial transactions.

## New Tables

1. **categories** - Product categories (Sembako, Kebutuhan Rumah Tangga, etc.)
   - id (uuid, PK)
   - name (text, unique)
   - icon (text - lucide icon name)
   - description (text)
   - created_at (timestamptz)

2. **suppliers** - Supplier/pemasok directory
   - id (uuid, PK)
   - name (text)
   - contact_person (text)
   - phone (text)
   - email (text)
   - address (text)
   - city (text)
   - category (text - what they supply)
   - rating (int 1-5)
   - created_at (timestamptz)

3. **products** - Product catalog with pricing and stock
   - id (uuid, PK)
   - name (text)
   - category_id (uuid FK -> categories)
   - unit (text - e.g. "kg", "pcs", "liter")
   - price (numeric - selling price)
   - cost_price (numeric - purchase price)
   - stock (int - current stock quantity)
   - min_stock (int - minimum stock before reorder)
   - supplier_id (uuid FK -> suppliers)
   - description (text)
   - image_url (text)
   - is_active (boolean, default true)
   - created_at (timestamptz)

4. **members** - Cooperative members/anggota
   - id (uuid, PK)
   - member_number (text, unique)
   - name (text)
   - phone (text)
   - email (text)
   - address (text)
   - join_date (date)
   - status (text - 'aktif' / 'non-aktif')
   - simpanan_pokok (numeric - share capital)
   - simpanan_wajib (numeric - mandatory savings)
   - simpanan_sukarela (numeric - voluntary savings)
   - created_at (timestamptz)

5. **services** - Cooperative services/layanan
   - id (uuid, PK)
   - name (text)
   - description (text)
   - category (text - 'simpanan', 'pinjaman', 'jasa', ' perdagangan')
   - fee_or_rate (text - fee description or interest rate)
   - icon (text - lucide icon name)
   - created_at (timestamptz)

6. **transactions** - Financial transactions / administrasi
   - id (uuid, PK)
   - type (text - 'penjualan', 'pembelian', 'simpanan', 'pinjaman', 'biaya_operasional')
   - description (text)
   - amount (numeric)
   - member_id (uuid FK -> members, nullable)
   - product_id (uuid FK -> products, nullable)
   - quantity (int, nullable)
   - transaction_date (date)
   - status (text - 'lunas', 'pending', 'batal')
   - created_at (timestamptz)

## Security
- All tables: RLS enabled.
- All tables: anon + authenticated CRUD (single-tenant, no-auth app — data is intentionally shared/public).
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  icon text DEFAULT 'Package',
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE TO anon, authenticated USING (true);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  category text,
  rating int DEFAULT 4 CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_suppliers" ON suppliers;
CREATE POLICY "anon_select_suppliers" ON suppliers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_suppliers" ON suppliers;
CREATE POLICY "anon_insert_suppliers" ON suppliers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_suppliers" ON suppliers;
CREATE POLICY "anon_update_suppliers" ON suppliers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_suppliers" ON suppliers;
CREATE POLICY "anon_delete_suppliers" ON suppliers FOR DELETE TO anon, authenticated USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  unit text NOT NULL,
  price numeric(12,2) NOT NULL DEFAULT 0,
  cost_price numeric(12,2) DEFAULT 0,
  stock int NOT NULL DEFAULT 0,
  min_stock int DEFAULT 5,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE TO anon, authenticated USING (true);

-- Members
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_number text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  join_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'aktif',
  simpanan_pokok numeric(12,2) DEFAULT 0,
  simpanan_wajib numeric(12,2) DEFAULT 0,
  simpanan_sukarela numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_members" ON members;
CREATE POLICY "anon_select_members" ON members FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_members" ON members;
CREATE POLICY "anon_insert_members" ON members FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_members" ON members;
CREATE POLICY "anon_update_members" ON members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_members" ON members;
CREATE POLICY "anon_delete_members" ON members FOR DELETE TO anon, authenticated USING (true);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  fee_or_rate text,
  icon text DEFAULT 'Handshake',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_services" ON services;
CREATE POLICY "anon_select_services" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_services" ON services;
CREATE POLICY "anon_insert_services" ON services FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_services" ON services;
CREATE POLICY "anon_update_services" ON services FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_services" ON services;
CREATE POLICY "anon_delete_services" ON services FOR DELETE TO anon, authenticated USING (true);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  description text,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity int,
  transaction_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'lunas',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_transactions" ON transactions;
CREATE POLICY "anon_select_transactions" ON transactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_transactions" ON transactions;
CREATE POLICY "anon_insert_transactions" ON transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_transactions" ON transactions;
CREATE POLICY "anon_update_transactions" ON transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_transactions" ON transactions;
CREATE POLICY "anon_delete_transactions" ON transactions FOR DELETE TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_member ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
