import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getAllInventoryItems, createInventoryItem, getInventoryStats } from '@/lib/db/queries';

// GET /api/inventory - Get all inventory items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get('stats') === 'true';

    if (statsOnly) {
      const stats = await getInventoryStats();
      return NextResponse.json(stats);
    }

    const items = await getAllInventoryItems();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Create new inventory item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, sku, category, quantity, price, description } = body;

    // Validate required fields
    if (!name || !sku || !category || quantity === undefined || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine status based on quantity
    let status = 'In Stock';
    if (quantity === 0) {
      status = 'Out of Stock';
    } else if (quantity < 10) {
      status = 'Low Stock';
    }

    const newItem = await createInventoryItem({
      name,
      sku,
      category,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      description: description || '',
      status,
      user_id: 1 // For now, using default user ID
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    
    // Handle unique constraint violation for SKU
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    );
  }
}