# nglab — Master Design System & PWA Architecture

> **version:** 1.0.0 — canonical
> **scope:** All nglab PWA applications
> **last updated:** 2026-07-20
> **authors:** Nacho Garrigues (natxio) & nglab engineering
> **license:** Internal — nglab team only

---

# 1. Philosophy & Foundations

## 1.1 Overview

nglab builds installable Progressive Web Applications that feel indistinguishable from native mobile apps. Every project starts on a 375px phone screen. Desktop layouts are enhancements — never the baseline. The design language is warm, minimal, and editorial: Tomato Jam commands attention, Platinum breathes space, and Shadow Grey provides structure without shouting. The overall mood is professional but approachable — serious software that doesn't take itself too seriously.

## 1.2 Mobile-First Mandate

Mobile-first is not a suggestion. It is the architectural constraint that governs every layout decision, every component spec, and every media query.

### Rules enforced at code review:

- **Media queries use `min-width` exclusively.** The default (unqualified) styles are mobile. Breakpoints add layout; they never strip it away. An element that appears on desktop but not mobile was added at a breakpoint — not hidden with `max-width`.
- **Touch targets are ≥ 44×44px.** Every interactive element — buttons, links, icons, chips — must occupy at minimum a 44×44px hit area. Lucide icons at 16–24px must be wrapped in a `min-w-[44px] min-h-[44px]` container or inherit that size from a parent flex item.
- **Scroll containment is local.** On mobile, the page body should not scroll. Cards, lists, and chip rows scroll within their own `overflow-x: auto` or `overflow-y: auto` containers. The benefit: fixed elements (bottom nav, action bars) stay pinned while content moves beneath them.
- **The bottom 48px belong to navigation.** No content may render beneath the bottom nav bar. Every root layout must reserve `pb-[calc(3rem+env(safe-area-inset-bottom))]` on mobile.
- **Safe areas are respected.** `env(safe-area-inset-*)` is applied to all fixed-position elements and the root app container.

## 1.3 PWA-First Mindset

A PWA is not a website wrapped in a manifest. It is a native-feeling application delivered through the browser. Every design decision — navigation patterns, loading states, transition animations, data persistence — must pass the test:

> *"If I installed this from the App Store, would it feel native on iOS and Android?"*

Concrete implications:
- **No page reloads.** Navigation is client-side via Next.js App Router. `router.push()` and `router.replace()` — never `window.location`.
- **No browser chrome.** `display: standalone` hides the URL bar. The app provides its own navigation.
- **Offline resilience.** A valid Service Worker caches the application shell. Without connectivity, the user sees the app chrome + an offline indicator — not a browser dinosaur.
- **Installable from day one.** Every new nglab project ships with a valid `manifest.json`, a registered Service Worker, and app icons at all required sizes before it reaches production.

---

# 2. Color System

## 2.1 Core Palette (nglab Brand)

| Token | Hex | Name | Role |
|---|---|---|---|
| `--ngl-accent` | `#c3423f` | Tomato Jam | Primary actions, active states, key visual anchors. The "red thread" through every screen. |
| `--ngl-accent-hover` | `#a83633` | Dark Tomato Jam | Hover / pressed states for accent-colored elements |
| `--ngl-bg` | `#f0edee` | Platinum | Page background. Warm off-white, never cold gray. |
| `--ngl-bg-alt` | `#e6e2e3` | Dark Platinum | Secondary surfaces, skeleton loaders, hover backgrounds |
| `--ngl-surface` | `#ffffff` | White | Cards, modals, elevated containers. Pristine contrast against Platinum. |
| `--ngl-ink` | `#211a1e` | Shadow Grey | Primary text. Near-black but warm. Never pure `#000` for body text. |
| `--ngl-ink-secondary` | `#4a4548` | Mid Shadow Grey | Secondary text, metadata, timestamps |
| `--ngl-ink-muted` | `#8a8588` | Light Shadow Grey | Placeholders, disabled states, helper text |
| `--ngl-border` | `#d8d3d5` | Platinum Grey | Structural borders, card edges, dividers |
| `--ngl-success` | `#4f9d69` | Shamrock | Positive feedback, validation, success toasts |
| `--ngl-black` | `#000000` | Black | Maximum contrast. Reserved for terminal panels, code blocks, and edge cases. |

## 2.2 Semantic Color Usage

### Tomato Jam (`--ngl-accent`)

The most important color in the system. It must be the **only warm, saturated color** on the screen at any given time. No competing reds, oranges, or pinks — not even in illustrations or charts. If a second warm color is absolutely necessary (category differentiation), derive it as a **tint or shade** from the palette rather than introducing a new hue.

