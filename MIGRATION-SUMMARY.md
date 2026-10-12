# React to Next.js 15 Migration - Complete

## Migration Summary

Successfully migrated Jamae's Craftopia from React Router (Vite) to Next.js 15 App Router.

## What Was Changed

### Framework Migration
- **From**: React 19 + Vite + React Router v7
- **To**: Next.js 15 + App Router + React 19

### Project Structure
```
Before (Vite):          After (Next.js):
src/                    app/
├── components/         ├── components/
├── pages/             ├── (routes as folders)
├── data/              ├── data/
├── hooks/             ├── hooks/
├── utils/             ├── lib/
├── main.jsx           ├── layout.jsx
├── App.jsx            ├── page.jsx
└── index.css          └── globals.css
```

### Key Changes

#### 1. Routing
- React Router `<Route>` → Next.js file-based routing
- `src/pages/Home.jsx` → `app/page.jsx`
- `src/pages/Shop.jsx` → `app/shop/page.jsx`
- `src/pages/ProductDetails.jsx` → `app/shop/[productId]/page.jsx`
- Dynamic routes use `[param]` folders

#### 2. Navigation
- `<Link to="/">` → `<Link href="/">`
- `useNavigate()` → `useRouter()` from `next/navigation`
- `useLocation()` → `usePathname()`
- `useParams()` → `params` prop in page components
- `useSearchParams()` → wrapped in `<Suspense>`

#### 3. Components
- All interactive components use `'use client'` directive
- Server components by default (layout, static pages)
- `<Outlet />` → `{children}` in layouts

#### 4. Styling
- Tailwind CSS v4 with `@tailwindcss/postcss`
- `@import "tailwindcss"` in CSS
- Same design system maintained

#### 5. Images
- `<img>` → `<Image>` from `next/image` (where applicable)
- ProductImage component handles both

#### 6. Fonts
- Google Fonts loaded via `<link>` in layout head
- Fraunces (display) + Nunito (body)

## Files Created

### Core Files
- `app/layout.jsx` - Root layout with metadata
- `app/page.jsx` - Homepage
- `app/globals.css` - Global styles
- `next.config.js` - Next.js configuration
- `postcss.config.json` - PostCSS with Tailwind
- `tailwind.config.js` - Tailwind configuration
- `jsconfig.json` - Path aliases

### Pages
- `app/shop/page.jsx` - Product listing
- `app/shop/[productId]/page.jsx` - Product details
- `app/about/page.jsx` - About page
- `app/contact/page.jsx` - Contact form
- `app/custom-orders/page.jsx` - Custom order form
- `app/not-found.jsx` - 404 page

### Components (58 total)
- UI: Button, Badge, Modal, EmptyState, ScrollReveal, etc.
- Home: Hero, Categories, FeaturedProducts, etc.
- Layout: Navbar, Footer, PageHeader, ScrollToTop

### Data & Utils
- `app/data/` - Products, categories, testimonials, site config
- `app/lib/cn.js` - Class name utility
- `app/hooks/useScrolled.js` - Custom hooks

## Build Output

```
Route (app)                              Size     First Load JS
┌ ○ /                                   2.19 kB   156 kB
├ ○ /about                              2.18 kB   150 kB
├ ○ /contact                            2.38 kB   154 kB
├ ○ /custom-orders                      4.37 kB   156 kB
├ ○ /shop                               2.12 kB   165 kB
└ ƒ /shop/[productId]                   2.51 kB   165 kB

○ Static    ƒ Dynamic
```

## Dependencies

### Added
- `next@^15.0.0`
- `@tailwindcss/postcss@^4.3.3`
- `postcss@^8.5.0`

### Removed
- `vite@^8.2.2`
- `@vitejs/plugin-react@^6.1.0`
- `react-router-dom@^7.18.2`

### Kept
- `react@^19.2.8`
- `react-dom@^19.2.8`
- `framer-motion@^13.1.1`
- `lucide-react@^1.34.0`
- `tailwindcss@^4.3.3`

## Design System Preserved

All design tokens maintained:
- 14 color palette (cream, plum, blush, etc.)
- Typography (Fraunces + Nunito)
- Spacing, shadows, animations
- Component variants and styles

## Testing

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## Next Steps

1. Add real product images to `public/images/`
2. Update contact info in `app/data/site.js`
3. Connect forms to backend/email service
4. Add environment variables for API keys
5. Deploy to Vercel or other Next.js host

## Notes

- All pages are statically generated except product details (dynamic)
- Client components marked with `'use client'`
- Search params wrapped in Suspense for SSR compatibility
- Image optimization ready via Next.js Image component
- Design system specs documented in `design-system.md` and `MD-SPEC.md`

---

Migration completed successfully on 2026-08-30

---

## Development Server Port Configuration

### Default Port
The development server runs on **port 3000** by default.

### Starting the Development Server
```bash
npm run dev
```
This command (defined in `package.json`) explicitly uses port 3000: `next dev --turbopack -p 3000`

### Port Conflicts
If port 3000 is already in use, the server will fail to start. To resolve:

1. **Find the process using port 3000:**
   ```bash
   lsof -i :3000
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```
   Or kill all processes on the port:
   ```bash
   lsof -ti :3000 | xargs kill -9
   ```

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

### Common Causes of Port Conflicts
- Previous Next.js dev server not properly terminated
- Multiple terminal windows running dev servers
- Stale processes from other projects (e.g., Vite, Create React App)
- Port 3000 being used by another application

### Cleaning Up Stale Processes
The project may have stale processes from other projects. To clean:
```bash
# Kill all Node/Vite processes (use with caution)
pkill -f "node.*vite"

# Kill specific stale processes
kill -9 $(lsof -ti :3000 -ti :3001)
```

### Verifying the Server is Running
After starting, check the output:
```
▲ Next.js 15.5.24
- Local:        http://localhost:3000
- Environments: .env.local
```

### Environment Variables
- `NEXT_PUBLIC_APP_URL`: Set to `http://localhost:3000` in `.env.local`
- This is used by client components to construct absolute URLs when needed
- For internal API calls within Next.js, relative paths (`/api/...`) are preferred

