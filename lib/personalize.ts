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
 * 🌍 Detect user's country from IP address using multiple services
 * No hardcoding - uses free geolocation APIs
 */
export async function detectCountryFromIP(): Promise<string | null> {
  console.log('\n🌍 ===== DETECTING COUNTRY FROM IP =====');
  
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
      console.log(`📊 Response from ${service.name}:`, data);
      
      const country = service.extractCountry(data);

      if (country) {
        console.log(`✅ Country detected via ${service.name}: ${country}`);
        console.log(`🌍 ===== COUNTRY DETECTION COMPLETE =====\n`);
        return country;
      }
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.warn(`⚠️ ${service.name} failed:`, errorMsg);
      continue;
    }
  }

  console.error('❌ All geolocation services failed');
  console.log(`🌍 ===== COUNTRY DETECTION FAILED =====\n`);
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
    console.log('🎯 Raw variant aliases from SDK:', shortUids);
    console.log('🎯 Type:', typeof shortUids, 'Is Array:', Array.isArray(shortUids));

    const shortUidsArray = Array.isArray(shortUids) 
      ? shortUids.map(id => String(id)) 
      : [];

    console.log('🎯 Processed SHORT UIDs:', shortUidsArray);

    if (shortUidsArray.length === 0) {
      console.warn('⚠️ No variants matched!');
      console.warn('💡 Troubleshooting:');
      console.warn(`   - Check if country "${country}" matches your audience conditions in Contentstack`);
      console.warn(`   - Verify experience "Country wise Personalize" is Active (not Draft)`);
      console.warn(`   - Check if variations with Short UIDs 0 and 1 are enabled`);
      console.warn(`   - Verify country name EXACTLY matches: "${country}"`);
    } else {
      console.log('✅ Audience matched successfully');
      console.log(`📊 Will use these SHORT UIDs for content: [${shortUidsArray.join(', ')}]`);
    }

    console.log('🌍 ===== PERSONALIZE SET COMPLETE =====\n');

    return {
      shortUids: shortUidsArray,
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
          try {
            await sdk.triggerImpression(shortUid);
            console.log(`   ✅ Impression tracked successfully for SHORT UID: ${shortUid}`);
          } catch (networkError: any) {
            // Handle network errors gracefully
            const errorMessage = networkError?.message || String(networkError);
            console.warn(`   ⚠️ Network error tracking impression for SHORT UID "${shortUid}":`, errorMessage);
            console.warn(`   💡 This is usually a network/CORS issue. Impression may still be tracked.`);
            
            // Don't throw - continue with other impressions
            if (errorMessage.includes('Failed to fetch')) {
              console.warn(`   🔍 Possible causes:`);
              console.warn(`      - Network connectivity issue`);
              console.warn(`      - CORS policy blocking request`);
              console.warn(`      - Contentstack Personalize endpoint unavailable`);
              console.warn(`   💡 The app will continue to work. Check Contentstack Analytics later.`);
            }
          }
        } else {
          console.warn(`   ⚠️ Skipping impression for undefined or empty SHORT UID: ${shortUid}`);
        }
      } catch (impressionError) {
        console.error(`   ❌ Failed to track impression for SHORT UID: ${shortUid}`, impressionError);
        // Don't throw - continue with other impressions
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
 * 🔍 DEBUG: Test country detection and personalization
 */
export async function testCountryPersonalization(): Promise<void> {
  console.log('\n🧪 ===== TESTING COUNTRY PERSONALIZATION =====\n');
  
  try {
    // Test 1: Country detection
    console.log('Test 1: Detecting country from IP...');
    const country = await detectCountryFromIP();
    console.log('✅ Detected country:', country);
    
    if (!country) {
      console.error('❌ Country detection failed!');
      return;
    }
    
    // Test 2: Set personalize by country
    console.log('\nTest 2: Setting Personalize with detected country...');
    const result = await setPersonalizeByCountry(country);
    console.log('✅ Personalize result:', result);
    
    // Test 3: Check what SDK returned
    console.log('\nTest 3: Analyzing SHORT UIDs...');
    console.log('SHORT UIDs count:', result.shortUids.length);
    console.log('SHORT UIDs:', result.shortUids);
    
    if (result.shortUids.length === 0) {
      console.error('❌ No SHORT UIDs matched!');
      console.error('💡 Check your Contentstack Personalize setup:');
      console.error(`   - Experience "Country wise Personalize" is Active`);
      console.error(`   - Audience has condition: country equals ${country}`);
      console.error(`   - Variants with Short UIDs 0 and 1 are enabled`);
    } else {
      console.log('✅ SHORT UIDs matched successfully!');
    }
    
    // Test 4: Expected SHORT UIDs
    console.log('\nTest 4: Expected results...');
    if (country.includes('United States') || country === 'US' || country === 'USA') {
      console.log('💡 Expected SHORT UID: ["0"] (USD Entries)');
      console.log('💡 Actual SHORT UIDs:', result.shortUids);
      console.log(result.shortUids.includes('0') ? '✅ MATCH!' : '❌ MISMATCH!');
    } else if (country.includes('India') || country === 'IN') {
      console.log('💡 Expected SHORT UID: ["1"] (India Entries)');
      console.log('💡 Actual SHORT UIDs:', result.shortUids);
      console.log(result.shortUids.includes('1') ? '✅ MATCH!' : '❌ MISMATCH!');
    } else {
      console.log('💡 Country not configured for personalization:', country);
      console.log('💡 Should default to United States');
    }
    
    console.log('\n🧪 ===== TEST COMPLETE =====\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
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
    
    if (Array.isArray(aliases) && aliases.length > 0) {
      console.log('First alias:', aliases[0]);
      console.log('First alias type:', typeof aliases[0]);
    }
  } catch (e) {
    console.error('Error calling getVariantAliases:', e);
  }
  
  console.log('🔍 ===== END DEBUG =====');
}