**Permitted uses:**
- Primary CTA button backgrounds
- Active navigation states (bottom bar, top bar)
- Focus rings on inputs
- Chart bar highlights (current month)
- Badge dot when the category's own color is Tomato Jam
- The 2px top border on the bottom nav bar

**Forbidden uses:**
- Body text or headings
- Decorative elements, borders, or dividers
- Background fills that aren't interactive
- Error states (these use the accent at full opacity and are semantically distinct)

### Platinum (`--ngl-bg`) and White (`--ngl-surface`)

Platinum is the page background. It is intentionally warm — slightly pinkish off-white — to create an approachable, human feel that cold grays cannot achieve. White is reserved for elevated surfaces (cards, modals) that need to sit cleanly on top of Platinum. The contrast between Platinum and White is subtle but intentional: it provides hierarchy without relying on shadows.

### Shadow Grey Trio (`--ngl-ink`, `--ngl-ink-secondary`, `--ngl-ink-muted`)

Three steps of a warm near-black, replacing pure black at every step. The lightest variant (`--ngl-ink-muted`) also serves as the SVG chevron color in custom `<select>` elements.

### Shamrock (`--ngl-success`)

Exclusively for success states. It must never appear as decoration, chart color, or accent. If you're tempted to use it outside a success context, you're misusing the color system — derive a tint from Platinum or Shadow Grey instead.

## 2.3 Category Color Extension

When an application requires differentiating multiple categories (e.g., expense tracking, task labels), derive a palette from the core tokens:

| Category | Hex | Derivation |
|---|---|---|
| Category A (high contrast) | `#c3423f` | Tomato Jam |
| Category B (warm) | `#d4956a` | Warm neutral derived from Platinum + Tomato Jam |
| Category C (cool) | `#4f9d69` | Shamrock (repurposed within app context) |
| Category D (dark) | `#211a1e` | Shadow Grey |
| Category E (dark red) | `#b53a37` | Deeper Tomato Jam |
| Category F (mid grey) | `#8a8588` | Light Shadow Grey |
| Category G (darker green) | `#3d8a55` | Deeper Shamrock |
| Category H (neutral) | `#6a6568` | Between mid and light Shadow Grey |

Each category color is used in three places:
1. **Badge background:** at 10% opacity (`${hex}18` in CSS)
2. **Badge text and dot:** at 100% opacity
3. **Chart segment:** at full opacity

## 2.4 Dark Mode

**Not supported in v1.0.** All nglab apps are light-mode-only. The palette is designed for a white-to-warm-gray background with dark ink. If dark mode is added in a future version, it must:
1. Use the same CSS custom property names mapped to dark-appropriate values.
2. Never introduce a separate color system.
3. Be implemented as a `data-theme="dark"` attribute on `<html>`, toggled by a user preference — never by automatic OS preference detection (which creates jarring transitions).

---

# 3. Typography System

## 3.1 Font Voices

The system uses two font families — one for the interface, one for data and code.

### Primary: Inter

