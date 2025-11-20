import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Clock, Loader2 } from 'lucide-react';
import { GeneratedImage } from '../types';

interface HistoryViewProps {
  isOpen: boolean;
  onClose: () => void;
  images: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
  onClear: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ 
  isOpen, 
  onClose, 
  images, 
  onSelect, 
  onClear 
}) => {
  const [displayLimit, setDisplayLimit] = useState(20);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset display limit when closed so it starts fresh next open
  useEffect(() => {
    if (!isOpen) {
      setDisplayLimit(20);
    }
  }, [isOpen]);

  // Infinite scroll observer
  useEffect(() => {
    if (!isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => prev + 20);
        }
      },
      { 
        root: null, 
        threshold: 0.1,
        rootMargin: '100px' // Start loading slightly before reaching the bottom
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
      observer.disconnect();
    };
  }, [isOpen, displayLimit, images.length]);

  if (!isOpen) return null;

  const visibleImages = images.slice(0, displayLimit);
  const hasMore = displayLimit < images.length;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
            onClick={onClose}
        />
        
        {/* Drawer */}
        <div className="relative w-full max-w-md h-full bg-surface border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface/50 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-white">History</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-400">
                        {images.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {images.length > 0 && (
                        <button 
                            onClick={() => {
                                if(window.confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                                  onClear();
                                }
                            }}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                            title="Clear History"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {images.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                        <div className="p-4 rounded-full bg-white/5">
                          <Clock className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">No history yet</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                             {visibleImages.map((img) => (
                                <button
                                    key={img.id}
                                    onClick={() => onSelect(img)}
                                    className="relative aspect-[9/16] rounded-lg overflow-hidden border border-white/5 group focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <img 
                                        src={img.base64} 
                                        alt={img.prompt} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                                      <p className="text-[10px] text-white/90 truncate w-full text-left">
                                        {new Date(img.timestamp).toLocaleDateString()}
                                      </p>
                                    </div>
                                </button>
                             ))}
                        </div>
                        {hasMore && (
                            <div ref={loaderRef} className="py-6 flex justify-center w-full">
                                <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
  );
};