'use client';

import { useState, useCallback } from 'react';

import QRGenerator from '@/components/QRGenerator';
import TrackingDashboard from '@/components/TrackingDashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'generator' | 'tracking'>('generator');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [qrCodeToLoad, setQrCodeToLoad] = useState<any>(null);

  const handleQrCodeGenerated = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    // Don't automatically switch tabs - let user stay on generator
  }, []);

  const handleLoadQrCode = useCallback((qrCode: any) => {
    setQrCodeToLoad(qrCode);
    setActiveTab('generator');
  }, []);

  return (
    <main className="app">
      <header className="appheader">
        <h1>QR Code Generator & Tracker</h1>
      </header>
      <div className="card">
        <nav className="tab-nav">
          <button
            className={`tab-button ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => setActiveTab('generator')}
          >
            QR Generator
          </button>
          <button
            className={`tab-button ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracking')}
          >
            Track QR Codes
          </button>
        </nav>
        {activeTab === 'generator' && (
          <QRGenerator
            onQrCodeGenerated={handleQrCodeGenerated}
            qrCodeToLoad={qrCodeToLoad}
            onQrCodeLoaded={() => setQrCodeToLoad(null)}
          />
        )}
        {activeTab === 'tracking' && (
          <TrackingDashboard
            refreshTrigger={refreshTrigger}
            onLoadQrCode={handleLoadQrCode}
          />
        )}
      </div>
    </main>
  );
}