```
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

Inter is the workhorse for all UI text: headings, body, labels, buttons, form elements. It renders crisply at small sizes, has excellent hinting on mobile screens, and carries a neutral, modern personality that doesn't compete with the brand colors.

### Monospace: JetBrains Mono

```
font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
```

Used for:
- Data values in tables and KPIs (numbers look precise in mono)
- Code snippets and terminal panels
- Small uppercase-style labels where wide tracking communicates technical credibility
- PIN input fields (monospace digits prevent kerning misalignment)

## 3.2 Type Scale

Every font size in the system comes from this scale. Ad-hoc `px` values in components are rejected at code review.

| Token | Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|
| `display` | 48px | 3rem | 700 | 1.1 | `-0.025em` | Hero numbers, dashboard KPIs, splash screen |
| `headline` | 20px | 1.25rem | 600 | 1.3 | `-0.015em` | Page titles |
| `title` | 16px | 1rem | 600 | 1.4 | `0` | Card titles, section headers |
| `body` | 14px | 0.875rem | 400 | 1.5 | `0` | Primary body text, form labels, list items |
| `body-sm` | 12px | 0.75rem | 400 | 1.5 | `0` | Secondary text, metadata, helper text |
| `caption` | 10px | 0.625rem | 400 | 1.4 | `0.02em` | Badge labels, tiny annotations |
| `mono-md` | 12px | 0.75rem | 400 | 1.6 | `0.08em` | Data tables, terminal output, PIN fields |
| `mono-sm` | 10px | 0.625rem | 400 | 1.4 | `0.08em` | Small data labels, chart axis ticks |

## 3.3 Typography Rules

- **Line height is unitless** (1.1–1.6). Never use `px` or `rem` for line-height.
- **Letter spacing** on Inter: `-0.025em` for display-scale text, `0` for body, `+0.02em` for tiny captions. On JetBrains Mono: always `+0.08em` (wide tracking reads as "technical").
- **Text truncation** via `truncate` (Tailwind) on any text that might overflow. Never allow text to break layout.
- **Font smoothing** is enabled via `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` on the `body` element. This is automatic with Inter.
- **No more than 3 font sizes per screen.** Visual rhythm breaks when a screen mixes `display`, `headline`, `title`, `body`, `body-sm`, and `caption` all at once. Choose 3 from the scale and stick to them.

---

# 4. Spacing & Layout

## 4.1 Spacing Scale

Every gap, padding, and margin in the system uses one of these tokens. The scale is geometric but compressed at the low end for fine control over small UI elements.

| Token | Tailwind | px | Usage |
|---|---|---|---|
| `space-2xs` | `p-0.5` | 2px | Tight icon-to-text gaps |
| `space-xs` | `p-1` | 4px | Chip gaps, inline icon padding |
| `space-sm` | `p-2` | 8px | Form row gaps, card stack spacing |
| `space-md` | `p-4` | 16px | Card internal padding, section gaps |
| `space-lg` | `p-6` | 24px | Page horizontal padding, card vertical separation |
| `space-xl` | `p-8` | 32px | Hero spacing, major section breaks |
| `space-2xl` | `p-12` | 48px | Page-level vertical breathing room |

## 4.2 Layout Grid

### Content Width

The maximum content width depends on the application type:

- **Content-heavy apps** (dashboards, data tables, lists): `max-w-5xl` (1024px). Content benefits from the breathing room.
- **Form-heavy apps** (settings, onboarding, single-item detail): `max-w-lg` (512px). Narrow content focused on one task.

### Page Container

```tsx
// Root layout — applies to every page
<main className="flex-1 w-full mx-auto px-4 sm:px-6 py-6
                pb-[calc(3rem+env(safe-area-inset-bottom))]
                sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
  {children}
</main>
```

- **Mobile horizontal padding:** 16px (`px-4`)
- **Desktop horizontal padding:** 24px (`px-6`)
- **Mobile bottom padding:** 3rem (48px) + safe-area — clears the bottom nav bar
- **Desktop bottom padding:** 1.5rem (24px) + safe-area — no bottom bar to clear

### Grid Behavior

- **Mobile (default):** Single column, full-width cards. Content stacks vertically.
- **Tablet (`sm:`):** Two columns where appropriate (chart pairs, card grids).
- **Desktop (`lg:`):** Three columns for dashboards with enough data density.

## 4.3 Breakpoints

Derived from Tailwind CSS defaults:

| Breakpoint | Min Width | Typical Device | Layout Change |
|---|---|---|---|
| (default) | 0px | Phone portrait | Bottom nav, 1-col, full-width cards, single-column filters |
| `sm` | 640px | Phone landscape / Small tablet | Top nav replaces bottom nav, 2-col grids, 3-col filter row |
| `md` | 768px | Tablet portrait | 3-col grids, sidebar layouts possible |
| `lg` | 1024px | Desktop | Wider content, possible sidebar + content split |
| `xl` | 1280px | Large desktop | Extra padding, wider hero sections |

---

# 5. Shapes & Elevation

## 5.1 Border Radius

nglab interfaces are softly rounded — enough to feel friendly, not so much that they feel bubbly. The radius scale is conservative, with pills reserved for badges and avatars.

| Token | Value | Usage |
|---|---|---|
| `rounded-none` | 0 | Terminal panels, monospace code blocks, flat data tables |
| `rounded-sm` | 4px | Small buttons, compact inputs |
| `rounded-md` | 6px | Standard buttons, inputs, cards. The default radius. |
| `rounded-lg` | 8px | Large cards, dashboard panels, modals |
| `rounded-xl` | 12px | Hero cards, feature panels |
| `rounded-full` | 9999px | Pills, badges, avatars, toggle switches |

## 5.2 Elevation & Depth

Depth is handled **without shadows** in v1.0. The system relies on three mechanisms instead:

1. **Borders** (`1px solid var(--ngl-border)`) — the primary structural separator. Cards sit on the Platinum background with a thin Platinum Grey border that defines their edges without creating heaviness.

2. **Background contrast** — Cards are white (`--ngl-surface`) on a Platinum (`--ngl-bg`) page. The subtle warmth difference creates hierarchy without shadows.

3. **Backdrop blur** (`backdrop-blur-md`) — used exclusively on fixed navigation bars. The bottom nav blurs content behind it, creating a frosted-glass separation that feels native (matches iOS tab bar behavior).

**Shadows** are permitted only for:
- Modals and dialogs (`shadow-lg` with `rgba(0,0,0,0.08)`)
- Tooltips and dropdowns (`shadow-md`)
- Never for cards, buttons, or navigation bars.

---

# 6. Component Library

Every nglab application imports its UI primitives from this shared specification. Components are implemented with Tailwind CSS utility classes backed by the design tokens in `globals.css`. There is no separate component library package (that's v2 scope) — but every app must produce components that match these specs exactly.

## 6.1 Buttons

### Specs

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
  border: none;
  min-height: 44px;
}
.btn:hover { opacity: 0.85; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
```

