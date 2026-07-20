# nglab — Design System & Architecture Master

> *Version: 1.0.0 — canonical*
> *Last updated: 2026-07-20*
> *Scope: All nglab PWA applications*
> *Author: Nacho Garrigues (natxio) & nglab engineering*

---

## Table of Contents

1. [Philosophy & Foundations](#1-philosophy--foundations)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Spacing & Layout](#4-spacing--layout)
5. [Shapes & Elevation](#5-shapes--elevation)
6. [Component Library](#6-component-library)
7. [Navigation Architecture](#7-navigation-architecture)
8. [Next.js Ecosystem Standards](#8-nextjs-ecosystem-standards)
9. [PWA Requirements & Configuration](#9-pwa-requirements--configuration)
10. [Do's and Don'ts](#10-dos-and-donts)

---

## 1. Philosophy & Foundations

### 1.1 Mobile-First, PWA-First

Every nglab application starts on a 375px-wide phone screen. Desktop layouts are enhancements — never the baseline. This is non-negotiable.

**Rules:**
- **CSS media queries use `min-width`**, never `max-width`. Mobile styles are the unqualified defaults; breakpoints *add* layout, they don't *subtract* clutter from desktop.
- **Touch targets ≥ 44×44px** for every interactive element. Lucide icons at 16–24px must live inside a 44px hit box (or be wrapped in a `min-w-[44px] min-h-[44px]` container).
- **Scroll containers, not page scroll:** Cards, lists, and chip rows scroll locally. The page itself should finish at the viewport bottom — avoid long-scroll layouts on mobile.
- **The bottom 48px of the viewport belong to navigation**, not content. Every layout must reserve that zone.
- **All apps are installable PWAs** from day one. Offline-first thinking begins in the architecture phase, not as a retrofit.

### 1.2 PWA-First Mindset

A PWA is not a "website wrapped in a manifest." It is a native-feeling application delivered through the browser. Every design decision — nav, loading states, transition animations, data persistence — must pass the test: *"Does this feel native on iOS and Android?"*

---

## 2. Color System

### 2.1 Core Palette (nglab Brand)

| Token | Hex | Name | Role |
|---|---|---|---|
| `--ngl-accent` | `#c3423f` | Tomato Jam | Primary actions, active states, key visual anchors |
| `--ngl-accent-hover` | `#a83633` | Dark Tomato Jam | Hover / pressed states |
| `--ngl-bg` | `#f0edee` | Platinum | Page background |
| `--ngl-bg-alt` | `#e6e2e3` | Dark Platinum | Secondary surfaces, skeleton loaders |
| `--ngl-surface` | `#ffffff` | White | Cards, modals, elevated containers |
| `--ngl-ink` | `#211a1e` | Shadow Grey | Primary text |
| `--ngl-ink-secondary` | `#4a4548` | Mid Shadow Grey | Secondary text, metadata |
| `--ngl-ink-muted` | `#8a8588` | Light Shadow Grey | Placeholders, disabled text |
| `--ngl-border` | `#d8d3d5` | Platinum Grey | Borders, dividers |
| `--ngl-success` | `#4f9d69` | Shamrock | Positive feedback, validation |
| `--ngl-black` | `#000000` | Black | Maximum contrast, terminal backgrounds |

### 2.2 Semantic Color Usage

- **Tomato Jam** must be the *only* warm, saturated color in the UI. No competing reds, oranges, or pinks. It draws the eye to exactly one place per screen.
- **Platinum** is the default background. It is warm (not cold gray), slightly off-white, and creates an approachable, human feel.
- **Shadow Grey** replaces pure black for text. Pure black (`#000`) is reserved for code blocks, terminal panels, and edge cases requiring maximum contrast.
- **Shamrock** is exclusively for success states. Never use it as decoration. If you need a secondary accent, derive a tint from the palette — don't introduce new saturated hues.

### 2.3 Dark Mode

*Not supported in v1.0.* All nglab apps are light-mode-only. The palette is designed for a white-to-warm-gray background with dark ink. If dark mode is added in a future version, it must use the same token names mapped to dark-appropriate values — never a separate color system.

---

## 3. Typography System

### 3.1 Font Stack

```
"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif
```

- **Headlines:** Inter, weight 600–700
- **Body:** Inter, weight 400
- **Monospace / Code:** `"JetBrains Mono", "Fira Code", "Consolas", monospace`
- **Terminal / Data labels:** `"JetBrains Mono"`, weight 400, letter-spacing `0.08em`

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display` | 2.5rem (40px) | 700 | 1.2 | Hero numbers, dashboard KPIs |
| `headline` | 1.25rem (20px) | 600 | 1.4 | Page titles |
| `title` | 1rem (16px) | 600 | 1.5 | Card titles, section headers |
| `body` | 0.875rem (14px) | 400 | 1.5 | Primary body text, form labels |
| `body-sm` | 0.75rem (12px) | 400 | 1.5 | Secondary text, metadata |
| `caption` | 0.625rem (10px) | 400 | 1.4 | Badges, tiny labels, helper text |
| `mono` | 0.75rem (12px) | 400 | 1.6 | Code, terminal, data values |

### 3.3 Typography Rules

- Line height is always unitless (1.2–1.6). Never use fixed `px` line heights.
- Letter spacing: `-0.025em` on headlines, `0` on body, `0.08em` on mono.
- Text truncation: use `truncate` (Tailwind) on any text that might overflow its container. Never allow text to break layout.

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `space-xs` | 4px (0.25rem) | Icon gaps, tight inline spacing |
| `space-sm` | 8px (0.5rem) | Chip gaps, form row gaps |
| `space-md` | 16px (1rem) | Card padding, section gaps |
| `space-lg` | 24px (1.5rem) | Page padding, card stacks |
| `space-xl` | 32px (2rem) | Hero spacing, major section breaks |
| `space-2xl` | 48px (3rem) | Page-level vertical breathing room |

### 4.2 Layout Grid

- **Max content width:** `max-w-5xl` (1024px) for content-heavy apps. Narrower apps may use `max-w-lg` (512px) or `max-w-md` (448px).
- **Page padding:** `px-4` (16px) on mobile, `px-6` (24px) on desktop.
- **Bottom padding on mobile:** `pb-[calc(3rem+env(safe-area-inset-bottom))]` to clear the bottom nav bar.
- **Top padding:** `pt-4` on mobile (below status bar), `pt-6` on desktop.

### 4.3 Breakpoints (Tailwind Defaults)

| Breakpoint | Min Width | Behavior |
|---|---|---|
| `(default)` | 0px | Mobile portrait (1 column, bottom nav, full-width cards) |
| `sm` | 640px | Tablet portrait → top nav appears, 2-col grids |
| `md` | 768px | Tablet landscape → 3-col grids possible |
| `lg` | 1024px | Desktop → wider content, sidebar layouts |
| `xl` | 1280px | Large desktop |

---

## 5. Shapes & Elevation

### 5.1 Border Radius

| Token | Value | Usage |
|---|---|---|
| `rounded-none` | 0 | Terminal panels, monospace chips |
| `rounded-sm` | 4px | Buttons, inputs, small controls |
| `rounded-md` | 6px | Cards, modals |
| `rounded-lg` | 8px | Large cards, dashboard panels |
| `rounded-full` | 9999px | Pills, badges, avatars |

### 5.2 Elevation & Depth

nglab interfaces are **flat by default**. Depth is communicated through:
1. **Borders** (1px, `--ngl-border`) — primary structural separator.
2. **Background contrast** — cards are `--ngl-surface` (white) on `--ngl-bg` (Platinum).
3. **Backdrop blur** (`backdrop-blur-md`) — for floating bars (bottom nav, top nav).

Shadows are **discouraged** in v1.0. If a component needs elevation (modal, tooltip), use `shadow-sm` or `shadow-md` with near-black opacity ≤ 10%.

---

## 6. Component Library

### 6.1 Buttons

| Variant | Class | Background | Text | Border | Usage |
|---|---|---|---|---|---|
| Primary | `btn-primary` | `var(--ngl-accent)` | `var(--ngl-bg)` | none | Main CTA |
| Secondary | `btn-secondary` | `var(--ngl-bg-alt)` | `var(--ngl-ink)` | `var(--ngl-border)` | Auxiliary action |
| Danger | `btn-danger` | `var(--ngl-accent)` | white | none | Destructive action |

**Specs:** `h-10` (40px), padding: `0.5rem 1rem`, border-radius: `6px`, font: `body` weight 500, transition: opacity 150ms.

### 6.2 Cards

```css
.card {
  background: var(--ngl-surface);
  border: 1px solid var(--ngl-border);
  border-radius: 6px;
  padding: 1.25rem;
}
```

Cards are the primary content container. They stack vertically on mobile and flow into grids on desktop. Cards never have shadows.

### 6.3 Inputs & Selects

**With icon (96% of cases):**

```
<div className="relative">
  <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ngl-ink-muted)] pointer-events-none" />
  <input className="input" />
</div>
```

**CSS spec:**
```css
.input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  border: 1px solid var(--ngl-border);
  border-radius: 6px;
  background: var(--ngl-surface);
  color: var(--ngl-ink);
  font-size: 0.875rem;
  box-sizing: border-box;
}
.input:focus { border-color: var(--ngl-accent); }
```

**Without icon:** Use `padding: 0.625rem 0.75rem` (symmetrical) via inline style or utility class.

**Selects** additionally set `appearance: none` with a custom inline SVG chevron in `background-image`, positioned at `right 0.75rem center`.

### 6.4 Badges / Chips / Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  box-sizing: border-box;
}
```

- **Color:** Use the category color at 10% opacity for the background, and the solid color for the text and a 6px dot indicator.
- **Active state:** `border-2` with the accent color (never `ring-2` — rings overflow and get clipped by scroll containers).

### 6.5 Charts (Chart.js)

- Use `chart.js` v4 + `react-chartjs-2` + `chartjs-plugin-datalabels`.
- **Doughnut:** cutout `58%`, data labels on segments > 4%, no border between segments.
- **Bar/Line:** data labels on each bar (€ values), current period highlighted, average line as a red dashed overlay.
- Colors must always come from the palette (category colors are the exception — see §2.2).

### 6.6 Loading States (Skeletons)

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--ngl-bg-alt) 25%,
    var(--ngl-border) 50%,
    var(--ngl-bg-alt) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 7. Navigation Architecture

### 7.1 Mobile: Bottom Navigation Bar

On screens < `sm` (640px), navigation is a **fixed bottom bar** with these properties:

- **Position:** `fixed bottom-0 left-0 right-0`, `z-50`
- **Height:** `h-12` (48px)
- **Background:** `var(--ngl-bg)` at 95% opacity + `backdrop-blur-md`
- **Top border:** `border-t-2` in `var(--ngl-accent)` (Tomato Jam)
- **Bottom inset:** `pb-[env(safe-area-inset-bottom)]` for notched devices
- **Items:** 3–5 icons, `size={24}`, centered vertically, no text labels
- **Active state:** full-height background at 10% accent opacity + text accent color
- **Inactive state:** `--ngl-ink-muted` color, no background

**Hamburger menus are forbidden on mobile for primary navigation.** A bottom bar is always the default. Hamburger menus may only be used for secondary actions (settings, filters, search) opened via a top-right icon.

### 7.2 Desktop: Top Navigation Bar

On screens ≥ `sm` (640px), navigation moves to a **sticky top bar**:

- **Position:** `sticky top-0 z-50`
- **Height:** `h-12` (48px)
- **Background:** solid `var(--ngl-bg)`, no blur
- **Bottom border:** `border-b` in `var(--ngl-border)`
- **Layout:** `flex items-center justify-between`, max-width matching content
- **Left:** Brand logo/name + optional product switcher
- **Right:** Text-labeled links (no icon-only mode on desktop)

### 7.3 Navigation State Management

- **Active route detection:** `usePathname()` from Next.js. Compare `pathname === href` for exact matches; for nested routes, use `pathname.startsWith(href)` with the parent excluded.
- **Persistent state:** no navigation state is stored in `localStorage`. URLs are the single source of truth. Deep links must resolve to the correct screen without intermediate redirects.
- **Back navigation:** `router.back()` — always prefer native back behavior. Override only when the back action would exit the app scope (e.g., from a modal back to the list).
- **Scroll restoration:** `router.push()` / `router.replace()` must preserve scroll position where possible. Use Next.js native scroll restoration.

---

## 8. Next.js Ecosystem Standards

### 8.1 Architecture

- **App Router only.** Pages Router is deprecated for new nglab projects.
- **All components are Server Components by default.** `"use client"` is added only when interactivity (state, effects, event handlers, browser APIs) requires it. This boundary is documented in the component file via a comment: `// client boundary — stateful form`.
- **Data fetching:** Server Components use `fetch()` directly (cached via Next.js). Client Components access data through Route Handlers (`/api/*`).
- **Route Handlers:** All API endpoints are defined in `app/api/`. Responses are JSON via `NextResponse.json()`. Request bodies are typed with TypeScript interfaces.

### 8.2 Directory Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (providers, fonts, PWA metadata)
│   ├── page.tsx            # Home / Dashboard
│   ├── globals.css         # Design tokens, utilities, component CSS
│   ├── (routes)/           # Route groups for logical sections
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── item/
│   │       ├── [id]/
│   │       │   ├── page.tsx
│   │       │   └── edit/
│   │       │       └── page.tsx
│   │       └── new/
│   │           └── page.tsx
│   └── api/
│       ├── items/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       └── stats/
│           └── route.ts
├── components/
│   ├── NavBar.tsx
│   ├── PinGate.tsx
│   └── ui/                 # Shared presentational components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── Badge.tsx
├── lib/
│   ├── db.ts               # Database client
│   ├── utils.ts            # Shared utilities
│   └── constants.ts        # App-wide constants
└── hooks/
    └── useMediaQuery.ts    # Client-only hooks
```

### 8.3 Database

- **SQLite via `better-sqlite3`** is the standard embedded database for all nglab apps.
- Database files live in `/opt/<app-name>/data/` on the server.
- Schema migrations are handled inline via `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN` guarded by try/catch (column already exists).
- **No ORM.** Raw SQL with parameterized queries. This is deliberate: it keeps the stack small, fast, and predictable.

### 8.4 Styling

- **Tailwind CSS v4** with `@import "tailwindcss"` in globals.css.
- Design tokens live in `:root {}` CSS custom properties inside `globals.css`.
- **No CSS-in-JS**, no CSS modules for new components. Tailwind utility classes + inline `style={{}}` for one-off overrides.
- Component CSS (`.card`, `.input`, `.badge`) is written in globals.css as regular CSS classes alongside Tailwind utilities.

### 8.5 Dependencies (Standard Stack)

| Package | Purpose |
|---|---|
| `next` | Framework |
| `react` / `react-dom` | UI |
| `better-sqlite3` | Database |
| `chart.js` + `react-chartjs-2` | Charts |
| `chartjs-plugin-datalabels` | Chart labels |
| `lucide-react` | Icons |
| `tailwindcss` | Styling |
| `typescript` | Type system |

---

## 9. PWA Requirements & Configuration

### 9.1 Manifest (`public/manifest.json`)

```json
{
  "name": "<App Display Name>",
  "short_name": "<Short Name>",
  "description": "<App description>",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#c3423f",
  "background_color": "#f0edee",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

- `theme_color` must match `--ngl-accent` (Tomato Jam).
- `background_color` must match `--ngl-bg` (Platinum).
- Icons at 192×192 and 512×512, plus a 180×180 `apple-touch-icon.png` for iOS.

### 9.2 Viewport Meta (in layout.tsx)

```tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#c3423f",
};
```

- `userScalable: false` is enforced — accidental zoom breaks the mobile experience.
- `viewportFit: "cover"` ensures the UI extends behind the notch on iOS.

### 9.3 Service Worker

- A basic SW must exist at `/public/sw.js` for installability.
- **Cache strategy (v1):** Network-first with cache fallback. Static assets (JS, CSS, icons) are cached on first load. API responses are NOT cached — data freshness is critical for expense/finance apps.
- **Offline:** The app must show a meaningful offline state (not a browser error). A cached shell renders the chrome + a "You're offline" message.
- **Push notifications:** Deferred to v2. Architecture must leave room for a `push` event listener in the SW.

### 9.4 Install Flow

- The browser's native install prompt triggers when:
  1. The manifest is valid.
  2. The SW is registered and active.
  3. The user has engaged with the site (at least one interaction).
- No custom "Install" button — rely on the browser's native prompt. If needed later, add a `beforeinstallprompt` listener in a client component.

---

## 10. Do's and Don'ts

### Do

- **Do** start every component with the mobile layout and layer desktop on top with `sm:` / `md:` / `lg:` prefixes.
- **Do** use `var(--ngl-accent)` for exactly one primary action per screen.
- **Do** keep cards flat — white background, 1px Platinum Grey border, 6px radius.
- **Do** use bottom nav bars on mobile, top nav bars on desktop. Never mix the two on the same viewport.
- **Do** write raw SQL with parameterized queries. No ORM.
- **Do** prefix all Tailwind breakpoints with `sm:`, `md:`, `lg:` to build UP from mobile.
- **Do** verify touch targets are ≥ 44×44px on every interactive element.
- **Do** set `box-sizing: border-box` on all custom CSS classes (`.input`, `.badge`, `.select`).
- **Do** respect `env(safe-area-inset-bottom)` on fixed-position elements.

### Don't

- **Don't** introduce new saturated colors beyond the palette. If you need differentiation, use tint variants or opacity of existing palette colors.
- **Don't** use `hamburger menus` for primary navigation on mobile.
- **Don't** use `ring-2` on elements inside `overflow-x: auto` containers — rings render outside the box and get clipped.
- **Don't** use CSS `background-color` directly — always use CSS custom properties so the system can be themed later.
- **Don't** set max-scale < 1 or allow zoom. `userScalable: false` is mandatory on PWAs.
- **Don't** use shadows (`box-shadow`) for elevation unless absolutely necessary. Prefer border and background contrast.
- **Don't** ship a PWA without a valid manifest, SW registration, and app icons at all required sizes.
- **Don't** use hardcoded hex values in components. If a color must be inline, reference the CSS variable name in a comment.

---

> **nglab Design System v1.0.0** — canonical as of 2026-07-20.
> Every new nglab PWA starts here. When a component, pattern, or rule is updated, this document is the single source of truth that must be edited first.
