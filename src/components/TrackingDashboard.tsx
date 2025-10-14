'use client';

import { useState, useEffect } from 'react';
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
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState<string>('');

  useEffect(() => {
    const fetchQrCodes = async () => {
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
    };
    fetchQrCodes();
  }, [refreshTrigger]);

  const handleEditClick = (qrCode: QRCode) => {
    setEditingUrl(qrCode.id);
    setEditUrl(qrCode.originalUrl);
  };

  const handleEditSave = () => {
    // Implement edit save logic - send POST/PATCH to your API
    setEditingUrl(null);
  };

  const handleEditCancel = () => {
    setEditingUrl(null);
    setEditUrl('');
  };

  const toggleQrActive = async () => {
    // Implement toggle logic - send POST/PATCH to your API
    setLoading(true);
  };

  const deleteQrCode = async () => {
    // Implement delete logic - send DELETE to your API
    setLoading(true);
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
                {editingUrl === qrCode.id ? (
                  <input
                    value={editUrl}
                    onChange={e => setEditUrl(e.target.value)}
                    className="edit-url-input"
                    autoFocus
                  />
                ) : (
                  qrCode.originalUrl
                )}
              </td>
              <td>{qrCode.shortUrl}</td>
              <td>{qrCode.scanCount}</td>
              <td>{qrCode.isActive ? 'Active' : 'Paused'}</td>
              <td>{formatDate(qrCode.createdAt)}</td>
              <td>
                {editingUrl === qrCode.id ? (
                  <>
                    <button onClick={handleEditSave}>Save</button>
                    <button onClick={handleEditCancel}>Cancel</button>
                  </>
                ) : (
                  <>
                    <Edit size={16} style={{ cursor: 'pointer' }} onClick={() => handleEditClick(qrCode)} />
                    <Pause size={16} style={{ cursor: 'pointer' }} onClick={toggleQrActive} />
                    <Trash2 size={16} style={{ cursor: 'pointer' }} onClick={deleteQrCode} />
                  </>
                )}
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
