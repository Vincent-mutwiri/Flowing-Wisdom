import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Image, Upload, Sparkles, Wand2, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageStudioProps {
  user: UserProfile;
}

const ImageStudio: React.FC<ImageStudioProps> = ({ user }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size too large. Please keep it under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage && !prompt) {
      setError("Please upload an image or enter a prompt.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const parts: any[] = [];
      if (prompt) parts.push({ text: prompt });
      if (selectedImage) {
        const base64Data = selectedImage.split(',')[1];
        const mimeType = selectedImage.split(';')[0].split(':')[1];
        parts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
      }
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts }
      });
      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
            foundImage = true;
            break;
          }
        }
      }
      if (!foundImage) setError("The model responded with text instead of an image.");
    } catch (err) {
      setError("Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="bg-gradient-to-r from-purple-600 to-[#FF2D55] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
            <Wand2 className="animate-pulse" />
            Creative Studio
          </h2>
          <p className="opacity-90 max-w-xl font-medium">
            Upload a photo and tell our AI to edit it. Try "Add a retro filter" or "Turn this into a sketch".
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6 h-fit">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden
              ${selectedImage ? 'border-pink-300 bg-pink-50' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/30'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
            {selectedImage ? (
              <img src={selectedImage} alt="Original" className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-center text-gray-400 group-hover:text-pink-500">
                <Upload size={48} className="mx-auto mb-2" />
                <p className="font-bold">Click to upload photo</p>
              </div>
            )}
          </div>

          <div className="relative">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Magic Prompt..."
              className="w-full p-4 pr-12 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-purple-200 font-medium"
            />
            <Sparkles className="absolute right-4 top-4 text-purple-400" size={20} />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-bold flex items-center gap-2"><AlertCircle size={16} />{error}</div>}

          <button 
            onClick={handleGenerate}
            disabled={loading || (!selectedImage && !prompt)}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <><RefreshCw size={20} className="animate-spin" /> Magic...</> : <><Wand2 size={20} /> Generate</>}
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
           <h3 className="font-bold text-gray-900 mb-4 text-lg">Result</h3>
           <div className="flex-1 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100 min-h-[400px] relative overflow-hidden">
              {generatedImage ? (
                <>
                  <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                  <a href={generatedImage} download="art.png" className="absolute bottom-6 right-6 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50">
                    <Download size={18} /> Download
                  </a>
                </>
              ) : (
                <div className="text-center text-gray-400 p-8">
                  {loading ? (
                    <div className="space-y-4">
                      <Sparkles size={60} className="mx-auto text-purple-300 animate-pulse" />
                      <p className="font-bold">Creating...</p>
                    </div>
                  ) : (
                    <>
                      <Image size={60} className="mx-auto mb-4 opacity-30" />
                      <p className="font-bold opacity-50">Your creation will appear here</p>
                    </>
                  )}
                </div>
              )}
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageStudio;