import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Award,
  ChevronDown,
  Sparkles,
  FileText,
  LayoutDashboard,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import IndiaFlag from './IndiaFlag';

export default function GovHeaderBanner() {
  const navigate = useNavigate();
  const { quickLogin } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [showJuryDropdown, setShowJuryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowJuryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside aria-label="Official Government Header" className="w-full relative z-[60] select-none text-xs">
      {/* ──────────────────────────────────────────────────────────
          1. ELEGANT NATIONAL TRICOLOR TOP RIBBON (2.5px)
      ────────────────────────────────────────────────────────── */}
      <div className="h-[2.5px] w-full flex">
        <div className="h-full w-1/3 bg-[#FF9933]" />
        <div className="h-full w-1/3 bg-[#FFFFFF]" />
        <div className="h-full w-1/3 bg-[#138808]" />
      </div>

      {/* ──────────────────────────────────────────────────────────
          2. SLEEK SINGLE-LINE SOVEREIGN BANNER (30px height)
      ────────────────────────────────────────────────────────── */}
      <div className={`gov-header-bar px-3 sm:px-6 h-8 flex items-center justify-between gap-3 text-[11px] transition-colors duration-200 ${
        isLight
          ? 'bg-white/82 border-b border-cyan-500/20 text-[#475569] backdrop-blur-[18px] shadow-[0_2px_12px_rgba(14,116,144,0.08)]'
          : 'bg-[#020712]/95 border-b border-white/[0.08] text-white/80 backdrop-blur-md'
      }`}>
        {/* Left: Indian Gov & Ministry Badging */}
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex items-center gap-2 font-medium shrink-0">
            <IndiaFlag className="w-4 h-2.5" />
            <span className={`font-semibold ${isLight ? 'text-[#0F172A]' : 'text-white/95'}`}>
              भारत सरकार
            </span>
            <span className={isLight ? 'text-slate-400' : 'text-white/30'}>•</span>
            <span className={`${isLight ? 'text-[#475569]' : 'text-white/70'} hidden sm:inline`}>
              Government of India
            </span>
          </div>

          <span className={`${isLight ? 'text-slate-300' : 'text-white/20'} hidden md:inline`}>|</span>

          <div className="hidden md:flex items-center gap-1.5 font-mono text-[10.5px]">
            <span className={`px-1.5 py-0.5 rounded font-bold transition-colors ${
              isLight
                ? 'bg-white/85 border border-red-400/40 text-red-600 shadow-xs'
                : 'bg-red-500/15 border border-red-500/30 text-red-300'
            }`}>
              DISASTER MANAGEMENT
            </span>
            <span className={isLight ? 'text-slate-400' : 'text-white/30'}>•</span>
            <span className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
              isLight
                ? 'bg-white/85 border border-cyan-500/35 text-amber-700 shadow-xs'
                : 'text-amber-300'
            }`}>
              MoES &amp; INCOIS
            </span>
            <span className={isLight ? 'text-slate-400' : 'text-white/30'}>•</span>
            <span className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
              isLight
                ? 'bg-white/85 border border-cyan-500/35 text-sky-700 shadow-xs'
                : 'text-cyan-300/80'
            }`}>
              IMD
            </span>
            <span className={isLight ? 'text-slate-400' : 'text-white/30'}>•</span>
            <span className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
              isLight
                ? 'bg-white/85 border border-emerald-500/35 text-emerald-700 shadow-xs'
                : 'text-emerald-400'
            }`}>
              NDMA
            </span>
          </div>
        </div>

        {/* Right: Fast-Track Menu Trigger & Sovereign Security Node */}
        <div className="flex items-center gap-2 shrink-0 font-mono text-[10.5px]" ref={dropdownRef}>
          {/* Sovereign Security Node Indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-colors ${
            isLight
              ? 'bg-white/85 border border-cyan-500/35 text-emerald-700 shadow-xs'
              : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-wider">NIC-NODE SECURE</span>
          </div>

          {/* Interactive Fast-Track Evaluator Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowJuryDropdown(prev => !prev)}
              className={`btn-3d flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold cursor-pointer transition-all ${
                isLight
                  ? 'bg-white/85 hover:bg-white border border-cyan-500/40 hover:border-cyan-500/70 text-[#0F172A] hover:text-cyan-700 shadow-xs hover:shadow-sm'
                  : 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 shadow-sm'
              }`}
              title="Click to open Fast-Track Menu"
            >
              <Sparkles className={`w-3 h-3 ${isLight ? 'text-cyan-600' : 'text-cyan-400'}`} />
              <span>⚡ Fast-Track</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                isLight ? 'text-[#475569]' : 'text-white/60'
              } ${showJuryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Floating Luxury Evaluator Dropdown Menu */}
            {showJuryDropdown && (
              <div className={`absolute top-full right-0 mt-2 w-72 rounded-2xl p-3 space-y-2 z-50 fade-in-up ${
                isLight
                  ? 'bg-white/95 border border-cyan-500/30 shadow-[0_12px_40px_rgba(14,116,144,0.18)] backdrop-blur-2xl'
                  : 'bg-[#031326]/95 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl'
              }`}>
                <div className={`pb-2 border-b flex items-center justify-between ${
                  isLight ? 'border-slate-200' : 'border-white/10'
                }`}>
                  <div>
                    <p className={`text-[11px] font-bold flex items-center gap-1.5 ${
                      isLight ? 'text-[#0F172A]' : 'text-white'
                    }`}>
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      DISASTER MANAGEMENT (MoES)
                    </p>
                    <p className={`text-[9.5px] ${isLight ? 'text-[#64748B]' : 'text-white/50'}`}>
                      SIH-2026 Problem Statement: SIH-1642
                    </p>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isLight
                      ? 'bg-cyan-50 border border-cyan-400/40 text-cyan-700 font-semibold'
                      : 'bg-cyan-950 border border-cyan-500/30 text-cyan-300'
                  }`}>
                    INCOIS
                  </span>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      quickLogin('general');
                      navigate('/dashboard');
                      setShowJuryDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                      isLight
                        ? 'bg-slate-50/80 hover:bg-cyan-50/90 border border-slate-200/80 hover:border-cyan-400/40'
                        : 'bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isLight ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        <LayoutDashboard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className={`text-[11px] font-semibold ${
                          isLight ? 'text-[#0F172A] group-hover:text-cyan-700' : 'text-white group-hover:text-cyan-300'
                        }`}>Public Digital Twin</p>
                        <p className={`text-[9.5px] ${isLight ? 'text-[#64748B]' : 'text-white/50'}`}>Citizen Tier · /dashboard</p>
                      </div>
                    </div>
                    <ExternalLink className={`w-3 h-3 ${
                      isLight ? 'text-slate-400 group-hover:text-cyan-600' : 'text-white/30 group-hover:text-cyan-400'
                    }`} />
                  </button>

                  <button
                    onClick={() => {
                      quickLogin('government');
                      navigate('/gov');
                      setShowJuryDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                      isLight
                        ? 'bg-slate-50/80 hover:bg-amber-50/90 border border-slate-200/80 hover:border-amber-400/40'
                        : 'bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className={`text-[11px] font-semibold ${
                          isLight ? 'text-[#0F172A] group-hover:text-amber-700' : 'text-white group-hover:text-amber-300'
                        }`}>NDMA Gov Command</p>
                        <p className={`text-[9.5px] ${isLight ? 'text-[#64748B]' : 'text-white/50'}`}>Restricted Officer Tier · /gov</p>
                      </div>
                    </div>
                    <ExternalLink className={`w-3 h-3 ${
                      isLight ? 'text-slate-400 group-hover:text-amber-600' : 'text-white/30 group-hover:text-amber-400'
                    }`} />
                  </button>

                  <button
                    onClick={() => {
                      quickLogin('researcher');
                      navigate('/docs');
                      setShowJuryDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                      isLight
                        ? 'bg-slate-50/80 hover:bg-purple-50/90 border border-slate-200/80 hover:border-purple-400/40'
                        : 'bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className={`text-[11px] font-semibold ${
                          isLight ? 'text-[#0F172A] group-hover:text-purple-700' : 'text-white group-hover:text-purple-300'
                        }`}>Architecture Docs</p>
                        <p className={`text-[9.5px] ${isLight ? 'text-[#64748B]' : 'text-white/50'}`}>Research Scientist Tier · /docs</p>
                      </div>
                    </div>
                    <ExternalLink className={`w-3 h-3 ${
                      isLight ? 'text-slate-400 group-hover:text-purple-600' : 'text-white/30 group-hover:text-purple-400'
                    }`} />
                  </button>

                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-xai-chat'));
                      setShowJuryDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                      isLight
                        ? 'bg-slate-50/80 hover:bg-blue-50/90 border border-slate-200/80 hover:border-blue-400/40'
                        : 'bg-white/5 hover:bg-blue-500/15 border border-white/10 hover:border-blue-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className={`text-[11px] font-semibold ${
                          isLight ? 'text-[#0F172A] group-hover:text-blue-700' : 'text-white group-hover:text-blue-300'
                        }`}>Ask X AI Copilot</p>
                        <p className={`text-[9.5px] ${isLight ? 'text-[#64748B]' : 'text-white/50'}`}>Floating AI Marine Assistant</p>
                      </div>
                    </div>
                    <ExternalLink className={`w-3 h-3 ${
                      isLight ? 'text-slate-400 group-hover:text-blue-600' : 'text-white/30 group-hover:text-blue-400'
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
