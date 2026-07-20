'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Lock, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [pinConfigured, setPinConfigured] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  useEffect(() => {
    fetch('/api/pin')
      .then(r => r.json())
      .then(data => setPinConfigured(data.configured))
      .catch(() => {});
  }, []);

  async function handleSetPin(e: React.FormEvent) {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (newPin.length < 4 || newPin.length > 10) {
      setPinError('PIN must be 4-10 characters');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }

    try {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', pin: newPin }),
      });
      if (res.ok) {
        setPinConfigured(true);
        setPinSuccess('PIN updated successfully');
        setShowPinForm(false);
        setNewPin('');
        setConfirmPin('');
      } else {
        const data = await res.json();
        setPinError(data.error || 'Error saving PIN');
      }
    } catch {
      setPinError('Error saving PIN');
    }
  }

  async function handleRemovePin() {
    if (!confirm('Remove PIN protection?')) return;
    try {
      await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', pin: '' }),
      });
      setPinConfigured(false);
      setPinSuccess('PIN removed');
    } catch {
      setPinError('Error removing PIN');
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* PIN Protection */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Security</h2>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {pinConfigured ? <Lock size={16} className="text-[var(--accent)]" /> : <KeyRound size={16} className="text-[var(--text-muted)]" />}
            <div>
              <p className="text-sm font-medium">PIN Protection</p>
              <p className="text-xs text-[var(--text-muted)]">{pinConfigured ? 'PIN is set' : 'No PIN configured'}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowPinForm(!showPinForm); setPinError(''); setPinSuccess(''); }}
            className="btn btn-secondary text-xs"
          >
            {pinConfigured ? 'Change' : 'Set PIN'}
          </button>
        </div>

        {pinSuccess && <p className="text-xs text-[var(--success)] mb-3">{pinSuccess}</p>}
        {pinError && <p className="text-xs text-red-500 mb-3">{pinError}</p>}

        {showPinForm && (
          <form onSubmit={handleSetPin} className="space-y-3">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              className="input text-center text-lg tracking-widest"
              style={{ padding: '.625rem .75rem' }}
              placeholder="New PIN"
              maxLength={10}
              autoFocus
            />
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value)}
              className="input text-center text-lg tracking-widest"
              style={{ padding: '.625rem .75rem' }}
              placeholder="Confirm PIN"
              maxLength={10}
            />
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1">Save PIN</button>
              {pinConfigured && (
                <button type="button" onClick={handleRemovePin} className="btn btn-danger flex-1" title="Remove PIN">
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* About */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">About</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">App</span>
            <span>SubTrack</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Version</span>
            <span>2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Framework</span>
            <span>Next.js</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Database</span>
            <span>SQLite</span>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="card">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Help</h2>
        <div className="text-sm text-[var(--text-secondary)] space-y-2">
          <p>SubTrack helps you monitor your recurring subscriptions and expenses. Add expenses with categories to see spending patterns.</p>
          <p className="text-xs text-[var(--text-muted)]">All data is stored locally in SQLite on the server.</p>
        </div>
      </div>
    </div>
  );
}
