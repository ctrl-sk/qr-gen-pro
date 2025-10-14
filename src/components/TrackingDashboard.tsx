'use client';

import { useState, useEffect, useCallback } from 'react';
import { Pause, Trash2, Eye, Edit } from 'lucide-react';

interface QRCode {
  id: string;
  originalUrl: string;
  shortUrl: string;
  qrData: string;
  scanCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gradientColors?: string;
  logoData?: string;
  dotType?: string;
  cornerEyeType?: string;
  cornerEyeColor?: string;
  cornerSquareType?: string;
  dotColor?: string;
  cornerSquareColor?: string;
}

interface TrackingDashboardProps {
  refreshTrigger?: number;
  onLoadQrCode?: (qrCode: QRCode) => void;
}

export default function TrackingDashboard({
  refreshTrigger,
  onLoadQrCode
}: TrackingDashboardProps) {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQrCodes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/qr-codes');
      if (response.ok) {
        const data = await response.json();
        setQrCodes(data);
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQrCodes();
  }, [refreshTrigger, fetchQrCodes]);

  const toggleQrActive = async (qrCode: QRCode) => {
    try {
      const response = await fetch(`/api/qr-codes/${qrCode.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !qrCode.isActive }),
      });
      if (response.ok) {
        setQrCodes(prevQrCodes =>
          prevQrCodes.map(qr =>
            qr.id === qrCode.id ? { ...qr, isActive: !qr.isActive } : qr
          )
        );
      } else {
        console.error('Failed to toggle QR code status');
        alert('Failed to update QR code status. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling QR code status:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const deleteQrCode = async (qrCode: QRCode) => {
    if (confirm(`Are you sure you want to delete the QR code for "${qrCode.originalUrl}"? This action is permanent.`)) {
      try {
        const response = await fetch(`/api/qr-codes/${qrCode.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setQrCodes(prevQrCodes =>
            prevQrCodes.filter(qr => qr.id !== qrCode.id)
          );
        } else {
          console.error('Failed to delete QR code');
          alert('Failed to delete QR code. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting QR code:', error);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const loadQrCodeToGenerator = (qrCode: QRCode) => {
    if (onLoadQrCode) onLoadQrCode(qrCode);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return <div>Loading QR Codes...</div>;
  }

  if (!qrCodes || qrCodes.length === 0) {
    return (
      <div>
        <div>No QR codes generated yet.</div>
        <div>
          Switch to the QR Generator tab to create your first QR code.
        </div>
      </div>
    );
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>QR Code</th>
            <th>Original URL</th>
            <th>Short URL</th>
            <th>Scans</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {qrCodes.map(qrCode => (
            <tr key={qrCode.id}>
              <td>
                <Eye
                  size={18}
                  style={{ cursor: 'pointer' }}
                  onClick={() => loadQrCodeToGenerator(qrCode)}
                />
              </td>
              <td>
                {qrCode.originalUrl}
              </td>
              <td>{qrCode.shortUrl}</td>
              <td>{qrCode.scanCount}</td>
              <td>{qrCode.isActive ? 'Active' : 'Paused'}</td>
              <td>{formatDate(qrCode.createdAt)}</td>
              <td>
                <Pause size={16} style={{ cursor: 'pointer' }} onClick={() => toggleQrActive(qrCode)} />
                <Trash2 size={16} style={{ cursor: 'pointer' }} onClick={() => deleteQrCode(qrCode)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '1rem', fontSize: '0.95em', color: '#888' }}>
        <strong>Tips:</strong> Click the <Eye size={16} /> icon to load a QR code into the generator for editing or exporting.
      </div>
    </div>
  );
}
