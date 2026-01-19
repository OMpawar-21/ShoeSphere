# Shoesphere

Shoesphere is a content-driven shoe catalog and product showcase built with Next.js and Contentstack. It features a homepage hero, featured collections, category browsing, detailed product pages, and customer testimonials.

## Features

- Contentstack-powered homepage hero and featured shoes
- Product listing, categories, and dynamic shoe detail pages
- Seller profile details and materials/care information
- Customer reviews display and submission via `/api/testimonials`
- Responsive Tailwind-based UI

## Tech Stack

- Next.js App Router (React 19)
- TypeScript
- Tailwind CSS
- Contentstack Delivery + Management APIs

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` with the Contentstack keys:

```bash
CONTENTSTACK_API_KEY=your_stack_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=your_environment_name

# Required only if you want to submit testimonials
CONTENTSTACK_MANAGEMENT_TOKEN=your_management_token
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Contentstack Setup

- Content models and sample structures are in `Content Types/` (import these into your stack).
- The testimonials API uses the Contentstack Management API to create entries in the `testimonial` content type.

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - build for production
- `npm run start` - start the production server
- `npm run lint` - run lint checks
