# Jamae's Craftopia - Design System & Component Specification

## Table of Contents

1. [Overview](#overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Utility Classes](#utility-classes)
7. [Illustrations](#illustrations)
8. [Accessibility](#accessibility)

## Overview

Jamae's Craftopia is a handmade crafts e-commerce platform showcasing artisanal products. The design system defines the visual identity, typography, spacing, and reusable components used throughout the application.

## Color Palette

| Name | Hex | Usage |
|------|------|--------|
| Cream | `#fbf6f0` | Base background, surfaces |
| Ivory | `#f7efe6` | Secondary backgrounds |
| Blush | `#f3d5d0` | Accent, highlights |
| Petal | `#e8b4b8` | Call-to-action, emphasis |
| Bloom | `#c96b7b` | Badges, highlights |
| Lavender | `#d9cde8` | Cards, subtle fills |
| Lilac | `#b89bc9` | Links, hover states |
| Peach | `#f3c9b8` | Accent elements |
| Sage | `#c5d1c0` | Borders, dividers |
| Moss | `#7d9278` | Shadows, depth |
| Plum | `#5a3d4a` | Text, borders |
| Ink | `#4a342c` | Body text, icons |
| Muted | `#7a645c` | Muted text, subtitles |
| Sand | `#eadfd3` | Light backgrounds |

## Typography

### Display Font
- **Fraunces** (serif) – Headings and branding

### UI Font
- **Nunito** (sans-serif) – Body text and UI elements

### Heading Sizes

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| H1 | 3xl | bold | Plum |
| H2 | 2xl | bold | Plum |
| H3 | 1.5xl | semi-bold | Plum |
| H4 | 1.25xl | regular | Plum |

## Spacing & Layout

### Spacing Scale

- `sm` = 0.5rem (8px)
- `md` = 1rem (16px)
- `lg` = 1.5rem (24px)
- `xl` = 2rem (32px)

### Margins

| Type | Value |
|------|--------|
| Small | `p-2` (16px) |
| Medium | `p-4` (32px) |
| Large | `p-6` (48px) |
| Extra Large | `p-8` (64px) |

## Components

### Buttons

| Variant | Background | Text | Hover | Active |
|---------|------------|------|-------|---------|
| Primary | Bloom | Solid | Bloom + lift | Ink (dark) |
| Secondary | Ivory | Ring | Blush | Blush |
| Blush | Petal | Solid | Petal | Petal |
| Ghost | Transparent | None | None | None |

### Badges

- **Handmade** – Pill shape, blush background, white text
- **Special** – Similar to Handmade but with blush background

### Cards

#### Paper Card
- Rounded corners (`rounded-3xl`)
- Cream background (`bg-cream`)
- Shadow (`shadow-soft`)
- Padding (`p-6`)
- Contains: icon, title, description, price, CTA

#### Section Heading
- Large heading with decorative icon above
- Centered on page
- Uses `heading-display` class

#### Product Card
- Image-focused layout
- Category badge (pill)
- Product name, short description, price
- "View details" CTA button

#### Category Card
- Grid-style with image and category info
- Displays category name and description
- Hover reveals additional info

#### Modal
- Full-screen overlay
- Close button (X)
- Content container with centered text
- Backdrop blur effect

#### Empty State
- Decorative illustration (flower/bunny)
- Placeholder title and description
- Optional action link

### Illustrations

- **Craft Illustration** – SVG-based product art (teddy, bunny, flower, bouquet, etc.)
- **Social Icons** – Lucide React icons for Instagram, Facebook
- **Scroll Reveal** – Animated entrance using Framer Motion

### Navigation

- **Navbar** – Top bar with logo, links, cart icon
- **Layout** – Page wrapper with header/footer
- **Page Header** – Section heading with icon
- **Footer** – Copyright, links, social icons

## Utility Classes

All components leverage Tailwind CSS with custom extensions:

- `bg-cream`, `bg-ivory`, `bg-sand` – Surface colors
- `text-plum`, `text-cream`, `text-muted` – Text colors
- `rounded-3xl`, `rounded-2xl` – Border radii
- `shadow-soft`, `shadow-lift` – Depth effects
- `hover:-translate-y-1` – Subtle lift on hover
- `transition duration-300 ease-out` – Smooth animations

## Illustrations

### Craft Illustration

SVG-based product illustrations for each item type:
- **Teddy** – Cozy knitted toy
- **Bunny** – Soft pastel bunny
- **Flower** – Delicate floral arrangement
- **Bouquet** – Group of mixed flowers
- **Keychain** – Minimalist jewelry
- **Bandana** – Woven textile
- **Gift** – Wrapped present
- **Heart** – Simple heart shape
- **Pins** – Pin collection
- **Yarn** – Ball of yarn

All illustrations use the `framer-motion` library for animation support.

### Social Icons

Lucide React icons for:
- Instagram
- Facebook

### Scroll Reveal

Animated entrance effect using `framer-motion`:
- `initial={{ opacity: 0, y }}`
- `whileInView={{ opacity: 1, y: 0 }}`
- Transition: `duration: 0.65, delay: 0`

## Accessibility

- Focus indicators on all interactive elements
- Sufficient color contrast (plum/cream > 4.5:1)
- Semantic HTML structure
- ARIA labels for modals and dialogs
- Keyboard navigation support

## File Structure

- `src/components/` – All UI components
- `src/utils/cn.js` – CSS custom properties (color palette)
- `src/data/` – Data files (categories, products, site config)
- `src/hooks/` – Custom hooks (useScrolled)
- `src/` – Main application code

## Quick Start

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Build for production: `npm run build`

## License

Internal project – proprietary design system for Jamae's Craftopia.
