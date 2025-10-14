import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isActive } = await request.json();
    
    const qrCode = await db.qrCode.update({
      where: { id: params.id },
      data: { isActive },
    });

    return NextResponse.json(qrCode);
  } catch (error) {
    console.error('Error updating QR code:', error);
    return NextResponse.json({ error: 'Failed to update QR code' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.qrCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'QR code deleted successfully' });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return NextResponse.json({ error: 'Failed to delete QR code' }, { status: 500 });
  }
}
