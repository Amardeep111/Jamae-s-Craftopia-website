# Jamae's Craftopia — Design System Specification
**Version:** 1.0 | **Status:** Active Source of Truth
**Last Updated:** August 2026 | **Framework:** Next.js 15 (App Router)
**Styling:** Tailwind CSS v4 + custom CSS | **Animation:** Framer Motion

---

## Table of Contents

1. [Project-Wide Design Identity](#1-project-wide-design-identity)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Spacing System](#4-spacing-system)
5. [Layout System](#5-layout-system)
6. [Responsive Design](#6-responsive-design)
7. [Button Design System](#7-button-design-system)
8. [Form Design System](#8-form-design-system)
9. [Dropdown System](#9-dropdown-system)
10. [Card System](#10-card-system)
11. [Border Radius System](#11-border-radius-system)
12. [Shadow System](#12-shadow-system)
13. [Icon System](#13-icon-system)
14. [Image & Media System](#14-image--media-system)
15. [Animation & Motion System](#15-animation--motion-system)
16. [Header & Navigation](#16-header--navigation)
17. [Hero Section](#17-hero-section)
18. [Page-by-Page Design Analysis](#18-page-by-page-design-analysis)
19. [Component Architecture](#19-component-architecture)
20. [CSS / Tailwind Architecture](#20-css--tailwind-architecture)
21. [Accessibility Visual Requirements](#21-accessibility-visual-requirements)
22. [Design Tokens](#22-design-tokens)
23. [Design Consistency Rules](#23-design-consistency-rules)
24. [Protected Design System](#24-protected-design-system)
25. [Final Design System Summary](#25-final-design-system-summary)

---

## 1. Project-Wide Design Identity

### Overall Design Philosophy

Jamae's Craftopia embraces a **warm artisanal aesthetic** — the visual language of a small home-based craft business where every piece is made slowly by hand. The design does not try to look industrial or mass-produced. Instead, it communicates warmth, tactility, and personal care in every detail.

**Core principles:**
- **Soft warmth over sharp precision** — Generous border radii, gentle shadows, and a warm cream base create a tactile, handmade feel.
- **Quiet confidence** — Rich plum tones anchor the typography while blush, lavender, and sage provide gentle accent pops.
- **Approachable luxury** — The aesthetic is premium without being cold; it feels like a gift shop, not a factory.
- **Layered depth** — Background gradients, decorative blobs, and floating illustrations add dimension without clutter.

### Visual Personality

| Attribute | Expression |
|---|---|
| **Emotional tone** | Cozy, heartfelt, personal, unhurried |
| **Brand feeling** | Like receiving a handmade gift — warm, surprising, special |
| **Target aesthetic** | Artisan craft boutique with editorial warmth |
| **Handmade communication** | Soft illustrations, imperfect-yet-polished layouts, yarn-inspired palette |
| **Consistency method** | Shared design tokens (CSS variables), unified component library, single Tailwind config |

### What Makes the Website Visually Recognizable

1. **The warm cream background** with radial gradient overlays (blush top-left, lavender top-right, sage bottom-left) — visible on every page.
2. **The plum/ink text hierarchy** against cream — immediately distinctive from the typical blue/purple tech aesthetic.
3. **Rounded-full UI elements** — buttons, badges, inputs all use `rounded-full` (pill shape), creating a soft, approachable language.
4. **The `FlowerBurst` SVG icon** used as the logo mark and decorative element throughout.
5. **Craft illustrations** — SVG placeholders with the brand palette that communicate the handmade origin of products.
6. **The "paper card" effect** — `rounded-3xl` cards with `border-sand/80`, `bg-ivory/80`, and `shadow-soft` create a layered, paper-like depth.

### Cohesion Mechanism

The design feels cohesive because:
- **Single source of truth** — All colors are defined as CSS custom properties via Tailwind's `@theme` block.
- **Component library** — Every UI element (Button, Card, Input, Select, Badge) is a reusable component that enforces the design language.
- **Typography pairing** — Fraunces (serif display) paired with Nunito (sans body) is consistent across every page.
- **Shared decorative language** — `Blob` and `FlowerBurst` SVG components used as decorative accents throughout.
- **Scroll reveal choreography** — The `ScrollReveal` component applies the same fade+translate animation to every section on every page.

---

## 2. Color System

### Complete Color Palette

All colors are defined in `tailwind.config.js` (v3 compat) and `app/globals.css` (`@theme` block for v4). Colors are verified directly from source code.

#### Neutral / Background Family

| Color Name | HEX | RGB | CSS Variable | Semantic Purpose | Usage Locations |
|---|---|---|---|---|---|
| **cream** | `#FBF6F0` | 251, 246, 240 | `--color-cream` | Primary background | `body`, `text-plum`, buttons, footer |
| **ivory** | `#F7EFE6` | 247, 239, 230 | `--color-ivory` | Surface / card backgrounds | Cards, navbar, nav links, section backgrounds |
| **sand** | `#EADFD3` | 234, 223, 211 | `--color-sand` | Borders | Card borders, input borders, dividers, ring accents |
| **muted** | `#7A645C` | 122, 100, 92 | `--color-muted` | Secondary text | Body text, descriptions, muted labels |
| **ink** | `#4A342C` | 74, 52, 44 | `--color-ink` | Dark text / inputs | Input text, deep contrast |

#### Primary / Brand Colors

| Color Name | HEX | RGB | CSS Variable | Semantic Purpose | Usage Locations |
|---|---|---|---|---|---|
| **plum** | `#5A3D4A` | 90, 61, 74 | `--color-plum` | Primary brand / headings / primary text | Headings (`heading-display`), buttons, nav links, footer logo |
| **ink** | `#4A342C` | 74, 52, 44 | `--color-ink` | Body text on light backgrounds | Input text, deep decorative elements |

#### Accent / Warm Colors

| Color Name | HEX | RGB | CSS Variable | Semantic Purpose | Usage Locations |
|---|---|---|---|---|---|
| **blush** | `#F3D5D0` | 243, 213, 208 | `--color-blush` | Warm accent, highlights | Hero badge, brand highlights icon bg, hover states, button secondary bg |
| **petal** | `#E8B4B8` | 232, 180, 184 | `--color-petal` | Soft accent | Decorative numbers (HowItWorks), quote icon, brand highlights |
| **bloom** | `#C96B7B` | 201, 107, 123 | `--color-bloom` | Primary accent / emphasis | Eyebrow text, star ratings, focus rings, CTA highlights, active states |

#### Secondary Accents

| Color Name | HEX | RGB | CSS Variable | Semantic Purpose | Usage Locations |
|---|---|---|---|---|---|
| **peach** | `#F3C9B8` | 243, 201, 184 | `--color-peach` | Warm secondary accent | Hero gradient, decorative blobs, product illustrations |
| **lavender** | `#D9CDE8` | 217, 205, 232 | `--color-lavender` | Cool secondary accent | Hero gradient, decorative blobs, social card bg |
| **lilac** | `#B89BC9` | 184, 155, 201 | `--color-lilac` | Deep secondary accent | Category accents (custom), floral illustrations |
| **sage** | `#C5D1C0` | 197, 209, 192 | `--color-sage` | Natural accent | Decorative blobs, flower accents, bandana illustrations |
| **moss** | `#7D9278` | 125, 146, 120 | `--color-moss` | Success state | Success icon in contact form submission |

#### Gradient Colors (Backgrounds)

| Gradient Name | Components | Usage |
|---|---|---|
| **Blush top-left** | `rgb(243 213 208 / 0.45)` | Body background radial gradient (top-left) |
| **Lavender top-right** | `rgb(217 205 232 / 0.35)` | Body background radial gradient (top-right) |
| **Sage bottom-left** | `rgb(197 209 192 / 0.2)` | Body background radial gradient (bottom-left, 20% opacity) |
| **Custom Order CTA bg** | `from-plum via-[#6a4860] to-[#4a342c]` | CustomOrderCTA section dark gradient |
| **Hero illustration bg** | `from-blush/50 via-lavender/30 to-peach/40` | Hero craft illustration grid glow |

#### Selection & Focus Colors

| Color | HEX | CSS Property | Usage |
|---|---|---|---|
| Selection bg | `#E8B4B8` (petal) | `::selection { background }` | Text selection highlight |
| Selection text | `#4A342C` (ink) | `::selection { color }` | Text selection text |
| Focus outline | `#C96B7b` (bloom) | `:focus-visible` | Keyboard focus ring |
| Focus outline offset | `3px` | `outline-offset: 3px` | Space between element and focus ring |

#### Colors NOT Present in the System (Do Not Introduce)

| Color Family | Why Excluded |
|---|---|
| Bright saturated blues | Conflicts with warm palette — blues read as cold/tech |
| Neon or high-saturation greens | Conflicts with muted sage — too garish |
| Pure black (`#000`) or pure white (`#fff`) | System uses cream/ivory and ink/plum — stark contrast would feel harsh |
| Orange-reds (`#FF4500`, `#FF6B35`) | Overpowers the soft blush/peach harmony |
| Cool grays (`#E5E7EB`) | Sand/ivory serve the neutral role in a warmer register |
| Purple (`#9333EA`, `#7C3AED`) | System uses plum and lilac — saturated purple would overwhelm |

---

## 3. Typography System

### Font Families

**Defined in:** `app/globals.css` lines 4–5, `tailwind.config.js` lines 27–29, `app/layout.jsx` lines 22–26

#### Display Font — Fraunces

| Property | Value |
|---|---|
| **Font family** | `'Fraunces'` |
| **Loaded from** | Google Fonts |
| **Weights used** | 400, 500, 600, 700 (regular, medium, semibold, bold) |
| **Optical size axis** | `opsz,wght` (9..144) — enables Fraunces' optical sizing |
| **Fallback** | `ui-serif, Georgia, serif` |
| **CSS variable** | `--font-display` |
| **Tailwind class** | `font-display` |

**Usage:** All headings (H1–H4), product names, section titles, card titles, brand name in footer.

#### Body Font — Nunito

| Property | Value |
|---|---|
| **Font family** | `'Nunito'` |
| **Loaded from** | Google Fonts |
| **Weights used** | 400, 500, 600, 700 (regular, medium, semibold, bold) |
| **Fallback** | `ui-sans-serif, system-ui, sans-serif` |
| **CSS variable** | `--font-sans` |
| **Tailwind class** | `font-sans` |

**Usage:** All body text, navigation links, buttons, form labels, captions, descriptions.

#### Font Loading

```html
<!-- app/layout.jsx -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Nunito:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
```

### Typography Scale

All sizes verified from component source code. Base is `text-base` (16px browser default, scaled by rem).

#### Heading Styles

| Element | Class | Font | Size | Weight | Line Height | Color | Transform | Letter Spacing | Responsive |
|---|---|---|---|---|---|---|---|---|---|
| **H1 (Hero)** | `text-4xl sm:text-5xl lg:text-6xl` | display | 36px → 48px → 60px | 500 (medium) | 1.12 | plum | — | tight | Yes (sm, lg breakpoints) |
| **H1 (PageHeader)** | `text-4xl sm:text-5xl md:text-6xl` | display | 36px → 48px → 60px | 500 (medium) | tight | plum | — | tight | Yes (sm, md breakpoints) |
| **H2 (SectionHeading)** | `text-3xl sm:text-4xl md:text-5xl` | display | 30px → 36px → 48px | 500 (medium) | tight | plum | — | tight | Yes (sm, md breakpoints) |
| **H2 (Card title)** | `font-display text-2xl` | display | 24px | 400–500 (default) | — | plum | — | — | No |
| **H3** | `font-display text-xl` | display | 20px | 400–500 (default) | — | plum | — | — | No |
| **H3 (BrandHighlights)** | `font-display text-xl` | display | 20px | — | — | plum | — | — | No |
| **H3 (HowItWorks)** | `font-display text-2xl` | display | 24px | — | — | plum | — | — | No |
| **Eyebrow text** | `text-xs font-semibold uppercase tracking-[0.22em] text-bloom` | sans | 12px | 600 | — | bloom | uppercase | 0.22em | No |
| **Eyebrow (Hero badge)** | `text-xs font-semibold uppercase tracking-[0.18em]` | sans | 12px | 600 | — | bloom | uppercase | 0.18em | No |

#### Body & UI Text Styles

| Element | Class | Font | Size | Weight | Line Height | Color | Responsive |
|---|---|---|---|---|---|---|---|
| **Body / description** | `text-base leading-relaxed text-muted` | sans | 16px | 400 | 1.625 (relaxed) | muted | — |
| **Body (lg)** | `text-lg leading-relaxed text-muted` | sans | 18px | 400 | 1.625 (relaxed) | muted | sm breakpoint |
| **Small / caption** | `text-sm text-muted` | sans | 14px | 400 | — | muted | — |
| **Nav links** | `text-sm font-semibold` | sans | 14px | 600 | — | muted/plum | — |
| **Button (sm)** | `text-sm` | sans | 14px | 600 (semibold) | — | cream | — |
| **Button (md)** | `text-sm sm:text-base` | sans | 14px → 16px | 600 | — | cream | sm breakpoint |
| **Button (lg)** | `text-base` | sans | 16px | 600 | — | cream | — |
| **Form label** | `text-sm font-semibold text-plum` | sans | 14px | 600 | — | plum | — |
| **Input text** | (browser default) | sans | 16px | 400 | — | ink | — |
| **Placeholder** | (browser default) | sans | 16px | 400 | — | muted | — |
| **Product name (card)** | `font-display text-2xl text-plum` | display | 24px | 400 | — | plum | — |
| **Product short desc** | `text-sm leading-relaxed text-muted` | sans | 14px | 400 | 1.625 | muted | — |
| **Price** | `font-semibold text-plum` | sans | — | 600 | — | plum | — |
| **Badge text** | `text-xs font-semibold tracking-wide text-plum` | sans | 12px | 600 | — | plum | — |
| **Category eyebrow** | `text-xs font-semibold uppercase tracking-[0.18em] text-bloom` | sans | 12px | 600 | — | bloom | uppercase, 0.18em |
| **Testimonial quote** | `font-display text-xl sm:text-2xl leading-relaxed text-plum` | display | 20px → 24px | 400 | 1.625 | plum | sm breakpoint |
| **Footer headings** | `text-sm font-semibold uppercase tracking-[0.18em] text-plum` | sans | 14px | 600 | — | plum | uppercase, 0.18em |
| **Footer text** | `text-sm text-muted` | sans | 14px | 400 | — | muted | — |
| **HowItWorks number** | `font-display text-5xl text-petal` | display | 48px | — | — | petal | — |
| **CustomOrderCTA heading** | `font-display text-3xl leading-tight sm:text-5xl` | display | 30px → 48px | — | 1.25 | cream | sm breakpoint |
| **PageHeader H1** | `heading-display max-w-3xl text-4xl leading-tight sm:text-5xl md:text-6xl` | display | 36px → 48px → 60px | 500 | 1.25 | plum | sm, md breakpoints |

#### Typography CSS Class (Custom)

```css
/* app/globals.css */
.heading-display {
  @apply font-display font-medium tracking-tight text-plum;
}
```

**Where used:** SectionHeading, PageHeader, Hero h1, CustomOrderCTA h2, About h2, TestimonialCard blockquote, Footer logo.

---

## 4. Spacing System

### Page & Section Spacing

| Property | Value | Tailwind Class | Where Used |
|---|---|---|---|
| **Page top padding** | varies | `pt-8 sm:pt-12` | PageHeader component |
| **Page bottom padding** | varies | `pb-8 sm:pb-14` | PageHeader component |
| **Section top margin** | 80px / 112px | `mt-20 sm:mt-28` | All home sections, FeaturedProducts, Categories, etc. |
| **Section internal padding** | — | `container-page` | Every page section wraps in `container-page` |
| **Footer top margin** | 80px | `mt-20` | Footer wrapper (layout.jsx) |
| **Footer padding** | 56px | `py-14` | Footer grid container |

### Container Spacing

```css
/* app/globals.css */
.container-page {
  @apply mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8;
}
```

| Property | Value | Tailwind Class |
|---|---|---|
| **Max width** | 1152px | `max-w-6xl` |
| **Mobile padding** | 16px | `px-4` |
| **Tablet padding** | 24px | `sm:px-6` |
| **Desktop padding** | 32px | `lg:px-8` |

### Card & Component Padding

| Component | Padding | Tailwind Class |
|---|---|---|
| **Paper Card (default)** | `p-5` | `p-5` |
| **TestimonialCard** | `p-6 sm:p-8` | — |
| **BrandHighlights card** | `p-6` | — |
| **HowItWorks card** | `p-6` | — |
| **EmptyState** | `px-8 py-14` | — |
| **Modal content** | `p-6 sm:p-8` | — |
| **About maker card** | `p-6` | — |
| **Contact form** | `p-6 sm:p-10` | — |
| **Custom Orders form** | `p-6 sm:p-10` | — |
| **FinalCTA card** | `px-8 py-14 sm:px-12 sm:py-20` | — |
| **Hero** | `pb-16 pt-6 sm:pb-20 sm:pt-10 lg:pt-16` | — |
| **CustomOrderCTA section** | `px-6 py-12 sm:px-12 sm:py-16` | — |

### Button Padding

| Size | Horizontal | Vertical | Tailwind Class |
|---|---|---|---|
| **sm** | 16px | 8px | `px-4 py-2` |
| **md** | 20px | 10px | `px-5 py-2.5` |
| **lg** | 24px | 12px | `px-6 py-3` |

### Input Padding

| Element | Padding | Tailwind Class |
|---|---|---|
| **Input field** | 16px h, 16px v | `px-4 py-3` |
| **Select trigger** | 10px v | `py-2.5` |
| **Search input** | 16px v, 44px left (icon) | `py-3 pl-11 pr-4` |
| **Textarea** | 16px h, 12px v | `px-4 py-3` |

### Grid & Flex Gaps

| Layout | Gap | Tailwind Class |
|---|---|---|
| **Home section grid (FeaturedProducts)** | 24px | `gap-6` |
| **Categories grid** | 20px | `gap-5` |
| **Testimonials grid** | 24px | `gap-6` |
| **HowItWorks grid** | 24px | `gap-6` |
| **Social Gallery grid** | 16px | `gap-4` |
| **FeaturedProducts grid (lg)** | 24px | `gap-6` |
| **BrandStory 2-col** | 40px → 64px | `gap-10 lg:gap-16` |
| **Hero grid** | 48px → 32px | `gap-12 lg:gap-8` |
| **About maker grid** | 24px | `gap-6` |
| **Contact grid** | 40px | `gap-10` |
| **Custom Orders 2-col form** | 20px | `gap-5` |
| **Footer grid** | 40px | `gap-10` |
| **Navbar links** | 4px | `gap-1` |
| **Hero CTAs** | 12px → flex-row | `gap-3 sm:flex-row` |
| **FinalCTA CTAs** | 12px → flex-row | `gap-3 sm:flex-row` |
| **BrandHighlights grid** | 16px | `gap-4` |
| **Shop filter bar** | 16px | `gap-4` |
| **Shop category tabs** | 8px | `gap-2` |

### Spacing Scale (Tailwind)

The project uses the standard Tailwind spacing scale. Key values used:

| Token | Value | Common Usage |
|---|---|---|
| `0.5` | 2px | Very tight gaps, micro adjustments |
| `1` | 4px | Icon sizing base |
| `1.5` | 6px | Tight icon gaps |
| `2` | 8px | Small gaps, navbar icon margins |
| `2.5` | 10px | Select trigger padding, badge padding |
| `3` | 12px | Button gap, card item spacing |
| `3.5` | 14px | — |
| `4` | 16px | Default padding, nav links |
| `5` | 20px | Card content padding, button horizontal padding |
| `6` | 24px | Section internal gaps |
| `8` | 32px | Desktop container padding, large gaps |
| `10` | 40px | Large section gaps |
| `12` | 48px | Hero CTAs, medium-large gaps |
| `14` | 56px | Footer padding, large card padding |
| `16` | 64px | BrandStory lg gap |
| `20` | 80px | Section top margins (mt-20) |
| `28` | 112px | Section top margins on sm screens (sm:mt-28) |

---

## 5. Layout System

### Maximum Content Width

| Context | Max Width | Tailwind Class | Value |
|---|---|---|---|
| **Page container** | 1152px | `max-w-6xl` | 72rem / 1152px |
| **SectionHeading text** | 672px | `max-w-2xl` | 42rem / 672px |
| **Hero text content** | 544px | `max-w-xl` | 36rem / 544px |
| **EmptyState / success card** | 576px | `max-w-lg` | 32rem / 512px |
| **Custom Orders form** | 672px | `max-w-2xl` | 42rem / 672px |
| **Contact form card** | — | `lg:col-span-3` (grid column) | 3/5 width on desktop |
| **Contact aside** | — | `lg:col-span-2` (grid column) | 2/5 width on desktop |
| **Modal** | 448px | `max-w-md` | 28rem / 448px |
| **Hero illustration** | 576px | `max-w-lg` | 36rem / 576px |

### Main Page Structure

Every page follows this structure:

```
<body>
  <ScrollToTop />           ← Invisible, resets scroll on navigation
  <Navbar />                ← Sticky, glass-blur on scroll
  <main id="main">
    <PageTransition>       ← Framer Motion fade between pages
      {children}            ← Page content
    </PageTransition>
  </main>
  <Footer />                ← Always visible
</body>
```

### Header Height

| State | Height | Tailwind Class |
|---|---|---|
| **Default (mobile)** | 64px | `h-16` |
| **Default (tablet/desktop)** | 72px (4.5rem) | `sm:h-[4.5rem]` |
| **Mobile menu open** | auto (animates) | Framer Motion height animation |

### Navigation Layout

```
Navbar:
  [Logo] -------- [Nav Links (desktop)] -------- [CTA Button (desktop)] [Mobile Toggle]
```

- **Logo**: Flex row with icon + text, gap `gap-2.5`
- **Nav links**: `hidden lg:flex` — horizontal flex with `gap-1`
- **CTA**: `hidden lg:block` — only visible on desktop
- **Mobile toggle**: `lg:hidden` — only visible on mobile

### Footer Structure

```
Footer (4-col grid on desktop, 2-col on tablet, 1-col on mobile):
  [Brand + description] [Quick links] [Shop categories] [Contact + social]
  [Copyright bar - full width]
```

### Grid Systems

| Page / Section | Columns | Grid Class | Responsive |
|---|---|---|---|
| **Footer** | 4 → 2 → 1 | `sm:grid-cols-2 lg:grid-cols-4` | sm, lg |
| **FeaturedProducts** | 4 → 2 → 1 | `sm:grid-cols-2 lg:grid-cols-4` | sm, lg |
| **Categories** | 3 → 2 → 1 | `sm:grid-cols-2 lg:grid-cols-3` | sm, lg |
| **Testimonials** | 3 → 1 | `md:grid-cols-3` | md |
| **HowItWorks** | 3 → 1 | `md:grid-cols-3` | md |
| **BrandHighlights** | 4 → 2 → 1 | `sm:grid-cols-2 lg:grid-cols-4` | sm, lg |
| **SocialGallery** | 4 → 2 | `md:grid-cols-4` | md |
| **Hero** | 2 → 1 | `lg:grid-cols-2` | lg |
| **BrandStory** | 2 → 1 | `lg:grid-cols-2` | lg |
| **About maker grid** | 2 → 1 | `md:grid-cols-2` | md |
| **Contact** | 5 → 2 → 1 | `lg:grid-cols-5` | lg |
| **Custom Orders 2-col** | 3 → 1 | `lg:grid-cols-3` | lg |
| **Shop product grid** | 3 → 2 → 1 | `sm:grid-cols-2 lg:grid-cols-3` | sm, lg |
| **About process grid** | 2 → 1 | `lg:grid-cols-2` | lg |

---

## 6. Responsive Design

### Breakpoints

Verified from Tailwind CSS default breakpoints:

| Breakpoint | Min Width | Tailwind Prefix | Used In |
|---|---|---|---|
| **sm** | 640px | `sm:` | Container padding, heading sizes, card padding, grid columns |
| **md** | 768px | `md:` | Grid columns (3-col layouts), social gallery, section margins |
| **lg** | 1024px | `lg:` | Navbar desktop layout, 2-col hero/brandstory, 4-col footer |
| **xl** | 1280px | — | Not actively used in current implementation |
| **2xl** | 1536px | — | Not actively used in current implementation |

### Responsive Typography Changes

| Element | Mobile | sm | md | lg |
|---|---|---|---|---|
| **Hero H1** | `text-4xl` (36px) | `sm:text-5xl` (48px) | — | `lg:text-6xl` (60px) |
| **PageHeader H1** | `text-4xl` (36px) | `sm:text-5xl` (48px) | `md:text-6xl` (60px) | — |
| **SectionHeading h2** | `text-3xl` (30px) | `sm:text-4xl` (36px) | `md:text-5xl` (48px) | — |
| **Hero description** | `text-lg` (18px) | — | — | — |
| **SectionHeading desc** | `text-base` (16px) | `sm:text-lg` (18px) | — | — |
| **Testimonial quote** | `text-xl` (20px) | `sm:text-2xl` (24px) | — | — |
| **CustomOrderCTA heading** | `text-3xl` (30px) | `sm:text-5xl` (48px) | — | — |

### Responsive Layout Changes

| Component | Mobile | sm | lg |
|---|---|---|---|
| **Navbar** | Logo + hamburger | — | Logo + links + CTA + hidden hamburger |
| **Hero grid** | 1 column | — | 2 columns (content + illustration) |
| **BrandStory grid** | 1 column | — | 2 columns (illustration + text) |
| **Shop filter bar** | Stacked | — | Horizontal row |
| **Hero section padding** | `pb-16 pt-6` | — | `lg:pt-16` |
| **Section margins** | `mt-20` | `sm:mt-28` | — |

### Mobile Behavior

- **Navbar**: Collapses to hamburger menu with AnimatePresence slide-down menu
- **Navigation links**: Full-width tap targets, `rounded-2xl` each, `text-lg font-semibold`
- **CTA button in mobile menu**: Full width (`w-full`)
- **Shop category tabs**: Horizontal scroll with `overflow-x-auto` — tap to filter
- **Decorative elements**: Some blobs/flowers hidden on mobile (`hidden sm:block`, `hidden md:block`)
- **Footer**: 1 column on mobile, 2 on tablet, 4 on desktop

---

## 7. Button Design System

### Base Button Classes

```jsx
// app/components/ui/Button.jsx
const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide transition duration-300 ease-out disabled:pointer-events-none disabled:opacity-50'
```

**Properties:** `inline-flex`, `items-center`, `justify-center`, `gap-2`, `rounded-full`, `font-semibold`, `tracking-wide`, `transition duration-300 ease-out`, `disabled:pointer-events-none disabled:opacity-50`

### Button Variants

#### Primary Button (`variant="primary"`)

| Property | Value | Tailwind Class |
|---|---|---|
| **Background** | plum `#5A3D4A` | `bg-plum` |
| **Text color** | cream `#FBF6F0` | `text-cream` |
| **Shadow** | soft shadow | `shadow-soft` |
| **Hover bg** | ink `#4A342C` | `hover:bg-ink` |
| **Hover transform** | `translateY(-2px)` | `hover:-translate-y-0.5` |
| **Hover shadow** | lift shadow | `hover:shadow-lift` |
| **Active transform** | `translateY(0)` | `active:translate-y-0` |
| **Disabled** | `opacity-50`, no pointer events | — |

#### Secondary Button (`variant="secondary"`)

| Property | Value | Tailwind Class |
|---|---|---|
| **Background** | ivory `#F7EFE6` | `bg-ivory` |
| **Text color** | plum `#5A3D4A` | `text-plum` |
| **Ring** | blush border | `ring-1 ring-blush/80` |
| **Hover bg** | blush 60% | `hover:bg-blush/60` |
| **Hover transform** | `translateY(-2px)` | `hover:-translate-y-0.5` |

#### Outline Button (`variant="outline"`)

| Property | Value | Tailwind Class |
|---|---|---|
| **Border** | 2px sand | `border-2 border-sand` |
| **Text color** | plum | `text-plum` |
| **Hover border** | bloom | `hover:border-bloom` |
| **Hover text** | bloom | `hover:text-bloom` |

#### Ghost Button (`variant="ghost"`)

| Property | Value | Tailwind Class |
|---|---|---|
| **Text color** | bloom | `text-bloom` |
| **Hover bg** | blush 30% | `hover:bg-blush/30` |

#### Blush Button (`variant="blush"`) — Custom Order CTA

| Property | Value | Tailwind Class |
|---|---|---|
| **Background** | petal `#E8B4B8` | Implicit in className override |
| **Text color** | plum | Implicit in className |

### Button Sizes

| Size | Horizontal Padding | Vertical Padding | Font Size | Tailwind Class |
|---|---|---|---|---|
| **sm** | 16px | 8px | 14px | `px-4 py-2 text-sm` |
| **md** | 20px | 10px | 14px → 16px (sm) | `px-5 py-2.5 text-sm sm:text-base` |
| **lg** | 24px | 12px | 16px | `px-6 py-3 text-base` |

### Button Usage Map

| Location | Variant | Size |
|---|---|---|
| **Hero primary CTA** | `primary` | `lg` |
| **Hero secondary CTA** | `secondary` | `lg` |
| **Navbar CTA** | `primary` | `sm` |
| **Mobile menu CTA** | `primary` | default |
| **FeaturedProducts "See full collection"** | `secondary` | default |
| **BrandStory "Read our story"** | `secondary` | default |
| **CustomOrderCTA CTA** | `blush` (custom) | default |
| **FinalCTA "Shop Now"** | `primary` | `lg` |
| **FinalCTA "Start Custom Order"** | `secondary` | `lg` |
| **Shop product card "View details"** | text link | — |
| **About "Commission a piece"** | `primary` | default |
| **Contact form submit** | `primary` | default |
| **Custom Orders submit** | `primary` | default |
| **Contact success "Write another note"** | `primary` | default |
| **Custom Orders success "Send another idea"** | `primary` | default |
| **404 "Go home"** | `primary` | default |
| **404 "Browse the shop"** | `secondary` | default |

---

## 8. Form Design System

### Input Component (`app/components/ui/Input.jsx`)

| Property | Value | Tailwind Class |
|---|---|---|
| **Base** | Full width | `w-full` |
| **Border radius** | Pill | `rounded-2xl` |
| **Border** | Sand | `border border-sand` |
| **Background** | Cream | `bg-cream` |
| **Horizontal padding** | 16px | `px-4` |
| **Vertical padding** | 12px | `py-3` |
| **Outline** | None | `outline-none` |
| **Transition** | Yes | `transition` |
| **Focus ring** | Bloom 30% | `focus:ring-2 focus:ring-bloom/30` |
| **Error border** | Bloom | `border-bloom` |
| **Label** | `text-sm font-semibold text-plum` | — |
| **Error message** | `text-sm text-bloom` | — |

### Textarea

| Property | Value |
|---|---|
| **Same as Input** | Border, bg, padding, focus ring |
| **Rows** | 6 (contact), 5 (custom orders) |

### Inline Form Fields (Contact page, Custom Orders page)

```jsx
// contact/page.jsx — field helper function
function field(error) {
  return `w-full rounded-2xl border bg-cream px-4 py-3 outline-none focus:ring-2 focus:ring-bloom/30 ${
    error ? 'border-bloom' : 'border-sand'
  }`
}
```

### Search Input (Shop page)

| Property | Value | Tailwind Class |
|---|---|---|
| **Container** | `relative`, `max-w-md`, full width | `relative block w-full max-w-md` |
| **Icon** | Search, left, absolute centered | `absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4` |
| **Input** | Full width | `w-full` |
| **Border radius** | Pill | `rounded-full` |
| **Border** | Sand | `border border-sand` |
| **Background** | Ivory | `bg-ivory` |
| **Padding left** | 44px (icon space) | `pl-11` |
| **Font size** | 14px | `text-sm` |
| **Text color** | Ink | `text-ink` |
| **Focus** | Bloom ring | `ring-bloom/30 focus:ring-2` |

### Category Filter Tabs (Shop)

| Property | Value | Tailwind Class |
|---|---|---|
| **Container** | `flex gap-2 overflow-x-auto` | — |
| **Active tab** | `bg-plum text-cream` | — |
| **Inactive tab** | `bg-ivory text-plum ring-1 ring-sand` | — |
| **Hover (inactive)** | `hover:bg-blush/50` | — |
| **Border radius** | Pill | `rounded-full` |
| **Padding** | `px-4 py-2` | — |
| **Font** | `text-sm font-semibold` | — |

### Validation Error Styling

| State | Border Color | Message Color |
|---|---|---|
| **Error** | `border-bloom` | `text-bloom text-sm` |
| **Valid / default** | `border-sand` | — |

### Disabled Input

Styling not explicitly defined — inherits browser defaults with reduced opacity.

---

## 9. Dropdown System

### Custom Select Component (`app/components/ui/Select.jsx`)

The website uses a fully custom-built dropdown (no library dependency) for accessibility and visual control.

#### Trigger (Closed State)

| Property | Value | Tailwind Class |
|---|---|---|
| **Width** | Full | `w-full` |
| **Border radius** | Pill | `rounded-2xl` |
| **Border** | Sand 80% / bloom on error | `border border-sand/80` or `border-bloom` |
| **Background** | Ivory | `bg-ivory` |
| **Text** | `text-sm text-ink` | — |
| **Padding** | `px-4 py-2.5` | — |
| **Gap (chevron)** | 12px | `gap-3` |
| **Transition** | 200ms ease-out | `transition duration-200 ease-out` |
| **Hover border** | Blush | `hover:border-blush` |
| **Focus** | Bloom border + ring | `focus:border-bloom focus:ring-2 focus:ring-bloom/20` |
| **Outline** | None | `outline-none` |
| **Chevron icon** | ChevronDown, `h-4 w-4`, muted color | — |
| **Chevron animation** | 180° rotation on open | `transition-transform duration-200` |

#### Dropdown Menu (Open State)

| Property | Value | Tailwind Class |
|---|---|---|
| **Position** | Absolute, below trigger | — |
| **Z-index** | 50 | `z-50` |
| **Margin top** | 8px | `mt-2` |
| **Width** | Full | `w-full` |
| **Border radius** | Pill | `rounded-2xl` |
| **Border** | Sand 60% | `border border-sand/60` |
| **Background** | Ivory | `bg-ivory` |
| **Padding** | 8px vertical | `py-2` |
| **Shadow** | Custom soft shadow | `shadow-[0_10px_30px_-12px_rgb(90_61_74_/0.2)]` |
| **Animation** | fadeIn 150ms ease-out | `animation: fadeIn 0.15s ease-out` |
| **Transition** | 200ms ease-out | `transition-all duration-200 ease-out` |

#### Dropdown Option Items

| Property | Value | Tailwind Class |
|---|---|---|
| **Width** | Full | `w-full` |
| **Padding** | `px-4 py-2.5` | — |
| **Font size** | 14px | `text-sm` |
| **Transition** | 150ms | `transition duration-150` |
| **Default** | `text-ink` | — |
| **Hover** | `text-ink hover:bg-blush/40` | — |
| **Selected** | `bg-blush/30 font-semibold text-plum` | — |
| **Focused (keyboard)** | `bg-blush/20 outline-none` | — |
| **Check icon** | Check, `h-3.5 w-3.5`, bloom color | — |

#### Accessibility

- `role="combobox"` on trigger
- `aria-expanded`, `aria-haspopup="listbox"`, `aria-activedescendant`
- Full keyboard navigation: Enter, Space, ArrowDown, ArrowUp, Escape, Tab
- Focus management: returns focus to trigger on close

---

## 10. Card System

### Paper Card (Base)

The `paper-card` CSS class is the foundation for all cards:

```css
/* app/globals.css */
.paper-card {
  @apply rounded-3xl border border-sand/80 bg-ivory/80 shadow-[0_10px_30px_-12px_rgb(90_61_74_/_0.18)];
}
```

### Card Component (`app/components/ui/Card.jsx`)

| Property | Default | With `hoverable` |
|---|---|---|
| **Border radius** | `rounded-3xl` | same |
| **Border** | `border-sand/80` | same |
| **Background** | `bg-ivory/80` | same |
| **Shadow** | `shadow-soft` | same |
| **Hover transform** | none | `hover:-translate-y-1` |
| **Hover shadow** | none | `hover:shadow-lift` |
| **Transition** | none | `transition duration-300 ease-out` |

### Product Card (`app/components/ui/ProductCard.jsx`)

| Property | Value |
|---|---|
| **Card type** | `Card hoverable` |
| **Flex** | `flex flex-col h-full` |
| **Image container** | `aspect-[4/5]`, `overflow-hidden`, `bg-sand` |
| **Badge** | `absolute left-3 top-3` |
| **Content padding** | `p-5` |
| **Category label** | `text-xs font-semibold uppercase tracking-[0.18em] text-bloom` |
| **Product name** | `font-display text-2xl text-plum` (link) |
| **Description** | `text-sm leading-relaxed text-muted` |
| **Price** | `font-semibold text-plum` |
| **CTA link** | `inline-flex items-center gap-1 text-sm font-semibold text-plum hover:text-bloom` |

### Category Card (`app/components/ui/CategoryCard.jsx`)

| Property | Value |
|---|---|
| **Border radius** | `rounded-3xl` |
| **Shadow** | `shadow-soft` |
| **Hover transform** | `hover:-translate-y-1` |
| **Hover shadow** | `hover:shadow-lift` |
| **Transition** | `duration-300` |
| **Image aspect** | `aspect-[4/5] sm:aspect-[5/6]` |
| **Overlay** | Gradient from plum/70 → plum/10 → transparent |
| **Title** | `font-display text-2xl text-cream` |
| **Description** | `text-sm text-cream/85` |

### Testimonial Card (`app/components/ui/TestimonialCard.jsx`)

| Property | Value |
|---|---|
| **Base** | `paper-card` |
| **Padding** | `p-6 sm:p-8` |
| **Quote icon** | `Quote`, `h-8 w-8`, petal color, `aria-hidden` |
| **Quote text** | `font-display text-xl sm:text-2xl leading-relaxed text-plum` |
| **Author name** | `font-semibold text-plum` |
| **Place** | `text-sm text-muted` |
| **Stars** | 5 stars, `h-4 w-4`, filled bloom |

### Brand Highlights Cards

| Property | Value |
|---|---|
| **Icon container** | `h-11 w-11`, `rounded-2xl`, `bg-blush/70`, text plum |
| **Icon** | `h-5 w-5` |
| **Title** | `font-display text-xl text-plum` |
| **Text** | `text-sm leading-relaxed text-muted` |

### HowItWorks Cards

| Property | Value |
|---|---|
| **Base** | `paper-card p-6 text-center` |
| **Step number** | `font-display text-5xl text-petal` |
| **Title** | `font-display text-2xl text-plum` |
| **Description** | `text-muted` |

### Empty State Card (`app/components/ui/EmptyState.jsx`)

| Property | Value |
|---|---|
| **Base** | `paper-card mx-auto max-w-lg px-8 py-14 text-center` |
| **Icon** | `Flower2`, `h-10 w-10`, petal color |
| **Title** | `font-display text-3xl text-plum` |
| **Description** | `text-muted` |

### Card Hover Behavior

All hoverable cards share:
- `transition duration-300 ease-out`
- `hover:-translate-y-1` (4px lift)
- `hover:shadow-lift` (stronger shadow)

---

## 11. Border Radius System

### Radius Values

All custom radius values are defined in `tailwind.config.js`:

| Name | Value | Rem | Tailwind Class | Where Used |
|---|---|---|---|---|
| **xl** | 1.5rem (24px) | 24px | `rounded-xl` | Buttons, inputs, select triggers, custom modals |
| **2xl** | 2rem (32px) | 32px | `rounded-2xl` | Navbar logo mark, icon containers, footer social icons |
| **3xl** | 24px (Tailwind default) | — | `rounded-3xl` | All paper cards |
| **pill** | full (9999px) | — | `rounded-full` | All buttons, badges, category tabs, search input |

### Radius Usage Map

| Element | Radius | Tailwind Class |
|---|---|---|
| **All buttons** | pill | `rounded-full` |
| **All badges** | pill | `rounded-full` |
| **Search input** | pill | `rounded-full` |
| **All inputs** | xl (24px) | `rounded-2xl` |
| **Select trigger** | xl (24px) | `rounded-2xl` |
| **Dropdown menu** | xl (24px) | `rounded-2xl` |
| **All cards (paper-card)** | 3xl (24px) | `rounded-3xl` |
| **Navbar logo mark** | 2xl (32px) | `rounded-2xl` |
| **BrandHighlights icon container** | 2xl (32px) | `rounded-2xl` |
| **Contact/Footer social icon container** | 2xl (32px) | `rounded-2xl` |
| **Modal** | 3xl (24px) | `rounded-3xl` |
| **Hero illustration containers** | 3xl (24px) | `rounded-3xl` |
| **CustomOrderCTA section** | `[2rem]` (32px) | `rounded-[2rem]` |
| **Hero gradient glow** | `[2.5rem]` (40px) | `rounded-[2.5rem]` |
| **About craft image** | `[1.5rem]` (24px) | `rounded-[1.5rem]` |

### Radius Philosophy

The radius system is **bimodal**:
1. **Pill (`rounded-full`)** — for interactive elements (buttons, inputs, badges, tabs) — creates a soft, approachable feel
2. **3xl (`rounded-3xl`)** — for containers/cards — generous without being overly rounded

---

## 12. Shadow System

### Shadow Values

Defined in both `tailwind.config.js` (v3 compat) and `app/globals.css` (`@theme`):

| Name | CSS Value | Tailwind Class | Description |
|---|---|---|---|
| **soft** | `0 10px 30px -12px rgb(90 61 74 / 0.18)` | `shadow-soft` | Default card shadow, button shadow |
| **lift** | `0 18px 40px -16px rgb(90 61 74 / 0.28)` | `shadow-lift` | Hover state shadow, elevated elements |

### Shadow Usage Map

| Element | Shadow | Tailwind Class |
|---|---|---|
| **Paper card (default)** | soft | `shadow-soft` |
| **Button primary** | soft | `shadow-soft` |
| **Button hover** | lift | `hover:shadow-lift` |
| **Card hover** | lift | `hover:shadow-lift` |
| **Category card hover** | lift | `hover:shadow-lift` |
| **Contact/social link hover** | lift | `hover:shadow-lift` |
| **Custom dropdown menu** | soft (custom) | `shadow-[0_10px_30px_-12px_rgb(90_61_74_/0.2)]` |
| **Modal** | lift | `shadow-lift` |

### Shadow Color

All shadows use the **plum color** (`#5A3D4A`, `rgb(90 61 74)`) with low opacity. This keeps shadows warm-toned rather than gray, maintaining the cozy aesthetic.

### Shadow Philosophy

- **Soft as default** — The `soft` shadow is applied to most elevated elements, creating layered depth without heaviness.
- **Lift on interaction** — Hover states switch to `lift` (stronger, deeper), giving tactile feedback.
- **Warm tone** — Using plum instead of black/gray for shadow color is a distinctive brand choice that keeps the entire aesthetic warm and cohesive.

---

## 13. Icon System

### Icon Library

**Library:** Lucide React (`lucide-react` v1.34.0)
**Configured in:** `package.json`, `next.config.js` (optimizePackageImports)

### Icon Sizing

| Context | Size | Tailwind Class |
|---|---|---|
| **Navbar logo icon** | 24px | `h-6 w-6` |
| **Navbar toggle** | 24px | `h-6 w-6` |
| **Navbar active indicator** | — | — |
| **Button icons (gap-2)** | 16px default | `h-4 w-4` |
| **Hero badge icon** | 14px | `h-3.5 w-3.5` |
| **Product card arrow** | 16px | `h-4 w-4` |
| **BrandHighlights icons** | 20px | `h-5 w-5` |
| **Testimonial star** | 16px | `h-4 w-4` |
| **Footer location icon** | 16px | `h-4 w-4` |
| **Modal close** | 20px | `h-5 w-5` |
| **Shop search icon** | 16px | `h-4 w-4` |
| **Contact icons** | 20px | `h-5 w-5` |
| **Select chevron** | 16px | `h-4 w-4` |
| **Select check** | 14px | `h-3.5 w-3.5` |
| **Social icons (footer)** | 20px | `h-5 w-5` |
| **Social icons (contact aside)** | 24px | `h-6 w-6` |

### Icon Stroke

Lucide React uses a 2px default stroke. No custom stroke width override is applied except on the hand-crafted `SocialIcons.jsx` which uses `strokeWidth="1.8"`.

### Icon Colors

| Context | Color | Tailwind Class |
|---|---|---|
| **Navbar logo** | plum | `text-plum` |
| **Navbar toggle** | plum | `text-plum` |
| **Button icons** | inherit from button | — |
| **Hero badge** | bloom | `text-bloom` |
| **BrandHighlights icons** | plum | `text-plum` |
| **Testimonial star (filled)** | bloom | `fill-bloom text-bloom` |
| **Footer location** | bloom | `text-bloom` |
| **Modal close** | plum | `text-plum` |
| **Select chevron (closed)** | muted | `text-muted` |
| **Select chevron (open)** | muted, rotated | same |
| **Select check** | bloom | `text-bloom` |
| **Social icons** | plum | `text-plum` |
| **Contact social icons** | plum | `text-plum` |
| **EmptyState icon** | petal | `text-petal` |
| **404 FlowerBurst** | petal | `text-petal` |
| **Contact social containers** | bloom, lavender, sage | `bg-blush`, `bg-lavender`, `bg-sage` |

### Custom SVG Icons

Two hand-crafted SVG icons in `app/components/ui/SocialIcons.jsx`:
- **InstagramIcon** — Custom SVG path, `strokeWidth="1.8"`, fills none by default, accent dot filled
- **FacebookIcon** — Custom SVG path, filled (no stroke)

### Decorative SVG Components

In `app/components/ui/Decor.jsx`:
- **FlowerBurst** — 5 circles arranged in a cross pattern with a center dot. Uses `currentColor` for theming.
- **Blob** — Organic blob shape using SVG path. Uses `currentColor`.

---

## 14. Image & Media System

### Image Aspect Ratios

| Context | Ratio | Tailwind Class |
|---|---|---|
| **Product card image** | 4:5 | `aspect-[4/5]` |
| **Category card image** | 4:5 → 5:6 | `aspect-[4/5] sm:aspect-[5/6]` |
| **Hero main illustration** | 16:10 → 16:9 | `aspect-[16/10] sm:aspect-[16/9]` |
| **Hero small illustrations** | 1:1 | `aspect-square` |
| **BrandStory illustration** | 3:4 | `aspect-[3/4]` |
| **BrandStory small** | 1:1 → 4:3 | `aspect-square`, `aspect-[4/3]` |
| **Social gallery (normal)** | 1:1 | `aspect-square` |
| **Social gallery (tall)** | 4:5 | `aspect-[4/5]` |
| **About craft illustration** | 4:3 | `aspect-[4/3]` |
| **About maker card image** | 5:4 | `aspect-[5/4]` |
| **CustomOrderCTA illustration** | 1:1 | `aspect-square` |
| **Custom Orders process images** | 4:3 | `aspect-[4/3]` |
| **Contact form background** | — | fills container |

### Object-Fit Behavior

All images use `object-cover` via the `ProductImage` component (`app/components/ui/ProductImage.jsx`).

```jsx
<Image className="object-cover ..." />
```

### Image Border Radius

| Context | Radius | Tailwind Class |
|---|---|---|
| **ProductImage wrapper** | overflow-hidden (inherits from parent) | — |
| **Hero illustrations** | rounded-3xl | `rounded-3xl` |
| **About craft illustration** | rounded-[1.5rem] | `rounded-[1.5rem]` |
| **Social gallery items** | rounded-3xl (paper-card) | — |
| **CustomOrderCTA illustration** | rounded-[1.75rem] | `rounded-[1.75rem]` |

### Craft Illustrations

SVG-based brand illustrations used as product/category image placeholders. Defined in `app/components/ui/CraftIllustration.jsx`.

**Available visuals:** `teddy`, `bunny`, `flower`, `bouquet`, `keychain`, `bandana`, `gift`, `heart`, `pins`, `yarn`

**Background gradient maps per visual:**

| Visual | Gradient |
|---|---|
| teddy | `from-peach/70 to-blush/80` |
| bunny | `from-ivory to-lavender/70` |
| flower | `from-lavender/80 to-blush/70` |
| bouquet | `from-peach/80 to-ivory` |
| keychain | `from-sage/60 to-blush/70` |
| bandana | `from-sage/50 to-ivory` |
| gift | `from-lavender/70 to-peach/60` |
| heart | `from-petal/80 to-blush` |
| pins | `from-peach/70 to-lavender/60` |
| yarn | `from-lavender/70 to-sage/50` |

**Size:** illustrations render at 78% of container (`h-[78%] w-[78%]`), centered.

### Next.js Image Configuration

```js
// next.config.js
images: {
  domains: [],
  remotePatterns: [],
},
experimental: {
  optimizePackageImports: ['lucide-react'],
},
```

Images use `fill` or explicit `width`/`height`, with responsive `sizes` attribute:

```jsx
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

### Product Photography Direction

**Verified from `app/components/ui/ProductImage.jsx` and product data:**

The system uses SVG craft illustrations as placeholders. When real photography is introduced:

- **Background tones:** Soft warm cream, peach/blush, dusty lavender, muted sage, deep-plum-inspired accents
- **Avoid:** Overly dark full backgrounds; overly bright white
- **Light products:** Contrast through soft shadows or slightly deeper muted theme-toned areas
- **Dark products:** Use light/bright theme-toned backgrounds
- **Style:** Text-free, visually focused, product-centric

---

## 15. Animation & Motion System

### Global Animations (CSS)

Defined in `app/globals.css` lines 94–135:

#### Float (Soft)

```css
@keyframes float-soft {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-float { animation: float-soft 7s ease-in-out infinite; }
.animate-float-slow { animation: float-soft 10s ease-in-out infinite; }
```

**Usage:** Hero decorative blobs and FlowerBurst elements.

#### Drift

```css
@keyframes drift {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(8px, -12px) rotate(6deg); }
}
.animate-drift { animation: drift 11s ease-in-out infinite; }
```

**Usage:** Lavender blob in Hero.

#### Fade In (Custom)

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Usage:** Custom dropdown menu, also applied via inline style `animation: fadeIn 0.15s ease-out`.

### Scroll Reveal (`app/components/ui/ScrollReveal.jsx`)

Framer Motion component wrapping all scroll-triggered sections:

| Property | Value |
|---|---|
| **Initial** | `opacity: 0, y: 22` |
| **In view** | `opacity: 1, y: 0` |
| **Viewport** | `once: true, amount: 0.18` |
| **Duration** | 0.65s |
| **Easing** | `[0.22, 1, 0.36, 1]` (custom ease-out) |
| **Default delay** | 0 |
| **Stagger delay** | `i * 0.04` to `i * 0.08` depending on section |

### Page Transitions (`app/components/layout/PageTransition.jsx`)

Framer Motion AnimatePresence between route changes:

| Property | Value |
|---|---|
| **Mode** | `wait` |
| **Enter** | `opacity: 0 → 1, y: 8 → 0` |
| **Exit** | `opacity: 1 → 0, y: 0 → -6` |
| **Duration** | 0.35s |
| **Easing** | `[0.22, 1, 0.36, 1]` |

### Mobile Menu Animation

Framer Motion height animation:

| Property | Value |
|---|---|
| **Initial** | `opacity: 0, height: 0` |
| **Animate** | `opacity: 1, height: auto` |
| **Exit** | `opacity: 0, height: 0` |
| **Duration** | 0.28s |
| **Easing** | `[0.22, 1, 0.36, 1]` |

### Hover Animations

| Element | Animation | Tailwind Class |
|---|---|---|
| **Primary button** | `translateY(-2px)` + stronger shadow | `hover:-translate-y-0.5 hover:shadow-lift` |
| **Secondary button** | `translateY(-2px)` | `hover:-translate-y-0.5` |
| **Product card** | `translateY(-4px)` + stronger shadow | `hover:-translate-y-1 hover:shadow-lift` |
| **Category card** | `translateY(-4px)` + stronger shadow | `hover:-translate-y-1 hover:shadow-lift` |
| **Contact aside cards** | `translateY(-2px)` + stronger shadow | `hover:-translate-y-0.5 hover:shadow-lift` |
| **ProductImage** | `scale(1.05)` | `group-hover:scale-105` |
| **CraftIllustration** | `scale(1.05)` | `group-hover:scale-105` |

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Motion Philosophy

- **Ease-out curves** — All animations use ease-out (`[0.22, 1, 0.36, 1]`) — elements enter quickly then settle softly.
- **Entrance orchestration** — Sections reveal via scroll with staggered delays, creating a sense of content being "placed" on the page.
- **Subtle ambient motion** — Decorative blobs float and drift gently, reinforcing the handmade/living quality.
- **Responsive interactions** — Hover states provide tactile feedback (lift + shadow) without being flashy.

---

## 16. Header & Navigation

### Navbar Structure

```jsx
// app/components/layout/Navbar.jsx
<header className="sticky top-0 z-50 ...">
  <nav className="container-page flex h-16 sm:h-[4.5rem] items-center justify-between">
    [Logo] — [Nav Links] — [CTA] — [Mobile Toggle]
  </nav>
  [Mobile Menu (AnimatePresence)]
</header>
```

### Header Visual States

| State | Background | Border | Shadow |
|---|---|---|---|
| **Default (top of page)** | `bg-transparent` | none | none |
| **Scrolled or menu open** | `bg-cream/90` | `border-b border-sand/70` | `shadow-soft` |
| **Extra** | backdrop-blur-md | — | — |

**Implementation:** Uses `useScrolled()` hook + `useLockBody()` for mobile menu.

### Logo

| Property | Value |
|---|---|
| **Container** | Flex, `gap-2.5`, links to `/` |
| **Icon** | `FlowerBurst` SVG in `h-10 w-10 rounded-2xl bg-blush/80`, `text-bloom` |
| **Brand name** | `font-display text-lg sm:text-xl text-plum` ("Jamae's") |
| **Tagline** | `-mt-1 block text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted` ("Craftopia") |

### Navigation Links

| Property | Value |
|---|---|
| **Items** | Home, Shop, Custom Orders, About Us, Contact |
| **Style** | `rounded-full px-4 py-2 text-sm font-semibold` |
| **Active** | `bg-ivory text-plum` |
| **Inactive** | `text-muted hover:bg-ivory/80 hover:text-plum` |
| **Transition** | `transition` (300ms default) |
| **Layout** | `hidden lg:flex items-center gap-1` |

### CTA Button

| Property | Value |
|---|---|
| **Visibility** | `hidden lg:block` |
| **Variant** | Primary |
| **Size** | sm |
| **Text** | "Shop Handmade" |
| **Link** | `/shop` |

### Mobile Menu

| Property | Value |
|---|---|
| **Trigger** | `Menu` / `X` icon, `rounded-full p-2`, `lg:hidden` |
| **Container** | `border-t border-sand/70 bg-cream` |
| **Animation** | Framer Motion height 0→auto, 280ms, ease `[0.22, 1, 0.36, 1]` |
| **Links** | `rounded-2xl px-4 py-3 text-lg font-semibold`, full width |
| **CTA** | Full width `w-full` |
| **Container** | `container-page flex flex-col gap-2 py-6` |

### Skip Link (Accessibility)

```jsx
<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-plum focus:px-4 focus:py-2 focus:text-cream">
  Skip to content
</a>
```

---

## 17. Hero Section

### Layout

Two-column grid on desktop, stacked on mobile:
```
[Text Content] — [Illustration Grid]
```

### Text Content (Left Column)

| Element | Details |
|---|---|
| **Eyebrow badge** | Pill-shaped, `bg-ivory/90`, `border ring-blush/70`, `text-xs uppercase tracking-[0.18em] bloom`, Heart icon |
| **Headline** | `heading-display`, `text-4xl sm:text-5xl lg:text-6xl`, `leading-[1.12]`, max 3 lines |
| **Description** | `text-lg leading-relaxed text-muted`, `max-w-xl`, 2–3 sentences |
| **CTA group** | Flex column (mobile) → flex row (sm), `gap-3` |

### Illustration Grid (Right Column)

| Element | Details |
|---|---|
| **Container** | `relative mx-auto w-full max-w-lg` |
| **Glow** | Absolute, `inset-[-24px]`, `rounded-[2.5rem]`, gradient blur-2xl |
| **Grid** | `grid grid-cols-2 gap-4` |
| **Main illustration** | `col-span-2`, `aspect-[16/10] sm:aspect-[16/9]`, paper-card, CraftIllustration (teddy) |
| **Secondary illustrations** | `aspect-square`, paper-card, CraftIllustration (bouquet + flower) |

### Decorative Elements

| Element | Position | Animation | Color |
|---|---|---|---|
| **Blob (left)** | `-left-24 top-10`, `h-64 w-64` | `animate-float-slow` | `text-blush/50` |
| **Blob (right)** | `-right-16 bottom-0`, `h-72 w-72` | `animate-drift` | `text-lavender/40` |
| **FlowerBurst (1)** | `right-[18%] top-8`, `h-10 w-10`, `hidden sm:block` | `animate-float` | `text-petal` |
| **FlowerBurst (2)** | `bottom-16 left-[12%]`, `h-8 w-8`, `hidden md:block` | `animate-float-slow` | `text-sage` |

### Spacing

- **Section padding:** `pb-16 pt-6 sm:pb-20 sm:pt-10 lg:pt-16`
- **Content grid gap:** `gap-12 lg:gap-8`
- **Right column top offset:** `lg:py-12`

---

## 18. Page-by-Page Design Analysis

### Home Page (`app/page.jsx`)

**Sections (in order):**
1. **Hero** — Two-column, headline + illustration grid
2. **BrandHighlights** — 4-column grid of feature cards
3. **Categories** — 3-column category card grid
4. **FeaturedProducts** — 4-column product card grid
5. **BrandStory** — Two-column (illustration + text)
6. **CustomOrderCTA** — Full-width dark gradient banner
7. **HowItWorks** — 3-column numbered steps
8. **SocialGallery** — 4-column masonry-style gallery
9. **Testimonials** — 3-column testimonial cards
10. **FinalCTA** — Centered card with dual CTAs

### Shop Page (`app/shop/page.jsx`)

| Element | Details |
|---|---|
| **PageHeader** | Eyebrow "The collection", title, description |
| **Filter bar** | Search input (pill) + Sort dropdown |
| **Category tabs** | Horizontal scrollable pill tabs |
| **Product grid** | 3-column → 2-column → 1-column |
| **Empty state** | Shown when no products match filter |
| **Responsive** | Full mobile support with horizontal scroll |

### Product Detail Page (`app/shop/[productId]/page.jsx`)

Not determinable from current implementation — file does not exist yet (dynamic route placeholder).

### About Page (`app/about/page.jsx`)

| Element | Details |
|---|---|
| **PageHeader** | Eyebrow, title, description |
| **Story section** | 2-col (craft illustration + text + list) |
| **Maker cards** | 2-col grid, each with illustration + bio placeholder |
| **Values section** | 3-col icon cards |
| **Process section** | 2-col (text + illustration), list of steps |

### Contact Page (`app/contact/page.jsx`)

| Element | Details |
|---|---|
| **Form card** | Name, email, message fields + submit |
| **Success state** | Check icon + confirmation message |
| **Aside** | Location card + Instagram + Facebook + WhatsApp links |
| **Validation** | Inline error messages in bloom color |
| **Layout** | 5-col grid (3-col form + 2-col aside) |

### Custom Orders Page (`app/custom-orders/page.jsx`)

| Element | Details |
|---|---|
| **PageHeader** | Eyebrow, title, description |
| **Process steps** | 3-col numbered cards |
| **Illustration row** | 3 images side by side |
| **Form** | 8 fields in 2-col layout + full-width textarea + file upload placeholder |
| **Success state** | Full-page success card |

### 404 Page (`app/not-found.jsx`)

| Element | Details |
|---|---|
| **Layout** | Centered, no header/footer distinction (uses page wrapper) |
| **Icon** | FlowerBurst, petal color |
| **Eyebrow** | "404", bloom color |
| **Title** | "This page wandered off the craft table." |
| **CTAs** | "Go home" (primary) + "Browse the shop" (secondary) |

### Shared Components Across Pages

| Component | Pages Used On |
|---|---|
| `Navbar` | All pages |
| `Footer` | All pages |
| `PageHeader` | Shop, About, Contact, Custom Orders |
| `SectionHeading` | Home sections, About |
| `Button` | All pages |
| `Card` / `paper-card` | All card-based sections |
| `ProductCard` | Shop, Home FeaturedProducts |
| `CategoryCard` | Home Categories |
| `TestimonialCard` | Home Testimonials |
| `Badge` | ProductCard |
| `Input` | Contact, Custom Orders (via Field) |
| `Select` | Shop (sort), Custom Orders (category, budget) |
| `EmptyState` | Shop (no results) |
| `Modal` | Not currently active in any page |
| `CraftIllustration` | Hero, BrandStory, About, CustomOrders, SocialGallery |
| `ScrollReveal` | All scrollable sections |
| `PageTransition` | All page navigations |
| `Decor` (Blob, FlowerBurst) | Hero, PageHeader, CustomOrderCTA, 404 |

---

## 19. Component Architecture

### Directory Structure

```
app/
  components/
    home/          ← Page-section components (home page specific)
      Hero.jsx
      BrandHighlights.jsx
      Categories.jsx
      FeaturedProducts.jsx
      BrandStory.jsx
      CustomOrderCTA.jsx
      HowItWorks.jsx
      SocialGallery.jsx
      Testimonials.jsx
      FinalCTA.jsx
    layout/        ← Structural components
      Navbar.jsx
      Footer.jsx
      PageHeader.jsx
      PageTransition.jsx
      ScrollToTop.jsx
    ui/            ← Design system / reusable components
      Button.jsx
      Card.jsx
      Input.jsx
      Select.jsx
      Badge.jsx
      Container.jsx
      SectionHeading.jsx
      ProductCard.jsx
      CategoryCard.jsx
      TestimonialCard.jsx
      ProductImage.jsx
      CraftIllustration.jsx
      Decor.jsx
      Modal.jsx
      EmptyState.jsx
      ScrollReveal.jsx
      SocialIcons.jsx
      index.js      ← Centralized re-exports
  data/            ← Static data (products, categories, testimonials, site info)
  hooks/           ← Custom React hooks
  lib/             ← Utilities (cn, css, db, images, responsive)
  pages/           ← Next.js pages router (legacy, empty)
```

### Component Classification

**Design System Components** (`ui/`):
These should be reused and extended for all UI work:
- `Button` — All button interactions
- `Card` / `paper-card` — All card containers
- `Input` — Form inputs
- `Select` — Custom dropdown
- `Badge` — Label/tag elements
- `Container` — Page section wrappers
- `SectionHeading` — Section headers
- `ScrollReveal` — Scroll animation wrapper
- `Modal` — Dialog/modal overlay
- `EmptyState` — Empty state display

**Domain Components** (`ui/` with specific purpose):
- `ProductCard` — Product display (Shop, Home)
- `CategoryCard` — Category display (Home)
- `TestimonialCard` — Testimonial display (Home)
- `ProductImage` — Image handling with fallback
- `CraftIllustration` — SVG placeholders
- `Decor` — Decorative SVG elements
- `SocialIcons` — Social media icons
- `PageHeader` — Interior page headers

**Layout Components** (`layout/`):
- `Navbar` — Site-wide navigation
- `Footer` — Site-wide footer
- `PageTransition` — Route transition wrapper
- `ScrollToTop` — Scroll reset on navigation

**Section Components** (`home/`):
- `Hero`, `BrandHighlights`, `Categories`, `FeaturedProducts`, `BrandStory`, `CustomOrderCTA`, `HowItWorks`, `SocialGallery`, `Testimonials`, `FinalCTA`

### Reusable Component Pattern

All UI components follow this pattern:
```jsx
export default function ComponentName({ prop1, prop2, className = '', ...props }) {
  const baseClasses = '...'
  return <div className={`${baseClasses} ${className}`} {...props}>{children}</div>
}
```

The `cn()` utility (`app/lib/cn.js`) is used for conditional class merging.

---

## 20. CSS / Tailwind Architecture

### Tailwind Configuration (`tailwind.config.js`)

```js
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: { /* 14 brand colors */ },
      fontFamily: { display: [...], sans: [...] },
      boxShadow: { soft: '...', lift: '...' },
      borderRadius: { xl: '1.5rem', '2xl': '2rem' },
    },
  },
  plugins: [],
}
```

### Tailwind v4 Theme (`app/globals.css`)

```css
@theme {
  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-sans: "Nunito", ui-sans-serif, system-ui, sans-serif;
  --color-cream: #fbf6f0;
  /* ... all 14 colors ... */
  --shadow-soft: 0 10px 30px -12px rgb(90 61 74 / 0.18);
  --shadow-lift: 0 18px 40px -16px rgb(90 61 74 / 0.28);
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
}
```

### CSS Layer Architecture

| Layer | Contents | Directive |
|---|---|---|
| **base** | Global element styles (html, body, selection, focus) | `@layer base` |
| **components** | Reusable design patterns (.container-page, .paper-card, .heading-display) | `@layer components` |
| **utilities** | Single-purpose utilities (.text-balance) | `@layer utilities` |

### Key CSS Classes

```css
.container-page { @apply mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8; }
.paper-card { @apply rounded-3xl border border-sand/80 bg-ivory/80 shadow-[...]; }
.heading-display { @apply font-display font-medium tracking-tight text-plum; }
```

### Design Variables (CSS Custom Properties)

| Variable | Value | Used For |
|---|---|---|
| `--font-display` | Fraunces | Heading font |
| `--font-sans` | Nunito | Body font |
| `--color-cream` | `#FBF6F0` | Backgrounds, buttons |
| `--color-ivory` | `#F7EFE6` | Cards, inputs, nav |
| `--color-plum` | `#5A3D4A` | Text, buttons |
| `--color-bloom` | `#C96B7B` | Accents, focus |
| `--color-blush` | `#F3D5D0` | Highlights, decorative |
| `--color-muted` | `#7A645C` | Secondary text |
| `--color-sand` | `#EADFD3` | Borders |
| `--shadow-soft` | Plum-tinted soft shadow | Cards, buttons |
| `--shadow-lift` | Plum-tinted deep shadow | Hover states |

### Common Utility Patterns

| Pattern | Classes | Usage |
|---|---|---|
| **Page section wrapper** | `container-page mt-20 sm:mt-28` | All home sections |
| **Paper card** | `paper-card p-6` | All cards |
| **Hoverable card** | `paper-card hover:-translate-y-1 hover:shadow-lift transition duration-300` | ProductCard, CategoryCard |
| **Section heading** | `SectionHeading` component | All sections |
| **Eyebrow label** | `text-xs font-semibold uppercase tracking-[0.22em] text-bloom` | Eyebrow text |
| **Display heading** | `heading-display text-3xl sm:text-4xl md:text-5xl` | Section titles |
| **Body text** | `text-base leading-relaxed text-muted` | Descriptions |
| **Pill button** | `rounded-full font-semibold` + variant classes | All buttons |
| **Icon + text** | `inline-flex items-center gap-2` | Button icons, feature icons |

---

## 21. Accessibility Visual Requirements

### Focus Indicators

| Property | Value | Source |
|---|---|---|
| **Outline** | 2px solid bloom | `:focus-visible { outline: 2px solid #c96b7b; }` |
| **Offset** | 3px | `outline-offset: 3px` |
| **Select focus** | Bloom border + ring | `focus:border-bloom focus:ring-2 focus:ring-bloom/20` |
| **Input focus** | Bloom ring | `focus:ring-2 focus:ring-bloom/30` |

### Contrast

All text color combinations verified:
- **plum on cream** — `#5A3D4A` on `#FBF6F0` — passes AA
- **plum on ivory** — `#5A3D4A` on `#F7EFE6` — passes AA
- **muted on cream** — `#7A645C` on `#FBF6F0` — passes AA (body text is descriptive, not critical)
- **ink on cream** — `#4A342C` on `#FBF6F0` — passes AA
- **cream on plum** — `#FBF6F0` on `#5A3D4A` — passes AA (primary button text)

### Keyboard Navigation

- All interactive elements are focusable (`button`, `a`, `input`)
- Custom Select has full keyboard support (arrows, Enter, Escape, Tab)
- Skip link available (`sr-only` → visible on focus)
- `aria-label` on icon-only buttons (navbar toggle, modal close)

### ARIA Patterns Used

| Pattern | Component |
|---|---|
| `role="combobox"` + `aria-expanded` + `aria-haspopup="listbox"` + `aria-activedescendant` | Select |
| `role="listbox"` + `role="option"` + `aria-selected` | Select options |
| `role="dialog"` + `aria-modal="true"` + `aria-labelledby` | Modal |
| `aria-label="Primary"` | Navbar nav |
| `aria-label` | All icon-only buttons |
| `aria-label` on social icon links | Footer social links |

### Reduced Motion

Respects `prefers-reduced-motion` — all animations set to `0.01ms` duration, scroll behavior set to `auto`.

### Screen Reader Support

- `sr-only` elements for visually-hidden labels (search input label)
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`, `<figure>`, `<aside>`)
- Skip-to-content link

---

## 22. Design Tokens

### Color Tokens

| Token | Value | Source | Semantic |
|---|---|---|---|
| `--color-cream` | `#FBF6F0` | globals.css:7 | Primary background |
| `--color-ivory` | `#F7EFE6` | globals.css:8 | Surface / card bg |
| `--color-blush` | `#F3D5D0` | globals.css:9 | Warm accent |
| `--color-petal` | `#E8B4B8` | globals.css:10 | Soft accent |
| `--color-bloom` | `#C96B7B` | globals.css:11 | Primary accent / CTA |
| `--color-lavender` | `#D9CDE8` | globals.css:12 | Cool accent |
| `--color-lilac` | `#B89BC9` | globals.css:13 | Deep accent |
| `--color-peach` | `#F3C9B8` | globals.css:14 | Warm secondary |
| `--color-sage` | `#C5D1C0` | globals.css:15 | Natural accent |
| `--color-moss` | `#7D9278` | globals.css:16 | Success state |
| `--color-plum` | `#5A3D4A` | globals.css:17 | Primary brand / headings |
| `--color-ink` | `#4A342C` | globals.css:18 | Dark text / inputs |
| `--color-muted` | `#7A645C` | globals.css:19 | Secondary text |
| `--color-sand` | `#EADFD3` | globals.css:20 | Borders / dividers |

### Typography Tokens

| Token | Value | Source |
|---|---|---|
| `--font-display` | Fraunces, ui-serif, Georgia, serif | globals.css:4 |
| `--font-sans` | Nunito, ui-sans-serif, system-ui, sans-serif | globals.css:5 |

### Spacing Tokens

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `4px` | 0.25rem | `1` | Micro gaps |
| `8px` | 0.5rem | `2` | Icon gaps, tight spacing |
| `12px` | 0.75rem | `3` | Button gaps |
| `16px` | 1rem | `4` | Default padding |
| `20px` | 1.25rem | `5` | Card padding |
| `24px` | 1.5rem | `6` | Section grid gaps |
| `32px` | 2rem | `8` | Container desktop padding |
| `40px` | 2.5rem | `10` | Large section gaps |
| `64px` | 4rem | `16` | BrandStory lg gap |
| `80px` | 5rem | `20` | Section margins |

### Radius Tokens

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `24px` | 1.5rem | `rounded-xl` | Inputs, dropdowns |
| `32px` | 2rem | `rounded-2xl` | Logo mark, icon containers |
| `24px` | 1.5rem | `rounded-3xl` | Cards |
| `9999px` | full | `rounded-full` | Buttons, badges, tabs |

### Shadow Tokens

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| **soft** | `0 10px 30px -12px rgb(90 61 74 / 0.18)` | `shadow-soft` | Default card/button shadow |
| **lift** | `0 18px 40px -16px rgb(90 61 74 / 0.28)` | `shadow-lift` | Hover state shadow |

### Animation Tokens

| Token | Value |
|---|---|
| **transition** | `duration-300 ease-out` (buttons, cards) |
| **scroll reveal duration** | 0.65s |
| **scroll reveal easing** | `[0.22, 1, 0.36, 1]` |
| **page transition duration** | 0.35s |
| **dropdown animation** | `fadeIn 0.15s ease-out` |
| **float duration** | 7s / 10s |
| **drift duration** | 11s |

---

## 23. Design Consistency Rules

### Color Rules

1. **Do not introduce new colors** without explicit approval. The 14-color palette is complete.
2. **Do not use pure black** (`#000`) or pure white (`#FFF`) for any UI element.
3. **Always use the CSS custom properties** via Tailwind classes (`bg-plum`, `text-bloom`, etc.) — do not hardcode hex values in component code.
4. **Use bloom** (`#C96B7B`) for all focus rings, active states, and interactive emphasis.
5. **Use plum** (`#5A3D4A`) for all primary text and dark UI elements.
6. **Use muted** (`#7A645C`) for all secondary/descriptive text.
7. **Use sand** (`#EADFD3`) for all borders.

### Typography Rules

8. **Do not change the font families.** Fraunces is the display font; Nunito is the body font.
9. **Always use `heading-display`** class for section headings — it enforces `font-display font-medium tracking-tight text-plum`.
10. **Do not change the font size scale.** Use the verified Tailwind classes (`text-xs` through `text-6xl`).
11. **Always use `leading-relaxed`** for body/descriptive text blocks.
12. **Use `text-muted`** for secondary text, not a raw color class.

### Spacing Rules

13. **Use `container-page`** for all section wrappers — it enforces max-width and responsive padding.
14. **Use `mt-20 sm:mt-28`** for section top margins — this is the standard section spacing.
15. **Do not use arbitrary spacing values** (e.g., `mt-[47px]`) — use the Tailwind scale.

### Component Rules

16. **Always use the `Button` component** for buttons — do not create ad-hoc button styles.
17. **Always use the `Card` component** or `paper-card` class for card containers.
18. **Always use the `ScrollReveal` component** to wrap scrollable sections — it ensures consistent animation.
19. **Always use `SectionHeading` component** for section headers — it enforces the typography hierarchy.
20. **Always use `ProductCard` / `CategoryCard`** for product/category displays.

### Interaction Rules

21. **Use `hover:-translate-y-1 hover:shadow-lift`** for all hoverable card interactions.
22. **Use `focus:ring-2 focus:ring-bloom/30`** for input focus states.
23. **Do not remove the `transition` class** from interactive elements.

### Layout Rules

24. **Do not change the `max-w-6xl` container width** — this is the site's maximum content width.
25. **Do not change the `max-w-2xl` SectionHeading width** — this ensures readable line lengths.
26. **Always center section content** with `mx-auto` when using SectionHeading with `align="center"`.

### Brand Identity Rules

27. **Preserve the warm cream background** with its radial gradient overlays — this is a defining visual element.
28. **Do not replace the craft illustrations** with generic stock imagery style.
29. **Do not introduce a different icon style** — Lucide React with consistent sizing is the standard.
30. **Do not use the `rounded-none` or sharp corners** anywhere in the UI — the rounded aesthetic is core to the brand.

---

## 24. Protected Design System

### What Cannot Be Changed Without Explicit Request

#### Brand Color Palette

All 14 colors defined in `tailwind.config.js` and `globals.css` are protected. No color additions, removals, or value changes.

#### Typography System

- **Font families:** Fraunces (display) + Nunito (body) — both loaded from Google Fonts
- **Font loading method:** Preconnect + Google Fonts stylesheet in `layout.jsx`
- **All heading sizes:** As defined in Section 3 — do not resize without approval
- **Heading display class:** `.heading-display` enforces font-display, medium weight, tight tracking, plum color

#### Spacing System

- **Section margins:** `mt-20 sm:mt-28` — standard section vertical spacing
- **Container max-width:** `max-w-6xl` (1152px) — page content width
- **Container padding:** `px-4 sm:px-6 lg:px-8` — responsive horizontal padding

#### Border Radius System

- **Pill radius** (`rounded-full`) — for all buttons, badges, tabs, search input
- **3xl radius** (`rounded-3xl`) — for all cards and containers
- **xl radius** (`rounded-2xl`) — for all inputs, select triggers, dropdown menus

#### Shadow Style

- **Soft shadow** (`shadow-soft`) — warm plum-tinted, used for default card/button elevation
- **Lift shadow** (`shadow-lift`) — deeper plum-tinted, used for hover states
- **Shadow color** — always uses `rgb(90 61 74 / 0.18)` (plum-based), never gray or black

#### Button Language

- **4 variants:** primary (plum), secondary (ivory+blush ring), outline (sand border), ghost (bloom text)
- **3 sizes:** sm, md, lg
- **Hover behavior:** `translateY(-2px)` + shadow lift
- **Always pill-shaped:** `rounded-full`
- **Always semibold:** `font-semibold`

#### Card Language

- **Always `paper-card`:** `rounded-3xl border border-sand/80 bg-ivory/80 shadow-soft`
- **Hoverable variant:** adds lift animation + lift shadow
- **No sharp-cornered cards** anywhere in the system

#### Illustration Style

- **CraftIllustration SVG system:** 10 predefined visuals with brand palette
- **Background gradients:** Soft warm tones matching the brand palette
- **SVG-based placeholders:** Used until real photography is available

#### Product Photography Direction

- **Background tones:** Soft warm cream, peach/blush, dusty lavender, muted sage, deep-plum accents
- **Avoid:** Dark full backgrounds, overly bright white, text overlays
- **Product focus:** Clean, text-free, visually centered

#### Overall Visual Identity

- **Warm artisanal aesthetic** — cannot be replaced with a cold/tech aesthetic
- **Background treatment** — fixed radial gradient overlay on cream (blush, lavender, sage)
- **Consistent animation style** — ease-out curves, subtle ambient motion, scroll reveals
- **Handmade communication** — all design decisions should reinforce the handmade/original nature of the brand

---

## 25. Final Design System Summary

### Brand Aesthetic

**Jamae's Craftopia** is a warm artisanal craft brand. The visual language communicates handmade care, personal attention, and cozy warmth. The aesthetic is a premium craft boutique with editorial warmth — never cold, never mass-produced. Every design decision reinforces that pieces are made slowly, by hand, with love, in Siliguri.

### Color Summary

| Role | Color | Hex |
|---|---|---|
| Background | Cream | `#FBF6F0` |
| Surface / Card | Ivory | `#F7EFE6` |
| Primary Brand / Headings | Plum | `#5A3D4A` |
| Primary Accent | Bloom | `#C96B7B` |
| Warm Accent | Blush | `#F3D5D0` |
| Secondary Accent | Petal | `#E8B4B8` |
| Borders | Sand | `#EADFD3` |
| Body Text | Muted | `#7A645C` |
| Dark Text / Inputs | Ink | `#4A342C` |

Plus 6 supporting accent colors (peach, lavender, lilac, sage, moss) used for gradients, illustrations, and decorative elements.

### Typography Summary

| Role | Font | Weights |
|---|---|---|
| **Display / Headings** | Fraunces (Google) | 400–700 |
| **Body / UI** | Nunito (Google) | 400–700 |

### Spacing Summary

Standard Tailwind scale with key values: `mt-20 sm:mt-28` for sections, `p-5` to `p-8` for card content, `px-4 sm:px-6 lg:px-8` for container padding, `gap-6` for grid sections.

### Layout Summary

`max-w-6xl` (1152px) centered container. Two-column layouts on lg, stacked on mobile. Sticky glass-blur navbar. Multi-column grids for all content sections.

### Components Summary

Centralized design system component library in `app/components/ui/`:
- **Button** (4 variants, 3 sizes, pill-shaped)
- **Card** (paper-card base, hoverable variant)
- **Input** (pill inputs with bloom focus)
- **Select** (custom accessible dropdown)
- **Badge** (pill labels)
- **SectionHeading** (eyebrow + heading + description)
- **ScrollReveal** (consistent scroll animation)
- Plus domain components: ProductCard, CategoryCard, TestimonialCard, ProductImage, CraftIllustration, Decor, EmptyState, Modal, Container

### Buttons Summary

Pill-shaped (`rounded-full`), semibold. Primary (plum bg), Secondary (ivory bg + blush ring), Outline (sand border), Ghost (bloom text). Hover: lift + shadow. Size: sm / md / lg.

### Cards Summary

`rounded-3xl`, `border-sand/80`, `bg-ivory/80`, `shadow-soft`. Hover: `translateY(-4px)` + `shadow-lift`. Consistent padding: `p-5` to `p-8`.

### Forms Summary

Pill inputs (`rounded-2xl`), `border-sand`, `bg-cream`, bloom focus ring. Inline validation with bloom error messages. Custom accessible Select dropdown.

### Shadows Summary

Two shadow system: `shadow-soft` (default, warm plum-tinted) and `shadow-lift` (hover, deeper warm plum-tinted). No gray/black shadows — all shadows maintain the warm tonal palette.

### Animations Summary

Ease-out curve `[0.22, 1, 0.36, 1]`. Scroll reveal (0.65s), page transitions (0.35s), hover lifts (0.3s). Ambient float/drift on decorative elements. Full `prefers-reduced-motion` support.

### Responsive Behavior Summary

Three breakpoints actively used: `sm` (640px), `md` (768px), `lg` (1024px). Mobile-first. Navbar collapses to hamburger. Grids reduce columns on smaller screens. Typography scales up on larger screens.

### Design Principles

1. **Warmth over coldness** — every element uses warm-toned colors
2. **Softness over sharpness** — all corners are rounded, all interactions are gentle
3. **Consistency over variety** — single component library enforces the design language everywhere
4. **Subtlety over loudness** — animations are smooth and understated, colors are muted and harmonious
5. **Handmade authenticity** — the visual design reinforces the handmade nature of the brand

### Protected Design Rules

No changes to: brand color values, font families, typography hierarchy, spacing scale, radius system, shadow style/color, button language, card language, or overall visual identity — without explicit user request.

---

*Document created by analyzing source code across 30+ component files, 4 data files, Tailwind configuration, global CSS, and layout files. All values verified from implementation — no approximations.*

