
import { GoogleGenAI, Modality } from '@google/genai';
import type { AspectRatio, VideoAspectRatio } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// FIX: Updated editImage to return both image data and mimeType.
export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<{ data: string; mimeType: string; }> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
  
  const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
  if (imagePart && imagePart.inlineData) {
    return imagePart.inlineData;
  }
  throw new Error("No image generated in response.");
};


export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio,
      },
  });

  const generatedImage = response.generatedImages[0];
  if (generatedImage?.image?.imageBytes) {
      return generatedImage.image.imageBytes;
  }
  throw new Error("Image generation failed.");
};


export const generateSpeech = async (text: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) {
        return audioData;
    }
    throw new Error("Text-to-speech generation failed.");
};


export const generateQuickText = async (prompt: string): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt,
    });
    return response.text;
};
