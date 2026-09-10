import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Rectangle,
  CircleMarker,
  Tooltip as LeafletTooltip,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Crosshair, RotateCcw,
  ArrowRight, Info, Navigation, Globe, Grid3X3,
  AlertTriangle, CheckCircle2,
} from 'lucide-react';
import PageLayout, { PageContainer, PageHeader } from '../components/PageLayout';
import { useData, DOMAIN } from '../contexts/DataContext';
import { format, parseISO } from 'date-fns';

// ── Fix Leaflet default marker icon ──────────────────────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl:      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl:    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
});

// ── Grid constants: 25 rows (1° lat) × 60 cols (1° lon) ──────────────────────
const GRID_LAT_STEPS = 25;   // 5°N → 30°N  in 1° steps
const GRID_LON_STEPS = 60;   // 45°E → 105°E in 1° steps
const GRID_LAT_RES = (DOMAIN.latMax - DOMAIN.latMin) / GRID_LAT_STEPS;  // 1°
const GRID_LON_RES = (DOMAIN.lonMax - DOMAIN.lonMin) / GRID_LON_STEPS;  // 1°

// Nearest-record IDW for SST at a lat/lon (for colour coding)
function idwSST(
  records: ReturnType<typeof useData>['records'],
  lat: number,
  lon: number,
): number {
  if (!records.length) return 28;
  let ws = 0, wt = 0;
  for (const r of records) {
    const d = Math.hypot(r.lat - lat, r.lon - lon) + 0.01;
    const w = 1 / (d * d);
    ws += w * r.inputs.sst;
    wt += w;
  }
  return ws / wt;
}

// Temperature → RGBA colour (same scale as rest of app)
function sstToRgba(sst: number, alpha = 0.35): string {
  const n = Math.max(0, Math.min(1, (sst - 24) / 8));
  if (n < 0.33) {
    const t = n / 0.33;
    const r = Math.round(30 + (6 - 30) * t);
    const g = Math.round(64 + (182 - 64) * t);
    const b = Math.round(175 + (212 - 175) * t);
    return `rgba(${r},${g},${b},${alpha})`;
  } else if (n < 0.66) {
    const t = (n - 0.33) / 0.33;
    const r = Math.round(6 + (251 - 6) * t);
    const g = Math.round(182 + (191 - 182) * t);
    const b = Math.round(212 + (36 - 212) * t);
    return `rgba(${r},${g},${b},${alpha})`;
  } else {
    const t = (n - 0.66) / 0.34;
    const r = Math.round(251 + (239 - 251) * t);
    const g = Math.round(191 + (68 - 191) * t);
    const b = Math.round(36 + (68 - 36) * t);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}

// ── Pre-build grid cells (static geometry, only lon/lat math) ────────────────
function buildGridCells() {
  const cells: { lat: number; lon: number; bounds: L.LatLngBoundsLiteral }[] = [];
  for (let row = 0; row < GRID_LAT_STEPS; row++) {
    for (let col = 0; col < GRID_LON_STEPS; col++) {
      const south = DOMAIN.latMin + row * GRID_LAT_RES;
      const north = south + GRID_LAT_RES;
      const west  = DOMAIN.lonMin + col * GRID_LON_RES;
      const east  = west + GRID_LON_RES;
      const centerLat = +(south + GRID_LAT_RES / 2).toFixed(4);
      const centerLon = +(west  + GRID_LON_RES / 2).toFixed(4);
      cells.push({
        lat:    centerLat,
        lon:    centerLon,
        bounds: [[south, west], [north, east]],
      });
    }
  }
  return cells;
}

const GRID_CELLS = buildGridCells();   // computed once at module load

// ── Grid overlay component (inside MapContainer) ─────────────────────────────
function NIOGrid({
  records,
  onCellClick,
  hoveredCell,
  setHoveredCell,
  showGrid,
}: {
  records: ReturnType<typeof useData>['records'];
  onCellClick: (lat: number, lon: number) => void;
  hoveredCell: string | null;
  setHoveredCell: (k: string | null) => void;
  showGrid: boolean;
}) {
  if (!showGrid) return null;

  return (
    <>
      {GRID_CELLS.map(cell => {
        const key  = `${cell.lat},${cell.lon}`;
        const sst  = idwSST(records, cell.lat, cell.lon);
        const isHovered = hoveredCell === key;

        return (
          <Rectangle
            key={key}
            bounds={cell.bounds}
            pathOptions={{
              color:       isHovered ? '#ffffff' : 'rgba(255,255,255,0.25)',
              weight:      isHovered ? 1.5 : 0.5,
              fillColor:   sstToRgba(sst, 0),   // transparent fill normally
              fillOpacity: isHovered ? 0.45 : 0.08,
              // fill with SST colour on hover
              ...(isHovered && { fillColor: sstToRgba(sst, 1) }),
            }}
            eventHandlers={{
              click:      () => onCellClick(cell.lat, cell.lon),
              mouseover:  () => setHoveredCell(key),
              mouseout:   () => setHoveredCell(null),
            }}
          >
            <LeafletTooltip sticky direction="top" offset={[0, -4]}>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold text-white">
                  {cell.lat.toFixed(2)}°N · {cell.lon.toFixed(2)}°E
                </p>
                <p>SST ≈ <span style={{ color: sstToRgba(sst, 1).replace(/,[^,]+\)/, ',1)') }}>
                  {sst.toFixed(1)}°C
                </span></p>
                <p className="text-cyan-400 text-[10px] font-semibold">Click to select grid cell</p>
              </div>
            </LeafletTooltip>
          </Rectangle>
        );
      })}
    </>
  );
}

