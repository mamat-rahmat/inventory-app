import { sql, executeQuery } from './neon';

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

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// User queries
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, role, created_at, updated_at 
      FROM users 
      WHERE email = ${email}
    `;
    return result.rows[0] || null;
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
    return result.rows[0];
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
    return result.rows;
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
    return result.rows[0] || null;
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
    return result.rows[0];
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
}

export async function updateInventoryItem(id: number, updates: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>): Promise<InventoryItem | null> {
  try {
    const fields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined);
    
    if (fields.length === 0) {
      throw new Error('No valid updates provided');
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => updates[field as keyof typeof updates])];
    
    const query = `
      UPDATE inventory_items 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await executeQuery(query, values);
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
    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}

export async function searchInventoryItems(searchTerm: string, category?: string, userId?: number): Promise<InventoryItem[]> {
  try {
    let queryText = `
      SELECT * FROM inventory_items 
      WHERE (name ILIKE $1 OR sku ILIKE $1 OR description ILIKE $1)
    `;
    const params = [`%${searchTerm}%`];
    
    if (category) {
      queryText += ` AND category = $${params.length + 1}`;
      params.push(category);
    }
    
    if (userId) {
      queryText += ` AND user_id = $${params.length + 1}`;
      params.push(userId.toString());
    }
    
    queryText += ` ORDER BY created_at DESC`;
    
    const result = await executeQuery(queryText, params);
    return result;
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
    let params: unknown[] = [];
    
    if (userId) {
      whereClause = 'WHERE user_id = $1';
      params = [userId];
    }

    const [totalResult, valueResult, lowStockResult, categoriesResult] = await Promise.all([
      executeQuery(`SELECT COUNT(*) as count FROM inventory_items ${whereClause}`, params),
      executeQuery(`SELECT SUM(quantity * price) as total FROM inventory_items ${whereClause}`, params),
      executeQuery(`SELECT COUNT(*) as count FROM inventory_items ${whereClause} ${whereClause ? 'AND' : 'WHERE'} quantity < 10`, params),
      executeQuery(`SELECT COUNT(DISTINCT category) as count FROM inventory_items ${whereClause}`, params)
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

// Category queries
export async function getAllCategories(): Promise<Category[]> {
  try {
    const result = await sql`
      SELECT * FROM categories 
      ORDER BY name ASC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const result = await sql`
      SELECT * FROM categories 
      WHERE id = ${id}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching category by id:', error);
    throw error;
  }
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
  try {
    const result = await sql`
      INSERT INTO categories (name, description)
      VALUES (${category.name}, ${category.description || ''})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(id: number, updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>): Promise<Category | null> {
  try {
    const fields = Object.keys(updates).filter(key => updates[key as keyof typeof updates] !== undefined);
    
    if (fields.length === 0) {
      throw new Error('No valid updates provided');
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => updates[field as keyof typeof updates])];
    
    const query = `
      UPDATE categories 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await executeQuery(query, values);
    return result[0] || null;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: number): Promise<boolean> {
  try {
    // Check if category is being used by any inventory items
    const usageCheck = await sql`
      SELECT COUNT(*) as count FROM inventory_items 
      WHERE category = (SELECT name FROM categories WHERE id = ${id})
    `;
    
    if (parseInt(usageCheck.rows[0]?.count || '0') > 0) {
      throw new Error('Cannot delete category that is being used by inventory items');
    }
    
    const result = await sql`
      DELETE FROM categories 
      WHERE id = ${id}
    `;
    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// Initialize database (create tables and sample data)
export async function initializeDatabase(): Promise<void> {
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

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}