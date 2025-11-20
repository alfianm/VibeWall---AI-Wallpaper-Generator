import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse-slow">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary blur-xl opacity-50 rounded-full"></div>
        <div className="relative bg-surface p-4 rounded-full border border-white/10">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
      <p className="text-zinc-400 text-sm font-medium">Dreaming up your vibe...</p>
    </div>
  );
};