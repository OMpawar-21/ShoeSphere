# Contentstack Delivery SDK - Review Preparation Guide

This document provides a comprehensive explanation of the Contentstack Delivery SDK implementation in ShoeSphere, including code flow, potential questions, and detailed answers for manager review.

---

## Table of Contents

1. [SDK Architecture Overview](#1-sdk-architecture-overview)
2. [SDK Initialization](#2-sdk-initialization)
3. [Core Functions Explained](#3-core-functions-explained)
4. [Key SDK Methods](#4-key-sdk-methods)
5. [Potential Questions & Answers](#5-potential-questions--answers)
6. [Code Flow Decision Tree](#6-code-flow-decision-tree)
7. [Error Handling Patterns](#7-error-handling-patterns)
8. [Quick Reference](#8-quick-reference)

---

## 1. SDK Architecture Overview

### High-Level Code Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SDK ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐                                               │
│  │ ContentstackClient.js │  ← SDK Initialization (Singleton)            │
│  │ - apiKey              │                                               │
│  │ - deliveryToken       │                                               │
│  │ - environment         │                                               │
│  └──────────┬───────────┘                                               │
│             │                                                            │
│             ▼                                                            │
│  ┌──────────────────────┐                                               │
│  │   contentstack.ts     │  ← Core Query Functions                      │
│  │ - getEntries()        │                                               │
│  │ - getEntriesWithCount()│                                              │
│  │ - getEntry()          │                                               │
│  └──────────┬───────────┘                                               │
│             │                                                            │
│             ▼                                                            │
│  ┌──────────────────────┐                                               │
│  │   Helper Functions    │  ← Domain-Specific Wrappers                  │
│  │ - getAllShoes()       │                                               │
│  │ - getShoeByUrl()      │                                               │
│  │ - getHomepage()       │                                               │
│  │ - getGlobalConfig()   │                                               │
│  └──────────┬───────────┘                                               │
│             │                                                            │
│             ▼                                                            │
│  ┌──────────────────────┐                                               │
│  │     API Routes        │  ← HTTP Endpoints                            │
│  │ - /api/shoes          │                                               │
│  │ - /api/shoes/[url]    │                                               │
│  │ - /api/category/[slug]│                                               │
│  └──────────────────────┘                                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### SDK Method Chain

```
stack
  └── contentType('shoes')           // Select content type
        └── entry()                  // Access entries
              └── includeReference() // Resolve references
                    └── variants()   // Apply personalization
                          └── query()// Build query
                                └── equalTo() / skip() / limit()
                                      └── find() / fetch()
```

---

## 2. SDK Initialization

### File: `lib/ContentstackClient.js`

```javascript
import Contentstack from '@contentstack/delivery-sdk';

const stack = Contentstack.stack({
  apiKey: process.env.CONTENTSTACK_API_KEY,
  deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT,
});

export default stack;
```

### Explanation

| Configuration | Purpose |
|---------------|---------|
| `apiKey` | Identifies your Contentstack stack |
| `deliveryToken` | Read-only token for CDA (Content Delivery API) |
| `environment` | Specifies which environment (production, staging, etc.) |

### Why Singleton Pattern?

- **Single instance** shared across all imports
- **Avoids re-initialization** on every API call
- **Maintains connection state** efficiently
- **Reduces memory overhead**

---

## 3. Core Functions Explained

### 3.1 `getEntries<T>()` - Generic Entry Fetcher

**File:** `lib/contentstack.ts` (Lines 15-53)

```typescript
export const getEntries = async <T>(
  contentType: string,
  options?: { 
    includeReference?: string[]; 
    queryBuilder?: QueryBuilder; 
    variantAliases?: string[];
  }
): Promise<T[]>
```

**What it does:**
1. Creates entry request for specified content type
2. Optionally includes referenced entries
3. Optionally applies personalization variants
4. Optionally applies custom query modifications
5. Returns typed array of entries

**Code Flow:**

```
getEntries('shoes', options)
    │
    ├── stack.contentType('shoes').entry()
    │
    ├── if includeReference?
    │   └── entryRequest.includeReference(['brand_ref', ...])
    │
    ├── if variantAliases?
    │   └── entryRequest.variants(['cs_personalize_2_1'])
    │
    ├── query = entryRequest.query()
    │
    ├── if queryBuilder?
    │   └── queryBuilder(query).find()
    │
    └── return entries[]
```

### 3.2 `getEntriesWithCount<T>()` - With Pagination Support

**File:** `lib/contentstack.ts` (Lines 55-93)

Same as `getEntries` but adds:
- `includeCount()` - Returns total count for pagination
- Returns `{ entries: T[], count: number }`

### 3.3 `getEntry<T>()` - Single Entry by UID

**File:** `lib/contentstack.ts` (Lines 95-127)

```typescript
export const getEntry = async <T>(
  contentType: string,
  entryUid: string,
  options?: { includeReference?: string[]; variantAliases?: string[] }
): Promise<T | null>
```

**Key Difference:** Uses `fetch()` instead of `find()` for single entry retrieval.

---

## 4. Key SDK Methods

### 4.1 `contentType(uid)`

**Purpose:** Selects which content type to query.

```typescript
stack.contentType('shoes')  // Query the 'shoes' content type
```

### 4.2 `entry()` / `entry(uid)`

**Purpose:** Access entries from the content type.

```typescript
// Get all entries
stack.contentType('shoes').entry()

// Get specific entry by UID
stack.contentType('shoes').entry('blt1234567890')
```

### 4.3 `includeReference(references[])`

**Purpose:** Resolve and include referenced entries in response.

```typescript
.includeReference(['brand_ref', 'category_ref', 'seller_ref'])
```

**Without includeReference:**
```json
{
  "title": "Adidas Superstar",
  "brand_ref": "blt1234567890"  // Only UID!
}
```

**With includeReference:**
```json
{
  "title": "Adidas Superstar",
  "brand_ref": {
    "uid": "blt1234567890",
    "title": "Adidas",
    "logo": { "url": "https://..." }
  }
}
```

### 4.4 `variants(aliases)`

**Purpose:** Fetch personalized content based on variant aliases.

```typescript
.variants(['cs_personalize_2_1'])  // Single variant
.variants(['cs_personalize_2_1', 'cs_personalize_3_2'])  // Multiple
```

**How it works:**
1. Personalize SDK matches user to audiences
2. Returns variant aliases (e.g., `cs_personalize_2_1`)
3. `variants()` filters entries to return personalized version

### 4.5 `query()`

**Purpose:** Enables query builder for filtering, pagination, sorting.

```typescript
.query()
  .equalTo('url', '/shoes/adidas')  // Filter by field
  .skip(10)                          // Skip first 10
  .limit(5)                          // Return 5 entries
  .includeCount()                    // Include total count
```

### 4.6 `find()` vs `fetch()`

| Method | Use Case | Returns |
|--------|----------|---------|
| `find()` | Multiple entries | `{ entries: [], count: n }` |
| `fetch()` | Single entry by UID | Entry object directly |

---

## 5. Potential Questions & Answers

### Q1: What is `includeReference()` and why is it used?

**Answer:**

`includeReference()` tells the SDK to resolve referenced entries and include their full data in the response instead of just returning their UIDs.

**Why it's important:**
- **Single API call** instead of multiple calls
- **Reduces latency** - no need to fetch references separately
- **Simpler code** - data is already resolved

**Example in our code:**
```typescript
// lib/contentstack.ts:25-27
if (options?.includeReference?.length) {
  entryRequest = entryRequest.includeReference(options.includeReference);
}
```

**What happens without it:**
- You get `"brand_ref": "blt123..."` - just the UID
- You'd need another API call to get brand details
- More network requests = slower performance

---

### Q2: What is `variants()` and how does personalization work?

**Answer:**

`variants()` is the bridge between Contentstack Personalize and content delivery.

**Flow:**
```
User visits site
    │
    ▼
IP Detection → Country = "India"
    │
    ▼
Personalize SDK: sdk.set({ country: "India" })
    │
    ▼
SDK matches audience "India" → Variant ID: 1
    │
    ▼
Returns alias: "cs_personalize_2_1"
    │
    ▼
Delivery SDK: .variants(['cs_personalize_2_1'])
    │
    ▼
Returns entry with INR pricing
```

**Code location:**
```typescript
// lib/contentstack.ts:29-42
if (options?.variantAliases && options.variantAliases.length > 0) {
  const variantParam = options.variantAliases.length === 1 
    ? options.variantAliases[0] 
    : options.variantAliases;
  entryRequest = entryRequest.variants(variantParam);
}
```

---

### Q3: Why is there a `queryBuilder` pattern?

**Answer:**

The `queryBuilder` is a **callback pattern** that allows custom query modifications without changing core functions.

**Benefits:**
- **Generic core functions** - `getEntries()` works for any use case
- **Specific customizations** - Each caller can add its own filters
- **Code reusability** - No need to duplicate core logic

**Example usages:**

```typescript
// Filter by URL (getShoeByUrl)
queryBuilder: (query) => query.equalTo('url', '/shoes/adidas')

// Pagination (API route)
queryBuilder: (query) => query.skip(10).limit(5)

// Category filter
queryBuilder: (query) => query.where('category_ref', categoryUid)
```

---

### Q4: Why check `variantAliases.length === 1`?

**Answer:**

```typescript
const variantParam = options.variantAliases.length === 1 
  ? options.variantAliases[0] 
  : options.variantAliases;
```

**Reason:** SDK compatibility. Some SDK versions handle single values differently than arrays.

- **Single variant:** Pass as string for guaranteed compatibility
- **Multiple variants:** Pass as array

This ensures the code works correctly in all scenarios.

---

### Q5: What happens if `variants()` fails?

**Answer:**

**Graceful degradation** - The code catches errors and continues without personalization.

```typescript
// lib/contentstack.ts:38-41
} catch (error) {
  console.error('Error applying variants:', error);
  // Continue without variants if there's an error
}
```

**Behavior:**
- Error is logged for debugging
- Query continues without variants
- User sees **base content** instead of personalized content
- **Site doesn't break** - just loses personalization

---

### Q6: How does `getShoeByUrl()` find a specific shoe?

**Answer:**

Uses `equalTo()` query method with URL matching.

```typescript
// lib/contentstack.ts:142-153
export const getShoeByUrl = async (shoeUrl: string, variantAliases?: string[]) => {
  const fullUrl = `/shoes/${shoeUrl}`;  // Construct full URL
  
  const entries = await getEntries<ContentstackShoe>('shoes', {
    includeReference: ['brand_ref', 'category_ref', ...],
    queryBuilder: (query) => query.equalTo('url', fullUrl),
    variantAliases,
  });
  
  return entries[0] || null;
};
```

**Why construct `fullUrl`:**
- Route param: `adidas-superstar`
- Contentstack stores: `/shoes/adidas-superstar`
- We need to match the full path

---

### Q7: What is `includeCount()` and when to use it?

**Answer:**

`includeCount()` returns the **total count** of matching entries along with results.

```typescript
// lib/contentstack.ts:82
let query = entryRequest.query().includeCount();
```

**Use case:** Pagination

```typescript
// Without includeCount:
{ entries: [...] }  // Just the entries

// With includeCount:
{ entries: [...], count: 100 }  // Total count included
```

**Why needed:**
```typescript
const totalPages = Math.ceil(count / PAGE_SIZE);
// Without count, you can't calculate total pages!
```

---

### Q8: How does pagination work?

**Answer:**

Uses `skip()` and `limit()` methods.

```typescript
const PAGE_SIZE = 4;
const page = 2;
const skip = (page - 1) * PAGE_SIZE;  // skip = 4

query.skip(skip).limit(PAGE_SIZE)
// Skips first 4 entries, returns next 4
```

**Formula:**
| Page | skip() | limit() | Entries |
|------|--------|---------|---------|
| 1 | 0 | 4 | 0-3 |
| 2 | 4 | 4 | 4-7 |
| 3 | 8 | 4 | 8-11 |

---

### Q9: Why use TypeScript generics `<T>`?

**Answer:**

Generics provide **type safety** for different content types.

```typescript
export const getEntries = async <T>(contentType: string, ...): Promise<T[]>
```

**Usage:**
```typescript
// Returns ContentstackShoe[]
const shoes = await getEntries<ContentstackShoe>('shoes', {...});

// Returns ContentstackCategory[]
const categories = await getEntries<ContentstackCategory>('category');
```

**Benefits:**
- IDE autocomplete for returned data
- Compile-time error detection
- Self-documenting code

---

### Q10: How are API routes connected to SDK functions?

**Answer:**

API routes act as HTTP endpoints that call SDK functions.

```
Browser Request
    │
    ▼
/api/shoes?page=2&variants=cs_personalize_2_1
    │
    ▼
API Route (route.ts)
    │
    ├── Parse query params
    │   - page = 2
    │   - variants = ['cs_personalize_2_1']
    │
    ├── Call SDK function
    │   └── getEntriesWithCount('shoes', { variantAliases, queryBuilder })
    │
    └── Return JSON response
        └── { shoes: [...], count: 20, totalPages: 5 }
```

---

## 6. Code Flow Decision Tree

```
START: Need to fetch content
    │
    ├── What content type?
    │   └── contentType('shoes' | 'homepage' | 'category' | ...)
    │
    ├── Single entry or multiple?
    │   ├── Single by UID → entry(uid) → fetch()
    │   └── Multiple → entry() → query() → find()
    │
    ├── Need referenced data?
    │   ├── Yes → includeReference(['ref1', 'ref2'])
    │   └── No → skip this step
    │
    ├── Need personalization?
    │   ├── Yes → variants(['cs_personalize_X_Y'])
    │   └── No → skip this step
    │
    ├── Need filtering?
    │   ├── Yes → equalTo('field', value)
    │   └── No → skip this step
    │
    ├── Need pagination?
    │   ├── Yes → skip(n).limit(n).includeCount()
    │   └── No → skip this step
    │
    └── Execute
        ├── Single entry → fetch()
        └── Multiple entries → find()
```

---

## 7. Error Handling Patterns

### Pattern 1: SDK Initialization

```typescript
// lib/personalize.ts
try {
  sdkInstance = await Personalize.init(projectUid);
} catch (error) {
  console.error('Failed to initialize:', error);
  return null;  // Graceful degradation
}
```

### Pattern 2: Variant Application

```typescript
// lib/contentstack.ts
try {
  entryRequest = entryRequest.variants(variantParam);
} catch (error) {
  console.error('Error applying variants:', error);
  // Continue without variants
}
```

### Pattern 3: Entry Not Found

```typescript
// lib/contentstack.ts
try {
  const result = await entryRequest.fetch();
  return result as T;
} catch (error) {
  return null;  // Entry not found
}
```

### Pattern 4: API Route Error

```typescript
// app/api/shoes/route.ts
try {
  const data = await getEntriesWithCount(...);
  return NextResponse.json(data);
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json({ error: 'Failed' }, { status: 500 });
}
```

### Error Handling Summary

| Scenario | Action | User Experience |
|----------|--------|-----------------|
| SDK init fails | Return null | Site works without personalization |
| Variants fail | Continue without | Shows base content |
| Entry not found | Return null | API returns 404 |
| API throws | Return 500 | Error message shown |

---

## 8. Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `lib/ContentstackClient.js` | SDK initialization |
| `lib/contentstack.ts` | Core query functions |
| `lib/personalize.ts` | Personalize SDK |
| `app/api/shoes/route.ts` | Shoes list API |
| `app/api/shoes/[url]/route.ts` | Shoe detail API |

### SDK Method Quick Reference

| Method | Purpose | Example |
|--------|---------|---------|
| `contentType(uid)` | Select content type | `contentType('shoes')` |
| `entry()` | Access all entries | `entry()` |
| `entry(uid)` | Access single entry | `entry('blt123')` |
| `includeReference([])` | Resolve references | `includeReference(['brand_ref'])` |
| `variants([])` | Apply personalization | `variants(['cs_personalize_2_1'])` |
| `query()` | Start query builder | `query()` |
| `equalTo(field, value)` | Filter by field | `equalTo('url', '/shoes/x')` |
| `skip(n)` | Skip entries | `skip(10)` |
| `limit(n)` | Limit results | `limit(5)` |
| `includeCount()` | Include total count | `includeCount()` |
| `find()` | Execute (multiple) | `find()` |
| `fetch()` | Execute (single) | `fetch()` |

### Common Patterns

```typescript
// Fetch all with references
getEntries('shoes', {
  includeReference: ['brand_ref', 'category_ref']
})

// Fetch with personalization
getEntries('shoes', {
  includeReference: ['brand_ref'],
  variantAliases: ['cs_personalize_2_1']
})

// Fetch with filter
getEntries('shoes', {
  queryBuilder: (q) => q.equalTo('url', '/shoes/adidas')
})

// Fetch with pagination
getEntriesWithCount('shoes', {
  queryBuilder: (q) => q.skip(10).limit(5)
})
```

---

## Summary

The SDK implementation follows these principles:

1. **Singleton Pattern** - Single stack instance for efficiency
2. **Generic Functions** - Core functions work with any content type
3. **Callback Pattern** - QueryBuilder allows flexible customization
4. **Graceful Degradation** - Errors don't break the site
5. **Type Safety** - TypeScript generics ensure correct types
6. **Method Chaining** - Fluent API for readable queries
