import { NextRequest, NextResponse } from 'next/server';
import { listExpenses, createExpense } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const month = searchParams.get('month') || undefined;
    const category = searchParams.get('category') || undefined;
    const expenses = listExpenses(month, category);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const validPeriods = ['monthly', 'quarterly', 'semi-annual', 'annual', 'one-time'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, amount, category, period, date, notes } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name is required and must be a string' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
    }
    const validCategories = ['IA', 'Coche', 'Streaming', 'Ocio', 'Comida', 'Hogar', 'Salud', 'Otros'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: `category must be one of: ${validCategories.join(', ')}` }, { status: 400 });
    }
    if (period !== undefined && !validPeriods.includes(period)) {
      return NextResponse.json({ error: `period must be one of: ${validPeriods.join(', ')}` }, { status: 400 });
    }
    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const expense = createExpense({ name, amount, category, period, date, notes });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
