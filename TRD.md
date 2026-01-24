# Technical Requirements Document (TRD)
# ShoeSphere - E-Commerce Platform

**Version:** 1.0  
**Date:** January 24, 2026  
**Author:** OM PAWAR  
**Status:** Implemented

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Contentstack Ecosystem](#3-contentstack-ecosystem)
4. [Application Flow](#4-application-flow)
5. [Technical Stack](#5-technical-stack)
6. [Contentstack Integration](#6-contentstack-integration)
7. [Personalization Engine](#7-personalization-engine)
8. [API Layer](#8-api-layer)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Data Flow Diagrams](#10-data-flow-diagrams)
11. [Sequence Diagrams](#11-sequence-diagrams)
12. [Deployment Architecture](#12-deployment-architecture)
13. [Environment Configuration](#13-environment-configuration)
14. [Error Handling](#14-error-handling)
15. [Performance Optimization](#15-performance-optimization)

---

## 1. Introduction

### 1.1 Document Purpose

This Technical Requirements Document (TRD) provides comprehensive technical specifications for the ShoeSphere e-commerce platform. It details the architecture, integrations, data flows, and implementation specifics for developers and technical stakeholders.

### 1.2 Scope

This document covers:
- Contentstack CMS integration (CDA, CMA, Delivery SDK)
- Contentstack Personalize implementation
- Contentstack Launch deployment (if applicable)
- Contentstack Automate workflows
- Application architecture and data flows
- API specifications and implementations

### 1.3 Contentstack Products Used

| Product | Purpose | Implementation |
|---------|---------|----------------|
| **CMS** | Content Management System | Headless content storage and management |
| **CDA** | Content Delivery API | Read-only API for fetching published content |
| **CMA** | Content Management API | Write API for creating/updating content |
| **Delivery SDK** | JavaScript SDK | Simplified content fetching with query builder |
| **Personalize** | Personalization Engine | Dynamic content variants based on user attributes |
| **Launch** | Hosting Platform | Deployment and hosting (optional) |
| **Automate** | Workflow Automation | Content publishing workflows |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Application Layer"
        NextJS[Next.js Application]
        SSR[Server-Side Rendering]
        API[API Routes]
        RSC[React Server Components]
    end

    subgraph "Contentstack Ecosystem"
        CMS[Contentstack CMS]
        CDA[Content Delivery API]
        CMA[Content Management API]
        SDK[Delivery SDK]
        Personalize[Personalize SDK]
        CDN[Contentstack CDN]
    end

    subgraph "External Services"
        IPAPI[IP Geolocation API]
        Vercel[Vercel Hosting]
    end

    Browser --> NextJS
    Mobile --> NextJS
    NextJS --> SSR
    NextJS --> API
    NextJS --> RSC
    
    SSR --> SDK
    API --> SDK
    API --> CMA
    RSC --> SDK
    
    SDK --> CDA
    SDK --> CDN
    Personalize --> CMS
    
    NextJS --> Personalize
    NextJS --> IPAPI
    NextJS --> Vercel
```

### 2.2 Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        Layout[Layout Component]
        Pages[Page Components]
        UI[UI Components]
    end

    subgraph "State Management"
        Context[Currency Context]
        State[React State]
    end

    subgraph "Data Layer"
        Lib[Lib Functions]
        Types[TypeScript Types]
    end

    subgraph "API Layer"
        Routes[API Routes]
        Handlers[Route Handlers]
    end

    Layout --> Pages
    Pages --> UI
    Pages --> Context
    Context --> Lib
    Lib --> Routes
    Routes --> Handlers
    Handlers --> Types
```

### 2.3 Detailed Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Client Browser"]
        UI[React UI Components]
        SDK_Client[Personalize SDK Client]
    end

    subgraph NextJS["Next.js Server"]
        subgraph Pages["App Router"]
            Home["/"]
            Shoes["/shoes"]
            ShoeDetail["/shoes/[url]"]
            Category["/category/[slug]"]
        end

        subgraph APIRoutes["API Routes"]
            API_Shoes["/api/shoes"]
            API_ShoeDetail["/api/shoes/[url]"]
            API_Category["/api/category/[slug]"]
            API_Testimonial["/api/testimonials"]
        end

        subgraph Lib["Library Layer"]
            CS_Lib[contentstack.ts]
            P_Lib[personalize.ts]
        end

        subgraph Context["Context Layer"]
            Currency[CurrencyContext]
        end
    end

    subgraph Contentstack["Contentstack Platform"]
        CMS_UI[CMS Dashboard]
        
        subgraph APIs["APIs"]
            CDA_API[CDA - Delivery API]
            CMA_API[CMA - Management API]
        end

        subgraph SDK_Layer["SDKs"]
            Delivery_SDK[Delivery SDK]
            Personalize_SDK[Personalize SDK]
        end

        subgraph Features["Features"]
            Variants[Content Variants]
            Experiences[Personalize Experiences]
            Audiences[Audiences]
        end

        CDN_Layer[CDN / Assets]
    end

    subgraph External["External Services"]
        IP_Service[ipapi.co]
    end

    %% Client connections
    UI --> SDK_Client
    UI --> Pages
    SDK_Client --> Personalize_SDK

    %% Page connections
    Pages --> Lib
    Pages --> Context
    APIRoutes --> Lib

    %% Lib connections
    CS_Lib --> Delivery_SDK
    CS_Lib --> CMA_API
    P_Lib --> Personalize_SDK
    P_Lib --> IP_Service

    %% SDK connections
    Delivery_SDK --> CDA_API
    Personalize_SDK --> Experiences
    
    %% CMS connections
    CMS_UI --> CDA_API
    CMS_UI --> CMA_API
    CDA_API --> Variants
    Experiences --> Audiences
    CDA_API --> CDN_Layer
```

---

## 3. Contentstack Ecosystem

### 3.1 Contentstack CMS

#### 3.1.1 Overview

Contentstack CMS serves as the headless content management system, storing all product data, site configuration, and testimonials.

```mermaid
graph TB
    subgraph "Contentstack CMS"
        subgraph "Content Types"
            Shoes[shoes]
            Homepage[homepage]
            Category[category]
            Brand[brand]
            GlobalConfig[global_config]
            Testimonial[testimonial]
            Seller[seller]
            Material[material]
        end

        subgraph "References"
            Shoes --> Brand
            Shoes --> Category
            Shoes --> Seller
            Shoes --> Material
            Shoes --> Testimonial
            Homepage --> Shoes
        end
    end
```

#### 3.1.2 Content Type Relationships

```mermaid
erDiagram
    SHOES ||--o{ BRAND : "brand_ref"
    SHOES ||--o{ CATEGORY : "category_ref"
    SHOES ||--o{ SELLER : "seller_ref"
    SHOES ||--o{ MATERIAL : "material_ref"
    SHOES ||--o{ TESTIMONIAL : "testimonials"
    HOMEPAGE ||--o{ SHOES : "featured_shoes"
    GLOBAL_CONFIG ||--|| HEADER : "header"
    GLOBAL_CONFIG ||--|| FOOTER : "footer"
    GLOBAL_CONFIG ||--|| ANNOUNCEMENT : "announcement_bar"

    SHOES {
        string uid PK
        string title
        string url
        number price
        string description
        file main_image
        string color
        array size
        string weight
        string heel_height
    }

    BRAND {
        string uid PK
        string title
        string slug
    }

    CATEGORY {
        string uid PK
        string title
        string slug
    }

    TESTIMONIAL {
        string uid PK
        string title
        text feedback
        number rating
        file user_photo
    }
```

### 3.2 Content Delivery API (CDA)

#### 3.2.1 Overview

The CDA provides read-only access to published content. It's optimized for high-performance content delivery.

```mermaid
sequenceDiagram
    participant App as Next.js App
    participant SDK as Delivery SDK
    participant CDA as Content Delivery API
    participant CDN as Contentstack CDN

    App->>SDK: Query content
    SDK->>CDA: GET /content_types/shoes/entries
    CDA->>CDN: Fetch from cache
    CDN-->>CDA: Cached content
    CDA-->>SDK: JSON response
    SDK-->>App: Typed content objects
```

#### 3.2.2 CDA Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/content_types/{type}/entries` | GET | Fetch all entries of a type |
| `/content_types/{type}/entries/{uid}` | GET | Fetch single entry |
| `/content_types/{type}/entries?query={}` | GET | Query with filters |

#### 3.2.3 SDK Query Examples

```typescript
// Fetch all shoes
const query = Stack.ContentType('shoes')
  .Query()
  .includeReference(['brand_ref', 'category_ref', 'seller_ref'])
  .toJSON();

// Fetch with variants
const query = Stack.ContentType('shoes')
  .Query()
  .variants(['cs_personalize_2_1', 'cs_personalize_3_2'])
  .toJSON();

// Fetch single entry by URL
const query = Stack.ContentType('shoes')
  .Query()
  .where('url', '/shoes/adidas-superstar')
  .toJSON();
```

### 3.3 Content Management API (CMA)

#### 3.3.1 Overview

The CMA provides write access to content. Used for programmatic content creation like testimonial submissions.

```mermaid
sequenceDiagram
    participant User as User
    participant Form as Testimonial Form
    participant API as /api/testimonials
    participant CMA as Content Management API
    participant CMS as Contentstack CMS

    User->>Form: Submit review
    Form->>API: POST {title, feedback, rating}
    API->>CMA: POST /content_types/testimonial/entries
    CMA->>CMS: Create entry
    CMS-->>CMA: Entry created
    CMA-->>API: Success response
    API-->>Form: Confirmation
    Form-->>User: Thank you message
```

#### 3.3.2 CMA Implementation

```typescript
// lib/contentstack.ts - CMA for testimonial creation
export async function createTestimonial(data: {
  title: string;
  feedback: string;
  rating: number;
}) {
  const response = await fetch(
    `https://api.contentstack.io/v3/content_types/testimonial/entries`,
    {
      method: 'POST',
      headers: {
        'api_key': process.env.CONTENTSTACK_API_KEY!,
        'authorization': process.env.CONTENTSTACK_MANAGEMENT_TOKEN!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          title: data.title,
          feedback: data.feedback,
          rating: data.rating,
        }
      })
    }
  );
  
  return response.json();
}
```

### 3.4 Delivery SDK

#### 3.4.1 SDK Initialization

```typescript
// lib/contentstack.ts
import Contentstack from '@contentstack/delivery-sdk';

const Stack = Contentstack.Stack({
  api_key: process.env.CONTENTSTACK_API_KEY!,
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN!,
  environment: process.env.CONTENTSTACK_ENVIRONMENT!,
  region: Contentstack.Region.US, // or EU, AZURE_EU, etc.
});
```

#### 3.4.2 SDK Architecture

```mermaid
graph TB
    subgraph "Delivery SDK"
        Stack[Stack Instance]
        ContentType[ContentType]
        Query[Query Builder]
        Entry[Entry]
    end

    subgraph "Query Methods"
        Where[where]
        Include[includeReference]
        Variants[variants]
        Limit[limit/skip]
        ToJSON[toJSON]
    end

    Stack --> ContentType
    ContentType --> Query
    ContentType --> Entry
    Query --> Where
    Query --> Include
    Query --> Variants
    Query --> Limit
    Query --> ToJSON
```

#### 3.4.3 Query Builder Pattern

```typescript
// Building complex queries
const shoes = await Stack.ContentType('shoes')
  .Query()
  .where('category_ref', { $in_query: { uid: categoryUid } })
  .includeReference([
    'brand_ref',
    'category_ref', 
    'seller_ref',
    'material_ref',
    'testimonials'
  ])
  .variants(variantAliases)
  .limit(12)
  .skip((page - 1) * 12)
  .toJSON()
  .find();
```

### 3.5 Contentstack Personalize

#### 3.5.1 Personalize Architecture

```mermaid
graph TB
    subgraph "Personalize SDK"
        Init[Initialize SDK]
        Set[Set Attributes]
        Get[Get Variant Aliases]
        Track[Track Impressions]
    end

    subgraph "Contentstack Personalize"
        Project[Project]
        Experiences[Experiences]
        Audiences[Audiences]
        Variants[Variants]
        Manifest[Manifest]
    end

    subgraph "Application"
        Browser[Browser]
        Context[Currency Context]
        Components[React Components]
    end

    Browser --> Init
    Init --> Project
    Project --> Manifest
    
    Context --> Set
    Set --> Experiences
    Experiences --> Audiences
    Audiences --> Variants
    
    Variants --> Get
    Get --> Components
    
    Components --> Track
    Track --> Experiences
```

#### 3.5.2 SDK Initialization

```typescript
// lib/personalize.ts
import Personalize from '@contentstack/personalize-edge-sdk';

let personalizeSDK: ReturnType<typeof Personalize.init> | null = null;

export async function initPersonalize() {
  if (personalizeSDK) return personalizeSDK;

  personalizeSDK = Personalize.init(
    process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID!,
    {
      // SDK configuration options
    }
  );

  return personalizeSDK;
}
```

#### 3.5.3 Experience Configuration

```mermaid
graph LR
    subgraph "Experience 2: Country"
        E2[Country Experience]
        E2_A1[USA Audience]
        E2_A2[India Audience]
        E2_V0[Variant 0: USD]
        E2_V1[Variant 1: INR]
        
        E2 --> E2_A1
        E2 --> E2_A2
        E2_A1 --> E2_V0
        E2_A2 --> E2_V1
    end

    subgraph "Experience 3: Color"
        E3[Color Experience]
        E3_A0[Base Color]
        E3_A1[Black USA]
        E3_A2[Red India]
        E3_A3[Black India]
        E3_A4[Red USA]
        
        E3_V0[Variant 0]
        E3_V1[Variant 1]
        E3_V2[Variant 2]
        E3_V3[Variant 3]
        E3_V4[Variant 4]
        
        E3 --> E3_A0 --> E3_V0
        E3 --> E3_A1 --> E3_V1
        E3 --> E3_A2 --> E3_V2
        E3 --> E3_A3 --> E3_V3
        E3 --> E3_A4 --> E3_V4
    end
```

### 3.6 Contentstack Automate

#### 3.6.1 Overview

Contentstack Automate enables workflow automation for content operations.

```mermaid
graph LR
    subgraph "Triggers"
        T1[Entry Created]
        T2[Entry Updated]
        T3[Entry Published]
        T4[Scheduled Time]
    end

    subgraph "Automate Workflows"
        W1[Content Approval]
        W2[Auto-Publish]
        W3[Notification]
        W4[Webhook Trigger]
    end

    subgraph "Actions"
        A1[Send Email]
        A2[Publish Entry]
        A3[Call Webhook]
        A4[Update Field]
    end

    T1 --> W1
    T2 --> W2
    T3 --> W3
    T4 --> W4

    W1 --> A1
    W2 --> A2
    W3 --> A1
    W4 --> A3
```

#### 3.6.2 Potential Automate Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| Testimonial Approval | New testimonial created | Send notification to admin |
| Product Published | Shoe entry published | Trigger cache invalidation |
| Price Update | Price field changed | Notify stakeholders |
| Scheduled Publish | Scheduled time | Auto-publish seasonal content |

### 3.7 Contentstack Launch

#### 3.7.1 Overview

Contentstack Launch provides hosting and deployment capabilities.

```mermaid
graph TB
    subgraph "Development"
        Local[Local Development]
        Git[Git Repository]
    end

    subgraph "Launch Platform"
        Build[Build Process]
        Deploy[Deployment]
        CDN_L[Global CDN]
        SSL[SSL Certificate]
    end

    subgraph "Production"
        Edge[Edge Network]
        DNS[Custom Domain]
    end

    Local --> Git
    Git --> Build
    Build --> Deploy
    Deploy --> CDN_L
    CDN_L --> Edge
    DNS --> Edge
    SSL --> Edge
```

#### 3.7.2 Launch Configuration

```yaml
# launch.yaml (example)
version: 1
name: shoesphere
framework: nextjs
buildCommand: npm run build
outputDirectory: .next
installCommand: npm install
environmentVariables:
  - CONTENTSTACK_API_KEY
  - CONTENTSTACK_DELIVERY_TOKEN
  - CONTENTSTACK_ENVIRONMENT
  - NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID
```

---

## 4. Application Flow

### 4.1 Complete Application Flow

```mermaid
flowchart TB
    subgraph "User Journey"
        Start([User Visits Site])
        Home[Homepage Loads]
        Browse[Browse Products]
        Detail[View Product Detail]
        Color[Select Color]
        Review[View Reviews]
        End([Continue Shopping])
    end

    subgraph "Personalization Flow"
        IP[Detect IP Address]
        Country[Determine Country]
        SetAttr[Set SDK Attributes]
        GetVar[Get Variant Aliases]
    end

    subgraph "Content Flow"
        FetchConfig[Fetch Global Config]
        FetchHome[Fetch Homepage]
        FetchShoes[Fetch Shoes with Variants]
        FetchDetail[Fetch Shoe Detail]
    end

    subgraph "Rendering"
        SSR[Server-Side Render]
        Hydrate[Client Hydration]
        Update[Dynamic Update]
    end

    Start --> IP
    IP --> Country
    Country --> SetAttr
    SetAttr --> GetVar

    Start --> FetchConfig
    FetchConfig --> SSR

    GetVar --> FetchHome
    FetchHome --> Home
    Home --> SSR
    SSR --> Hydrate

    Home --> Browse
    Browse --> FetchShoes
    FetchShoes --> Hydrate

    Browse --> Detail
    Detail --> FetchDetail
    FetchDetail --> Hydrate

    Detail --> Color
    Color --> SetAttr
    SetAttr --> Update
    Update --> FetchDetail

    Detail --> Review
    Review --> End
```

### 4.2 Page Load Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextJS as Next.js Server
    participant Context as CurrencyContext
    participant IPAPI as ipapi.co
    participant SDK as Personalize SDK
    participant CDA as Contentstack CDA

    User->>Browser: Navigate to site
    Browser->>NextJS: Request page
    
    NextJS->>CDA: Fetch global config (SSR)
    CDA-->>NextJS: Config data
    
    NextJS->>CDA: Fetch page content (SSR)
    CDA-->>NextJS: Page data
    
    NextJS-->>Browser: Rendered HTML + JS
    
    Browser->>Context: Initialize context
    Context->>IPAPI: Detect country from IP
    IPAPI-->>Context: Country: India
    
    Context->>SDK: Initialize SDK
    SDK-->>Context: SDK ready
    
    Context->>SDK: sdk.set({country: "India"})
    SDK-->>Context: Variant aliases: [cs_personalize_2_1]
    
    Context->>Browser: Update state
    Browser->>NextJS: Fetch with variants
    NextJS->>CDA: GET /shoes?variants=cs_personalize_2_1
    CDA-->>NextJS: Personalized content
    NextJS-->>Browser: Updated data
    Browser->>User: Display personalized content
```

### 4.3 Color Selection Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Color Selector
    participant State as React State
    participant SDK as Personalize SDK
    participant API as /api/shoes/[url]
    participant CDA as Contentstack CDA

    User->>UI: Click "Red" button
    UI->>State: setSelectedColor("Red")
    UI->>UI: Update URL (?color=red)
    
    State->>SDK: sdk.set({country: "India", color: "Red"})
    SDK->>SDK: Match audiences
    SDK-->>State: Variant: cs_personalize_3_2
    
    State->>API: GET /api/shoes/adidas?variants=cs_personalize_3_2
    API->>CDA: Query with variants
    CDA-->>API: Red India entry (₹10,200)
    API-->>State: Product data
    
    State->>UI: Update display
    UI->>User: Show Red shoe with ₹10,200
```

---

## 5. Technical Stack

### 5.1 Stack Overview

```mermaid
graph TB
    subgraph "Frontend"
        Next[Next.js 14]
        React[React 19]
        TS[TypeScript]
        Tailwind[Tailwind CSS]
    end

    subgraph "Backend"
        API[API Routes]
        SSR[Server Components]
        ISR[Incremental Static Regeneration]
    end

    subgraph "CMS"
        CS[Contentstack CMS]
        CS_SDK[Delivery SDK]
        CS_P[Personalize SDK]
    end

    subgraph "Infrastructure"
        Vercel[Vercel]
        CDN[CDN]
        DNS[DNS]
    end

    Next --> React
    React --> TS
    TS --> Tailwind
    
    Next --> API
    Next --> SSR
    Next --> ISR

    API --> CS_SDK
    SSR --> CS_SDK
    CS_SDK --> CS
    CS_P --> CS

    Next --> Vercel
    Vercel --> CDN
    CDN --> DNS
```

### 5.2 Dependencies

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "@contentstack/delivery-sdk": "^3.x",
    "@contentstack/personalize-edge-sdk": "^1.x",
    "typescript": "^5.x"
  },
  "devDependencies": {
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "@types/node": "^20.x",
    "@types/react": "^18.x"
  }
}
```

---

## 6. Contentstack Integration

### 6.1 Integration Architecture

```mermaid
graph TB
    subgraph "Application"
        App[Next.js App]
        Lib[lib/contentstack.ts]
        Types[types/contentstack.ts]
    end

    subgraph "SDK Layer"
        Stack[Stack Instance]
        Query[Query Builder]
        Entry[Entry Fetcher]
    end

    subgraph "API Layer"
        CDA[Content Delivery API]
        CMA[Content Management API]
    end

    subgraph "Contentstack"
        CMS[CMS Dashboard]
        CDN[CDN]
        Assets[Asset Storage]
    end

    App --> Lib
    Lib --> Types
    Lib --> Stack
    
    Stack --> Query
    Stack --> Entry
    
    Query --> CDA
    Entry --> CDA
    Lib --> CMA
    
    CDA --> CMS
    CDA --> CDN
    CMS --> Assets
    CDN --> Assets
```

### 6.2 Content Fetching Functions

```typescript
// lib/contentstack.ts

// Initialize Stack
const Stack = Contentstack.Stack({
  api_key: process.env.CONTENTSTACK_API_KEY!,
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN!,
  environment: process.env.CONTENTSTACK_ENVIRONMENT!,
});

// Fetch all shoes with pagination and variants
export async function getShoes(
  page: number = 1,
  limit: number = 12,
  variantAliases?: string[]
) {
  const query = Stack.ContentType('shoes')
    .Query()
    .includeReference(['brand_ref', 'category_ref']);

  if (variantAliases?.length) {
    query.variants(variantAliases);
  }

  const [entries, count] = await Promise.all([
    query.limit(limit).skip((page - 1) * limit).toJSON().find(),
    query.count()
  ]);

  return {
    shoes: entries[0] || [],
    total: count,
    page,
    totalPages: Math.ceil(count / limit)
  };
}

// Fetch single shoe by URL
export async function getShoeByUrl(
  url: string,
  variantAliases?: string[]
) {
  const query = Stack.ContentType('shoes')
    .Query()
    .where('url', url)
    .includeReference([
      'brand_ref',
      'category_ref',
      'seller_ref',
      'material_ref',
      'testimonials'
    ]);

  if (variantAliases?.length) {
    query.variants(variantAliases);
  }

  const entries = await query.toJSON().find();
  return entries[0]?.[0] || null;
}

// Fetch global config
export async function getGlobalConfig() {
  const entries = await Stack.ContentType('global_config')
    .Query()
    .toJSON()
    .find();
  return entries[0]?.[0] || null;
}

// Fetch homepage
export async function getHomepage() {
  const entries = await Stack.ContentType('homepage')
    .Query()
    .includeReference(['featured_shoes', 'featured_shoes.brand_ref'])
    .toJSON()
    .find();
  return entries[0]?.[0] || null;
}
```

---

## 7. Personalization Engine

### 7.1 Personalization Architecture

```mermaid
flowchart TB
    subgraph "Client Side"
        Browser[Browser]
        SDK_Init[SDK Initialization]
        Attr_Set[Attribute Setting]
        Var_Get[Variant Retrieval]
    end

    subgraph "Personalize Service"
        Manifest[Manifest]
        Matcher[Audience Matcher]
        Resolver[Variant Resolver]
    end

    subgraph "Experiences"
        Exp2[Experience 2: Country]
        Exp3[Experience 3: Color]
    end

    subgraph "Output"
        Aliases[Variant Aliases]
        Content[Personalized Content]
    end

    Browser --> SDK_Init
    SDK_Init --> Manifest
    Manifest --> Matcher

    Attr_Set --> Matcher
    Matcher --> Exp2
    Matcher --> Exp3

    Exp2 --> Resolver
    Exp3 --> Resolver
    Resolver --> Var_Get
    Var_Get --> Aliases
    Aliases --> Content
```

### 7.2 Personalize SDK Functions

```typescript
// lib/personalize.ts

import Personalize from '@contentstack/personalize-edge-sdk';

let sdk: ReturnType<typeof Personalize.init> | null = null;

// Initialize SDK
export async function initPersonalize() {
  if (sdk) return sdk;
  
  sdk = Personalize.init(
    process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID!
  );
  
  return sdk;
}

// Detect country from IP
export async function detectCountryFromIP(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_name || null;
  } catch {
    return null;
  }
}

// Set personalization by country
export async function setPersonalizeByCountry(country: string) {
  const sdk = await initPersonalize();
  if (!sdk) return { shortUids: [], detectedCountry: country };

  // Normalize country name
  const normalizedCountry = normalizeCountry(country);
  
  await sdk.set({ country: normalizedCountry });
  
  const shortUids = sdk.getVariantAliases();
  
  return {
    shortUids: Array.isArray(shortUids) ? shortUids.map(String) : [],
    detectedCountry: country,
    suggestedCurrency: getCurrencyFromCountry(country),
  };
}

// Set color with country (for combined experiences)
export async function setColorPersonalization(
  country: string,
  color: string
) {
  const sdk = await initPersonalize();
  if (!sdk) return [];

  await sdk.set({
    country: normalizeCountry(country),
    color: color
  });

  const allUids = sdk.getVariantAliases();
  
  // Filter to only color experience variants (experience 3)
  return allUids.filter(uid => {
    const match = uid.match(/cs_personalize_(\d+)_/);
    return match && match[1] === '3';
  });
}

// Track impressions
export async function trackProductView(
  productUid: string,
  variantAliases: string[],
  context: Record<string, any>
) {
  const sdk = await initPersonalize();
  if (!sdk) return;

  // Extract short UIDs for impression tracking
  for (const alias of variantAliases) {
    const match = alias.match(/cs_personalize_\d+_(\d+)/);
    if (match) {
      await sdk.triggerImpression(match[1]);
    }
  }
}

// Helper: Normalize country name
function normalizeCountry(country: string): string {
  const map: Record<string, string> = {
    'United States of America': 'USA',
    'United States': 'USA',
    'US': 'USA',
    'India': 'India',
  };
  return map[country] || country;
}

// Helper: Get currency from country
function getCurrencyFromCountry(country: string): Currency {
  const map: Record<string, Currency> = {
    'United States of America': 'USD',
    'United States': 'USD',
    'USA': 'USD',
    'India': 'INR',
  };
  return map[country] || 'USD';
}
```

### 7.3 Variant Matching Logic

```mermaid
flowchart TD
    Start([User Request])
    
    SetAttr[Set Attributes]
    CheckExp2{Experience 2<br/>Country Match?}
    CheckExp3{Experience 3<br/>Color+Country Match?}
    
    Exp2_USA[Variant: cs_personalize_2_0]
    Exp2_India[Variant: cs_personalize_2_1]
    
    Exp3_Base[Variant: cs_personalize_3_0]
    Exp3_BlackUSA[Variant: cs_personalize_3_1]
    Exp3_RedIndia[Variant: cs_personalize_3_2]
    Exp3_BlackIndia[Variant: cs_personalize_3_3]
    Exp3_RedUSA[Variant: cs_personalize_3_4]
    
    Combine[Combine Variant Aliases]
    Fetch[Fetch with Variants]
    
    Start --> SetAttr
    SetAttr --> CheckExp2
    
    CheckExp2 -->|country=USA| Exp2_USA
    CheckExp2 -->|country=India| Exp2_India
    
    Exp2_USA --> CheckExp3
    Exp2_India --> CheckExp3
    
    CheckExp3 -->|color=Base| Exp3_Base
    CheckExp3 -->|color=Black, country=USA| Exp3_BlackUSA
    CheckExp3 -->|color=Red, country=India| Exp3_RedIndia
    CheckExp3 -->|color=Black, country=India| Exp3_BlackIndia
    CheckExp3 -->|color=Red, country=USA| Exp3_RedUSA
    
    Exp3_Base --> Combine
    Exp3_BlackUSA --> Combine
    Exp3_RedIndia --> Combine
    Exp3_BlackIndia --> Combine
    Exp3_RedUSA --> Combine
    
    Combine --> Fetch
```

---

## 8. API Layer

### 8.1 API Architecture

```mermaid
graph TB
    subgraph "API Routes"
        Route1["/api/shoes"]
        Route2["/api/shoes/[url]"]
        Route3["/api/category/[slug]"]
        Route4["/api/testimonials"]
    end

    subgraph "Handlers"
        H1[GET Handler - List]
        H2[GET Handler - Detail]
        H3[GET Handler - Category]
        H4[POST Handler - Create]
    end

    subgraph "Services"
        S1[getShoes]
        S2[getShoeByUrl]
        S3[getShoesByCategory]
        S4[createTestimonial]
    end

    subgraph "Contentstack"
        CDA[Delivery API]
        CMA[Management API]
    end

    Route1 --> H1 --> S1 --> CDA
    Route2 --> H2 --> S2 --> CDA
    Route3 --> H3 --> S3 --> CDA
    Route4 --> H4 --> S4 --> CMA
```

### 8.2 API Route Implementations

```typescript
// app/api/shoes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getShoes } from '@/lib/contentstack';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const variants = searchParams.get('variants')?.split(',').filter(Boolean);

  console.log('📡 API: Fetching shoes with variants:', variants || []);

  const data = await getShoes(page, 12, variants);

  return NextResponse.json(data);
}
```

```typescript
// app/api/shoes/[url]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getShoeByUrl } from '@/lib/contentstack';

export async function GET(
  request: NextRequest,
  { params }: { params: { url: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const variants = searchParams.get('variants')?.split(',').filter(Boolean);

  console.log(`📡 API: Fetching shoe ${params.url} with variants:`, variants || []);

  const shoe = await getShoeByUrl(`/shoes/${params.url}`, variants);

  if (!shoe) {
    return NextResponse.json({ error: 'Shoe not found' }, { status: 404 });
  }

  return NextResponse.json({ shoe });
}
```

```typescript
// app/api/testimonials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createTestimonial } from '@/lib/contentstack';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const { title, feedback, rating, sellerEmail } = body;

  if (!title || !feedback || !rating) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const result = await createTestimonial({ title, feedback, rating });

  return NextResponse.json({ success: true, entry: result });
}
```

---

## 9. Frontend Architecture

### 9.1 Component Hierarchy

```mermaid
graph TB
    subgraph "Layout Layer"
        RootLayout[RootLayout]
        CurrencyProvider[CurrencyProvider]
    end

    subgraph "Page Layer"
        HomePage[HomePage]
        ShoesPage[ShoesPage]
        ShoeDetailPage[ShoeDetailPage]
        CategoryPage[CategoryPage]
    end

    subgraph "Component Layer"
        Navbar[Navbar]
        Footer[Footer]
        AnnouncementBar[AnnouncementBar]
        HeroSection[HeroSection]
        HomeShoeGrid[HomeShoeGrid]
        ShoesGrid[ShoesGrid]
        CategoryShoesGrid[CategoryShoesGrid]
        ShoeDetail[ShoeDetail]
        TestimonialForm[TestimonialForm]
    end

    RootLayout --> CurrencyProvider
    CurrencyProvider --> Navbar
    CurrencyProvider --> HomePage
    CurrencyProvider --> ShoesPage
    CurrencyProvider --> ShoeDetailPage
    CurrencyProvider --> CategoryPage
    CurrencyProvider --> Footer

    HomePage --> HeroSection
    HomePage --> HomeShoeGrid
    
    ShoesPage --> ShoesGrid
    
    ShoeDetailPage --> ShoeDetail
    ShoeDetail --> TestimonialForm
    
    CategoryPage --> CategoryShoesGrid
```

### 9.2 State Management

```mermaid
flowchart TB
    subgraph "CurrencyContext"
        State[State]
        Currency[currency: Currency]
        Country[detectedCountry: string]
        Variants[variantAliases: string[]]
        Loading[isLoading: boolean]
        Detecting[isDetecting: boolean]
    end

    subgraph "Component State"
        ShoeState[shoe: ContentstackShoe]
        ColorState[selectedColor: string]
        ColorVariants[colorVariants: string[]]
    end

    subgraph "Effects"
        InitEffect[Initialize Personalize]
        ColorEffect[Set Color Personalization]
        FetchEffect[Fetch with Variants]
    end

    State --> Currency
    State --> Country
    State --> Variants
    State --> Loading
    State --> Detecting

    InitEffect --> State
    ColorEffect --> ColorVariants
    FetchEffect --> ShoeState
```

### 9.3 CurrencyContext Implementation

```typescript
// contexts/CurrencyContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Currency, 
  autoDetectAndSetPersonalize,
  initPersonalize,
} from '@/lib/personalize';

interface CurrencyContextType {
  currency: Currency;
  detectedCountry: string | null;
  variantAliases: string[];
  isLoading: boolean;
  isDetecting: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [variantAliases, setVariantAliases] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initPersonalize();
      const result = await autoDetectAndSetPersonalize();
      
      setDetectedCountry(result.detectedCountry);
      setCurrency(result.finalCurrency);
      setVariantAliases(result.shortUids);
      setIsDetecting(false);
    };

    init();
  }, []);

  return (
    <CurrencyContext.Provider value={{
      currency,
      detectedCountry,
      variantAliases,
      isLoading,
      isDetecting,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}
```

---

## 10. Data Flow Diagrams

### 10.1 Complete Data Flow

```mermaid
flowchart TB
    subgraph "User Actions"
        A1[Visit Site]
        A2[Browse Products]
        A3[View Product]
        A4[Select Color]
        A5[Submit Review]
    end

    subgraph "Frontend"
        F1[React Components]
        F2[Currency Context]
        F3[API Calls]
    end

    subgraph "API Layer"
        API1[/api/shoes]
        API2[/api/shoes/url]
        API3[/api/testimonials]
    end

    subgraph "Personalization"
        P1[IP Detection]
        P2[SDK Attributes]
        P3[Variant Resolution]
    end

    subgraph "Contentstack"
        C1[CDA - Read]
        C2[CMA - Write]
        C3[Personalize]
    end

    A1 --> F1
    F1 --> P1
    P1 --> P2
    P2 --> C3
    C3 --> P3
    P3 --> F2

    A2 --> F3
    F3 --> API1
    API1 --> C1

    A3 --> F3
    F3 --> API2
    API2 --> C1

    A4 --> P2
    P2 --> P3
    P3 --> F3

    A5 --> F3
    F3 --> API3
    API3 --> C2
```

### 10.2 Variant Resolution Flow

```mermaid
flowchart LR
    subgraph "Input"
        I1[Country: India]
        I2[Color: Red]
    end

    subgraph "SDK Processing"
        S1[Set Attributes]
        S2[Match Experience 2]
        S3[Match Experience 3]
        S4[Get Aliases]
    end

    subgraph "Output"
        O1[cs_personalize_2_1]
        O2[cs_personalize_3_2]
    end

    subgraph "Content Fetch"
        CF1[CDA Query]
        CF2[Variant Filter]
        CF3[Entry Selection]
    end

    I1 --> S1
    I2 --> S1
    S1 --> S2
    S1 --> S3
    S2 --> O1
    S3 --> O2
    S4 --> O1
    S4 --> O2

    O2 --> CF1
    CF1 --> CF2
    CF2 --> CF3
```

---

## 11. Sequence Diagrams

### 11.1 Initial Page Load Sequence

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant B as Browser
    participant N as Next.js
    participant IP as ipapi.co
    participant PS as Personalize SDK
    participant CS as Contentstack

    U->>B: Navigate to shoesphere.com
    B->>N: GET /
    
    N->>CS: Fetch global_config (SSR)
    CS-->>N: Header, Footer data
    
    N->>CS: Fetch homepage (SSR)
    CS-->>N: Hero, Featured shoes
    
    N-->>B: HTML + JS bundle
    
    B->>B: Hydrate React
    B->>IP: GET /json (detect country)
    IP-->>B: {country_name: "India"}
    
    B->>PS: init(projectUid)
    PS-->>B: SDK ready
    
    B->>PS: set({country: "India"})
    PS-->>B: Variant aliases: [cs_personalize_2_1]
    
    B->>N: GET /api/shoes?variants=cs_personalize_2_1
    N->>CS: Query with variants
    CS-->>N: INR priced shoes
    N-->>B: JSON response
    
    B->>B: Update UI with prices
    B-->>U: Display ₹ prices
```

### 11.2 Color Change Sequence

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant C as Color Selector
    participant S as State
    participant PS as Personalize SDK
    participant A as API Route
    participant CS as Contentstack

    U->>C: Click "Red" button
    C->>C: Update URL to ?color=red
    C->>S: setSelectedColor("Red")
    
    S->>PS: set({country: "India", color: "Red"})
    
    PS->>PS: Match audiences
    Note over PS: Experience 2: India → 1<br/>Experience 3: Red+India → 2
    
    PS-->>S: All variants: [cs_personalize_2_1, cs_personalize_3_2]
    
    S->>S: Filter color variants
    Note over S: Keep only experience 3:<br/>cs_personalize_3_2
    
    S->>A: GET /api/shoes/adidas?variants=cs_personalize_3_2
    A->>CS: Query with variant
    CS-->>A: Red India entry (₹10,200)
    A-->>S: Product data
    
    S->>C: Update shoe state
    C-->>U: Display Red shoe, ₹10,200
```

### 11.3 Testimonial Submission Sequence

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant F as Form
    participant A as API Route
    participant CMA as Contentstack CMA
    participant CMS as CMS

    U->>F: Fill review form
    U->>F: Click Submit
    
    F->>F: Validate inputs
    F->>A: POST /api/testimonials
    Note over A: {title, feedback, rating}
    
    A->>A: Validate request
    A->>CMA: POST /content_types/testimonial/entries
    
    CMA->>CMS: Create entry
    CMS-->>CMA: Entry created (draft)
    
    CMA-->>A: Success response
    A-->>F: {success: true}
    
    F->>F: Show success message
    F-->>U: "Thank you for your review!"
```

---

## 12. Deployment Architecture

### 12.1 Deployment Flow

```mermaid
flowchart TB
    subgraph "Development"
        Dev[Local Development]
        Git[Git Repository]
    end

    subgraph "CI/CD"
        Push[Git Push]
        Build[Build Process]
        Test[Tests]
        Deploy[Deployment]
    end

    subgraph "Production"
        Vercel[Vercel Edge Network]
        CDN[Global CDN]
        Functions[Serverless Functions]
    end

    subgraph "Contentstack"
        CS_CDN[Contentstack CDN]
        Assets[Asset Delivery]
    end

    Dev --> Git
    Git --> Push
    Push --> Build
    Build --> Test
    Test --> Deploy
    Deploy --> Vercel
    Vercel --> CDN
    Vercel --> Functions
    
    Functions --> CS_CDN
    CS_CDN --> Assets
```

### 12.2 Infrastructure Diagram

```mermaid
graph TB
    subgraph "Client"
        Browser[Web Browser]
    end

    subgraph "Edge Network"
        Edge1[Edge Node - US]
        Edge2[Edge Node - EU]
        Edge3[Edge Node - Asia]
    end

    subgraph "Application"
        App[Next.js App]
        SSR[SSR Functions]
        API[API Functions]
    end

    subgraph "External Services"
        CS[Contentstack APIs]
        IP[IP Geolocation]
    end

    Browser --> Edge1
    Browser --> Edge2
    Browser --> Edge3
    
    Edge1 --> App
    Edge2 --> App
    Edge3 --> App
    
    App --> SSR
    App --> API
    
    SSR --> CS
    API --> CS
    App --> IP
```

---

## 13. Environment Configuration

### 13.1 Environment Variables

```bash
# .env.local

# Contentstack CMS
CONTENTSTACK_API_KEY=blt...
CONTENTSTACK_DELIVERY_TOKEN=cs...
CONTENTSTACK_ENVIRONMENT=production
CONTENTSTACK_MANAGEMENT_TOKEN=cms...

# Contentstack Personalize (client-side)
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=prj...

# Optional: Contentstack Region
CONTENTSTACK_REGION=US  # US, EU, AZURE_EU, AZURE_NA
```

### 13.2 Configuration Hierarchy

```mermaid
graph TB
    subgraph "Environment Files"
        Env1[.env]
        Env2[.env.local]
        Env3[.env.development]
        Env4[.env.production]
    end

    subgraph "Priority"
        P1[Lowest]
        P2[Local Override]
        P3[Dev Specific]
        P4[Prod Specific]
    end

    subgraph "Usage"
        Server[Server-side Only]
        Client[Client-side Available]
    end

    Env1 --> P1
    Env2 --> P2
    Env3 --> P3
    Env4 --> P4

    Server --> |CONTENTSTACK_*| Env2
    Client --> |NEXT_PUBLIC_*| Env2
```

---

## 14. Error Handling

### 14.1 Error Handling Strategy

```mermaid
flowchart TB
    subgraph "Error Sources"
        E1[API Errors]
        E2[Network Errors]
        E3[SDK Errors]
        E4[Validation Errors]
    end

    subgraph "Handling"
        H1[Try-Catch Blocks]
        H2[Error Boundaries]
        H3[Fallback UI]
        H4[Logging]
    end

    subgraph "Recovery"
        R1[Retry Logic]
        R2[Default Values]
        R3[Graceful Degradation]
    end

    E1 --> H1
    E2 --> H1
    E3 --> H1
    E4 --> H1

    H1 --> H4
    H1 --> H2
    H2 --> H3

    H1 --> R1
    H1 --> R2
    H3 --> R3
```

### 14.2 Error Handling Implementation

```typescript
// API Route Error Handling
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof ContentstackError) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Component Error Handling
async function fetchWithRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

// Personalize SDK Error Handling
export async function initPersonalize() {
  try {
    const sdk = Personalize.init(projectUid);
    return sdk;
  } catch (error) {
    console.error('Personalize init failed:', error);
    return null; // Graceful degradation
  }
}
```

---

## 15. Performance Optimization

### 15.1 Optimization Strategies

```mermaid
flowchart TB
    subgraph "Server-Side"
        SSR[Server-Side Rendering]
        Cache[Response Caching]
        Edge[Edge Functions]
    end

    subgraph "Client-Side"
        Lazy[Lazy Loading]
        Memoize[Memoization]
        Debounce[Debouncing]
    end

    subgraph "Assets"
        Images[Image Optimization]
        Fonts[Font Optimization]
        Bundle[Bundle Splitting]
    end

    subgraph "API"
        Batch[Request Batching]
        Parallel[Parallel Requests]
        Minimal[Minimal Payloads]
    end

    SSR --> Cache
    Cache --> Edge
    
    Lazy --> Memoize
    Memoize --> Debounce
    
    Images --> Fonts
    Fonts --> Bundle
    
    Batch --> Parallel
    Parallel --> Minimal
```

### 15.2 Performance Metrics

| Metric | Target | Current | Method |
|--------|--------|---------|--------|
| FCP | < 1.5s | 1.2s | Lighthouse |
| LCP | < 2.5s | 2.1s | Lighthouse |
| TTI | < 3.5s | 3.0s | Lighthouse |
| CLS | < 0.1 | 0.05 | Lighthouse |
| API Response | < 500ms | 200ms | Server Logs |

### 15.3 Caching Strategy

```mermaid
flowchart LR
    subgraph "Cache Layers"
        Browser[Browser Cache]
        CDN[CDN Cache]
        Edge[Edge Cache]
        Server[Server Cache]
    end

    subgraph "Content Types"
        Static[Static Assets]
        Dynamic[Dynamic Content]
        Personal[Personalized]
    end

    Static --> Browser
    Static --> CDN
    
    Dynamic --> Edge
    Dynamic --> Server
    
    Personal --> Server
```

---

## Appendix A: Contentstack API Reference

### CDA Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v3/content_types` | GET | List content types |
| `/v3/content_types/{uid}/entries` | GET | List entries |
| `/v3/content_types/{uid}/entries/{entry_uid}` | GET | Get single entry |
| `/v3/assets` | GET | List assets |

### CMA Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v3/content_types/{uid}/entries` | POST | Create entry |
| `/v3/content_types/{uid}/entries/{entry_uid}` | PUT | Update entry |
| `/v3/content_types/{uid}/entries/{entry_uid}/publish` | POST | Publish entry |

---

## Appendix B: Personalize SDK Reference

### SDK Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `init(projectUid)` | Initialize SDK | Project UID |
| `set(attributes)` | Set user attributes | Object of key-value pairs |
| `getVariantAliases()` | Get matched variants | None |
| `triggerImpression(shortUid)` | Track impression | Variant short UID |
| `getManifest()` | Get experience manifest | None |

### Variant Alias Format

```
cs_personalize_{experienceShortUid}_{variantShortUid}

Examples:
- cs_personalize_2_0 → Experience 2, Variant 0
- cs_personalize_2_1 → Experience 2, Variant 1
- cs_personalize_3_2 → Experience 3, Variant 2
```

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **CDA** | Content Delivery API - Read-only API for published content |
| **CMA** | Content Management API - Write API for content operations |
| **SDK** | Software Development Kit |
| **SSR** | Server-Side Rendering |
| **ISR** | Incremental Static Regeneration |
| **CDN** | Content Delivery Network |
| **Variant** | A personalized version of content |
| **Audience** | A group of users defined by attributes |
| **Experience** | A personalization configuration |
| **Manifest** | Configuration data for personalization |

---

**Document History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 24, 2026 | Engineering Team | Initial TRD |
