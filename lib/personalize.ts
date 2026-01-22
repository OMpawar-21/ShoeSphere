import Personalize from '@contentstack/personalize-edge-sdk';

// Currency types
export type Currency = 'USD' | 'EUR' | 'INR';

// Full variant UIDs from Contentstack entries (these are the _variant._uid values)
// These are required by the Contentstack Delivery SDK's variants() method
export const VARIANT_UIDS: Record<Currency, string> = {
  USD: 'cs91db6b7e0d7f71e1', // Base/US variant
  EUR: 'csc4ee31b822d1b0d0', // Euro variant
  INR: 'csb474334af86d3526', // Indian Rupee variant
};

// Short variant IDs from Personalize project (for reference)
export const VARIANT_SHORT_IDS: Record<Currency, number> = {
  INR: 0,  // India audience
  USD: 1,  // US audience
  EUR: 2,  // EU audience
};

// Currency symbols
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
};

// Personalize SDK instance
let sdkInstance: Awaited<ReturnType<typeof Personalize.init>> | null = null;
let isInitializing = false;

/**
 * Initialize Personalize SDK
 */
export async function initPersonalize(): Promise<typeof sdkInstance> {
  if (sdkInstance) return sdkInstance;
  if (isInitializing) return null;

  const projectUid = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID;
  
  if (!projectUid) {
    console.warn('NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID not configured - using direct variant UIDs');
    return null;
  }

  isInitializing = true;
  
  try {
    sdkInstance = await Personalize.init(projectUid);
    console.log('Personalize SDK initialized successfully');
    isInitializing = false;
    return sdkInstance;
  } catch (error) {
    console.error('Failed to initialize Personalize SDK:', error);
    isInitializing = false;
    return null;
  }
}

/**
 * Get full variant UID for a currency
 * This is what Contentstack Delivery API needs
 */
export function getVariantUidForCurrency(currency: Currency): string {
  return VARIANT_UIDS[currency];
}

/**
 * Set currency and get variant UID for Contentstack API
 */
export async function setPersonalizeCurrency(currency: Currency): Promise<string> {
  const variantUid = VARIANT_UIDS[currency];
  
  try {
    const sdk = await initPersonalize();
    
    if (sdk) {
      // Try to set attribute and get variant alias from SDK
      try {
        // Set currency attribute to trigger audience matching
        await sdk.set({ currency: currency });
        
        // Get variant aliases from SDK
        const variantAliases = sdk.getVariantAliases();
        console.log('Personalize variant aliases:', variantAliases);
        
        if (variantAliases.length > 0) {
          // Return SDK-provided aliases if available
          return variantAliases.join(',');
        }
      } catch (sdkError) {
        console.warn('Error using Personalize SDK:', sdkError);
      }
    }
  } catch (error) {
    console.warn('Personalize SDK not available:', error);
  }
  
  // Return the full variant UID for direct use with Contentstack
  console.log('Using variant UID:', variantUid, 'for currency:', currency);
  return variantUid;
}

/**
 * Format price with correct currency symbol
 */
export function formatPrice(price: string, currency: Currency): string {
  if (!price) return 'N/A';
  
  // If price already has a currency symbol, return as is
  if (/[₹€$]/.test(price)) {
    return price;
  }
  
  // Add currency symbol
  const symbol = CURRENCY_SYMBOLS[currency];
  const numericValue = price.replace(/[^0-9.,]/g, '');
  return `${symbol}${numericValue}`;
}

/**
 * Get currency from variant UID
 */
export function getCurrencyFromVariantUid(variantUid: string): Currency {
  const entry = Object.entries(VARIANT_UIDS).find(([_, uid]) => uid === variantUid);
  return (entry?.[0] as Currency) || 'USD';
}
