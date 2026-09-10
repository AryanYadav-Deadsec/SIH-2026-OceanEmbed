import { useState, useMemo } from 'react';
import {
  Thermometer,
  Droplets,
  Waves,
  Wind,
  ArrowUpDown,
  Cpu,
  Layers,
  Activity,
  Info,
  Sliders,
  Database,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DEPTH_LEVELS } from '../contexts/DataContext';

export default function InputPhysicsAndSimulationExplainer() {
  // Interactive Simulation Sliders
  const [simSst, setSimSst] = useState<number>(29.5);
  const [simSsh, setSimSsh] = useState<number>(12); // cm
  const [simWind, setSimWind] = useState<number>(6.5); // m/s
  const [simSss, setSimSss] = useState<number>(33.8); // PSU

  // Active parameter card for explanation
  const [activeParam, setActiveParam] = useState<string>('ssh');

  // Compute simulated profile dynamically based on physics of the inputs
  // - High SST: warms upper 50m
  // - Positive SSH (downwelling eddy): deepens thermocline (pushes warm water down)
  // - Strong winds: deepens MLD by mechanical stirring and cools surface skin
  const simulatedOutput = useMemo(() => {
    // MLD calculation: baseline 25m + wind-driven stirring (up to +25m)
    const mld = Math.round(20 + simWind * 1.6 - (simSst - 28) * 1.2);
    // Thermocline depth: displaced directly by SSH anomaly (eddy coupling)
    const thermoclineDepth = Math.round(75 + simSsh * 1.5);
    // OHC (kJ/cm²): integrated upper heat
    const ohc = Math.round(50 + (simSst - 26) * 7.5 + simSsh * 0.85 + (mld > 35 ? 12 : 0));

    // Temperature across all 15 depths
    const profile = DEPTH_LEVELS.map((depth) => {
      let temp: number;
      if (depth <= mld) {
        // Uniform mixed layer
        temp = simSst - (depth / (mld + 1)) * 0.4;
      } else if (depth <= thermoclineDepth + 50) {
        // Rapid thermocline drop
        const fraction = (depth - mld) / (thermoclineDepth + 50 - mld);
        temp = simSst - 0.4 - fraction * 14.5;
      } else if (depth <= 300) {
        temp = 14.0 - ((depth - (thermoclineDepth + 50)) / (300 - (thermoclineDepth + 50))) * 4.5;
      } else if (depth <= 700) {
        temp = 9.5 - ((depth - 300) / 400) * 4.0;
      } else {
        temp = 5.5 - ((depth - 700) / 300) * 1.5;
      }
      return {
        depth: `${depth}m`,
        depthNum: depth,
        temperature: +Math.max(3.8, temp).toFixed(2),
      };
    });

    // Simulated 8-D latent embedding vector z
    const zVector = [
      +((simSst - 28) / 3).toFixed(3),
      +((simSsh) / 25).toFixed(3),
      +((simWind - 8) / 10).toFixed(3),
      +((simSss - 34) / 2).toFixed(3),
      +(Math.sin(simSst * 0.8) * 0.7).toFixed(3),
      +(Math.cos(simSsh * 0.1) * 0.8).toFixed(3),
      +((mld - 30) / 20).toFixed(3),
      +((thermoclineDepth - 75) / 30).toFixed(3),
    ];

    return { profile, mld, thermoclineDepth, ohc, zVector };
  }, [simSst, simSsh, simWind, simSss]);

  const PARAM_DETAILS: Record<string, {
    title: string;
    badge: string;
    icon: any;
    color: string;
    border: string;
    bg: string;
    why: string;
    how: string;
    physics: string;
  }> = {
    sst: {
      title: 'Sea Surface Temperature (SST)',
      badge: 'THERMAL BOUNDARY CONDITION',
      icon: Thermometer,
      color: 'text-red-400',
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
      why: 'SST serves as the fundamental Dirichlet thermal boundary condition at depth = 0m. It dictates sensible and latent heat exchange with the atmosphere. Without SST, the upper boundary of the vertical heat equation is unconstrained.',
      how: 'The Satellite Embedding Engine ingests SST as the primary thermal magnitude layer. It constrains the surface mixed layer temperature and establishes the baseline from which subsurface lapse rates are derived.',
      physics: 'Atmospheric deep convection trigger: SST ≥ 26.5°C threshold required for tropical cyclone genesis and intense air-sea latent heat flux.'
    },
    sss: {
      title: 'Sea Surface Salinity (SSS)',
      badge: 'DENSITY & BARRIER LAYER FORCING',
      icon: Droplets,
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      why: 'Density in the ocean is controlled non-linearly by both temperature and salinity: ρ = ρ(T, S, P). In the North Indian Ocean (especially the Bay of Bengal), heavy freshwater runoff from the Ganges-Brahmaputra produces low-salinity surface lenses.',
      how: 'The embedding model uses SSS to detect the formation of halocline "barrier layers". These thin, buoyant, fresh surface layers prevent wind mixing from penetrating deeper, trapping solar heat just below the surface.',
      physics: 'Barrier Layer Thickness (BLT = ILD - MLD): Thick barrier layers insulate subsurface heat from surface cooling, causing rapid heat accumulation.'
    },
    ssh: {
      title: 'Sea Surface Height (SSH / SLA)',
      badge: 'THERMOCLINE DISPLACEMENT PROXY',
      icon: Waves,
      color: 'text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
      why: 'SSH anomalies (SLA) measured by radar altimeters provide the most direct satellite signature of subsurface thermocline displacement via two-layer baroclinic reduced-gravity physics: h\' ≈ (g / g\') · η.',
      how: 'A positive SLA indicates warm downwelling mesoscale eddies where warm water is pushed deep down to 150m. A negative SLA indicates cyclonic upwelling where the cold thermocline shoals towards the surface. The deep network heavily weights SLA to position the 20°C and 26°C isotherms.',
      physics: 'Baroclinic Adjustment: A 10 cm sea surface elevation typically corresponds to a 20–30 meter depression (deepening) of the main thermocline.'
    },
    currents: {
      title: 'Surface Ocean Currents (U, V)',
      badge: 'ADVECTION & KINETIC SHEAR',
      icon: ArrowUpDown,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
      why: 'Horizontal surface velocity vectors (U eastward, V northward) transport heat and salt across distinct water masses (e.g., East India Coastal Current, Somali Current, Southwest Monsoon Current).',
      how: 'The convolutional/attention feature extractors calculate velocity divergence (∇ · u) and relative vorticity (ζ = ∂v/∂x - ∂u/∂y) to detect mesoscale eddy boundaries and turbulent shear mixing.',
      physics: 'Geostrophic Balance: u_g = -(g/f) ∂η/∂y, v_g = (g/f) ∂η/∂x. Velocity fields confirm eddy rotation and lateral heat advection.'
    },
    winds: {
      title: 'Surface Winds (U, V)',
      badge: 'EKMAN PUMPING & MIXED LAYER DEEPENING',
      icon: Wind,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      why: 'Surface wind stress (τ = ρ_air · C_d · |V| · V) imparts momentum to the ocean surface, creating mechanical turbulence that deepens the mixed layer and controls vertical entrainment.',
      how: 'The model computes wind stress curl to quantify Ekman pumping velocity w_e = (1 / ρ_0) curl(τ / f). Upward Ekman suction lifts cold thermocline water, while downward Ekman pumping drives warm water into the subsurface.',
      physics: 'Turbulent Mixed Layer Dynamics: Wind kinetic energy dissipation rate ε ~ u*³ drives mechanical deepening of MLD down to 40–80m.'
    }
  };

  const currentParam = PARAM_DETAILS[activeParam] ?? PARAM_DETAILS.ssh;

  return (
    <div className="mt-10 pt-10 border-t border-white/10 space-y-10">
      {/* ── Section 1 Header: Why Are We Taking These Inputs? ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
          <Info size={14} />
          <span>Oceanographic Justification &amp; Data Pipeline Rationale</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Why Are We Taking These 5 Surface Inputs?
        </h2>
        <p className="text-xs sm:text-sm text-white/60 max-w-4xl leading-relaxed">
          Direct vertical measurements from ARGO buoys are sparse in space and time. Satellites can only see the surface skin of the sea. 
          However, because physical processes (gravity, buoyancy, wind stress, and eddies) dynamically couple the surface to the deep water, 
          each surface variable contains an indirect mathematical imprint of the subsurface column down to 1000m.
        </p>
      </div>

      {/* ── Parameter Selection Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(PARAM_DETAILS).map(([key, p]) => {
          const isSelected = activeParam === key;
          const Icon = p.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveParam(key)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer select-none ${
                isSelected
                  ? `${p.bg} ${p.border} shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-[1.02]`
                  : 'glass border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${p.bg} border ${p.border}`}>
                  <Icon size={16} className={p.color} />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <h4 className="font-bold text-white text-xs mb-1">{p.title.split('(')[0].trim()}</h4>
              <span className={`text-[10px] font-mono font-semibold ${p.color}`}>
                {p.title.includes('(') ? `(${p.title.split('(')[1]}` : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Active Parameter Detail Spotlight ── */}
      <div className={`rounded-2xl p-6 border ${currentParam.border} ${currentParam.bg} backdrop-blur-xl shadow-xl space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <currentParam.icon size={20} className={currentParam.color} />
            <div>
              <h3 className="font-black text-white text-base">{currentParam.title}</h3>
              <span className="text-[10px] font-mono text-white/50">{currentParam.badge}</span>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-black/40 text-cyan-300 border border-white/10 self-start sm:self-auto">
            0.25° Daily Satellite Product
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs leading-relaxed">
          <div className="space-y-1.5 p-4 rounded-xl bg-black/30 border border-white/5">
            <h5 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              1. Why We Take This Input
            </h5>
            <p className="text-white/70">{currentParam.why}</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-black/30 border border-white/5">
            <h5 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5 text-blue-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              2. How The AI Model Uses It
            </h5>
            <p className="text-white/70">{currentParam.how}</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-black/30 border border-white/5">
            <h5 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5 text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              3. Oceanographic Physical Law
            </h5>
            <p className="text-white/70 font-mono text-[11px]">{currentParam.physics}</p>
          </div>
        </div>
      </div>

      {/* ── Section 2: How Are We Using This via A Simulation? ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
          <Cpu size={14} />
          <span>Interactive Deep Learning Architecture &amp; Simulation</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          How Are We Using This? (End-to-End Simulation)
        </h2>
        <p className="text-xs sm:text-sm text-white/60 max-w-4xl leading-relaxed">
          Adjust the surface satellite observations below. Observe how the <strong className="text-cyan-300 font-semibold">Satellite Embedding Engine</strong> transforms 
          these surface inputs into a latent vector $z$, and how the non-linear deep reconstruction model reconstructs the 
          vertical temperature profile across all 15 depth levels (0–1000m) in real-time.
        </p>

        {/* 3-Stage Visual Pipeline Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl glass border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-400">STAGE 1</span>
              <Database size={14} className="text-cyan-400" />
            </div>
            <h4 className="font-bold text-white text-sm">Harmonization &amp; Regridding</h4>
            <p className="text-[11px] text-white/60">
              5 multi-source satellite products are interpolated to a standardized <strong className="text-white">0.25° × 0.25° spatial grid</strong> at <strong className="text-white">daily temporal resolution</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-purple-400">STAGE 2</span>
              <Cpu size={14} className="text-purple-400" />
            </div>
            <h4 className="font-bold text-white text-sm">Satellite Embedding Engine</h4>
            <p className="text-[11px] text-white/60">
              Deep architectures (<strong className="text-white">CNN, ViT, Autoencoders, GNN</strong>) compress multidimensional surface patches into compact latent representations z ∈ ℝᵈ.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400">STAGE 3</span>
              <Layers size={14} className="text-emerald-400" />
            </div>
            <h4 className="font-bold text-white text-sm">15-Depth Reconstruction</h4>
            <p className="text-[11px] text-white/60">
              Non-linear decoder maps latent representations to vertical temperature profiles at <strong className="text-white">15 standard depths (0, 5, 10... 1000m)</strong>, trained against GLORYS reanalysis.
            </p>
          </div>
        </div>

        {/* ── Interactive Live Simulation Workbench ── */}
        <div className="rounded-3xl border border-white/10 bg-[#030e20]/90 backdrop-blur-xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-cyan-400" />
              <h3 className="font-black text-white text-base">
                Interactive Satellite &rarr; Subsurface Profile Simulator
              </h3>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30">
              LIVE LATENT INFERENCE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Input Parameter Sliders (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs text-white/50 uppercase font-mono tracking-wider font-semibold">
                Adjust Surface Inputs:
              </p>

              {/* SST Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/80 font-semibold flex items-center gap-1.5">
                    <Thermometer size={14} className="text-red-400" />
                    Sea Surface Temp (SST)
                  </span>
                  <span className="font-mono text-red-400 font-bold">{simSst}°C</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="32"
                  step="0.1"
                  value={simSst}
                  onChange={(e) => setSimSst(parseFloat(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>24.0°C (Winter)</span>
                  <span>32.0°C (Pre-Monsoon Peak)</span>
                </div>
              </div>

              {/* SSH / SLA Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/80 font-semibold flex items-center gap-1.5">
                    <Waves size={14} className="text-cyan-400" />
                    Sea Level Anomaly (SSH / SLA)
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{simSsh > 0 ? `+${simSsh}` : simSsh} cm</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="25"
                  step="1"
                  value={simSsh}
                  onChange={(e) => setSimSsh(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>-25 cm (Cyclonic Upwelling)</span>
                  <span>+25 cm (Warm Downwelling Eddy)</span>
                </div>
              </div>

              {/* Wind Speed Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/80 font-semibold flex items-center gap-1.5">
                    <Wind size={14} className="text-emerald-400" />
                    Surface Wind Velocity
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{simWind} m/s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="22"
                  step="0.5"
                  value={simWind}
                  onChange={(e) => setSimWind(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>1.0 m/s (Calm)</span>
                  <span>22.0 m/s (Gale / Monsoon)</span>
                </div>
              </div>

              {/* Salinity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/80 font-semibold flex items-center gap-1.5">
                    <Droplets size={14} className="text-blue-400" />
                    Sea Surface Salinity (SSS)
                  </span>
                  <span className="font-mono text-blue-400 font-bold">{simSss} PSU</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="36.5"
                  step="0.1"
                  value={simSss}
                  onChange={(e) => setSimSss(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-white/40">
                  <span>30.0 PSU (Fresh River Plume)</span>
                  <span>36.5 PSU (High Evaporation)</span>
                </div>
              </div>

              {/* Computed Latent Embedding Vector z Preview */}
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono text-white/40 uppercase">
                  Latent Representation Vector z ∈ ℝ⁸:
                </span>
                <div className="flex items-center gap-1 h-6">
                  {simulatedOutput.zVector.map((val, idx) => (
                    <div
                      key={idx}
                      title={`z[${idx}] = ${val}`}
                      className="flex-1 rounded-sm transition-all flex items-end justify-center"
                      style={{
                        height: '100%',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <div
                        className="w-full rounded-xs transition-all duration-300"
                        style={{
                          height: `${Math.min(100, Math.max(15, Math.abs(val) * 70))}%`,
                          backgroundColor: val >= 0 ? '#06b6d4' : '#f43f5e',
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-white/30">
                  {simulatedOutput.zVector.map((_, i) => (
                    <span key={i}>z{i}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Reconstructed Profile Chart & Key Metrics (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Output Derived Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-mono text-white/40 block">Mixed Layer Depth</span>
                  <span className="text-xl font-black font-mono text-cyan-300">{simulatedOutput.mld} m</span>
                  <span className="text-[9px] text-white/40 block">Wind-stirred layer</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-mono text-white/40 block">Thermocline Depth</span>
                  <span className="text-xl font-black font-mono text-teal-300">{simulatedOutput.thermoclineDepth} m</span>
                  <span className="text-[9px] text-white/40 block">Eddy-displaced</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-mono text-white/40 block">Ocean Heat Content</span>
                  <span className="text-xl font-black font-mono text-orange-300">{simulatedOutput.ohc} kJ/cm²</span>
                  <span className="text-[9px] text-white/40 block">0–300m thermal fuel</span>
                </div>
              </div>

              {/* Dynamic Temperature vs Depth Profile Line Chart */}
              <div className="glass rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Activity size={14} className="text-cyan-400" />
                    Simulated Vertical Temperature Profile T(z)
                  </span>
                  <span className="font-mono text-white/40 text-[11px]">Surface 0m &rarr; Deep 1000m</span>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={simulatedOutput.profile} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="depth" stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 34]} stroke="rgba(255,255,255,0.4)" tick={{ fontSize: 10 }} unit="°C" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#071326',
                          borderColor: 'rgba(6,182,212,0.4)',
                          borderRadius: '12px',
                          fontSize: '11px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="temperature"
                        name="Reconstructed Temperature"
                        stroke="#22d3ee"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#06b6d4' }}
                        activeDot={{ r: 6, fill: '#38bdf8' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 bg-cyan-400" /> Reconstructed $T(z)$ from latent code $z$
                  </span>
                  <span>Notice thermocline shift as you slide SSH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
