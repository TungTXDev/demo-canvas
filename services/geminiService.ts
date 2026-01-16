
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateDesignFromMockup(mockupBase64: string, userPrompt: string) {
    try {
      // Remove data URL prefix if present
      const base64Data = mockupBase64.split(',')[1] || mockupBase64;
      
      const prompt = `You are a professional product designer. I have a mockup of a tote bag with some elements (text/emojis) placed on it. 
      Analyze the provided image and generate a high-quality, photorealistic professional product studio shot of a real tote bag that implements this design beautifully. 
      Ensure the bag looks premium and the design elements are integrated naturally into the fabric texture.
      User's additional context: ${userPrompt || 'Make it look stylish and modern'}.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/png',
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      throw new Error("No image data returned from AI");
    } catch (error) {
      console.error("Gemini Image Generation Error:", error);
      throw error;
    }
  }

  async generatePureAIModel(prompt: string) {
    try {
      const fullPrompt = `Professional product photography of a premium tote bag. Design concept: ${prompt}. Studio lighting, clean background, 8k resolution.`;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Failed to generate AI model");
    } catch (error) {
      console.error("Gemini Prompt Generation Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
