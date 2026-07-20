# SubTrack — Design System (nglab)

> **Brand:** nglab  
> **App:** SubTrack — Subscription & Expense Tracker  
> **Platform:** PWA (Progressive Web App)  
> **Framework:** Next.js 16 + Tailwind CSS 4 + TypeScript  
> **Database:** SQLite (better-sqlite3)  
> **Charts:** Chart.js 4 + react-chartjs-2 + chartjs-plugin-datalabels  

---

## 1. Brand Identity (nglab)

### 1.1 Color Palette

| Token | Hex | Nombre | Uso |
|-------|-----|--------|-----|
| `--accent` | `#c3423f` | **Tomato Jam** | Acciones primarias, botones, enlaces activos, gráficos |
| `--accent-hover` | `#a83633` | Tomato Jam (hover) | Hover de botones primarios |
| `--bg-primary` | `#f0edee` | **Platinum** | Fondo de página |
| `--bg-secondary` | `#e6e2e3` | Platinum oscuro | Fondos secundarios, superficies elevadas |
| `--bg-card` | `#ffffff` | Blanco | Fondos de cards |
| `--text-primary` | `#211a1e` | **Shadow Grey** | Texto principal |
| `--text-secondary` | `#4a4548` | Shadow Grey medio | Texto secundario |
| `--text-muted` | `#8a8588` | Shadow Grey claro | Texto sutil, placeholders |
| `--border-color` | `#d8d3d5` | Gris platino | Bordes, separadores |
| `--success` | `#4f9d69` | **Shamrock** | Estados de éxito, validación |

### 1.2 Category Colors

| Categoría | Hex |
|-----------|-----|
| IA | `#c3423f` |
| Coche | `#d4956a` |
| Streaming | `#4f9d69` |
| Ocio | `#211a1e` |
| Comida | `#b53a37` |
| Hogar | `#8a8588` |
| Salud | `#3d8a55` |
| Otros | `#6a6568` |

### 1.3 Typography

- **Font stack:** Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Body:** 0.875rem (14px)
- **Small / badges:** 0.75rem (12px)
- **Headings:** Bold, tracking-tight
- **Hero numbers:** 3rem (48px), bold

### 1.4 Borders & Radius

| Elemento | Valor |
|----------|-------|
| Cards | 8px radius |
| Inputs | 6px radius |
| Badges | 9999px (pill) |
| Buttons | 6px radius |
| Navbar top border | 2px solid #c3423f |

---

## 2. Layout

### 2.1 Desktop (>640px)

```
┌─────────────────────────────────────────┐
│  Top NavBar (sticky, h-12)              │
│  [SubTrack logo]  [Dashboard] [Expenses]│
├─────────────────────────────────────────┤
│                                         │
│  Main content (max-w-5xl, mx-auto)      │
│  px-4 py-6 pb-6 + safe-area            │
│                                         │
└─────────────────────────────────────────┘
```

- **Top NavBar:** Sticky, full width, brand name + links + no theme toggle
- **Content:** Centered, max 1024px, responsive padding
- **Charts:** 2-column grid on desktop (`md:grid-cols-2`)

### 2.2 Mobile (<640px)

```
┌─────────────────────────────────────────┐
│  Top NavBar (hidden)                    │
├─────────────────────────────────────────┤
│  Main content                           │
│  pb-[3rem + safe-area]                  │
│                                         │
├─────────────────────────────────────────┤
│  Bottom NavBar (fixed, h-12)            │
│  [🏠] [📋] [+] [⚙️]  ← solo iconos    │
│  border-t-2 Tomato Jam                  │
└─────────────────────────────────────────┘
```

- **Bottom NavBar:** Fixed, icon-only, full width borde a borde
- **Icons:** 24px, activo con fondo Tomato Jam al 10% de opacidad
- **Border top:** 2px Tomato Jam
- **Safe area:** `env(safe-area-inset-bottom)` para notches

---

## 3. Components

### 3.1 Buttons

| Variant | Clase | Estilo |
|---------|-------|--------|
| Primary | `btn btn-primary` | bg Tomato Jam, text Platinum, 6px radius |
| Secondary | `btn btn-secondary` | bg secondary, border, text primary |
| Danger | `btn btn-danger` | bg #c3423f, text Platinum |

### 3.2 Inputs & Selects

**Con icono (left):**
```html
<div class="relative">
  <Icon size={16} class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
  <input class="input" /> <!-- padding-left: 2.25rem -->
</div>
```

**Sin icono:**
```html
<input class="input" style="padding: .625rem .75rem" />
<!-- padding simétrico -->
```

**Select con chevron custom:**
```css
.select {
  appearance: none;
  background-image: url("chevron-down.svg"); /* Tomato Jam grey */
  background-position: right 0.75rem center;
}
```

### 3.3 Cards

