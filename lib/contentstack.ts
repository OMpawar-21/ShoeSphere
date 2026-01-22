import stack from '@/lib/ContentstackClient';
import {
  ContentstackCategory,
  ContentstackHomepage,
  ContentstackShoe,
  ContentstackSiteConfig,
} from '@/types/contentstack';

type QueryBuilder = (query: any) => any;

export const getEntries = async <T>(
  contentType: string,
  options?: { includeReference?: string[]; queryBuilder?: QueryBuilder; variantAlias?: string }
): Promise<T[]> => {
  let entryRequest = stack.contentType(contentType).entry();

  if (options?.includeReference?.length) {
    entryRequest = entryRequest.includeReference(options.includeReference);
  }

  // Add variant using the SDK's variants() method
  // Skip for base USD variant (cs91db6b7e0d7f71e1) as it's the default
  if (options?.variantAlias && options.variantAlias !== 'cs91db6b7e0d7f71e1') {
    entryRequest = entryRequest.variants(options.variantAlias);
    console.log('Fetching entries with variant:', options.variantAlias);
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
  options?: { includeReference?: string[]; queryBuilder?: QueryBuilder; variantAlias?: string }
): Promise<{ entries: T[]; count: number }> => {
  let entryRequest = stack.contentType(contentType).entry();

  if (options?.includeReference?.length) {
    entryRequest = entryRequest.includeReference(options.includeReference);
  }

  // Add variant using the SDK's variants() method
  // Skip for base USD variant (cs91db6b7e0d7f71e1) as it's the default
  if (options?.variantAlias && options.variantAlias !== 'cs91db6b7e0d7f71e1') {
    entryRequest = entryRequest.variants(options.variantAlias);
    console.log('Fetching entries with count, variant:', options.variantAlias);
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
  options?: { includeReference?: string[]; variantAlias?: string }
): Promise<T | null> => {
  let entryRequest = stack.contentType(contentType).entry(entryUid);

  if (options?.includeReference?.length) {
    entryRequest = entryRequest.includeReference(options.includeReference);
  }

  // Add variant using the SDK's variants() method
  // Skip for base USD variant (cs91db6b7e0d7f71e1) as it's the default
  if (options?.variantAlias && options.variantAlias !== 'cs91db6b7e0d7f71e1') {
    entryRequest = entryRequest.variants(options.variantAlias);
    console.log('Fetching entry with variant:', options.variantAlias);
  }

  try {
    const result = await entryRequest.fetch();
    return result as T;
  } catch (error) {
    console.warn(`Failed to fetch ${contentType} entry ${entryUid}`, error);
    return null;
  }
};

/**
 * Fetches all shoe entries including their related brand, seller, and categories
 */
export const getAllShoes = async (variantAlias?: string): Promise<ContentstackShoe[]> => {
  return getEntries<ContentstackShoe>('shoes', {
    includeReference: ['brand_ref', 'category_ref', 'testimonials', 'material_ref', 'seller_ref'],
    variantAlias,
  });
};

/**
 * Fetches a single shoe based on the dynamic URL slug using equalTo
 */
export const getShoeByUrl = async (shoeUrl: string, variantAlias?: string): Promise<ContentstackShoe | null> => {
  // Construct the full URL as it exists in Contentstack (e.g., /shoes/superstar-classic)
  const fullUrl = `/shoes/${shoeUrl}`;

  const entries = await getEntries<ContentstackShoe>('shoes', {
    includeReference: ['brand_ref', 'category_ref', 'testimonials', 'material_ref', 'seller_ref'],
    queryBuilder: (query) => query.equalTo('url', fullUrl),
    variantAlias,
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
    console.warn('site_config content type not found, using default config');
    return {};
  }
};

/**
 * Fetches homepage content with hero section and featured shoes
 */
export const getHomepage = async (variantAlias?: string): Promise<ContentstackHomepage | null> => {
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
      variantAlias,
    });

    return entries[0] || null;
  } catch (error) {
    console.warn('homepage content type not found:', error);
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
