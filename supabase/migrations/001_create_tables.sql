-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DAS Solutions Table
CREATE TABLE das_solutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  type VARCHAR(50) DEFAULT 'standard',
  icon VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Groups Table
CREATE TABLE customer_groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Categories Table
CREATE TABLE product_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  sub_brand VARCHAR(100),
  category_id UUID REFERENCES product_categories(id),
  short_description VARCHAR(255) NOT NULL,
  long_description TEXT,
  gross_price DECIMAL(10, 2) NOT NULL,
  discount_group VARCHAR(50) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL UNIQUE,
  account VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  discount_group_id UUID REFERENCES customer_groups(id),
  account_type VARCHAR(100) DEFAULT 'end-user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount Matrix Table
CREATE TABLE discount_matrix (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_discount_group VARCHAR(50) NOT NULL,
  customer_group_id UUID REFERENCES customer_groups(id),
  discount_percentage DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_discount_group, customer_group_id)
);

-- Quotes Table
CREATE TABLE quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_number VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  customer_id UUID REFERENCES customers(id),
  das_solution_id UUID REFERENCES das_solutions(id),
  project_discount DECIMAL(5, 2) DEFAULT 0,
  additional_discount DECIMAL(5, 2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  total_value DECIMAL(12, 2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote Items Table
CREATE TABLE quote_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_customers_type ON customers(account_type);
CREATE INDEX idx_customers_group ON customers(discount_group_id);
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created ON quotes(created_at);
CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX idx_quote_items_product ON quote_items(product_id);

-- Insert sample data
INSERT INTO das_solutions (id, name, description, type, icon) VALUES
  (uuid_generate_v4(), 'SMARTair', 'Wireless access control with mobile and RFID credentials', 'wireless', '🔐'),
  (uuid_generate_v4(), 'Aperio', 'Battery-powered wireless locks with real-time monitoring', 'battery', '🔋'),
  (uuid_generate_v4(), 'Access', 'Traditional access control with advanced security features', 'traditional', '🛡️'),
  (uuid_generate_v4(), 'eCLIQ', 'Electronic cylinder system with programmable keys', 'cylinder', '🔑');

INSERT INTO customer_groups (id, code, name, discount_percentage) VALUES
  (uuid_generate_v4(), 'platinum', 'Platinum Partner', 35),
  (uuid_generate_v4(), 'gold', 'Gold Partner', 25),
  (uuid_generate_v4(), 'silver', 'Silver Partner', 15),
  (uuid_generate_v4(), 'bronze', 'Bronze Partner', 10),
  (uuid_generate_v4(), 'government', 'Government', 30),
  (uuid_generate_v4(), 'education', 'Education', 20);

INSERT INTO product_categories (id, name, code) VALUES
  (uuid_generate_v4(), 'Electronic Locks', 'locks'),
  (uuid_generate_v4(), 'Card Readers', 'readers'),
  (uuid_generate_v4(), 'Controllers', 'controllers'),
  (uuid_generate_v4(), 'Software', 'software'),
  (uuid_generate_v4(), 'Credentials', 'credentials'),
  (uuid_generate_v4(), 'Accessories', 'accessories');