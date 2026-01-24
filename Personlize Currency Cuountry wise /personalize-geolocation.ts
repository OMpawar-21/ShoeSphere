import Personalize from '@contentstack/personalize-edge-sdk';

// Currency types
export type Currency = 'USD' | 'EUR' | 'INR';

// Currency symbols for display
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
};

// Country to Currency mapping (for reference, not hardcoded usage)
export const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  'United States of America': 'USD',
  'US': 'USD',
  'USA': 'USD',
  'India': 'INR',
  'IN': 'INR',
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
 * 🌍 Detect user's country from IP address using multiple services
 * No hardcoding - uses free geolocation APIs
 */
export async function detectCountryFromIP(): Promise<string | null> {
  console.log('🌍 Detecting country from IP address...');
  
  // Try multiple geolocation services for redundancy
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

  // Try each service
  for (const service of geoServices) {
    try {
      console.log(`📡 Trying geolocation service: ${service.name}`);
      
      const response = await fetch(service.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ ${service.name} returned status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const country = service.extractCountry(data);

      if (country) {
        console.log(`✅ Country detected via ${service.name}: ${country}`);
        return country;
      }
    } catch (error) {
      console.warn(`⚠️ ${service.name} failed:`, error);
      continue;
    }
  }

  console.error('❌ All geolocation services failed');
  return null;
}

/**
 * Get currency suggestion based on detected country
 * This is just a helper, not used for setting attributes
 */
export function getCurrencySuggestionFromCountry(country: string): Currency {
  const normalizedCountry = country.toLowerCase();
  
  if (normalizedCountry.includes('united states') || normalizedCountry === 'us' || normalizedCountry === 'usa') {
    return 'USD';
  }
  
  if (normalizedCountry.includes('india') || normalizedCountry === 'in') {
    return 'INR';
  }
  
  // Default to USD for other countries
  return 'USD';
}

/**
 * 🔥 Set user attributes based on detected country
 * The SDK will match audiences and return SHORT UIDs
 * 
 * @param country - Detected country name (e.g., "United States of America", "India")
 * @param manualOverride - Optional manual currency override
 */
export async function setPersonalizeByCountry(
  country: string,
  manualOverride?: Currency
): Promise<{
  shortUids: string[];
  detectedCountry: string;
  suggestedCurrency: Currency;
  finalCurrency: Currency;
}> {
  try {
    const sdk = await initPersonalize();
    
    if (!sdk) {
      console.error('❌ Personalize SDK not available');
      return {
        shortUids: [],
        detectedCountry: country,
        suggestedCurrency: 'USD',
        finalCurrency: 'USD',
      };
    }

    console.log('\n🌍 ===== SETTING PERSONALIZE BY COUNTRY =====');
    console.log('📍 Detected Country:', country);

    // Get currency suggestion from country
    const suggestedCurrency = getCurrencySuggestionFromCountry(country);
    console.log('💰 Suggested Currency:', suggestedCurrency);

    // Use manual override if provided, otherwise use suggested
    const finalCurrency = manualOverride || suggestedCurrency;
    console.log('💰 Final Currency:', finalCurrency, manualOverride ? '(manual override)' : '(auto-detected)');

    // 🔥 Set country attribute - Personalize will match audiences!
    console.log('📝 Setting Personalize attribute: country =', country);
    await sdk.set({ country: country });
    console.log('✅ Attribute set successfully');

    // 🔥 Get SHORT UIDs from matched audiences
    const shortUids = sdk.getVariantAliases();
    console.log('🎯 Matched SHORT UIDs from SDK:', shortUids);

    if (shortUids.length === 0) {
      console.warn('⚠️ No variants matched!');
      console.warn('💡 Troubleshooting:');
      console.warn(`   - Check if country "${country}" matches your audience conditions`);
      console.warn('   - Verify experience "Country wise Personalize" is Active');
      console.warn('   - Check if variations are enabled');
    } else {
      console.log('✅ Audience matched successfully');
    }

    console.log('🌍 ===== PERSONALIZE SET COMPLETE =====\n');

    return {
      shortUids,
      detectedCountry: country,
      suggestedCurrency,
      finalCurrency,
    };
  } catch (error) {
    console.error('❌ Error setting personalize by country:', error);
    return {
      shortUids: [],
      detectedCountry: country,
      suggestedCurrency: 'USD',
      finalCurrency: manualOverride || 'USD',
    };
  }
}

/**
 * 🚀 Auto-detect country and set personalize
 * This is the main function to call on app load
 */
export async function autoDetectAndSetPersonalize(
  manualOverride?: Currency
): Promise<{
  shortUids: string[];
  detectedCountry: string | null;
  suggestedCurrency: Currency;
  finalCurrency: Currency;
}> {
  console.log('🚀 Starting auto-detection...');

  // Detect country from IP
  const country = await detectCountryFromIP();

  if (!country) {
    console.warn('⚠️ Could not detect country, using default (United States of America)');
    return setPersonalizeByCountry('United States of America', manualOverride);
  }

  // Set personalize based on detected country
  return setPersonalizeByCountry(country, manualOverride);
}

/**
 * Manual currency override
 * Sets country based on selected currency
 */
export async function setManualCurrency(currency: Currency): Promise<string[]> {
  console.log(`💱 Manual currency override: ${currency}`);

  // Map currency to country for Personalize attribute
  const countryMap: Record<Currency, string> = {
    'USD': 'United States of America',
    'INR': 'India',
    'EUR': 'United States of America', // Fallback to USD if EUR not configured
  };

  const country = countryMap[currency];
  const result = await setPersonalizeByCountry(country, currency);
  
  return result.shortUids;
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
 * 🔥 Trigger impression using SHORT UIDs from getVariantAliases()
 */
export async function triggerVariantImpressions(
  shortUids: string[],
  context?: {
    contentType?: string;
    page?: string;
    productId?: string;
    country?: string;
    currency?: string;
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

    console.log(`🔥 Triggering impressions for SHORT UIDs:`, shortUids);
    if (context) {
      console.log(`📄 Context:`, context);
    }

    // Trigger impression for each SHORT UID
    for (const shortUid of shortUids) {
      try {
        console.log(`   🔥 Triggering impression for SHORT UID: "${shortUid}"`);
        await sdk.triggerImpression(shortUid);
        console.log(`   ✅ Impression tracked for SHORT UID: ${shortUid}`);
      } catch (impressionError) {
        console.error(`   ❌ Failed to track impression for SHORT UID: ${shortUid}`, impressionError);
      }
    }

    console.log('✅ All impressions triggered successfully');

    // Track as event
    if (context) {
      try {
        await sdk.addEvent('variant_impressions_tracked', {
          shortUids: shortUids,
          count: shortUids.length,
          ...context,
          timestamp: new Date().toISOString()
        });
        console.log('📊 Event tracked: variant_impressions_tracked');
      } catch (eventError) {
        console.error('⚠️ Failed to track event:', eventError);
      }
    }
  } catch (error) {
    console.error('❌ Error in triggerVariantImpressions:', error);
  }
}

/**
 * Track product view with impression
 */
export async function trackProductView(
  productId: string,
  shortUids: string[],
  context?: {
    country?: string;
    currency?: string;
    [key: string]: any;
  }
): Promise<void> {
  console.log(`👁️ Tracking product view: ${productId}`);
  
  await triggerVariantImpressions(shortUids, {
    contentType: 'shoes',
    page: 'product_detail',
    productId,
    ...context,
  });

  try {
    const sdk = await initPersonalize();
    if (sdk) {
      await sdk.addEvent('product_viewed', {
        productId,
        shortUids,
        ...context,
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
  context?: {
    country?: string;
    currency?: string;
    [key: string]: any;
  }
): Promise<void> {
  console.log(`📋 Tracking ${listType} list view (${productCount} products)`);
  
  await triggerVariantImpressions(shortUids, {
    contentType: 'shoes',
    page: listType,
    productCount,
    ...context,
  });

  try {
    const sdk = await initPersonalize();
    if (sdk) {
      await sdk.addEvent('product_list_viewed', {
        listType,
        productCount,
        shortUids,
        ...context,
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

    await sdk.addEvent(eventName, {
      ...eventData,
      timestamp: new Date().toISOString()
    });
    console.log(`📊 Event tracked: ${eventName}`, eventData);
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
 * 🔍 DEBUG: Test geolocation detection
 */
export async function testGeolocation(): Promise<void> {
  console.log('\n🧪 ===== TESTING GEOLOCATION =====');
  
  const country = await detectCountryFromIP();
  
  if (country) {
    console.log('✅ Country detected:', country);
    
    const currency = getCurrencySuggestionFromCountry(country);
    console.log('💰 Suggested currency:', currency);
    
    console.log('\n📊 Would set Personalize attribute:');
    console.log('   country:', country);
    console.log('\n💡 This would match your audience conditions in Contentstack');
  } else {
    console.error('❌ Geolocation detection failed');
  }
  
  console.log('🧪 ===== TEST COMPLETE =====\n');
}
