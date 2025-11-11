
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { CameraIcon } from './Icons';
import type { AspectRatio } from '../types';

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!prompt) {
      setError('Please provide a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const result = await generateImage(prompt, selectedAspectRatio);
      setGeneratedImage(`data:image/jpeg;base64,${result}`);
    } catch (err) {
      const error = err as Error;
      setError(`Error generating image: ${error.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2 text-brand-secondary">Image Generator</h2>
      <p className="mb-6 text-gray-400">Describe the image you want to create with Imagen 4.0.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Input Column */}
        <div className="space-y-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A photorealistic image of a cat wearing a tiny wizard hat..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-secondary focus:outline-none transition-all duration-200"
            rows={4}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setSelectedAspectRatio(ratio)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${selectedAspectRatio === ratio ? 'bg-brand-secondary text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt}
            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-dark transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Output Column */}
        <div className="bg-gray-900/50 p-4 rounded-lg min-h-[400px] flex items-center justify-center">
          {generatedImage ? (
            <img src={generatedImage} alt="Generated" className="max-h-[500px] w-auto rounded-md shadow-lg" />
          ) : (
            <div className="text-gray-500 text-center flex flex-col items-center">
                <CameraIcon className="w-16 h-16 mb-4"/>
                {isLoading ? 'Conjuring up your image...' : 'Your generated image will appear here'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
