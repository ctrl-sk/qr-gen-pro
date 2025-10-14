import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${params.shortId}`;
    
    const qrCode = await db.qrCode.findUnique({
      where: { shortUrl },
    });

    if (!qrCode) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!qrCode.isActive) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Record the scan
    const userAgent = request.headers.get('user-agent');
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';

    await db.scan.create({
      data: {
        qrCodeId: qrCode.id,
        userAgent,
        ipAddress,
      },
    });

    // Update scan count
    await db.qrCode.update({
      where: { id: qrCode.id },
      data: { scanCount: { increment: 1 } },
    });

    // Redirect to the original URL
    return NextResponse.redirect(qrCode.originalUrl);
  } catch (error) {
    console.error('Error processing redirect:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
