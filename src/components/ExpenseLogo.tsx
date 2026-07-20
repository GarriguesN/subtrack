'use client';

import { useEffect, useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { getCategoryColor } from './CategoryBadge';

const categoryInitials: Record<string, string> = {
  IA: '🤖',
  Coche: '🚗',
  Streaming: '📺',
  Ocio: '🎮',
  Comida: '🍕',
  Hogar: '🏠',
  Salud: '💊',
  Otros: '📦',
};

export function ExpenseLogo({ name, category }: { name: string; category?: string }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!name.trim()) { setLoaded(true); return; }

    // First try localStorage (fast)
    const cached = localStorage.getItem(`logo:${name}`);
    if (cached) {
      setLogoUrl(cached);
      setLoaded(true);
      // But ALSO fetch from server in background to get latest
      fetch(`/api/logo?name=${encodeURIComponent(name.trim())}`)
        .then(r => r.json())
        .then(data => {
          if (data.logo && data.logo !== cached) {
            setLogoUrl(data.logo);
            localStorage.setItem(`logo:${name}`, data.logo);
          }
        })
        .catch(() => {});
      return;
    }

    // Not in localStorage, fetch from API
    fetch(`/api/logo?name=${encodeURIComponent(name.trim())}`)
      .then(r => r.json())
      .then(data => {
        if (data.logo) {
          setLogoUrl(data.logo);
          localStorage.setItem(`logo:${name}`, data.logo);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [name]);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        className="w-7 h-7 rounded object-contain"
        onError={(e) => { setLogoUrl(null); (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }

  // Fallback: show category-colored initial
  const initial = name.charAt(0).toUpperCase();
  const bgColor = category ? getCategoryColor(category) : '#6b7280';

  return (
    <div
      className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: bgColor }}
    >
      {initial}
    </div>
  );
}
