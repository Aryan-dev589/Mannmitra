import React, { useState, useEffect, useRef } from 'react';

export const SimulationChat = ({ scenario, details, onExit }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(true); // Tracks if we are still roleplaying
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    setMessages([
      { 
        text: `Simulation initialized. Persona adopted based on your parameters.`, 
        sender: 'system' 
      },
      { 
        text: "Well? You said you needed to talk to me. What is it?", 
        sender: 'bot' 
      }
    ]);
  }, [scenario]);

  const handleSend = async () => {
    if (!input.trim() || !isSimulationActive) return;

    const userText = input;
    const userMsg = { text: userText, sender: "user" };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://mannmitra-api-nfwj.onrender.com/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "aryan", 
          message: userText,
          history: messages, 
          scenario: scenario,
          details: details,
          is_debrief: false 
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { text: data.response, sender: "bot" }]);
      }
    } catch (error) {
      console.error("Simulation API Error:", error);
      setMessages(prev => [...prev, { text: "System Error: Could not connect to the simulation engine.", sender: "system" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: THE DEBRIEF LOGIC ---
  const handleDebrief = async () => {
    setIsSimulationActive(false); // Lock the chat
    setIsLoading(true);
    setMessages(prev => [...prev, { text: "SIMULATION ENDED. Processing your performance...", sender: "system" }]);

    try {
      const response = await fetch('https://mannmitra-api-nfwj.onrender.com/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "aryan",
          message: "User triggered the end of the simulation.",
          history: messages, // Sending the full script we just generated!
          scenario: scenario,
          details: details,
          is_debrief: true // Flipping the flag!
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.response) {
        // Render MannMitra's feedback in a distinct friendly color (Indigo)
        setMessages(prev => [...prev, { text: data.response, sender: "mannmitra" }]);
      }
    } catch (error) {
      console.error("Debrief API Error:", error);
      setMessages(prev => [...prev, { text: "System Error: Failed to generate debrief.", sender: "system" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full bg-slate-900 relative">
      
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-28">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
            
            {msg.sender === 'system' ? (
              <div className="bg-amber-900/30 border border-amber-500/30 text-amber-400/90 text-xs px-4 py-2 rounded-full uppercase tracking-wider font-semibold my-2 text-center max-w-[80%]">
                {msg.text}
              </div>
            ) : msg.sender === 'mannmitra' ? (
              // NEW: MannMitra's Feedback styling (Friendly Indigo)
              <div className="max-w-[85%] bg-indigo-600/20 border border-indigo-500/40 text-indigo-100 rounded-2xl rounded-tl-none p-5 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <div className="flex items-center gap-2 mb-2 border-b border-indigo-500/30 pb-2">
                   <span className="text-xl">✨</span>
                   <span className="font-bold text-indigo-300">MannMitra Feedback</span>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</div>
              </div>
            ) : (
              // Standard Roleplay Bubbles
              <div className={`max-w-[80%] rounded-2xl p-4 leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.05)]'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            )}

          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[75%] bg-slate-800 border border-amber-500/30 text-slate-400 rounded-2xl rounded-bl-none p-4 animate-pulse">
              Analyzing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area & Debrief Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800">
        
        {/* NEW: End Simulation Button */}
        {isSimulationActive && messages.length > 2 && (
          <div className="flex justify-center mb-3">
             <button
               onClick={handleDebrief}
               disabled={isLoading}
               className="text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-5 py-2 rounded-full transition-colors font-semibold border border-indigo-500/30 flex items-center gap-2 tracking-wide"
             >
                <span>📝</span> End Simulation & Get Feedback
             </button>
          </div>
        )}

        <div className="flex items-center space-x-3 max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={!isSimulationActive}
            placeholder={isSimulationActive ? "Type your response to the persona..." : "Simulation ended. Read your feedback above."}
            className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-full p-3.5 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors disabled:opacity-50"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !isSimulationActive}
            className="p-3.5 rounded-full bg-amber-600/20 text-amber-500 border border-amber-500/50 hover:bg-amber-600/40 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};