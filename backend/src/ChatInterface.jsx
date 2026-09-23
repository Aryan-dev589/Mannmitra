import React, { useState, useEffect, useRef } from 'react';
import { BreathingExercise } from './BreathingExercise';
import { BilateralStimulation } from './BilateralStimulation';

export const ChatInterface = () => {
  // State Management
  const [messages, setMessages] = useState([
    { text: "Hi, I'm MannMitra. How are you feeling right now?", sender: "bot", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [uiTheme, setUiTheme] = useState('neutral'); 
  const [isLoading, setIsLoading] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const [showRainPopup, setShowRainPopup] = useState(false);
  const [rainAccepted, setRainAccepted] = useState(false);

  // Audio Reference
  const audioRef = useRef(null);

  // Only show popup when mood changes to concerned and rain is not accepted
  useEffect(() => {
    if (uiTheme === 'concerned' && !rainAccepted) {
      setShowRainPopup(true);
    }
    if (uiTheme !== 'concerned') {
      setShowRainPopup(false);
      if (rainAccepted) setRainAccepted(false);
      // Only reset audio if it was showing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    // If uiTheme is concerned and rainAccepted, do nothing (leave audio alone)
  }, [uiTheme]);

  // Coping Tools Data
  const copingTools = [
    { id: 1, name: "Breathing Exercise", icon: "🌬️" },
    { id: 2, name: "Eye Tracking", icon: "👀" },
    { id: 3, name: "Calming Technique", icon: "🧘" }
  ];


  // Handle Sending Messages
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { 
      text: input, 
      sender: "user", 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://mannmitra-api-nfwj.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: "test_user_123",
          message: userMsg.text
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      const rawReply = data.reply || data.response || "";
      const moodPrefixPattern = /^Mood:\s*([a-zA-Z]+)\s*/i;
      const moodMatch = rawReply.match(moodPrefixPattern);
      const cleanedReply = rawReply.replace(moodPrefixPattern, "");
      const incomingMood = data.mood || moodMatch?.[1]?.toLowerCase() || "neutral";

      setUiTheme((prevTheme) => {
        if (incomingMood === "concerned") return "concerned";
        if (incomingMood === "neutral" && prevTheme === "concerned") return "concerned"; 
        return incomingMood;
      });

      setMessages(prev => [...prev, { 
        text: cleanedReply, 
        sender: "bot", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);

    } catch (error) {
      console.error("Error connecting to backend:", error);
      setMessages(prev => [...prev, { 
        text: "I'm having trouble connecting to my servers right now. Please ensure the backend is running.", 
        sender: "bot", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for rain popup
  const handleRainChoice = (accept) => {
    setShowRainPopup(false);
    setRainAccepted(accept);
    // Only reset audio if user says no
    if (!accept && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className={`flex flex-col h-full min-h-screen transition-colors duration-700 relative overflow-hidden ${uiTheme === 'concerned' ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      {/* Rain Sound Popup */}
      {showRainPopup && !rainAccepted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white text-slate-800 rounded-xl p-6 shadow-lg max-w-xs w-full text-center">
            <h2 className="text-lg font-semibold mb-2">Feeling uneasy?</h2>
            <p className="mb-4">Would you like some soothing rain sounds to help you relax?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => handleRainChoice(true)}
              >
                Yes, play rain
              </button>
              <button
                className="px-4 py-2 bg-slate-300 text-slate-800 rounded hover:bg-slate-400"
                onClick={() => handleRainChoice(false)}
              >
                No, thanks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`p-4 border-b ${uiTheme === 'concerned' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'} shadow-sm relative z-10`}>
        <h1 className="text-xl font-semibold tracking-wide">MannMitra Chat</h1>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] md:max-w-[60%] rounded-2xl p-4 leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : uiTheme === 'concerned' 
                  ? 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700' 
                  : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
            }`}>
              <p>{msg.text}</p>
              <span className={`text-[10px] block mt-2 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'opacity-50'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className={`max-w-[75%] rounded-2xl p-4 rounded-bl-none border animate-pulse ${uiTheme === 'concerned' ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions Bar */}
      <div className="px-4 py-2 relative z-10">
         <div className="mt-3 flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
           {copingTools.map(tool => (
             <button
               key={tool.id}
               onClick={() => { 
                 if (tool.name === "Breathing Exercise") setShowBreathing(true); 
                 if (tool.name === "Eye Tracking") setShowVisual(true);
               }}
               className={`flex-shrink-0 flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                 uiTheme === 'concerned' 
                   ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/50 border border-indigo-700/50' 
                   : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border border-transparent'
               }`}
             >
               <span>{tool.icon}</span>
               <span>{tool.name}</span>
             </button>
           ))}
         </div>
      </div>


      {/* Audio Player - place just above input bar */}
      {uiTheme === 'concerned' && rainAccepted && (
        <div className="w-full flex flex-col items-center px-4 pb-2">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-3 mb-2 shadow">
            <p className="text-xs text-slate-400 mb-2 font-medium tracking-wide text-center">Background Rain Sounds</p>
            <audio
              ref={audioRef}
              src="https://mannmitra-api-nfwj.onrender.com/public/rain.mp3"
              controls
              loop
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={`p-4 border-t relative z-10 ${uiTheme === 'concerned' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center space-x-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Share what's on your mind..."
            className={`flex-1 p-3.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              uiTheme === 'concerned'
                ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Visual Intervention Overlays */}
      {showBreathing && <BreathingExercise onClose={() => setShowBreathing(false)} />}
      {showVisual && <BilateralStimulation onClose={() => setShowVisual(false)} />}

    </div>
  );
};
