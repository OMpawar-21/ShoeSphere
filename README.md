# ShoeSphere

ShoeSphere is a personalized shoe e-commerce catalog built with Next.js and Contentstack. It demonstrates advanced content personalization using Contentstack Personalize, featuring country-based pricing, color variants, and real-time impression tracking.

## Features

### Core Features
- Contentstack-powered homepage hero and featured shoes
- Product listing with pagination
- Category browsing and filtering
- Detailed product pages with specifications
- Seller profile details and materials/care information
- Customer reviews display and submission

### Personalization Features

#### 1. Country-Based Personalization (Currency)
- **Auto-detection**: Automatically detects user's country from IP address
- **Currency switching**: Shows prices in user's local currency (USD, INR, etc.)
- **Variant mapping**: Uses Contentstack Personalize Experience to serve country-specific content
- **Audiences**: 
  - USA → USD pricing (variant 0)
  - India → INR pricing (variant 1)

#### 2. Color Personalization
- **Color variants**: Base, Red, Black color options for products
- **Country-specific color pricing**: Each color has different pricing per country
- **URL-based selection**: Color selection via query parameters (`?color=red`)
- **Dynamic fetching**: Fetches correct variant without page refresh
- **5 Color Audiences**:
  - Base Color (variant 0)
  - Black Color USA (variant 1)
  - Red Color India (variant 2)
  - Black Color India (variant 3)
  - Red Color USA (variant 4)

#### 3. Impression Tracking
- Tracks product views and list impressions
- Reports to Contentstack Personalize for analytics
- Supports both single product and list view tracking

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **CMS**: Contentstack (Delivery + Management APIs)
- **Personalization**: Contentstack Personalize SDK
- **Geolocation**: IP-based country detection via ipapi.co

## Project Structure

```
ShoeSphere/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── shoes/            # Shoe fetching endpoints
│   │   ├── category/         # Category endpoints
│   │   └── testimonials/     # Review submission
│   ├── shoes/                # Shoe listing page
│   └── [url]/                # Dynamic shoe detail page
├── components/               # React components
│   ├── ShoeDetail.tsx        # Product detail with personalization
│   ├── HomeShoeGrid.tsx      # Homepage product grid
│   ├── ShoesGrid.tsx         # All shoes grid
│   ├── CategoryShoesGrid.tsx # Category filtered grid
│   └── TestimonialForm.tsx   # Review submission form
├── contexts/
│   └── CurrencyContext.tsx   # Global currency/country state
├── lib/
│   ├── contentstack.ts       # Contentstack API functions
│   └── personalize.ts        # Personalize SDK integration
└── types/
    └── contentstack.ts       # TypeScript interfaces
```

## How Personalization Works

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Visit                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              IP Detection (ipapi.co)                         │
│              Detects: India / USA / etc.                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Contentstack Personalize SDK                       │
│           sdk.set({ country: "India", color: "Red" })       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Audience Matching                               │
│   Experience 2 (Country): India → variant 1 (INR)           │
│   Experience 3 (Color): Red+India → variant 2               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Variant Aliases Returned                           │
│           cs_personalize_2_1, cs_personalize_3_2            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Fetch Content with Variants                        │
│           GET /api/shoes/adidas?variants=cs_personalize_3_2 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Display Personalized Content                       │
│           Red Shoe with ₹10,200 price (India)               │
└─────────────────────────────────────────────────────────────┘
```

### Two Personalization Experiences

| Experience | Purpose | Attributes | Variants |
|------------|---------|------------|----------|
| Experience 2 | Currency/Pricing | `country` | 0: USD, 1: INR |
| Experience 3 | Color + Country | `country`, `color` | 0: Base, 1: Black USA, 2: Red India, 3: Black India, 4: Red USA |

## Getting Started

### Prerequisites
- Node.js 18+
- Contentstack account with Personalize enabled

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```bash
# Contentstack CMS
CONTENTSTACK_API_KEY=your_stack_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=your_environment_name
CONTENTSTACK_MANAGEMENT_TOKEN=your_management_token

# Contentstack Personalize
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_personalize_project_uid
```

### Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`