// ── NIO bounding box ──────────────────────────────────────────────────────────
const NIO_BOUNDS: L.LatLngBoundsLiteral = [
  [DOMAIN.latMin, DOMAIN.lonMin],
  [DOMAIN.latMax, DOMAIN.lonMax],
];

// ── Preset locations ──────────────────────────────────────────────────────────
const PRESETS = [
  { name: 'Bay of Bengal (Centre)',      lat: 15.0, lon: 88.0 },
  { name: 'Arabian Sea (Centre)',        lat: 17.0, lon: 65.0 },
  { name: 'Lakshadweep Sea',             lat: 11.0, lon: 73.0 },
  { name: 'Gulf of Mannar',              lat:  8.8, lon: 79.0 },
  { name: 'Andaman Sea',                 lat: 12.5, lon: 95.0 },
  { name: 'BoB — Near Bangladesh Coast', lat: 20.5, lon: 90.0 },
  { name: 'Arabian Sea — Off Mumbai',    lat: 18.0, lon: 69.5 },
  { name: 'Indian Ocean South',          lat:  6.0, lon: 75.0 },
];

// ── Bathymetry & Land Evaluation ──────────────────────────────────────────────
export interface BathymetryResult {
  isLand: boolean;
  isShallow: boolean;
  depthMeters: number;
  locationName: string;
  isValidGrid: boolean;
  statusMessage: string;
}

