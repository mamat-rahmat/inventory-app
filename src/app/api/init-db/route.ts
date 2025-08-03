import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db/neon';

// POST /api/init-db - Initialize database with schema and sample data
export async function POST() {
  try {
    // Create users table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create inventory_items table
    await executeQuery(`
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
      )
    `);

    // Create indexes
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category)');
    await executeQuery('CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id)');

    // Insert default admin user (password: 'password' - hashed with bcrypt)
    await executeQuery(`
      INSERT INTO users (email, password_hash, name, role) 
      VALUES ('admin@example.com', '$2b$10$rQZ9QmjytWzQgwjvtpfzKOXbnon9hGrVhGGGGGGGGGGGGGGGGGGGGG', 'Admin User', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);

    // Insert sample inventory items
    await executeQuery(`
      INSERT INTO inventory_items (name, sku, category, quantity, price, description, status, user_id) VALUES
      ('Laptop Computer', 'LAP-001', 'Electronics', 25, 999.99, 'High-performance laptop for business use', 'In Stock', 1),
      ('Office Chair', 'CHR-001', 'Furniture', 15, 299.99, 'Ergonomic office chair with lumbar support', 'In Stock', 1),
      ('Wireless Mouse', 'MSE-001', 'Electronics', 50, 29.99, 'Wireless optical mouse with USB receiver', 'In Stock', 1),
      ('Desk Lamp', 'LMP-001', 'Furniture', 8, 79.99, 'LED desk lamp with adjustable brightness', 'Low Stock', 1),
      ('Notebook', 'NTB-001', 'Stationery', 100, 4.99, 'Spiral-bound notebook, 200 pages', 'In Stock', 1)
      ON CONFLICT (sku) DO NOTHING
    `);

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      tables: ['users', 'inventory_items'],
      sampleData: 'Added admin user and 5 sample inventory items'
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}