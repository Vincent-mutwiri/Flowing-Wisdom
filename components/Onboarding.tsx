import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    title: "Clearhead",
    desc: "Regular meditation practice has been shown to reduce stress and anxiety, improve mood and emotional regulation.",
    color: "bg-teal-500",
    img: "https://cdn-icons-png.flaticon.com/512/2906/2906496.png" // Placeholder for Yoga vector
  },
  {
    id: 2,
    title: "Care",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
    color: "bg-pink-500",
    img: "https://cdn-icons-png.flaticon.com/512/2921/2921226.png" // Placeholder for Skincare vector
  },
  {
    id: 3,
    title: "Relax",
    desc: "Meditating during your period is a great way to relieve stress and anxiety, improve your mood, sleep better.",
    color: "bg-purple-500",
    img: "https://cdn-icons-png.flaticon.com/512/3048/3048347.png" // Placeholder for Relax vector
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="h-screen bg-[#FFF0E6] flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      
      {/* Skip Button */}
      <div className="flex justify-between items-center z-10 pt-4">
         <span className="font-bold text-gray-800">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
         <button onClick={onComplete} className="text-gray-500 font-bold hover:text-gray-800">Skip</button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center mt-10 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center"
          >
            <div className="w-64 h-64 mb-10 relative flex items-center justify-center">
               {/* Decorative Background Blob */}
               <div className={`absolute top-0 left-0 w-full h-full rounded-full opacity-20 blur-3xl ${slides[current].color}`}></div>
               <img src={slides[current].img} alt={slides[current].title} className="w-48 h-48 object-contain relative z-10 drop-shadow-xl" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{slides[current].title}</h2>
            <p className="text-gray-500 font-medium leading-relaxed max-w-xs">{slides[current].desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-8 mb-8 z-10">
         {/* Dots */}
         <div className="flex gap-2">
            {slides.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-all duration-300 ${current === idx ? 'w-6 bg-gray-800' : 'bg-gray-300'}`} />
            ))}
         </div>

         {/* Button */}
         <button 
            onClick={handleNext}
            className="w-16 h-16 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
         >
            {current === slides.length - 1 ? <Check size={24} /> : <ArrowRight size={24} />}
         </button>
      </div>
    </div>
  );
};

export default Onboarding;