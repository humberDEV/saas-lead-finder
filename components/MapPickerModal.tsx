"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, MapPin } from "lucide-react";

interface MapPickerModalProps {
  onClose: () => void;
  onSelect: (city: string) => void;
}

export default function MapPickerModal({ onClose, onSelect }: MapPickerModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("Haz clic en cualquier punto del globo");
  const [detected, setDetected] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    let mapInstance: any = null;
    let markerInstance: any = null;
    let spinning = true;

    async function initMap() {
      // Inject CSS once
      if (!document.getElementById("maplibre-css")) {
        const link = document.createElement("link");
        link.id = "maplibre-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css";
        document.head.appendChild(link);
      }

      const maplibregl = (await import("maplibre-gl")).default;
      if (aborted || !mapRef.current) return;

      // Detect user location for globe center
      let center: [number, number] = [10, 30];
      let initZoom = 1.5;
      try {
        const geo = await fetch("https://ipapi.co/json/");
        const d = await geo.json();
        if (!aborted && d.longitude && d.latitude) {
          center = [d.longitude, d.latitude];
          initZoom = 3;
        }
      } catch { /* keep defaults */ }

      if (aborted || !mapRef.current) return;

      const map = new (maplibregl as any).Map({
        container: mapRef.current,
        style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
        center,
        zoom: initZoom,
        bearing: 20,
        pitch: 0,
        antialias: true,
        attributionControl: false,
        // Globe projection — 3D Earth
        projection: "globe",
      });

      mapInstance = map;

      // Atmosphere + starfield (style.load fires when tiles are ready)
      map.on("style.load", () => {
        try {
          map.setFog({
            color: "rgb(4, 4, 20)",
            "high-color": "rgb(25, 50, 140)",
            "horizon-blend": 0.025,
            "space-color": "rgb(4, 4, 16)",
            "star-intensity": 0.75,
          });
        } catch { /* not supported in fallback */ }
      });

      // Slow auto-rotation until user interacts
      const spinFrame = () => {
        if (!spinning || !mapInstance) return;
        map.setBearing(map.getBearing() + 0.12);
        requestAnimationFrame(spinFrame);
      };
      requestAnimationFrame(spinFrame);

      const stopSpin = () => { spinning = false; };
      map.on("mousedown", stopSpin);
      map.on("touchstart", stopSpin);
      map.on("wheel", stopSpin);

      // Click handler
      map.on("click", async (e: any) => {
        spinning = false;
        const { lat, lng } = e.lngLat;

        if (markerInstance) {
          markerInstance.remove();
          markerInstance = null;
        }

        // Glowing dot marker
        const el = document.createElement("div");
        el.style.cssText = [
          "width:20px;height:20px;border-radius:50%;",
          "background:#6366f1;",
          "border:3px solid rgba(255,255,255,0.85);",
          "box-shadow:0 0 0 4px rgba(99,102,241,0.3),0 0 20px rgba(99,102,241,0.7);",
        ].join("");

        markerInstance = new (maplibregl as any).Marker({ element: el, anchor: "center" })
          .setLngLat([lng, lat])
          .addTo(map);

        map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 7), duration: 600 });

        setLoading(true);
        setDetected(null);
        setHint("Detectando ciudad...");

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "es" } }
          );
          const data = await res.json();
          const addr = data.address || {};
          const city =
            addr.city || addr.town || addr.village ||
            addr.municipality || addr.county || addr.state || "";
          const country = addr.country || "";
          const result = country ? `${city}, ${country}` : city;
          if (result.trim()) {
            setDetected(result);
            setHint(result);
            setTimeout(() => { onSelect(result); onClose(); }, 650);
          } else {
            setHint("No hay ciudad en este punto, prueba otra zona");
          }
        } catch {
          setHint("Error al detectar, inténtalo de nuevo");
        } finally {
          setLoading(false);
        }
      });

      map.addControl(
        new (maplibregl as any).NavigationControl({ showCompass: false }),
        "bottom-right"
      );
    }

    initMap();

    return () => {
      aborted = true;
      spinning = false;
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
  }, [onClose, onSelect]);

  return (
    <>
      <style>{`
        .huntly-3d .maplibregl-ctrl-group {
          background: #0f172a !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 10px !important;
          overflow: hidden;
          box-shadow: none !important;
        }
        .huntly-3d .maplibregl-ctrl-group button {
          background: transparent !important;
          color: #64748b !important;
          width: 30px !important;
          height: 30px !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        }
        .huntly-3d .maplibregl-ctrl-group button:hover {
          background: rgba(255,255,255,0.06) !important;
          color: #fff !important;
        }
        .huntly-3d .maplibregl-ctrl-group button:last-child {
          border-bottom: none !important;
        }
        .huntly-3d .maplibregl-canvas { cursor: crosshair !important; }
        .huntly-3d .maplibregl-canvas-container { background: #040410; }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-neutral-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] bg-[#040410] flex flex-col">
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Elegir zona en el mapa</p>
                <p className="text-xs mt-0.5 flex items-center gap-1.5">
                  {loading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                      <span className="text-indigo-400">Detectando ciudad...</span>
                    </>
                  ) : detected ? (
                    <span className="text-emerald-400 font-semibold">{detected}</span>
                  ) : (
                    <span className="text-zinc-500">{hint}</span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 3D Globe */}
          <div className="huntly-3d w-full" style={{ height: 440 }}>
            <div ref={mapRef} className="w-full h-full" />
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-neutral-800/80 bg-neutral-900/50">
            <p className="text-[11px] text-zinc-600 text-center">
              El globo gira solo · haz clic en cualquier zona para seleccionarla
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