### Variants

| Variant | Class | Background | Text Color | Border |
|---|---|---|---|---|
| Primary | `.btn-primary` | `var(--ngl-accent)` | `#f0edee` (Platinum) | none |
| Secondary | `.btn-secondary` | `var(--ngl-bg-alt)` | `var(--ngl-ink)` | `1px solid var(--ngl-border)` |
| Danger | `.btn-danger` | `var(--ngl-accent)` | `#ffffff` | none |
| Ghost | `.btn-ghost` | transparent | `var(--ngl-ink-secondary)` | none |

### Usage Rules

- **Primary:** Exactly one per screen. The main CTA. Never use two primary buttons side by side.
- **Secondary:** Auxiliary actions (Cancel, Back, Reset). Can appear alongside a primary button.
- **Danger:** Irreversible destructive actions (Delete, Remove). Must be preceded by a confirmation dialog — never fire on first click.
- **Ghost:** Low-priority inline actions. Text-only, no background. Hover shows a subtle background.

## 6.2 Cards

```css
.card {
  background-color: var(--ngl-surface);
  border: 1px solid var(--ngl-border);
  border-radius: 6px;
  padding: 1.25rem;
}
```

Cards are the atomic content container. Every chunk of related content lives in a card. Cards stack vertically on mobile and flow into CSS Grid layouts on desktop. Cards never carry shadows.

**Card variants:**
- **Default:** 1.25rem padding, 6px radius — for most content.
- **Compact:** 1rem padding, same radius — for dense lists or table rows.
- **Interactive:** Adds `hover:bg-[var(--ngl-bg-alt)]` and `cursor-pointer` — for clickable cards (list items that navigate).

## 6.3 Inputs

### With Icon (the default pattern)

```html
<div className="relative">
  <IconComponent
    size={16}
    className="absolute left-3 top-1/2 -translate-y-1/2
               text-[var(--ngl-ink-muted)] pointer-events-none"
  />
  <input className="input" />
</div>
```

```css
.input {
  width: 100%;
  padding: 0.625rem 0.75rem 0.625rem 2.25rem;
  border: 1px solid var(--ngl-border);
  border-radius: 6px;
  background-color: var(--ngl-surface);
  color: var(--ngl-ink);
  font-size: 0.875rem;
  transition: border-color 0.15s;
  outline: none;
  box-sizing: border-box;
}
.input:focus {
  border-color: var(--ngl-accent);
  box-shadow: 0 0 0 2px rgba(195, 66, 63, 0.15);
}
```

**Icon mapping per input type:**

| Input Type | Lucide Icon |
|---|---|
| Name / Title | `Tag` or `Type` |
| Amount / Price | `Euro` (or `DollarSign`) |
| Date | `Calendar` |
| Category | `Filter` |
| Search / Autocomplete | `Search` |
| Notes / Description | _No icon_ (textarea uses symmetrical padding) |
| PIN / Password | `Lock` or `KeyRound` |
| Sort | `ArrowUpDown` |

### Without Icon

When an input has no icon, apply symmetrical padding via inline style:
```html
<input className="input" style={{ padding: '.625rem .75rem' }} />
```
Or via a dedicated utility class: `.input-plain` with `padding: 0.625rem 0.75rem`.

### Select (Dropdown)

```css
.select {
  width: 100%;
  padding: 0.625rem 2.25rem 0.625rem 2.25rem;
  border: 1px solid var(--ngl-border);
  border-radius: 6px;
  background-color: var(--ngl-surface);
  color: var(--ngl-ink);
  font-size: 0.875rem;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* chevron */
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
}
.select:focus {
  border-color: var(--ngl-accent);
}
```

The custom chevron replaces the browser's native dropdown arrow. The chevron is a 12×12 SVG inline in `--ngl-ink-muted` color.

