import React, { useState, useEffect, useRef } from 'react';

// --- 1. THE BOX BREATHING COMPONENT ---
const BoxBreathing = () => {
  const [phase, setPhase] = useState('Inhale');
  const [timeLeft, setTimeLeft] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          if (phase === 'Inhale') {
            setPhase('Hold');
            return 4; // Hold for 4s
          } else if (phase === 'Hold') {
            setPhase('Exhale');
            return 5; // Exhale for 5s
          } else {
            setPhase('Inhale');
            return 4; // Inhale for 4s
          }
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [phase]);

  return (
    <div className="flex flex-col items-center justify-center text-center w-full animate-fade-in">
      {/* The Breathing Circle */}
      <div className="relative flex items-center justify-center w-64 h-64 mb-12 mt-4">
        <div 
          className={`absolute w-48 h-48 rounded-full bg-indigo-500/20 border-2 border-indigo-400/50 transition-all duration-1000 ease-in-out ${
            phase === 'Inhale' ? 'scale-150 opacity-100' : 
            phase === 'Hold' ? 'scale-150 opacity-80' : 
            'scale-75 opacity-40'
          }`}
        />
        <div className="absolute z-10 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-indigo-300 tracking-wider mb-2 uppercase">{phase}</span>
          <span className="text-5xl font-light text-white">{timeLeft}</span>
        </div>
      </div>

      <p className="text-slate-400 text-sm max-w-[250px] leading-relaxed mx-auto">
        Focus on the circle. Match your breath to the expanding and contracting rhythm.
      </p>
    </div>
  );
};

// --- 2. THE EYE TRACKING COMPONENT ---
const EyeTracking = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full animate-fade-in py-8">
      
      {/* Responsive CSS keyframe injected directly */}
      <style>
        {`
          @keyframes bilateral-bounce {
            0%, 100% { left: 0%; }
            50% { left: calc(100% - 3rem); /* 3rem accounts for the w-12 ball width */ }
          }
          .animate-bilateral {
            animation: bilateral-bounce 2.5s ease-in-out infinite;
          }
        `}
      </style>

      {/* Instructions */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-slate-200 tracking-wide mb-3">
          Eye Tracking (EMDR)
        </h2>
        <p className="text-slate-400 text-sm max-w-md leading-relaxed mx-auto">
          Follow the glowing sphere back and forth with your eyes. <br/>
          <span className="text-teal-400/80 font-medium">Keep your head perfectly still.</span>
        </p>
      </div>

      {/* The Animation Track */}
      <div className="relative w-full max-w-md h-1 bg-slate-800 rounded-full flex items-center mb-12 mx-auto">
        {/* The Glowing Ball */}
        <div className="absolute w-12 h-12 bg-teal-400 rounded-full shadow-[0_0_40px_15px_rgba(45,212,191,0.4)] animate-bilateral" />
      </div>

    </div>
  );
};

// --- 3. THE MAIN WELLNESS LAYOUT ---
export const WellnessToolkit = () => {
  const [activeExercise, setActiveExercise] = useState('breathing');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // Placeholder audio
  const audioSource = "https://mannmitra-api-nfwj.onrender.com/public/rain.mp3";

  const toggleAudio = () => {
    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-slate-200">
      
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-400 mb-4">Wellness Toolkit</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Take a moment for yourself. Choose an exercise to ground your mind and ease your stress.
        </p>
      </div>

      {/* Exercise Selector Menu */}
      <div className="flex space-x-4 mb-12 bg-slate-800 p-2 rounded-2xl">
        <button 
          onClick={() => setActiveExercise('breathing')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            activeExercise === 'breathing' 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
            : 'hover:bg-slate-700 text-slate-300'
          }`}
        >
          🌬️ Box Breathing
        </button>
        <button 
          onClick={() => setActiveExercise('eyetracking')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            activeExercise === 'eyetracking' 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
            : 'hover:bg-slate-700 text-slate-300'
          }`}
        >
          👀 Eye Tracking
        </button>
        <button 
          onClick={() => setActiveExercise('grounding')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
            activeExercise === 'grounding' 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
            : 'hover:bg-slate-700 text-slate-300'
          }`}
        >
          🖐️ 5-4-3-2-1 Grounding
        </button>
      </div>

      {/* The Active Stage */}
      <div className="w-full max-w-2xl bg-slate-800/50 border border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center min-h-[400px] overflow-hidden">
        
        {/* Breathing Stage */}
        {activeExercise === 'breathing' && <BoxBreathing />}

        {/* Eye Tracking Stage */}
        {activeExercise === 'eyetracking' && <EyeTracking />}

        {/* Grounding Stage (Placeholder) */}
        {activeExercise === 'grounding' && (
          <div className="text-center space-y-4 animate-fade-in">
            <h3 className="text-2xl font-semibold text-indigo-300">Look around you.</h3>
            <ul className="text-left text-slate-300 space-y-2 mt-4 inline-block">
              <li>👀 Name 5 things you can see.</li>
              <li>✋ Name 4 things you can feel.</li>
              <li>👂 Name 3 things you can hear.</li>
              <li>👃 Name 2 things you can smell.</li>
              <li>👅 Name 1 thing you can taste.</li>
            </ul>
          </div>
        )}

      </div>

      {/* Ambient Audio Controls */}
      <div className="mt-12 bg-slate-800 px-6 py-4 rounded-full flex items-center space-x-4 border border-slate-700">
        <button 
          onClick={toggleAudio}
          className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-500 transition-colors"
        >
          {isPlayingAudio ? "⏸️" : "▶️"}
        </button>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-200">Ambient Rain Sounds</span>
          <span className="text-xs text-slate-400">Calm your mind</span>
        </div>
        <audio ref={audioRef} src={audioSource} loop />
      </div>

    </div>
  );
};