import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { getInventoryItemById, updateInventoryItem, deleteInventoryItem } from '@/lib/db/queries';

// GET /api/inventory/[id] - Get specific inventory item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const item = await getInventoryItemById(id);
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory item' },
      { status: 500 }
    );
  }
}

// PUT /api/inventory/[id] - Update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, sku, category, quantity, price, description } = body;

    // Prepare updates object
    const updates: Partial<{
      name: string;
      sku: string;
      category: string;
      quantity: number;
      price: number;
      description: string;
      status: string;
    }> = {};
    if (name !== undefined) updates.name = name;
    if (sku !== undefined) updates.sku = sku;
    if (category !== undefined) updates.category = category;
    if (quantity !== undefined) {
      updates.quantity = parseInt(quantity);
      // Update status based on quantity
      if (updates.quantity === 0) {
        updates.status = 'Out of Stock';
      } else if (updates.quantity < 10) {
        updates.status = 'Low Stock';
      } else {
        updates.status = 'In Stock';
      }
    }
    if (price !== undefined) updates.price = parseFloat(price);
    if (description !== undefined) updates.description = description;

    const updatedItem = await updateInventoryItem(id, updates);
    
    if (!updatedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    // Handle unique constraint violation for SKU
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'SKU already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

// DELETE /api/inventory/[id] - Delete inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const deleted = await deleteInventoryItem(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}