## 6.4 Badges / Chips / Tags

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
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
```

### Usage Pattern

```tsx
<span
  className="badge"
  style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
>
  <span className="badge-dot" style={{ backgroundColor: categoryColor }} />
  {label}
</span>
```

- **Background:** Category color at ~10% opacity (hex `18` suffix approximates this).
- **Text and dot:** Category color at 100% opacity.
- **Selected/active state:** `border-2` in `var(--ngl-accent)`. Never use `ring-2` — rings render outside the element box and get clipped by `overflow-x: auto` containers.

### Chip Row (Horizontal Scroll)

```html
<div className="flex gap-1.5 overflow-x-auto pb-2"
     style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
  <!-- chips with flex-shrink-0 -->
</div>
```

- **No visible scrollbar** on mobile.
- **`pb-2`** (8px) bottom padding prevents the `border-2` on active chips from being clipped.
- Chips must have `flex-shrink-0` to prevent squishing in narrow containers.

## 6.5 Charts (Chart.js)

All nglab data visualizations use Chart.js v4 with `react-chartjs-2` and `chartjs-plugin-datalabels`.

### Doughnut Chart (Category Breakdown)

```tsx
const doughnutOptions = {
  cutout: '58%',
  plugins: {
    legend: { display: false },
    datalabels: {
      color: '#ffffff',
      font: { weight: 'bold', size: 10 },
      display: (ctx) => ctx.dataset.data[ctx.dataIndex] / total > 0.04,
      formatter: (value, ctx) =>
        `${ctx.chart.data.labels[ctx.dataIndex]}\n€${value.toFixed(0)}\n${pct}%`,
    },
  },
  maintainAspectRatio: false,
};
```

- Labels are white, bold, center-aligned on segments larger than 4% of total.
- Below the chart: a legend list with color dots, category names, percentages, and € amounts.
- Segment colors come from the category color palette (§2.3).

### Bar Chart (Monthly Trend)

- **Data labels:** € values on top of each bar (via datalabels plugin).
- **Current month:** Full opacity (90%) with a visible border.
- **Past months:** 30% opacity, no border.
- **Average line:** Red dashed line (`#ef4444`, dash pattern `[6,4]`) as a separate `line` dataset.
- **Tooltip:** Shows total € + difference vs average.
- **Y-axis:** Formatted as `€`.

## 6.6 Skeleton Loaders

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

Skeletons match the shape and size of the content they replace. A dashboard loading state shows skeleton cards and skeleton chart circles. A list loading state shows skeleton rows. Never use a spinner for page-level loading — skeletons communicate structure; spinners communicate uncertainty.

---

# 7. Navigation Architecture

Navigation is the backbone of the mobile-first experience. It is treated as a first-class design system component — not an afterthought bolted onto desktop layouts.

## 7.1 Mobile: Bottom Navigation Bar (`< sm`)

On viewports narrower than 640px, the primary navigation is a **fixed bottom bar** with these exact specifications:

### Visual Spec

```html
<nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50
                pb-[env(safe-area-inset-bottom)]
                bg-[var(--ngl-bg)]/95 backdrop-blur-md
                border-t-2 border-[var(--ngl-accent)]">
  <div className="flex items-center justify-around h-12">
    <!-- 3–5 icon-only links, each h-full, flex-1 -->
  </div>
</nav>
```

| Property | Value |
|---|---|
| Position | `fixed bottom-0`, full width |
| Height | `h-12` (48px) |
| Background | 95% opacity Platinum + backdrop-blur |
| Top border | 2px Tomato Jam |
| Icons | Only icons, no text labels. `size={24}`. |
| Items | 3–5 links, each `flex-1 h-full` |
| Active state | Full-height background at 10% accent opacity + text accent color |
| Inactive state | `--ngl-ink-muted` color, transparent background |
| Safe area | `pb-[env(safe-area-inset-bottom)]` |

### Behavior

- **Fixed position** — does not scroll with content.
- **Active detection:** `usePathname()` from Next.js. Exact match for root (`/`), prefix match for nested routes (`/expenses/*` matches `/expenses`).
- **No transition animations on v1.0** — instant active state swap. Animations (slide, scale) are v1.1 scope.
- **The bottom nav is never hidden or overlaid.** Modals and dialogs render above it (higher `z-50`+).

### Why No Hamburger Menu?

Hamburger menus hide navigation behind an extra tap. They reduce discoverability and increase cognitive load. On mobile, the bottom bar gives the user a persistent map of the app. Hamburger menus are permitted **only for secondary actions** (filters, search, settings gear) triggered from a top-right icon.

