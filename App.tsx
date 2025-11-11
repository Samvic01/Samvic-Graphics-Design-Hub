
import React, { useState } from 'react';
import ImageEditor from './components/ImageEditor';
import ImageGenerator from './components/ImageGenerator';
import TextToSpeech from './components/TextToSpeech';
import VideoGenerator from './components/VideoGenerator';
import QuickChat from './components/QuickChat';
import { TabButton } from './components/TabButton';
import { CameraIcon, PencilIcon, SparklesIcon, VideoCameraIcon, ChatBubbleLeftRightIcon } from './components/Icons';
import type { Feature } from './types';

const features: Feature[] = [
  { id: 'edit', name: 'Image Editor', icon: PencilIcon, component: ImageEditor },
  { id: 'generate', name: 'Image Generator', icon: CameraIcon, component: ImageGenerator },
  { id: 'video', name: 'Video Generator', icon: VideoCameraIcon, component: VideoGenerator },
  { id: 'tts', name: 'Text-to-Speech', icon: SparklesIcon, component: TextToSpeech },
  { id: 'chat', name: 'Quick Chat', icon: ChatBubbleLeftRightIcon, component: QuickChat },
];

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>(features[0]);

  const ActiveComponent = activeFeature.component;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-wider">
            Gemini <span className="text-brand-secondary">Studio</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="mb-8 overflow-x-auto">
          <div className="inline-flex space-x-2 sm:space-x-4 border-b border-gray-700 pb-2">
            {features.map((feature) => (
              <TabButton
                key={feature.id}
                onClick={() => setActiveFeature(feature)}
                isActive={activeFeature.id === feature.id}
                icon={feature.icon}
              >
                {feature.name}
              </TabButton>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 min-h-[60vh] animate-fade-in">
          <ActiveComponent />
        </div>
      </main>

       <footer className="text-center py-6 text-gray-500 text-sm">
          <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;
