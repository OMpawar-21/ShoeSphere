import { NextRequest, NextResponse } from 'next/server';
import { getShoeByUrl } from '@/lib/contentstack';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const { url } = await params;
    const searchParams = request.nextUrl.searchParams;
    const variantsParam = searchParams.get('variants') || '';
    
    // Convert comma-separated string to array
    const variantAliases = variantsParam 
      ? variantsParam.split(',').filter(Boolean)
      : [];

    console.log(`📡 API: Fetching shoe ${url} with variants:`, variantAliases);

    const shoe = await getShoeByUrl(url, variantAliases);

    if (!shoe) {
      return NextResponse.json(
        { error: 'Shoe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      shoe,
      variantAliases,
    });
  } catch (error) {
    console.error('API Error fetching shoe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shoe' },
      { status: 500 }
    );
  }
}
