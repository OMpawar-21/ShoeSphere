import { NextRequest, NextResponse } from 'next/server';
import { getEntriesWithCount } from '@/lib/contentstack';
import { ContentstackShoe } from '@/types/contentstack';

const PAGE_SIZE = 4;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const variantsParam = searchParams.get('variants') || '';
    
    // Convert comma-separated string to array
    const variantAliases = variantsParam 
      ? variantsParam.split(',').filter(Boolean)
      : [];
    
    console.log(`📡 API: Fetching shoes with variants:`, variantAliases);
    
    const skip = (page - 1) * PAGE_SIZE;

    const { entries: shoes, count } = await getEntriesWithCount<ContentstackShoe>('shoes', {
      includeReference: ['brand_ref', 'category_ref', 'testimonials', 'material_ref', 'seller_ref'],
      queryBuilder: (query) => query.skip(skip).limit(PAGE_SIZE),
      variantAliases,
    });

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

    return NextResponse.json({
      shoes,
      count,
      totalPages,
      currentPage: page,
      variantAliases,
    });
  } catch (error) {
    console.error('API Error fetching shoes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shoes' },
      { status: 500 }
    );
  }
}