## 7.2 Desktop: Top Navigation Bar (`≥ sm`)

On viewports 640px and wider, navigation moves to a **sticky top bar**:

### Visual Spec

```html
<nav className="hidden sm:block sticky top-0 z-50
                bg-[var(--ngl-bg)] border-b border-[var(--ngl-border)]">
  <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-12">
    <Brand />
    <LinkList />
  </div>
</nav>
```

| Property | Value |
|---|---|
| Position | `sticky top-0` |
| Height | `h-12` (48px) |
| Background | Solid Platinum (no blur) |
| Bottom border | 1px Platinum Grey |
| Content width | Matches page content max-width |
| Links | Text labels (14px, weight 500), no icons-only mode |

### Behavior

- **Desktop links are text-first.** Icons may accompany text but never replace it on desktop.
- **Active state:** `background: var(--ngl-bg-alt)` + `color: var(--ngl-accent)`.
- **Inactive state:** `color: var(--ngl-ink-secondary)`, transparent background.

## 7.3 Transition Between Mobile and Desktop

The mobile bottom bar and desktop top bar must not both be visible at any viewport width. The transition uses Tailwind's responsive prefixes:

- Bottom bar: `sm:hidden` — visible on mobile, hidden at 640px+
- Top bar: `hidden sm:block` — hidden on mobile, visible at 640px+

The breakpoint `sm` (640px) is the single transition point. There is no intermediate "both bars showing" state.

## 7.4 Navigation State Management

- **Active route:** `usePathname()` from `next/navigation`. No custom active-route tracking.
- **URL as source of truth:** Deep links (`/settings`, `/item/42`) must render the correct screen with the correct nav active state without intermediate redirects.
- **Back navigation:** `router.back()` for stack-like behavior. Override only when back would exit the app scope.
- **Scroll preservation:** `router.push()` preserves scroll by default (Next.js App Router). Scroll to top only when navigating to a new section.

## 7.5 Modals and Overlays

- Modals render at `z-50` (above the bottom nav) with a semi-transparent backdrop (`bg-black/40`).
- Tapping the backdrop dismisses the modal.
- Modals have `max-w-sm` or `max-w-md` on mobile, `max-w-lg` on desktop.
- Modal content scrolls internally if it exceeds the viewport.

---

# 8. Next.js Ecosystem Standards

## 8.1 Architecture: App Router Only

**No Pages Router. No legacy patterns.** Every nglab project starts with the App Router. All routes are defined in `app/` directories. API routes use Route Handlers in `app/api/`.

### Server Components by Default

Every component is a Server Component unless it needs:
- `useState` / `useEffect` / `useRef`
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `sessionStorage`, `window`)
- Context providers

When a component crosses the client boundary, it is marked with `"use client"` at the top of the file and a comment explaining why:

```tsx
"use client";
// client boundary — chart needs canvas DOM access

import { Doughnut } from "react-chartjs-2";
```

## 8.2 Directory Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout: fonts, providers, PWA metadata
│   ├── page.tsx                   # Home / Dashboard
│   ├── globals.css                # Design tokens + component CSS
│   ├── (routes)/                  # Optional route groups
│   ├── settings/
│   │   └── page.tsx
│   ├── item/
│   │   ├── [id]/
│   │   │   ├── page.tsx           # View item
│   │   │   └── edit/
│   │   │       └── page.tsx       # Edit item
│   │   └── new/
│   │       └── page.tsx           # Create item
│   └── api/
│       ├── items/
│       │   ├── route.ts           # GET (list) + POST (create)
│       │   └── [id]/
│       │       └── route.ts       # GET + PATCH + DELETE
│       └── stats/
│           └── route.ts
├── components/
│   ├── NavBar.tsx                 # Mobile bottom + desktop top nav
│   ├── PinGate.tsx                # PIN protection gate
│   └── ui/                        # Shared presentational components
│       └── CategoryBadge.tsx
├── lib/
│   ├── db.ts                      # SQLite client + query helpers
│   ├── utils.ts                   # Shared helpers
│   └── constants.ts               # App-wide constants
└── hooks/
    └── useMediaQuery.ts           # Client-only responsive hooks
```

## 8.3 Data Fetching

### Server Components

```tsx
// This component runs on the server. No "use client" needed.
async function StatsCard() {
  const stats = await getStats(); // calls DB directly
  return <div>{stats.total}</div>;
}
```

- `getStats()` is a server-side function that reads from SQLite.
- No API fetch needed — the database is on the same machine.

### Client Components

```tsx
"use client";
// client boundary — interactive form with user input

