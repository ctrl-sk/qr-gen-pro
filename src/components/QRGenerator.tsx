'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Copy, Download, Upload, Sun, Moon } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

const DEFAULT_URL = "https://shocky.in";
const LIGHT_MODE = "light";
const DARK_MODE = "dark";

const COLORS = {
  light: {
    dots: "#141413",
    cornersSquare: "#323231",
    cornersDot: "#CF4500",
  },
  dark: {
    dots: "#ffffff",
    cornersSquare: "#444340",
    cornersDot: "#F37338",
  },
};

const DOT_TYPES = [
  { value: "dots", label: "Dots" },
  { value: "rounded", label: "Rounded" },
  { value: "square", label: "Square" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

const CORNER_EYE_TYPES = [
  { value: "square", label: "Square" },
  { value: "extra-rounded", label: "Extra Rounded" },
  { value: "dot", label: "Dot" },
  { value: "classy", label: "Classy" },
  { value: "dots", label: "Dots" },
  { value: "classy-rounded", label: "Classy Rounded" },
];

interface CustomizationOptions {
  gradientColors: string[];
  logoData: string | null;
  dotType: string;
  cornerEyeType: string;
  cornerEyeColor: string;
  dotColor: string;
  cornerSquareColor: string;
  cornerSquareType: string;
}

interface QRCodeData {
  id: string;
  originalUrl: string;
  shortUrl: string;
  qrData: string;
  scanCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gradientColors?: string;
  logoData?: string | null;
  dotType?: string;
  cornerEyeType?: string;
  cornerEyeColor?: string;
  dotColor?: string;
  cornerSquareColor?: string;
  cornerSquareType?: string;
}

interface QRGeneratorProps {
  onQrCodeGenerated?: () => void;
  qrCodeToLoad?: QRCodeData;
  onQrCodeLoaded?: () => void;
}

export default function QRGenerator({ onQrCodeGenerated, qrCodeToLoad, onQrCodeLoaded }: QRGeneratorProps) {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [originalUrl, setOriginalUrl] = useState(DEFAULT_URL);
  const [currentMode, setCurrentMode] = useState(DARK_MODE);
  const [qr, setQr] = useState<QRCodeStyling | null>(null);
  const [exportSize, setExportSize] = useState(400);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQr, setEditingQr] = useState<QRCodeData | null>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customization, setCustomization] = useState<CustomizationOptions>({
    gradientColors: ['#EB001B', '#FF5F00', '#F79E1B'],
    logoData: null,
    dotType: 'dots',
    cornerEyeType: 'extra-rounded',
    cornerEyeColor: '#CF4500',
    dotColor: '#141413',
    cornerSquareColor: '#323231',
    cornerSquareType: 'extra-rounded',
  });

  const QR_SIZE = 360;
  const FRAME_PADDING = 24;
  const FRAME_STROKE = 12;
  const PREVIEW_SIZE = QR_SIZE + 2 * FRAME_PADDING + FRAME_STROKE;

  const addGradientColor = () => {
    if (customization.gradientColors.length < 5) {
      setCustomization(prev => ({
        ...prev,
        gradientColors: [...prev.gradientColors, '#000000']
      }));
    }
  };

  const removeGradientColor = (index: number) => {
    if (customization.gradientColors.length > 1) {
      setCustomization(prev => ({
        ...prev,
        gradientColors: prev.gradientColors.filter((_, i) => i !== index)
      }));
    }
  };

  const updateGradientColor = (index: number, color: string) => {
    setCustomization(prev => ({
      ...prev,
      gradientColors: prev.gradientColors.map((c, i) => i === index ? color : c)
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomization(prev => ({
          ...prev,
          logoData: result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an SVG file only.');
    }
  };

  const qrBorderExtension = useCallback((svg: SVGElement) => {
    const width = PREVIEW_SIZE;
    const height = PREVIEW_SIZE;
    const size = Math.min(width, height) - 2 * (FRAME_PADDING + FRAME_STROKE / 2);
    const frameSize = size + 2 * FRAME_PADDING;

    let svgDefs = svg.querySelector('defs');
    if (!svgDefs) {
      svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.insertBefore(svgDefs, svg.firstChild);
    }

    const oldGrad = svgDefs.querySelector('#frame-gradient');
    if (oldGrad) svgDefs.removeChild(oldGrad);

    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.setAttribute('id', 'frame-gradient');
    grad.setAttribute('x1', '0%');
    grad.setAttribute('y1', '0%');
    grad.setAttribute('x2', '100%');
    grad.setAttribute('y2', '100%');

    const stops = customization.gradientColors.map((color, index) => ({
      offset: `${(index / (customization.gradientColors.length - 1)) * 100}%`,
      color: color
    }));

    stops.forEach(stop => {
      const stopElem = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stopElem.setAttribute('offset', stop.offset);
      stopElem.setAttribute('stop-color', stop.color);
      grad.appendChild(stopElem);
    });

    svgDefs.appendChild(grad);

    const border = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    const borderAttributes = {
      "fill": "none",
      "x": (width - frameSize) / 2,
      "y": (height - frameSize) / 2,
      "width": frameSize,
      "height": frameSize,
      "stroke": 'url(#frame-gradient)',
      "stroke-width": FRAME_STROKE.toString(),
      "rx": "40",
    };

    Object.keys(borderAttributes).forEach(attribute => {
      border.setAttribute(attribute, String(borderAttributes[attribute as keyof typeof borderAttributes]));
    });

    svg.appendChild(border);
  }, [customization, PREVIEW_SIZE, FRAME_PADDING, FRAME_STROKE]);

  const createQrInstance = useCallback((value: string) => {
    const palette = COLORS[currentMode as keyof typeof COLORS];
    const qrOptions = {
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      type: "svg" as const,
      data: value,
      qrOptions: {
        errorCorrectionLevel: "H" as const,
        margin: 0,
      },
      backgroundOptions: {
        color: "transparent",
      },
      dotsOptions: {
        color: currentMode === DARK_MODE ? "#ffffff" : palette.dots,
        type: customization.dotType as "dots" | "rounded" | "square" | "extra-rounded",
      },
      cornersSquareOptions: {
        color: currentMode === DARK_MODE ? customization.cornerSquareColor : palette.cornersSquare,
        type: customization.cornerSquareType as "square" | "extra-rounded" | "dot" | "classy" | "classy-rounded",
      },
      cornersDotOptions: {
        color: currentMode === DARK_MODE ? customization.cornerEyeColor : palette.cornersDot,
        type: customization.cornerEyeType as "square" | "extra-rounded" | "dot" | "classy" | "classy-rounded",
      },
      image: customization.logoData || undefined,
    };
    return new QRCodeStyling(qrOptions);
  }, [currentMode, customization, PREVIEW_SIZE]);


  const updateQr = useCallback(async () => {
    if (!qrContainerRef.current) return;
    
    // Create a new QR instance with updated settings
    const palette = COLORS[currentMode as keyof typeof COLORS];
    const data = url || DEFAULT_URL;
    
    const qrInstance = new QRCodeStyling({
      width: PREVIEW_SIZE,
      height: PREVIEW_SIZE,
      type: "svg" as const,
      data,
      qrOptions: {
        errorCorrectionLevel: "H" as const,
      },
      backgroundOptions: {
        color: "transparent",
      },
      dotsOptions: {
        color: currentMode === DARK_MODE ? "#ffffff" : palette.dots,
        type: customization.dotType as "dots" | "rounded" | "square" | "extra-rounded",
      },
      cornersSquareOptions: {
        color: currentMode === DARK_MODE ? customization.cornerSquareColor : palette.cornersSquare,
        type: customization.cornerSquareType as "square" | "extra-rounded" | "dot" | "classy" | "classy-rounded",
      },
      cornersDotOptions: {
        color: currentMode === DARK_MODE ? customization.cornerEyeColor : palette.cornersDot,
        type: customization.cornerEyeType as "square" | "extra-rounded" | "dot" | "classy" | "classy-rounded",
      },
      image: customization.logoData || undefined,
    });

    setQr(qrInstance);

    try {
      const blob = await qrInstance.getRawData("svg");
      if (!blob || !(blob instanceof Blob)) return;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        if (!qrContainerRef.current) return;
        
        const parser = new DOMParser();
        const qrSvg = parser.parseFromString(e.target?.result as string, "image/svg+xml").documentElement;
        
        qrSvg.setAttribute("x", (FRAME_PADDING + FRAME_STROKE / 2).toString());
        qrSvg.setAttribute("y", (FRAME_PADDING + FRAME_STROKE / 2).toString());
        qrSvg.setAttribute("width", QR_SIZE.toString());
        qrSvg.setAttribute("height", QR_SIZE.toString());

        const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        wrapper.setAttribute("width", PREVIEW_SIZE.toString());
        wrapper.setAttribute("height", PREVIEW_SIZE.toString());
        wrapper.setAttribute("viewBox", `0 0 ${PREVIEW_SIZE} ${PREVIEW_SIZE}`);
        
        wrapper.appendChild(qrSvg);
        qrBorderExtension(wrapper);
        
        qrContainerRef.current.innerHTML = "";
        qrContainerRef.current.appendChild(wrapper);
      };
      reader.readAsText(blob);
    } catch (error) {
      console.error('Error updating QR code:', error);
    }
  }, [url, currentMode, customization, qrBorderExtension, PREVIEW_SIZE]);

  const setMode = (mode: string) => {
    setCurrentMode(mode);
  };

  const checkExistingUrl = async (urlToCheck: string) => {
    try {
      const response = await fetch('/api/qr-codes');
      if (response.ok) {
        const qrCodes = await response.json();
        return qrCodes.find((qr: QRCodeData) => qr.originalUrl === urlToCheck);
      }
    } catch (error) {
      console.error('Error checking existing URL:', error);
    }
    return null;
  };

  const updateQrCodeDestination = async (existingQrId: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/qr-codes/${existingQrId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: originalUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to update QR code destination.');
      }

      const updatedQr = await response.json();

      // Visually confirm the change to the user
      alert(`Success! The short URL ${updatedQr.shortUrl} now points to ${updatedQr.originalUrl}.`);
      onQrCodeGenerated?.(); // Refresh the dashboard

    } catch (error) {
      console.error('Error updating QR code destination:', error);
      alert('Failed to update the destination URL. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateExistingQrCode = async (existingQrId: string) => {
    setIsGenerating(true);
    
    try {
      // Generate QR code for the existing short URL
      const qrInstance = createQrInstance(shortUrl || originalUrl);
      
      // Create canvas for QR code data
      const canvas = document.createElement('canvas');
      canvas.width = QR_SIZE;
      canvas.height = QR_SIZE;
      const ctx = canvas.getContext('2d');
      
      if (ctx && qrInstance) {
        const blob = await qrInstance.getRawData('png');
        if (!blob || !(blob instanceof Blob)) return;
        
        const imageUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL();
          
          // Update existing QR code with new customization
          fetch(`/api/qr-codes/${existingQrId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              qrData: dataUrl,
              gradientColors: JSON.stringify(customization.gradientColors),
              logoData: customization.logoData,
              dotType: customization.dotType,
              cornerEyeType: customization.cornerEyeType,
              cornerEyeColor: customization.cornerEyeColor,
              dotColor: customization.dotColor,
              cornerSquareColor: customization.cornerSquareColor,
              cornerSquareType: customization.cornerSquareType,
            }),
          }).then(response => response.json())
          .then(() => {
            // Update QR display
            updateQr();
            onQrCodeGenerated?.();
          });
          
          URL.revokeObjectURL(imageUrl);
        };
        img.src = imageUrl;
      }
    } catch (error) {
      console.error('Error updating QR code:', error);
      alert('Failed to update QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateShortUrlAndQr = async () => {
    if (!originalUrl || originalUrl === DEFAULT_URL) {
      alert('Please enter a valid URL to generate QR code');
      return;
    }

    // If a QR code is loaded from the dashboard, handle updates specifically.
    if (editingQr) {
      // Case 1: The destination URL has changed.
      if (originalUrl !== editingQr.originalUrl) {
        const confirmUpdate = confirm(
          `You are about to change the destination URL for the short URL "${editingQr.shortUrl}".\n\n` +
          `Old URL: ${editingQr.originalUrl}\n` +
          `New URL: ${originalUrl}\n\n` +
          `Are you sure you want to continue?`
        );
        if (confirmUpdate) {
          await updateQrCodeDestination(editingQr.id);
        }
      } else {
        // Case 2: Only the design has changed, not the URL.
        await updateExistingQrCode(editingQr.id);
      }
      return; // Stop execution after handling the update.
    }

    // Check if URL already exists
    const existingQr = await checkExistingUrl(originalUrl);
    if (existingQr) {
      const shouldUpdate = confirm(
        `A QR code for this URL already exists.\n\n` +
        `Short URL: ${existingQr.shortUrl}\n\n` +
        `Would you like to update the existing QR code's design?`
      );
      
      if (shouldUpdate) {
        await updateExistingQrCode(existingQr.id);
      }
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate short URL
      const shortenResponse = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: originalUrl }),
      });
      
      if (!shortenResponse.ok) {
        throw new Error('Failed to generate short URL');
      }
      
      const shortData = await shortenResponse.json();
      const finalShortUrl = shortData.shortUrl;
      setShortUrl(finalShortUrl);

      // Generate QR code for short URL
      const qrInstance = createQrInstance(finalShortUrl);
      
      // Create canvas for QR code data
      const canvas = document.createElement('canvas');
      canvas.width = QR_SIZE;
      canvas.height = QR_SIZE;
      const ctx = canvas.getContext('2d');
      
      if (ctx && qrInstance) {
        const blob = await qrInstance.getRawData('png');
        if (!blob || !(blob instanceof Blob)) return;
        
        const imageUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          setUrl(finalShortUrl);
          const dataUrl = canvas.toDataURL();
          
          // Save QR code to database with customization options
          fetch('/api/qr-codes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              originalUrl: originalUrl,
              shortUrl: finalShortUrl,
              qrData: dataUrl,
              gradientColors: JSON.stringify(customization.gradientColors),
              logoData: customization.logoData,
              dotType: customization.dotType,
              cornerEyeType: customization.cornerEyeType,
              cornerEyeColor: customization.cornerEyeColor,
              dotColor: customization.dotColor,
              cornerSquareColor: customization.cornerSquareColor,
              cornerSquareType: customization.cornerSquareType,
            }),
          }).then(response => response.json())
          .then(() => {
            // Update QR display with short URL
            setUrl(finalShortUrl);
            updateQr();
            onQrCodeGenerated?.();
          });
          
          URL.revokeObjectURL(imageUrl);
        };
        img.src = imageUrl;
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportQr = async (format: 'png' | 'svg') => {
    if (!qr) return;

    const dataValue = shortUrl || originalUrl || DEFAULT_URL;
    const exportQrSize = exportSize;
    const designCanvasSize = QR_SIZE + 2 * FRAME_PADDING + FRAME_STROKE;

    const exportQrInstance = createQrInstance(dataValue);

    try {
      const blob = await exportQrInstance.getRawData("svg");
      if (!blob) return;
      
      const text = blob instanceof Blob ? await blob.text() : blob.toString();
      const parser = new DOMParser();
      const qrSvg = parser.parseFromString(text, "image/svg+xml").documentElement;
      
      qrSvg.setAttribute("x", (FRAME_PADDING + FRAME_STROKE / 2).toString());
      qrSvg.setAttribute("y", (FRAME_PADDING + FRAME_STROKE / 2).toString());
      qrSvg.setAttribute("width", QR_SIZE.toString());
      qrSvg.setAttribute("height", QR_SIZE.toString());

      const wrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      wrapper.setAttribute("width", designCanvasSize.toString());
      wrapper.setAttribute("height", designCanvasSize.toString());
      wrapper.setAttribute("viewBox", `0 0 ${designCanvasSize} ${designCanvasSize}`);
      
      wrapper.appendChild(qrSvg);
      qrBorderExtension(wrapper);

      wrapper.setAttribute("width", exportQrSize.toString());
      wrapper.setAttribute("height", exportQrSize.toString());
      wrapper.setAttribute("viewBox", `0 0 ${designCanvasSize} ${designCanvasSize}`);

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(wrapper);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      
      let dataBlob;
      if (format === "svg") {
        dataBlob = svgBlob;
      } else {
        dataBlob = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(svgBlob);
          img.onload = function() {
            const canvas = document.createElement("canvas");
            canvas.width = exportQrSize;
            canvas.height = exportQrSize;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, exportQrSize, exportQrSize);
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Failed to create blob'));
                }
              }, `image/${format}`);
            }
            URL.revokeObjectURL(url);
          };
          img.src = url;
        });
      }

      const downloadUrl = URL.createObjectURL(dataBlob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `qr.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error exporting QR code:', error);
    }
  };

  const copyShortUrl = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      alert('Short URL copied to clipboard!');
    }
  };

  // Initial mount effect
  useEffect(() => {
    updateQr();
  }, [updateQr]);

  // Update effect when dependencies change
  useEffect(() => {
    updateQr();
  }, [url, currentMode, customization, updateQr]);

  // Load existing QR code data when qrCodeToLoad is provided
  useEffect(() => {
    if (qrCodeToLoad) {
      setEditingQr(qrCodeToLoad);
      setOriginalUrl(qrCodeToLoad.originalUrl);
      setShortUrl(qrCodeToLoad.shortUrl);
      
      // Parse and restore customization options
      if (qrCodeToLoad.gradientColors) {
        try {
          const gradientColors = JSON.parse(qrCodeToLoad.gradientColors);
          setCustomization(prev => ({
            ...prev,
            gradientColors,
            logoData: qrCodeToLoad.logoData || null,
            dotType: qrCodeToLoad.dotType || 'dots',
            cornerEyeType: qrCodeToLoad.cornerEyeType || 'extra-rounded',
            cornerEyeColor: qrCodeToLoad.cornerEyeColor || '#CF4500',
            dotColor: qrCodeToLoad.dotColor || '#141413',
            cornerSquareColor: qrCodeToLoad.cornerSquareColor || '#323231',
            cornerSquareType: qrCodeToLoad.cornerSquareType || 'extra-rounded',
          }));
        } catch (error) {
          console.error('Error parsing gradient colors:', error);
        }
      }
      
      // Call the callback to clear the qrCodeToLoad
      onQrCodeLoaded?.();
    }
  }, [qrCodeToLoad, onQrCodeLoaded]);

  // When a short URL is generated or loaded, update the QR code to point to it
  useEffect(() => {
    if (shortUrl) setUrl(shortUrl);
  }, [shortUrl]);

  return (
    <div className="preview">
      <div className="preview-layout">
        <div 
          className="preview__outline" 
          data-mode={currentMode === LIGHT_MODE ? "light" : "dark"}
        >
          <div ref={qrContainerRef} className="qr-container" aria-live="polite" aria-label="QR preview"></div>
        </div>

        <div className="customization-panel">
          <h3>Customization Options</h3>
          
          {/* Light/Dark Mode Toggle */}
          <div className="customization-section">
            <label>QR Code Mode:</label>
            <div className="flex items-center gap-2">
              <Sun size={16} className="text-gray-400" />
              <Toggle
                pressed={currentMode === LIGHT_MODE}
                onPressedChange={(pressed) => setMode(pressed ? LIGHT_MODE : DARK_MODE)}
                variant="outline"
                size="sm"
                className="data-[state=on]:bg-orange-500 data-[state=on]:text-white"
              >
                {currentMode === LIGHT_MODE ? "Light" : "Dark"}
              </Toggle>
              <Moon size={16} className="text-gray-400" />
            </div>
          </div>
          
          {/* Gradient Colors */}
          <div className="customization-section">
            <label>Frame Gradient Colors (1-5 colors):</label>
            <div className="gradient-colors">
              {customization.gradientColors.map((color, index) => (
                <div key={index} className="color-input-group">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateGradientColor(index, e.target.value)}
                  />
                  {customization.gradientColors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGradientColor(index)}
                      className="remove-color"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {customization.gradientColors.length < 5 && (
                <button
                  type="button"
                  onClick={addGradientColor}
                  className="add-color"
                >
                  +
                </button>
              )}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="customization-section">
            <label>Upload Logo (SVG only):</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="upload-button"
            >
              <Upload size={16} />
              Choose SVG File
            </button>
            {customization.logoData && (
              <button
                onClick={() => setCustomization(prev => ({ ...prev, logoData: null }))}
                className="remove-logo"
              >
                Remove Logo
              </button>
            )}
          </div>

          {/* Dot Type */}
          <div className="customization-section">
            <label>Dot Type:</label>
            <select
              value={customization.dotType}
              onChange={(e) => setCustomization(prev => ({ ...prev, dotType: e.target.value }))}
            >
              {DOT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Corner Square Options */}
          <div className="customization-section">
            <label>Corner Square:</label>
            <div className="corner-options-row">
              <select
                value={customization.cornerSquareType}
                onChange={(e) => setCustomization(prev => ({ ...prev, cornerSquareType: e.target.value }))}
              >
                {CORNER_EYE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <input
                type="color"
                value={customization.cornerSquareColor}
                onChange={(e) => setCustomization(prev => ({ ...prev, cornerSquareColor: e.target.value }))}
                className="color-picker-small"
              />
            </div>
          </div>

          {/* Corner Dot Options */}
          <div className="customization-section">
            <label>Corner Dot:</label>
            <div className="corner-options-row">
              <select
                value={customization.cornerEyeType}
                onChange={(e) => setCustomization(prev => ({ ...prev, cornerEyeType: e.target.value }))}
              >
                {CORNER_EYE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <input
                type="color"
                value={customization.cornerEyeColor}
                onChange={(e) => setCustomization(prev => ({ ...prev, cornerEyeColor: e.target.value }))}
                className="color-picker-small"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="controls-row">
        <div className="control-left">
          <label htmlFor="url-input" className="sr-only">URL</label>
          <input 
            id="url-input"
            type="url"
            placeholder="Enter URL"
            spellCheck="false"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
          />
        </div>
        {shortUrl && (
        <div className="short-url-preview" style={{ opacity: qrCodeToLoad || editingQr ? 1 : 0 }}>
          <h4>{qrCodeToLoad ? "Loaded QR Code:" : "Generated Short URL:"}</h4>
          <div className="url-display">
            <span className="short-url">{shortUrl}</span>
            <button onClick={copyShortUrl} className="copy-button" title="Copy URL">
              <Copy size={16} />
            </button>
          </div>
        </div>
        )}
      </div>

      <div className="actions">
        <div className="size-picker">
          <label htmlFor="export-size" className="sr-only">Export size</label>
          <select
            id="export-size"
            aria-label="Select export size"
            value={exportSize}
            onChange={(e) => setExportSize(Number(e.target.value))}
          >
            <option value={256}>256×256</option>
            <option value={400}>400×400</option>
            <option value={600}>600×600</option>
            <option value={800}>800×800</option>
            <option value={1024}>1024×1024</option>
          </select>
        </div>
        
        <button 
          onClick={generateShortUrlAndQr} 
          className="button primary"
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate QR Code & Short URL'}
        </button>
        
        <button onClick={() => exportQr('png')} className="button">
          <Download size={16} />
          PNG
        </button>
        <button onClick={() => exportQr('svg')} className="button">
          <Download size={16} />
          SVG
        </button>
      </div>
    </div>
  );
}