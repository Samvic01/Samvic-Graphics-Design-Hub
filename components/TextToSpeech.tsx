
import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState<string>('Hello! I am Gemini. I can convert text into natural sounding speech.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext on first user interaction (or component mount)
    // Browsers require a user gesture to start AudioContext
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      } catch (e) {
        setError("AudioContext is not supported by your browser.");
      }
    }

    return () => {
      // Cleanup on unmount
      audioSourceRef.current?.stop();
      // It's generally better to keep the context alive, but you could close it if needed
      // audioContextRef.current?.close(); 
    };
  }, []);

  const handleSubmit = async () => {
    if (!text) {
      setError('Please enter some text.');
      return;
    }
    if (!audioContextRef.current) {
        setError("AudioContext not initialized. Please interact with the page first.");
        return;
    }
    // Resume context if it's suspended (required by browser autoplay policies)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    setIsLoading(true);
    setError(null);
    try {
      const base64Audio = await generateSpeech(text);
      const audioData = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      
      // Stop any previously playing audio
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();

      audioSourceRef.current = source;
    } catch (err) {
      const error = err as Error;
      setError(`Error generating speech: ${error.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-brand-secondary">Text-to-Speech</h2>
      <p className="mb-6 text-gray-400">Bring your text to life with a natural sounding voice.</p>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to be spoken..."
          className="w-full p-4 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-secondary focus:outline-none transition-all duration-200"
          rows={6}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !text}
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
            'Speak'
          )}
        </button>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default TextToSpeech;
