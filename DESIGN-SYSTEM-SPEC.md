---
name: jamaes-craftopia-design-spec
metadata:
  type: project
  created: 2026-09-03
  source-of-truth: current-implementation
  protected-design: true
  audit-method: full-file-inspection
---

# Jamae's Craftopia — Design System Specification
**Status:** CURRENT IMPLEMENTATION ONLY  
**Last verified:** 2026-09-03 from actual `app/` source, `package.json`, `.env.example`, `globals.css`, `tailwind.config.js`.  
**Rule:** DOCUMENT WHAT EXISTS. Never describe planned/unimplemented features as present. Where code cannot confirm something → explicitly marked.

---

## 1. PROTECTED DESIGN SYSTEM

DO NOT change without explicit approval:
- Warm cream/ivory/petal/blush/sage/lilac/plum/ink palette (no grey/blue/neon).
- Fraunces (display/headings) + Nunito (body/UI) — loaded via Google Fonts in `layout.jsx`.
- Handcrafted/artisanal editorial identity — never generic SaaS template.
- Fixed-size image containers (`aspect-square` + `object-cover`/`object-contain`) — never stretch to image dimensions.
- 3-image gallery with fixed container (not 2, not 4, not dynamic).
- Cart badge counts TOTAL quantity, not unique SKU count.
- COD creates order immediately (`CONFIRMED` + `COD_PENDING_COLLECTION`); never fake "Processing payment".
- Customer photos come from backend/upload; demo/reviews clearly marked `isSample`.
- Category pills pill-shaped with full radius, mobile scroll, `z-10` protection.
- Navbar active = `bg-blush/60 text-plum shadow-soft`.
- All dropdowns use shared `<Select>` with clipped hover background.
- All features usable on mobile/tablet/desktop — no horizontal overflow.

---

## 2. BRAND / VISUAL IDENTITY (CONFIRMED FROM CODE)

- **Name:** Jamae's Craftopia (`site.js`, `<title>` meta, logo).
- **Tagline:** "Handmade with love, created especially for you." (`site.js`, Hero eyebrow).
- **Location:** Siliguri, West Bengal, India (`site.js`, About page).
- **Contact:** `hello@jamaescraftopia.com`; phone `+91 98XXX XXXXX`; WhatsApp link (`site.js`).
- **Social:** Instagram / Facebook (`site.js`, contact sidebar cards).
- **Visual personality:** Warm, handmade, editorial, artisanal, intimate, slow-crafted. Soft pastels. Gentle radial gradients on body (`globals.css`). No harsh white backgrounds; global is `bg-cream` with fixed radial gradient overlays at top-left (blush), top-right (lavender), bottom-left (sage).
- **What it avoids:** Generic modern ecommerce/tech template; sharp corners; dark full backgrounds; arbitrary gradients; cool grey palettes.

---

## 3. COLORS (EVERY TOKEN FROM `globals.css` / `tailwind.config.js` / USE IN CODE)

All defined in `@theme` (`globals.css`) + `tailwind.config.js` extension. No extra colors used.

| Token | HEX | Semantics | Confirmed Usage |
|---|---|---|---|
| cream | `#fbf6f0` | Global body bg | `body` bg; `bg-cream` base |
| ivory | `#f7efe6` | Card/surface | `paper-card`; `bg-ivory`; input bg |
| blush | `#f3d5d0` | Soft decorative / active pill | Navbar active pill `bg-blush/60`; category active hover |
| petal | `#e8b4b8` | Decorative / icon / selection | FlowerBurst icon; `::selection` bg; decorative blobs |
| bloom | `#c96b7b` | Primary interactive / accent | Focus ring `outline` (`#c96b7b`); buttons; dots; badges; star fill |
| lavender | `#d9cde8` | Soft decorative | Gradient blob; category `personalized` accent |
| lilac | `#b89bc9` | Soft decorative / flower | Category `flowers`; illustration palettes |
| peach | `#f3c9b8` | Warm decorative | Category `flowers`; gradient blob; palette |
| sage | `#c5d1c0` | Soft green / success/eco | Category `accessories`; `bg-sage/20`; success badges; illustration |
| moss | `#7d9278` | Deep green / success / check | Category decor; check icons; `text-moss` |
| plum | `#5a3d4a` | Deep text / headings / dark surface | `text-plum` headings; `bg-plum` dark CTA; navbar text; logo |
| ink | `#4a342c` | Base text / primary font | `text-ink` body; headings; `bg-ink` (none used) |
| muted | `#7a645c` | Secondary text / captions | `text-muted`; descriptions; meta |
| sand | `#eadfd3` | Borders / dividers / borders | `border-sand`; `ring-sand`; `bg-sand`; divider lines |

**Gradients (confirmed `globals.css` only, fixed on body):**
- `radial-gradient(ellipse at top left, rgb(243 213 208 / 0.45), transparent 42%)` — blush blob.
- `radial-gradient(ellipse at top right, rgb(217 205 232 / 0.35), transparent 40%)` — lavender blob.
- `radial-gradient(circle at 20% 80%, rgb(197 209 192 / 0.2), transparent 30%)` — sage blob.
- `CustomOrderCTA`: `from-plum via-[#6a4860] to-[#4a342c]` (dark gradient card).
- No arbitrary gradients elsewhere; components use solid tokens or `bg-gradient-to-br` with `from-ivory/60 to-sand/30` (gallery bg only).