## Contentstack Setup

### Content Types

1. **shoes** - Product entries with:
   - `title`, `url`, `description`, `price`
   - `main_image`, `brand_ref`, `category_ref`
   - `color` (string: Base/Red/Black)
   - `size`, `weight`, `heel_height`
   - `material_ref`, `seller_ref`, `testimonials`

2. **homepage** - Homepage configuration with `featured_shoes` reference

3. **category** - Product categories

4. **testimonial** - Customer reviews

### Personalize Setup

#### Experience 2: Country Personalization
- **Attribute**: `country` (string)
- **Audiences**:
  - USA: `country equals "USA"` → Variant 0
  - India: `country equals "India"` → Variant 1

#### Experience 3: Color Personalization
- **Attributes**: `country` (string), `color` (string)
- **Audiences**:
  - Base Color: `color equals "Base"` → Variant 0
  - Black Color USA: `color equals "Black" AND country equals "USA"` → Variant 1
  - Red Color India: `color equals "Red" AND country equals "India"` → Variant 2
  - Black Color India: `color equals "Black" AND country equals "India"` → Variant 3
  - Red Color USA: `color equals "Red" AND country equals "USA"` → Variant 4

### Entry Setup for Personalization

For each product color/country combination, create variant entries:

| Entry | URL | Price | Variant Assigned |
|-------|-----|-------|------------------|
| Adidas Superstar (India Base) | /shoes/adidas-superstar | ₹8,500 | cs_personalize_2_1 |
| Adidas Superstar (USA Base) | /shoes/adidas-superstar | $100 | cs_personalize_2_0 |
| Adidas Superstar Red (India) | /shoes/adidas-superstar-red | ₹10,200 | cs_personalize_3_2 |
| Adidas Superstar Red (USA) | /shoes/adidas-superstar-red | $120 | cs_personalize_3_4 |
| Adidas Superstar Black (India) | /shoes/adidas-superstar-black | ₹9,350 | cs_personalize_3_3 |
| Adidas Superstar Black (USA) | /shoes/adidas-superstar-black | $110 | cs_personalize_3_1 |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/shoes` | GET | Get all shoes with pagination and variants |
| `/api/shoes/[url]` | GET | Get single shoe by URL with variants |
| `/api/category/[slug]` | GET | Get shoes by category |
| `/api/testimonials` | POST | Submit a new testimonial |

### Query Parameters

- `page` - Page number for pagination
- `variants` - Comma-separated variant aliases (e.g., `cs_personalize_3_2`)

## Key Files

| File | Purpose |
|------|---------|
| `lib/personalize.ts` | Personalize SDK initialization, attribute setting, impression tracking |
| `contexts/CurrencyContext.tsx` | Global state for country/currency detection |
| `components/ShoeDetail.tsx` | Product detail page with color personalization |
| `lib/contentstack.ts` | Contentstack API functions with variant support |

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Testing Personalization

1. **Test Country Detection**:
   - Open browser console
   - Look for: `🌍 Detected country: India`
   - Verify prices show in INR (₹)

2. **Test Color Variants**:
   - Visit `/shoes/adidas-superstar`
   - Click "Red" button
   - URL changes to `?color=red`
   - Content updates with Red variant

3. **Test Combined Personalization**:
   - India + Red → ₹10,200 (cs_personalize_3_2)
   - USA + Red → $120 (cs_personalize_3_4)

## Console Logs (Development)

```
🚀 ===== INITIALIZING IP-BASED PERSONALIZATION =====
✅ Personalize SDK initialized
🌍 Auto-detecting country from IP address...
📊 Auto-detection result: {country: "India", currency: "INR"}

🎨 ===== SETTING COLOR PERSONALIZATION =====
🎨 Selected color: "Red"
📋 Setting attributes: {country: "India", color: "Red"}
📊 SDK Manifest: {"activeVariants": {"2": "1", "3": "2"}}
🎨 Color variants (experience 3 only): [cs_personalize_3_2]

📡 Fetching shoe with variants: [cs_personalize_3_2]
```

## License

MIT
