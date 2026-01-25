# Contentstack Personalize SDK - Review Preparation Guide

This document provides a comprehensive explanation of the Contentstack Personalize SDK implementation in ShoeSphere, including code flow, architecture, and potential Q&A for manager review.

---

## Table of Contents

1. [Personalize SDK Overview](#1-personalize-sdk-overview)
2. [Architecture & Code Flow](#2-architecture--code-flow)
3. [SDK Initialization](#3-sdk-initialization)
4. [Core Functions Explained](#4-core-functions-explained)
5. [Personalization Flow](#5-personalization-flow)
6. [Integration with Delivery SDK](#6-integration-with-delivery-sdk)
7. [Potential Questions & Answers](#7-potential-questions--answers)
8. [Debugging & Troubleshooting](#8-debugging--troubleshooting)
9. [Quick Reference](#9-quick-reference)

---

## 1. Personalize SDK Overview

### What is Contentstack Personalize?

Contentstack Personalize is a **real-time personalization engine** that delivers tailored content based on user attributes (location, preferences, behavior).

### Key Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **Attributes** | User properties set in SDK | `{ country: "India", color: "Red" }` |
| **Audiences** | Groups of users based on conditions | "India Users", "USA Users" |
| **Experiences** | Personalization rules | "Country wise Personalize" |
| **Variants** | Different content versions | "USD Pricing", "INR Pricing" |
| **Short UID** | Variant identifier | `0`, `1`, `2` |
| **Full UID** | Complete variant alias | `cs_personalize_2_1` |

### How It Works (High Level)

```
User visits site
      │
      ▼
IP Detection → Country = "India"
      │
      ▼
SDK: set({ country: "India" })
      │
      ▼
SDK matches Audience "India Users"
      │
      ▼
Returns Variant Alias: "cs_personalize_2_1"
      │
      ▼
Delivery SDK: .variants(['cs_personalize_2_1'])
      │
      ▼
User sees INR pricing content
```

---

## 2. Architecture & Code Flow

### File Structure

```
ShoeSphere/
├── lib/
│   ├── personalize.ts          ← Personalize SDK functions
│   └── contentstack.ts         ← Delivery SDK (uses variants)
├── contexts/
│   └── CurrencyContext.tsx     ← Global state management
├── components/
│   └── ShoeDetail.tsx          ← Uses personalization
└── app/
    └── api/shoes/[url]/route.ts ← API accepts variants
```

### Complete Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PERSONALIZATION ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────────────┐                                                    │
│   │   App Loads        │                                                    │
│   │   (layout.tsx)     │                                                    │
│   └────────┬───────────┘                                                    │
│            │                                                                │
│            ▼                                                                │
│   ┌────────────────────┐      ┌─────────────────────┐                      │
│   │ CurrencyProvider   │──────│ initPersonalize()   │                      │
│   │ (Context)          │      │ lib/personalize.ts  │                      │
│   └────────┬───────────┘      └─────────────────────┘                      │
│            │                                                                │
│            ▼                                                                │
│   ┌────────────────────┐      ┌─────────────────────┐                      │
│   │ detectCountryFromIP│──────│ ipapi.co API        │                      │
│   │ (Geolocation)      │      │ (External Service)  │                      │
│   └────────┬───────────┘      └─────────────────────┘                      │
│            │                                                                │
│            ▼ Country = "India"                                              │
│   ┌────────────────────┐                                                    │
│   │ sdk.set({ country })│◄─── Set user attribute                           │
│   └────────┬───────────┘                                                    │
│            │                                                                │
│            ▼                                                                │
│   ┌────────────────────┐                                                    │
│   │ Personalize Engine │ ◄─── Matches audiences in Contentstack            │
│   │ (Contentstack)     │                                                    │
│   └────────┬───────────┘                                                    │
│            │                                                                │
│            ▼                                                                │
│   ┌────────────────────┐                                                    │
│   │ sdk.getVariantAlias│──────► Returns: ['cs_personalize_2_1']            │
│   └────────┬───────────┘                                                    │
│            │                                                                │
│            ▼                                                                │
│   ┌────────────────────┐      ┌─────────────────────┐                      │
│   │ Context State      │      │ variantAliases: []  │                      │
│   │ Updated            │──────│ currency: 'INR'     │                      │
│   └────────┬───────────┘      │ country: 'India'    │                      │
│            │                  └─────────────────────┘                      │
│            ▼                                                                │
│   ┌────────────────────┐                                                    │
│   │ ShoeDetail.tsx     │                                                    │
│   │ (or any component) │                                                    │
│   └────────┬───────────┘                                                    │
│            │                                                                │
│            ▼                                                                │
│   ┌────────────────────┐                                                    │
│   │ fetch(/api/shoes/x │                                                    │
│   │  ?variants=cs_p..) │                                                    │
│   └────────┬───────────┘                                                    │
│            │                                                                │
│            ▼                                                                │
│   ┌────────────────────┐      ┌─────────────────────┐                      │
│   │ Delivery SDK       │──────│ .variants(['...'])  │                      │
│   │ (contentstack.ts)  │      │ Fetches personalized│                      │
│   └────────┬───────────┘      │ content             │                      │
│            │                  └─────────────────────┘                      │
│            ▼                                                                │
│   ┌────────────────────┐                                                    │
│   │ User sees INR      │                                                    │
│   │ personalized price │                                                    │
│   └────────────────────┘                                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. SDK Initialization

### File: `lib/personalize.ts` (Lines 22-63)

```typescript
// Singleton instance
let sdkInstance: Awaited<ReturnType<typeof Personalize.init>> | null = null;
let isInitializing = false;

export async function initPersonalize(): Promise<typeof sdkInstance> {
  // Return existing instance if available
  if (sdkInstance) return sdkInstance;
  
  // Wait if another call is initializing
  if (isInitializing) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!isInitializing) {
          clearInterval(checkInterval);
          resolve(sdkInstance);
        }
      }, 100);
    });
  }

  const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
  
  if (!projectUid) {
    console.error('❌ Project UID not configured');
    return null;
  }

  isInitializing = true;
  
  try {
    sdkInstance = await Personalize.init(projectUid);
    console.log('✅ Personalize SDK initialized');
    isInitializing = false;
    return sdkInstance;
  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    isInitializing = false;
    return null;
  }
}
```

### Why Singleton Pattern?

| Reason | Explanation |
|--------|-------------|
| **Single Source of Truth** | One SDK instance maintains consistent user state |
| **Avoid Re-initialization** | SDK connects to Contentstack - costly to repeat |
| **Race Condition Prevention** | `isInitializing` flag prevents duplicate inits |
| **Memory Efficiency** | Single instance for entire app |

### Initialization Flow

```
initPersonalize() called
        │
        ├── sdkInstance exists? ──► YES ──► Return existing
        │
        ├── isInitializing? ──► YES ──► Wait & poll
        │
        └── NO ──► Set isInitializing = true
                        │
                        ▼
                  Personalize.init(projectUid)
                        │
                        ▼
                  Store in sdkInstance
                        │
                        ▼
                  isInitializing = false
                        │
                        ▼
                  Return sdkInstance
```

---

## 4. Core Functions Explained

### 4.1 `setUserAttributesAndGetVariants()`

**File:** `lib/personalize.ts` (Lines 74-117)

**Purpose:** Set user attributes and get matched variant aliases.

```typescript
export async function setUserAttributesAndGetVariants(
  attributes: Record<string, any>
): Promise<string[]> {
  const sdk = await initPersonalize();
  
  if (!sdk) return [];

  // Set user attributes - triggers audience matching
  await sdk.set(attributes);

  // Get matched variant aliases
  const shortUids = sdk.getVariantAliases();
  
  return Array.isArray(shortUids) 
    ? shortUids.map(id => String(id)) 
    : [];
}
```

**Flow:**
```
setUserAttributesAndGetVariants({ country: "India" })
        │
        ├── Initialize SDK
        │
        ├── sdk.set({ country: "India" })
        │       │
        │       └── Sends to Contentstack
        │               │
        │               └── Matches audience "India Users"
        │
        ├── sdk.getVariantAliases()
        │       │
        │       └── Returns matched variants
        │
        └── Return ['cs_personalize_2_1']
```

---

### 4.2 `detectCountryFromIP()`

**File:** `lib/personalize.ts` (Lines 189-249)

**Purpose:** Detect user's country using IP geolocation services.

```typescript
export async function detectCountryFromIP(): Promise<string | null> {
  // Multiple services for redundancy
  const geoServices = [
    {
      name: 'ipapi.co',
      url: 'https://ipapi.co/json/',
      extractCountry: (data: any) => data.country_name || data.country,
    },
    {
      name: 'ip-api.com',
      url: 'http://ip-api.com/json/',
      extractCountry: (data: any) => data.country,
    },
    {
      name: 'ipwhois.app',
      url: 'https://ipwho.is/',
      extractCountry: (data: any) => data.country,
    },
  ];

  // Try each service until one succeeds
  for (const service of geoServices) {
    try {
      const response = await fetch(service.url);
      const data = await response.json();
      const country = service.extractCountry(data);
      
      if (country) return country;
    } catch (error) {
      continue; // Try next service
    }
  }

  return null; // All failed
}
```

**Why Multiple Services?**
- **Redundancy:** If one service is down, others can work
- **Rate Limits:** Free APIs have limits
- **Reliability:** Increases success rate

---

### 4.3 `setPersonalizeByCountry()`

**File:** `lib/personalize.ts` (Lines 277-355)

**Purpose:** Main function to set personalization based on detected country.

```typescript
export async function setPersonalizeByCountry(
  country: string,
  manualOverride?: Currency
): Promise<{
  shortUids: string[];
  detectedCountry: string;
  suggestedCurrency: Currency;
  finalCurrency: Currency;
}> {
  const sdk = await initPersonalize();
  
  if (!sdk) {
    return { shortUids: [], ... };
  }

  // Get currency suggestion
  const suggestedCurrency = getCurrencySuggestionFromCountry(country);
  const finalCurrency = manualOverride || suggestedCurrency;

  // Set country attribute in Personalize
  await sdk.set({ country: country });

  // Get matched variant aliases
  const shortUids = sdk.getVariantAliases();
  const shortUidsArray = Array.isArray(shortUids) 
    ? shortUids.map(id => String(id)) 
    : [];

  return {
    shortUids: shortUidsArray,
    detectedCountry: country,
    suggestedCurrency,
    finalCurrency,
  };
}
```

---

### 4.4 `autoDetectAndSetPersonalize()`

**File:** `lib/personalize.ts` (Lines 361-381)

**Purpose:** One-call function to auto-detect country and set personalization.

```typescript
export async function autoDetectAndSetPersonalize(
  manualOverride?: Currency
): Promise<{...}> {
  // Detect country from IP
  const country = await detectCountryFromIP();

  if (!country) {
    // Fallback to USA if detection fails
    return setPersonalizeByCountry('United States of America', manualOverride);
  }

  // Set personalize with detected country
  return setPersonalizeByCountry(country, manualOverride);
}
```

**This is the main function called on app load!**

---

### 4.5 `triggerVariantImpressions()`

**File:** `lib/personalize.ts` (Lines 413-503)

**Purpose:** Track impressions for analytics.

```typescript
export async function triggerVariantImpressions(
  shortUids: string[],
  context?: { contentType?: string; page?: string; ... }
): Promise<void> {
  const sdk = await initPersonalize();
  
  if (!sdk || !shortUids.length) return;

  // Extract short UIDs from full UIDs
  const impressionIds = shortUids
    .map((uid) => String(uid).split('_').pop())
    .filter((uid) => uid !== '');

  // Trigger impression for each
  for (const shortUid of impressionIds) {
    await sdk.triggerImpression(shortUid);
  }
}
```

**Why Track Impressions?**
- **Analytics:** Measure which variants are shown
- **A/B Testing:** Compare variant performance
- **Optimization:** Improve personalization rules

---

## 5. Personalization Flow

### Complete Flow with Code Locations

```
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: App Initialization (contexts/CurrencyContext.tsx)                  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   useEffect(() => {                                                        │
│     const init = async () => {                                             │
│       await initPersonalize();                    // Initialize SDK        │
│       const result = await autoDetectAndSetPersonalize();                  │
│       setVariantAliases(result.shortUids);        // Store variants        │
│       setDetectedCountry(result.detectedCountry); // Store country         │
│     };                                                                     │
│     init();                                                                │
│   }, []);                                                                  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: IP Detection (lib/personalize.ts - detectCountryFromIP)            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   fetch('https://ipapi.co/json/')                                          │
│       │                                                                    │
│       ▼                                                                    │
│   { "country_name": "India", "ip": "...", ... }                           │
│       │                                                                    │
│       ▼                                                                    │
│   return "India"                                                           │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Set Attribute (lib/personalize.ts - setPersonalizeByCountry)       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   await sdk.set({ country: "India" });                                     │
│                                                                            │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │ CONTENTSTACK PERSONALIZE ENGINE                                     │  │
│   │                                                                     │  │
│   │  Experience: "Country wise Personalize" (ID: 2)                     │  │
│   │                                                                     │  │
│   │  ┌─────────────────┐    ┌─────────────────┐                        │  │
│   │  │ Audience: USA   │    │ Audience: India │ ◄── MATCHES!           │  │
│   │  │ country = "USA" │    │ country="India" │                        │  │
│   │  │ Variant: 0      │    │ Variant: 1      │                        │  │
│   │  └─────────────────┘    └─────────────────┘                        │  │
│   │                                                                     │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Get Variant Aliases (lib/personalize.ts)                           │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   const shortUids = sdk.getVariantAliases();                               │
│       │                                                                    │
│       ▼                                                                    │
│   Returns: ['cs_personalize_2_1']                                          │
│                                                                            │
│   Format: cs_personalize_<experienceId>_<variantId>                        │
│                           │               │                                │
│                           │               └── 1 = India variant            │
│                           └── 2 = Country Experience                       │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 5: Component Uses Variants (components/ShoeDetail.tsx)                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   const { variantAliases } = useCurrency();                                │
│   // variantAliases = ['cs_personalize_2_1']                               │
│                                                                            │
│   const url = `/api/shoes/${shoeUrl}?variants=${variantAliases.join(',')}`;│
│   // url = "/api/shoes/adidas-superstar?variants=cs_personalize_2_1"       │
│                                                                            │
│   const response = await fetch(url);                                       │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: API Fetches Personalized Content (app/api/shoes/[url]/route.ts)    │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   const variants = searchParams.get('variants')?.split(',') || [];         │
│   // variants = ['cs_personalize_2_1']                                     │
│                                                                            │
│   const shoe = await getShoeByUrl(url, variants);                          │
│                                                                            │
│   // Inside getShoeByUrl (lib/contentstack.ts):                            │
│   // entryRequest = entryRequest.variants(['cs_personalize_2_1']);         │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ STEP 7: Delivery SDK Returns Personalized Entry                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   // Contentstack CDA returns entry matching variant                       │
│                                                                            │
│   {                                                                        │
│     "title": "Adidas Superstar",                                           │
│     "price": "₹12,999",        ◄── INR price for India variant!           │
│     "description": "...",                                                  │
│     ...                                                                    │
│   }                                                                        │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Integration with Delivery SDK

### How Personalize SDK Connects to Delivery SDK

```
┌─────────────────────┐          ┌─────────────────────┐
│   PERSONALIZE SDK   │          │    DELIVERY SDK     │
│                     │          │                     │
│  1. sdk.set({...})  │          │                     │
│         │           │          │                     │
│         ▼           │          │                     │
│  2. Audience Match  │          │                     │
│         │           │          │                     │
│         ▼           │          │                     │
│  3. getVariantAlias │──────────│──► 4. .variants()  │
│     Returns UIDs    │          │                     │
│                     │          │         │           │
└─────────────────────┘          │         ▼           │
                                 │  5. Fetch from CDA  │
                                 │                     │
                                 │         │           │
                                 │         ▼           │
                                 │  6. Return filtered │
                                 │     entry           │
                                 └─────────────────────┘
```

### Code Example: Complete Integration

```typescript
// 1. Personalize SDK sets attributes and gets variants
const result = await autoDetectAndSetPersonalize();
const variantAliases = result.shortUids; // ['cs_personalize_2_1']

// 2. Pass to Delivery SDK via API
const response = await fetch(`/api/shoes/${url}?variants=${variantAliases.join(',')}`);

// 3. API route uses variants in Delivery SDK
// (app/api/shoes/[url]/route.ts)
const shoe = await getShoeByUrl(url, variants);

// 4. Delivery SDK applies variants
// (lib/contentstack.ts)
entryRequest = entryRequest.variants(variantAliases);

// 5. User sees personalized content!
```

---

## 7. Potential Questions & Answers

### Q1: What is the difference between Short UID and Full UID?

**Answer:**

| Type | Format | Example | When Used |
|------|--------|---------|-----------|
| **Short UID** | Single number | `1` | Impression tracking |
| **Full UID** | `cs_personalize_<exp>_<var>` | `cs_personalize_2_1` | Delivery SDK `.variants()` |

**The SDK returns Full UIDs** from `getVariantAliases()`.

```
cs_personalize_2_1
        │      │ │
        │      │ └── Variant Short UID (1 = India)
        │      └── Experience ID (2 = Country)
        └── Prefix
```

---

### Q2: What is `sdk.set()` and what does it do?

**Answer:**

`sdk.set()` sets user attributes that the Personalize engine uses to match audiences.

```typescript
await sdk.set({ country: "India" });
```

**What happens internally:**
1. SDK sends attributes to Contentstack Personalize
2. Personalize engine evaluates all experiences
3. For each experience, checks if user matches any audience
4. Stores matched variant IDs in SDK state
5. `getVariantAliases()` returns these matched variants

**Important:** `set()` **replaces** all attributes, it doesn't merge!

```typescript
// This overwrites previous attributes!
await sdk.set({ country: "India" });  // Only country now
await sdk.set({ color: "Red" });      // Only color now! Country is gone!

// To set multiple attributes, do this:
await sdk.set({ country: "India", color: "Red" });  // Both preserved
```

---

### Q3: What is `sdk.getVariantAliases()` and how does it work?

**Answer:**

`getVariantAliases()` returns the variant aliases that matched the current user's attributes.

```typescript
const aliases = sdk.getVariantAliases();
// Returns: ['cs_personalize_2_1', 'cs_personalize_3_2']
```

**How matching works:**

```
User Attributes: { country: "India", color: "Red" }
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Experience 2: "Country wise Personalize"                │
│ ─────────────────────────────────────────────────────── │
│ Audience "USA"   : country = "USA"     → NO MATCH       │
│ Audience "India" : country = "India"   → MATCH! (Var 1) │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│ Experience 3: "Color wise Personalize"                  │
│ ─────────────────────────────────────────────────────── │
│ Audience "Base"  : color = "Base"      → NO MATCH       │
│ Audience "Red India" : color="Red" AND                  │
│                        country="India" → MATCH! (Var 2) │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
Returns: ['cs_personalize_2_1', 'cs_personalize_3_2']
```

---

### Q4: Why use IP-based geolocation instead of hardcoding?

**Answer:**

**Benefits of IP Detection:**
- **Automatic:** No user input required
- **Accurate:** Based on actual location
- **Dynamic:** Works for users worldwide
- **No Hardcoding:** Content rules in Contentstack, not code

**Code approach (lib/personalize.ts):**
```typescript
// Multiple services for reliability
const geoServices = [
  { name: 'ipapi.co', url: 'https://ipapi.co/json/' },
  { name: 'ip-api.com', url: 'http://ip-api.com/json/' },
  { name: 'ipwhois.app', url: 'https://ipwho.is/' },
];

// Try each until one works
for (const service of geoServices) {
  try {
    const response = await fetch(service.url);
    const country = extractCountry(response);
    if (country) return country;
  } catch {
    continue;
  }
}
```

---

### Q5: What happens if Personalize SDK fails to initialize?

**Answer:**

**Graceful degradation** - the app continues without personalization.

```typescript
// lib/personalize.ts
export async function initPersonalize() {
  try {
    sdkInstance = await Personalize.init(projectUid);
    return sdkInstance;
  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    return null;  // Return null, don't throw
  }
}

// Usage in other functions
export async function setPersonalizeByCountry(country: string) {
  const sdk = await initPersonalize();
  
  if (!sdk) {
    // Return default values
    return {
      shortUids: [],           // No variants
      detectedCountry: country,
      finalCurrency: 'USD',    // Default currency
    };
  }
  
  // Continue with personalization...
}
```

**User experience:**
- Site works normally
- Shows **base content** (default variant)
- No personalized pricing/content
- No crash or error page

---

### Q6: How does color + country personalization work together?

**Answer:**

For combined personalization, we set **both attributes** in a single `sdk.set()` call.

**File:** `components/ShoeDetail.tsx` (Lines 54-125)

```typescript
// Set BOTH country AND color together
const attributesToSet = {
  country: normalizedCountry,  // e.g., "India"
  color: selectedColor         // e.g., "Red"
};

await sdk.set(attributesToSet);

// SDK matches combined audiences like "Red Color India"
const allUids = sdk.getVariantAliases();
// Returns: ['cs_personalize_2_1', 'cs_personalize_3_2']
//           (country variant)      (color variant)
```

**Contentstack Audience Setup:**
```
Audience: "Red Color India"
Conditions:
  - color equals "Red" AND
  - country equals "India"
Variant: 2
```

---

### Q7: What is `triggerImpression()` and why is it important?

**Answer:**

`triggerImpression()` tracks when a user sees a specific variant - essential for analytics.

```typescript
// lib/personalize.ts
export async function triggerVariantImpressions(shortUids: string[]) {
  const sdk = await initPersonalize();
  
  // Extract short UID from full UID
  // "cs_personalize_2_1" → "1"
  const impressionIds = shortUids
    .map((uid) => String(uid).split('_').pop());

  for (const shortUid of impressionIds) {
    await sdk.triggerImpression(shortUid);
  }
}
```

**Why important:**
- **A/B Testing:** Compare which variant performs better
- **Analytics:** Track personalization effectiveness
- **Optimization:** Improve audience targeting

---

### Q8: How does the Context pattern help with personalization?

**Answer:**

`CurrencyContext` provides **global state** for personalization data across all components.

```typescript
// contexts/CurrencyContext.tsx
interface CurrencyContextType {
  currency: Currency;           // 'USD' | 'INR' | 'EUR'
  detectedCountry: string;      // 'India' | 'USA' | etc.
  variantAliases: string[];     // ['cs_personalize_2_1']
  isLoading: boolean;
  isDetecting: boolean;
}
```

**Benefits:**
- **Single initialization:** SDK initializes once on app load
- **Shared state:** All components access same variants
- **Consistent UX:** Same personalization across pages
- **Easy access:** `useCurrency()` hook anywhere

```typescript
// Any component can use
const { currency, variantAliases, detectedCountry } = useCurrency();
```

---

### Q9: What is the manifest and how to debug with it?

**Answer:**

The manifest shows the current state of personalization - useful for debugging.

```typescript
// components/ShoeDetail.tsx
const sdkAny = sdk as any;
if (typeof sdkAny.getManifest === 'function') {
  const manifest = sdkAny.getManifest();
  console.log('📊 SDK Manifest:', JSON.stringify(manifest, null, 2));
}
```

**Example manifest output:**
```json
{
  "activeVariants": {
    "2": "1",    // Experience 2 → Variant 1 (India)
    "3": "2"     // Experience 3 → Variant 2 (Red India)
  },
  "experiences": [
    {
      "shortUid": "2",
      "activeVariantShortUid": "1"
    },
    {
      "shortUid": "3",
      "activeVariantShortUid": "2"
    }
  ]
}
```

**How to read:**
- `activeVariants["2"] = "1"` means Experience 2 matched Variant 1
- `null` means no variant matched for that experience

---

### Q10: What's the difference between `currency` and `country` attributes?

**Answer:**

| Attribute | Purpose | Example Values | Set By |
|-----------|---------|----------------|--------|
| `country` | Geographic personalization | "India", "USA" | IP detection |
| `currency` | Price display | "INR", "USD" | Derived from country |

**In our implementation:**
- We set `country` attribute for personalization
- `currency` is derived for display purposes only

```typescript
// Set country for audience matching
await sdk.set({ country: "India" });

// Currency is just for UI display
const suggestedCurrency = getCurrencySuggestionFromCountry("India");
// Returns: "INR"
```

---

## 8. Debugging & Troubleshooting

### Debug Functions Available

**1. `testCountryPersonalization()`** - Test full flow
```typescript
import { testCountryPersonalization } from '@/lib/personalize';
await testCountryPersonalization();
```

**2. `debugSDKStructure()`** - Inspect SDK internals
```typescript
import { debugSDKStructure } from '@/lib/personalize';
await debugSDKStructure();
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| No variants matched | Audience conditions don't match | Check Contentstack audience rules |
| Wrong country detected | IP service failure | Check console for service errors |
| Attributes overwritten | Using multiple `set()` calls | Use single `set()` with all attributes |
| SDK not initialized | Missing project UID | Check `.env` file |
| Impressions failing | Network/CORS issues | Check console, usually non-blocking |

### Console Log Reference

```
✅ = Success
❌ = Error
⚠️ = Warning
🌍 = Country detection
💰 = Currency
🎨 = Color personalization
📊 = Analytics/tracking
🔥 = Impression
📋 = Attributes being set
🎯 = Variant aliases
```

---

## 9. Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `lib/personalize.ts` | All Personalize SDK functions |
| `contexts/CurrencyContext.tsx` | Global state management |
| `components/ShoeDetail.tsx` | Example usage with color |
| `lib/contentstack.ts` | Delivery SDK with `.variants()` |

### SDK Methods Used

| Method | Purpose | Returns |
|--------|---------|---------|
| `Personalize.init(uid)` | Initialize SDK | SDK instance |
| `sdk.set(attributes)` | Set user attributes | Promise<void> |
| `sdk.getVariantAliases()` | Get matched variants | string[] |
| `sdk.triggerImpression(uid)` | Track impression | Promise<void> |
| `sdk.getManifest()` | Debug info | Object |

### Function Quick Reference

| Function | File | Purpose |
|----------|------|---------|
| `initPersonalize()` | personalize.ts | Initialize SDK singleton |
| `detectCountryFromIP()` | personalize.ts | Get country from IP |
| `setPersonalizeByCountry()` | personalize.ts | Set country & get variants |
| `autoDetectAndSetPersonalize()` | personalize.ts | One-call initialization |
| `triggerVariantImpressions()` | personalize.ts | Track impressions |
| `trackProductView()` | personalize.ts | Track product views |

### Environment Variables

```env
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_project_uid
```

---

## Summary

The Personalize SDK implementation follows these principles:

1. **Singleton Pattern** - Single SDK instance for consistency
2. **IP-based Detection** - No hardcoded country values
3. **Graceful Degradation** - App works if SDK fails
4. **Context Pattern** - Global state accessible everywhere
5. **Combined Attributes** - Set all attributes in single call
6. **Full UID Format** - `cs_personalize_<exp>_<var>` for Delivery SDK
7. **Impression Tracking** - Analytics for personalization effectiveness
