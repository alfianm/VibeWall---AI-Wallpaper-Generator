import React from 'react';
import { X, Download, RefreshCw } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageViewerProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onRemix: (image: GeneratedImage) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, onRemix }) => {
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.base64;
    link.download = `vibewall-${image.timestamp}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Image Container */}
      <div className="relative w-full max-w-md aspect-[9/16] max-h-[85vh] rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
        <img 
          src={image.base64} 
          alt={image.prompt} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Actions Bar */}
      <div className="mt-6 flex items-center gap-4 w-full max-w-xs">
        <button
          onClick={() => onRemix(image)}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-surface border border-white/10 rounded-xl font-semibold hover:bg-white/5 transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Remix
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  );
};