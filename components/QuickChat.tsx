
import React, { useState } from 'react';
import { generateQuickText } from '../services/geminiService';

const QuickChat: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponse('');
    try {
      const result = await generateQuickText(prompt);
      setResponse(result);
    } catch (err) {
      const error = err as Error;
      setError(`Error getting response: ${error.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2 text-brand-secondary">Quick Chat</h2>
      <p className="mb-6 text-gray-400">Get low-latency responses from Gemini Flash Lite.</p>

      <div className="space-y-6">
        {response && (
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <p className="text-gray-200 whitespace-pre-wrap">{response}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask a quick question..."
            className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-secondary focus:outline-none transition-all duration-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt}
            className="bg-brand-primary text-white font-bold py-3 px-6 rounded-md hover:bg-brand-dark transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </form>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default QuickChat;