export function evaluateBathymetry(lat: number, lon: number): BathymetryResult {
  if (lat < 5 || lat > 30 || lon < 45 || lon > 105) {
    return {
      isLand: true,
      isShallow: true,
      depthMeters: 0,
      locationName: 'Outside NIO Domain',
      isValidGrid: false,
      statusMessage: 'Coordinates fall outside the North Indian Ocean domain (5°N–30°N, 45°E–105°E).',
    };
  }

  // 1. Mainland India bounding approximation
  const isIndiaMainland = (
    (lat >= 8.2 && lat <= 22.0 && lon >= 72.8 && lon <= 88.5 && !(lat <= 15 && lon >= 80.5) && !(lat >= 16 && lon >= 85.5 && lat <= 20)) ||
    (lat > 22.0 && lat <= 30.0 && lon >= 68.5 && lon <= 89.5) ||
    (lat >= 20.5 && lat <= 24.5 && lon >= 68.5 && lon <= 73.0)
  );

  // 2. Arabian Peninsula / Iran / Pakistan
  const isArabiaOrIran = (
    (lat >= 12.0 && lon <= 55.0) ||
    (lat >= 22.0 && lon <= 62.0) ||
    (lat >= 24.5 && lon <= 68.5)
  );

  // 3. Myanmar / Thailand / Malay Peninsula / Sumatra
  const isSoutheastAsia = (
    (lat >= 9.5 && lon >= 97.5) ||
    (lat >= 15.0 && lon >= 94.5) ||
    (lat >= 20.0 && lon >= 91.8) ||
    (lat < 6.0 && lon >= 95.0)
  );

  // 4. Sri Lanka
  const isSriLanka = (lat >= 5.8 && lat <= 9.8 && lon >= 79.5 && lon <= 81.9);

  const isLand = isIndiaMainland || isArabiaOrIran || isSoutheastAsia || isSriLanka;

  if (isLand) {
    return {
      isLand: true,
      isShallow: true,
      depthMeters: 0,
      locationName: 'Continental Landmass',
      isValidGrid: false,
      statusMessage: 'Invalid Grid: Selected coordinate is on continental land. Please select an ocean grid cell.',
    };
  }

  let depth = 3200;
  let isShallow = false;

  if (lat > 20.8 && lon >= 87.0 && lon <= 91.8) {
    depth = 80 + Math.round((21.8 - lat) * 400);
    isShallow = depth < 1000;
  } else if (lat >= 20.0 && lat <= 23.0 && lon >= 69.0 && lon <= 73.0) {
    depth = 75;
    isShallow = true;
  } else if (lat >= 8.5 && lat <= 10.5 && lon >= 78.5 && lon <= 80.2) {
    depth = 35;
    isShallow = true;
  } else if (lat > 23.5 && lon < 60.0) {
    depth = 150;
    isShallow = true;
  } else if (
    (lon >= 72.0 && lon <= 73.5 && lat >= 9.0 && lat <= 19.0) ||
    (lon >= 79.8 && lon <= 81.2 && lat >= 11.0 && lat <= 16.0) ||
    (lon >= 84.5 && lon <= 86.5 && lat >= 18.0 && lat <= 20.5)
  ) {
    depth = 420;
    isShallow = depth < 1000;
  } else {
    if (lon < 77) {
      depth = 3300 + Math.round((20 - Math.abs(lat - 14)) * 40);
    } else {
      depth = 2900 + Math.round((18 - Math.abs(lat - 13)) * 50);
    }
    isShallow = false;
  }

  const locName = lon < 77
    ? (lat > 15 ? 'Arabian Sea (North Basin)' : 'Arabian Sea (Central Basin)')
    : (lat > 14 ? 'Bay of Bengal (Central Basin)' : 'South Bay of Bengal / Equatorial NIO');

  if (isShallow) {
    return {
      isLand: false,
      isShallow: true,
      depthMeters: depth,
      locationName: `${locName} (Continental Shelf)`,
      isValidGrid: false,
      statusMessage: `Invalid Grid: Ocean bathymetry is ${depth}m (< 1000m). Reconstruction requires deep ocean (≥ 1000m) to resolve the 15 standard depth levels (0–1000m).`,
    };
  }

  return {
    isLand: false,
    isShallow: false,
    depthMeters: depth,
    locationName: `${locName} (Deep Ocean Basin)`,
    isValidGrid: true,
    statusMessage: `Valid Deep Ocean Grid point (~${depth}m bathymetry). Standard 15-level (0–1000m) reconstruction fully supported.`,
  };
}

// ── Click handler (inside MapContainer) ──────────────────────────────────────
function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(+e.latlng.lat.toFixed(4), +e.latlng.lng.toFixed(4));
    },
  });
  return null;
}

