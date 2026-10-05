import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Heart, Shield, Languages, Smartphone, Zap } from 'lucide-react';

const OnboardingScreen = ({ onGetStarted }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <Zap className="w-16 h-16 text-yellow-400" />,
      title: "Welcome to MannMitra",
      description: "Your safe and anonymous space to find support and companionship. Let's begin this journey together."
    },
    {
      icon: <Shield className="w-12 h-12 text-indigo-500" />,
      title: "Account-Scoped Memory",
      description: "Messages are sent to our AI provider, and chat, journal, and completed roleplay memories are stored in account-separated Pinecone namespaces for personalized context."
    },
    {
      icon: <Heart className="w-12 h-12 text-rose-500" />,
      title: "Culturally Sensitive",
      description: "Designed specifically for Indian youth with local languages and cultural context."
    },
    {
      icon: <Languages className="w-12 h-12 text-emerald-500" />,
      title: "Multilingual Support",
      description: "Chat in English, Hindi, Kannada, Tamil, Telugu, and other Indian languages."
    },
    {
      icon: <Smartphone className="w-12 h-12 text-sky-500" />,
      title: "Always Available",
      description: "Access support anytime through our app or WhatsApp - no appointments needed."
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onGetStarted();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden pt-20">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-center items-center">
        <h2 className="text-3xl font-bold text-white tracking-wider">MannMitra</h2>
      </div>

      <div className="max-w-sm w-full bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-700/50">
          <motion.div 
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentSlide / (slides.length -1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* Content area */}
        <div className="p-8 flex flex-col items-center" style={{ minHeight: '380px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-6">
                {slides[currentSlide].icon}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-4">
                {slides[currentSlide].title}
              </h1>
              
              <p className="text-gray-400 mb-8 px-4">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Dots indicator */}
        <div className="flex justify-center space-x-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                index === currentSlide ? 'bg-indigo-500' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between p-4 bg-gray-900/30">
          <button
            onClick={prevSlide}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              currentSlide === 0 
                ? 'text-gray-600 invisible' 
                : 'text-indigo-400 hover:bg-indigo-500/10'
            }`}
            disabled={currentSlide === 0}
          >
            Back
          </button>
          
          <button
            onClick={nextSlide}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium flex items-center hover:bg-indigo-500 transition-colors duration-300 shadow-lg shadow-indigo-600/30"
          >
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            {currentSlide < slides.length - 1 && <ChevronRight className="ml-1 w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Footer note */}
      <div className="max-w-sm w-full text-center mt-6">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our 
          <span className="text-indigo-400 cursor-pointer"> Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;