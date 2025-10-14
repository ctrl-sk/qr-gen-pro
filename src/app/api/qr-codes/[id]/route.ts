import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Satisfies the Vercel build process for route handler type validation.
export const config = {};

interface UpdatePayload {
  originalUrl?: string;
  isActive?: boolean;
  // Add other fields that can be updated via PATCH
  qrData?: string;
  gradientColors?: string;
  logoData?: string | null;
  dotType?: string;
  cornerEyeType?: string;
  cornerEyeColor?: string;
  dotColor?: string;
  cornerSquareColor?: string;
  cornerSquareType?: string;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const body: UpdatePayload = await request.json();
    const { id } = await context.params;
    
    const updatedQrCode = await db.qrCode.update({
      where: { id },
      data: body, // Pass the whole body to update any provided fields
    });

    return NextResponse.json(updatedQrCode);
  } catch (error) {
    console.error("Error updating QR code:", error);
    return NextResponse.json({ error: "Failed to update QR code" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await db.qrCode.delete({ where: { id } });
    return NextResponse.json({ message: "QR code deleted successfully" });
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return NextResponse.json({ error: "Failed to delete QR code" }, { status: 500 });
  }
}