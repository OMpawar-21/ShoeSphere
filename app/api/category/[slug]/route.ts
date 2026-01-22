import { NextRequest, NextResponse } from 'next/server';
import { getEntriesWithCount, getAllShoes } from '@/lib/contentstack';
import { ContentstackShoe } from '@/types/contentstack';

const PAGE_SIZE = 4;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const variantAlias = searchParams.get('variant') || undefined;
    const categoryUidsParam = searchParams.get('uids') || '';
    const categoryUids = categoryUidsParam.split(',').filter(Boolean);
    const skip = (page - 1) * PAGE_SIZE;

    console.log('API: Fetching category', slug, 'shoes with variant:', variantAlias);

    let { entries: shoes, count } = await getEntriesWithCount<ContentstackShoe>('shoes', {
      includeReference: ['brand_ref', 'category_ref', 'testimonials', 'material_ref', 'seller_ref'],
      queryBuilder: (query) => query.containedIn('category_ref', categoryUids).skip(skip).limit(PAGE_SIZE),
      variantAlias,
    });

    // Fallback: if no results from query, try filtering all shoes
    if (count === 0 && categoryUids.length > 0) {
      const allShoes = await getAllShoes(variantAlias);
      const filtered = allShoes.filter((shoe) => {
        const refs = Array.isArray(shoe.category_ref)
          ? shoe.category_ref
          : shoe.category_ref
            ? [shoe.category_ref]
            : [];
        return refs.some((ref) => ref?.uid && categoryUids.includes(ref.uid));
      });

      count = filtered.length;
      shoes = filtered.slice(skip, skip + PAGE_SIZE);
    }

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

    return NextResponse.json({
      shoes,
      count,
      totalPages,
      currentPage: page,
      variantAlias,
      slug,
    });
  } catch (error) {
    console.error('Failed to fetch category shoes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category shoes' },
      { status: 500 }
    );
  }
}
