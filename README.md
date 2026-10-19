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

### Vercel + Supabase

1. Create an empty Supabase Postgres project and a Vercel project connected to this repository.
2. Add the production environment variables listed in `.env.example` to Vercel. Use the Supabase **Transaction Pooler** URL (port `6543`) as `DATABASE_URL`, with `pgbouncer=true`, `connection_limit=1`, and `sslmode=require`. Use the Supabase **Session Pooler** URL (port `5432`) as `DIRECT_URL` for Prisma migrations. URL-encode special characters in the database password. Never use a `NEXT_PUBLIC_` prefix for a secret.
3. Apply the checked-in schema migrations from a trusted terminal before the first deploy:

   ```bash
   npm ci
   DIRECT_URL="<Supabase session-pooler URL>" DATABASE_URL="<same URL>" npm run db:migrate:deploy
   ```

   `prisma/migrations/20261019130000_deployment_schema_completion/migration.sql` adds the product fee fields, auth throttling table, and store settings table absent from the original migration history. `npm run db:migrate:deploy` applies the full chain on a new, empty project and records it in `_prisma_migrations`.

4. Seed the storefront catalog, without creating test accounts:

   ```bash
   DATABASE_URL="<Supabase session-pooler URL>" npm run db:seed:catalog
   ```

5. Bootstrap the first superadmin from a trusted machine, using a unique strong password. The script promotes the specified existing customer account or creates it; it refuses to run once a superadmin already exists.

   ```bash
   DATABASE_URL="<Supabase session-pooler URL>" BOOTSTRAP_ADMIN_EMAIL="owner@example.com" BOOTSTRAP_ADMIN_PASSWORD="<strong password>" npm run db:bootstrap-admin
   ```

6. Deploy. Vercel runs `npm run build`, which generates Prisma Client and builds Next.js. Migrations are deliberately run separately, never as part of the build.

Required production secrets include `AUTH_SECRET`, `SESSION_COOKIE_SECRET` (each at least 32 characters), `PASSWORD_ENCRYPTION_PRIVATE_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and `MERCHANT_UPI_ID`/`MERCHANT_PAYEE_NAME`. For Gmail, enable 2-Step Verification and create a Google App Password; use that app password as `GMAIL_APP_PASSWORD`, never your normal Gmail password. Optionally set `EMAIL_FROM` to a Gmail verified Send As address and `SUPPORT_EMAIL` to receive contact/custom-order and refund operations notices. Validate the SMTP credentials with `npm run email:check` after setting them in `.env.local`; it checks the connection without sending a test email. Signup and password-change verification codes require successful delivery; order, password-change alert, contact receipt, and order/refund status notifications are best effort and do not undo successful customer actions when delivery fails. Generate the RSA key with `node scripts/generate-password-encryption-key.js` and save its output as the server-only `PASSWORD_ENCRYPTION_PRIVATE_KEY` value in Vercel. The browser fetches only the corresponding public key; password requests use RSA-OAEP encryption, and the server decrypts before bcrypt verification/hashing. Keep HTTPS enabled and never expose the private key through a `NEXT_PUBLIC_*` variable. Product and customer review photos are uploaded directly to Cloudinary through authenticated server routes; local development stores preview files under `public/uploads`. Set both Mapbox tokens for map-based address lookup. `APP_URL` is optional: Vercel supplies `VERCEL_URL` automatically for deployment and preview links, while `APP_URL` can override it with your permanent custom domain (for example, `https://jamaes.example`). Local development falls back to localhost. Keep `USE_MOCK_DATA=false` in production and do not set `PLAYWRIGHT_TEST` in Vercel.

The app uses Node.js server routes and Supabase's transaction pooler for short-lived Vercel functions. Free plans have provider-specific usage and storage limits; monitor database, function, and blob usage in their dashboards. This setup does not use Supabase Auth or expose the database to the browser.

For later schema changes, add a new Prisma migration and apply it with `npm run db:migrate:deploy` before deploying code that depends on it. Do not run `prisma db push` against production.

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
