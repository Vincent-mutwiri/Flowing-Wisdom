import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { GoogleGenAI } from "@google/genai";
import { Image, Upload, Sparkles, Wand2, Download, RefreshCw, AlertCircle } from 'lucide-react';

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
      
      // Add text prompt
      if (prompt) {
        parts.push({ text: prompt });
      }

      // Add image if exists
      if (selectedImage) {
        // Extract base64 data
        const base64Data = selectedImage.split(',')[1];
        const mimeType = selectedImage.split(';')[0].split(':')[1];
        
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            // Note: imageConfig options like aspectRatio are available but we stick to defaults for editing
        }
      });

      // Parse response for image
      let foundImage = false;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Str = part.inlineData.data;
            // Gemini typically returns PNG for generated images
            setGeneratedImage(`data:image/png;base64,${base64Str}`);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
         // Fallback if model decided to chat instead of generate
         setError("The model responded with text instead of an image. Try a more specific visual description.");
      }

    } catch (err) {
      console.error(err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-primary-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Wand2 className="animate-pulse" />
            Creative Studio
          </h2>
          <p className="opacity-90 max-w-xl">
            Unleash your creativity! Upload a photo and tell our AI to edit it. 
            Try "Add a retro filter", "Turn this into a sketch", or "Add sparkles to the background".
          </p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Image size={200} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6 h-fit">
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden
              ${selectedImage ? 'border-primary-300 bg-gray-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
            
            {selectedImage ? (
              <img src={selectedImage} alt="Original" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="text-center text-gray-400 group-hover:text-primary-500">
                <Upload size={48} className="mx-auto mb-2" />
                <p className="font-medium">Click to upload photo</p>
                <p className="text-xs mt-1">Supports JPG, PNG</p>
              </div>
            )}
            
            {selectedImage && (
              <div className="absolute bottom-2 right-2 bg-white/80 p-2 rounded-full shadow-sm hover:bg-white text-gray-600">
                 <RefreshCw size={16} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Magic Prompt</label>
            <div className="relative">
              <input 
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Make it look like a watercolor painting..."
                className="w-full p-4 pr-12 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-200"
              />
              <Sparkles className="absolute right-4 top-4 text-purple-400" size={20} />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={loading || (!selectedImage && !prompt)}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Working Magic...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Generate
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
           <h3 className="font-bold text-gray-900 mb-4">Result</h3>
           
           <div className="flex-1 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 min-h-[400px] relative">
              {generatedImage ? (
                <>
                  <img src={generatedImage} alt="Generated" className="w-full h-full object-contain rounded-xl" />
                  <a 
                    href={generatedImage} 
                    download="flowing-wisdom-art.png"
                    className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <Download size={18} />
                    Download
                  </a>
                </>
              ) : (
                <div className="text-center text-gray-400 p-8">
                  {loading ? (
                    <div className="space-y-4">
                      <Sparkles size={48} className="mx-auto text-primary-300 animate-pulse" />
                      <p>Creating your masterpiece...</p>
                    </div>
                  ) : (
                    <>
                      <Image size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Your creation will appear here</p>
                    </>
                  )}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;