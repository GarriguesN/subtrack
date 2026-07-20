'use client';

import { useEffect, useState } from 'react';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ExpenseLogo } from '@/components/ExpenseLogo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface Expense {
  id: number;
  name: string;
  amount: number;
  category: string;
  period: string;
  date: string;
  notes: string | null;
  created_at: string;
}

const categories = ['IA', 'Coche', 'Streaming', 'Ocio', 'Comida', 'Hogar', 'Salud', 'Otros'];

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(''); // empty = all expenses
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  function fetchExpenses() {
    setLoading(true);
    const params = new URLSearchParams();
    if (month) params.set('month', month);
    if (category) params.set('category', category);
    fetch(`/api/expenses?${params}`)
      .then(r => r.json())
      .then(data => {
        let sorted = [...data];
        if (sortBy === 'amount') {
          sorted.sort((a: Expense, b: Expense) => b.amount - a.amount);
        } else {
          sorted.sort((a: Expense, b: Expense) => b.date.localeCompare(a.date) || b.id - a.id);
        }
        setExpenses(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { fetchExpenses(); }, [month, category, sortBy]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this expense?')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    fetchExpenses();
  }

  function periodLabel(period: string): string {
    switch (period) {
      case 'monthly': return '/mo';
      case 'quarterly': return '/3mo';
      case 'semi-annual': return '/6mo';
      case 'annual': return '/yr';
      default: return '';
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="input w-auto"
          />
          {month && (
            <button
              onClick={() => setMonth('')}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors whitespace-nowrap"
            >
              Show all
            </button>
          )}
        </div>
        <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
          {month ? `Filtering by ${month}` : 'Showing all expenses'}
        </span>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="select w-auto"
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'date' | 'amount')}
          className="select w-auto"
        >
          <option value="date">Sort: Date</option>
          <option value="amount">Sort: Amount</option>
        </select>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('')}
          className={`badge cursor-pointer transition-colors ${!category ? 'ring-2 ring-[var(--accent)]' : ''}`}
          style={{ backgroundColor: category === '' ? 'var(--accent)' : 'var(--bg-secondary)', color: category === '' ? '#fff' : 'var(--text-primary)' }}
        >
          All
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`badge cursor-pointer transition-colors ${category === c ? 'ring-2 ring-[var(--accent)]' : ''}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Expense list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card"><div className="skeleton h-12" /></div>
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-[var(--text-muted)] mb-4">No expenses found</p>
          <Link href="/add" className="btn btn-primary">Add Expense</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map(exp => (
            <div key={exp.id} className="card flex items-center justify-between gap-4 py-3 px-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <ExpenseLogo name={exp.name} category={exp.category} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/edit/${exp.id}`} className="font-medium text-sm hover:text-[var(--accent)] truncate">
                      {exp.name}
                    </Link>
                    <CategoryBadge category={exp.category} />
                    {exp.period === 'one-time' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium">once</span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{exp.date.split('-').reverse().join('/')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-semibold text-sm">
                  €{exp.amount.toFixed(2)}
                  {periodLabel(exp.period) && (
                    <span className="text-xs text-[var(--text-muted)] font-normal">{periodLabel(exp.period)}</span>
                  )}
                </span>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
