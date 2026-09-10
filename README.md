# SAMUDRA-AI: Subsurface Ocean Digital Twin Platform
### Ministry of Earth Sciences (MoES) & INCOIS | Smart India Hackathon (SIH) 2026

An advanced, spatio-temporal AI digital twin and forecasting platform for vertical ocean temperature reconstruction, cyclone trajectory forecasting, 3D thermocline profiling, and multi-model embedding comparisons (CNN, Swin Transformer, ConvGRU, GNN, Autoencoder).

---

## 🚀 Quick Start (Zero Configuration Needed)

When you clone or pull this repository onto your laptop, **no configuration files need to be edited**. The frontend will automatically detect, probe, and connect to your Python/FastAPI backend on port 8000.

### 1. Install & Launch Frontend

```bash
# 1. Install dependencies
npm install

# 2. Launch Vite development server
npm run dev
```

Visit: `http://localhost:5173`

---

## 🔌 Zero-Config Backend Connectivity

The frontend includes an **intelligent auto-discovery engine** (`src/api/backendConfig.ts`) that transparently manages loopback and network connectivity:

1. **Auto-Discovery**:
   - Automatically probes `http://127.0.0.1:8000`, `http://localhost:8000`, and Vite proxy `/api` on launch.
   - Detects when your FastAPI backend starts up and switches live without requiring a page refresh.

2. **CORS & Loopback Auto-Failover**:
   - If modern browsers block cross-origin calls between `localhost:5173` and `127.0.0.1:8000`, requests automatically route through Vite's built-in reverse proxy (`vite.config.ts`), guaranteeing zero CORS errors.

3. **Multi-Device / LAN Support**:
   - The Vite dev server is configured with `host: true` (`0.0.0.0`).
   - You or your teammates can open `http://<host-laptop-ip>:5173` from any laptop, tablet, or phone on the same Wi-Fi.

4. **Live Status Indicator in Navbar**:
   - Look at the top navigation bar:
     - 🟢 **API:8000 LIVE**: Backend is online, responsive, and all model routes are verified. Clicking it opens the interactive FastAPI Swagger docs (`/docs`).
     - 🟡 **CONNECTING...**: Actively probing port 8000.
     - ⚪ **AUTO (FALLBACK)**: Backend offline; click anytime to re-probe or trigger auto-connect.

---

## 🐍 Starting Your OceanBed Backend

Make sure your FastAPI / Python backend is running on port 8000:

```bash
# Using uvicorn
python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload

# Or if your entrypoint is main.py
python main.py
```

### Supported Backend Endpoints:
| Method | Route | Description |
|---|---|---|
| `GET` | `/health` / `/api/health` | Backend liveness and GPU/device status |
| `GET` | `/models` | List of loaded neural architectures |
| `GET` | `/metrics/summary` | Validation and test set RMSE/MAE metrics |
| `GET` | `/api/report/{name}` | Dataset reports (`validation_2023`, `final_test_2024_2025`) |
| `GET` | `/api/surface/{date}` | Satellite surface observations (SST, SSS, SSH) |
| `GET` | `/api/heatmap/available` | Available spatio-temporal date list |
| `GET` | `/api/heatmap/{date}/{depth}` | Temperature grid slice at depth |
| `POST` | `/api/predict` | Subsurface profile reconstruction from NetCDF |
| `POST` | `/api/cyclone/phase1/predict` | IMD cyclone trajectory & intensity forecasting |
| `POST` | `/api/embeddings/compare` | Multi-model latent embedding PCA projection |
| `POST` | `/chat` | SAMUDRA-AI oceanographic conversational assistant |

---

## 🛡️ Robust Offline Fallback

If you present the application in an environment without the Python backend running (or while models are initializing):
- All charts, 3D maps, cyclone radars, and data tables operate in **calibrated oceanographic fallback mode**.
- Uses real ARGO float historical profiles and physics-informed thermodynamic equations (UNESCO Equation of State / TEOS-10 approximations).
- Your presentation and demo will never crash or display blank screens.

---

## ⚙️ Optional Environment Overrides

If you ever need to point to a remote server or staging URL instead of the local port 8000, create a `.env` file (or edit `.env`):

```env
# Optional: only needed if backend is NOT running on http://127.0.0.1:8000
VITE_BACKEND_URL=http://your-remote-server.org:8000
```

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: TailwindCSS + Custom Ocean Glassmorphism System
- **Maps**: Leaflet + React-Leaflet + Custom High-Resolution GeoJSON Layers
- **Charts**: Recharts (SST/SSS/SSH profiles, radar distributions, PCA projections)
- **Icons**: Lucide React
- **Animations**: CSS3 GPU-accelerated motion & 3D transformations

---

© 2026 Ministry of Earth Sciences (MoES) | INCOIS | Smart India Hackathon