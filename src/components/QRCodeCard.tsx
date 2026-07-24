import React, { useRef } from 'react';
import { DownloadIcon } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from './Button';
interface QRCodeCardProps {
  url: string;
  size?: number;
  showDownload?: boolean;
  tableName?: string;
}
export function QRCodeCard({
  url,
  size = 200,
  showDownload = false,
  tableName
}: QRCodeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate the QR locally (no third-party service) and download the canvas as a PNG.
  const handleDownload = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qrcode-${(tableName || 'mesa').replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-center"
        style={{
          width: size + 32,
          height: size + 32
        }}>

        <QRCodeCanvas
          value={url}
          size={size}
          level="M"
          marginSize={0}
          title={`QR Code${tableName ? ` da ${tableName}` : ''}`}
          className="rounded-md" />

      </div>

      {showDownload &&
      <Button
        variant="secondary"
        onClick={handleDownload}
        leftIcon={<DownloadIcon className="w-4 h-4" />}>

          Baixar QR Code
        </Button>
      }
    </div>);

}
