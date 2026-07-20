'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
} from 'chart.js';
import { Doughnut, Chart } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CategoryBadge } from '@/components/CategoryBadge';
import { ExpenseLogo } from '@/components/ExpenseLogo';
import Link from 'next/link';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  ChartDataLabels,
);

const CATEGORY_COLORS: Record<string, string> = {
  IA: '#c3423f',
  Coche: '#d4956a',
  Streaming: '#4f9d69',
  Ocio: '#211a1e',
  Comida: '#c3423f',
  Hogar: '#8a8588',
  Salud: '#4f9d69',
  Otros: '#8a8588',
};

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
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ];

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  function periodBadge(period: string): string {
    switch (period) {
      case 'monthly':
        return '/mo';
      case 'quarterly':
        return '/3mo';
      case 'semi-annual':
        return '/6mo';
      case 'annual':
        return '/yr';
      case 'one-time':
        return 'once';
      default:
        return '';
    }
  }

  if (loading) {
    return (
      <div className="grid-layout">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton h-40" />
          </div>
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

  // ── Derived values ──────────────────────────────────────────────
  const categoryTotal = stats.byCategory.reduce((s, c) => s + c.total, 0);

  // ── Chart 1: Doughnut by Category ───────────────────────────────
  const doughnutData = {
    labels: stats.byCategory.map((c) => c.category),
    datasets: [
      {
        data: stats.byCategory.map((c) => c.total),
        backgroundColor: stats.byCategory.map(
          (c) => CATEGORY_COLORS[c.category] || '#6b7280',
        ),
        borderWidth: 2,
        borderColor: 'transparent',
      },
    ],
  };

  const doughnutOptions = {
    cutout: '58%',
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#ffffff',
        font: { weight: 'bold' as const, size: 10 },
        textAlign: 'center' as const,
        display: (ctx: any) => {
          const value: number = ctx.dataset.data[ctx.dataIndex];
          return value / categoryTotal > 0.04; // hide < 4%
        },
        formatter: (value: number, ctx: any) => {
          const pct = ((value / categoryTotal) * 100).toFixed(1);
          return `${ctx.chart.data.labels[ctx.dataIndex]}\n€${value.toFixed(0)}\n${pct}%`;
        },
      },
    },
    maintainAspectRatio: false,
  };

  // ── Chart 2: Monthly Trend (Bar + Average Line) ─────────────────
  const barLabels = stats.byMonth.map((m) => {
    const parts = m.month.split('-');
    return monthNames[parseInt(parts[1]) - 1] + ' ' + parts[0].slice(2);
  });

  const barValues = stats.byMonth.map((m) => m.total);

  const average =
    barValues.length > 0
      ? barValues.reduce((s, v) => s + v, 0) / barValues.length
      : 0;

  // Current-month bar highlighted, others semi-transparent
  const barBackgrounds = stats.byMonth.map((m) =>
    m.month === currentMonthKey
      ? 'rgba(195, 66, 63, 0.9)'
      : 'rgba(195, 66, 63, 0.3)',
  );

  const barBorders = stats.byMonth.map((m) =>
    m.month === currentMonthKey ? '#c3423f' : 'transparent',
  );

  const barBorderWidths = stats.byMonth.map((m) =>
    m.month === currentMonthKey ? 2 : 0,
  );

  const isCurrentMonthInData = stats.byMonth.some(
    (m) => m.month === currentMonthKey,
  );

  const barChartData = {
    labels: barLabels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Gasto',
        data: barValues,
        backgroundColor: barBackgrounds,
        borderColor: barBorders,
        borderWidth: barBorderWidths,
        borderRadius: 4,
        order: 2,
        datalabels: {
          anchor: 'end' as const,
          align: 'end' as const,
          color: '#6b7280',
          font: { weight: 'bold' as const, size: 9 },
          formatter: (value: number) => `€${value.toFixed(0)}`,
        },
      },
      {
        type: 'line' as const,
        label: 'Promedio',
        data: Array(barLabels.length).fill(average),
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderDash: [6, 4] as number[],
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 0,
        order: 1,
        datalabels: { display: false },
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(26,26,46,0.95)',
        titleColor: '#e5e7eb',
        bodyColor: '#d1d5db',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.label === 'Promedio') {
              return `Promedio: €${average.toFixed(2)}`;
            }
            const diff = ctx.parsed.y - average;
            const sign = diff >= 0 ? '+' : '';
            return [
              `Total: €${ctx.parsed.y.toFixed(2)}`,
              `${sign}€${diff.toFixed(2)} vs promedio`,
            ];
          },
        },
      },
      datalabels: {
        display: false, // per-dataset override above
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(107,114,128,0.12)' },
        ticks: {
          color: '#9ca3af',
          font: { size: 10 },
          callback: (value: string | number) => {
            if (typeof value === 'number') return `€${value}`;
            return value;
          },
        },
      },
    },
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Monthly Total Hero */}
      <div className="text-center py-6">
        <p className="text-sm text-[var(--text-muted)] uppercase tracking-wider">
          This Month
        </p>
        <p
          className="text-5xl font-bold mt-2"
          style={{ color: 'var(--accent)' }}
        >
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
        {/* ── By Category (Doughnut + Summary) ── */}
        <div className="card">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            By Category
          </h2>
          {stats.byCategory.length > 0 ? (
            <>
              <div
                className="flex items-center justify-center"
                style={{ height: 240 }}
              >
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>

              {/* Summary list below chart */}
              <div className="mt-4 space-y-1.5">
                {stats.byCategory.map((cat) => {
                  const pct = ((cat.total / categoryTotal) * 100).toFixed(1);
                  return (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[cat.category] || '#6b7280',
                          }}
                        />
                        <span className="font-medium text-[var(--text-primary)]">
                          {cat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[var(--text-muted)] w-10 text-right">
                          {pct}%
                        </span>
                        <span className="font-semibold text-[var(--text-primary)] w-20 text-right">
                          €{cat.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              No data yet
            </p>
          )}
        </div>

        {/* ── Monthly Trend (Bar + Average Line) ── */}
        <div className="card">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Monthly Trend
          </h2>
          {stats.byMonth.length > 0 ? (
            <div>
              <div style={{ height: 240 }}>
                <Chart type="bar" data={barChartData} options={barChartOptions} />
              </div>

              {/* Legend / summary row */}
              <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[rgba(195,66,63,0.3)] inline-block" />
                    Gasto mensual
                  </span>
                  {isCurrentMonthInData && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-[#c3423f] inline-block" />
                      Mes actual
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-4 inline-block"
                      style={{
                        borderTop: '2px dashed #ef4444',
                        height: 0,
                        verticalAlign: 'middle',
                      }}
                    />
                    Promedio: €{average.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">
              No data yet
            </p>
          )}
        </div>
      </div>

      {/* Top Subscriptions */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
          Top Subscriptions
        </h2>
        {stats.topExpenses.length > 0 ? (
          <div className="space-y-3">
            {stats.topExpenses.map((exp, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
              >
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
                  <span className="text-sm font-semibold block">
                    €{exp.total.toFixed(2)}
                  </span>
                  {exp.period !== 'one-time' && (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      ~€{exp.effectiveMonthly.toFixed(2)}/mo
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            No subscriptions tracked yet.
          </p>
        )}
      </div>

      {/* Upcoming Payments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Upcoming (7 days)
          </h2>
          {stats.upcomingPayments.length > 0 && (
            <span
              className="badge"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            >
              {stats.upcomingPayments.length}
            </span>
          )}
        </div>
        {stats.upcomingPayments.length > 0 ? (
          <div className="space-y-3">
            {stats.upcomingPayments.map((p) => (
              <Link
                key={p.id}
                href={`/edit/${p.id}`}
                className="flex items-center justify-between hover:bg-[var(--bg-secondary)] -mx-2 px-2 sm:-mx-4 sm:px-4 py-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ExpenseLogo name={p.name} category={p.category} />
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {p.date.split('-').reverse().join('/')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CategoryBadge category={p.category} />
                  {p.period !== 'monthly' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                      {periodBadge(p.period)}
                    </span>
                  )}
                  <span className="font-semibold text-sm">
                    €{p.amount.toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            No upcoming payments.
          </p>
        )}
      </div>
    </div>
  );
}
