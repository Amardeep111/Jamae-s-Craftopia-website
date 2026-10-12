# Design System - Jamae's Craftopia

## Overview
Design system for Jamae's Craftopia - a handmade crafts e-commerce platform.

## Color Palette

| Name | Hex | Usage |
|------|------|--------|
| Cream | `#fbf6f0` | Base background, surfaces |
| Ivory | `#f7efe6` | Secondary backgrounds |
| Blush | `#f3d5d0` | Accent, highlights |
| Petal | `#e8b4b8` | Call-to-action, emphasis |
| Bloom | `#c96b7b` | Highlights, badges |
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

- **Display Font**: Fraunces (serif) - for headings
- **UI Font**: Nunito (sans-serif) - for body text

### Heading Hierarchy

| Level | Font Size | Weight | Color |
|-------|-----------|--------|-------|
| H1 | 3xl | bold | Plum |
| H2 | 2xl | bold | Plum |
| H3 | 1.5xl | semi-bold | Plum |
| H4 | 1.25xl | regular | Plum |

## Spacing Scale

Base spacing unit: `sm = 0.5rem (8px)`, `md = 1rem (16px)`, `lg = 1.5rem (24px)`, `xl = 2rem (32px)`

Common margins:
- `p-2` = 16px
- `p-4` = 32px
- `p-6` = 48px
- `p-8` = 64px
- `m-2` = 16px
- `m-4` = 32px
- `m-6` = 48px
- `m-8` = 64px

## Components

### Buttons

| Variant | Background | Text | Hover | Active |
|---------|------------|------|-------|---------|
| Primary | Bloom | Solid | Bloom + lift | Ink (dark) |
| Secondary | Ivory | Ring | Blush | Blush |
| Blush | Petal | Solid | Petal | Petal |
| Ghost | Transparent | None | None | None |

### Badges

- **Handmade** - Small pill badge with blush background, text "Handmade"
- **Special** - Similar but with blush background

### Cards

- **Paper Card** - Rounded, cream background, shadow, padding
- **Section Heading** - Large heading with decorative icon above
- **Product Card** - Image-focused with category badge, price, CTA
- **Category Card** - Grid-style with image and category info
- **Modal** - Full-screen overlay with close button
- **Empty State** - Decorative illustration with placeholder text

### Illustrations

- **Craft Illustration** - SVG-based product illustrations (teddy, bunny, flower, bouquet, etc.)
- **Social Icons** - Lucide React icons (Instagram, Facebook)
- **Scroll Reveal** - Animated entrance effect

## Utility Classes

All components use Tailwind utility classes with custom extensions:

- `bg-cream`, `bg-ivory`, `bg-sand` - Surface colors
- `text-plum`, `text-cream`, `text-muted` - Text colors
- `rounded-3xl`, `rounded-2xl` - Border radius
- `shadow-soft`, `shadow-lift` - Shadows
- `hover:-translate-y-1` - Lift on hover
- `transition duration-300 ease-out` - Smooth transitions

## Iconography

- **Lucide React** for social media and generic icons
- **Custom SVGs** for illustrations (craft items, emojis)
- **Color scheme** aligned with design palette

## Accessibility

- Focus states on all interactive elements
- Sufficient contrast ratios (plum/cream > 4.5:1)
- Semantic HTML structure
- ARIA labels for modals and dialogs

## Documentation

See `src/components/` for component implementations and `src/utils/cn.js` for CSS custom properties.
