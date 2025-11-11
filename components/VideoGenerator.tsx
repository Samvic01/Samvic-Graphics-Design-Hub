
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { fileToBase64 } from '../utils/file';
import { UploadIcon, VideoCameraIcon } from './Icons';
import type { VideoAspectRatio } from '../types';

const videoAspectRatios: VideoAspectRatio[] = ["16:9", "9:16"];

const loadingMessages = [
    "Warming up the video cameras...",
    "Directing the digital actors...",
    "Rendering the first few frames...",
    "Applying special effects...",
    "Finalizing the soundtrack...",
    "This can take a few minutes, please wait...",
    "Almost there, adding the final touches..."
];

const VideoGenerator: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    // FIX: Add mimeType to the image state to handle different image formats correctly.
    const [image, setImage] = useState<{ url: string; base64: string; mimeType: string; } | null>(null);
    const [prompt, setPrompt] = useState('A woman dancing and preaching the gospel');
    const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkApiKey = async () => {
            // FIX: Removed conflicting global declaration for `window.aistudio`.
            // This assumes the type is provided globally elsewhere in the project.
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
        };
        checkApiKey();
    }, []);
    
    useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Optimistically assume the user selected a key.
            // The API call will fail if they didn't, which is handled in `handleSubmit`.
            setApiKeySelected(true);
        } else {
            setError("API key selection is not available in this environment.");
        }
    };

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                // FIX: Store the file's mimeType in state.
                setImage({ url: URL.createObjectURL(file), base64, mimeType: file.type });
                setVideoUrl(null);
                setError(null);
            } catch (err) {
                setError('Failed to read file.');
                console.error(err);
            }
        }
    }, []);

    const handleSubmit = async () => {
        if (!image) {
            setError("Please upload a starting image.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        setLoadingMessage(loadingMessages[0]);

        try {
            // IMPORTANT: Create a new instance right before the call to use the latest key.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                image: {
                    imageBytes: image.base64,
                    // FIX: Use the dynamic mimeType from state instead of hardcoding 'image/png'.
                    mimeType: image.mimeType,
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio
                }
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink && process.env.API_KEY) {
                // Fetching the video requires the API key
                setVideoUrl(`${downloadLink}&key=${process.env.API_KEY}`);
            } else {
                throw new Error("Video generation completed, but no download link was found.");
            }

        } catch (err) {
            const error = err as Error;
            console.error(err);
            if (error.message.includes("Requested entity was not found")) {
                setError("API Key error. Please re-select your API Key.");
                setApiKeySelected(false);
            } else {
                setError(`Video generation failed: ${error.message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!apiKeySelected) {
        return (
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-2 text-brand-secondary">Video Generation</h2>
                <p className="mb-4 text-gray-400">This feature requires an API key for video generation and billing.</p>
                <p className="mb-6 text-sm text-gray-500">
                    For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline">billing documentation</a>.
                </p>
                <button
                    onClick={handleSelectKey}
                    className="bg-brand-primary text-white font-bold py-3 px-6 rounded-md hover:bg-brand-dark transition-colors duration-200"
                >
                    Select API Key
                </button>
                {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-2 text-brand-secondary">Video Generator</h2>
            <p className="mb-6 text-gray-400">Upload a starting image and generate a video with Veo.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Input Column */}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="video-file-upload" className="cursor-pointer">
                            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-brand-secondary transition-colors">
                                {image ? (
                                    <img src={image.url} alt="Starting frame" className="max-h-60 mx-auto rounded-md shadow-lg" />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <UploadIcon className="w-12 h-12 mb-2" />
                                        <span className="font-semibold">Upload a starting image</span>
                                    </div>
                                )}
                            </div>
                        </label>
                        <input id="video-file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </div>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Optional: Describe what happens in the video..."
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-secondary focus:outline-none"
                        rows={3}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                        <div className="flex gap-2">
                            {videoAspectRatios.map(ratio => (
                                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-4 py-2 text-sm rounded-md ${aspectRatio === ratio ? 'bg-brand-secondary' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                    {ratio === '16:9' ? 'Landscape (16:9)' : 'Portrait (9:16)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !image}
                        className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-md hover:bg-brand-dark disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Generating Video...' : 'Generate Video'}
                    </button>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </div>

                {/* Output Column */}
                <div className="bg-gray-900/50 p-4 rounded-lg min-h-[400px] flex items-center justify-center">
                    {isLoading ? (
                         <div className="text-center text-gray-400">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-secondary mx-auto mb-4"></div>
                            <p className="font-semibold">{loadingMessage}</p>
                        </div>
                    ) : videoUrl ? (
                        <video src={videoUrl} controls autoPlay loop className="max-h-[500px] w-auto rounded-md shadow-lg" />
                    ) : (
                        <div className="text-gray-500 text-center flex flex-col items-center">
                           <VideoCameraIcon className="w-16 h-16 mb-4"/>
                           Your generated video will appear here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoGenerator;
