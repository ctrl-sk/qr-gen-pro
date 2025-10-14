'use client';

import React, { useState, useEffect } from 'react';
import { Pause, Play, Trash2, Eye, Edit } from 'lucide-react';

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

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setQrCodes(prev => 
          prev.map(qr => 
            qr.id === id ? { ...qr, isActive: !isActive } : qr
          )
        );
      }
    } catch (error) {
      console.error('Error toggling QR code status:', error);
    }
  };

  const deleteQrCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return;

    try {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQrCodes(prev => prev.filter(qr => qr.id !== id));
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy URL');
    }
  };

  const loadQrCodeToGenerator = (qrCode: QRCode) => {
    onLoadQrCode?.(qrCode);
  };

  const startEditingUrl = (qrCode: QRCode) => {
    setEditingUrl(qrCode.id);
    setEditUrl(qrCode.originalUrl);
  };

  const saveEditedUrl = async (id: string) => {
    if (!editUrl.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    try {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl: editUrl }),
      });

      if (response.ok) {
        setQrCodes(prev => 
          prev.map(qr => 
            qr.id === id ? { ...qr, originalUrl: editUrl } : qr
          )
        );
        setEditingUrl(null);
        setEditUrl('');
      } else {
        alert('Failed to update URL');
      }
    } catch (error) {
      console.error('Error updating URL:', error);
      alert('Failed to update URL');
    }
  };

  const cancelEditing = () => {
    setEditingUrl(null);
    setEditUrl('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
        Loading QR codes...
      </div>
    );
  }

  if (qrCodes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-muted)' }}>
        <p>No QR codes generated yet.</p>
        <p>Switch to the QR Generator tab to create your first QR code.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '16px', color: 'var(--color-text)' }}>
        Track Your QR Codes
      </h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table className="tracking-table">
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
            {qrCodes.map((qr) => (
              <tr key={qr.id}>
                <td>
                  <img 
                    src={qr.qrData} 
                    alt="QR Code" 
                    className="qr-preview clickable"
                    onClick={() => loadQrCodeToGenerator(qr)}
                    title="Click to load in generator"
                  />
                </td>
                <td>
                  <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {editingUrl === qr.id ? (
                      <div className="edit-url-container">
                        <input
                          type="url"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="edit-url-input"
                          autoFocus
                        />
                        <div className="edit-url-buttons">
                          <button
                            onClick={() => saveEditedUrl(qr.id)}
                            className="save-edit-btn"
                            title="Save URL"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="cancel-edit-btn"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ) : (
                      <a 
                        href={qr.originalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
                      >
                        {qr.originalUrl}
                      </a>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <a 
                      href={qr.shortUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-accent)', textDecoration: 'none' }}
                    >
                      {qr.shortUrl}
                    </a>
                    <button
                      onClick={() => copyToClipboard(qr.shortUrl)}
                      style={{ 
                        marginLeft: '8px', 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--color-muted)',
                        cursor: 'pointer'
                      }}
                      title="Copy short URL"
                    >
                      📋
                    </button>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={16} />
                    {qr.scanCount}
                  </div>
                </td>
                <td>
                  <span 
                    style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: qr.isActive ? '#28a745' : '#dc3545',
                      color: 'white'
                    }}
                  >
                    {qr.isActive ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td>{formatDate(qr.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => startEditingUrl(qr)}
                      title="Edit URL"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      className={`action-btn ${qr.isActive ? 'pause' : 'resume'}`}
                      onClick={() => toggleActive(qr.id, qr.isActive)}
                      title={qr.isActive ? 'Pause tracking' : 'Resume tracking'}
                    >
                      {qr.isActive ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteQrCode(qr.id)}
                      title="Delete QR code"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '16px', color: 'var(--color-muted)', fontSize: '14px' }}>
        <p>💡 <strong>Tips:</strong></p>
        <ul style={{ marginLeft: '20px' }}>
          <li>Click on QR codes to load them back in the generator</li>
          <li>Click on URLs to open them in a new tab</li>
          <li>Use the copy button (📋) to copy short URLs</li>
          <li>Use the edit button to change the URL behind the QR code</li>
          <li>Pause QR codes to stop tracking scans temporarily</li>
          <li>Delete QR codes to remove them permanently</li>
        </ul>
      </div>
    </div>
  );
}
