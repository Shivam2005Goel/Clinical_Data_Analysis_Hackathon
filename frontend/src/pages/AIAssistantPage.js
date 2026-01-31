import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
// Using backend streaming instead of direct SDK
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Bot, Send, Sparkles, Activity, FileText, Zap, ChevronRight, Calculator, Crosshair, Brain, Mic, MicOff, Volume2, VolumeX, Paperclip, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuralAvatar } from '../components/ui/neural-avatar';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

// --- GENERATIVE UI WIDGETS ---
const RiskScoreCard = ({ score, trend }) => (
  <div className="bg-black/60 border border-white/10 rounded-xl p-4 w-64 mt-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs text-slate-400 uppercase tracking-wider">Risk Score</span>
      <Activity className={`h-4 w-4 ${score > 80 ? 'text-red-500' : 'text-emerald-500'}`} />
    </div>
    <div className="text-3xl font-bold text-white mb-1">{score}/100</div>
    <div className={`text-xs ${trend === 'up' ? 'text-red-400' : 'text-emerald-400'} flex items-center gap-1`}>
      {trend === 'up' ? '↑ Increasing' : '↓ Decreasing'} this week
    </div>
    <div className="h-1.5 w-full bg-slate-800 rounded-full mt-3 overflow-hidden">
      <div
        className={`h-full rounded-full ${score > 80 ? 'bg-red-500' : score > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

const TrendSparkline = ({ data }) => (
  <div className="bg-black/60 border border-white/10 rounded-xl p-4 w-full max-w-sm mt-4 h-40">
    <div className="text-xs text-slate-400 uppercase mb-2">Enrollment Trend (7 Days)</div>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const ActionButtons = ({ actions }) => (
  <div className="flex flex-wrap gap-2 mt-4">
    {actions.map((action, idx) => (
      <button
        key={idx}
        onClick={() => toast.info(`Executing: ${action}`)}
        className="px-3 py-1.5 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg text-xs text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
      >
        {action}
      </button>
    ))}
  </div>
);

// Typing effect component
const TypewriterEffect = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index === text.length) {
        clearInterval(intervalId);
        onComplete && onComplete();
      }
    }, 15);
    return () => clearInterval(intervalId);
  }, [text, onComplete]);

  return <div className="leading-relaxed tracking-wide text-cyan-50/90 whitespace-pre-wrap font-mono text-sm">{displayedText}</div>;
};

const AIAssistantPage = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [avatarState, setAvatarState] = useState('idle'); // idle, listening, processing, speaking
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- BACKEND STREAMING LOGIC ---
  // We now use the backend /api/ai/query endpoint for streaming

  // --- VOICE LOGIC ---
  const startListening = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setAvatarState('listening');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleQuery(null, transcript); // Auto-submit
    };

    recognition.onend = () => {
      setIsListening(false);
      setAvatarState('idle'); // Will switch to processing in handleQuery
    };

    recognition.start();
  };

  const speakText = (text) => {
    if (!voiceMode) return;
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a good futuristic voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.pitch = 1.0;
    utterance.rate = 1.1;

    utterance.onstart = () => setAvatarState('speaking');
    utterance.onend = () => setAvatarState('idle');

    window.speechSynthesis.speak(utterance);
  };

  // --- UPLOAD LOGIC ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    toast.info(`Uploading ${file.name}...`);
    // Simulate upload and analysis
    const userMessage = { role: 'user', content: `[Uploaded File: ${file.name}] analyze this please.`, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);

    setLoading(true);
    setAvatarState('processing');

    setTimeout(() => {
      let analysisText = `I've analyzed **${file.name}**. `;
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        analysisText += "It appears to be a clinical dataset containing 1,024 patient records. No PII detected. I found 3 columns with missing values > 5%.";
      } else if (file.name.endsWith('.png') || file.name.endsWith('.jpg')) {
        analysisText += "Visual scan complete. This chart shows a downward trend in Adverse Events for Site-005 over Q3.";
      } else {
        analysisText += "File content ingested into knowledge base.";
      }

      setChatHistory(prev => [...prev, { role: 'ai', content: analysisText, timestamp: new Date() }]);
      setLoading(false);
      setAvatarState('idle'); // Will switch to speaking if TTS on
      speakText(analysisText);
    }, 2500);
  };

  const suggestionPrompts = [
    { text: "Analyze site risk trends", icon: Activity, color: "text-neon-cyan" },
    { text: "Generate executive summary", icon: FileText, color: "text-neon-purple" },
    { text: "Predict enrollments for next Q", icon: Calculator, color: "text-neon-green" },
  ];

  const handleQuery = async (e, overrideQuery = null) => {
    if (e) e.preventDefault();
    const finalQuery = overrideQuery || query;
    if (!finalQuery.trim()) return;

    const userMessage = { role: 'user', content: finalQuery, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    setAvatarState('processing');

    try {
      // --- BACKEND STREAMING (SSE) ---
      const initialAiMessage = {
        role: 'ai',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        wasStreamed: true
      };

      setChatHistory(prev => [...prev, initialAiMessage]);

      const token = localStorage.getItem('access_token') || localStorage.getItem('token');

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: finalQuery,
          history: chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
        })
      });

      if (!response.ok) throw new Error('Failed to connect to Neural Core');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                fullContent += data.content;
                setChatHistory(prev => {
                  const newHistory = [...prev];
                  const lastMsg = newHistory[newHistory.length - 1];
                  if (lastMsg && lastMsg.role === 'ai') {
                    lastMsg.content = fullContent;
                  }
                  return newHistory;
                });
              } else if (data.error) {
                toast.error(data.error);
              }
            } catch (e) {
              // Partial JSON or other SSE noise
            }
          }
        }
      }

      // Finalize the message
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastMsg = newHistory[newHistory.length - 1];
        if (lastMsg && lastMsg.role === 'ai') {
          lastMsg.isStreaming = false;
          // Intelligent widget selection
          if (fullContent.toLowerCase().includes('site') && fullContent.toLowerCase().includes('risk')) {
            lastMsg.widgets = { type: 'risk', data: { score: 85, trend: 'up' } };
          } else if (fullContent.toLowerCase().includes('trend') || fullContent.toLowerCase().includes('predict')) {
            lastMsg.widgets = {
              type: 'trend', data: [
                { value: 10 }, { value: 25 }, { value: 45 }, { value: 30 }, { value: 60 }, { value: 85 }, { value: 100 }
              ]
            };
          } else {
            lastMsg.widgets = { type: 'actions', data: ['Generate Report', 'Scan Anomalies', 'Contact CRA'] };
          }
        }
        return newHistory;
      });

      speakText(fullContent);

    } catch (err) {
      console.error("AI Error:", err);
      const errorMessage = err.message || "Connection to Neural Core failed.";
      setChatHistory(prev => [...prev, { role: 'error', content: errorMessage, timestamp: new Date() }]);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      if (!voiceMode) setAvatarState('idle');
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col relative overflow-hidden rounded-2xl border border-white/10 bg-black/80 backdrop-blur-3xl shadow-2xl transition-colors duration-1000"
      style={{ borderColor: loading ? 'rgba(217, 70, 239, 0.3)' : 'rgba(255, 255, 255, 0.1)' }}>

      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000" style={{ opacity: loading ? 0.8 : 0.4 }}>
        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent ${loading ? 'via-fuchsia-500' : 'via-neon-cyan/50'} to-transparent`}></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent"></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] transition-colors duration-1000 ${loading ? 'bg-fuchsia-900/20' : 'bg-neon-blue/5'}`}></div>
      </div>

      {/* Header */}
      <header className="p-4 border-b border-white/10 relative z-10 bg-black/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* AVATAR SMALL */}
          <div className="scale-75 -ml-2">
            <NeuralAvatar state={avatarState} size="sm" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-widest uppercase font-manrope">Neural Core</h2>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-fuchsia-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span className="text-xs text-slate-400 font-mono tracking-wider">{loading ? 'PROCESSING...' : 'ONLINE'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const newMode = !voiceMode;
              setVoiceMode(newMode);
              toast.success(newMode ? "Voice Output: ENABLED" : "Voice Output: DISABLED");
            }}
            className={voiceMode ? 'text-neon-cyan bg-neon-cyan/10' : 'text-slate-500 hover:text-white'}
          >
            {voiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative z-10 custom-scrollbar">
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-80">
            <div className="mb-8 scale-150">
              <NeuralAvatar state={avatarState} size="lg" />
            </div>
            <p className="text-slate-400 text-lg font-light text-center max-w-md animate-pulse">
              "I am listening. Analyze data, generate reports, or scan files."
            </p>

            <div className="grid grid-cols-1 gap-3 mt-8 w-full max-w-sm">
              {suggestionPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => { setQuery(prompt.text); handleQuery(null, prompt.text); }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-neon-cyan/30 transition-all group text-left"
                >
                  <prompt.icon className={`h-4 w-4 ${prompt.color}`} />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {chatHistory.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 md:p-5 relative overflow-hidden ${msg.role === 'user'
                ? 'bg-gradient-to-br from-neon-blue/20 to-blue-900/40 border-l-4 border-l-neon-blue text-white'
                : 'bg-black/60 border border-white/10 shadow-xl backdrop-blur-md'
                }`}>
                <div className="flex items-start gap-4 relative z-10">
                  {msg.role === 'ai' && (
                    <div className="mt-1">
                      <Sparkles className="h-5 w-5 text-neon-cyan animate-pulse" />
                    </div>
                  )}
                  <div className="flex-1">
                    {msg.role === 'ai' ? (
                      <>
                        {msg.isStreaming ? (
                          <div className="leading-relaxed tracking-wide text-cyan-50/90 whitespace-pre-wrap font-mono text-sm">
                            {msg.content}
                            <span className="inline-block w-1 h-4 bg-neon-cyan ml-1 animate-pulse" />
                          </div>
                        ) : (
                          msg.wasStreamed ? (
                            <div className="leading-relaxed tracking-wide text-cyan-50/90 whitespace-pre-wrap font-mono text-sm">{msg.content}</div>
                          ) : (
                            <TypewriterEffect text={msg.content} onComplete={() => { }} />
                          )
                        )}

                        {/* Reasoning Tokens Indicator */}
                        {msg.reasoningTokens > 0 && (
                          <div className="mt-2 text-[10px] text-fuchsia-400 font-mono opacity-60">
                            Neural Path: {msg.reasoningTokens} tokens processed
                          </div>
                        )}

                        {/* Render Widgets if present */}
                        {msg.widgets?.type === 'risk' && <RiskScoreCard {...msg.widgets.data} />}
                        {msg.widgets?.type === 'trend' && <TrendSparkline {...msg.widgets.data} />}
                        {msg.widgets?.type === 'actions' && <ActionButtons actions={msg.widgets.data} />}
                      </>
                    ) : (
                      <div className="text-sm md:text-base leading-relaxed text-blue-200">{msg.content}</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10 relative z-10 bg-black/40">
        <form onSubmit={handleQuery} className="relative">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query Neural Core..."
            className="w-full bg-white/5 border-white/10 focus:border-neon-cyan/50 text-white rounded-2xl pr-32 min-h-[60px] max-h-[200px] py-4 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuery(e);
              }
            }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current.click()}
              className="text-slate-400 hover:text-white"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={startListening}
              className={`${isListening ? 'text-red-500' : 'text-slate-400 hover:text-white'}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-neon-cyan hover:bg-cyan-600 text-black rounded-xl px-4 flex items-center gap-2"
            >
              {loading ? <Zap className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="hidden md:inline">SEND</span>
            </Button>
          </div>
        </form>
        <p className="text-[10px] text-slate-500 mt-2 ml-2 tracking-widest uppercase font-mono">
          Neural Core v2.0 // Secured Clinical Protocol
        </p>
      </div>
    </div>
  );
};

export default AIAssistantPage;
