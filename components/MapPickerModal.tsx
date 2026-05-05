"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, MapPin } from "lucide-react";

interface MapPickerModalProps {
  onClose: () => void;
  onSelect: (city: string) => void;
}

const MARKER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#6366f1" flood-opacity="0.5"/></filter></defs><path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 22 14 22S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#6366f1" filter="url(#s)"/><circle cx="14" cy="14" r="5" fill="white" opacity="0.95"/></svg>`;
const MARKER_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(MARKER_SVG)}`;

export default function MapPickerModal({ onClose, onSelect }: MapPickerModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("Haz clic en cualquier punto del mapa");
  const [detected, setDetected] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    let mapInstance: any = null;

    async function initMap() {
      const L = (await import("leaflet")).default;

      // Abort if cleanup ran while we were awaiting the import
      if (aborted || !mapRef.current) return;

      // Detect user location for initial center
      let center: [number, number] = [25, 10];
      let zoom = 2;
      try {
        const geo = await fetch("https://ipapi.co/json/");
        const d = await geo.json();
        if (!aborted && d.latitude && d.longitude) {
          center = [d.latitude, d.longitude];
          zoom = 6;
        }
      } catch { /* keep defaults */ }

      // Abort if cleanup ran while awaiting ipapi
      if (aborted || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: false,
      });
      mapInstance = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      L.control.attribution({ position: "bottomleft", prefix: false })
        .addAttribution('<span style="color:#3f3f46;font-size:10px">© CartoDB · © OpenStreetMap</span>')
        .addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const icon = L.icon({ iconUrl: MARKER_URL, iconSize: [28, 36], iconAnchor: [14, 36] });
      let marker: any = null;

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        if (marker) marker.remove();
        marker = L.marker([lat, lng], { icon }).addTo(map);
        map.panTo([lat, lng], { animate: true, duration: 0.3 });
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
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.state || "";
          const country = addr.country || "";
          const result = country ? `${city}, ${country}` : city;
          if (result.trim()) {
            setDetected(result);
            setHint(result);
            setTimeout(() => { onSelect(result); onClose(); }, 600);
          } else {
            setHint("No hay ciudad en este punto, prueba otra zona");
          }
        } catch {
          setHint("Error al detectar, inténtalo de nuevo");
        } finally {
          setLoading(false);
        }
      });
    }

    initMap();

    return () => {
      aborted = true;
      if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
      }
    };
  }, [onClose, onSelect]);

  return (
    <>
      <style>{`
        .huntly-map .leaflet-control-zoom {
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 10px !important;
          overflow: hidden;
          box-shadow: none !important;
        }
        .huntly-map .leaflet-control-zoom a {
          background: #0f172a !important;
          color: #64748b !important;
          border: none !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          width: 30px !important; height: 30px !important; line-height: 30px !important;
        }
        .huntly-map .leaflet-control-zoom a:hover { background: #1e293b !important; color: #fff !important; }
        .huntly-map .leaflet-control-zoom-out { border-bottom: none !important; }
        .huntly-map .leaflet-control-attribution { background: transparent !important; box-shadow: none !important; }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-neutral-800 shadow-[0_0_80px_rgba(0,0,0,0.8)] bg-[#0d0d14] flex flex-col">
          <div className="h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20">
                <MapPin className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Elegir zona en el mapa</p>
                <p className="text-xs mt-0.5 flex items-center gap-1.5">
                  {loading
                    ? <><Loader2 className="w-3 h-3 animate-spin text-indigo-400" /><span className="text-indigo-400">Detectando ciudad...</span></>
                    : detected
                    ? <span className="text-emerald-400 font-semibold">{detected}</span>
                    : <span className="text-zinc-500">{hint}</span>
                  }
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-800 text-zinc-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Map — navy tint applied via CSS filter on the wrapper, not the tile pane */}
          <div
            className="huntly-map w-full h-[440px]"
            style={{ filter: "hue-rotate(200deg) saturate(0.45) brightness(0.9)" }}
          >
            <div ref={mapRef} className="w-full h-full" />
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-neutral-800/80 bg-neutral-900/50">
            <p className="text-[11px] text-zinc-600 text-center">
              Haz clic en cualquier ciudad, barrio o zona del mundo
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
