import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Waves, LayoutDashboard, Globe, Wind,
  Thermometer, FileText, Shield, BarChart2, LogOut,
  Menu, X, ChevronDown, User, CheckSquare, Map,
  Calendar, GitCompare, Sun, Moon, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useBackendStatus, probeActiveBackend } from '../api/backendConfig';
import GovHeaderBanner from './GovHeaderBanner';

// Ordered navigation items
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/input',     label: 'Input Data',   icon: BarChart2 },
  { to: '/worldmap',  label: 'Map',          icon: Map },
  { to: '/surface',   label: 'Surface Obs',  icon: Thermometer },
  { to: '/map',       label: '3D Profile',   icon: Globe },
  { to: '/forecast',  label: 'Forecast',     icon: Calendar },
  { to: '/cyclone',   label: 'Cyclone',      icon: Wind },
  { to: '/compare',   label: 'Compare',      icon: GitCompare },
  { to: '/validation',label: 'Validation',   icon: CheckSquare },
  { to: '/docs',      label: 'Docs',         icon: FileText, requiresDocs: true },
  { to: '/gov',       label: 'Gov Portal',   icon: Shield,   requiresGov: true },
];

export default function Navbar() {
  const { user, logout, isAuthenticated, isGovernment, isResearcher, quickLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const backend = useBackendStatus();
  const [probing, setProbing] = useState(false);

  const handleProbeBackend = async () => {
    setProbing(true);
    await probeActiveBackend();
    setProbing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.requiresGov && !isGovernment) return false;
    if (item.requiresDocs && !isResearcher) return false;
    return true;
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Official Government Sovereign Banner & SIH Jury Panel */}
      <GovHeaderBanner />

      <nav className="glass-dark border-b border-white/10 shadow-lg backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          {/* Logo with Indian Gov Hackathon Branding */}
          <NavLink to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-700 flex items-center justify-center glow-cyan group-hover:scale-110 transition-transform shadow-md">
              <Waves size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg gradient-text-ocean tracking-tight">
                  OCEANINTEL
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SIH 2026
                </span>
              </div>
              <span className="text-[10px] text-white/50 font-mono hidden sm:block -mt-0.5">
                MoES · INCOIS Subsurface Intelligence
              </span>
            </div>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all whitespace-nowrap
                  ${isActive
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon size={14} />
                <span>{label}</span>
                {to === '/cyclone' && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold tracking-wider border border-rose-500/40 animate-pulse">
                    ALERT
                  </span>
                )}
                {to === '/gov' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                    GOV
                  </span>
                )}
                {to === '/docs' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                    DOCS
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Real-time Backend Zero-Config Status Indicator */}
            {backend.isLive ? (
              <a
                href={`${backend.url || 'http://127.0.0.1:8000'}/docs`}
                target="_blank"
                rel="noreferrer"
                title={`Backend Live: Connected to ${backend.url || 'http://127.0.0.1:8000'}\nClick to view FastAPI Swagger Docs`}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs font-mono font-medium hover:bg-emerald-500/25 transition-all shadow-sm group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-[11px] font-bold tracking-tight">API:8000 LIVE</span>
              </a>
            ) : backend.isChecking || probing ? (
              <div
                title="Probing backend at 127.0.0.1:8000 & localhost..."
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono shadow-sm"
              >
                <RefreshCw size={11} className="animate-spin text-amber-400" />
                <span className="text-[11px] font-semibold">CONNECTING...</span>
              </div>
            ) : (
              <button
                onClick={handleProbeBackend}
                title="Backend offline (Port 8000). Click to retry auto-connection.\nFrontend is running with calibrated physics fallback."
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-white/50 hover:text-cyan-300 text-xs font-mono transition-all shadow-sm cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                <span className="text-[11px]">AUTO-CONNECT</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Light and Dark Theme"
              title={theme === 'dark' ? 'Switch to Sunlit Ocean (Light Mode)' : 'Switch to Deep Abyss Ocean (Dark Mode)'}
              className="w-10 h-10 rounded-xl btn-glass flex items-center justify-center cursor-pointer shadow-md"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-amber-400 hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon size={18} className="text-cyan-600 hover:-rotate-45 transition-transform duration-300" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl btn-glass text-sm cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-inner">
                    <User size={12} className="text-white" />
                  </div>
                  <span className="hidden sm:block text-white/80">{user?.name}</span>
                  <ChevronDown size={14} className={`text-white/50 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[#071326] border border-cyan-500/35 rounded-2xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-50">
                    <div className="px-3 py-2.5 border-b border-white/10 mb-2">
                      <p className="text-[10px] uppercase font-mono text-white/50">Active Account</p>
                      <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-white/50 truncate font-mono">{user?.email}</p>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full mt-1.5 inline-block font-semibold ${
                        user?.role === 'government'
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          : user?.role === 'researcher'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : user?.role === 'admin'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {user?.roleTitle ?? (user?.role?.toUpperCase() ?? 'CITIZEN')}
                      </span>
                    </div>

                    {/* Switch Persona */}
                    <div className="px-2 py-1">
                      <p className="text-[10px] uppercase font-mono text-white/40 mb-1 px-1">Switch Role Clearance</p>
                      <div className="space-y-1">
                        <button
                          onClick={() => { quickLogin('general'); setUserMenuOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/10 text-white/70 flex items-center justify-between"
                        >
                          <span>Citizen / Analyst</span>
                          <span className="text-[10px] text-cyan-400 font-mono">Normal</span>
                        </button>
                        <button
                          onClick={() => { quickLogin('government'); setUserMenuOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/10 text-white/70 flex items-center justify-between"
                        >
                          <span>NDMA Officer</span>
                          <span className="text-[10px] text-yellow-400 font-mono">Gov Portal</span>
                        </button>
                        <button
                          onClick={() => { quickLogin('researcher'); setUserMenuOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/10 text-white/70 flex items-center justify-between"
                        >
                          <span>Research Scientist</span>
                          <span className="text-[10px] text-purple-400 font-mono">Docs</span>
                        </button>
                        <button
                          onClick={() => { quickLogin('admin'); setUserMenuOpen(false); }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/10 text-white/70 flex items-center justify-between"
                        >
                          <span>Super Administrator</span>
                          <span className="text-[10px] text-emerald-400 font-mono">All Access</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 mt-1 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <LogOut size={13} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 rounded-xl btn-primary-cyan text-sm font-semibold cursor-pointer"
              >
                Login
              </button>
            )}

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-2 text-white/70 hover:text-white"
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-white/10 light-banner dark:bg-[#020917]/95 px-4 py-3 space-y-1">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="text-xs font-mono text-white/50">Backend API (:8000)</span>
              {backend.isLive ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              ) : (
                <button
                  onClick={handleProbeBackend}
                  className="px-2.5 py-0.5 rounded-full bg-white/5 text-cyan-300 border border-white/10 text-[10px] font-mono flex items-center gap-1"
                >
                  <RefreshCw size={10} className={probing ? 'animate-spin' : ''} />
                  AUTO-CONNECT
                </button>
              )}
            </div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="text-xs font-mono text-white/50">Theme Settings</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs font-medium text-white/80 hover:text-white transition-all"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={14} className="text-amber-400" />
                    <span>Switch to Light</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-cyan-600" />
                    <span>Switch to Dark</span>
                  </>
                )}
              </button>
            </div>
            {visibleItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                  ${isActive
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
