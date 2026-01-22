# Simple Variant Implementation (Without Personalize SDK)

## What You Need

Since your variants are already published in Contentstack (as shown in your JSON), you can fetch them using the **Delivery API** directly without needing the Personalize SDK.

### Required (You Already Have These):
- ✅ API Key
- ✅ Delivery Token  
- ✅ Environment
- ✅ Variant UIDs (from your JSON)

### NOT Required:
- ❌ Personalize Project UID
- ❌ Personalize Edge API URL
- ❌ Personalize SDK

## Your Variant UIDs (From Your JSON)

```javascript
USD (Base):  "cs91db6b7e0d7f71e1"
EUR:         "csc4ee31b822d1b0d0"
INR:         "csb474334af86d3526"
```

## How to Fetch Variants

### Method 1: Using Query Parameter (Recommended)

When fetching entries, add the variant UID as a query parameter:

```javascript
// Fetch EUR variant
const query = stack
  .contentType('shoes')
  .entry()
  .query()
  .addParam('x-cs-variant-uid', 'csc4ee31b822d1b0d0'); // EUR

const result = await query.find();
// Returns shoes with EUR prices
```

### Method 2: Using Request Header

Add the variant UID in the request header:

```javascript
fetch('https://cdn.contentstack.io/v3/content_types/shoes/entries', {
  headers: {
    'api_key': 'your_api_key',
    'access_token': 'your_delivery_token',
    'x-cs-variant-uid': 'csc4ee31b822d1b0d0' // EUR
  }
})
```

## Environment Variables Needed

Your `.env.local`:

```bash
# Required
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=your_environment

# NOT required for basic variant fetching
# CONTENTSTACK_PERSONALIZE_PROJECT_UID=optional
# CONTENTSTACK_PERSONALIZE_EDGE_API_URL=optional
```

## Why This Works

Looking at your JSON:

```json
{
  "uid": "blt7758c2d844a52c7f",
  "_content_type_uid": "shoes",
  "price": "$150",  // Base USD
  ...
}

{
  "uid": "blt7758c2d844a52c7f",  // Same UID
  "_variant": {
    "_uid": "csc4ee31b822d1b0d0",  // EUR variant
    "_change_set": ["price"]
  },
  "price": "€128.35",  // EUR price
  ...
}
```

The same entry UID has multiple published variants with different prices. Contentstack's Delivery API can return the correct variant when you specify the `x-cs-variant-uid`.

## Do You Want Personalize SDK?

The Personalize SDK is only needed if you want:
- **Auto variant selection** based on user attributes
- **A/B testing** capabilities
- **Analytics** on variant performance
- **Dynamic personalization** rules

For **simple currency switching**, you don't need it! Just use the variant UIDs directly.

## Next Steps

Would you like me to implement:

**Option 1:** Simple variant switching (no Personalize SDK needed) ✅ Recommended
- User manually selects currency
- Fetch variants using query parameters
- Works immediately with your existing setup

**Option 2:** Full Personalize SDK integration (requires project setup)
- Need Personalize Project UID
- Need Personalize module enabled in Contentstack
- More complex setup

Let me know which approach you prefer!