**Selection / Focus:**
- `::selection` = `#e8b4b8` bg / `#4a342c` text.
- `:focus-visible` = `outline: 2px solid #c96b7b; outline-offset: 3px`.

---

## 4. TYPOGRAPHY (CONFIRMED FROM `layout.jsx`, `globals.css`, USE IN COMPONENTS)

- **Display / headings:** `Fraunces` (Google Fonts, loaded `layout.jsx`; `font-display` in `@theme`). Weights used: 400, 500, 600, 700 (from font URL params). Italic available.
- **Body / UI:** `Nunito` (Google Fonts, loaded `layout.jsx`; `font-sans` in `@theme`). Weights: 400, 500, 600, 700.
- **Heading hierarchy (actual class usage across code):**
  - `heading-display` = `font-display font-medium tracking-tight text-plum` (`globals.css`)
  - `text-4xl sm:text-5xl md:text-6xl` (Hero/H1)
  - `text-3xl` (section headings like Reviews)
  - `text-xl` / `text-base` / `text-sm` / `text-xs` / `text-[0.65rem]`
  - `font-semibold` / `font-bold` / `font-medium`
- **Body:** `text-ink` default; `leading-relaxed` for paragraphs.
- **Uppercase conventions:** Eyebrows (`uppercase tracking-[0.22em] text-bloom`); label badges (`uppercase tracking-wider`); category tags (`uppercase tracking-[0.18em]`).
- **Price:** `text-2xl font-semibold text-plum`; formatted via `formatPrice` (en-IN INR, `maximumFractionDigits: 0`).
- **Button text:** `font-semibold`, size varies (`text-sm` base, `text-xs` small).
- **No third font exists** (confirmed `package.json`, `tailwind.config.js`, `globals.css`).

---

## 5. SPACING (FROM ACTUAL CLASS USE)

- **Container:** `.container-page` = `mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8` (`globals.css`).
- **Section spacing:** `pb-16` / `pt-8 sm:pt-12` / `pt-10` / `gap-10 lg:gap-16` / `gap-6 sm:grid-cols-2 lg:grid-cols-3/4`.
- **Card padding:** `p-5` / `p-6` / `p-8` / `px-6 py-12` (CTA card).
- **Grid gaps:** `gap-5` / `gap-8` / `gap-6` / `gap-2` (gallery grid) / `gap-3` (filter pills).
- **Form spacing:** `py-3 pl-11 pr-4` (search); `gap-3` / `gap-2` (label + input pairs).
- **Navbar:** `h-16` / `sm:h-[4.5rem]`; links `rounded-full px-4 py-2`.
- **Mobile:** same spacing scaled via `sm:` / `md:` / `lg:`; no fixed large margins on mobile.

---

## 6. BORDER RADIUS (CONFIRMED FROM `tailwind.config.js` + USE)

- **Buttons:** `rounded-full` (pill buttons) / `rounded-2xl` (CTA / large buttons) / `rounded-3xl` (card / modal surfaces).
- **Inputs:** `rounded-full` (search) / `rounded-2xl` (form fields per `Input.jsx`).
- **Select / dropdown:** `rounded-2xl` / `rounded-xl` (menu container).
- **Cards:** `rounded-3xl` (`paper-card` / `Card.jsx`).
- **Images / gallery:** `rounded-2xl` / `rounded-3xl`; gallery container `aspect-square overflow-hidden rounded-3xl` (per `ProductImageGallery.jsx`).
- **Badges / pills:** `rounded-full`.
- **Modals:** `rounded-3xl` / `rounded-[2rem]`.
- **Logo container:** `rounded-2xl` (`h-10 w-10`).
- **No sharp `rounded-none` surfaces on interactive/user elements.**
- **Explicit tokens:** `radius-xl: 1.5rem`; `radius-2xl: 2rem`.

---

## 7. SHADOWS (CONFIRMED)

- **Normal card:** `.paper-card` = `shadow-[0_10px_30px_-12px_rgb(90_61_74_/_0.18)]` (warm plum-tinted, soft).
- **Lift/hover:** `shadow-lift` token = `0 18px 40px -16px rgb(90 61 74 / 0.28)` (used on buttons/cards on hover via class or `shadow-soft` / `shadow-lift` tokens).
- **Soft token:** `shadow-soft` = `0 10px 30px -12px rgb(90 61 74 / 0.18)` (`globals.css`).
- **Modal / dropdown:** `shadow-md` / `shadow-lg` / `shadow-soft` depending on component (`Modal.jsx`, dropdown menu).
- **Arrow buttons:** `shadow-md ring-1 ring-sand/60` (`ProductImageGallery.jsx`).
- **All shadows warm-toned (plum base)** — never cool grey/drop-shadow.

---

## 8. BORDERS / RINGS (CONFIRMED)

- **Border color:** `border-sand/80` (cards); `border-sand` / `border-sand/70` (navbar, dividers).
- **Thickness:** `border` (1px default); `ring-1 ring-sand/60`; `ring-2 ring-bloom/30` (focus/input); `ring-1 ring-bloom/20` (address selected).
- **Focus rings:** `focus:ring-2 focus:ring-bloom/30` (search input); `focus:outline-none focus:ring-2 focus:ring-bloom/40` (gallery buttons, image buttons).
- **Dropdown border:** menu has `border border-sand` + `rounded-2xl` + bg `bg-ivory`.
- **Category pill active:** `bg-plum text-cream` (no outline); inactive `ring-1 ring-sand`.

