import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const qrCodes = await db.qrCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json({ error: 'Failed to fetch QR codes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      originalUrl, 
      shortUrl, 
      qrData, 
      gradientColors,
      logoData,
      dotType,
      cornerEyeType,
      cornerEyeColor,
      dotColor,
      cornerSquareColor,
      cornerSquareType
    } = await request.json();

    console.log('Received data:', { originalUrl, shortUrl, hasQrData: !!qrData });

    if (!originalUrl || !qrData) {
      console.log('Missing required fields:', { originalUrl: !!originalUrl, qrData: !!qrData });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a short URL if not provided
    const finalShortUrl = shortUrl || `${process.env.NEXT_PUBLIC_APP_URL}/r/${nanoid(8)}`;
    console.log('Final short URL:', finalShortUrl);

    const qrCode = await db.qrCode.create({
      data: {
        originalUrl,
        shortUrl: finalShortUrl,
        qrData,
        gradientColors: gradientColors || null,
        logoData: logoData || null,
        dotType: dotType || 'dots',
        cornerEyeType: cornerEyeType || 'extra-rounded',
        cornerEyeColor: cornerEyeColor || '#CF4500',
        dotColor: dotColor || '#141413',
        cornerSquareColor: cornerSquareColor || '#323231',
        cornerSquareType: cornerSquareType || 'extra-rounded',
      },
    });

    console.log('Successfully created QR code:', qrCode.id);
    return NextResponse.json(qrCode);
  } catch (error) {
    console.error('Error creating QR code:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Failed to create QR code',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
