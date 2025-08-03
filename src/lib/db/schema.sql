-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  description TEXT,
  status VARCHAR(50) DEFAULT 'In Stock',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Insert a default admin user (password: 'password' - should be hashed in production)
INSERT INTO users (email, password_hash, name, role) 
VALUES ('admin@example.com', '$2b$10$rQZ9QmjytWzQgwjvtpfzKOXbnon9hGrVhGGGGGGGGGGGGGGGGGGGGG', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Furniture', 'Office and home furniture'),
('Stationery', 'Office supplies and stationery items'),
('Clothing', 'Apparel and accessories'),
('Books', 'Books and educational materials'),
('Home & Garden', 'Home improvement and gardening supplies'),
('Sports', 'Sports equipment and accessories'),
('Toys', 'Toys and games'),
('Food & Beverages', 'Food items and beverages'),
('Health & Beauty', 'Health and beauty products'),
('Automotive', 'Automotive parts and accessories'),
('Office Supplies', 'General office supplies')
ON CONFLICT (name) DO NOTHING;

-- Insert some sample inventory items
INSERT INTO inventory_items (name, sku, category, quantity, price, description, status, user_id) VALUES
('Laptop Computer', 'LAP-001', 'Electronics', 25, 999.99, 'High-performance laptop for business use', 'In Stock', 1),
('Office Chair', 'CHR-001', 'Furniture', 15, 299.99, 'Ergonomic office chair with lumbar support', 'In Stock', 1),
('Wireless Mouse', 'MSE-001', 'Electronics', 50, 29.99, 'Wireless optical mouse with USB receiver', 'In Stock', 1),
('Desk Lamp', 'LMP-001', 'Furniture', 8, 79.99, 'LED desk lamp with adjustable brightness', 'Low Stock', 1),
('Notebook', 'NTB-001', 'Stationery', 100, 4.99, 'Spiral-bound notebook, 200 pages', 'In Stock', 1)
ON CONFLICT (sku) DO NOTHING;