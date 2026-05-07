"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, MapPin } from "lucide-react";

interface MapPickerModalProps {
  onClose: () => void;
  onSelect: (city: string) => void;
}

export default function MapPickerModal({ onClose, onSelect }: MapPickerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState("Haz clic en cualquier punto del globo");
  const [detected, setDetected] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;

    async function initGlobe() {
      // globe.gl uses an unusual builder + factory pattern that confuses TS — cast to any
      const Globe = (await import("globe.gl")).default as unknown as () => any;
      if (aborted || !containerRef.current) return;

      const el = containerRef.current;

      // Globe() returns a chainable builder; calling (el) at the end mounts it
      const globe = Globe()
        .width(el.clientWidth)
        .height(el.clientHeight)
        // NASA Blue Marble dark texture hosted by three-globe (bundled with globe.gl)
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        .showAtmosphere(true)
        .atmosphereColor("#6366f1")
        .atmosphereAltitude(0.13)
        .onGlobeClick(async ({ lat, lng }: { lat: number; lng: number }) => {
          if (aborted) return;

          // Stop spinning when user clicks
          if (globeRef.current) globeRef.current.controls().autoRotate = false;

          setLoading(true);
          setDetected(null);
          setHint("Detectando ciudad...");

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
              { headers: { "Accept-Language": "es" } }
            );
            const data = await res.json();
            const addr = data.address ?? {};
            const city =
              addr.city ?? addr.town ?? addr.village ??
              addr.municipality ?? addr.county ?? addr.state ?? "";
            const country = addr.country ?? "";
            const result = country ? `${city}, ${country}` : city;
            if (result.trim()) {
              setDetected(result);
              setHint(result);
              setTimeout(() => { if (!aborted) { onSelect(result); onClose(); } }, 650);
            } else {
              setHint("No hay ciudad en este punto, prueba otra zona");
            }
          } catch {
            setHint("Error al detectar, inténtalo de nuevo");
          } finally {
            if (!aborted) setLoading(false);
          }
        })
        (el);

      globeRef.current = globe;

      // Start looking at Earth from a slight angle (not top-down)
      globe.pointOfView({ lat: 25, lng: 10, altitude: 2.5 }, 0);

      // Auto-rotate like a real planet
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.65;
      globe.controls().enableDamping = true;
      globe.controls().dampingFactor = 0.08;
      globe.controls().minDistance = 101;   // can't go inside the Earth
      globe.controls().maxDistance = 700;   // can't zoom out to infinity

      // Pan to user's approximate location without changing altitude
      try {
        const geo = await fetch("https://ipapi.co/json/");
        const d = await geo.json();
        if (!aborted && d.longitude && d.latitude) {
          globe.pointOfView({ lat: d.latitude, lng: d.longitude, altitude: 2.5 }, 1200);
        }
      } catch { /* keep default view */ }
    }

    initGlobe();

    return () => {
      aborted = true;
      if (globeRef.current) {
        try {
          // Dispose Three.js renderer to free GPU memory
          globeRef.current.renderer()?.dispose();
          globeRef.current.scene()?.clear();
        } catch {}
        // Remove canvas from DOM
        const canvas = containerRef.current?.querySelector("canvas");
        canvas?.remove();
        globeRef.current = null;
      }
    };
  }, [onClose, onSelect]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-neutral-800 shadow-[0_0_80px_rgba(0,0,0,0.9)] bg-[#04040e] flex flex-col">
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

        {/* Globe — Three.js renders into this div */}
        <div
          ref={containerRef}
          className="w-full select-none"
          style={{ height: 440, background: "#04040e", cursor: "grab" }}
        />

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800/80 bg-neutral-900/40">
          <p className="text-[11px] text-zinc-600 text-center">
            El globo gira solo · haz clic en cualquier zona para seleccionarla · arrastra para girar
          </p>
        </div>
      </div>
    </div>
  );
}
