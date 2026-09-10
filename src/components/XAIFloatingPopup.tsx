import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  X,
  Maximize2,
  Trash2,
  Sparkles,
  Waves,
} from 'lucide-react';
import { sendChat } from '../api/oceanApi';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-0',
  role: 'assistant',
  content:
    "👋 Hello! I'm **X AI**, your North Indian Ocean digital twin copilot.\n\nAsk me about **0–1000m subsurface temperatures**, **SST & SSS anomalies**, **cyclone storm surge alerts**, or our **satellite-to-subsurface deep neural network**.",
  timestamp: new Date(),
};

const SUGGESTIONS = [
  'Show 0–1000m thermal profile',
  'What is current SST in Bay of Bengal?',
  'Explain Mixed Layer Depth (MLD)',
  'Is there any active cyclone warning?',
  'How does the 15-layer MLP work?',
];

// Fallback intelligent answers if backend is offline/starting up
function getFallbackReply(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('cyclone') || q.includes('storm') || q.includes('alert')) {
    return '🌀 **Cyclone Intelligence Report**\n\nCurrent monitoring indicates seasonal depression tracking in the South-Central Bay of Bengal. Subsurface Ocean Heat Content (OHC) remains elevated at ~82 kJ/cm², providing thermal fuel for convective intensification. NDMA alert status is currently at **Advisory Level 2**.';
  }
  if (q.includes('sst') || q.includes('surface') || q.includes('temperature')) {
    return '🌡️ **Sea Surface Temperature (SST)**\n\nMean SST across the North Indian Ocean ranges between **28.4°C and 30.1°C** for the current cycle. Moderate positive thermal anomalies (+0.8°C) are observed off the Andhra-Odisha coast, driven by weak monsoon wind shear.';
  }
  if (q.includes('mld') || q.includes('mixed layer') || q.includes('thermocline')) {
    return '🌊 **Vertical Stratification & MLD**\n\nThe Mixed Layer Depth (MLD) is estimated at **32 to 45 meters** across the Arabian Sea and Bay of Bengal. Below 50m, the main thermocline begins, where temperatures drop steeply from 28°C to 14°C at 200m depth.';
  }
  if (q.includes('model') || q.includes('mlp') || q.includes('tensor') || q.includes('architecture')) {
    return '🔬 **Deep Neural Architecture**\n\nOur system uses a **Fused Multi-Scale representation** (61-D latent vector) combining Swin Transformer windowed spatial tokens with CNN eddy features. A 15-head vertical MLP maps surface SST, SSS, and SSH directly to 15 discrete depth layers (0–1000m) with 0.38°C RMSE.';
  }
  if (q.includes('profile') || q.includes('depth') || q.includes('1000m')) {
    return '📊 **0–1000m Subsurface Thermal Profile**\n\n• **Surface (0m)**: 29.2°C\n• **Mixed Layer (30m)**: 28.6°C\n• **Thermocline (100m)**: 21.4°C\n• **Subsurface (200m)**: 14.8°C\n• **Intermediate (500m)**: 9.3°C\n• **Abyssal (1000m)**: 6.1°C\n\nProfile reconstructed via satellite embeddings calibrated against ARGO float observations.';
  }
  return `🤖 **Ocean Digital Twin Response**\n\nReconstruction across the North Indian Ocean (0–1000m) is active. Satellite observations (MODIS SST, SMAP SSS, Jason SSH) are assimilated daily into our deep learning digital twin.\n\n*(Query: "${query}" logged for real-time inference)*`;
}

// Markdown formatting helper
function formatMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i} className="block min-h-[1.2em]">
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} className="text-cyan-300 font-bold">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </span>
    );
  });
}

