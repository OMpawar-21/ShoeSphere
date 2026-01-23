import Personalize from '@contentstack/personalize-edge-sdk';

// Currency types
export type Currency = 'USD' | 'EUR' | 'INR';

// Currency symbols for display
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
};

// 🔥 CRITICAL: These are the SHORT IDs from your Personalize experience
// These match what you see in Contentstack UI: INR=0, US=1, EU=2
export const VARIANT_SHORT_IDS: Record<Currency, string> = {
  INR: '0',  // Short UID from Contentstack
  USD: '1',  // Short UID from Contentstack
  EUR: '2',  // Short UID from Contentstack
};

// Full variant UIDs for Contentstack Delivery API
// These are DIFFERENT from the short IDs above!
export const VARIANT_FULL_UIDS: Record<Currency, string> = {
  USD: 'cs91db6b7e0d7f71e1',
  EUR: 'csc4ee31b822d1b0d0',
  INR: 'csb474334af86d3526',
};

// Personalize SDK instance (singleton)
let sdkInstance: Awaited<ReturnType<typeof Personalize.init>> | null = null;
let isInitializing = false;

/**
 * Initialize Personalize SDK
 */
export async function initPersonalize(): Promise<typeof sdkInstance> {
  if (sdkInstance) return sdkInstance;
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
    console.error('❌ NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID not configured');
    return null;
  }

  isInitializing = true;
  
  try {
    sdkInstance = await Personalize.init(projectUid);
    console.log('✅ Personalize SDK initialized successfully');
    isInitializing = false;
    return sdkInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Personalize SDK:', error);
    isInitializing = false;
    return null;
  }
}

/**
 * Set user attributes and get the SHORT variant ID for impression tracking
 * 
 * IMPORTANT: This returns the SHORT ID (0, 1, 2) for impression tracking,
 * NOT the full variant UID!
 */
export async function setUserAttributesAndGetVariantIds(
  attributes: Record<string, any>
): Promise<{ shortId: string; fullUid: string } | null> {
  try {
    const sdk = await initPersonalize();
    
    if (!sdk) {
      console.error('Personalize SDK not available');
      return null;
    }

    // Set user attributes
    await sdk.set(attributes);
    console.log('✅ User attributes set:', attributes);

    // Get the currency from attributes
    const currency = attributes.currency as Currency;
    
    if (!currency) {
      console.error('No currency in attributes');
      return null;
    }

    // Get variant aliases from SDK
    const variantAliases = sdk.getVariantAliases();
    console.log('🎯 SDK returned variant aliases:', variantAliases);

    // Get the short ID and full UID for this currency
    const shortId = VARIANT_SHORT_IDS[currency];
    const fullUid = VARIANT_FULL_UIDS[currency];

    console.log(`📊 Currency: ${currency} → Short ID: ${shortId}, Full UID: ${fullUid}`);

    return { shortId, fullUid };
  } catch (error) {
    console.error('Error setting attributes:', error);
    return null;
  }
}

/**
 * Set currency and get variant IDs
 */
export async function setPersonalizeCurrency(currency: Currency): Promise<{ shortId: string; fullUid: string } | null> {
  return setUserAttributesAndGetVariantIds({ currency });
}

/**
 * 🔥 CRITICAL: Trigger impression using SHORT variant ID
 * 
 * This is what was broken before - you need to use the SHORT ID (0, 1, 2)
 * NOT the full variant UID!
 * 
 * @param shortVariantId - The SHORT ID like "0", "1", "2" (NOT the full UID)
 */
export async function triggerVariantImpression(
  shortVariantId: string,
  context?: {
    contentType?: string;
    page?: string;
    productId?: string;
    [key: string]: any;
  }
): Promise<void> {
  try {
    const sdk = await initPersonalize();
    
    if (!sdk) {
      console.warn('Cannot track impression - SDK not available');
      return;
    }

    console.log(`🔥 Triggering impression for SHORT ID: "${shortVariantId}"`);

    // THIS IS THE FIX: Use short ID, not full UID!
    await sdk.triggerImpression(shortVariantId);
    
    console.log(`✅ Impression tracked for variant SHORT ID: ${shortVariantId}`);
    
    // Also track as an event for debugging
    if (context) {
      await sdk.addEvent('variant_impression', {
        variantShortId: shortVariantId,
        ...context,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Error triggering impression:', error);
  }
}

/**
 * Track product view with impression
 * 
 * @param productId - Product ID
 * @param shortVariantId - SHORT ID like "0", "1", "2"
 * @param currency - Currency for context
 */
export async function trackProductView(
  productId: string,
  shortVariantId: string,
  currency: Currency,
  additionalData?: Record<string, any>
): Promise<void> {
  try {
    // Trigger impression with SHORT ID
    await triggerVariantImpression(shortVariantId, {
      contentType: 'shoes',
      page: 'product_detail',
      productId,
      currency,
    });

    // Track product view event
    await trackEvent('product_viewed', {
      productId,
      variantShortId: shortVariantId,
      currency,
      ...additionalData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
}

/**
 * Track product list view with impressions
 * 
 * @param shortVariantId - SHORT ID like "0", "1", "2"
 * @param productCount - Number of products shown
 * @param listType - Type of list
 * @param currency - Currency for context
 */
export async function trackProductListView(
  shortVariantId: string,
  productCount: number,
  listType: 'homepage' | 'category' | 'search' | 'all',
  currency: Currency,
  additionalData?: Record<string, any>
): Promise<void> {
  try {
    // Trigger impression with SHORT ID
    await triggerVariantImpression(shortVariantId, {
      contentType: 'shoes',
      page: listType,
      productCount,
      currency,
    });

    // Track list view event
    await trackEvent('product_list_viewed', {
      listType,
      variantShortId: shortVariantId,
      productCount,
      currency,
      ...additionalData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error tracking product list view:', error);
  }
}

/**
 * Get current variant aliases
 */
export async function getCurrentVariantAliases(): Promise<string[]> {
  try {
    const sdk = await initPersonalize();
    if (!sdk) return [];
    return sdk.getVariantAliases();
  } catch (error) {
    console.error('Error getting current variants:', error);
    return [];
  }
}

/**
 * Track custom event
 */
export async function trackEvent(eventName: string, eventData?: Record<string, any>): Promise<void> {
  try {
    const sdk = await initPersonalize();
    if (!sdk) return;

    await sdk.addEvent(eventName, eventData);
    console.log('📊 Event tracked:', eventName, eventData);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Format price with currency symbol
 */
export function formatPrice(price: string, currency: Currency): string {
  if (!price) return 'N/A';
  
  if (/[₹€$]/.test(price)) {
    return price;
  }
  
  const symbol = CURRENCY_SYMBOLS[currency];
  const numericValue = price.replace(/[^0-9.,]/g, '');
  return `${symbol}${numericValue}`;
}

/**
 * Get currency from location
 */
export function getCurrencyFromLocation(countryCode?: string): Currency {
  if (!countryCode) return 'USD';
  
  const euroCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'FI', 'IE', 'GR'];
  
  if (countryCode === 'IN') return 'INR';
  if (euroCountries.includes(countryCode)) return 'EUR';
  return 'USD';
}

/**
 * Helper: Get full variant UID for Contentstack API
 */
export function getFullVariantUid(currency: Currency): string {
  return VARIANT_FULL_UIDS[currency];
}

/**
 * Helper: Get short variant ID for impression tracking
 */
export function getShortVariantId(currency: Currency): string {
  return VARIANT_SHORT_IDS[currency];
}