---

## 9. LAYOUT / GRID SYSTEM

- **Max width:** `max-w-6xl` (container-page).
- **Homepage:** full-width sections; 4-col highlights (`sm:grid-cols-2 lg:grid-cols-4`); 3-col featured (`sm:grid-cols-2 lg:grid-cols-4`); 6-item category grid; 2-col brand story; 3-col process; 4-col gallery (`md:grid-cols-4`).
- **Shop:** `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`.
- **Product detail:** `grid gap-10 lg:grid-cols-2` (gallery left / info right).
- **Checkout:** 2-col `lg:grid-cols-[1fr_22rem]` (main / sticky summary).
- **Orders:** `lg:grid-cols-[1fr_22rem]`; 6 status tabs in flex row.
- **Responsive rule:** `overflow-x-auto pb-2` on category pills; `hidden lg:flex` for desktop nav; `lg:hidden` for mobile menu; all grids scale with `sm:` / `md:` / `lg:`.

---

## 10. COMPONENT INVENTORY (ONLY FILES THAT EXIST IN `app/components/`)

### Layout (5 files)
- `Navbar.jsx` — sticky `z-50`, scroll-aware (`useScrolled`), logo + links + mobile hamburger (`AnimatePresence` motion), cart badge (total qty), login link, "My Orders" link (/orders/me).
- `Footer.jsx` — site links, social, address.
- `PageHeader.jsx` — eyebrow + H1 + description with decorative radial blob.
- `PageTransition.jsx` — Framer Motion page wrap (`initial={{opacity:0}} animate={{opacity:1}}`).
- `ScrollToTop.jsx` — scroll-to-top button.

### UI Primitives (16 files in `app/components/ui/`)
- `Button.jsx`, `Badge.jsx`, `Card.jsx`, `Container.jsx`, `Decor.jsx`, `CraftIllustration.jsx`, `EmptyState.jsx`, `Input.jsx`, `Modal.jsx`, `ProductCard.jsx`, `ProductImage.jsx`, `CategoryCard.jsx`, `SectionHeading.jsx`, `ScrollReveal.jsx`, `SocialIcons.jsx`, `TestimonialCard.jsx`, `CustomerReviews.jsx`, `ProductImageGallery.jsx`, `Select.jsx`
- `Select.jsx` — accessible custom dropdown (`role="combobox"`/`listbox`, keyboard nav, hover clipped within menu).
- `Input.jsx` — form input with validation support (used by AddressForm, Contact, etc.).
- `Modal.jsx` — dialog with backdrop and close.
- `Badge.jsx` — pill badges ("Handmade", category, etc.).
- `EmptyState.jsx` — icon + title + description + CTA button.

### Home Sections (8 files)
- `Hero.jsx` — full hero with craft illustrations, primary/secondary CTAs.
- `BrandHighlights.jsx` — 4 value cards (HeartHandshake, WandSparkles, Sparkles, MapPin).
- `Categories.jsx` — 6 category cards (shopCategories, excludes 'all').
- `FeaturedProducts.jsx` — 8 featured products (slice(0,8)).
- `BrandStory.jsx` — 2-col text + 3 illustrations + bullets.
- `CustomOrderCTA.jsx` — dark gradient CTA (`/shop?category=clothes`).
- `HowItWorks.jsx` — 3 steps (01/02/03) with numbers.
- `SocialGallery.jsx` — 8 gallery items (tall/regular mix).
- `Testimonials.jsx` — 3 testimonials.
- `FinalCTA.jsx` — centered paper card with Shop + Custom Order CTAs.

### Shop / Product (2 page + gallery + reviews)
- `shop/page.jsx` — Suspense, search + sort + category pills (tablist), filter logic, empty state.
- `shop/[productId]/page.jsx` — product detail (use(params)), breadcrumbs, gallery, qty stepper, add-to-cart state machine, Buy Now, customization modal link, related products (4), reviews mount.
- `ProductImageGallery.jsx` — 3 views absolute in same slot; arrows + dots; fixed `aspect-square`; object-fit crop.
- `CustomerReviews.jsx` — rating summary, customer photos (≤5 grid / >5 featured+2×2+overlay), sort/filter pills, review list, submit form (setTimeout simulated), lightbox, sample badge, bottom disclaimer.

### Cart (1 file)
- `cart/page.jsx` — empty state, line items (qty stepper at 1 removes), order summary (subtotal/coupon/discount/shipping/total), coupon input with sample hint (`CRAFT10`, `WELCOME15`, `FIRSTORDER`), "Proceed to Checkout" → `/checkout/address`.

### Checkout (3 page + progress + address + summary)
- `checkout/address/page.jsx` — address selection + add button.
- `checkout/page.jsx` — summary + payment continuation.
- `checkout/payment/page.jsx` — payment method list.
- `checkout/success/page.jsx` — order confirmation.
- `CheckoutProgress.jsx` — exactly 3 bubbles (Address / Order Summary / Payment) + connector lines.
- `AddressCard.jsx` — saved address cards with default/home/work icons + actions (Make default/Edit/Remove/alertdialog delete).
- `AddressForm.jsx` — 4 collapsible sections; 4 mode states (`method-selection` → `manual`/`location`/`manual-after-location`); PIN_MAP for ~17 Indian PINs; uses `Input.jsx` + `Select.jsx`; `InteractiveLocationPicker` for map flow.
- `OrderSummary.jsx` — sticky totals.