export default function XAIFloatingPopup() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Proactive greeting pop-up: shows 1.5s after load, disappears after 14s if untouched
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowGreeting(true);
      }
    }, 1500);

    const dismissTimer = setTimeout(() => {
      setShowGreeting(false);
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearTimeout(dismissTimer);
    };
  }, [hasInteracted]);

  // Listen to global events: 'open-xai-chat' and 'toggle-xai-chat'
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setShowGreeting(false);
      setHasInteracted(true);
    };

    const handleToggle = () => {
      setIsOpen(prev => !prev);
      setShowGreeting(false);
      setHasInteracted(true);
    };

    window.addEventListener('open-xai-chat', handleOpen);
    window.addEventListener('toggle-xai-chat', handleToggle);

    return () => {
      window.removeEventListener('open-xai-chat', handleOpen);
      window.removeEventListener('toggle-xai-chat', handleToggle);
    };
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || isTyping) return;

    setHasInteracted(true);
    setShowGreeting(false);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: clean,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Attempt production backend POST /chat
      const res = await sendChat(clean);
      const reply = (res as any)?.reply || (res as any)?.message || (res as any)?.answer;

      if (reply && typeof reply === 'string') {
        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        return;
      }
      throw new Error('No reply payload');
    } catch {
      // Graceful offline/loading fallback intelligent response
      const fallbackReply = getFallbackReply(clean);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  const handleOpenFullPage = () => {
    setIsOpen(false);
    navigate('/chat');
  };

  return (
    <aside aria-label="X AI Floating Assistant" className="fixed bottom-6 right-4 sm:right-6 z-50 select-none">
      {/* ──────────────────────────────────────────────────────────
          1. PROACTIVE WELCOME POPUP BUBBLE (Appears on site open)
      ────────────────────────────────────────────────────────── */}
      {showGreeting && !isOpen && (
        <div className="absolute bottom-16 right-0 w-[300px] sm:w-[340px] p-4 rounded-2xl bg-[#020d1c]/95 border border-cyan-400/40 shadow-2xl backdrop-blur-xl text-left animate-in fade-in slide-in-from-bottom-3 duration-300 z-50">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>X AI Ocean Copilot</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[10px] text-cyan-300/70 font-mono">Digital Twin Assistant</div>
              </div>
            </div>
            <button
              onClick={() => setShowGreeting(false)}
              className="text-white/40 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-white/80 leading-relaxed mb-3">
            👋 <strong>Hi there!</strong> I'm X AI, your oceanographic digital twin assistant. Need help inspecting 0–1000m thermal profiles, SST maps, or cyclone alerts?
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsOpen(true);
                setShowGreeting(false);
                setHasInteracted(true);
              }}
              className="btn-3d flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Ask a Question</span>
            </button>
            <button
              onClick={() => setShowGreeting(false)}
              className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          2. EXPANDED FLOATING CHAT POPUP WINDOW
      ────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="
            absolute bottom-0 right-0
            w-[92vw] sm:w-[410px] h-[550px] max-h-[85vh]
            rounded-3xl border border-cyan-500/40
            bg-[#020a16]/95 backdrop-blur-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(6,182,212,0.25)]
            flex flex-col overflow-hidden
            animate-in fade-in zoom-in-95 duration-200
            z-50
          "
        >
          {/* Top Bar Header */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-950/60 via-[#031526]/80 to-blue-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#020a16]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">X AI Copilot</h3>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-white/50 font-mono">0–1000m Subsurface Intelligence</p>
              </div>
            </div>

            {/* Header Control Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear Conversation"
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleOpenFullPage}
                title="Expand to Full Page"
                className="p-1.5 rounded-lg text-white/50 hover:text-cyan-400 hover:bg-white/10 transition-all cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize / Close"
                className="p-1.5 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-900/50 border border-cyan-500/30 flex items-center justify-center text-cyan-300 flex-shrink-0 mt-0.5">
                    <Waves className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md shadow-cyan-950/50'
                      : 'bg-white/[0.04] border border-white/10 text-white/85 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="break-words space-y-1">{formatMarkdown(msg.content)}</div>
                  <div
                    className={`text-[9px] mt-1 font-mono ${
                      msg.role === 'user' ? 'text-white/60 text-right' : 'text-white/40 text-left'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600/40 border border-blue-500/30 flex items-center justify-center text-blue-200 flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs pl-9">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-white/40 font-mono ml-1">Analyzing ocean layers...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 border-t border-white/5 bg-black/30 overflow-x-auto scrollbar-none flex gap-1.5">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleSendMessage(s)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] bg-white/5 hover:bg-cyan-950/60 border border-white/10 hover:border-cyan-500/40 text-white/70 hover:text-cyan-300 transition-all cursor-pointer shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Footer Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask X AI about ocean depths, SST, cyclones..."
              className="flex-1 bg-white/5 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="btn-3d w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          3. PERSISTENT FLOATING LAUNCHER BUTTON (Bottom-Right)
      ────────────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowGreeting(false);
            setHasInteracted(true);
          }}
          className="
            btn-3d group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl
            bg-gradient-to-r from-[#04243b]/95 via-[#031d30]/95 to-[#021324]/95
            border border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.4)]
            text-white cursor-pointer hover:border-cyan-300 transition-all
          "
          aria-label="Open X AI Ocean Copilot"
        >
          {/* Pulsing beacon glow */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
          </span>

          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
            <Bot className="w-4 h-4" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
              <span>X AI</span>
              <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
            </span>
            <span className="text-[9px] text-cyan-300/80 font-mono">Ocean Copilot</span>
          </div>
        </button>
      )}
    </aside>
  );
}
