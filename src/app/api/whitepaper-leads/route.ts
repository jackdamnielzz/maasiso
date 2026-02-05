import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, company, subscribeNewsletter, whitepaperTitle } = data;
    const baseUrl = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const token = process.env.STRAPI_TOKEN;

    if (!baseUrl || !token) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Send lead data to Strapi
    const response = await fetch(`${baseUrl}/api/whitepaper-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          name,
          email,
          company,
          subscribeNewsletter,
          whitepaperTitle,
          downloadDate: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Strapi error response:', errorData);
      throw new Error(`Failed to save lead data: ${JSON.stringify(errorData)}`);
    }

    // If user opted in for newsletter, add them to the newsletter list
    if (subscribeNewsletter) {
      await fetch(`${baseUrl}/api/newsletter-subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            email,
            name,
            company,
            source: 'whitepaper_download',
            subscriptionDate: new Date().toISOString(),
          },
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    );
  }
}
