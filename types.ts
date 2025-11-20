export interface GeneratedImage {
  id: string;
  base64: string;
  prompt: string;
  timestamp: number;
}

export interface GenerationState {
  loading: boolean;
  error: string | null;
}
