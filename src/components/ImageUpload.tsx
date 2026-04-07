import React, { useRef, useState } from 'react';
import { UploadIcon, LinkIcon, XIcon, ImageIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { uploadApi } from '../api/upload';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use JPG, PNG, WebP ou GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadApi.upload(file);
      onChange(url);
      toast.success('Imagem enviada!');
    } catch {
      toast.error('Erro ao enviar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      )}

      {/* Mode toggle */}
      <div className="flex gap-1 mb-2 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === 'upload' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <UploadIcon className="w-3.5 h-3.5" />
          Upload
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === 'url' ? 'bg-white text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          URL
        </button>
      </div>

      {/* Preview */}
      {value && (
        <div className="relative mb-2 rounded-lg overflow-hidden border border-border">
          <img src={value} alt="Preview" className="w-full h-32 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && !value && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2Icon className="w-8 h-8 text-primary animate-spin mb-2" />
              <p className="text-sm text-text-secondary">Enviando...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-text-secondary">
                Arraste uma imagem ou <span className="text-primary font-medium">clique para selecionar</span>
              </p>
              <p className="text-xs text-text-muted mt-1">JPG, PNG, WebP ou GIF (máx. 5MB)</p>
            </div>
          )}
        </div>
      )}

      {/* URL mode */}
      {mode === 'url' && !value && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          className="w-full rounded-lg border border-border p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
      )}
    </div>
  );
}
