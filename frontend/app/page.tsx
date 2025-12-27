"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, BookOpen, Mic, Info } from 'lucide-react';

export default function StudyApp() {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);
  // 1. Initialize with an empty array to prevent .map() from failing on first render
  const [examTips, setExamTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Podcast state
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const podcastData = [
    { speaker: "Host", text: "Welcome back! Today we are diving into Oligopolies." },
    { speaker: "Expert", text: "Specifically, why prices remain so 'sticky' in these markets." },
    { speaker: "Host", text: "Is that the Kinked Demand Curve theory?" },
    { speaker: "Expert", text: "Exactly. It's all about how firms react to each other." }
  ];

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await axios.get('http://localhost:8000/summary');
        // 2. Defensive check: Ensure we only set state if the expected field exists
        if (res.data && Array.isArray(res.data.summary)) {
          setExamTips(res.data.summary);
        } else {
          throw new Error("Invalid summary format");
        }
      } catch (err) {
        console.error("Failed to fetch tips:", err);
        setExamTips(["Understand Concentration Ratios", "Review Kinked Demand Curves", "Study Game Theory Payoffs"]);
      }
    };
    fetchTips();

    const interval = setInterval(() => {
      setCurrentLineIndex((prev) => (prev + 1) % podcastData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    if (!query) return;
    setLoading(true);
    const userMessage = { role: 'user', content: query };
    setChatHistory([...chatHistory, userMessage]);
    
    try {
      const res = await axios.post('http://localhost:8000/chat', { message: query });
      setChatHistory(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the brain." }]);
    } finally {
      setQuery('');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Knowledge Feed & Podcast */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-emerald-600 font-bold">
              <Mic size={20} />
              <h2>AI Study Podcast</h2>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 text-white min-h-[200px] flex flex-col justify-between">
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {podcastData.map((line, i) => (
                  <div 
                    key={i} 
                    className={`text-xs p-2 rounded transition-colors duration-500 ${i === currentLineIndex ? 'bg-emerald-500/20 border border-emerald-500/50' : 'opacity-40'}`}
                  >
                    <span className="font-bold uppercase text-emerald-400">{line.speaker}:</span> {line.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
              <BookOpen size={20} />
              <h2>Exam Quick Tips</h2>
            </div>
            <ul className="space-y-3">
              {/* 3. Using Optional Chaining (?.) and Fallback (|| []) for maximum safety */}
              {(examTips || []).map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-600">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Main Chat Interface */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden min-h-[600px]">
          <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
            <h1 className="font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Economics RAG Assistant
            </h1>
            <span className="text-xs text-slate-400">Context: oligopoly chapter AQA.pdf</span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                <Info className="mx-auto mb-2 opacity-20" size={48} />
                <p>Ask me about the Kinked Demand Curve or Price Discrimination!</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-slate-400 text-xs animate-pulse">Assistant is thinking...</div>}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query your economics material..."
              className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
