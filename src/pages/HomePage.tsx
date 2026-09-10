import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Waves,
  MessageSquare,
  LayoutDashboard,
  Wind,
  BarChart2,
  ArrowRight,
  Layers,
  Database,
  Calendar,
  GitCompare,
  Zap,
  Eye,
  Cpu,
  Compass,
  CheckCircle2,
  Satellite,
} from 'lucide-react';
import { motion } from 'framer-motion';

import Navbar from '../components/Navbar';
import SatelliteReconstructionSimulation from '../components/SatelliteReconstructionSimulation';
import MonsoonFlowSimulation from '../components/MonsoonFlowSimulation';
import NeuralSubsurfaceLab from '../components/NeuralSubsurfaceLab';
import IndiaFlag from '../components/IndiaFlag';

/* ============================================================
   UNDERWATER FISH SPRITE
============================================================ */

function FishSprite({
  top,
  left,
  scale,
  duration,
  delay,
  direction = 1,
}: {
  top: string;
  left: string;
  scale: number;
  duration: number;
  delay: number;
  direction?: number;
}) {
  return (
    <div
      className="absolute pointer-events-none fish-swim"
      style={{
        top,
        left,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        transform: `scale(${scale * direction}, ${scale})`,
      }}
    >
      <svg width="90" height="42" viewBox="0 0 90 42" fill="none">
        <path
          d="M14 21C25 8 43 5 58 12C65 15 70 19 75 21C70 23 65 27 58 30C43 37 25 34 14 21Z"
          fill="rgba(121,210,225,0.22)"
        />
        <path d="M14 21L2 10L6 21L2 32L14 21Z" fill="rgba(89,190,211,0.20)" />
        <path
          d="M38 11C40 4 47 3 51 11"
          stroke="rgba(180,235,240,0.22)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="61" cy="18" r="2" fill="rgba(220,250,255,0.55)" />
      </svg>
    </div>
  );
}

function FishSchool() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <FishSprite top="20%" left="-12%" scale={0.75} duration={26} delay={0} />
      <FishSprite top="45%" left="-16%" scale={0.5} duration={32} delay={-9} />
      <FishSprite top="70%" left="-10%" scale={0.65} duration={29} delay={-15} />
    </div>
  );
}