function ExpenseForm() {
  const handleSubmit = async (data) => {
    const res = await fetch("/api/items", { method: "POST", body: JSON.stringify(data) });
    // handle response
  };
}
```

- Client components call Route Handlers via `fetch()`.
- Route Handlers return `NextResponse.json()`.

### Route Handlers

```ts
export async function GET(request: NextRequest) {
  const db = getDb();
  const items = db.prepare("SELECT * FROM items").all();
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // validate, insert, return
}
```

- All responses are JSON.
- Errors return `{ error: string }` with appropriate HTTP status codes (400, 404, 500).

## 8.4 Database: SQLite + better-sqlite3

### Why SQLite

- Zero configuration. No separate database server to manage.
- Single-file database at `/opt/<app-name>/data/<app-name>.db`.
- `better-sqlite3` is synchronous and fast — no connection pools, no async overhead.
- Backups are a file copy. Migrations are simple SQL.

### Schema Management

No migration framework. Schemas evolve through inline SQL guarded by try/catch:

```ts
function initializeSchema(db: Database) {
  db.exec(`CREATE TABLE IF NOT EXISTS items (...)`);

  // v1.1: add column
  try {
    db.exec("ALTER TABLE items ADD COLUMN new_field TEXT DEFAULT ''");
  } catch {
    // column already exists — safe to ignore
  }
}
```

### Query Pattern

```ts
// All queries use parameterized statements
const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
const items = db.prepare("SELECT * FROM items WHERE category = ? ORDER BY date DESC").all(category);
db.prepare("INSERT INTO items (name, amount, category) VALUES (?, ?, ?)").run(name, amount, category);
```

- **No ORM.** Raw SQL is intentional: it keeps the stack small and predictable.
- **Parameter binding** via `?` placeholders — never string interpolation.

## 8.5 Styling: Tailwind CSS v4

```css
/* globals.css */
@import "tailwindcss";

