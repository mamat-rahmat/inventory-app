import { DefaultSession, DefaultUser } from 'next-auth';

// Extend the User type to include custom fields
declare module 'next-auth' {
  interface User extends DefaultUser {
    role?: string;
  }

  interface Session extends DefaultSession {
    user?: User;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
  }
}

// Inventory item type (matches database schema)
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

// Database schema types
export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password?: string; // Hashed password
  role: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryRecord extends InventoryItem {
  user_id: number; // Reference to the user who created/owns the item
}