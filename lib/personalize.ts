import Personalize from '@contentstack/personalize-edge-sdk';

// Currency types
export type Currency = 'USD' | 'EUR' | 'INR';

// Currency symbols for display
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
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
    console.log('🔍 SDK Type:', typeof sdkInstance);
    console.log('🔍 SDK Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(sdkInstance || {})));
    isInitializing = false;
    return sdkInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Personalize SDK:', error);
    isInitializing = false;
    return null;
  }
}

/**
 * 🔥 THE KEY FIX: getVariantAliases() RETURNS THE SHORT UIDs!
 * 
 * The SDK's getVariantAliases() method returns an array of SHORT UIDs
 * that match the current user's attributes.
 * 
 * For example, if user has currency=USD, it might return: ['1']
 * These ARE the short UIDs you see in Contentstack (0, 1, 2, etc.)
 */
export async function setUserAttributesAndGetVariants(
  attributes: Record<string, any>
): Promise<string[]> {
  try {
    const sdk = await initPersonalize();
    
    if (!sdk) {
      console.error('❌ Personalize SDK not available');
      return [];
    }

    console.log('📝 Setting user attributes:', attributes);

    // Set user attributes - this triggers audience matching
    await sdk.set(attributes);
    console.log('✅ User attributes set successfully');

    // 🔥 THIS IS THE FIX: getVariantAliases() returns the SHORT UIDs!
    const shortUids = sdk.getVariantAliases();
    
    console.log('🎯 Matched SHORT UIDs from SDK:', shortUids);
    console.log('🎯 Type of shortUids:', typeof shortUids, Array.isArray(shortUids));
    
    // Ensure we return an array of strings
    const shortUidsArray = Array.isArray(shortUids) 
      ? shortUids.map(id => String(id)) 
      : [];
    
    if (shortUidsArray.length === 0) {
      console.warn('⚠️ No variant aliases matched!');
      console.warn('💡 Check your Personalize experience configuration:');
      console.warn('   1. Is the experience Active?');
      console.warn('   2. Do the audience conditions match your attributes?');
      console.warn('   3. Are variations properly configured?');
    } else {
      console.log('✅ Successfully matched SHORT UIDs:', shortUidsArray);
    }

    return shortUidsArray;
  } catch (error) {
    console.error('❌ Error setting attributes:', error);
    return [];
  }
}

/**
 * Set currency specifically and get SHORT UIDs
 */
export async function setPersonalizeCurrency(currency: Currency): Promise<string[]> {
  console.log(`💰 Setting currency to: ${currency}`);
  const shortUids = await setUserAttributesAndGetVariants({ currency });
  console.log(`💰 Currency ${currency} matched SHORT UIDs:`, shortUids);
  return shortUids;
}

/**
 * Get current SHORT UIDs without changing attributes
 */
export async function getCurrentVariantAliases(): Promise<string[]> {
  try {
    const sdk = await initPersonalize();
    
    if (!sdk) {
      console.error('❌ SDK not available');
      return [];
    }

    const shortUids = sdk.getVariantAliases();
    const shortUidsArray = Array.isArray(shortUids) 
      ? shortUids.map(id => String(id)) 
      : [];
    
    console.log('📊 Current SHORT UIDs:', shortUidsArray);
    return shortUidsArray;
  } catch (error) {
    console.error('❌ Error getting current variants:', error);
    return [];
  }
}

/**
 * 🔥 CRITICAL: Trigger impression using SHORT UIDs from getVariantAliases()
 * 
 * @param shortUids - Array of SHORT UIDs (e.g., ['0'], ['1'], ['2'])
 */
export async function triggerVariantImpressions(
  shortUids: string[],
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
      console.warn('⚠️ Cannot track impression - SDK not available');
      return;
    }

    if (!shortUids || shortUids.length === 0) {
      console.warn('⚠️ No SHORT UIDs to track impressions for');
      return;
    }

    const impressionIds = shortUids
      .map((uid) => (uid ? String(uid).split('_').pop() : ''))
      .filter((uid) => uid !== '');

    if (impressionIds.length === 0) {
      console.warn('⚠️ No valid SHORT UIDs derived for impressions');
      return;
    }

    console.log(`🔥 Triggering impressions for SHORT UIDs:`, impressionIds);
    console.log(`📄 Context:`, context);

    // Trigger impression for each SHORT UID
    for (const shortUid of impressionIds) {
      try {
        console.log(`   🔥 Triggering impression for SHORT UID: "${shortUid}"`);
        
        // THIS is the critical call - using SHORT UID from getVariantAliases()
        if (typeof shortUid === 'string' && shortUid !== '') {
          await sdk.triggerImpression(shortUid);
          console.log(`   ✅ Impression tracked successfully for SHORT UID: ${shortUid}`);
        } else {
          console.warn(`   ⚠️ Skipping impression for undefined or empty SHORT UID: ${shortUid}`);
        }
      } catch (impressionError) {
        console.error(`   ❌ Failed to track impression for SHORT UID: ${shortUid}`, impressionError);
      }
    }

    console.log('✅ All impressions triggered successfully');

    // Optional: Track as event for additional analytics
    if (context) {
      try {
        const sdkAny = sdk as any;
        if (typeof sdkAny.addEvent === 'function') {
          await sdkAny.addEvent('variant_impressions_tracked', {
          shortUids: impressionIds,
          count: impressionIds.length,
          ...context,
          timestamp: new Date().toISOString()
          });
          console.log('📊 Event tracked: variant_impressions_tracked');
        }
      } catch (eventError) {
        console.error('⚠️ Failed to track event:', eventError);
      }
    }
  } catch (error) {
    console.error('❌ Error in triggerVariantImpressions:', error);
  }
}

