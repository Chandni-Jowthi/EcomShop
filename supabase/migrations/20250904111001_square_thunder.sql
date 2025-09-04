/*
  # E-commerce Platform Database Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, category name)
      - `description` (text, optional description)
      - `image_url` (text, category image)
      - `created_at` (timestamp)
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `description` (text, product description)
      - `price` (decimal, product price)
      - `category_id` (uuid, foreign key to categories)
      - `image_url` (text, main product image)
      - `stock_quantity` (integer, available stock)
      - `is_active` (boolean, product status)
      - `created_at` (timestamp)
    - `cart_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer, item quantity)
      - `created_at` (timestamp)
    - `wishlist_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (uuid, foreign key to products)
      - `created_at` (timestamp)
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `total_amount` (decimal, order total)
      - `status` (text, order status)
      - `shipping_address` (jsonb, shipping details)
      - `created_at` (timestamp)
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer, item quantity)
      - `price` (decimal, item price at purchase)
      - `created_at` (timestamp)
    - `user_profiles`
      - `id` (uuid, primary key, foreign key to auth.users)
      - `full_name` (text, user's full name)
      - `phone` (text, phone number)
      - `address` (jsonb, user address)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to products and categories
    - Add policies for order management

  3. Sample Data
    - Insert sample categories and products for demonstration
*/

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price > 0),
  category_id uuid REFERENCES categories(id),
  image_url text,
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Wishlist items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL CHECK (total_amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  price decimal(10,2) NOT NULL CHECK (price > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Cart items policies
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Wishlist items policies
CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlist_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlist_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM orders WHERE orders.id = order_items.order_id));

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM orders WHERE orders.id = order_items.order_id));

-- Insert sample categories
INSERT INTO categories (name, description, image_url) VALUES
('Electronics', 'Latest electronic devices and gadgets', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg'),
('Clothing', 'Fashion and apparel for all occasions', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'),
('Home & Garden', 'Everything for your home and garden', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'),
('Sports', 'Sports equipment and accessories', 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg'),
('Books', 'Books and educational materials', 'https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg'),
('Beauty', 'Beauty and personal care products', 'https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity) VALUES
('Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation', 199.99, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg', 50),
('Smart Watch Series X', 'Advanced smartwatch with health monitoring features', 299.99, (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1), 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg', 30),
('Casual Cotton T-Shirt', 'Comfortable 100% cotton t-shirt in various colors', 24.99, (SELECT id FROM categories WHERE name = 'Clothing' LIMIT 1), 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg', 100),
('Premium Denim Jeans', 'High-quality denim jeans with perfect fit', 79.99, (SELECT id FROM categories WHERE name = 'Clothing' LIMIT 1), 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg', 75),
('Modern Table Lamp', 'Elegant table lamp with adjustable brightness', 89.99, (SELECT id FROM categories WHERE name = 'Home & Garden' LIMIT 1), 'https://images.pexels.com/photos/2343467/pexels-photo-2343467.jpeg', 25),
('Yoga Mat Pro', 'Professional yoga mat with superior grip', 49.99, (SELECT id FROM categories WHERE name = 'Sports' LIMIT 1), 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg', 40),
('Programming Fundamentals', 'Essential guide to programming concepts', 39.99, (SELECT id FROM categories WHERE name = 'Books' LIMIT 1), 'https://images.pexels.com/photos/2004161/pexels-photo-2004161.jpeg', 60),
('Skincare Essentials Set', 'Complete skincare routine for healthy skin', 129.99, (SELECT id FROM categories WHERE name = 'Beauty' LIMIT 1), 'https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg', 35)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);