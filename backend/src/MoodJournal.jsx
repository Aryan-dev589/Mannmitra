import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, Calendar as CalendarIcon, BookOpen } from 'lucide-react';

const MOODS = [
  { id: 'terrible', emoji: '😭', label: 'Terrible', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { id: 'bad', emoji: '🙁', label: 'Bad', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { id: 'good', emoji: '🙂', label: 'Good', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'great', emoji: '🤩', label: 'Great', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
];

export const MoodJournal = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Mock data until we hook up the backend
  const [insight, setInsight] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savedEntries, setSavedEntries] = useState([]);

  const handleSave = async () => {
    if (!selectedMood) return;
    setIsSaving(true);
    
    // Create the local entry object
    const newEntry = {
      date: new Date().toLocaleDateString(),
      mood: selectedMood,
      text: journalText
    };

    try {
      // 1. Send it to FastAPI to store in Pinecone permanently
      await fetch('https://mannmitra-api-nfwj.onrender.com/api/journal/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "aryan-dev589", // Using your dev ID
          mood: newEntry.mood,
          text: newEntry.text,
          date: newEntry.date
        })
      });

      // 2. Save it to React state so the "Generate Summary" button has immediate context
      setSavedEntries([...savedEntries, newEntry]); 
      
      // 3. Clear the form
      setJournalText('');
      setSelectedMood(null);
      alert("Journal entry saved permanently to MannMitra's AI memory!");
      
    } catch (error) {
      console.error("Save API Error:", error);
      alert("Failed to save. Is your FastAPI server running?");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateInsights = async () => {
    setIsAnalyzing(true);
    
    // In a real app, you would fetch these from your database.
    // For now, we will send some realistic mock history to the AI to analyze!
    

    try {
      const response = await fetch('https://mannmitra-api-nfwj.onrender.com/api/journal/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "aryan",
          recent_entries: savedEntries
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.insight) {
        setInsight(data.insight);
      }
    } catch (error) {
      console.error("Insights API Error:", error);
      setInsight("System Error: Could not connect to the MannMitra analytical engine. Is your backend running?");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto w-full animate-fade-in overflow-y-auto">
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <BookOpen className="text-indigo-400" />
          Mood Journal
        </h2>
        <p className="text-slate-400">Track your emotional state and let AI find patterns in your well-being.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Logging Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Mood Selector */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <CalendarIcon size={18} className="text-slate-400" />
              How are you feeling today?
            </h3>
            
            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
                    selectedMood === mood.id 
                      ? `${mood.color} ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500 scale-105` 
                      : 'bg-slate-900/50 border-slate-700 hover:bg-slate-700/50 text-slate-400'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl mb-1 sm:mb-2">{mood.emoji}</span>
                  <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Journal Entry Area */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-lg flex flex-col flex-1">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">
              What's on your mind?
            </h3>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Write whatever you're feeling right now. This is a safe, private space..."
              className="w-full flex-1 min-h-[200px] bg-slate-900/80 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={!selectedMood || isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: AI Insights */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-b from-indigo-900/20 to-slate-800/50 rounded-2xl p-6 border border-indigo-500/20 shadow-lg h-full flex flex-col relative overflow-hidden">
            
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="text-indigo-400" />
              AI Insights
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              MannMitra can securely analyze your past journal entries to identify emotional triggers and positive patterns.
            </p>

            {insight ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 border border-indigo-500/30 rounded-xl p-5 text-sm text-indigo-100 leading-relaxed shadow-inner"
              >
                {insight}
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-700 rounded-xl">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <p className="text-slate-500 text-sm mb-4">
                  Unlock patterns in your mental well-being over time.
                </p>
                <button 
                  onClick={handleGenerateInsights}
                  disabled={isAnalyzing}
                  className="w-full px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 rounded-lg font-medium transition-colors text-sm"
                >
                  {isAnalyzing ? 'Analyzing patterns...' : 'Generate Weekly Summary'}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};