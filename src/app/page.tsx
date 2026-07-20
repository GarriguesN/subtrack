'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ExpenseLogo } from '@/components/ExpenseLogo';
import Link from 'next/link';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface Stats {
  totalMonth: number;
  totalYear: number;
  effectiveMonthly: number;
  byCategory: { category: string; total: number; count: number; effectiveMonthly: number }[];
  byMonth: { month: string; total: number }[];
  topExpenses: { name: string; total: number; count: number; period: string; effectiveMonthly: number }[];
  upcomingPayments: { id: number; name: string; amount: number; period: string; category: string; date: string }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid-layout">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card"><div className="skeleton h-40" /></div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-secondary)]">Could not load data.</p>
      </div>
    );
  }

  const doughnutData = {
    labels: stats.byCategory.map(c => c.category),
    datasets: [{
      data: stats.byCategory.map(c => c.total),
      backgroundColor: ['#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316', '#6366f1', '#ec4899', '#6b7280'],
      borderWidth: 0,
    }],
  };

  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const barData = {
    labels: stats.byMonth.map(m => {
      const parts = m.month.split('-');
      return monthNames[parseInt(parts[1]) - 1] + ' ' + parts[0].slice(2);
    }),
    datasets: [{
      label: 'Total',
      data: stats.byMonth.map(m => m.total),
      backgroundColor: '#2563EB',
      borderRadius: 4,
    }],
  };

  function periodBadge(period: string): string {
    switch (period) {
      case 'monthly': return '/mo';
      case 'quarterly': return '/3mo';
      case 'semi-annual': return '/6mo';
      case 'annual': return '/yr';
      case 'one-time': return 'once';
      default: return '';
    }
  }

  return (
    <div className="space-y-6">
      {/* Monthly Total Hero */}
      <div className="text-center py-6">
        <p className="text-sm text-[var(--text-muted)] uppercase tracking-wider">This Month</p>
        <p className="text-5xl font-bold mt-2" style={{ color: 'var(--accent)' }}>
          €{stats.totalMonth.toFixed(2)}
        </p>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          €{stats.totalYear.toFixed(2)} this year
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          ~€{stats.effectiveMonthly.toFixed(2)}/mo effective recurring
        </p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">By Category</h2>
          {stats.byCategory.length > 0 ? (
            <div className="flex items-center justify-center" style={{ height: 220 }}>
              <Doughnut data={doughnutData} options={{ cutout: '65%', plugins: { legend: { display: false } }, maintainAspectRatio: false }} />
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">No data yet</p>
          )}
        </div>
        <div className="card">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Monthly Trend</h2>
          {stats.byMonth.length > 0 ? (
            <div style={{ height: 220 }}>
              <Bar data={barData} options={{
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 10 } } } },
                maintainAspectRatio: false,
              }} />
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">No data yet</p>
          )}
        </div>
      </div>

      {/* Top Subscriptions */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Top Subscriptions</h2>
        {stats.topExpenses.length > 0 ? (
          <div className="space-y-3">
            {stats.topExpenses.map((exp, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExpenseLogo name={exp.name} />
                  <div>
                    <span className="font-medium text-sm">{exp.name}</span>
                    <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      {periodBadge(exp.period)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold block">€{exp.total.toFixed(2)}</span>
                  {exp.period !== 'one-time' && (
                    <span className="text-[10px] text-[var(--text-muted)]">~€{exp.effectiveMonthly.toFixed(2)}/mo</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No subscriptions tracked yet.</p>
        )}
      </div>

      {/* Upcoming Payments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Upcoming (7 days)</h2>
          {stats.upcomingPayments.length > 0 && (
            <span className="badge" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              {stats.upcomingPayments.length}
            </span>
          )}
        </div>
        {stats.upcomingPayments.length > 0 ? (
          <div className="space-y-3">
            {stats.upcomingPayments.map((p) => (
              <Link key={p.id} href={`/edit/${p.id}`} className="flex items-center justify-between hover:bg-[var(--bg-secondary)] -mx-2 px-2 sm:-mx-4 sm:px-4 py-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <ExpenseLogo name={p.name} category={p.category} />
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{p.date.split('-').reverse().join('/')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CategoryBadge category={p.category} />
                  {p.period !== 'monthly' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      {periodBadge(p.period)}
                    </span>
                  )}
                  <span className="font-semibold text-sm">€{p.amount.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No upcoming payments.</p>
        )}
      </div>
    </div>
  );
}
