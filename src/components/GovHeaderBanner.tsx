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
import IndiaFlag from './IndiaFlag';

export default function GovHeaderBanner() {
  const navigate = useNavigate();
  const { quickLogin } = useAuth();
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
      <div className="bg-[#020712]/95 border-b border-white/[0.08] px-3 sm:px-6 h-8 flex items-center justify-between gap-3 text-white/80 text-[11px] backdrop-blur-md">
        {/* Left: Indian Gov & Ministry Badging */}
        <div className="flex items-center gap-2.5 truncate">
          <div className="flex items-center gap-2 font-medium text-white shrink-0">
            <IndiaFlag className="w-4 h-2.5" />
            <span className="font-semibold text-white/95">भारत सरकार</span>
            <span className="text-white/30">•</span>
            <span className="text-white/70 hidden sm:inline">Government of India</span>
          </div>

          <span className="text-white/20 hidden md:inline">|</span>

          <div className="hidden md:flex items-center gap-1.5 text-cyan-300/80 font-mono text-[10.5px]">
            <span className="px-1.5 py-0.2 rounded bg-red-500/15 border border-red-500/30 text-red-300 font-bold">DISASTER MANAGEMENT</span>
            <span className="text-white/30">•</span>
            <span className="text-amber-300">MoES &amp; INCOIS</span>
            <span className="text-white/30">•</span>
            <span>IMD</span>
            <span className="text-white/30">•</span>
            <span className="text-emerald-400">NDMA</span>
          </div>
        </div>

        {/* Right: Hackathon Finalist & Fast-Track Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0 font-mono text-[10.5px]" ref={dropdownRef}>
          {/* Sovereign Security Node Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold tracking-wider">NIC-NODE SECURE</span>
          </div>

          {/* SIH Finalist Badge */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 font-semibold text-[10px]">
            <Award className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">SIH 2026 FINALIST</span>
            <span className="sm:hidden">SIH 2026</span>
          </div>

          {/* Interactive Fast-Track Evaluator Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowJuryDropdown(prev => !prev)}
              className="btn-3d flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 font-semibold cursor-pointer transition-all shadow-sm"
              title="Click to open SIH Evaluator Fast-Track Menu"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>⚡ Fast-Track</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showJuryDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Floating Luxury Evaluator Dropdown Menu */}
            {showJuryDropdown && (
              <div className="absolute top-full right-0 mt-2 w-72 rounded-2xl bg-[#031326]/95 border border-cyan-500/30 shadow-2xl p-3 space-y-2 backdrop-blur-2xl z-50 fade-in-up">
                <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      DISASTER MANAGEMENT (MoES)
                    </p>
                    <p className="text-[9.5px] text-white/50">SIH-2026 Problem Statement: SIH-1642</p>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
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
                    className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-white group-hover:text-cyan-300">Public Digital Twin</p>
                        <p className="text-[9.5px] text-white/50">Citizen Tier · /dashboard</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-cyan-400" />
                  </button>

                  <button
                    onClick={() => {
                      quickLogin('government');
                      navigate('/gov');
                      setShowJuryDropdown(false);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-white group-hover:text-amber-300">NDMA Gov Command</p>
                        <p className="text-[9.5px] text-white/50">Restricted Officer Tier · /gov</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-amber-400" />
                  </button>

                  <button
                    onClick={() => {
                      quickLogin('researcher');
                      navigate('/docs');
                      setShowJuryDropdown(false);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-white group-hover:text-purple-300">Architecture Docs</p>
                        <p className="text-[9.5px] text-white/50">Research Scientist Tier · /docs</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-purple-400" />
                  </button>

                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-xai-chat'));
                      setShowJuryDropdown(false);
                    }}
                    className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-blue-500/15 border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-white group-hover:text-blue-300">Ask X AI Copilot</p>
                        <p className="text-[9.5px] text-white/50">Floating AI Marine Assistant</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-blue-400" />
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
