import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Zap, Clock } from 'lucide-react';
import { generateWallpapers } from './services/gemini';
import { GeneratedImage, GenerationState } from './types';
import { ImageViewer } from './components/ImageViewer';
import { LoadingState } from './components/LoadingState';
import { HistoryView } from './components/HistoryView';

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
  
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [state, setState] = useState<GenerationState>({ loading: false, error: null });
  const [showHistory, setShowHistory] = useState(false);

  // Save prompt draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vibewall_prompt_draft', prompt);
    } catch (e) {
      console.error("Failed to save prompt draft", e);
    }
  }, [prompt]);

  // Save images to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('vibewall_history', JSON.stringify(images));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  }, [images]);

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
      const base64Images = await generateWallpapers(prompt);
      
      const newImages: GeneratedImage[] = base64Images.map((base64) => ({
        id: crypto.randomUUID(),
        base64,
        prompt,
        timestamp: Date.now(),
      }));

      setImages(prev => [...newImages, ...prev]); // Add new images to the top
    } catch (err: any) {
      setState({ loading: false, error: err.message });
    } else {
      setState({ loading: false, error: null });
    }
  };

  const handleRemix = (image: GeneratedImage) => {
    // Remix logic: Populate prompt with "remix of: " + original prompt
    setPrompt(`remix of: ${image.prompt}`);
    setSelectedImage(null);
    setShowHistory(false); // Close history if open
    // Optional: could auto-focus the input or scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setImages([]);
    setShowHistory(false);
  };

  // Determine what to show on the main screen
  // We show the latest batch (up to 4) or empty state
  // The HistoryView holds everything else
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
            <div className="text-xs font-medium px-2 py-1 rounded-full bg-surface border border-white/10 text-zinc-400">
              9:16
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
                placeholder="Describe your vibe (e.g., neon rain cyberpunk city, soft pastel clouds...)"
                className="w-full bg-surface border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none h-32 transition-all duration-300 shadow-lg shadow-black/50"
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
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentBatch.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img)}
                      className="group relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-surface border border-white/5 focus:outline-none focus:ring-2 focus:ring-primary transition-transform active:scale-95"
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
          // We keep history open behind it, or close it? 
          // Usually nicer to keep context but for full screen viewer, let's just layer.
          // The ImageViewer has a high z-index.
        }}
        onClear={handleClearHistory}
      />
    </div>
  );
}