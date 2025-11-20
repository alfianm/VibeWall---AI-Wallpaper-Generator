import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWallpapers = async (prompt: string): Promise<string[]> => {
  try {
    // Using the specific model requested: imagen-4.0-generate-001
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 4,
        outputMimeType: 'image/jpeg',
        // Strictly required 9:16 aspect ratio for phone wallpapers
        aspectRatio: '9:16',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No images were generated.");
    }

    // Convert response bytes to base64 data URLs
    return response.generatedImages.map((img) => {
      if (!img.image.imageBytes) {
        throw new Error("Received incomplete image data.");
      }
      return `data:image/jpeg;base64,${img.image.imageBytes}`;
    });

  } catch (error: any) {
    console.error("Generation error:", error);
    throw new Error(error.message || "Failed to generate wallpapers. Please try again.");
  }
};