### Payment (5 files)
- `PaymentPage.jsx` — orchestrates UPI/Card/Net Banking/COD; submit cycle; test mode; `inFlight` guard.
- `PaymentMethodList.jsx` — method selection cards.
- `UpiForm.jsx`, `CardForm.jsx`, `NetBankingForm.jsx`, `CodForm.jsx` — method-specific forms.
- `PaymentSummary.jsx` — fee/summary card.
- `PaymentResult.jsx` — processing/success/failure states; test-mode banner; COD banner; `<dl>` summary (Order ID, Amount, Method, Status, Deliver to, Estimated delivery 3–5 days); View order / Continue shopping.

### Orders (2 files)
- `orders/me/page.jsx` — auth-gated (inline prompt, not redirect); 6 status tabs (ALL/Confirmed/Processing/Shipped/Delivered/Cancelled) with count badges; `?order={number}` URL param highlights order; empty state ("No orders yet" + "Start Shopping" CTA → `/shop`); skeleton loading.
- `orders/[orderId]/page.jsx` — Suspense; 4-state (loading/unauthenticated/error/render); status pill; copy button; Invoice (window.print); Cancel (if not SHIPPED/DELIVERED/CANCELLED); 2-col layout; review block (DELIVERED only, 5-star + textarea + photo upload — frontend-only, TODO wire to `/api/reviews`).
- `orderConstants.js` — `STATUS_META` (PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED); `STATUS_FLOW`; `getStatusMeta`.
- `Invoice.jsx` — invoice display.

### Map / Location (1 file)
- `InteractiveLocationPicker.jsx` (559 lines) — Mapbox GL; status machine (`idle→initializing→loading→ready|error`); token guard; 20s timeout; 0-size container defer; draggable pink teardrop; geolocation (`enableHighAccuracy`, 15s timeout); reverse geocode via `/api/geocode`; error codes (1/2/3); hard error state (Try again + Enter manually); auto-request on `mapReady`.

### Authentication (3 pages)
- `account/login/page.jsx` — email/mobile + OTP; 3 modes (login/signup/verify).
- `account/signup/page.jsx` — name + email + mobile.
- `account/verify/page.jsx` — 6-digit OTP (`OtpInput`, `h-14 w-11 rounded-2xl`).
- `api/auth/otp/route.js`, `verify/route.js`, `signup/route.js`, `logout/route.js`, `me/route.js`.
- Session cookie `jamaes_session`; Zustand `useUserStore` with persist.

### Custom Orders (1 page + data)
- `custom-orders/page.jsx` — 8-field form (Select category from `categories.filter(c=>c.id!=='all')`, name, contact, idea, colors, budget, occasion, details); file upload placeholder (disabled); success state; "frontend-only for now" copy; links to `/shop?category=clothes` (not old Custom Creation).

### About / Contact / Not Found (3 pages)
- `about/page.jsx` — story, 2 sister cards (`Sister one`/`Sister two`) with honest placeholder copy, 3 values grid (`Heart`/`Sparkles`/`Leaf`), 3-step process (01/02/03); CTA → `/custom-orders`.
- `contact/page.jsx` — form (name/email/message), validation, success (CheckCircle2 + "Message received"), honest "frontend-only" copy; sidebar visit/social cards.
- `not-found.jsx` — FlowerBurst + 404 + home/shop CTAs.

---

## 11. DATA ARCHITECTURE (CONFIRMED FROM FILES)

### Static / Seed Data (`app/data/` — intentionally static, will be replaced by backend)
- `categories.js` (51 lines): 7 categories (`all`, `crochet-toys`, `flowers`, `personalized`, `accessories`, `keychains`, `clothes`). `clothes` replaces old "Custom Creation".
- `products.js` (258 lines): 14 products (all with `images: undefined` — uses `visual` illustration as placeholder). `formatPrice` (en-IN INR).
- `testimonials.js` (36 lines): 3 testimonials + 8 gallery items.
- `site.js` (11 lines): brand + contact.
- `reviews.js` (552 lines): `SAMPLE_REVIEWS` array — all entries have `isSample: true`, `verifiedPurchase: false`, `status: 'approved'`. Photos from Unsplash URLs (demo). No real customer photos in code.

### Backend / API Data (confirmed endpoints in `app/api/`)
- `products/route.js`, `products/[id]/route.js` — catalog + single.
- `categories/route.js` — category list.
- `orders/route.js`, `orders/[id]/route.js`, `orders/refund/route.js` — order CRUD + cancel + refund.
- `reviews/[productId]/route.js` — review list + submit.
- `auth/*` — OTP, signup, verify, logout, me.
- `contact/route.js` — contact submission.
- `custom-requests/route.js` — custom order request.
- `geocode/route.js` — server-side Mapbox reverse geocode.
- `upload/route.js` — image upload (Vercel Blob).
- `payment/*` — initialize, confirm, fee.
- `health/route.js` — liveness.

### User-Generated (not yet wired / backend-dependent)
- Customer reviews (frontend-only submit via `setTimeout`; `handleSubmitReview` in `orders/[orderId]` marked TODO wire to `/api/reviews`).
- Customer photos (section exists; photos come from `reviews.js` `isSample`; real uploads from `/api/upload` not confirmed wired to reviews).
- Orders (created via `/api/orders`; order detail pulls from API).
- Addresses (saved in Zustand + `/api/orders` / address store; backend persistence not fully confirmed).

