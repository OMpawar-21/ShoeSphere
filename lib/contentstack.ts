import stack from '@/lib/ContentstackClient';
import {
  ContentstackCategory,
  ContentstackHomepage,
  ContentstackShoe,
  ContentstackSiteConfig,
} from '@/types/contentstack';

type QueryBuilder = (query: any) => any;

/**
 * Generic function to fetch entries with variant support
 * Now properly handles variant aliases from Personalize
 */
export const getEntries = async <T>(
  contentType: string,
  options?: { 
    includeReference?: string[]; 
    queryBuilder?: QueryBuilder; 
    variantAliases?: string[]; // Array of aliases from SDK
  }
): Promise<T[]> => {
  let entryRequest = stack.contentType(contentType).entry();

  if (options?.includeReference?.length) {
    entryRequest = entryRequest.includeReference(options.includeReference);
  }

  // Apply variant aliases if provided
  if (options?.variantAliases && options.variantAliases.length > 0) {
    try {
      // The variants() method can accept a single alias or array
      const variantParam = options.variantAliases.length === 1 
        ? options.variantAliases[0] 
        : options.variantAliases;
      console.log(`📡 Applying variant aliases:`, variantParam);
      entryRequest = entryRequest.variants(variantParam);
    } catch (error) {
      console.error('Error applying variants:', error);
      // Continue without variants if there's an error
    }
  }

  let query = entryRequest.query();

  if (options?.queryBuilder) {
    const result = await options.queryBuilder(query).find();
    return (result.entries || []) as T[];
  }

  const result = await query.find();
  return (result.entries || []) as T[];
};

export const getEntriesWithCount = async <T>(
  contentType: string,
  options?: { 
    includeReference?: string[]; 
    queryBuilder?: QueryBuilder; 
    variantAliases?: string[]; // Array of aliases from SDK
  }
): Promise<{ entries: T[]; count: number }> => {
  let entryRequest = stack.contentType(contentType).entry();

  if (options?.includeReference?.length) {
    entryRequest = entryRequest.includeReference(options.includeReference);
  }

  // Apply variant aliases if provided
  if (options?.variantAliases && options.variantAliases.length > 0) {
    try {
      const variantParam = options.variantAliases.length === 1 
        ? options.variantAliases[0] 
        : options.variantAliases;
      console.log(`📡 Applying variant aliases:`, variantParam);
      entryRequest = entryRequest.variants(variantParam);
    } catch (error) {
      console.error('Error applying variants:', error);
    }
  }

  let query = entryRequest.query().includeCount();
  
  if (options?.queryBuilder) {
    query = options.queryBuilder(query);
  }

  const result = await query.find();
  return {
    entries: (result.entries || []) as T[],
    count: result.count || 0,
  };
};

export const getEntry = async <T>(
  contentType: string,
  entryUid: string,
  options?: { 
    includeReference?: string[]; 
    variantAliases?: string[]; // Array of aliases from SDK
  }
): Promise<T | null> => {
  let entryRequest = stack.contentType(contentType).entry(entryUid);

  if (options?.includeReference?.length) {
    entryRequest = entryRequest.includeReference(options.includeReference);
  }

  // Apply variant aliases if provided
  if (options?.variantAliases && options.variantAliases.length > 0) {
    try {
      const variantParam = options.variantAliases.length === 1 
        ? options.variantAliases[0] 
        : options.variantAliases;
      entryRequest = entryRequest.variants(variantParam);
    } catch (error) {
      // Continue without variants
    }
  }

  try {
    const result = await entryRequest.fetch();
    return result as T;
  } catch (error) {
    return null;
  }
};

/**
 * Fetches all shoe entries including their related brand, seller, and categories
 */
export const getAllShoes = async (variantAliases?: string[]): Promise<ContentstackShoe[]> => {
  return getEntries<ContentstackShoe>('shoes', {
    includeReference: ['brand_ref', 'category_ref', 'testimonials', 'material_ref', 'seller_ref'],
    variantAliases,
  });
};

/**
 * Fetches a single shoe based on the dynamic URL slug using equalTo
 */
export const getShoeByUrl = async (shoeUrl: string, variantAliases?: string[]): Promise<ContentstackShoe | null> => {
  // Construct the full URL as it exists in Contentstack (e.g., /shoes/superstar-classic)
  const fullUrl = `/shoes/${shoeUrl}`;

  const entries = await getEntries<ContentstackShoe>('shoes', {
    includeReference: ['brand_ref', 'category_ref', 'testimonials', 'material_ref', 'seller_ref'],
    queryBuilder: (query) => query.equalTo('url', fullUrl),
    variantAliases,
  });

  return entries[0] || null;
};

/**
 * Fetches global site settings like Logo and Nav links
 */
export const getGlobalConfig = async (): Promise<ContentstackSiteConfig> => {
  try {
    const entries = await getEntries<ContentstackSiteConfig>('site_config');
    return entries[0] || {};
  } catch (error) {
    // If site_config content type doesn't exist, return empty config
    return {};
  }
};

/**
 * Fetches homepage content with hero section and featured shoes
 */
export const getHomepage = async (variantAliases?: string[]): Promise<ContentstackHomepage | null> => {
  try {
    const entries = await getEntries<ContentstackHomepage>('homepage', {
      includeReference: [
        'featured_shoes',
        'featured_shoes.brand_ref',
        'featured_shoes.category_ref',
        'featured_shoes.testimonials',
        'featured_shoes.material_ref',
        'featured_shoes.seller_ref',
      ],
      variantAliases,
    });

    return entries[0] || null;
  } catch (error) {
    return null;
  }
};

export const getCategoriesBySlug = async (slug: string): Promise<ContentstackCategory[]> => {
  const categories = await getEntries<ContentstackCategory>('category');
  const normalizedSlug = slug.trim().toLowerCase();

  const slugify = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const exactMatches = categories.filter((category) => {
    const categorySlug = category.title
      ? slugify(category.title)
      : '';
    return categorySlug === normalizedSlug;
  });

  if (exactMatches.length > 0) return exactMatches;

  const partialMatches = categories.filter((category) => {
    const categorySlug = category.title ? slugify(category.title) : '';
    return categorySlug.includes(normalizedSlug);
  });

  return partialMatches;
};

export const getAllCategories = async (): Promise<ContentstackCategory[]> => {
  return getEntries<ContentstackCategory>('category');
};
