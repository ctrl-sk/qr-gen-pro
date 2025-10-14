import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  try {
    const { shortId } = await params;
    
    // Find QR code by shortId (the part after /r/)
    const qrCode = await db.qrCode.findFirst({
      where: { 
        shortUrl: {
          endsWith: `/${shortId}`
        }
      },
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
    const ipAddress = forwarded ? forwarded.split(',')[0] : 'unknown';

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
