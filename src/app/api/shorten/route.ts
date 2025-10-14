import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Generate a short URL
    const shortId = nanoid(8);
    const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${shortId}`;

    return NextResponse.json({ 
      shortUrl,
      shortId,
      originalUrl: url 
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json({ error: 'Failed to create short URL' }, { status: 500 });
  }
}
