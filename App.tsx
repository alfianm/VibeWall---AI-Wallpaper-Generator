import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Zap, Clock, Smartphone, Monitor, Palette, Sliders } from 'lucide-react';
import { generateWallpapers } from './services/gemini';
import { GeneratedImage, GenerationState } from './types';
import { ImageViewer } from './components/ImageViewer';
import { LoadingState } from './components/LoadingState';
import { HistoryView } from './components/HistoryView';

const STYLE_PRESETS = [
  'None',
  'Photorealistic',
  'Anime',
  'Abstract',
  'Cyberpunk',
  'Vaporwave',
  'Oil Painting',
  'Watercolor',
  '3D Render',
  'Sketch'
];

const QUALITY_OPTIONS = ['Standard', 'High'];

export default function App() {
  // Load prompt draft from localStorage
  const [prompt, setPrompt] = useState(() => {
    try {
      return localStorage.getItem('vibewall_prompt_draft') || '';
    } catch (e) {
      return '';
    }
  });

  // Load initial images from localStorage
  const [images, setImages] = useState<GeneratedImage[]>(() => {
    try {
      const saved = localStorage.getItem('vibewall_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load history", e);
      return [];
    }
  });
  
  // Settings state
  const [aspectRatio, setAspectRatio] = useState<string>(() => localStorage.getItem('vibewall_aspect_ratio') || '9:16');
  const [style, setStyle] = useState<string>(() => localStorage.getItem('vibewall_style') || 'None');
  const [quality, setQuality] = useState<string>(() => localStorage.getItem('vibewall_quality') || 'Standard');

  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [state, setState] = useState<GenerationState>({ loading: false, error: null });
  const [showHistory, setShowHistory] = useState(false);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('vibewall_prompt_draft', prompt);
  }, [prompt]);

  useEffect(() => {
    localStorage.setItem('vibewall_history', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    localStorage.setItem('vibewall_aspect_ratio', aspectRatio);
    localStorage.setItem('vibewall_style', style);
    localStorage.setItem('vibewall_quality', quality);
  }, [aspectRatio, style, quality]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedImage || showHistory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage, showHistory]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setState({ loading: true, error: null });

    try {
      const base64Images = await generateWallpapers(prompt, aspectRatio, style, quality);
      
      const newImages: GeneratedImage[] = base64Images.map((base64) => ({
        id: crypto.randomUUID(),
        base64,
        prompt,
        timestamp: Date.now(),
        aspectRatio,
        style,
        quality
      }));

      setImages(prev => [...newImages, ...prev]); 
    } catch (err: any) {
      setState({ loading: false, error: err.message });
    } else {
      setState({ loading: false, error: null });
    }
  };

  const handleRemix = (image: GeneratedImage) => {
    setPrompt(`remix of: ${image.prompt}`);
    if (image.aspectRatio) setAspectRatio(image.aspectRatio);
    if (image.style) setStyle(image.style);
    if (image.quality) setQuality(image.quality);
    
    setSelectedImage(null);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setImages([]);
    setShowHistory(false);
  };

  const currentBatch = images.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary selection:text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-secondary p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              VibeWall
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface rounded-lg border border-white/10 p-1">
              <button 
                onClick={() => setAspectRatio('9:16')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${aspectRatio === '9:16' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Portrait (9:16)"
              >
                <Smartphone className="w-3 h-3" />
                9:16
              </button>
              <button 
                onClick={() => setAspectRatio('16:9')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${aspectRatio === '16:9' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Landscape (16:9)"
              >
                <Monitor className="w-3 h-3" />
                16:9
              </button>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
              title="View History"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4 pb-24">
        
        {/* Input Section */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <form onSubmit={handleGenerate} className="relative group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe your ${aspectRatio === '9:16' ? 'phone wallpaper' : 'desktop wallpaper'} vibe (e.g., neon rain cyberpunk city)...`}
                className="w-full bg-surface border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none h-28 transition-all duration-300 shadow-lg shadow-black/50"
                disabled={state.loading}
              />
              <div className="absolute bottom-3 right-3">
                 <button
                  type="submit"
                  disabled={!prompt.trim() || state.loading}
                  className="p-2 rounded-xl bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary/10 active:scale-95"
                >
                  {state.loading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-black/30 border-t-black rounded-full" />
                  ) : (
                    <Zap className="w-5 h-5 fill-current" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Controls Section */}
          <div className="space-y-3">
            {/* Style Presets */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1 text-xs font-medium text-zinc-400">
                <Palette className="w-3 h-3" />
                <span>Style Preset</span>
              </div>
              <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4">
                {STYLE_PRESETS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      style === s 
                        ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                        : 'bg-surface text-zinc-400 border-white/5 hover:border-white/20 hover:text-zinc-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

             {/* Quality Selector */}
            <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <Sliders className="w-3 h-3" />
                  <span>Quality</span>
                </div>
                <div className="flex bg-black/20 rounded-lg p-1">
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        quality === q
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
            </div>
          </div>

          {state.error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {state.error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {state.loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-6">
            {currentBatch.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Latest Vibes</h2>
                  {images[0].style && images[0].style !== 'None' && (
                     <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-500">
                       {images[0].style}
                     </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentBatch.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img)}
                      className={`group relative w-full overflow-hidden rounded-2xl bg-surface border border-white/5 focus:outline-none focus:ring-2 focus:ring-primary transition-transform active:scale-95 ${img.aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}
                    >
                      <img
                        src={img.base64}
                        alt={img.prompt}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <p className="text-white text-xs font-medium truncate">
                          {img.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-50">
                <div className="p-4 bg-surface rounded-full border border-white/5">
                  <ImageIcon className="w-8 h-8 text-zinc-500" />
                </div>
                <div className="max-w-[200px]">
                  <p className="text-sm text-zinc-400">
                    Your generated wallpapers will appear here. Check history for previous vibes.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Full Screen Viewer */}
      <ImageViewer
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onRemix={handleRemix}
      />

      {/* History Drawer */}
      <HistoryView 
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        images={images}
        onSelect={(img) => {
          setSelectedImage(img);
        }}
        onClear={handleClearHistory}
      />
    </div>
  );
}