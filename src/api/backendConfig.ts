/**
 * backendConfig.ts
 *
 * Universal Zero-Config Backend Auto-Discovery & Health Manager.
 *
 * Automatically detects whether the backend is running on:
 *   - http://127.0.0.1:8000
 *   - http://localhost:8000
 *   - http://<lan-ip>:8000 (if testing over local WiFi)
 *   - Custom VITE_BACKEND_URL from environment
 *   - Vite dev proxy ('')
 *
 * When a teammate or friend pulls this repository, the frontend will automatically
 * probe all candidate addresses in the background, lock onto whichever backend
 * is live, and seamlessly route all API requests to it without manual config!
 */

import { useEffect, useState } from 'react';

// Common backend candidate hosts to auto-probe
function getInitialCandidates(): string[] {
  const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;
  const list: string[] = [];

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    list.push(envUrl.trim().replace(/\/+$/, ''));
  }

  // Saved working URL from previous session
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('ocean_active_backend_url');
      if (saved && !list.includes(saved)) {
        list.push(saved);
      }
    } catch {
      // ignore
    }
  }

  // Standard local Python backend addresses
  const defaults = [
    'http://127.0.0.1:8000',
    'http://localhost:8000',
  ];

  // If frontend is accessed on a LAN IP (e.g. 192.168.x.x:5173), also probe backend on that LAN IP
  if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    defaults.push(`http://${window.location.hostname}:8000`);
  }

  // Vite proxy fallback (same origin, eliminates CORS)
  defaults.push('');

  for (const d of defaults) {
    if (!list.includes(d)) {
      list.push(d);
    }
  }

  return list;
}

export interface BackendStatus {
  url: string;
  isLive: boolean;
  isChecking: boolean;
  latencyMs: number | null;
  device?: string;
  cnnLoaded?: boolean;
  swinLoaded?: boolean;
  convgruLoaded?: boolean;
  error?: string | null;
  lastChecked?: string;
}

let activeBackendUrl: string = getInitialCandidates()[0] || 'http://127.0.0.1:8000';
let currentStatus: BackendStatus = {
  url: activeBackendUrl,
  isLive: false,
  isChecking: false,
  latencyMs: null,
};

const listeners = new Set<(status: BackendStatus) => void>();

function notifyListeners() {
  for (const fn of listeners) {
    try {
      fn({ ...currentStatus });
    } catch (e) {
      console.error('[backendConfig] Listener error:', e);
    }
  }
}

/**
 * Returns the currently active, validated backend base URL.
 * Defaults to 'http://127.0.0.1:8000' or whatever responding server was detected.
 */
export function getBackendUrl(): string {
  return activeBackendUrl;
}

/**
 * Manually set or override the backend URL (e.g. from user UI).
 */
export function setActiveBackendUrl(url: string) {
  activeBackendUrl = url.replace(/\/+$/, '');
  try {
    localStorage.setItem('ocean_active_backend_url', activeBackendUrl);
  } catch {
    // ignore
  }
  probeActiveBackend();
}

/**
 * Probe a specific URL to see if it responds to /health or /api/health.
 */
export async function testBackendLiveness(baseUrl: string): Promise<{
  ok: boolean;
  latencyMs: number;
  data?: Record<string, unknown>;
}> {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const start = performance.now();

  const probePath = async (path: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(`${cleanBase}${path}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json().catch(() => ({}));
        return { ok: true, json };
      }
      return { ok: false };
    } catch {
      clearTimeout(timeout);
      return { ok: false };
    }
  };

  // Try /health first, then /api/health
  const healthRes = await probePath('/health');
  const elapsed = Math.round(performance.now() - start);

  if (healthRes.ok) {
    return { ok: true, latencyMs: elapsed, data: healthRes.json as Record<string, unknown> };
  }

  const apiHealthRes = await probePath('/api/health');
  const elapsed2 = Math.round(performance.now() - start);

  if (apiHealthRes.ok) {
    return { ok: true, latencyMs: elapsed2, data: apiHealthRes.json as Record<string, unknown> };
  }

  return { ok: false, latencyMs: elapsed2 };
}

/**
 * Auto-probe all candidate backend URLs and lock onto the first responsive one.
 */
export async function probeActiveBackend(): Promise<BackendStatus> {
  currentStatus = {
    ...currentStatus,
    isChecking: true,
  };
  notifyListeners();

  // First, check currently active URL
  const activeTest = await testBackendLiveness(activeBackendUrl);
  if (activeTest.ok) {
    currentStatus = {
      url: activeBackendUrl,
      isLive: true,
      isChecking: false,
      latencyMs: activeTest.latencyMs,
      device: (activeTest.data?.device as string) ?? 'CPU / GPU',
      cnnLoaded: (activeTest.data?.cnn_loaded as boolean) ?? true,
      swinLoaded: (activeTest.data?.swin_loaded as boolean) ?? true,
      convgruLoaded: (activeTest.data?.convgru_loaded as boolean) ?? true,
      error: null,
      lastChecked: new Date().toLocaleTimeString(),
    };
    notifyListeners();
    return currentStatus;
  }

  // If active URL didn't respond, probe all candidates concurrently
  const candidates = getInitialCandidates().filter(c => c !== activeBackendUrl);
  for (const candidate of candidates) {
    const result = await testBackendLiveness(candidate);
    if (result.ok) {
      activeBackendUrl = candidate;
      try {
        localStorage.setItem('ocean_active_backend_url', candidate);
      } catch {
        // ignore
      }

      currentStatus = {
        url: candidate,
        isLive: true,
        isChecking: false,
        latencyMs: result.latencyMs,
        device: (result.data?.device as string) ?? 'CPU / GPU',
        cnnLoaded: (result.data?.cnn_loaded as boolean) ?? true,
        swinLoaded: (result.data?.swin_loaded as boolean) ?? true,
        convgruLoaded: (result.data?.convgru_loaded as boolean) ?? true,
        error: null,
        lastChecked: new Date().toLocaleTimeString(),
      };
      notifyListeners();
      return currentStatus;
    }
  }

  // No live backend found
  currentStatus = {
    url: activeBackendUrl,
    isLive: false,
    isChecking: false,
    latencyMs: null,
    error: 'Backend is not running. Start with `uvicorn server:app --port 8000`',
    lastChecked: new Date().toLocaleTimeString(),
  };
  notifyListeners();
  return currentStatus;
}

// Background detector setup
let autoDetectorStarted = false;
export function startBackendAutoDetector() {
  if (autoDetectorStarted || typeof window === 'undefined') return;
  autoDetectorStarted = true;

  // Initial probe immediately
  probeActiveBackend();

  // Periodic poll: every 5s if offline to detect when user starts backend; every 30s if online
  setInterval(() => {
    probeActiveBackend();
  }, currentStatus.isLive ? 30000 : 5000);
}

/**
 * React hook to observe live backend connection status anywhere in the app.
 */
export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>(currentStatus);

  useEffect(() => {
    // Start background auto-detector on first component mount
    startBackendAutoDetector();

    setStatus(currentStatus);
    const handler = (newStatus: BackendStatus) => setStatus(newStatus);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    ...status,
    refresh: probeActiveBackend,
    setBackendUrl: setActiveBackendUrl,
  };
}
