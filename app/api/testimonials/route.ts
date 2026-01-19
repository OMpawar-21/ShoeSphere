const CONTENTSTACK_API_KEY = process.env.CONTENTSTACK_API_KEY;
const CONTENTSTACK_MANAGEMENT_TOKEN = process.env.CONTENTSTACK_MANAGEMENT_TOKEN;

export async function POST(request: Request) {
  if (!CONTENTSTACK_API_KEY || !CONTENTSTACK_MANAGEMENT_TOKEN) {
    return Response.json(
      { error: 'Missing Contentstack management credentials.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const title = String(body?.title || '').trim();
    const feedback = String(body?.feedback || '').trim();
    const rating = Number(body?.rating);
    const sellerEmail = String(body?.seller_email || '').trim();

    if (!title || !feedback || !sellerEmail || !Number.isFinite(rating)) {
      return Response.json(
        { error: 'Invalid payload. Required: title, feedback, rating, seller_email.' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.contentstack.io/v3/content_types/testimonial/entries', {
      method: 'POST',
      headers: {
        api_key: CONTENTSTACK_API_KEY,
        authorization: CONTENTSTACK_MANAGEMENT_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          title,
          feedback,
          rating,
          seller_email: sellerEmail,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json({ error: data }, { status: response.status });
    }

    return Response.json({ entry: data.entry });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
