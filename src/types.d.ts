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

// Inventory item type
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  price: number;
  description?: string;
  status?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  createdAt?: Date;
  updatedAt?: Date;
}

// Database schema types
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string; // Hashed password
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryRecord extends InventoryItem {
  userId: string; // Reference to the user who created/owns the item
}