// ── Nearest record finder ─────────────────────────────────────────────────────
function findNearest(
  records: ReturnType<typeof useData>['records'],
  lat: number, lon: number,
) {
  if (!records.length) return null;
  let best = records[0], bestDist = Infinity;
  for (const r of records) {
    const d = Math.hypot(r.lat - lat, r.lon - lon);
    if (d < bestDist) { bestDist = d; best = r; }
  }
  return { record: best, dist: +bestDist.toFixed(2) };
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function WorldMapPage() {
  const { records } = useData();
  const navigate    = useNavigate();

  const [pin,         setPin]         = useState<{ lat: number; lon: number } | null>(null);
  const [latInput,    setLatInput]    = useState('');
  const [lonInput,    setLonInput]    = useState('');
  const [latError,    setLatError]    = useState('');
  const [lonError,    setLonError]    = useState('');
  const [showGrid,    setShowGrid]    = useState(true);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const inDomain = pin
    ? pin.lat >= DOMAIN.latMin && pin.lat <= DOMAIN.latMax
      && pin.lon >= DOMAIN.lonMin && pin.lon <= DOMAIN.lonMax
    : false;

  const nearest = pin ? findNearest(records, pin.lat, pin.lon) : null;

  // Evaluate bathymetry and validity whenever pin changes
  const bathyStatus = useMemo(() => pin ? evaluateBathymetry(pin.lat, pin.lon) : null, [pin]);

  // Unique station locations
  const stations = useMemo(() => {
    const seen = new Set<string>();
    return records.filter(r => {
      const k = `${r.lat.toFixed(1)},${r.lon.toFixed(1)}`;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }, [records]);

  const handleMapClick = useCallback((lat: number, lon: number) => {
    setPin({ lat, lon });
    setLatInput(lat.toString());
    setLonInput(lon.toString());
    setLatError(''); setLonError('');
  }, []);

  // Clicking a grid cell selects the cell WITHOUT immediately navigating
  const handleCellClick = useCallback((lat: number, lon: number) => {
    setPin({ lat, lon });
    setLatInput(lat.toString());
    setLonInput(lon.toString());
    setLatError(''); setLonError('');
  }, []);

  const applyManual = useCallback(() => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    let ok = true;
    if (isNaN(lat) || lat < -90  || lat > 90 ) { setLatError('Must be −90 to 90');   ok = false; } else setLatError('');
    if (isNaN(lon) || lon < -180 || lon > 180) { setLonError('Must be −180 to 180'); ok = false; } else setLonError('');
    if (ok) setPin({ lat, lon });
  }, [latInput, lonInput]);

  const handleGetSurface = useCallback(() => {
    if (!pin) return;
    navigate(`/surface?lat=${pin.lat}&lon=${pin.lon}`);
  }, [pin, navigate]);

  // Leaflet dark-mode CSS overrides
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'leaflet-dark-override';
    style.textContent = `
      .leaflet-container { background: #0a3d62 !important; cursor: crosshair !important; }
      .leaflet-control-zoom a { background: rgba(255,255,255,0.92) !important; color: #0a3d62 !important; border-color: rgba(255,255,255,0.4) !important; font-weight: bold; }
      .leaflet-control-zoom a:hover { background: #fff !important; color: #06b6d4 !important; }
      .leaflet-control-attribution { background: rgba(0,0,0,0.55) !important; color: rgba(255,255,255,0.6) !important; font-size: 10px; }
      .leaflet-control-attribution a { color: rgba(100,220,255,0.8) !important; }
      .leaflet-popup-content-wrapper { background: rgba(2,9,23,0.94) !important; border: 1px solid rgba(255,255,255,0.2) !important; border-radius: 14px !important; backdrop-filter: blur(20px); color: white !important; box-shadow: 0 12px 40px rgba(0,0,0,0.6) !important; }
      .leaflet-popup-tip { background: rgba(2,9,23,0.94) !important; }
      .leaflet-popup-close-button { color: rgba(255,255,255,0.6) !important; font-size:16px !important; top:8px !important; right:10px !important; }
      .leaflet-popup-close-button:hover { color: white !important; }
      .leaflet-tooltip { background: rgba(2,9,23,0.92) !important; border: 1px solid rgba(6,182,212,0.4) !important; color: white !important; border-radius: 8px !important; font-size: 11px; backdrop-filter: blur(10px); box-shadow: 0 4px 16px rgba(0,0,0,0.5); padding: 6px 10px !important; }
      .leaflet-tooltip::before { border-top-color: rgba(6,182,212,0.4) !important; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById('leaflet-dark-override')?.remove(); };
  }, []);

  return (
    <PageLayout>
      <PageContainer>
        <PageHeader
          category="SPATIO-TEMPORAL MAPPING"
          badge={
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              {GRID_LAT_STEPS * GRID_LON_STEPS} INTERACTIVE CELLS
            </div>
          }
          icon={<Globe size={18} className="text-cyan-400" />}
          title="North Indian Ocean Spatial Grid"
          subtitle="25 × 60 grid over North Indian Ocean (5°N–30°N, 45°E–105°E) · Select any coordinate or cell for deep subsurface reconstruction"
          actions={
            <button
              onClick={() => {
                setPin(null);
                setLatInput('');
                setLonInput('');
              }}
              className="btn-glass"
            >
              <RotateCcw size={13} />
              Reset Pin
            </button>
          }
        />

        {/* Domain / grid info badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { l:'Domain',   v:'5°N–30°N · 45°E–105°E' },
            { l:'Grid',     v:`${GRID_LAT_STEPS} rows × ${GRID_LON_STEPS} cols = ${GRID_LAT_STEPS * GRID_LON_STEPS} cells` },
            { l:'Cell size', v:'1° × 1°' },
            { l:'Click',    v:'→ Surface Obs for that cell' },
          ].map(({ l, v }) => (
            <div key={l} className="glass rounded-lg px-3 py-1.5 border border-cyan-500/20 text-xs">
              <span className="text-white/40">{l}: </span>
              <span className="text-cyan-400 font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* ── Map panel ── */}
          <div className="xl:col-span-3">
            <div className="glass rounded-2xl border border-white/10 depth-shadow overflow-hidden">

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-white/50">
                    <Globe size={12} className="text-cyan-400" />
                    Satellite map · hover grid cell to preview · click to view surface obs
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Grid toggle */}
                  <button
                    onClick={() => setShowGrid(g => !g)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      showGrid
                        ? 'bg-cyan-500/15 border-cyan-500/35 text-cyan-400'
                        : 'glass border-white/10 text-white/50 hover:text-white'
                    }`}
                  >
                    <Grid3X3 size={12} />
                    {showGrid ? 'Grid ON' : 'Grid OFF'}
                  </button>
                  {pin && (
                    <button
                      onClick={() => { setPin(null); setLatInput(''); setLonInput(''); }}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg glass border border-white/10 text-white/50 hover:text-white text-xs transition-all"
                    >
                      <RotateCcw size={11} /> Clear pin
                    </button>
                  )}
                </div>
              </div>

              {/* ⚠️ Invalid Grid Alert Banner (Depth < 1000m or Land) */}
              {pin && bathyStatus && !bathyStatus.isValidGrid && (
                <div className="mx-4 mt-3 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={18} className="text-red-400 shrink-0 animate-pulse" />
                    <div>
                      <p className="font-bold text-red-200">Invalid Grid Selection: Depth &lt; 1000m or Land</p>
                      <p className="text-[11px] text-red-300/80 mt-0.5">{bathyStatus.statusMessage}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setPin(null); setLatInput(''); setLonInput(''); }}
                    className="text-[11px] font-mono font-bold text-red-200 hover:text-white px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/30 shrink-0 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Leaflet map */}
              <div style={{ height: '540px' }}>
                <MapContainer
                  center={[17, 75]}
                  zoom={5}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom
                  doubleClickZoom={false}
                >
                  {/* Satellite imagery */}
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                    maxZoom={18}
                  />
                  {/* Labels overlay */}
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    attribution=""
                    maxZoom={18}
                    opacity={0.65}
                  />

                  {/* ── NIO Domain border (yellow dashed) ── */}
                  <Rectangle
                    bounds={NIO_BOUNDS}
                    pathOptions={{
                      color:       '#facc15',
                      weight:      2.5,
                      dashArray:   '8 5',
                      fillOpacity: 0,
                    }}
                  >
                    <LeafletTooltip sticky={false} direction="top">
                      NIO Study Domain · 5°N–30°N, 45°E–105°E
                    </LeafletTooltip>
                  </Rectangle>

                  {/* ── 25×60 Clickable grid ── */}
                  <NIOGrid
                    records={records}
                    onCellClick={handleCellClick}
                    hoveredCell={hoveredCell}
                    setHoveredCell={setHoveredCell}
                    showGrid={showGrid}
                  />

                  {/* ── Data station markers ── */}
                  {stations.map(r => (
                    <CircleMarker
                      key={r.id}
                      center={[r.lat, r.lon]}
                      radius={7}
                      pathOptions={{
                        color:       '#ffffff',
                        fillColor:   '#06b6d4',
                        fillOpacity: 0.95,
                        weight:      2,
                      }}
                    >
                      <LeafletTooltip>
                        <div className="text-xs space-y-0.5">
                          <p className="font-semibold text-white">{r.location}</p>
                          <p>SST: <span className="text-red-400">{r.inputs.sst.toFixed(1)}°C</span></p>
                          <p>SSS: <span className="text-blue-400">{r.inputs.sss.toFixed(1)} PSU</span></p>
                          <p>SSH: <span className="text-cyan-400">{r.inputs.ssh.toFixed(1)} cm</span></p>
                          <p>MLD: <span className="text-purple-400">{r.mld.toFixed(0)} m</span></p>
                          <p className="text-white/40">{format(parseISO(r.date), 'MMM d, yyyy')}</p>
                        </div>
                      </LeafletTooltip>
                    </CircleMarker>
                  ))}

                  {/* ── Preset orange markers ── */}
                  {PRESETS.map(p => (
                    <CircleMarker
                      key={p.name}
                      center={[p.lat, p.lon]}
                      radius={6}
                      pathOptions={{
                        color:       '#ffffff',
                        fillColor:   '#f97316',
                        fillOpacity: 0.9,
                        weight:      2,
                      }}
                      eventHandlers={{ click: () => handleMapClick(p.lat, p.lon) }}
                    >
                      <LeafletTooltip>
                        <span className="text-xs font-medium">{p.name}</span>
                      </LeafletTooltip>
                    </CircleMarker>
                  ))}

                  {/* ── Selected pin ── */}
                  {pin && (
                    <Marker position={[pin.lat, pin.lon]} icon={redIcon}>
                      <Popup>
                        <div className="text-sm space-y-2 min-w-[220px]">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <MapPin size={13} className="text-cyan-400" />
                            Selected Point
                          </p>
                          <div className="space-y-1 text-xs">
                            <p className="text-white/70">Lat: <span className="text-cyan-400 font-mono">{pin.lat}°N</span></p>
                            <p className="text-white/70">Lon: <span className="text-cyan-400 font-mono">{pin.lon}°E</span></p>
                            <p className="text-white/70">Bathymetry: <span className={bathyStatus?.isValidGrid ? 'text-cyan-400 font-mono font-bold' : 'text-red-400 font-mono font-bold'}>
                              {bathyStatus?.isLand ? 'Continental Land (0m)' : `~${bathyStatus?.depthMeters}m`}
                            </span></p>
                            <p className={bathyStatus?.isValidGrid ? 'text-emerald-400 font-semibold text-[11px]' : 'text-red-400 font-semibold text-[11px]'}>
                              {bathyStatus?.isValidGrid ? '✓ Valid Deep Ocean (≥1000m)' : '⚠️ Invalid: Land or Shallow (<1000m)'}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  <ClickHandler onMapClick={handleMapClick} />
                </MapContainer>
              </div>

              {/* Map legend */}
              <div className="flex flex-wrap items-center gap-5 px-4 py-3 border-t border-white/8 text-xs text-white/50">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-dashed border-2 border-yellow-400 inline-block" />
                  NIO Domain border
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm border border-white/30 bg-cyan-400/20 inline-block" />
                  1°×1° grid cell (hover = SST colour · click = surface obs)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-white inline-block" />
                  Data station
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-white inline-block" />
                  Preset
                </span>
                {pin && (
                  <span className="flex items-center gap-1.5 ml-auto text-cyan-400">
                    📍 {pin.lat}°N, {pin.lon}°E selected
                  </span>
                )}
              </div>
            </div>

            {/* ── SUBMIT BUTTON & SELECTED COORDINATE CARD DIRECTLY UNDER THE MAP ── */}
            {pin && bathyStatus ? (
              <div className="glass rounded-2xl p-5 border border-cyan-500/30 depth-shadow space-y-4 fade-in-up bg-[#030e20]/90 mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        Selected Grid Point: <span className="font-mono text-cyan-300">{pin.lat}°N, {pin.lon}°E</span>
                      </h3>
                      <p className="text-[11px] text-white/50">
                        {bathyStatus.isLand ? 'Continental Land' : `Estimated Bathymetry: ~${bathyStatus.depthMeters}m`} · {inDomain ? 'North Indian Ocean Domain' : 'Outside Standard Domain'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold ${
                      bathyStatus.isValidGrid
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {bathyStatus.isValidGrid ? '✓ VALID DEEP OCEAN GRID' : '⚠️ INVALID SHALLOW/LAND'}
                    </span>
                    <button
                      onClick={() => { setPin(null); setLatInput(''); setLonInput(''); }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs border border-white/10 transition-all cursor-pointer"
                    >
                      Clear Pin
                    </button>
                  </div>
                </div>

                {/* Validation Banner if Invalid */}
                {!bathyStatus.isValidGrid && (
                  <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-red-200">
                      <AlertTriangle size={15} className="text-red-400 shrink-0" />
                      Bathymetric Constraint Warning
                    </div>
                    <p className="text-[11px] leading-relaxed text-red-300/90">
                      {bathyStatus.statusMessage}
                    </p>
                  </div>
                )}

                {/* Telemetry and Action Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Telemetry preview (7 cols) */}
                  <div className="md:col-span-7 space-y-2">
                    {nearest ? (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-white/50">
                          <span className="flex items-center gap-1">
                            <Info size={11} className="text-cyan-400" />
                            Nearest Baseline Station ({nearest.record.location})
                          </span>
                          <span className="font-mono">{nearest.dist}° offset</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center p-1.5 rounded bg-black/30">
                            <span className="text-[9px] text-white/40 block">SST</span>
                            <span className="font-mono text-xs font-bold text-red-400">{nearest.record.inputs.sst.toFixed(1)}°C</span>
                          </div>
                          <div className="text-center p-1.5 rounded bg-black/30">
                            <span className="text-[9px] text-white/40 block">SSS</span>
                            <span className="font-mono text-xs font-bold text-blue-400">{nearest.record.inputs.sss.toFixed(1)}</span>
                          </div>
                          <div className="text-center p-1.5 rounded bg-black/30">
                            <span className="text-[9px] text-white/40 block">SSH</span>
                            <span className="font-mono text-xs font-bold text-cyan-400">{nearest.record.inputs.ssh.toFixed(1)}</span>
                          </div>
                          <div className="text-center p-1.5 rounded bg-black/30">
                            <span className="text-[9px] text-white/40 block">MLD</span>
                            <span className="font-mono text-xs font-bold text-purple-400">{nearest.record.mld.toFixed(0)}m</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/50">
                        Latitude: <strong className="text-white">{pin.lat}°N</strong> · Longitude: <strong className="text-white">{pin.lon}°E</strong>
                      </div>
                    )}
                  </div>

                  {/* Submit Action Button (5 cols) */}
                  <div className="md:col-span-5">
                    {bathyStatus.isValidGrid ? (
                      <button
                        onClick={handleGetSurface}
                        className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm glow-cyan hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                        style={{ background: 'linear-gradient(135deg,#06b6d4,#3b82f6)' }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Confirm Grid &amp; View Surface Obs</span>
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <AlertTriangle size={14} className="text-red-400/60" />
                        <span>Cannot Proceed: Depth &lt; 1000m</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-4 border border-white/10 depth-shadow flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60 bg-[#030e20]/60 mt-6">
                <div className="flex items-center gap-2">
                  <Grid3X3 size={16} className="text-cyan-400 shrink-0" />
                  <span>
                    Click any open-ocean coordinate on the map (depth &ge; 1000m) to inspect bathymetry and confirm grid selection.
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300/80 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 whitespace-nowrap">
                  0.25° × 0.25° RESOLUTION
                </span>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Grid info card */}
            <div className="glass rounded-2xl p-5 border border-cyan-500/20 bg-cyan-500/5 depth-shadow space-y-3">
              <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <Grid3X3 size={14} />
                NIO Grid — 25 × 60
              </h3>
              <div className="space-y-1.5 text-xs text-white/60">
                <div className="flex justify-between">
                  <span className="text-white/40">Total cells</span>
                  <span className="font-mono text-white">{GRID_LAT_STEPS * GRID_LON_STEPS}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Rows (lat)</span>
                  <span className="font-mono text-white">{GRID_LAT_STEPS} × 1°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Cols (lon)</span>
                  <span className="font-mono text-white">{GRID_LON_STEPS} × 1°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Lat range</span>
                  <span className="font-mono text-white">{DOMAIN.latMin}°N – {DOMAIN.latMax}°N</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Lon range</span>
                  <span className="font-mono text-white">{DOMAIN.lonMin}°E – {DOMAIN.lonMax}°E</span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 text-[10px] text-white/30 leading-relaxed">
                Each cell colour on hover = IDW-interpolated SST from station data.
                Click any cell to inspect and confirm below.
              </div>
            </div>

            {/* Manual coordinate entry */}
            <div className="glass rounded-2xl p-5 border border-white/10 depth-shadow space-y-4">
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Crosshair size={14} className="text-cyan-400" />
                Enter Coordinates
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Latitude °N</label>
                  <input
                    type="number" value={latInput}
                    onChange={e => setLatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyManual()}
                    placeholder="e.g. 15.5" step="1" min="-90" max="90"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {latError && <p className="text-red-400 text-[10px] mt-1">{latError}</p>}
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Longitude °E</label>
                  <input
                    type="number" value={lonInput}
                    onChange={e => setLonInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyManual()}
                    placeholder="e.g. 88.0" step="1" min="-180" max="180"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {lonError && <p className="text-red-400 text-[10px] mt-1">{lonError}</p>}
                </div>
                <button onClick={applyManual}
                  className="w-full py-2.5 rounded-xl glass border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Navigation size={13} /> Place Pin
                </button>
              </div>
            </div>

            {/* Preset locations */}
            <div className="glass rounded-2xl p-5 border border-white/10 depth-shadow">
              <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-yellow-400" />
                Preset Locations
              </h3>
              <div className="space-y-2">
                {PRESETS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setPin({ lat: p.lat, lon: p.lon });
                      setLatInput(String(p.lat));
                      setLonInput(String(p.lon));
                      setLatError(''); setLonError('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                      pin?.lat === p.lat && pin?.lon === p.lon
                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                        : 'glass border border-white/8 text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="font-medium block">{p.name}</span>
                    <span className="text-white/30 font-mono">{p.lat}°N, {p.lon}°E</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </PageLayout>
  );
}
