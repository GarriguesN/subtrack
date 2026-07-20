'use client';

import { useEffect, useState } from 'react';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ExpenseLogo } from '@/components/ExpenseLogo';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Calendar, Filter, ArrowUpDown, X } from 'lucide-react';

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

  const hasActiveFilters = month !== '' || category !== '';

  return (
    <div className="space-y-4">
      {/* ── Filter panel ── */}
      <div className="card space-y-3">
        {/* Summary + clear-all row */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {loading
              ? 'Loading…'
              : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} found`}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => { setMonth(''); setCategory(''); }}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>

        {/* Filter controls grid — stack on mobile, row on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Month */}
          <div className="relative">
            <Calendar
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="month"
              value={month}
              onChange={e => setMonth(e.target.value)}
              className="input w-full sm:!w-full"
              style={{ width: '84.4%' }}
            />
            {month && (
              <button
                onClick={() => setMonth('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                title="Clear month"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category */}
          <div className="relative">
            <Filter
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="select w-full"
            >
              <option value="">All categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <ArrowUpDown
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'date' | 'amount')}
              className="select w-full"
            >
              <option value="date">Sort: Date</option>
              <option value="amount">Sort: Amount</option>
            </select>
          </div>
        </div>

        {/* Category chips — horizontal scroll, no wrap */}
        <div
          className="flex gap-1.5 overflow-x-auto pb-2"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style>{`/* hide webkit scrollbar */.expense-chips::-webkit-scrollbar { display: none; }`}</style>
          <button
            onClick={() => setCategory('')}
            className={`badge cursor-pointer transition-all flex-shrink-0 ${
              !category
                ? 'bg-[var(--accent)] text-white border-2 border-[var(--accent)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`badge cursor-pointer transition-all flex-shrink-0 ${
                category === c
                  ? 'bg-[var(--accent)] text-white border-2 border-[var(--accent)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
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