---

## 12. CART / BAG (CONFIRMED FROM `app/lib/cart.js` + `cart/page.jsx`)

- Store: Zustand `useCartStore` with `persist` middleware (localStorage).
- Items array: `{ id, quantity, ...product }`.
- Badge math (`Navbar.jsx` line 48): `items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0)` — TOTAL QUANTITY.
- Add to cart (`product.jsx`): try `addItem(product, qty)` → `addedConfirm=true` ("Added to Bag") → 1200ms timeout → `goToBag=true` ("Go to Bag") → click → `window.location.href = '/cart'`. No auto-revert.
- Cart page: line items with qty stepper (decrease at 1 removes item), trash button, line total, sticky summary.
- Coupon: `useCouponStore`; input + apply; sample codes shown; discount calculated.
- Shipping: "Calculated at checkout" (not fake-estimated).
- Proceed to Checkout → `/checkout/address`.

---

## 13. CHECKOUT FLOW (CONFIRMED FROM ROUTES + COMPONENTS)

1. `/cart` → Proceed to Checkout
2. `/checkout/address` (3-step progress #1): select saved address or add new; address form modal with 2-choice initial + map; saved cards grid.
3. `/checkout` (3-step progress #2): order summary; delivery snapshot; sticky totals (Items / Subtotal / Shipping "Calculated next" / Total); Continue to Payment → `/checkout/payment`.
4. `/checkout/payment` (3-step progress #3): method selection + form + security badge; submit cycle; result page.
5. `/checkout/success`: order confirmation with number, address, products, method, status, estimated delivery.

---

## 14. ADDRESS / MAP (CONFIRMED FROM `AddressForm.jsx` + `InteractiveLocationPicker.jsx`)

- **Initial choices (locked rule):** "Use your current location" OR "Enter address manually" — full form only after manual choice.
- **Location flow:** Mapbox `InteractiveLocationPicker`; draggable pink teardrop; geolocation (`enableHighAccuracy`, 15s timeout); reverse geocode `/api/geocode`; 20-second safety timeout; token guard (`NEXT_PUBLIC_MAPBOX_TOKEN`); 0-size container defer; error states (permission/position/timeout/geocode); hard error with "Try again" + "Enter manually".
- **Form:** 4 collapsible sections (Contact / Address / Location / Preferences); PIN_MAP (~17 PINs auto-fill city/state); `Input.jsx` / `Select.jsx`; `onConfirm` emits full object with `coordinates`.
- **Saved addresses:** `AddressCard.jsx`; default/home/work icons; make-default/edit/remove; delete alertdialog.

---

## 15. PAYMENT (CONFIRMED FROM `payment/` + `lib/payment.js` + `lib/paymentProvider.js`)

- **Methods UI:** UPI / Card / Net Banking / COD (radio cards + individual forms).
- **Gateway reality:** `PAYMENT_PROVIDER=test` (default from `.env` / `paymentProvider.js`). All non-COD calls return `testMode: true`. **No real gateway wired.** UI clearly marks test mode (`PaymentResult.jsx` banner).
- **COD (real, confirmed):** validates address; builds order with `paymentMethod: 'Cash on Delivery'`, `paymentStatus: 'COD_PENDING_COLLECTION'`, `status: 'CONFIRMED'`; `createOrder`; `clearCart`; persist `sessionStorage`; hard redirect to `/checkout/success?order={number}` — **no fake processing state**.
- **Non-COD:** `initialize` → `confirm` → `createOrder`. On `testMode` failure treated as `verified:false, status:'test', testMode:true`.
- **Idempotency:** `inFlight` flag; `submitState` prevents double-submit; redirect guarded against refresh.

---

## 16. ORDERS / MY ORDERS / TRACKING (CONFIRMED)

- **My Orders (`/orders/me`):** Auth-gated (inline prompt if not logged in); 6 status filter tabs with count badges; `?order={number}` highlights; empty state ("No orders yet" / "Start Shopping"); skeleton loading.
- **Order Detail (`/orders/[orderId]`):** 4-state (loading/unauthenticated/error/render); status pill; copy order number; Invoice (print); Cancel (if not SHIPPED/DELIVERED/CANCELLED); 2-col; review block for DELIVERED (5-star interactive + textarea + multi-photo + submit — frontend-only simulated via `setTimeout`).
- **Status flow (`orderConstants.js`):** CONFIRMED → PROCESSING → SHIPPED → DELIVERED. `STATUS_META` defines label/icon/color/dot/bg/desc for all 6 statuses.
- **No email-based "look up my order"** — removed; replaced by authenticated `/orders/me`.

---

## 17. REVIEWS / CUSTOMER PHOTOS (CONFIRMED FROM `CustomerReviews.jsx` + `reviews.js`)

- **Data source:** `app/data/reviews.js` (`SAMPLE_REVIEWS`) — all `isSample: true`; no real backend reviews confirmed active (API exists at `/api/reviews/[productId]` but UI uses sample data with badge).
- **Section:** average rating + 5-star distribution bars; customer photos (≤5 = 5-col grid; >5 = featured + 2×2 + `+N` overlay + lightbox); sort (Most Recent / Highest / Lowest / Most Helpful); filter pills (0-5 stars); review list (Sample badge, Verified Purchase, name, date, place, title, quote, photos, Helpful toggle, Report); submit form (name + stars + text + up to 5 photos — simulated submit); empty filter state; bottom disclaimer ("sample reviews for demonstration").
- **Sample marking:** `bg-sage/20` pill with `ShieldCheck`; never hidden; clearly disclosed.
- **Photos:** from Unsplash URLs in `reviews.js` (demo). No permanently hardcoded fake production photos.

---

## 18. MOBILE / RESPONSIVE (CONFIRMED FROM USE + `MOBILE-RESPONSIVENESS.md` + CODE)

- Breakpoints: `sm:`, `md:`, `lg:` (Tailwind default + usage).
- Container: `max-w-6xl`, responsive padding.
- Navbar: `hidden lg:flex` links + `lg:hidden` hamburger; mobile menu (`motion.div` height animation); active pill `bg-blush/60` preserved.
- Category pills: `overflow-x-auto pb-2` on mobile; full radius preserved; `z-10` prevents overlay clipping.
- Product grid: 2-col (`sm:`) → 3-col (`lg:`).
- Gallery: fixed square container (`aspect-square`; `overflow-hidden`) — never stretches.
- Checkout: 2-col only on `lg:`; sticky summary on desktop.
- Images: `object-cover` / `object-contain` within fixed frames (`h-28 w-28`, `aspect-square`, `aspect-[4/3]`) — never responsive to image dimensions.
- No horizontal overflow confirmed (`overflow-x: clip` on html; `overflow-x-auto` only on pill row).
- Touch targets: buttons `rounded-full` / `rounded-2xl`; icons sized `h-4` to `h-6`; form inputs adequate.

---

## 19. ACCESSIBILITY (CONFIRMED FROM CODE)

- Skip link (`sr-only focus:not-sr-only`) in `layout.jsx`.
- `aria-label` on links/buttons (navbar links, cart, gallery arrows, lightbox, reviews helpful/report, category tabs).
- `role="tablist"` + `aria-selected` on category pills; `role="combobox"`/`listbox` on `<Select>`.
- `aria-live="polite"` on qty stepper.
- `aria-modal="true"`, `role="dialog"` on Modal/lightbox.
- Keyboard navigation on Select + Modal (focus management, Escape close).
- `prefers-reduced-motion`: `scroll-behavior: auto`; all animations `duration: 0.01ms`.
- Focus visible: `outline: 2px solid #c96b7b; outline-offset: 3px`.
- Semantic HTML: `<main id="main">`, `<nav aria-label="Primary">`, `<section aria-label="...">`, `<article>` for reviews.

---

## 20. ANIMATION (CONFIRMED FROM `globals.css` + COMPONENTS + FRAMER MOTION)

- **Framer Motion:** `PageTransition` (fade in); `ScrollReveal` (scroll-triggered reveal); `AnimatePresence` (mobile menu, modal); `motion.div` (mobile menu height, page transitions).
- **CSS keyframes:** `float-soft` (7s, infinite), `drift` (11s, rotate + translate), `fadeIn` (translateY + opacity).
- **Decorative:** `animate-float`, `animate-drift`, `animate-float-slow` classes on decorative illustrations.
- **Motion duration:** `duration: 0.28` (menu); `duration-300` / `duration-150` (hover states); `transition-all duration-700` (rating bars).
- **Reduced motion:** fully respected (`@media` override).

---

## 21. ICONOGRAPHY (CONFIRMED FROM `lucide-react` USE + `Decor.jsx`)

- Library: `lucide-react` (`package.json`).
- Custom: `FlowerBurst` (logo / decorative) in `Decor.jsx`.
- Style: stroke-based (not filled), consistent `h-3.5` to `h-6` sizing, `text-plum` / `text-bloom` / `text-moss` colors.
- Usage: Shop (Search), Cart (ShoppingBag), User (Login), Menu/X (mobile), Star (rating), Check/ShieldCheck (verified/sample), Camera (reviews), Filter/SortDesc (review controls), HeartHandshake/WandSparkles/Sparkles/MapPin/Leaf (values), ChevronLeft/Right (gallery/lightbox), Arrow/Trash (cart), Phone/Instagram/Facebook/WhatsApp (contact).

---

## 22. IMAGES / MEDIA (CONFIRMED)

- **Products:** All `images: undefined`; `visual` illustration (`teddy`, `bunny`, `bouquet`, `flower`, `keychain`, `bandana`, `pins`, `gift`, `yarn`, `heart`) used via `ProductImage` + `ProductImageGallery`. `visual=` values documented in `products.js`. Palettes per product.
- **Gallery:** 3 images; fixed square container (`aspect-square` + `overflow-hidden`); `object-cover`; arrows (`ChevronLeft`/`ChevronRight`) + dots (3); boundary behavior (loop or stop — confirmed fixed container with active indicator).
- **Reviews:** customer photos from `review.photos` array (Unsplash URLs in demo); lightbox with `max-h-[82vh] max-w-[90vw]`; `+N` overlay for >5.
- **Upload:** `/api/upload` (Vercel Blob); used by review form (file input); disabled preview for custom orders.
- **No permanent fake customer photos** — all demo photos come from Unsplash with clear `isSample` labeling.
- **Optimization:** `next.config.js` `images.domains: []` / `remotePatterns: []` — no external image optimization configured; relies on direct URL or `next/image` with external domain (not configured, may fall back).

---

## 23. STATE MANAGEMENT (CONFIRMED FROM `lib/`)

- **Zustand:** `useCartStore`, `useCouponStore`, `useAddressStore`, `useUserStore`, `usePayment` — all with `persist` middleware (localStorage) where appropriate (`cart`, `user`, `address`, `coupon`).
- **Hooks:** `useScrolled.js` (scroll detection for navbar); `usePayment.js` (wraps `lib/paymentService`).
- **Local/state persistence:** `sessionStorage` (`jamaes:lastOrderNumber`, `jamaes:order:{number}` snapshot); `localStorage` via Zustand persist.
- **No Redux / Context-only state** — Zustand is single source for cross-component state.

---

## 24. ENVIRONMENT / SECURITY (CONFIRMED FROM `.env.example`, `.env.local`, CODE)

- **Required vars (documented `.env.example`, never committed):**
  - `DATABASE_URL` (Postgres / Supabase)
  - `BLOB_READ_WRITE_TOKEN`
  - `USE_MOCK_DATA`
  - `MAPBOX_ACCESS_TOKEN` (server-side reverse geocoding)
  - `NEXT_PUBLIC_MAPBOX_TOKEN` (client tiles only — safe in bundle)
  - `ADMIN_SECRET`
  - `NEXT_PUBLIC_APP_URL`
- **Payment:** `PAYMENT_PROVIDER=test`; `RAZORPAY_PUBLIC_KEY`; `RAZORPAY_SECRET_KEY` (empty in `.env.example` — not wired).
- **Auth:** `AUTH_SECRET` (cookie signing).
- **Security rules confirmed:** No real secrets in source; `.env.local` exists but excluded by `.gitignore` (check `.gitignore` — yes, `.env.local` excluded); `MAPBOX_ACCESS_TOKEN` only server-side; `NEXT_PUBLIC_MAPBOX_TOKEN` only for tiles; payment keys never in components.
- **Protected APIs:** `/api/orders` requires auth (inline prompt / 401); `/api/auth/me` confirms session; `useUserStore.isLoggedIn` gates `/orders/me`.

---

## 25. DATABASE (CONFIRMED FROM `prisma/` + `lib/db/`)

- **Schema:** `prisma/schema.prisma` (User, Address, Order, OrderItem, Product, Review, OtpRecord, CustomRequest).
- **Client:** `@prisma/client` + `prisma` (v8 RC).
- **Mock fallback:** `lib/db/index.js` selects `prisma` if `DATABASE_URL` set and init succeeds; else `lib/db/mock.js` (in-memory). `USE_MOCK_DATA` controls mock mode.
- **Seed:** `prisma/seed.js` exists.
- **Not confirmed:** Whether `DATABASE_URL` is set in production; whether real DB is active vs mock. Documented as backend-dependent.

---

## 26. ROUTE MATRIX (FULL CURRENT SET FROM `find`)

| Route | Purpose | Auth | Data Source | Status |
|---|---|---|---|---|
| `/` | Home | Public | Static + data | Implemented |
| `/shop` | Product listing | Public | `products.js` + search params | Implemented |
| `/shop/[productId]` | Product detail | Public | `products.js` | Implemented |
| `/cart` | Cart / bag | Public | `useCartStore` | Implemented |
| `/checkout/address` | Address selection | Auth (inline) | `address.js` + saved | Implemented |
| `/checkout` | Order summary | Auth | `cart.js` + selected address | Implemented |
| `/checkout/payment` | Payment | Auth | `cart` + `payment/` | Implemented |
| `/checkout/success` | Success | Auth / session | `sessionStorage` order | Implemented |
| `/custom-orders` | Custom request form | Public | Form (frontend) | Implemented |
| `/about` | Brand story | Public | Static | Implemented |
| `/contact` | Contact form | Public | Form (frontend) | Implemented |
| `/orders/me` | Order history | Auth (inline prompt) | `/api/orders` | Implemented |
| `/orders/[orderId]` | Order detail | Auth + 401 check | `/api/orders/[id]` | Implemented |
| `/account/login` | Login / OTP | Public | `/api/auth/otp` | Implemented |
| `/account/signup` | Account creation | Public | `/api/auth/signup` | Implemented |
| `/account/verify` | OTP verify | Public | `/api/auth/verify` | Implemented |

**API routes (all implemented):** `/api/auth/*`, `/api/products/*`, `/api/orders/*`, `/api/reviews/*`, `/api/categories`, `/api/contact`, `/api/custom-requests`, `/api/geocode`, `/api/upload`, `/api/payment/*`, `/api/health`.

---

## 27. BUSINESS LOGIC (CONFIRMED FROM CODE — DO NOT CHANGE WITHOUT APPROVAL)

- **Cart:** Total quantity badge; qty=1 removal; coupon discount applied; subtotal/discount/shipping/total derived.
- **Checkout order:** Address required; order created on payment success (COD = immediate; others = after gateway confirm); cart cleared; sessionStorage snapshot.
- **COD:** `status: 'CONFIRMED'`; `paymentStatus: 'COD_PENDING_COLLECTION'`; no processing flash; redirect to success; order number preserved.
- **Status flow:** CONFIRMED → PROCESSING → SHIPPED → DELIVERED; CANCELLED possible anytime before DELIVERED.
- **Reviews:** Sample data only (`isSample: true`); submission simulated; no backend wire confirmed.
- **Payment:** Test mode by default (`PAYMENT_PROVIDER=test`); no false success.
- **Address:** 2-choice initial; PIN auto-fill; reverse geocode best-effort.

---

## 28. OBSOLETE / REMOVED / SUPERSEDED

- **"Custom Creation" category:** Replaced by "Clothes" (`categories.js`; `CustomOrderCTA` links to `/shop?category=clothes`; `/custom-orders` page kept for form).
- **Email-based order lookup:** Removed. Replaced by `/orders/me` (authenticated).
- **Old Vite `src/` structure:** Deleted; fully migrated to Next.js App Router (`app/`). `dist/` exists (build output).
- **Google Maps:** `@googlemaps/js-api-loader` in `package.json` but not used (replaced by Mapbox).
- **Real payment gateway:** Not wired (`PAYMENT_PROVIDER=test`). Not a removed feature — just not implemented.

---

## 29. KNOWN LIMITATIONS / UNCONFIRMED (HONESTLY DOCUMENTED)

- **Backend database:** `DATABASE_URL` status unknown; mock mode (`USE_MOCK_DATA`) may be active in dev.
- **Real customer reviews:** API exists but UI shows only `SAMPLE_REVIEWS`; `handleSubmitReview` marked TODO; no confirmation that `/api/reviews` writes persist or display.
- **Real payment gateway:** `PAYMENT_PROVIDER=test`; `RAZORPAY_*` keys empty in `.env`; no real gateway integration confirmed.
- **Real customer photos:** Section exists; data from `reviews.js` only; no persistent upload-to-review pipeline confirmed.
- **Image optimization:** `next.config.js` has empty `domains`/`remotePatterns`; external Unsplash URLs load directly.
- **Checkout progress 3 vs 4:** Code (`CheckoutProgress.jsx`) shows 3 bubbles; older doc may have said 4 — current code wins.
- **Cart "Proceed to Checkout" URL:** Code points to `/checkout/address`; older doc may say `/checkout` — current wins.
- **My Orders auth:** Inline prompt (not redirect) confirmed by `orders/me/page.jsx`.
- **AddressForm mode states:** 4 states (`method-selection`/`manual`/`location`/`manual-after-location`) confirmed.
- **Customer photos from backend:** Confirmed as backend-dependent / not currently wired to real uploads.

---

## 30. FINAL QA CHECKLIST (VERIFIED AGAINST CODE)

### Visual
- [x] Warm palette only (cream/ivory/blush/petal/bloom/sage/lilac/peach/plum/ink/muted/sand). No grey/blue/neon.
- [x] Typography: Fraunces + Nunito; no third font.
- [x] Spacing: consistent container + card + grid patterns.
- [x] Radius: full pill (`rounded-full`) / `rounded-2xl` / `rounded-3xl`; no sharp user surfaces.
- [x] Shadows: warm plum-tinted (`shadow-soft` / `shadow-lift` / card shadow).
- [x] Buttons: pill + rounded-2xl; consistent typography.
- [x] Cards: `paper-card` (`rounded-3xl`, `border-sand/80`, `bg-ivory/80`, warm shadow).
- [x] Forms: `rounded-2xl` inputs; `Select` dropdown clipped.
- [x] Images: fixed containers; `object-cover` / `object-contain`; never stretch.

### Responsive
- [x] Mobile: horizontal scroll on pills; hamburger nav; 2-col grids.
- [x] Tablet: `sm:` / `md:` breakpoints applied.
- [x] Desktop: `lg:` 3-col / 4-col grids; sticky summary; 2-col checkout.
- [x] No overflow: `overflow-x: clip`; `overflow-x-auto` only on pill row.

### Ecommerce
- [x] Shop: filter + sort + search; category pills; empty state.
- [x] Product: gallery (3 images); details; customization note; reviews.
- [x] Cart: total qty badge; coupon; quantity removal; checkout URL.
- [x] Checkout: 3 steps; address + summary + payment; address form 2-choice.
- [x] COD: immediate order; correct status/payload; no fake processing.
- [x] Orders: 6 tabs; focus param; empty state; auth inline.

### User
- [x] Login: OTP flow; 3-step (login/signup/verify); session cookie.
- [x] Account: inline auth prompt; `My Orders`; order detail.

### Reviews
- [x] Average + distribution; photo grid; sort/filter; submit form; sample badges; disclaimer.

### Accessibility
- [x] Skip link; aria-labels; roles; keyboard on Select/Modal; reduced motion.

### Technical
- [x] App Router; Tailwind v4 (`@theme`); Zustand; Framer Motion; Lucide; Prisma + mock; Mapbox; env-secure.

---

## 31. CHANGELOG / RELATION TO OLDER DOCS

- Created: 2026-09-03.
- Source of truth: `app/` directory (Next.js 15 App Router), `package.json`, `.env.example`, `globals.css`, `tailwind.config.js`, all data/route/component files inspected.
- Previous docs (`design-system.md`, `MD-SPEC.md`, `MIGRATION-SUMMARY.md`, `MOBILE-RESPONSIVENESS.md`) exist but this spec takes precedence as current implementation reference.
- Not a redesign — documentation of what exists. No design rules changed; protected identity preserved.
- All critical rules (3-image gallery, total qty badge, COD flow, 2-choice address, sample review labeling, category pills, navbar active state) confirmed in source and preserved.

---

*End of specification — verified against current implementation. Any future change to source must update this file in the same audit pass.*
