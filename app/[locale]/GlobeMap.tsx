"use client";

import { useEffect, useRef, useState } from "react";

const CITIES = [
  { name: "Madrid", lat: 40.42, lng: -3.70 },
  { name: "Ciudad de México", lat: 19.43, lng: -99.13 },
  { name: "Buenos Aires", lat: -34.60, lng: -58.38 },
  { name: "Bogotá", lat: 4.71, lng: -74.07 },
  { name: "Lima", lat: -12.05, lng: -77.04 },
  { name: "Miami", lat: 25.76, lng: -80.19 },
  { name: "Barcelona", lat: 41.39, lng: 2.17 },
  { name: "Santiago", lat: -33.46, lng: -70.65 },
  { name: "Los Ángeles", lat: 34.05, lng: -118.24 },
  { name: "São Paulo", lat: -23.55, lng: -46.63 },
  { name: "Valencia", lat: 39.47, lng: -0.38 },
  { name: "Caracas", lat: 10.48, lng: -66.90 },
  { name: "Guadalajara", lat: 20.66, lng: -103.35 },
  { name: "Medellín", lat: 6.25, lng: -75.56 },
  { name: "Montevideo", lat: -34.90, lng: -56.16 },
  { name: "Nueva York", lat: 40.71, lng: -74.01 },
  { name: "Quito", lat: -0.23, lng: -78.52 },
  { name: "Bilbao", lat: 43.26, lng: -2.93 },
];

export default function GlobeMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentCity, setCurrentCity] = useState(CITIES[0]);
  const indexRef = useRef(0);
  const globeInstanceRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval>;

    const init = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const GlobeMod = await import("globe.gl");
        // globe.gl default export is a constructor function; call with new
        const GlobeConstructor = (GlobeMod.default as any);
        if (!mounted || !containerRef.current) return;

        const el = containerRef.current;
        const w = el.clientWidth || 400;
        const h = el.clientHeight || 400;

        const globe = new GlobeConstructor(el);
        globeInstanceRef.current = globe;

        globe
          .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
          .backgroundColor("rgba(0,0,0,0)")
          .atmosphereColor("rgba(99,102,241,0.5)")
          .atmosphereAltitude(0.18)
          .width(w)
          .height(h)
          .enablePointerInteraction(false);

        const goTo = (idx: number, animate: boolean) => {
          const city = CITIES[idx];
          globe
            .pointsData([{ lat: city.lat, lng: city.lng }])
            .pointColor(() => "#818cf8")
            .pointRadius(0.7)
            .pointAltitude(0.02)
            .pointOfView({ lat: city.lat, lng: city.lng, altitude: 2.0 }, animate ? 1400 : 0);
        };

        goTo(0, false);

        intervalId = setInterval(() => {
          if (!mounted) return;
          indexRef.current = (indexRef.current + 1) % CITIES.length;
          goTo(indexRef.current, true);
          setCurrentCity(CITIES[indexRef.current]);
        }, 3000);
      } catch (err) {
        console.error("[GlobeMap] init error:", err);
      }
    };

    init();

    return () => {
      mounted = false;
      clearInterval(intervalId);
      if (containerRef.current) {
        try { containerRef.current.innerHTML = ""; } catch {}
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {/* City label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-sm border border-indigo-500/20 rounded-full px-4 py-1.5 pointer-events-none whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0" />
        <span className="text-xs text-zinc-300 font-medium">{currentCity.name}</span>
      </div>
    </div>
  );
}
