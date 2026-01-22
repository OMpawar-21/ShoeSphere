import { NextRequest, NextResponse } from 'next/server';
import { getShoeByUrl } from '@/lib/contentstack';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const { url } = await params;
    const searchParams = request.nextUrl.searchParams;
    const variantAlias = searchParams.get('variant') || undefined;

    console.log('API: Fetching shoe', url, 'with variant alias:', variantAlias);

    const shoe = await getShoeByUrl(url, variantAlias);

    if (!shoe) {
      return NextResponse.json(
        { error: 'Shoe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      shoe,
      variantAlias,
    });
  } catch (error) {
    console.error('Failed to fetch shoe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shoe' },
      { status: 500 }
    );
  }
}
