'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, Loader2, ChevronDown, X } from 'lucide-react';

interface LogoPickerProps {
  name: string;
  onLogoSelect?: (url: string) => void;
}

export default function LogoPicker({ name, onLogoSelect }: LogoPickerProps) {
  const [logoUrl, setLogoUrl] = useState('');
  const [allLogos, setAllLogos] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-search logo when name changes (debounced)
  useEffect(() => {
    if (!name.trim()) { setLogoUrl(''); setAllLogos([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/logo?name=${encodeURIComponent(name.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setLogoUrl(data.logo || '');
          setAllLogos(data.logos || []);
        }
      } catch {}
      setSearching(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [name]);

  // Close modal on click outside
  useEffect(() => {
    if (!showModal) return;
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showModal]);

  function selectLogo(url: string) {
    setLogoUrl(url);
    setShowModal(false);
    onLogoSelect?.(url);
  }

  const hasLogos = allLogos.length > 0;

  return (
    <>
      <div className="relative">
        <input
          type="text"
          value={name}
          readOnly
          className="input w-full pr-10"
          placeholder="Expense name"
        />
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          onClick={() => hasLogos && setShowModal(!showModal)}
        >
          {searching ? (
            <Loader2 size={16} className="animate-spin text-[var(--text-muted)]" />
          ) : logoUrl ? (
            <div className="relative flex items-center gap-1">
              <img src={logoUrl} alt="" className="w-5 h-5 rounded object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              {hasLogos && <ChevronDown size={12} className="text-[var(--text-muted)]" />}
            </div>
          ) : (
            <Search size={16} className="text-[var(--text-muted)]" />
          )}
        </div>
      </div>

      {/* Modal with alternatives */}
      {showModal && hasLogos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div ref={modalRef} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl max-w-sm w-full p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Select Logo</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mb-4">Choose the best logo for &quot;{name}&quot;:</p>
            <div className="grid grid-cols-3 gap-3">
              {allLogos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => selectLogo(url)}
                  className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                    url === logoUrl
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)]'
                      : 'border-[var(--border-color)] hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <img src={url} alt={`Logo ${i + 1}`} className="w-10 h-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>';
                    }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
