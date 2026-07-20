'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Car, Film, Gamepad2, Pizza, Home, HeartPulse, Package, Search, Loader2, X, Calendar, CalendarRange, RefreshCw, CalendarDays, Clock, Euro } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  IA: <Brain size={20} />,
  Coche: <Car size={20} />,
  Streaming: <Film size={20} />,
  Ocio: <Gamepad2 size={20} />,
  Comida: <Pizza size={20} />,
  Hogar: <Home size={20} />,
  Salud: <HeartPulse size={20} />,
  Otros: <Package size={20} />,
};

const categories = [
  { id: 'IA', label: 'IA' },
  { id: 'Coche', label: 'Coche' },
  { id: 'Streaming', label: 'Streaming' },
  { id: 'Ocio', label: 'Ocio' },
  { id: 'Comida', label: 'Comida' },
  { id: 'Hogar', label: 'Hogar' },
  { id: 'Salud', label: 'Salud' },
  { id: 'Otros', label: 'Otros' },
];

const periods = [
  { id: 'monthly', label: 'Monthly', icon: <Calendar size={16} /> },
  { id: 'quarterly', label: 'Quarterly', icon: <CalendarRange size={16} /> },
  { id: 'semi-annual', label: 'Semi-annual', icon: <RefreshCw size={16} /> },
  { id: 'annual', label: 'Annual', icon: <CalendarDays size={16} /> },
  { id: 'one-time', label: 'One-time', icon: <Clock size={16} /> },
];

export default function AddExpensePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [allLogos, setAllLogos] = useState<string[]>([]);
  const [searchingLogo, setSearchingLogo] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);

  // Save selected logo to both localStorage and server
  async function selectLogo(url: string) {
    setLogoUrl(url);
    localStorage.setItem(`logo:${name}`, url);
    setShowLogoModal(false);
    // Persist to server
    try {
      await fetch('/api/logo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), logoUrl: url }),
      });
    } catch {}
  }

  // Auto-search logo when name changes (debounced)
  useEffect(() => {
    if (!name.trim()) { setLogoUrl(''); setAllLogos([]); return; }
    const timer = setTimeout(async () => {
      setSearchingLogo(true);
      try {
        const res = await fetch(`/api/logo?name=${encodeURIComponent(name.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setLogoUrl(data.logo || '');
          setAllLogos(data.logos || []);
        }
      } catch {}
      setSearchingLogo(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Name is required'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('Valid amount required'); return; }
    if (!category) { setError('Select a category'); return; }
    if (!date) { setError('Select a date'); return; }

    setSaving(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          amount: parseFloat(amount),
          period,
          category,
          date,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">Add Expense</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input w-full"
              placeholder="e.g. Netflix, Spotify, OpenCode"
              autoFocus
              style={{ paddingLeft: '2.5rem' }}
            />
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => allLogos.length > 0 && setShowLogoModal(true)}
              title={allLogos.length > 0 ? `Choose logo (${allLogos.length} available)` : 'Searching logo...'}
            >
              {searchingLogo ? (
                <Loader2 size={16} className="animate-spin text-[var(--text-muted)]" />
              ) : logoUrl ? (
                <img src={logoUrl} alt="" className="w-5 h-5 rounded object-contain hover:opacity-80 transition-opacity"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <Search size={16} className="text-[var(--text-muted)]" />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount (€)</label>
          <div className="relative">
            <Euro
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="input"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Billing Period</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {periods.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-sm transition-all ${
                  period === p.id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                    : 'border-[var(--border-color)] hover:border-[var(--accent)]'
                }`}
              >
                <span className="text-[var(--accent)]">{p.icon}</span>
                <span className="text-xs font-medium leading-tight text-center">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition-all ${
                  category === cat.id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                    : 'border-[var(--border-color)] hover:border-[var(--accent)]'
                }`}
              >
                <span className="text-[var(--accent)]">{categoryIcons[cat.id]}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Date</label>
          <div className="relative">
            <Calendar
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input min-h-[80px] resize-y"
            style={{ padding: '.625rem .75rem' }}
            placeholder="Any additional info..."
          />
        </div>

        <div className="flex gap-3 pt-2 pb-8 pb-[env(safe-area-inset-bottom)]">
          <button type="submit" disabled={saving} className="btn btn-primary flex-1 min-h-[44px]">
            {saving ? 'Saving...' : 'Save Expense'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary min-h-[44px]">
            Cancel
          </button>
        </div>
      </form>

      {/* Logo selection modal */}
      {showLogoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowLogoModal(false)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl max-w-sm w-full p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Select Logo</h3>
              <button onClick={() => setShowLogoModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-3">Choose a logo for &ldquo;{name}&rdquo;:</p>

            {/* Auto-found logos */}
            {allLogos.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {allLogos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => { selectLogo(url); }}
                    className={`flex items-center justify-center p-2 rounded-lg border transition-all ${
                      url === logoUrl
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]'
                        : 'border-[var(--border-color)] hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <img src={url} alt={`Logo ${i + 1}`} className="w-8 h-8 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] mb-4">No logos found automatically. Paste a URL below:</p>
            )}

            {/* Manual URL input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                className="input text-xs flex-1"
                style={{ padding: '.625rem .75rem' }}
                id="manual-logo-url"
              />
              <button
                onClick={() => {
                  const input = document.getElementById('manual-logo-url') as HTMLInputElement;
                  const url = input?.value?.trim();
                  if (url) selectLogo(url);
                }}
                className="btn btn-primary text-xs"
              >
                Use
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
