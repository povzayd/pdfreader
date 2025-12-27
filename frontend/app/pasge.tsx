🍃, [27 Dec 2025 20:25:33]
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Pause, MessageSquare, BookOpen, Mic } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Summary Data
  const [tips, setTips] = useState<string[]>([]);
  
  // Audio Data
  const [podcastData, setPodcastData] = useState<any[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch summaries on load
    axios.get('http://localhost:8000/summary').then(res => setTips(res.data.tips));
  }, []);

  const handleChat = async () => {
    if (!query) return;
    const newMsgs = [...messages, { role: 'user', text: query }];
    setMessages(newMsgs);
    setQuery('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:8000/chat', { query });
      setMessages([...newMsgs, { role: 'bot', text: res.data.response }]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const generatePodcast = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/podcast?topic=Market Equilibrium');
      setPodcastData(res.data);
      playAudioSequence(res.data, 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const playAudioSequence = (data: any[], index: number) => {
    if (index >= data.length) {
      setIsPlaying(false);
      setCurrentLineIndex(-1);
      return;
    }
    
    setCurrentLineIndex(index);
    setIsPlaying(true);
    
    // Convert Base64 to Blob URL
    const byteCharacters = atob(data[index].audio_base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    setAudioPlayer(audio);
    audio.play();
    
    audio.onended = () => {
      playAudioSequence(data, index + 1);
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-700">EcoStudy AI</h1>
        <div className="text-sm text-gray-500">Assignment for Citrine & Sage</div>
      </header>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: RESOURCES & SUMMARY */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <BookOpen size={18} /> Exam Tips
            </h2>
            <div className="space-y-2">
              {tips.length === 0 ? <p className="text-xs text-gray-400">Loading tips...</p> : 
                tips.map((tip, i) => (
                  <div key={i} className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800 border border-yellow-100">
                    {tip}
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
             <h2 className="font-semibold flex items-center gap-2 mb-3">
<Mic size={18} /> Audio Overview
            </h2>
            <p className="text-xs text-gray-500 mb-4">Generate a 2-person podcast dialogue about this chapter.</p>
            <button 
              onClick={generatePodcast}
              disabled={loading || isPlaying}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg flex justify-center items-center gap-2 transition"
            >
              {isPlaying ? <Pause size={16}/> : <Play size={16}/>}
              {isPlaying ? "Playing..." : "Generate & Play"}
            </button>
            
            {podcastData.length > 0 && (
               <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                 {podcastData.map((line, i) => (
                   <div key={i} className={text-xs p-2 rounded ${i === currentLineIndex ? 'bg-emerald-100 font-bold' : 'bg-gray-50'}}>
                     <span className="uppercase text-emerald-600">{line.speaker}:</span> {line.text}
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: CHAT */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100 font-semibold flex items-center gap-2">
            <MessageSquare size={18} /> Interactive Tutor
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-20">
                <p>Ask a question about the Economics Chapter or Videos.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}}>
                <div className={max-w-[80%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-800'}}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400 p-2">Thinking...</div>}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Ask about supply curves..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChat()}
              />
              <button 
                onClick={handleChat}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}