```css
.card {
  background: var(--bg-card);     /* white */
  border: 1px solid var(--border-color); /* #d8d3d5 */
  border-radius: 8px;
  padding: 1.25rem;
}
```

### 3.4 Badges / Category Tags

```html
<span class="badge" style="background: ${color}18; color: ${color}">
  <span class="badge-dot" style="background: ${color}" />
  {category}
</span>
```

- Fondo: color al 10% de opacidad (`${color}18`)
- Texto: color sólido
- Dot: círculo de 6px con el color sólido
- `box-sizing: border-box` para que border no desborde

### 3.5 Bottom NavBar (mobile)

- Fixed, full width, backdrop-blur-md
- h-12, 4 iconos de 24px
- Activo: `bg-[var(--accent)]/10 text-[var(--accent)]`
- Inactivo: `text-[var(--text-muted)]`
- `border-t-2 border-[var(--accent)]`
- `pb-[env(safe-area-inset-bottom)]` para notches

### 3.6 PIN Gate

- Full-screen modal con Lock icon
- Input centrado con `text-center text-2xl tracking-widest`
- Auto-verifica al alcanzar la longitud exacta del PIN (guardada en backend)
- Si falla → se vacía el input
- Fallback: botón Unlock para verificación manual

---

## 4. Dashboard Charts

### 4.1 By Category (Doughnut)

- Chart.js Doughnut con `cutout: '58%'`
- Data labels: nombre, € y % directamente sobre cada segmento (>4%)
- Labels blancas con fuente bold
- Colores por categoría (ver sección 1.2)
- Leyenda interactiva debajo: color dot + nombre + % + €

### 4.2 Monthly Trend (Bar + Average Line)

- Barras con data labels (€ sobre cada barra)
- **Mes actual:** opaco (90%), con borde
- **Meses anteriores:** semi-transparentes (30%)
- **Línea de promedio:** roja discontinua (`#ef4444`, dash: [6,4])
- Tooltip detallado: total + diferencia vs promedio
- Eje Y con formato `€`

---

## 5. Responsive Breakpoints

| Breakpoint | Ancho | Comportamiento |
|------------|-------|----------------|
| Mobile (<640px) | Default | Bottom navbar, full-width filters, 1-col charts |
| Desktop (≥640px) | `sm:` | Top navbar, 3-col filters, 2-col charts |

### 5.1 Date Inputs on Mobile

| Pantalla | Input | Ancho móvil |
|----------|-------|-------------|
| Expenses | Calendario filtro | `width: 84.4%` |
| Add/Edit | Fecha | `width: 86%` |

En desktop ambos vuelven a `width: 100%` via `sm:!w-full`.

---

## 6. PWA Configuration

### 6.1 Icons

| Tamaño | Propósito |
|--------|-----------|
| 32×32 | favicon.ico |
| 180×180 | apple-touch-icon.png (iOS) |
| 192×192 | icon-192.png (PWA) |
| 512×512 | icon-512.png (PWA + maskable) |

### 6.2 Manifest

```json
{
  "theme_color": "#c3423f",
  "background_color": "#f0edee",
  "display": "standalone",
  "orientation": "portrait-primary"
}
```

### 6.3 Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
```

---

## 7. API Routes

| Método | Ruta | Función |
|--------|------|---------|
| GET | `/api/expenses` | Listar expenses (filtro por month/category) |
| POST | `/api/expenses` | Crear expense |
| GET | `/api/expenses/[id]` | Obtener expense |
| PATCH | `/api/expenses/[id]` | Actualizar expense |
| DELETE | `/api/expenses/[id]` | Eliminar expense |
| GET | `/api/stats` | Estadísticas del dashboard |
| GET | `/api/pin` | Obtener estado y longitud del PIN |
| POST | `/api/pin` | Verificar o establecer PIN |
| GET | `/api/logo` | Buscar logo por nombre |
| PUT | `/api/logo` | Guardar logo personalizado |

---

## 8. Database Schema

```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('IA','Coche','Streaming','Ocio','Comida','Hogar','Salud','Otros')),
  period TEXT NOT NULL DEFAULT 'monthly' CHECK(period IN ('monthly','quarterly','semi-annual','annual','one-time')),
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- PIN hash (SHA-256) + PIN length
```

---

## 9. Security

- **PIN:** hash SHA-256, almacenado en SQLite
- **PIN length:** guardado aparte para auto-verificación instantánea
- **Session:** `sessionStorage` para mantener sesión desbloqueada

---

## 10. Future Considerations

- [ ] Modo offline con Service Worker caching
- [ ] Sincronización entre dispositivos
- [ ] Exportación CSV/PDF
- [ ] Notificaciones push de pagos próximos
- [ ] Múltiples monedas
- [ ] Presupuestos mensuales por categoría
- [ ] Gráfico de proyección anual
- [ ] Modo landscape en tablet

---

> **nglab** — Built with ❤️ and Tomato Jam