function Bubbles() {
  const bubbles = [
    { left: '10%', size: 4, duration: 13, delay: 0 },
    { left: '25%', size: 6, duration: 16, delay: -5 },
    { left: '45%', size: 3, duration: 11, delay: -2 },
    { left: '65%', size: 7, duration: 17, delay: -8 },
    { left: '85%', size: 4, duration: 14, delay: -11 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="water-bubble"
          style={{
            left: b.left,
            width: `${b.size}px`,
            height: `${b.size}px`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function LightRays() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="water-ray ray-one" />
      <div className="water-ray ray-two" />
      <div className="water-ray ray-three" />
    </div>
  );
}

function WaterBackground() {
  return (
    <>
      <style>{`
        @keyframes waterDrift {
          0% { transform: translate3d(-3%, 0, 0) scale(1.05); }
          50% { transform: translate3d(3%, 2%, 0) scale(1.10); }
          100% { transform: translate3d(-3%, 0, 0) scale(1.05); }
        }
        @keyframes causticMove {
          0% { transform: translate3d(-4%, -2%, 0) rotate(-2deg); }
          50% { transform: translate3d(4%, 3%, 0) rotate(2deg); }
          100% { transform: translate3d(-4%, -2%, 0) rotate(-2deg); }
        }
        @keyframes fishSwim {
          0% { transform: translateX(-130px) translateY(0); }
          50% { transform: translateX(55vw) translateY(12px); }
          100% { transform: translateX(115vw) translateY(-6px); }
        }
        @keyframes bubbleRise {
          0% { transform: translateY(110vh) scale(0.7); opacity: 0; }
          10% { opacity: 0.3; }
          50% { transform: translateY(50vh) scale(1); opacity: 0.2; }
          100% { transform: translateY(-15vh) scale(1.2); opacity: 0; }
        }
        @keyframes rayMove {
          0% { opacity: 0.04; transform: translateX(-15px) rotate(12deg); }
          50% { opacity: 0.12; transform: translateX(15px) rotate(10deg); }
          100% { opacity: 0.04; transform: translateX(-15px) rotate(12deg); }
        }
        .water-bubble {
          position: absolute;
          bottom: -20px;
          border-radius: 9999px;
          border: 1px solid rgba(160,235,245,0.2);
          background: radial-gradient(circle at 30% 25%, rgba(255,255,255,0.3), transparent 70%);
          animation: bubbleRise linear infinite;
        }
        .fish-swim {
          animation-name: fishSwim;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .water-ray {
          position: absolute;
          top: -20%;
          width: 25%;
          height: 140%;
          background: linear-gradient(90deg, transparent, rgba(125,225,235,0.08), transparent);
          filter: blur(8px);
          animation: rayMove 10s ease-in-out infinite;
        }
        .ray-one { left: 10%; animation-delay: -1s; }
        .ray-two { left: 45%; animation-duration: 13s; animation-delay: -5s; }
        .ray-three { right: 15%; animation-duration: 11s; animation-delay: -3s; }
        .water-caustic {
          position: absolute;
          inset: -15%;
          background:
            radial-gradient(ellipse 20% 6% at 20% 25%, rgba(183,239,240,0.14), transparent 70%),
            radial-gradient(ellipse 25% 7% at 55% 35%, rgba(110,215,225,0.12), transparent 70%),
            radial-gradient(ellipse 22% 6% at 80% 20%, rgba(178,238,240,0.12), transparent 70%),
            radial-gradient(ellipse 35% 8% at 35% 65%, rgba(77,192,208,0.10), transparent 70%);
          filter: blur(8px);
          animation: causticMove 20s ease-in-out infinite;
        }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020b16] light-water-bg">
        <div
          className="absolute inset-0 light-water-gradient-hide"
          style={{
            background: `
              radial-gradient(ellipse 100% 60% at 50% 0%, rgba(16,100,125,0.28), transparent 65%),
              linear-gradient(180deg, #031421 0%, #031b2b 25%, #021522 55%, #010b15 80%, #01070d 100%)
            `,
          }}
        />
        <div className="water-caustic" />
        <LightRays />
        <FishSchool />
        <Bubbles />
      </div>
    </>
  );
}

function GlassCard({
  children,
  className = '',
  glow = '#06b6d4',
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border light-glass-card dark:bg-gradient-to-br dark:from-white/[0.07] dark:via-white/[0.02] dark:to-black/40 backdrop-blur-xl transition-all duration-300 ${className}`}
      style={{
        borderColor: `${glow}33`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.3), 0 0 25px ${glow}10`,
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${glow}66, transparent)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ============================================================
   MAIN HOMEPAGE (FLAGSHIP PORTAL & EXCLUSIVE SIMULATIONS)
============================================================ */

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020917] light-page-root text-white overflow-x-hidden selection:bg-cyan-500/30">
      {/* Living Atmospheric Background */}
      <WaterBackground />

      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content (Full Width Without Depth Bar) */}
      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-20 sm:space-y-24">

        {/* ====================================================
            HERO SHOWCASE SECTION
        ==================================================== */}
        <section className="relative pt-4 pb-8 space-y-8">
          {/* Executive Header & Navigation Actions */}
          <div className="text-center max-w-4xl mx-auto space-y-5">
            {/* Sovereign & SIH Badges */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-xs font-mono backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <IndiaFlag className="w-4 h-2.5" />
              <span className="text-amber-300 font-bold">SIH 2026</span>
              <span className="text-white/25">•</span>
              <span className="text-cyan-200 font-medium">MoES &amp; INCOIS Aligned</span>
              <span className="text-white/25">•</span>
              <span className="text-emerald-300">NORTH INDIAN OCEAN</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight">
              <span
                style={{
                  background: 'linear-gradient(135deg, #38bdf8 0%, #06b6d4 40%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Space-to-Subsurface Ocean
              </span>
              <br />
              <span className="text-white">AI Temperature Reconstruction</span>
            </h1>

            {/* Subtitle */}
            <p className="text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Direct in-situ temperature floats remain sparse. <strong className="text-cyan-300 font-semibold">OCEANINTEL</strong> ingests multi-mission satellite parameters (SST, Salinity, Altimetry SLA, Wind) and applies physics-guided deep learning to predict the complete 3D subsurface temperature field from surface down to 1,000 meters.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('satellite-sim-root');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm hover:scale-105 transition-all cursor-pointer shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #0891a7, #2563eb)',
                  boxShadow: '0 0 25px rgba(6,182,212,0.35)',
                }}
              >
                <Satellite size={16} />
                Satellite Telemetry Sim
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('monsoon-simulation');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white hover:scale-105 transition-all cursor-pointer bg-white/5 border border-white/10 hover:bg-white/10"
              >
                <Compass size={16} className="text-cyan-400" />
                Monsoon Currents
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('neural-lab');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white hover:scale-105 transition-all cursor-pointer bg-purple-950/40 border border-purple-500/30 hover:border-purple-400"
              >
                <Cpu size={16} className="text-purple-400" />
                AI Neural Lab
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white hover:scale-105 transition-all cursor-pointer bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/40"
              >
                <LayoutDashboard size={16} className="text-cyan-400" />
                Open 3D Dashboard
              </button>
            </div>

            {/* Key Architectural Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-3xl mx-auto">
              {[
                { label: 'Spatial Resolution', value: '0.25° × 0.25°', glow: '#06b6d4' },
                { label: 'Vertical Strata', value: '15 Depths', glow: '#3b82f6' },
                { label: 'Max Depth', value: '1,000 Metres', glow: '#8b5cf6' },
                { label: 'Inference Latency', value: '< 5 ms', glow: '#10b981' },
              ].map(({ label, value, glow }) => (
                <GlassCard key={label} glow={glow} className="p-3 text-center">
                  <p className="text-base sm:text-lg font-black font-mono text-white">
                    {value}
                  </p>
                  <p className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">{label}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Interactive Satellite-to-Subsurface Temperature Simulation Showcase */}
          <motion.div
            id="satellite-sim-root"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
            className="w-full relative"
          >
            <SatelliteReconstructionSimulation />
          </motion.div>
        </section>

        {/* ====================================================
            SIMULATION SECTION 1: MONSOON REVERSING CURRENTS
        ==================================================== */}
        <section id="monsoon-simulation" className="space-y-6 pt-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <Waves size={13} />
              PHYSICAL OCEANOGRAPHY SIMULATION 01
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Seasonal Monsoon Current Reversals &amp; Gyres
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed">
              The North Indian Ocean is unique on Earth — it is the only ocean basin where boundary currents completely reverse direction twice a year under the influence of the monsoons.
            </p>
          </div>

          {/* Interactive Simulation Component */}
          <MonsoonFlowSimulation />
        </section>

        {/* ====================================================
            SIMULATION SECTION 2: NEURAL SUBSURFACE RECONSTRUCTION LAB
        ==================================================== */}
        <section id="neural-lab" className="space-y-6 pt-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-300">
              <Cpu size={13} />
              DEEP LEARNING SYNTHESIZER 02
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Interactive Satellite-to-Subsurface Neural Lab
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed">
              Explore how multi-channel surface satellite variables pass through latent embedding layers to dynamically reconstruct the vertical thermocline, barrier layers, and Ocean Heat Content.
            </p>
          </div>

          {/* Interactive Neural Lab Component */}
          <NeuralSubsurfaceLab />
        </section>

        {/* ====================================================
            SECTION 3: REGIONAL BASIN DYNAMICS COMPARISON
        ==================================================== */}
        <section className="space-y-6 pt-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Two Contrasting Basins: Arabian Sea vs Bay of Bengal
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed">
              The Indian subcontinent divides the northern basin into two distinct oceanographic worlds governed by unique salinity, evaporation, and wind stress balances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Arabian Sea Basin */}
            <GlassCard glow="#06b6d4" className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <Compass size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Arabian Sea</h3>
                    <p className="text-xs text-white/50 font-mono">High Salinity · Intense Upwelling</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                  Salinity: 35.5–36.8 PSU
                </span>
              </div>

              <p className="text-sm text-white/70 leading-relaxed">
                Dominated by strong evaporation exceeding precipitation, creating dense, highly saline waters. During the SW monsoon, the Findlater Jet drives intense Ekman pumping and coastal upwelling along the western boundary, lowering sea surface temperatures to &lt;21°C and enriching marine life.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white/40 block">Key Feature</span>
                  <span className="text-white font-bold">Somali Upwelling Jet</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white/40 block">Winter Regime</span>
                  <span className="text-cyan-300 font-bold">Deep Convection (85m)</span>
                </div>
              </div>
            </GlassCard>

            {/* Bay of Bengal Basin */}
            <GlassCard glow="#f97316" className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-300">
                    <Waves size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Bay of Bengal</h3>
                    <p className="text-xs text-white/50 font-mono">Low Salinity · Cyclone Incubator</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/25">
                  Salinity: 30.0–33.5 PSU
                </span>
              </div>

              <p className="text-sm text-white/70 leading-relaxed">
                Receives massive freshwater runoff (~1.6 × 10¹² m³/yr) from the Ganges, Brahmaputra, and Irrawaddy rivers. This light freshwater cap creates a strong halocline and shallow barrier layer that inhibits vertical mixing, keeping surface temperatures above 29°C and fueling rapid cyclone intensification.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white/40 block">Key Feature</span>
                  <span className="text-white font-bold">Salinity Barrier Layer</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-white/40 block">Cyclone Hazard</span>
                  <span className="text-orange-400 font-bold">High OHC (&gt;95 kJ/cm²)</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ====================================================
            SECTION 4: AI ARCHITECTURE PIPELINE
        ==================================================== */}
        <section className="space-y-8 pt-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              End-to-End Deep Learning Architecture
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed">
              Bridging the gap between surface satellite sensors and deep 1000m in-situ profiles with physics-informed latent representations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Surface Sensor Fusion',
                desc: 'Multi-satellite continuous ingestion of SST (MODIS/VIIRS), SSS (SMAP/SMOS), SLA altimetry, and ASCAT surface wind vectors at 0.25° grid.',
                icon: SatelliteIcon,
                color: '#38bdf8',
              },
              {
                step: '02',
                title: 'Spatial-Temporal Encoder',
                desc: 'Vision Transformers (ViT) and ResNet-50 extract multi-scale spatial textures while ConvLSTM captures memory of thermal evolution over time.',
                icon: Cpu,
                color: '#a855f7',
              },
              {
                step: '03',
                title: 'Physics-Informed Latent Space',
                desc: '128-dimensional continuous latent space regularized with hydrostatic equilibrium and conservation of upper Ocean Heat Content.',
                icon: Zap,
                color: '#f59e0b',
              },
              {
                step: '04',
                title: '3D Volumetric Field Synthesis',
                desc: 'Super-resolution decoder reconstructs temperatures across 15 standard depth levels (0–1000m), verified against INCOIS LAS ARGO floats.',
                icon: Database,
                color: '#10b981',
              },
            ].map(({ step, title, desc, icon: Icon, color }) => (
              <GlassCard key={step} glow={color} className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-white/30">{step}</span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white">{title}</h4>
                <p className="text-xs text-white/60 leading-relaxed">{desc}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ====================================================
            SECTION 5: DIRECT ACCESS MODULES
        ==================================================== */}
        <section className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Platform Intelligence Modules
              </h2>
              <p className="text-sm text-white/50">
                Direct access to specialized operational ocean intelligence tools
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-mono text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              Open Full Dashboard Overview <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: '7-Day Forecast',
                desc: 'Temporal projection of vertical strata & MLD evolution.',
                to: '/forecast',
                icon: Calendar,
                glow: '#3b82f6',
              },
              {
                title: 'Cyclone Early Warning',
                desc: 'Photorealistic satellite simulation & past cyclone comparison.',
                to: '/cyclone',
                icon: Wind,
                glow: '#ef4444',
              },
              {
                title: '3D Ocean Profile',
                desc: 'Interactive 3D depth-level slab & horizontal slices.',
                to: '/map',
                icon: Layers,
                glow: '#06b6d4',
              },
              {
                title: 'GLORYS Comparison',
                desc: 'Model accuracy vs GLORYS12 global ocean reanalysis.',
                to: '/compare',
                icon: GitCompare,
                glow: '#8b5cf6',
              },
              {
                title: 'ARGO Float Validation',
                desc: 'Per-depth RMSE, bias, and correlation benchmarks.',
                to: '/validation',
                icon: CheckCircle2,
                glow: '#10b981',
              },
              {
                title: 'Satellite Observations',
                desc: 'Live high-resolution SST, SSS, SSH, and wind heatmaps.',
                to: '/surface',
                icon: Eye,
                glow: '#f97316',
              },
              {
                title: 'Input Data Hub',
                desc: 'Upload NetCDF (.nc) satellite observation files.',
                to: '/input',
                icon: BarChart2,
                glow: '#eab308',
              },
              {
                title: 'Ask X AI Assistant',
                desc: 'Natural language oceanographic chat & analysis.',
                to: '/chat',
                icon: MessageSquare,
                glow: '#a855f7',
              },
            ].map(({ title, desc, to, icon: Icon, glow }) => (
              <button
                key={title}
                onClick={() => navigate(to)}
                className="text-left group cursor-pointer transition-all"
              >
                <GlassCard glow={glow} className="p-5 h-full space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: `${glow}20`, border: `1px solid ${glow}40` }}
                    >
                      <Icon size={17} style={{ color: glow }} />
                    </div>
                    <ArrowRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: glow }}
                    />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {title}
                  </h4>
                  <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
                </GlassCard>
              </button>
            ))}
          </div>
        </section>

        {/* ====================================================
            FOOTER
        ==================================================== */}
        <footer className="pt-12 border-t border-white/10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-xs text-white/40 font-mono">
            <IndiaFlag className="w-3.5 h-2" />
            <span>Smart India Hackathon 2026 · Ministry of Earth Sciences (MoES)</span>
          </div>
          <p className="text-xs text-white/30 max-w-xl mx-auto">
            North Indian Ocean Operational Subsurface Domain (5°N–30°N, 45°E–105°E) · 0.25° Spatial Resolution · 15 Standard Depths (0–1000m)
          </p>
          <div className="w-px h-8 bg-gradient-to-b from-cyan-500/30 to-transparent mx-auto" />
        </footer>
      </main>
    </div>
  );
}

// Satellite Icon Helper
function SatelliteIcon(props: any) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13 7 9 3 5 7l4 4" />
      <path d="m17 11 4 4-4 4-4-4" />
      <path d="m8 12 4 4" />
      <path d="m16 8-4-4" />
      <path d="M12 16a6 6 0 0 0 6-6" />
    </svg>
  );
}