/**
 * Track product view with automatic impression
 */
export async function trackProductView(
  productId: string,
  shortUids: string[],
  additionalData?: Record<string, any>
): Promise<void> {
  console.log(`👁️ Tracking product view: ${productId}`);
  
  // Trigger impressions
  await triggerVariantImpressions(shortUids, {
    contentType: 'shoes',
    page: 'product_detail',
    productId,
    ...additionalData,
  });

  // Track view event
  try {
    const sdk = await initPersonalize();
    const sdkAny = sdk as any;
    if (sdkAny && typeof sdkAny.addEvent === 'function') {
      await sdkAny.addEvent('product_viewed', {
        productId,
        shortUids,
        ...additionalData,
        timestamp: new Date().toISOString()
      });
      console.log('📊 Product view event tracked');
    }
  } catch (error) {
    console.error('⚠️ Failed to track product view event:', error);
  }
}

/**
 * Track product list view with impressions
 */
export async function trackProductListView(
  shortUids: string[],
  productCount: number,
  listType: 'homepage' | 'category' | 'search' | 'all',
  additionalData?: Record<string, any>
): Promise<void> {
  console.log(`📋 Tracking ${listType} list view (${productCount} products)`);
  
  // Trigger impressions
  await triggerVariantImpressions(shortUids, {
    contentType: 'shoes',
    page: listType,
    productCount,
    ...additionalData,
  });

  // Track list view event
  try {
    const sdk = await initPersonalize();
    const sdkAny = sdk as any;
    if (sdkAny && typeof sdkAny.addEvent === 'function') {
      await sdkAny.addEvent('product_list_viewed', {
        listType,
        productCount,
        shortUids,
        ...additionalData,
        timestamp: new Date().toISOString()
      });
      console.log('📊 Product list view event tracked');
    }
  } catch (error) {
    console.error('⚠️ Failed to track list view event:', error);
  }
}

/**
 * Add custom event
 */
export async function trackEvent(
  eventName: string,
  eventData?: Record<string, any>
): Promise<void> {
  try {
    const sdk = await initPersonalize();
    if (!sdk) return;

    const sdkAny = sdk as any;
    if (typeof sdkAny.addEvent === 'function') {
      await sdkAny.addEvent(eventName, {
        ...eventData,
        timestamp: new Date().toISOString()
      });
      console.log(`📊 Event tracked: ${eventName}`, eventData);
    }
  } catch (error) {
    console.error(`❌ Error tracking event ${eventName}:`, error);
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
 * 🔍 DEBUG: Inspect SDK structure (for development only)
 * Call this to see what the SDK object contains
 */
export async function debugSDKStructure(): Promise<void> {
  const sdk = await initPersonalize();
  if (!sdk) {
    console.error('❌ SDK not available for debugging');
    return;
  }

  console.log('🔍 ===== SDK STRUCTURE DEBUG =====');
  console.log('SDK instance:', sdk);
  console.log('SDK type:', typeof sdk);
  console.log('SDK constructor:', sdk.constructor?.name);
  
  // Check prototype methods
  const proto = Object.getPrototypeOf(sdk);
  console.log('SDK prototype methods:', Object.getOwnPropertyNames(proto));
  
  // Check own properties
  console.log('SDK own properties:', Object.keys(sdk));
  
  // Try common property names
  const sdkAny = sdk as any;
  console.log('sdk.experiences:', sdkAny.experiences);
  console.log('sdk._experiences:', sdkAny._experiences);
  console.log('sdk.variants:', sdkAny.variants);
  console.log('sdk._variants:', sdkAny._variants);
  
  // Try to call getVariantAliases
  try {
    const aliases = sdk.getVariantAliases();
    console.log('getVariantAliases() returned:', aliases);
    console.log('Type:', typeof aliases, 'IsArray:', Array.isArray(aliases));
  } catch (e) {
    console.error('Error calling getVariantAliases:', e);
  }
  
  console.log('🔍 ===== END DEBUG =====');
}