:root {
  --ngl-accent: #c3423f;
  --ngl-bg: #f0edee;
  /* ... all design tokens ... */
}
```

- Tailwind v4 with `@import "tailwindcss"` (no `@tailwind` directives).
- Design tokens in `:root` as CSS custom properties.
- Component classes (`.card`, `.input`, `.btn`) written in the same `globals.css` file.
- **No CSS modules, no CSS-in-JS.** Tailwind utilities + custom properties + a handful of component classes cover everything.

## 8.6 Standard Dependencies

Every nglab project ships with this exact dependency set. Adding a new dependency requires a design system amendment.

| Package | Purpose | Justification |
|---|---|---|
| `next` | Framework | App Router, Server Components, Route Handlers |
| `react` / `react-dom` | UI | Component model, hooks |
| `better-sqlite3` | Database | Embedded, synchronous, fast |
| `chart.js` | Charts | Lightweight, canvas-based, extensive plugin ecosystem |
| `react-chartjs-2` | Chart React bindings | Declarative chart components |
| `chartjs-plugin-datalabels` | Chart labels | Inline data labels on chart elements |
| `lucide-react` | Icons | Tree-shakeable, consistent style, 1000+ icons |
| `tailwindcss` | Styling | Utility-first, tree-shaken in production |
| `typescript` | Types | Type safety across the codebase |

---

# 9. PWA Requirements & Configuration

## 9.1 Manifest (`public/manifest.json`)

```json
{
  "name": "<App Display Name>",
  "short_name": "<Short Name>",
  "description": "<App description — used in install prompt>",
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

### Requirements Checklist

- [ ] `theme_color` matches `var(--ngl-accent)` (Tomato Jam `#c3423f`)
- [ ] `background_color` matches `var(--ngl-bg)` (Platinum `#f0edee`)
- [ ] `display` is `standalone` (hides browser chrome)
- [ ] `orientation` is `portrait-primary` (landscape is v2 scope)
- [ ] Icons at 192×192 and 512×512 in PNG format
- [ ] A `maskable` icon purpose entry for Android adaptive icons
- [ ] An `apple-touch-icon.png` at 180×180 for iOS home screen

## 9.2 Viewport Configuration

```tsx
// In app/layout.tsx
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#c3423f",
};
```

### Rationale

- **`userScalable: false`** — prevents accidental pinch-zoom that breaks the carefully tuned mobile layout. This is a PWA, not a responsive website.
- **`maximumScale: 1`** — enforces `userScalable: false`.
- **`viewportFit: "cover"`** — the UI extends behind the notch/camera cutout on iOS. Combined with `env(safe-area-inset-*)` padding, this creates a true full-screen experience.
- **`themeColor`** — sets the status bar color on Android and the title bar color on desktop PWAs. Must be Tomato Jam.

## 9.3 Service Worker

### Registration (in layout.tsx or a client script)

```js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
```

### Cache Strategy: Network-First with Shell Fallback

| Resource Type | Strategy | Rationale |
|---|---|---|
| Static assets (JS, CSS, fonts) | Cache-first, updated on new SW version | Performance — these change rarely |
| App shell HTML | Cache-first, updated on new SW version | Offline shell renders immediately |
| API responses | **Network-first, no cache** | Data freshness is critical — never serve stale financial data |
| Images / Icons | Cache-first | Static, rarely change |

### Offline Behavior

When the network is unavailable:
1. The cached shell renders immediately (NavBar, layout, skeleton placeholders).
2. API calls fail gracefully — the app shows an offline indicator bar at the top of the screen.
3. The user can browse cached content (previously loaded data) but cannot create or edit.
4. When connectivity returns, the app silently reconnects — no page reload required.

### Offline Indicator Component

```tsx
// A thin banner at the top of the screen
function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    setOffline(!navigator.onLine);
    const handler = () => setOffline(!navigator.onLine);
    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);
    return () => {
      window.removeEventListener("online", handler);
      window.removeEventListener("offline", handler);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="bg-[var(--ngl-ink)] text-[var(--ngl-bg)] text-xs text-center py-1.5">
      You're offline — changes won't be saved
    </div>
  );
}
```

## 9.4 Push Notifications

**Deferred to v2.** Architecture notes:
- The SW must leave room for a `push` event listener.
- The notification payload should be a JSON object with `title`, `body`, `icon`, and `data.url` for deep linking.
- Permission is requested contextually — never on first load. Show a "Enable notifications" card after the user completes a meaningful action (e.g., adds their first expense).

## 9.5 Install Prompt

- **No custom "Install" button.** Rely on the browser's native `beforeinstallprompt` event.
- The native prompt triggers when: (1) manifest is valid, (2) SW is active, (3) user has engaged with the site.
- If a custom prompt is added later, it must be deferred behind user engagement — never shown on first visit.

---

# 10. Do's and Don'ts

## Do

- **Do** start every component from the mobile layout and layer desktop enhancements via `sm:`, `md:`, `lg:` prefixes.
- **Do** use `var(--ngl-accent)` for exactly one primary action per screen. The eye must land on one red thing.
- **Do** keep cards flat — white background, 1px Platinum Grey border, 6px radius. No shadows.
- **Do** use the bottom nav bar on mobile, top nav bar on desktop. Never mix them on the same viewport.
- **Do** write raw SQL with parameterized queries. The stack is small on purpose.
- **Do** verify every interactive element has a 44×44px minimum touch target.
- **Do** set `box-sizing: border-box` on all custom CSS classes.
- **Do** respect `env(safe-area-inset-bottom)` on fixed and bottom-positioned elements.
- **Do** use CSS custom properties for all colors. Hardcoded hex values in components are rejected.
- **Do** ship every new project with valid PWA icons, manifest, and SW before it reaches production.
- **Do** use the typography scale tokens — never ad-hoc font sizes.
- **Do** provide an offline indicator when the network drops.
- **Do** use `border-2` for active badge states — never `ring-2` (rings clip in scroll containers).

## Don't

- **Don't** introduce new saturated colors beyond the core palette. Derive tints from existing tokens if you need differentiation.
- **Don't** use hamburger menus for primary navigation on mobile. The bottom bar is always the default.
- **Don't** use `ring-2` on elements inside `overflow-x: auto` or `overflow-y: auto` containers.
- **Don't** set `max-scale < 1` or allow zoom on PWAs. `userScalable: false` is mandatory.
- **Don't** use shadows for elevation on cards or buttons unless absolutely necessary. Prefer border + background contrast.
- **Don't** use `background-color` with hardcoded hex values. Reference the CSS custom property instead.
- **Don't** ship a PWA without icons at all required sizes, a valid manifest, and a registered Service Worker.
- **Don't** use more than 3 font sizes on a single screen. Visual rhythm breaks with too many sizes.
- **Don't** hide the bottom nav bar behind modals or overlays. Modals render above it.
- **Don't** use `string interpolation` in SQL queries. Parameterized `?` placeholders always.
- **Don't** allow text to overflow its container. Use `truncate` or enforce max-width constraints.
- **Don't** apply `dark:` Tailwind variants. Dark mode is not supported in v1.0.

---

> **nglab Design System v1.0.0 — canonical**
> *Last updated: 2026-07-20 by nglab engineering.*
> *Every new nglab PWA starts here. When a component, pattern, or rule is updated, this document is the single source of truth that must be edited first.*
