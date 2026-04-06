import React, { Component } from 'react';
import { DownloadIcon } from 'lucide-react';
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
  // A simple placeholder for QR code since we can't easily generate real ones without an external library
  // In a real app, we'd use qrcode.react here
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  const handleDownload = () => {
    // In a real app, this would fetch the image and trigger a download
    window.open(qrCodeUrl, '_blank');
  };
  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="bg-white p-4 rounded-xl border border-border shadow-sm flex items-center justify-center"
        style={{
          width: size + 32,
          height: size + 32
        }}>
        
        <img
          src={qrCodeUrl}
          alt={`QR Code for ${tableName || 'table'}`}
          width={size}
          height={size}
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