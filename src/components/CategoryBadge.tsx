const categoryColors: Record<string, string> = {
  IA: '#8b5cf6',
  Coche: '#f59e0b',
  Streaming: '#ef4444',
  Ocio: '#10b981',
  Comida: '#f97316',
  Hogar: '#6366f1',
  Salud: '#ec4899',
  Otros: '#6b7280',
};

export function CategoryBadge({ category }: { category: string }) {
  const color = categoryColors[category] || '#6b7280';
  return (
    <span className="badge" style={{ backgroundColor: `${color}18`, color }}>
      <span className="badge-dot" style={{ backgroundColor: color }} />
      {category}
    </span>
  );
}

export function getCategoryColor(category: string): string {
  return categoryColors[category] || '#6b7280';
}
