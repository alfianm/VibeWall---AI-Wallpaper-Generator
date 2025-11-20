export interface GeneratedImage {
  id: string;
  base64: string;
  prompt: string;
  timestamp: number;
  aspectRatio?: string;
  style?: string;
  quality?: string;
}

export interface GenerationState {
  loading: boolean;
  error: string | null;
}