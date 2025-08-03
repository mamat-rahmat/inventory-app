import { sql } from './neon';

// Types for our database entities
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: number;
}

// User queries
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, role, created_at, updated_at 
      FROM users 
      WHERE email = ${email}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

export async function createUser(email: string, passwordHash: string, name: string, role: string = 'user'): Promise<User> {
  try {
    const result = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email}, ${passwordHash}, ${name}, ${role})
      RETURNING id, email, name, role, created_at, updated_at
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Inventory item queries
export async function getAllInventoryItems(userId?: number): Promise<InventoryItem[]> {
  try {
    let result;
    if (userId) {
      result = await sql`
        SELECT * FROM inventory_items 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM inventory_items 
        ORDER BY created_at DESC
      `;
    }
    return result;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
}

export async function getInventoryItemById(id: number): Promise<InventoryItem | null> {
  try {
    const result = await sql`
      SELECT * FROM inventory_items 
      WHERE id = ${id}
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching inventory item by id:', error);
    throw error;
  }
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
  try {
    const result = await sql`
      INSERT INTO inventory_items (name, sku, category, quantity, price, description, status, user_id)
      VALUES (${item.name}, ${item.sku}, ${item.category}, ${item.quantity}, ${item.price}, ${item.description || ''}, ${item.status}, ${item.user_id})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
}

export async function updateInventoryItem(id: number, updates: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>): Promise<InventoryItem | null> {
  try {
    const setClause = Object.entries(updates)
      .filter(([_, value]) => value !== undefined)
      .map(([key, _]) => `${key} = $${key}`)
      .join(', ');
    
    if (!setClause) {
      throw new Error('No valid updates provided');
    }

    const result = await sql`
      UPDATE inventory_items 
      SET ${sql.unsafe(setClause)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
}

export async function deleteInventoryItem(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM inventory_items 
      WHERE id = ${id}
    `;
    return result.count > 0;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}

export async function searchInventoryItems(searchTerm: string, category?: string, userId?: number): Promise<InventoryItem[]> {
  try {
    let query = sql`
      SELECT * FROM inventory_items 
      WHERE (name ILIKE ${`%${searchTerm}%`} OR sku ILIKE ${`%${searchTerm}%`} OR description ILIKE ${`%${searchTerm}%`})
    `;
    
    if (category) {
      query = sql`${query} AND category = ${category}`;
    }
    
    if (userId) {
      query = sql`${query} AND user_id = ${userId}`;
    }
    
    query = sql`${query} ORDER BY created_at DESC`;
    
    return await query;
  } catch (error) {
    console.error('Error searching inventory items:', error);
    throw error;
  }
}

// Dashboard statistics
export async function getInventoryStats(userId?: number): Promise<{
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  categories: number;
}> {
  try {
    let whereClause = '';
    if (userId) {
      whereClause = `WHERE user_id = ${userId}`;
    }

    const [totalResult, valueResult, lowStockResult, categoriesResult] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM inventory_items ${sql.unsafe(whereClause)}`,
      sql`SELECT SUM(quantity * price) as total FROM inventory_items ${sql.unsafe(whereClause)}`,
      sql`SELECT COUNT(*) as count FROM inventory_items ${sql.unsafe(whereClause)} ${sql.unsafe(whereClause ? 'AND' : 'WHERE')} quantity < 10`,
      sql`SELECT COUNT(DISTINCT category) as count FROM inventory_items ${sql.unsafe(whereClause)}`
    ]);

    return {
      totalItems: parseInt(totalResult[0]?.count || '0'),
      totalValue: parseFloat(valueResult[0]?.total || '0'),
      lowStockItems: parseInt(lowStockResult[0]?.count || '0'),
      categories: parseInt(categoriesResult[0]?.count || '0')
    };
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    throw error;
  }
}

// Initialize database (create tables and sample data)
export async function initializeDatabase(): Promise<void> {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create inventory_items table
    await sql`
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
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON inventory_items(user_id)`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}