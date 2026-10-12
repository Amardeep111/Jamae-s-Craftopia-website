# Jamae's Craftopia - Next.js

A handmade crafts e-commerce platform showcasing artisanal products, built with Next.js 15, React 19, and Tailwind CSS 4.

## Features

- **Modern Stack**: Next.js 15 with App Router, React 19, Tailwind CSS 4
- **Design System**: Custom color palette with warm, handmade aesthetic
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design with fluid layouts
- **Accessible**: WCAG-compliant components with keyboard navigation
- **SEO Optimized**: Server-side rendering with metadata API

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
app/
├── components/
│   ├── home/          # Homepage sections
│   ├── layout/        # Navigation, footer, page headers
│   └── ui/            # Reusable UI components
├── data/              # Product catalog, categories, site config
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── shop/              # Shop pages (listing + product details)
├── about/             # About page
├── contact/           # Contact form
├── custom-orders/     # Custom order request form
├── layout.jsx         # Root layout with fonts
├── page.jsx           # Homepage
├── globals.css        # Global styles + Tailwind
└── not-found.jsx      # 404 page
```

## Design System

See `design-system.md` and `MD-SPEC.md` for:
- Color palette (cream, plum, blush, lavender, etc.)
- Typography (Fraunces display + Nunito body)
- Component specifications
- Spacing and layout guidelines

## Customization

### Add Products

Edit `app/data/products.js` to add/modify products. Each product includes:
- Name, category, price, description
- Materials, care instructions, customization options
- Visual placeholder (until real photos are added)

### Update Contact Info

Edit `app/data/site.js` to update:
- Business name, location
- Email, phone, WhatsApp
- Social media links

### Replace Illustrations

Current placeholders are in `app/components/ui/CraftIllustration.jsx`. To use real photos:
1. Add images to `public/images/`
2. Set `image: '/images/product-name.jpg'` in product data
3. `ProductImage` component will automatically use photos when available

## Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy to Vercel via CLI or connect GitHub repo
```

### Other Platforms

```bash
npm run build
npm start  # Runs on port 3000
```

Set `NODE_ENV=production` in your hosting environment.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **UI**: React 19, Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Fraunces, Nunito)

## License

Internal project for Jamae's Craftopia.

---

Built with ❤️ for handmade crafts in Siliguri, India.
