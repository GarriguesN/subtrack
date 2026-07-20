const categoryColors: Record<string, string> = {
  IA: '#c3423f',
  Coche: '#d4956a',
  Streaming: '#4f9d69',
  Ocio: '#211a1e',
  Comida: '#b53a37',
  Hogar: '#8a8588',
  Salud: '#3d8a55',
  Otros: '#6a6568',
};

export function CategoryBadge({ category }: { category: string }) {
  const color = categoryColors[category] || '#6a6568';
  return (
    <span className="badge" style={{ backgroundColor: `${color}18`, color }}>
      <span className="badge-dot" style={{ backgroundColor: color }} />
      {category}
    </span>
  );
}

export function getCategoryColor(category: string): string {
  return categoryColors[category] || '#6a6568';
}
