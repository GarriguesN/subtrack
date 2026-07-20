import { NextRequest, NextResponse } from 'next/server';
import { updateExpense, deleteExpense } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const expenseId = parseInt(id, 10);
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const body = await request.json();
    const { name, amount, category, period, date, notes } = body;

    const updated = updateExpense(expenseId, { name, amount, category, period, date, notes });
    if (!updated) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /api/expenses/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const expenseId = parseInt(id, 10);
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const deleted = deleteExpense(expenseId);
    if (!deleted) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/expenses/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
