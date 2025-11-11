import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/file';
import { UploadIcon, DownloadIcon } from './Icons';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ url: string; base64: string; mimeType: string } | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setOriginalImage({ url: URL.createObjectURL(file), base64, mimeType: file.type });
        setGeneratedImage(null);
        setError(null);
      } catch (err) {
        setError('Failed to read file.');
        console.error(err);
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!originalImage || !prompt) {
      setError('Please upload an image and provide a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const result = await editImage(originalImage.base64, originalImage.mimeType, prompt);
      // FIX: Use mimeType from the response to construct the data URL
      setGeneratedImage(`data:${result.mimeType};base64,${result.data}`);
    } catch (err) {
      const error = err as Error;
      setError(`Error editing image: ${error.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;

    const mimeType = generatedImage.split(';')[0].split(':')[1];
    const extension = mimeType.split('/')[1] || 'png';
    
    link.download = `edited-image.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div>
      <h2 className="text-3xl font-bold mb-2 text-brand-secondary">Image Editor</h2>
      <p className="mb-6 text-gray-400">Upload an image and tell Gemini how to edit it.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Input Column */}
        <div className="space-y-6">
          <div className="w-full">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-brand-secondary transition-colors">
                {originalImage ? (
                  <img src={originalImage.url} alt="Original" className="max-h-60 mx-auto rounded-md shadow-lg" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <UploadIcon className="w-12 h-12 mb-2" />
                    <span className="font-semibold">Click to upload an image</span>
                    <span className="text-sm">PNG, JPG, WEBP</span>
                  </div>
                )}
              </div>
            </label>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add a retro filter, remove the person in the background..."
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-secondary focus:outline-none transition-all duration-200"
            rows={3}
            disabled={!originalImage}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !originalImage || !prompt}
            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-dark transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Editing...
              </>
            ) : (
              'Edit Image'
            )}
          </button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Output Column */}
        <div className="bg-gray-900/50 p-4 rounded-lg min-h-[400px] flex items-center justify-center relative">
          {generatedImage ? (
            <>
              <img src={generatedImage} alt="Generated" className="max-h-[500px] w-auto rounded-md shadow-lg" />
              <button
                  onClick={handleDownload}
                  className="absolute top-4 right-4 bg-gray-800/70 text-white p-2 rounded-full hover:bg-brand-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-secondary"
                  aria-label="Download image"
                  title="Download image"
                >
                  <DownloadIcon className="w-6 h-6" />
                </button>
            </>
          ) : (
            <div className="text-gray-500 text-center">
                {isLoading ? 'Your edited image will appear here...' : 'Edited image will appear here'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;